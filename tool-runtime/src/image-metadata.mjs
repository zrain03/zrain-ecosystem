/*
 * Fail / File: tool-runtime/src/image-metadata.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Membaca metadata imej setempat tanpa membuat tuntutan forensik yang tidak dapat dibuktikan.
 * EN: Reads local image metadata without unsupported forensic claims.
 */
// Local-only binary image inspection: never uploads files or guesses absent provenance.
export function detectSignature(bytes){
  const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
  if(b.length>=8 && [137,80,78,71,13,10,26,10].every((x,i)=>b[i]===x))return 'PNG';
  if(b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255)return 'JPEG';
  if(b.length>=6 && String.fromCharCode(...b.slice(0,3))==='GIF')return 'GIF';
  if(b.length>=12&&String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP')return 'WebP';
  if(b.length>=12&&String.fromCharCode(...b.slice(4,8))==='ftyp')return 'ISO BMFF (possibly HEIC/AVIF)';
  if(b.length>=2&&b[0]===66&&b[1]===77)return 'BMP';
  return 'Unknown / unrecognized';
}
// BM: decoded: Menukar atau mengesahkan input tanpa melangkau sempadan data yang selamat. Tujuan modul: membaca metadata imej setempat tanpa membuat tuntutan forensik yang tidak dapat dibuktikan. Input: a.
// EN: decoded: Transforms or validates input without bypassing safe data boundaries. Module purpose: reads local image metadata without unsupported forensic claims. Inputs: a.
const decoded=(a)=>new TextDecoder('utf-8',{fatal:false}).decode(a).replace(/[\x00-\x1f]/g,' ').trim();
export function pngDetails(buffer){
  const a=new Uint8Array(buffer),d=new DataView(buffer),out={};if(detectSignature(a)!=='PNG')return out;
  out['Color model']=({0:'Grayscale',2:'Truecolor RGB',3:'Indexed palette',4:'Grayscale with alpha',6:'Truecolor RGBA'})[a[25]]||`Unknown (${a[25]})`;
  out['Bits per channel']=a[24];out['Transparency-capable']=a[25]===4||a[25]===6?'Yes':'May depend on tRNS';
  let off=8;for(let count=0;off+12<a.length&&count<400;count++){
    const len=d.getUint32(off,false),tag=String.fromCharCode(...a.slice(off+4,off+8)),start=off+8;
    if(len>8_000_000||start+len+4>a.length)break;
    if(tag==='pHYs'&&len>=9){const x=d.getUint32(start,false),y=d.getUint32(start+4,false);if(a[start+8]===1)out['Pixel density']=`${Math.round(x*.0254)} × ${Math.round(y*.0254)} DPI (declared)`;}
    if(tag==='sRGB')out['sRGB chunk']='Present';
    if(tag==='iCCP')out['Embedded ICC profile']='Present';
    if(tag==='eXIf')out['EXIF metadata']='Present';
    if(tag==='tEXt'&&len<15000){const end=a.indexOf(0,start);if(end>start&&end<start+len){const k=decoded(a.slice(start,end)),v=decoded(a.slice(end+1,start+len));if(k&&v)out[`PNG tag: ${k.slice(0,36)}`]=v.slice(0,160);}}
    off=start+len+4;
    if(tag==='IEND')break;
  }
  return out;
}
// BM: jpegExif: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: membaca metadata imej setempat tanpa membuat tuntutan forensik yang tidak dapat dibuktikan. Input: buffer.
// EN: jpegExif: Isolates one operation so it can be reviewed and tested. Module purpose: reads local image metadata without unsupported forensic claims. Inputs: buffer.
export function jpegExif(buffer){
  const a=new Uint8Array(buffer),d=new DataView(buffer),out={};if(detectSignature(a)!=='JPEG')return out;
  let off=2,found=false;
  while(off+4<a.length){if(a[off++]!==255)break;let mark=a[off++];if(mark===216||mark===1)continue;if(mark===217||mark===218)break;if(off+2>a.length)break;const len=d.getUint16(off,false);if(len<2||off+len>a.length)break;
    if(mark===225&&len>=8&&decoded(a.slice(off+2,off+8)).startsWith('Exif')){found=true;const base=off+8,end=off+len;try{
      const little=a[base]===73&&a[base+1]===73;if(!little&&!(a[base]===77&&a[base+1]===77))break;
      // BM: u16: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: membaca metadata imej setempat tanpa membuat tuntutan forensik yang tidak dapat dibuktikan. Input: p.
      // EN: u16: Isolates one operation so it can be reviewed and tested. Module purpose: reads local image metadata without unsupported forensic claims. Inputs: p.
      const u16=(p)=>p+2<=end?d.getUint16(p,little):null;
      const u32=(p)=>p+4<=end?d.getUint32(p,little):null;
      const countSize={1:1,2:1,3:2,4:4,5:8,7:1,9:4,10:8};
      function readValue(pos,type,count){if(!Number.isFinite(count)||count<1||count>8192||!countSize[type])return null;const size=count*countSize[type],vpos=size<=4?pos+8:base+u32(pos+8);if(vpos<base||vpos+size>end)return null;
        if(type===2)return decoded(a.slice(vpos,vpos+size));
        const readN=(p)=>type===3?u16(p):type===4?u32(p):type===9?d.getInt32(p,little):type===1?a[p]:null;
        if([1,3,4,9].includes(type))return count===1?readN(vpos):Array.from({length:Math.min(count,10)},(_,i)=>readN(vpos+i*countSize[type]));
        if(type===5||type===10){const v=Array.from({length:Math.min(count,8)},(_,i)=>{const p=vpos+i*8,n=type===10?d.getInt32(p,little):u32(p),den=type===10?d.getInt32(p+4,little):u32(p+4);return den?n/den:null});return count===1?v[0]:v;}
        return null;
      }
      // BM: ifd: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: membaca metadata imej setempat tanpa membuat tuntutan forensik yang tidak dapat dibuktikan. Input: offset,depth=0.
      // EN: ifd: Isolates one operation so it can be reviewed and tested. Module purpose: reads local image metadata without unsupported forensic claims. Inputs: offset,depth=0.
      function ifd(offset,depth=0){const ans={};if(!offset||depth>1)return ans;const p=base+offset;if(p<base||p+2>end)return ans;const count=u16(p);if(count>350||p+2+count*12>end)return ans;for(let i=0;i<count;i++){const slot=p+2+i*12,tag=u16(slot),type=u16(slot+2),num=u32(slot+4);const val=readValue(slot,type,num);if(val!==null)ans[tag]=val;}return ans;}
      const main=ifd(u32(base+4));const ext=ifd(main[0x8769]);const gps=ifd(main[0x8825]);
      const keys=[[0x010f,'Camera make',main],[0x0110,'Camera model',main],[0x0131,'Software',main],[0x0132,'File timestamp (EXIF)',main],[0x0112,'Orientation',main],[0x9003,'Photo captured (EXIF)',ext],[0x9004,'Digitized (EXIF)',ext],[0x8827,'ISO speed',ext],[0x920a,'Focal length (mm)',ext],[0x829a,'Exposure time (s)',ext],[0x829d,'F-number',ext],[0xa002,'Recorded width',ext],[0xa003,'Recorded height',ext],[0xa434,'Lens model',ext],[0xa420,'Image unique ID',ext]];
      for(const [tag,label,data] of keys)if(data[tag]!==undefined)out[label]=String(data[tag]).slice(0,200);
      if(Object.keys(gps).length)out['Embedded GPS tags']='Present: review before sharing this file';
      function dec(coord,ref){if(!Array.isArray(coord)||coord.length<3||coord.some(v=>!Number.isFinite(v)))return null;const v=coord[0]+coord[1]/60+coord[2]/3600;return +((ref==='S'||ref==='W'?-1:1)*v).toFixed(6);}
      const lat=dec(gps[2],gps[1]),lon=dec(gps[4],gps[3]);if(lat!==null&&lon!==null&&Math.abs(lat)<=90&&Math.abs(lon)<=180)out['Embedded GPS coordinates']=`${lat}, ${lon} (file metadata only, not verified)`;
      }catch{out['EXIF parsing']='Some tags could not be read safely';}break;
    }off+=len;
  }
  if(found&&!Object.keys(out).length)out['EXIF block']='Present, no recognized fields';
  return out;
}
// BM: inspectImageBlob: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: membaca metadata imej setempat tanpa membuat tuntutan forensik yang tidak dapat dibuktikan. Input: file,image.
// EN: inspectImageBlob: Isolates one operation so it can be reviewed and tested. Module purpose: reads local image metadata without unsupported forensic claims. Inputs: file,image.
export async function inspectImageBlob(file,image){
  const ab=await file.arrayBuffer(),data=new Uint8Array(ab),sig=detectSignature(data);const pix=image.naturalWidth*image.naturalHeight;
  const info={'File name':file.name,'File size':`${(file.size/1024).toFixed(1)} KB (${file.size.toLocaleString()} bytes)`,'Browser MIME':file.type||'Not supplied','Signature-derived type':sig,'Dimensions':`${image.naturalWidth} × ${image.naturalHeight} px`,'Megapixels':`${(pix/1e6).toFixed(2)} MP`,'Aspect ratio':(image.naturalWidth/image.naturalHeight).toFixed(4),'Browser file modified':new Date(file.lastModified).toLocaleString(),'Metadata disclaimer':'EXIF timestamps, software and GPS can be changed; none prove who created the image.'};
  if(sig==='JPEG')Object.assign(info,jpegExif(ab));else if(sig==='PNG')Object.assign(info,pngDetails(ab));
  if(sig==='WebP'){const text=new TextDecoder('latin1').decode(data.slice(0,Math.min(data.length,32768)));if(text.includes('EXIF'))info['EXIF chunk']='Detected; detailed WebP EXIF decoding not yet supported';if(text.includes('ICCP'))info['ICC color profile']='Present';if(text.includes('XMP '))info['XMP metadata']='Present';}
  if(globalThis.crypto?.subtle){const hash=await crypto.subtle.digest('SHA-256',ab);info['SHA-256 fingerprint']=Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join('');}
  return info;
}
