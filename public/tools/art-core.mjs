/*
 * Fail / File: tool-runtime/src/art-core.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 source)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengekalkan implementasi fungsi Tools terkini dengan sempadan keselamatan browser.
 * EN: Preserves the latest approved Tools implementation and browser security boundaries.
 */
// Local-only artwork rendering. No uploads, remote API or tracking.
export const ART_SLUGS = Object.freeze([
  'emoji-art','pixel-art','image-to-ascii-art','image-to-binary-art','image-to-block-art'
]);
export function parseEmojis(value){
  const segments = typeof Intl.Segmenter==='function'
    ? [...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(String(value||''))].map(s=>s.segment)
    : Array.from(String(value||''));
  const found=[];
  for(const emoji of segments){
    if(!/\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(emoji))continue;
    if(!found.includes(emoji))found.push(emoji);
    if(found.length===12)break;
  }
  return found;
}
/**
 * BM: Bilangan petak imej seimbang mengikut nisbah asal. Slider Detail benar-benar mengubah kepadatan.
 * EN: Derive a balanced grid from original aspect ratio; Detail visibly changes tile density.
 */
export function artDimensions(w,h,kind,detail){
  if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)throw new Error('Upload a valid image.');
  const d=Math.max(10,Math.min(100,Number(detail)||60));
  let cols;
  if(kind==='pixel-art')cols=Math.round(12+d*.72);
  else if(kind==='emoji-art')cols=Math.round(9+d*.59);
  else cols=Math.round(24+d*.77);
  if(kind==='emoji-art')cols=Math.min(cols,Math.max(4,Math.floor(w/9)));
  const ratio=h/w;
  const heightFactor=kind==='emoji-art'||kind==='pixel-art'?1:.53;
  const rows=Math.max(1,Math.min(220,Math.round(cols*ratio*heightFactor)));
  return {cols,rows};
}
/**
 * BM: Emoji Art dirender pada lebar dan tinggi piksel asal. Tiada potongan atau ubahan nisbah.
 * EN: Emoji Art exports the source pixel dimensions exactly, without cropping or stretching.
 */
