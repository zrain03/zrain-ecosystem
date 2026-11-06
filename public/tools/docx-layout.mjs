/*
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * Fail / File: src/docx-layout.mjs
 * BM: Bina pratonton cetak DOCX daripada Office Open XML setempat dengan warna dan jarak asas.
 * EN: Build a local DOCX print preview from Office Open XML, retaining basic colors and spacing.
 * BM: Pratonton ini bukan enjin Microsoft Word dan tidak menjamin format sama tepat.
 * EN: This preview is not Microsoft Word's layout engine and cannot guarantee exact fidelity.
 */
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const children=(el,name)=>el?[...el.children].filter(e=>e.localName===name):[];
const first=(el,name)=>children(el,name)[0]||null;
const descendants=(el,name)=>el?[...el.getElementsByTagName('*')].filter(e=>e.localName===name):[];
const val=(el,name='val')=>el?.getAttribute('w:'+name)||el?.getAttribute(name)||'';
const within=(n,low,high)=>Number.isFinite(n)&&n>=low&&n<=high;
const cssColor=c=>/^[0-9a-f]{6}$/i.test(c||'')?'#'+c:'';
const safeFont=f=>/^[\p{L}\p{N} ,.'-]{1,80}$/u.test(f||'')?f.replaceAll("'",''):'';
const css=(rules)=>Object.entries(rules).filter(([,v])=>v!==''&&v!==undefined).map(([k,v])=>k+':'+v).join(';');
const parse=(raw)=>{
 const doc=new DOMParser().parseFromString(raw,'application/xml');
 if(doc.querySelector('parsererror'))throw Error('This Word file contains invalid XML.');
 return doc;
};
const twips=(v,max=400)=>{const n=Number(v)/20;return within(n,0,max)?n.toFixed(2)+'pt':''};
const bool=n=>!!n&&val(n)!=='0'&&val(n)!=='false';
const runStyle=el=>{
 if(!el)return {};
 const font=first(el,'rFonts'),shade=first(el,'shd'),size=Number(val(first(el,'sz')))/2;
 const out={};const name=safeFont(font?.getAttribute('w:ascii')||font?.getAttribute('w:hAnsi')||'');
 if(name)out['font-family']="'"+name+"',Arial,sans-serif";
 const color=cssColor(val(first(el,'color')));if(color)out.color=color;
 const bg=cssColor(val(shade,'fill'));if(bg)out['background-color']=bg;
 if(within(size,5,90))out['font-size']=size+'pt';
 if(bool(first(el,'b')))out['font-weight']='700';
 if(bool(first(el,'i')))out['font-style']='italic';
 if(bool(first(el,'u')))out['text-decoration']='underline';
 if(bool(first(el,'strike')))out['text-decoration']='line-through';
 const highlight=val(first(el,'highlight'));if(/^(yellow|green|cyan|magenta|blue|red)$/i.test(highlight))out['background-color']=highlight;
 return out;
};
const paragraphStyle=el=>{
 const out={};if(!el)return out;
 const align=val(first(el,'jc'));if(['left','center','right','both','justify'].includes(align))out['text-align']=align==='both'?'justify':align;
 const spacing=first(el,'spacing');if(spacing){const before=twips(val(spacing,'before')),after=twips(val(spacing,'after'));if(before)out['margin-top']=before;if(after)out['margin-bottom']=after;}
 const ind=first(el,'ind');if(ind){const left=twips(val(ind,'left')),right=twips(val(ind,'right'));if(left)out['margin-left']=left;if(right)out['margin-right']=right;}
 if(first(el,'pageBreakBefore'))out['break-before']='page';return out;
};
function stylesMap(doc){const map=new Map();if(!doc)return map;for(const element of descendants(doc,'style')){
 const id=val(element,'styleId');if(!id)continue;
 map.set(id,{basedOn:val(first(element,'basedOn')),p:paragraphStyle(first(element,'pPr')),r:runStyle(first(element,'rPr'))});
 }return map;}
function effectiveStyle(styles,id,depth=0){if(!id||depth>6)return {p:{},r:{}};const entry=styles.get(id);if(!entry)return {p:{},r:{}};const base=effectiveStyle(styles,entry.basedOn,depth+1);return {p:{...base.p,...entry.p},r:{...base.r,...entry.r}};}
function imgAttrs(node){const el=descendants(node,'extent')[0];const cx=Number(el?.getAttribute('cx')),cy=Number(el?.getAttribute('cy'));const w=within(cx,1,100000000)?Math.round(cx/9525):0,h=within(cy,1,100000000)?Math.round(cy/9525):0;return w?` width="${w}"${h?` height="${h}"`:''}`:'';}

/** BM: Bina HTML hanya daripada nod Word yang diketahui, tanpa menjalankan skrip dokumen.
 * EN: Generate HTML only from known Word nodes, never execute document-supplied scripts. */
export async function buildDocxPrintPreview(arrayBuffer,Zip){
 const zip=await Zip.loadAsync(arrayBuffer);const documentFile=zip.file('word/document.xml');if(!documentFile)throw Error('This DOCX has no word/document.xml.');
 if(documentFile._data?.uncompressedSize>8*1024*1024)throw Error('Word document text exceeds the 8 MB preview limit.');
 const documentXml=parse(await documentFile.async('text'));
 const styleFile=zip.file('word/styles.xml');const styles=stylesMap(styleFile?parse(await styleFile.async('text')):null);
 const relsFile=zip.file('word/_rels/document.xml.rels'),rels=new Map();
 if(relsFile){const doc=parse(await relsFile.async('text'));for(const rel of descendants(doc,'Relationship')){
  const id=rel.getAttribute('Id'),target=rel.getAttribute('Target')||'';
  if(id&&/^media\/[a-z\d_.-]+$/i.test(target))rels.set(id,'word/'+target);
 }}
 const images=new Map();let imageBytes=0;
 for(const [id,path] of rels){const match=path.match(/\.((?:png|jpe?g|gif|webp))$/i),item=zip.file(path);if(!match||!item)continue;
  const bytes=await item.async('uint8array');imageBytes+=bytes.byteLength;if(imageBytes>12*1024*1024)throw Error('Embedded images exceed the 12 MB preview limit.');
  let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
  const ext=match[1].toLowerCase(),mime=ext==='jpg'?'jpeg':ext;images.set(id,'data:image/'+mime+';base64,'+btoa(binary));
 }
 const renderRun=(node,parentStyle={})=>{
  const props=runStyle(first(node,'rPr')),style=css({...parentStyle,...props}),parts=[];
  for(const child of node.children){
   if(child.localName==='t')parts.push(escape(child.textContent));
   else if(child.localName==='tab')parts.push('&emsp;');
   else if(child.localName==='br')parts.push('<br>');
   else if(child.localName==='drawing'||child.localName==='pict'){
    for(const blip of descendants(child,'blip')){
     const id=blip.getAttribute('r:embed')||blip.getAttribute('embed');const src=images.get(id);
     if(src)parts.push('<img alt="Embedded Word image" src="'+src+'"'+imgAttrs(child)+'>');
    }
   }
  }
  return parts.length?'<span'+(style?' style="'+escape(style)+'"':'')+'>'+parts.join('')+'</span>':'';
 };
 const renderParagraph=(node)=>{
  const props=first(node,'pPr'),styleId=val(first(props,'pStyle'))||'Normal',defaults=effectiveStyle(styles,styleId),pStyle=css({...defaults.p,...paragraphStyle(props)}),parts=[];
  for(const el of node.children){
   if(el.localName==='r')parts.push(renderRun(el,defaults.r));
   else if(['hyperlink','sdt','smartTag'].includes(el.localName))for(const run of descendants(el,'r'))parts.push(renderRun(run,defaults.r));
  }
  return '<p'+(pStyle?' style="'+escape(pStyle)+'"':'')+'>'+(parts.join('')||'&nbsp;')+'</p>';
 };
 const renderBlock=(node)=>{
  if(node.localName==='p')return renderParagraph(node);
  if(node.localName!=='tbl')return '';
  const rows=children(node,'tr').map(row=>'<tr>'+children(row,'tc').map(cell=>{
   const tcPr=first(cell,'tcPr'),span=Number(val(first(tcPr,'gridSpan'))),shade=cssColor(val(first(tcPr,'shd'),'fill'));
   const attr=within(span,2,40)?' colspan="'+span+'"':'';
   return '<td'+attr+(shade?' style="background:'+shade+'"':'')+'>'+children(cell,'p').map(renderParagraph).join('')+'</td>';
  }).join('')+'</tr>').join('');return '<table>'+rows+'</table>';
 };
 const body=descendants(documentXml,'body')[0];if(!body)throw Error('This Word file has no document body.');
 const content=[...body.children].map(renderBlock).filter(Boolean).join('\n');
 const section=first(body,'sectPr'),page=first(section,'pgSz'),margin=first(section,'pgMar');
 const width=Number(val(page,'w'))/567,height=Number(val(page,'h'))/567;
 const pageCss=within(width,50,500)&&within(height,50,700)?`@page{size:${width.toFixed(1)}mm ${height.toFixed(1)}mm;margin:16mm}`:'@page{size:A4;margin:16mm}';
 const warning='This preview aims to keep basic Word colors, fonts, spacing, tables and images. Advanced layouts, shapes, headers and pagination may still change. Compare with the original before saving as PDF.';
 return {html:content||'<p>(No readable document content)</p>',pageCss,warning};
}