export function makeArtwork(image,kind,detail=60,customEmoji='🌸 🌻 💛'){
  if(!ART_SLUGS.includes(kind))throw new Error('Unsupported artwork style.');
  const emojis=kind==='emoji-art'?parseEmojis(customEmoji):[];
  if(kind==='emoji-art'&&!emojis.length)throw new Error('Enter at least one emoji to use in your art.');
  const w=image.naturalWidth,h=image.naturalHeight;
  if(kind==='emoji-art'&&w*h>16000000)throw new Error('This image is too large for an exact-size emoji export on some phones. Resize it below 16 megapixels first.');
  const {cols,rows}=artDimensions(w,h,kind,detail);
  const sample=document.createElement('canvas');sample.width=cols;sample.height=rows;
  const sx=sample.getContext('2d',{willReadFrequently:true});
  sx.imageSmoothingEnabled=true;sx.imageSmoothingQuality='high';
  // BM: Latar putih bagi JPEG/imej lutsinar supaya sampel mempunyai hasil yang konsisten.
  // EN: Composite transparency against white before sampling image colors.
  sx.fillStyle='#fff';sx.fillRect(0,0,cols,rows);
  sx.drawImage(image,0,0,cols,rows);
  const pixels=sx.getImageData(0,0,cols,rows).data;
  const out=document.createElement('canvas'),ctx=out.getContext('2d');
  let outputText='';
  if(kind==='pixel-art'){
    const scale=12;out.width=cols*scale;out.height=rows*scale;
    ctx.imageSmoothingEnabled=false;ctx.drawImage(sample,0,0,out.width,out.height);
  }else if(kind==='emoji-art'){
    // BM: Resolusi output sama dengan imej asal, bukan saiz grid atau preview pada skrin.
    // EN: Use source image resolution rather than an arbitrary enlarged tile-grid size.
    out.width=w;out.height=h;
    const cw=w/cols,ch=h/rows;
    const fontSize=Math.max(1,Math.min(cw,ch)*.92);
    ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
    ctx.textAlign='center';ctx.textBaseline='middle';
    const font=`${fontSize}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
    ctx.font=font;
    // BM: Warna sebenar emoji dipadankan dengan warna gambar untuk pemilihan emoji yang lebih tepat.
    // EN: Match sampled image colors to the user's actual emoji glyph colors.
    const emojiColors=emojis.map(emoji=>{
      const probe=document.createElement('canvas');probe.width=64;probe.height=64;
      const pc=probe.getContext('2d',{willReadFrequently:true});
      pc.font='54px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
      pc.textAlign='center';pc.textBaseline='middle';pc.fillText(emoji,32,32);
      const data=pc.getImageData(0,0,64,64).data;
      let sum=[0,0,0],weight=0;
      for(let i=0;i<data.length;i+=4){const a=data[i+3]/255;sum[0]+=data[i]*a;sum[1]+=data[i+1]*a;sum[2]+=data[i+2]*a;weight+=a}
      return weight?[sum[0]/weight,sum[1]/weight,sum[2]/weight]:[128,128,128];
    });
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const i=(y*cols+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
      const brightness=(.2126*r+.7152*g+.0722*b)/255;
      // BM: Warna lembut di belakang emoji mengekalkan tona imej, kelegapan emoji membina bentuk.
      // EN: A subtle sampled-color tile preserves color; luminance-weighted emoji opacity retains the subject silhouette.
      ctx.fillStyle=`rgba(${r},${g},${b},0.33)`;
      ctx.fillRect(x*cw,y*ch,Math.ceil(cw),Math.ceil(ch));
      let index=0,best=Infinity;
      for(let j=0;j<emojiColors.length;j++){
        const color=emojiColors[j],dist=(r-color[0])**2*.3+(g-color[1])**2*.55+(b-color[2])**2*.15;
        if(dist<best){best=dist;index=j}
      }
      ctx.globalAlpha=brightness>.94?.40:Math.min(1,.62+(1-brightness)*.38);
      ctx.fillText(emojis[index],(x+.5)*cw,(y+.5)*ch,Math.max(1,cw*.98));
    }
    ctx.globalAlpha=1;
  }else{
    const charW=10,lineH=16;
    out.width=cols*charW+24;out.height=rows*lineH+24;
    ctx.fillStyle='#fffaf6';ctx.fillRect(0,0,out.width,out.height);
    ctx.font='14px ui-monospace,Consolas,monospace';ctx.textBaseline='top';
    const ramp=kind==='image-to-block-art'?'█▓▒░ ':kind==='image-to-binary-art'?'01':'@%#*+=-:. ';
    for(let y=0;y<rows;y++){
      let line='';
      for(let x=0;x<cols;x++){
        const i=(y*cols+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
        const brightness=(.2126*r+.7152*g+.0722*b)/255;
        const c=ramp[Math.min(ramp.length-1,Math.floor(brightness*ramp.length))];
        ctx.fillStyle=kind==='image-to-binary-art'&&c==='1'?'#b6533e':'#293941';
        ctx.fillText(c,12+x*charW,10+y*lineH);line+=c;
      }
      outputText+=line+'\n';
    }
  }
  return {canvas:out,text:outputText,columns:cols,rows};
}
// Small self-contained JPEG-in-PDF writer. Only used for art PNG/PDF choices.
// Original dimensions are fitted to one A4 page. PDF is not generated until tapped.
export function artworkPdf(canvas){
  const raw=atob(canvas.toDataURL('image/jpeg',.93).split(',')[1]);
  const jpg=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)jpg[i]=raw.charCodeAt(i);
  const pageW=595,pageH=842,scale=Math.min((pageW-44)/canvas.width,(pageH-44)/canvas.height);
  const w=(canvas.width*scale).toFixed(3),h=(canvas.height*scale).toFixed(3);
  const x=((pageW-w)/2).toFixed(3),y=((pageH-h)/2).toFixed(3);
  const stream=`q ${w} 0 0 ${h} ${x} ${y} cm /Im0 Do Q\n`;
  const encoder=new TextEncoder(),parts=[];let length=0;
  const put=(s)=>{const v=typeof s==='string'?encoder.encode(s):s;parts.push(v);length+=v.length;};
  const offsets=[0];
  const obj=(id,str)=>{offsets[id]=length;put(`${id} 0 obj\n${str}\nendobj\n`)};
  put('%PDF-1.4\n%Zrain\n');
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  obj(2,'<< /Type /Pages /Count 1 /Kids [3 0 R] >>');
  obj(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4]=length;
  put(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);
  put(jpg);put('\nendstream\nendobj\n');
  obj(5,`<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}endstream`);
  const start=length;put('xref\n0 6\n0000000000 65535 f \n');
  for(let i=1;i<=5;i++)put(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);
  put(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`);
  const combined=new Uint8Array(length);let at=0;for(const p of parts){combined.set(p,at);at+=p.length}
  return new Blob([combined],{type:'application/pdf'});
}
