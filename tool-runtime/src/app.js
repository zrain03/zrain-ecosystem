/*
 * Fail / File: tool-runtime/src/app.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 source)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengekalkan implementasi fungsi Tools terkini dengan sempadan keselamatan browser.
 * EN: Preserves the latest approved Tools implementation and browser security boundaries.
 */
import {movePdfPage} from './pdf-reorder.mjs';
import {buildDocxPrintPreview} from './docx-layout.mjs';
import {mountVisualPdfCrop,mountVisualPdfWatermark} from './pdf-visual.mjs';
import {cropSelection,watermarkSelection,drawImageWatermark} from './visual-editors.mjs';
import {removeImageBackground} from './ai-background.mjs';
import {mountExtendedTool} from './extended-tools.mjs';
import {mountArtTool} from './art-tools.mjs';
import {mountZrainUI} from './zrain-ui.js';
import {inspectImageBlob} from './image-metadata.mjs';
import {drawQr} from './qr-local.mjs';
import {catalog,groups} from './catalog.mjs';
import {mountDiscovery} from './discovery-ui.mjs';
import {differenceLegend} from './ux-help.mjs';
import {modeExplanations} from './workflow-guide.mjs';
import {fieldPlaceholder} from './form-copy.mjs';
import {clamp,rgbToHex,hexToRgb,rgbToHsl,rgbToCmyk,contrast,lineDiff,diffSummary,safeStem,bytes,xmlEscape} from './core.mjs';
const slug=document.body.dataset.tool, item=catalog.find(a=>a[0]===slug);
const view=document.body.dataset.view||'tool', group=groups.find(g=>g.slug===document.body.dataset.group);
const inTool=view==='tool';
mountZrainUI({product:group?group.title:'Tools',logoSrc:inTool?'../zrain-logo.webp':'./zrain-logo.webp',productHref:inTool?'../index.html':'./index.html'});
const $=(id)=>document.getElementById(id), app=$('app');
const buttons=(primary='Process',secondary='')=>`<div class="actions"><button id="run" class="btn" type="button">${primary}</button>${secondary?`<button id="secondary" class="btn secondary" type="button">${secondary}</button>`:''}</div>`;
const file=(label,id='file',accept='image/*',multiple=false)=>`<div class="field file-field"><span class="field-label" id="${id}-field-label">${label}</span><div class="file-control" data-drop-id="${id}" tabindex="0" aria-label="Drop ${multiple?'files':'a file'} here or choose from your device"><input class="file-native" type="file" id="${id}" aria-labelledby="${id}-field-label" accept="${accept}" ${multiple?'multiple':''}/><label role="button" tabindex="0" class="file-button" for="${id}">↑ Choose ${multiple?'files':'file'}</label><span class="file-selection" id="${id}-filename" aria-live="polite">No ${multiple?'files':'file'} selected</span><span class="drop-hint">or drag &amp; drop${accept.includes('image/')?' · paste image (Ctrl+V)':''}</span></div><div class="upload-preview" id="${id}-upload-preview" hidden aria-live="polite"></div></div>`;
const number=(label,id,value,min,max,step=1)=>`<div class="field"><label for="${id}">${label}</label><input type="number" id="${id}" value="${value}" min="${min}" max="${max}" step="${step}"/></div>`;
const select=(label,id,opts)=>`<div class="field"><label for="${id}">${label}</label><div class="select-control"><select id="${id}">${opts.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div></div>`;
const range=(label,id,value,min,max)=>`<div class="field"><label for="${id}">${label} <output id="${id}Out">${value}</output></label><input type="range" id="${id}" value="${value}" min="${min}" max="${max}"/></div>`;
const input=(label,id,value='',type='text')=>type==='color'?`<div class="field color-field"><label for="${id}">${label}</label><div class="color-control"><input id="${id}" type="color" aria-label="Pick ${label}" value="${value}"/><input id="${id}-hex" type="text" class="hex-input" aria-label="${label} HEX code" spellcheck="false" maxlength="7" value="${value}"/><span class="color-control-hint">Pick color</span></div></div>`:`<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" value="${value}" placeholder="${escapeHtml(fieldPlaceholder(slug,id,label))}"/></div>`;
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const textarea=(label,id,placeholder='')=>`<div class="field"><label for="${id}">${label}</label><textarea id="${id}" placeholder="${escapeHtml(placeholder||fieldPlaceholder(slug,id,label))}"></textarea></div>`;
const result=()=>'<div id="result" class="result" role="status" aria-live="polite"></div>';
const preview=()=>'<div class="preview" id="preview"><p class="muted">Your preview will appear here.</p></div>';
const notice=(s)=>`<p class="box-message">${s}</p>`;
const set=(html)=>{
 app.innerHTML=html;
 // BM: Pengguna terus melihat input. Panduan tiga langkah dan ikon bantuan generik tidak ditambah ke skrin.
 // EN: Show the input first, without generic three-step guides or question-mark buttons.
 document.querySelectorAll('input[type="range"]').forEach(e=>e.addEventListener('input',()=>{const o=$(e.id+'Out');if(o)o.textContent=e.value}));
 // Select menus explain what the current choice actually changes, not just its label.
 app.querySelectorAll('.field select').forEach(el=>{
  const selectFor={'file-converter':'conversion','image-enhancer':'scale'}[slug];
  const messages=selectFor===el.id?modeExplanations[slug]:null;
  if(!messages)return;
  const field=el.closest('.field'),note=document.createElement('p');note.className='mode-explainer';note.id=el.id+'-choice-help';
  const update=()=>{note.textContent=messages[el.value]||'Choose the option that matches the result you need.'};
  field.append(note);
  const ids=[el.getAttribute('aria-describedby'),note.id].filter(Boolean).join(' ');
  el.setAttribute('aria-describedby',ids);el.addEventListener('change',update);update();
 });
 setupUploadFields();
 // BM: Kekalkan hanya penerangan mod yang kritikal untuk mengelakkan salah format output.
 // EN: Keep only meaningful mode explanations already attached above.
 app.querySelectorAll('.color-control input[type="color"]').forEach(el=>{const hex=$(el.id+'-hex');el.addEventListener('input',()=>hex.value=el.value.toUpperCase());hex?.addEventListener('change',()=>{const value=hex.value.trim();if(/^#[a-fA-F0-9]{6}$/.test(value)){el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));}else hex.value=el.value.toUpperCase()})});
};
// Shared Zrain upload experience: keep previews local; never send files to a server.
function setupUploadFields(){
 const inputs=[...app.querySelectorAll('input[type="file"]')];
 const temporaryUrls=new Map();let activeInput=null;
 function clearUrls(input){for(const url of temporaryUrls.get(input)||[])URL.revokeObjectURL(url);temporaryUrls.set(input,[])}
 function rememberUrl(input,url){temporaryUrls.get(input)?.push(url)}
 const imageType=f=>f.type.startsWith('image/')||/\.(png|jpe?g|webp|gif|bmp|avif|svg)$/i.test(f.name);
 function accepted(file,input){const accept=(input.getAttribute('accept')||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean);
  return !accept.length||accept.some(rule=>rule.endsWith('/*')?file.type.startsWith(rule.slice(0,-1)):rule.startsWith('.')?file.name.toLowerCase().endsWith(rule):file.type.toLowerCase()===rule);
 }
 async function update(el){
  const files=Array.from(el.files||[]),out=$(el.id+'-filename'),zone=$(el.id+'-upload-preview');
  if(out)out.textContent=files.length===1?files[0].name:files.length?`${files.length} files selected`:'No file selected';
  if(!zone)return;
  const token=String(Date.now())+Math.random();zone.dataset.token=token;
  clearUrls(el);zone.replaceChildren();zone.hidden=!files.length;if(!files.length)return;
  const title=document.createElement('strong');title.className='upload-preview-title';title.textContent=files.length===1?'Original file':`${files.length} original files`;zone.append(title);
  const grid=document.createElement('div');grid.className='upload-preview-grid';zone.append(grid);
  for(const f of files.slice(0,12)){
   if(zone.dataset.token!==token)return;
   const figure=document.createElement('figure');figure.className='upload-preview-item';const caption=document.createElement('figcaption');
   caption.textContent=`${f.name} · ${bytes(f.size)}`;
   if(imageType(f)){
    const image=document.createElement('img'),url=URL.createObjectURL(f);rememberUrl(el,url);image.alt='Original image preview: '+f.name;image.loading='eager';image.src=url;
    image.addEventListener('load',()=>{const dim=document.createElement('span');dim.textContent=`${image.naturalWidth} × ${image.naturalHeight} pixels`;caption.append(dim)});
    image.addEventListener('error',()=>{image.replaceWith(document.createTextNode('Preview unavailable for this format.'))});figure.append(image);
   }else if((f.type==='application/pdf'||/\.pdf$/i.test(f.name))&&files.length===1){
    const object=document.createElement('object'),url=URL.createObjectURL(f);rememberUrl(el,url);object.data=url;object.type='application/pdf';object.className='upload-pdf';object.setAttribute('aria-label','PDF preview for '+f.name);figure.append(object);
    const fallback=document.createElement('p');fallback.className='short-help';fallback.textContent='If the PDF cannot be displayed here, use the processing button below.';figure.append(fallback);
   }else if(/\.docx$/i.test(f.name)){
    const pre=document.createElement('pre');pre.className='upload-text';pre.textContent='Loading an extract of the Word document…';figure.append(pre);
    try{const JSZip=await zipLib(),z=await JSZip.loadAsync(f),entry=z.file('word/document.xml');
      if(!entry)throw Error('Missing Word XML');const xml=await entry.async('text'),doc=new DOMParser().parseFromString(xml,'application/xml');
      const paragraphs=[...doc.getElementsByTagName('w:p')].slice(0,45).map(p=>[...p.getElementsByTagName('w:t')].map(t=>t.textContent).join('')).filter(x=>x.trim());
      pre.textContent=paragraphs.join('\n').slice(0,2200)||'No text extract available. This document may contain images or special content.';
      const note=document.createElement('p');note.className='short-help';note.textContent='Text-only excerpt. Word formatting, images and page layout are not reproduced in this preview.';figure.append(note);
    }catch{pre.textContent='The Word file was selected, but its text cannot be previewed here. Try the tool below.'}
   }else if(/\.(txt|md|csv|json|log|xml|html)$/i.test(f.name)||f.type.startsWith('text/')){
    const pre=document.createElement('pre');pre.className='upload-text';try{pre.textContent=(await f.slice(0,1800).text())+(f.size>1800?'\n… Preview shortened.':'')}catch{pre.textContent='Text preview unavailable.'}figure.append(pre);
   }else{
    const placeholder=document.createElement('div');placeholder.className='upload-document-icon';placeholder.textContent='📄';figure.append(placeholder);
    const note=document.createElement('p');note.className='short-help';note.textContent='File selected. This format is processed when you run the tool; a full visual preview is not available here.';figure.append(note);
   }
   figure.append(caption);grid.append(figure);
  }
  if(files.length>12){const more=document.createElement('p');more.className='short-help';more.textContent=`Showing the first 12 of ${files.length} files.`;zone.append(more)}
  // Original file preview is the next step. No long directions occupy mobile space.
 }
 function assign(el,files){const good=Array.from(files).filter(f=>accepted(f,el));if(!good.length){toast('This tool does not accept that file type.');return}
  if(good.some(f=>f.size>45*1024*1024)){toast('Each file must be 45 MB or smaller.');return}
  const dt=new DataTransfer();for(const f of (el.multiple?good:good.slice(0,1)))dt.items.add(f);el.files=dt.files;el.dispatchEvent(new Event('change',{bubbles:true}));activeInput=el;
 }
 for(const el of inputs){
  const area=el.closest('.file-control'),btn=area?.querySelector('.file-button');
  el.addEventListener('change',()=>{activeInput=el;update(el).catch(err=>console.error('Local preview failed:',err))});
  btn?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}});
  area?.addEventListener('click',e=>{activeInput=el;if(e.target===area||e.target.classList.contains('drop-hint'))el.click()});
  area?.addEventListener('focusin',()=>activeInput=el);
  area?.addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('Files')){e.preventDefault();area.classList.add('is-dragging')}});
  area?.addEventListener('dragleave',e=>{if(!area.contains(e.relatedTarget))area.classList.remove('is-dragging')});
  area?.addEventListener('drop',e=>{e.preventDefault();area.classList.remove('is-dragging');assign(el,e.dataTransfer?.files||[])});
  area?.addEventListener('keydown',e=>{if(e.target===area&&(e.key==='Enter'||e.key===' ')){e.preventDefault();el.click()}});
 }
 // Text editors must retain ordinary Ctrl+V text behavior.
 document.addEventListener('paste',e=>{
  const target=e.target;
  if(target?.closest?.('textarea,select,[contenteditable],[role="textbox"],input:not([type="file"])'))return;
  const items=Array.from(e.clipboardData?.items||[]),imageItems=items.filter(i=>i.type.startsWith('image/'));
  if(!imageItems.length)return;
  const candidates=inputs.filter(el=>(el.getAttribute('accept')||'').includes('image/'));
  if(!candidates.length)return;
  const focused=target?.closest?.('.file-control')?.querySelector('input[type="file"]');
  const dest=candidates.includes(focused)?focused:(candidates.find(el=>!el.files?.length)|| (candidates.includes(activeInput)?activeInput:candidates[0]));
  const files=imageItems.map((item,i)=>{const b=item.getAsFile();return b?new File([b],`pasted-image-${i+1}.${({'image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','image/png':'png'})[b.type]||'png'}`,{type:b.type}):null}).filter(Boolean);
  if(files.length){e.preventDefault();assign(dest,files);toast('Image pasted. Preview ready below.')}
 });
 window.addEventListener('pagehide',()=>inputs.forEach(clearUrls),{once:true});
}
const text=(s)=>{const el=$('result');if(el){el.replaceChildren();let p=document.createElement('p');p.textContent=s;el.append(p);}};
const info=(stats)=>`<div class="info-grid">${Object.entries(stats).map(([k,v])=>`<div><small>${xmlEscape(k)}</small><strong>${xmlEscape(String(v))}</strong></div>`).join('')}</div>`;
const toast=(s)=>{const el=$('toast');el.textContent=s;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3600)};
const v=(id)=>$(id)?.value; const n=(id)=>Number(v(id));
function error(e){const msg=e?.message||String(e);text('Error: '+msg);toast(msg); console.error(e)}
function onRun(fn){$('run').addEventListener('click',async()=>{const btn=$('run');btn.disabled=true;try{await fn()}catch(e){error(e)}finally{btn.disabled=false}})}
function chosen(id='file'){const f=$(id)?.files?.[0];if(!f)throw new Error('Choose a file first.');if(f.size>45*1024*1024)throw new Error('File too large (45 MB limit).');return f}
async function imgFile(id='file'){const f=chosen(id);if(!f.type.startsWith('image/'))throw new Error('Choose an image file.');const url=URL.createObjectURL(f);try{const image=new Image();image.src=url;await image.decode();if(image.naturalWidth*image.naturalHeight>30000000)throw new Error('Image exceeds 30 megapixels. Resize before using this tool.');return {file:f,image}}finally{URL.revokeObjectURL(url)}}
const canvas=(w,h)=>{if(w<1||h<1||w*h>32000000)throw new Error('Output dimensions must be positive and at most 32 megapixels.');const c=document.createElement('canvas');c.width=Math.round(w);c.height=Math.round(h);return c};
const renderImage=(c)=>{$('preview').replaceChildren(c)};
const blobOf=(c,type='image/png',quality=.88)=>new Promise((ok,fail)=>c.toBlob(b=>b?ok(b):fail(new Error('Your browser cannot encode the selected image format.')),type,quality));
function saveNow(blob,name){
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;a.style.display='none';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),15000);
}
let pendingOutputUrl=null;
function download(blob,name){
  // All legacy processors now prepare the result, never auto-download it.
  const old=document.getElementById('prepared-download');if(old)old.remove();
  if(pendingOutputUrl)URL.revokeObjectURL(pendingOutputUrl);
  pendingOutputUrl=URL.createObjectURL(blob);
  const region=document.createElement('section');region.id='prepared-download';region.className='prepared-download';region.setAttribute('aria-label','Ready to download');
  const heading=document.createElement('strong');heading.textContent='Your result is ready';
  const line=document.createElement('p');line.textContent=`${name} · ${bytes(blob.size)}`;
  region.append(heading,line);
  if(blob.type.startsWith('image/')){
    const img=new Image();img.src=pendingOutputUrl;img.alt='Actual generated image preview';img.className='prepared-preview';region.append(img);
  }else if(blob.type==='application/pdf'){
    const frame=document.createElement('iframe');frame.src=pendingOutputUrl;frame.title='Generated PDF preview';frame.className='prepared-pdf';region.append(frame);
  }
  if(/\.(docx|xlsx)$/i.test(name)){
    const block=document.createElement('div');block.className='office-preview';
    const title=document.createElement('strong');title.textContent='Generated file content preview';
    const info=document.createElement('p');info.className='short-help';info.textContent='Text/data preview of the converted file, not a pixel-perfect rendering of its layout.';
    const excerpt=document.createElement('pre');excerpt.textContent='Reading the exported file…';block.append(title,info,excerpt);region.append(block);
    Promise.resolve().then(async()=>{
      const zip=await zipLib(),z=await zip.loadAsync(blob);
      if(name.endsWith('.docx')){
        const xml=await z.file('word/document.xml')?.async('text');if(!xml)throw Error('The DOCX has no document.xml.');
        const documentXml=new DOMParser().parseFromString(xml,'application/xml');
        const paragraphs=[...documentXml.getElementsByTagName('w:p')].slice(0,80).map(p=>[...p.getElementsByTagName('w:t')].map(t=>t.textContent).join('')).filter(Boolean);
        excerpt.textContent=paragraphs.join('\n').slice(0,7500)||'The converted document contains image-only pages. Download to inspect the full page layout.';
      }else{
        const xml=await z.file('xl/worksheets/sheet1.xml')?.async('text');if(!xml)throw Error('No spreadsheet data.');
        const sheet=new DOMParser().parseFromString(xml,'application/xml');
        const strings=await z.file('xl/sharedStrings.xml')?.async('text');const shared=strings?[...new DOMParser().parseFromString(strings,'application/xml').getElementsByTagName('si')].map(i=>i.textContent):[];
        excerpt.textContent=[...sheet.getElementsByTagName('row')].slice(0,70).map(r=>[...r.getElementsByTagName('c')].map(c=>{const raw=c.getElementsByTagName('v')[0]?.textContent||c.textContent||'';return c.getAttribute('t')==='s'?shared[Number(raw)]||'':raw}).join('  |  ')).join('\n').slice(0,7500)||'Spreadsheet cells could not be previewed.';
      }
    }).catch(e=>{excerpt.textContent='The file was created, but its text preview is unavailable: '+e.message;});
  }
  const btn=document.createElement('button');btn.type='button';btn.className='btn';btn.textContent='Download '+name.split('.').pop().toUpperCase();
  btn.addEventListener('click',()=>saveNow(blob,name));region.append(btn);
  (document.getElementById('app')||document.body).append(region);
  text(`Preview ready: ${name} (${bytes(blob.size)}). Download when you are happy with the result.`);
}
if(typeof window!=='undefined')window.addEventListener('pagehide',()=>{if(pendingOutputUrl)URL.revokeObjectURL(pendingOutputUrl)},{once:true});
const downloadText=(s,name,type='text/plain')=>download(new Blob([s],{type}),name);
function outputCanvas(c,name,type='image/png',quality=.88){return blobOf(c,type,quality).then(b=>{download(b,name);return b})}
function drawFitted(ctx,img,x,y,w,h){const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight),sw=w/scale,sh=h/scale;ctx.drawImage(img,(img.naturalWidth-sw)/2,(img.naturalHeight-sh)/2,sw,sh,x,y,w,h)}
const libs=new Map();async function script(url,global){if(window[global])return window[global];if(libs.has(url))return libs.get(url);const p=new Promise((ok,fail)=>{const s=document.createElement('script');s.src=url;s.onload=()=>window[global]?ok(window[global]):fail(new Error('Library loaded but did not initialize: '+global));s.onerror=()=>fail(new Error('A required processing library could not load. Check your internet connection, then try again.'));document.head.append(s)});libs.set(url,p);p.catch(()=>libs.delete(url));return p}
const pdfLib=()=>script('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js','PDFLib');
const pdfjs=async()=>{const a=await script('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','pdfjsLib');a.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';return a};
const zipLib=()=>script('../jszip.min.js','JSZip');
async function openPdf(f){const lib=await pdfjs();return lib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise}
async function pdfText(f){const pdf=await openPdf(f),parts=[];for(let i=1;i<=pdf.numPages;i++){
  const page=await pdf.getPage(i),data=await page.getTextContent(),rows=new Map();
  for(const item of data.items){if(!item.str?.trim())continue;const y=Math.round((item.transform?.[5]||0)/3)*3;if(!rows.has(y))rows.set(y,[]);rows.get(y).push(item);}
  const lines=[...rows.entries()].sort((a,b)=>b[0]-a[0]).map(([,items])=>{items.sort((a,b)=>(a.transform?.[4]||0)-(b.transform?.[4]||0));let out='',endX=null;for(const item of items){const x=item.transform?.[4]||0;const gap=endX===null?0:x-endX;out+=(out&&(gap>3||(!out.endsWith(' ')&&!item.str.startsWith(' ')))?' ':'')+item.str;endX=x+(item.width||0);}return out.trim()});
  parts.push(lines.join('\n'));
}return parts.join('\n\n--- PDF page break ---\n\n')}
async function renderPdfPage(file,pageNo=1,scale=1.35){const pdf=await openPdf(file);if(pageNo<1||pageNo>pdf.numPages)throw Error('Page out of range');const page=await pdf.getPage(pageNo),vp=page.getViewport({scale});const c=canvas(vp.width,vp.height);await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;return c}
async function readText(f){const ext=f.name.toLowerCase().split('.').pop();if(ext==='pdf')return pdfText(f);if(ext==='docx'){const mammoth=await script('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.9.0/mammoth.browser.min.js','mammoth');return (await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()})).value}if(['txt','md','csv','json','log','xml','html'].includes(ext))return f.text();throw new Error('Unsupported text document: '+ext)}
async function makeDocx(raw){const JSZip=await zipLib(),zip=new JSZip(),pars=raw.split(/\r?\n/).map(p=>`<w:p><w:r><w:t xml:space="preserve">${xmlEscape(p)}</w:t></w:r></w:p>`).join('');zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');zip.folder('_rels').file('.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');zip.folder('word').file('document.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${pars}<w:sectPr/></w:body></w:document>`);return zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})}
async function makeAppearanceDocx(pdfFile){
  const pdf=await openPdf(pdfFile);if(pdf.numPages>12)throw Error('Visual-preservation mode supports up to 12 pages per document to control memory.');
  const JSZip=await zipLib(),zip=new JSZip(),rels=[],parts=[];
  for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){
    const page=await pdf.getPage(pageNo),vp=page.getViewport({scale:1.6}),c=canvas(vp.width,vp.height);await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
    const png=await blobOf(c),rid=`rId${pageNo}`,file=`page${pageNo}.png`;zip.file(`word/media/${file}`,png);
    rels.push(`<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${file}"/>`);
    const limitWidth=7.87,limitHeight=11.25,ratio=Math.min(limitWidth/c.width,limitHeight/c.height),cx=Math.round(c.width*ratio*914400),cy=Math.round(c.height*ratio*914400);
    const pic=`<w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${pageNo}" name="PDF page ${pageNo}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${pageNo}" name="${file}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
    if(pageNo>1)parts.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');parts.push(pic);
  }
  zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.folder('_rels').file('.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId99" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.folder('word/_rels').file('document.xml.rels',`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join('')}</Relationships>`);
  zip.folder('word').file('document.xml',`<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${parts.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="210" w:right="210" w:bottom="210" w:left="210" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:body></w:document>`);
  return zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
async function makeXlsx(textValue){const JSZip=await zipLib(),zip=new JSZip();const rows=textValue.split(/\r?\n/).filter(Boolean).slice(0,5000).map(line=>line.includes('\t')?line.split('\t'):line.includes(',')?line.split(','):line.trim().split(/\s{2,}/));const cols='ABCDEFGHIJKLMNOPQRSTUVWXYZ';const colId=i=>i<26?cols[i]:cols[Math.floor(i/26)-1]+cols[i%26];const sheet=rows.map((row,ri)=>`<row r="${ri+1}">${row.slice(0,60).map((val,ci)=>`<c r="${colId(ci)}${ri+1}" t="inlineStr"><is><t>${xmlEscape(val)}</t></is></c>`).join('')}</row>`).join('');zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');zip.folder('_rels').file('.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');zip.folder('xl').file('workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Extracted Text" sheetId="1" r:id="rId1"/></sheets></workbook>');zip.folder('xl/_rels').file('workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');zip.folder('xl/worksheets').file('sheet1.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheet}</sheetData></worksheet>`);return zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}
function registerImageSimple(){switch(slug){
case 'image-converter':{
set(`<div class="field-grid">${file('Choose an image')}${select('Export format','format',[['image/png','PNG'],['image/jpeg','JPG'],['image/webp','WebP']])}${range('Quality (JPG/WebP)','quality',88,20,100)}${number('Max width (0 = original)','maxwidth',0,0,8192)}</div>${buttons('Convert & preview')}${preview()}${result()}`);
onRun(async()=>{const {file:f,image}=await imgFile();const w=n('maxwidth')>0?Math.min(n('maxwidth'),image.naturalWidth):image.naturalWidth,h=Math.round(image.naturalHeight*w/image.naturalWidth),c=canvas(w,h),ctx=c.getContext('2d');if(v('format')==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h)}ctx.drawImage(image,0,0,w,h);renderImage(c);const type=v('format'),ext=type.split('/')[1].replace('jpeg','jpg');await outputCanvas(c,`${safeStem(f.name)}-converted.${ext}`,type,n('quality')/100)});break;}
case 'image-enhancer':{
set(`<div class="field-grid">${file('Choose a photo')}${select('Output resolution','scale',[['fullhd','Fit within Full HD (1920 × 1080)'],['hd','Fit within HD (1280 × 720)'],['2','2× original pixels'],['4k','Fit within 4K (3840 × 2160)'],['3','3× original pixels'],['1','Original size']])}${range('Edge sharpening','sharp',25,0,80)}${range('Noise smoothing','denoise',8,0,60)}</div>${notice('Quality note: HD/Full HD/4K are resolution targets, not recovered detail. Results depend on original photo quality. This is local resampling and edge sharpening, not generative AI or reconstruction of original detail.')}${buttons('Enhance & download')}${preview()}${result()}`);
onRun(async()=>{const {file:f,image}=await imgFile(),mode=v('scale');let factor=1;if(mode==='1'||mode==='2'||mode==='3')factor=Number(mode);else{const target={hd:[1280,720],fullhd:[1920,1080],'4k':[3840,2160]}[mode];factor=Math.max(1,Math.min(target[0]/image.naturalWidth,target[1]/image.naturalHeight));}const w=Math.max(1,Math.round(image.naturalWidth*factor)),h=Math.max(1,Math.round(image.naturalHeight*factor)),c=canvas(w,h),ctx=c.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,w,h);
 const amount=n('sharp')/100,denoise=n('denoise')/100;
 if((amount>0||denoise>0)&&w*h<=14_000_000){const original=ctx.getImageData(0,0,w,h);const blur=canvas(w,h),bc=blur.getContext('2d',{willReadFrequently:true});bc.filter=`blur(${denoise>0?Math.max(.65,denoise*2.2):.95}px)`;bc.drawImage(c,0,0);bc.filter='none';const softened=bc.getImageData(0,0,w,h);const dest=original.data,base=new Uint8ClampedArray(dest),low=softened.data;const boost=amount*2.5;for(let i=0;i<dest.length;i+=4){const differences=Math.abs(base[i]-low[i])+Math.abs(base[i+1]-low[i+1])+Math.abs(base[i+2]-low[i+2]);const blend=denoise*(differences<42?0.64:0.08);for(let ch=0;ch<3;ch++){const smoothed=base[i+ch]*(1-blend)+low[i+ch]*blend;dest[i+ch]=clamp(smoothed+(smoothed-low[i+ch])*boost,0,255)}}ctx.putImageData(original,0,0)}
 const originalThumb=canvas(Math.min(380,image.naturalWidth),Math.round(Math.min(380,image.naturalWidth)*image.naturalHeight/image.naturalWidth)),ox=originalThumb.getContext('2d');ox.imageSmoothingQuality='high';ox.drawImage(image,0,0,originalThumb.width,originalThumb.height);
 const pane=document.createElement('div');pane.className='enhance-compare';const left=document.createElement('figure');left.append(originalThumb);const leftLabel=document.createElement('figcaption');leftLabel.textContent=`Original · ${image.naturalWidth} × ${image.naturalHeight}`;left.append(leftLabel);const right=document.createElement('figure');const previewCanvas=canvas(Math.min(380,c.width),Math.round(Math.min(380,c.width)*c.height/c.width));previewCanvas.getContext('2d').drawImage(c,0,0,previewCanvas.width,previewCanvas.height);right.append(previewCanvas);const rightLabel=document.createElement('figcaption');rightLabel.textContent=`Processed · ${w} × ${h}`;right.append(rightLabel);pane.append(left,right);$('preview').replaceChildren(pane);
 const name=`${safeStem(f.name)}-enhanced-${w}x${h}.png`,blob=await blobOf(c);download(blob,name);text(`Exported ${w} × ${h} (${bytes(blob.size)}). Sharpening is visible mainly where real edges existed; missing details cannot be reliably recovered.`);
});break;}
case 'image-inspector':{
set(`${file('Choose an image')}${notice('Local forensic-style inspection of file metadata only. EXIF claims can be modified; GPS metadata may reveal private locations. Nothing is uploaded.')}${buttons('Inspect image')}${preview()}${result()}`);onRun(async()=>{
 const {file:f,image}=await imgFile(),c=canvas(image.naturalWidth,image.naturalHeight),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);renderImage(c);
 const metadata=await inspectImageBlob(f,image);const samples=canvas(Math.min(60,image.naturalWidth),Math.min(60,image.naturalHeight)),sx=samples.getContext('2d',{willReadFrequently:true});sx.drawImage(image,0,0,samples.width,samples.height);const pix=sx.getImageData(0,0,samples.width,samples.height).data;let alpha=0,total=0,r=0,g=0,b=0;for(let i=0;i<pix.length;i+=4){if(pix[i+3]<250)alpha++;if(pix[i+3]>10){r+=pix[i];g+=pix[i+1];b+=pix[i+2];total++}}
 metadata['Transparency detected (sampled)']=alpha?'Yes':'No in sampled pixels';metadata['Average sampled color']=total?rgbToHex(Math.round(r/total),Math.round(g/total),Math.round(b/total)):'No opaque pixels';metadata['Analysis location']='This browser only: no upload';
 const el=$('result');el.innerHTML='<h3 class="inspector-title">Image file details & metadata</h3>'+info(metadata)+'<p class="short-help">A hash identifies file bytes for comparison, not the person who made the image. Metadata may be absent, intentionally edited, or stripped by social media and messaging apps.</p>';
 });break;}
case 'watermark':{
 set(`${file('Choose an image')}<div class="field-grid">${input('Watermark text','mark','© Zrain')}${range('Opacity','opacity',45,5,100)}${number('Size (%)','size',6,1,40)}${select('Position preset','position',[['center','Center'],['top-left','Top left'],['bottom-right','Bottom right']])}</div><div class="field"><label>Move or resize directly on your image</label><div class="visual-stage-wrap" id="visual-stage"></div></div>${buttons('Prepare watermarked image')}${preview()}${result()}`);
 let image=null,sourceUrl=null,editor=null;let state={x:.5,y:.5,size:6};
 const opts=()=>({mark:v('mark'),opacity:n('opacity')});
 const syncPreview=()=>{if(!image)return;renderImage(drawImageWatermark(image,state,opts(),canvas));};
 const choosePosition=()=>{if(!editor)return;const pos=v('position');editor.set({...state,x:pos==='center'?.5:pos==='top-left'?.15:.85,y:pos==='center'?.5:pos==='top-left'?.15:.85});};
 $('file').addEventListener('change',async()=>{try{const data=await imgFile();image=data.image;if(sourceUrl)URL.revokeObjectURL(sourceUrl);sourceUrl=URL.createObjectURL(data.file);state={x:.5,y:.5,size:6};$('size').value=6;editor=watermarkSelection($('visual-stage'),sourceUrl,{read:opts,change:next=>{state=next;$('size').value=Math.round(state.size);syncPreview();}});syncPreview();}catch(e){error(e)}});
 for(const id of ['mark','opacity'])$(id).addEventListener('input',()=>{editor?.paint();syncPreview()});
 $('size').addEventListener('input',()=>{if(editor)editor.set({...state,size:n('size')})});$('position').addEventListener('change',choosePosition);
 onRun(async()=>{if(!image)throw Error('Choose an image first.');const c=drawImageWatermark(image,state,opts(),canvas);renderImage(c);await outputCanvas(c,`${safeStem(chosen().name)}-watermarked.png`)});
 break;}
case 'image-cropper':{
 set(`${file('Choose an image')}<div class="field"><label>Drag the crop box or its corners</label><div class="visual-stage-wrap" id="visual-stage"></div></div><details class="precision-details"><summary>Exact crop values (optional)</summary><div class="field-grid">${number('Left (px)','x',0,0,99999)}${number('Top (px)','y',0,0,99999)}${number('Width (px)','w',0,1,99999)}${number('Height (px)','h',0,1,99999)}</div></details>${buttons('Prepare cropped image')}${preview()}${result()}`);
 let image=null,editor=null,sourceUrl=null;
 const paintPreview=()=>{if(!image||!editor)return;const r=editor.get(),x=Math.round(r.x*image.naturalWidth),y=Math.round(r.y*image.naturalHeight),w=Math.max(1,Math.min(image.naturalWidth-x,Math.round(r.w*image.naturalWidth))),h=Math.max(1,Math.min(image.naturalHeight-y,Math.round(r.h*image.naturalHeight)));const c=canvas(w,h);c.getContext('2d').drawImage(image,x,y,w,h,0,0,w,h);renderImage(c);return c;};
 const numbers=rect=>{if(!image)return;$('x').value=Math.round(rect.x*image.naturalWidth);$('y').value=Math.round(rect.y*image.naturalHeight);$('w').value=Math.max(1,Math.round(rect.w*image.naturalWidth));$('h').value=Math.max(1,Math.round(rect.h*image.naturalHeight));paintPreview()};
 $('file').addEventListener('change',async()=>{try{const data=await imgFile();image=data.image;if(sourceUrl)URL.revokeObjectURL(sourceUrl);sourceUrl=URL.createObjectURL(data.file);editor=cropSelection($('visual-stage'),sourceUrl,numbers);numbers(editor.get());}catch(e){error(e)}});
 const update=()=>{if(!image||!editor)return;const W=image.naturalWidth,H=image.naturalHeight,x=clamp(n('x'),0,W-1),y=clamp(n('y'),0,H-1),w=clamp(n('w'),1,W-x),h=clamp(n('h'),1,H-y);editor.set({x:x/W,y:y/H,w:w/W,h:h/H});};
 for(const id of ['x','y','w','h'])$(id).addEventListener('change',update);
 onRun(async()=>{if(!image||!editor)throw Error('Choose an image first.');const c=paintPreview();await outputCanvas(c,`${safeStem(chosen().name)}-cropped.png`)});break;}
case 'background-remover':{
 set(`${file('Choose an image')}<div class="field-grid">${select('New background','background',[['transparent','Transparent'],['white','White'],['black','Black'],['custom','Custom color']])}${input('Background color','bg','#FFFFFF','color')}</div>${buttons('Remove background with AI')}${preview()}${result()}`);
 let cutout=null,image=null;
 const colorBox=$('bg').closest('.field');const updateChoice=()=>{colorBox.hidden=v('background')!=='custom';if(!cutout)return;const resultCanvas=canvas(cutout.width,cutout.height),ctx=resultCanvas.getContext('2d');if(v('background')!=='transparent'){ctx.fillStyle=v('background')==='white'?'#FFFFFF':v('background')==='black'?'#000000':v('bg');ctx.fillRect(0,0,resultCanvas.width,resultCanvas.height)}ctx.drawImage(cutout,0,0);renderImage(resultCanvas);return resultCanvas;};
 $('background').addEventListener('change',updateChoice);$('bg').addEventListener('input',updateChoice);updateChoice();
 onRun(async()=>{const {file:f,image:im}=await imgFile();if(image!==im||!cutout){image=im;cutout=await removeImageBackground(image,{status:text});}const c=updateChoice();if(!c)throw Error('Background output not available.');await outputCanvas(c,`${safeStem(f.name)}-${v('background')}.png`)});
 $('file').addEventListener('change',()=>{cutout=null;image=null});break;}
case 'collage-maker':{
set(`<div class="field-grid">${file('Choose 2–12 images','file','image/*',true)}${select('Columns','cols',[[2,'2 columns'],[3,'3 columns'],[4,'4 columns']])}${number('Tile size (px)','tile',450,100,800)}${range('Spacing (px)','gap',10,0,35)}</div>${buttons('Make collage')}${preview()}${result()}`);onRun(async()=>{const fs=Array.from($('file').files).slice(0,12);if(fs.length<2)throw Error('Choose at least two images.');const images=await Promise.all(fs.map(async f=>{const url=URL.createObjectURL(f);try{const img=new Image();img.src=url;await img.decode();return img}finally{URL.revokeObjectURL(url)}}));const cols=n('cols'),rows=Math.ceil(images.length/cols),tile=n('tile'),gap=n('gap'),c=canvas(cols*tile+(cols+1)*gap,rows*tile+(rows+1)*gap),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);images.forEach((img,i)=>drawFitted(x,img,gap+(i%cols)*(tile+gap),gap+Math.floor(i/cols)*(tile+gap),tile,tile));renderImage(c);await outputCanvas(c,'zrain-collage.png')});break;}
}}
function registerColor(){
  set(`<div class="field-grid">${file('Optional image for pixel picking')}${input('Or select a color','hex','#BD5338','color')}</div>${notice('Tip: click a point on the image preview to inspect that exact pixel.')}${buttons('Inspect color')}${preview()}${result()}`);
  let original=null;
  const show=(rgb)=>{const [r,g,b]=rgb;const hex=rgbToHex(r,g,b);$('hex').value=hex;if($('hex-hex'))$('hex-hex').value=hex;const [h,s,l]=rgbToHsl(r,g,b),[c,m,y,k]=rgbToCmyk(r,g,b),white=contrast(rgb,[255,255,255]),black=contrast(rgb,[0,0,0]);$('result').innerHTML=`<div class="info-grid"><div><small>Selected color</small><strong><span class="color-square" style="background:${hex}"></span> ${hex}</strong></div><div><small>RGB</small><strong>${r}, ${g}, ${b}</strong></div><div><small>HSL</small><strong>${h}°, ${s}%, ${l}%</strong></div><div><small>CMYK (approx.)</small><strong>${c}%, ${m}%, ${y}%, ${k}%</strong></div><div><small>Contrast on white</small><strong>${white.toFixed(2)}:1: ${white>=4.5?'AA regular text':'Below AA regular text'}</strong></div><div><small>Contrast on black</small><strong>${black.toFixed(2)}:1: ${black>=4.5?'AA regular text':'Below AA regular text'}</strong></div></div>`};
  async function load(){if(!$('file').files.length){show(hexToRgb(v('hex')));return}const {image}=await imgFile(),c=canvas(image.naturalWidth,image.naturalHeight);c.getContext('2d',{willReadFrequently:true}).drawImage(image,0,0);original=c;renderImage(c);c.addEventListener('click',e=>{const box=c.getBoundingClientRect(),px=clamp(Math.floor((e.clientX-box.left)/box.width*c.width),0,c.width-1),py=clamp(Math.floor((e.clientY-box.top)/box.height*c.height),0,c.height-1);show(Array.from(c.getContext('2d').getImageData(px,py,1,1).data).slice(0,3))});show(hexToRgb(v('hex')))}
  onRun(load);$('hex').addEventListener('input',()=>{if(!original)show(hexToRgb(v('hex')))});show(hexToRgb(v('hex')));
}
function registerImageCompare(){
  set(`<div class="field-grid">${file('First image','old','image/*')}${file('Second image','new','image/*')}${range('Before/after reveal (%)','reveal',50,0,100)}</div>${buttons('Compare images','Download diff image')}${preview()}<div class="difference-explainer" id="difference-legend"><strong>How to read the difference image</strong><p>${differenceLegend}</p><div class="difference-swatches"><span><i class="diff-swatch changed"></i> Red = different pixels (not necessarily a mistake)</span><span><i class="diff-swatch stable"></i> Light grey = below the detection threshold</span></div><p class="short-help">This is an image comparison, not proof of tampering or an automatic judgment of whether a change is wrong.</p></div><div id="diffpreview" class="preview" style="display:none"></div>${result()}`);
  let diffCanvas=null,first=null,second=null;const draw=()=>{if(!first||!second)return;const size=canvas(first.naturalWidth,first.naturalHeight),x=size.getContext('2d');x.drawImage(first,0,0,size.width,size.height);x.save();x.beginPath();x.rect(0,0,Math.floor(size.width*n('reveal')/100),size.height);x.clip();x.drawImage(second,0,0,size.width,size.height);x.restore();renderImage(size);const p=document.createElement('p');p.className='short-help';p.textContent='Reveal slider: left shows the second (updated) image; right shows the first (original) image. 0% = first image only; 100% = second image only.';$('preview').append(p)};
  $('reveal').addEventListener('input',draw);
  let latestPair=0;
  async function loadPair(){const id=++latestPair;if(!$('old').files.length||!$('new').files.length){first=null;second=null;return}
    try{const [a,b]=await Promise.all([imgFile('old'),imgFile('new')]);if(id!==latestPair)return;first=a.image;second=b.image;draw();}
    catch(e){if(id===latestPair)error(e)}
  }
  $('old').addEventListener('change',loadPair);$('new').addEventListener('change',loadPair);
  onRun(async()=>{const a=await imgFile('old'),b=await imgFile('new');first=a.image;second=b.image;const w=Math.min(1200,first.naturalWidth),h=Math.min(1200,first.naturalHeight),aC=canvas(w,h),bC=canvas(w,h);aC.getContext('2d').drawImage(first,0,0,w,h);bC.getContext('2d').drawImage(second,0,0,w,h);const A=aC.getContext('2d').getImageData(0,0,w,h).data,B=bC.getContext('2d').getImageData(0,0,w,h).data,diff=canvas(w,h),ctx=diff.getContext('2d'),imageData=ctx.createImageData(w,h);let changed=0;for(let i=0;i<A.length;i+=4){const magnitude=Math.max(Math.abs(A[i]-B[i]),Math.abs(A[i+1]-B[i+1]),Math.abs(A[i+2]-B[i+2]));if(magnitude>26)changed++;imageData.data.set([magnitude>26?237:235,magnitude>26?80:235,magnitude>26?60:235,255],i)}ctx.putImageData(imageData,0,0);diffCanvas=diff;const div=$('diffpreview');div.style.display='flex';div.replaceChildren(diff);draw();const percent=(changed/(w*h)*100).toFixed(2);text(`${percent}% of pixels differ above the 26/255 color threshold after both files are resized to ${w} × ${h}. Red means that at least one RGB color channel changed noticeably at that position; pale grey means the color difference stayed below the threshold. Compression, image misalignment or different dimensions can create red areas even without deliberate editing.`)});
  $('secondary').addEventListener('click',async()=>{if(!diffCanvas){toast('Compare two images first.');return}saveNow(await blobOf(diffCanvas),'zrain-image-difference.png')});
}
async function pdfTextToPdf(raw){const {PDFDocument,StandardFonts,rgb}=await pdfLib(),doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica),pageWidth=595,pageHeight=842,lineHeight=15,size=10;let page=doc.addPage([pageWidth,pageHeight]),y=pageHeight-52;const safe=raw.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E\r\n]/g,'?');for(const original of safe.split(/\r?\n/)){let line='';const addLine=()=>{if(y<52){page=doc.addPage([pageWidth,pageHeight]);y=pageHeight-52}page.drawText(line,{x:48,y,font,size,color:rgb(.12,.16,.2)});y-=lineHeight};for(const word of original.split(/\s+/)){if(font.widthOfTextAtSize(line+(line?' ':'')+word,size)>pageWidth-95){addLine();line=word.slice(0,170)}else line+=`${line?' ':''}${word}`;}addLine();}return new Blob([await doc.save()],{type:'application/pdf'})}
function registerFileConverter(){
  set(`<div class="field-grid">${file('Choose a PDF, Word or image file','file','.pdf,.docx,.png,.jpg,.jpeg,.webp')}${select('Conversion mode','conversion',[['pdf-appearance','PDF → Word: keep page appearance (not editable)'],['pdf-docx','PDF → Word: editable text (formatting limited)'],['pdf-xlsx','PDF → Excel: approximate rows (review carefully)'],['docx-print','Word → Printable layout (Save as PDF)'],['docx-pdf','Word → PDF: preserve basic styling (print preview)'],['image-pdf','Image → PDF: preserve image'],['pdf-png','PDF page → PNG image']])}${number('Page number for PNG export','page',1,1,9999)}</div>${notice('Visual PDF → Word preserves the appearance by embedding images of each PDF page; text cannot be edited. For editable text, choose the separate text-extraction mode, which may lose fonts, spacing and columns. Word → PDF uses a local print preview that aims to retain text colors, fonts, tables and basic spacing. Choose Save as PDF after reviewing. Advanced Word layouts may differ.')}${buttons('Convert & preview')}${result()}`);
  const pageField=$('page').closest('.field');const change=()=>pageField.hidden=v('conversion')!=='pdf-png';$('conversion').addEventListener('change',change);change();
  $('file').addEventListener('change',()=>{
    const name=$('file').files?.[0]?.name?.toLowerCase()||'';
    if(name.endsWith('.docx'))$('conversion').value='docx-print';
    else if(/\.(png|jpe?g|webp)$/.test(name))$('conversion').value='image-pdf';
    else if(name.endsWith('.pdf')&&!v('conversion').startsWith('pdf-'))$('conversion').value='pdf-appearance';
    $('conversion').dispatchEvent(new Event('change',{bubbles:true}));
  });
  onRun(async()=>{const f=chosen(),mode=v('conversion'),base=safeStem(f.name);
    if(mode.startsWith('pdf-')){if(!/\.pdf$/i.test(f.name))throw Error('Choose a PDF for the selected conversion.');if(mode==='pdf-png'){const c=await renderPdfPage(f,n('page'),2),blob=await blobOf(c);download(blob,`${base}-page-${n('page')}.png`);text('PDF page rendered and downloaded as PNG.');return}
      if(mode==='pdf-appearance'){const blob=await makeAppearanceDocx(f);download(blob,`${base}-visual.docx`);text('Word document exported with PDF pages embedded as pictures. The original visual layout is retained more closely, but this output is NOT editable text.');return}
      const raw=await pdfText(f);if(!raw.trim())throw Error('No selectable text found. Use OCR for scanned PDFs.');const blob=mode==='pdf-docx'?await makeDocx(raw):await makeXlsx(raw);download(blob,`${base}-${mode==='pdf-docx'?'editable-text.docx':'extracted-rows.xlsx'}`);text(mode==='pdf-docx'?'Editable text exported. The PDF page design, columns and text positions are not preserved.':'Spreadsheet exported from extracted text. This cannot reliably reconstruct arbitrary PDF tables; review cell boundaries before use.');return;}
    if(mode==='docx-print'||mode==='docx-pdf'){
      if(!/\.docx$/i.test(f.name))throw Error('Choose a Word .docx file.');
      // BM: Buka tab sebelum menunggu pembacaan DOCX supaya penghalang popup tidak aktif.
      // EN: Open the preview tab synchronously before asynchronous DOCX parsing.
      const popup=window.open('','_blank');if(!popup)throw Error('Allow the print preview popup from this website, then retry.');
      try{
        const content=await buildDocxPrintPreview(await f.arrayBuffer(),await zipLib());
        const safeTitle=xmlEscape(base)+' - Word print preview';
        const design=`body{font-family:Calibri,Arial,sans-serif;color:#111;background:#fff;max-width:850px;margin:28px auto;padding:0 20px;font-size:11pt;line-height:1.24}main{max-width:100%}p{margin:0 0 8pt;white-space:pre-wrap;overflow-wrap:break-word}table{border-collapse:collapse;width:100%;margin:6pt 0 12pt;table-layout:auto}th,td{border:1px solid #aaa;padding:4pt 7pt;vertical-align:top}td p{margin:0 0 4pt}img{max-width:100%;height:auto;object-fit:contain}main>*{max-width:100%}.print-bar{position:sticky;top:0;z-index:2;background:#fff4eb;border:1px solid #e9c9b8;border-radius:12px;padding:14px;margin-bottom:20px;font:14px Arial,sans-serif;color:#553624}.print-bar p{margin:6px 0 10px}.print-bar button{background:#bd5338;color:white;border:0;border-radius:9px;padding:11px 16px;font-size:14px;cursor:pointer}@media print{.print-bar{display:none}body{margin:0;max-width:none;padding:0} ${content.pageCss}}`;
        popup.document.open();
        popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title><style>${design}</style></head><body><section class="print-bar"><strong>Word → PDF preview</strong><p>${xmlEscape(content.warning)}</p><button onclick="window.print()">Print / Save as PDF</button></section><main>${content.html}</main></body></html>`);
        popup.document.close();
        text('Word preview opened with basic text colors, font sizes, spacing, tables and images. Review it before choosing Print / Save as PDF. Exact Word pagination is not guaranteed.');return;
      }catch(e){popup.close();throw e;}
    }
    if(mode==='image-pdf'){const {image}=await imgFile(),lib=await pdfLib(),doc=await lib.PDFDocument.create(),c=canvas(image.naturalWidth,image.naturalHeight);c.getContext('2d').drawImage(image,0,0);const png=await blobOf(c),embedded=await doc.embedPng(await png.arrayBuffer()),scale=Math.min(1,595/embedded.width,842/embedded.height),w=embedded.width*scale,h=embedded.height*scale;doc.addPage([w,h]).drawImage(embedded,{x:0,y:0,width:w,height:h});download(new Blob([await doc.save()],{type:'application/pdf'}),`${base}.pdf`);text('Image exported as a single-page PDF.');return}
  });
}

function registerPdfEditor(){
  set(`<div class="field-grid">${file('Choose a PDF','file','.pdf')}${number('Preview page','page',1,1,9999)}${input('Text to add','label','Add your text')}${number('Font size (pt)','fontsize',18,6,72)}${input('Text color','color','#BD5338','color')}</div>${notice('Click on the PDF preview to place text. The export adds annotations as page content. It does not alter existing text objects.')}${buttons('Load preview','Save annotated PDF')}${preview()}<div id="annotations" class="result"></div>${result()}`);
  let annotations=[],currentPdf=null,currentPage=1,renderedScale=1.35,renderedCanvas=null;
  async function refresh(){const f=chosen();if(currentPdf!==f){annotations=[];currentPdf=f}currentPage=n('page');renderedCanvas=await renderPdfPage(f,currentPage,renderedScale);renderImage(renderedCanvas);const x=renderedCanvas.getContext('2d');for(const a of annotations.filter(a=>a.page===currentPage)){x.fillStyle=a.color;x.font=`${a.size*renderedScale}px Arial`;x.fillText(a.text,a.x*renderedScale,a.y*renderedScale)}renderedCanvas.addEventListener('click',e=>{const box=renderedCanvas.getBoundingClientRect(),x=(e.clientX-box.left)/box.width*renderedCanvas.width/renderedScale,y=(e.clientY-box.top)/box.height*renderedCanvas.height/renderedScale;const txt=v('label');if(!txt.trim())return toast('Enter text to add.');annotations.push({page:currentPage,x,y,text:txt,size:n('fontsize'),color:v('color')});refresh().catch(error)});$('annotations').textContent=`${annotations.length} text placement(s) added. Click another spot to add more.`;text(`Previewing page ${currentPage}.`)}
  onRun(refresh);
  $('secondary').addEventListener('click',async()=>{try{if(!annotations.length)throw Error('Add at least one text label by clicking the loaded PDF page before saving.');const f=chosen(),lib=await pdfLib(),doc=await lib.PDFDocument.load(await f.arrayBuffer()),font=await doc.embedFont(lib.StandardFonts.Helvetica);for(const a of annotations){const p=doc.getPage(a.page-1);if(!p)continue;const [r,g,b]=hexToRgb(a.color);const [width,height]=p.getSize();p.drawText(a.text.replace(/[^\x20-\x7e]/g,'?'),{x:a.x,y:height-a.y,size:a.size,font,color:lib.rgb(r/255,g/255,b/255),maxWidth:Math.max(1,width-a.x)})}saveNow(new Blob([await doc.save()],{type:'application/pdf'}),`${safeStem(f.name)}-annotated.pdf`);text(`Saved ${annotations.length} text addition(s).`)}catch(e){error(e)}});
}
function registerPdfWatermark(){mountVisualPdfWatermark({set,file,input,number,range,select,buttons,result,preview,onRun,chosen,pdfLib,renderPdfPage,download,text,$,v,n});}
function registerPdfOrganizer(){
 set(`${file('Choose PDF files','file','.pdf',true)}${buttons('Load and preview PDF pages','Prepare arranged PDF')}<div class="pdf-thumb-grid" id="pagelist" aria-label="PDF pages with previews"></div>${result()}`);
 let pages=[],docs=[];const list=$('pagelist');
 const move=(from,to)=>{
  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=pages.length||to>=pages.length||from===to)return;
  movePdfPage(pages,from,to);render();
 };
 const swap=(a,b)=>move(a,b);
 // BM: Cari halaman sasaran di bawah jari walaupun pengguna sedang menyeret melalui senarai yang panjang.
 // EN: Locate the target page beneath the pointer, including while scrolling a long page list.
 const targetAt=(x,y)=>{
  const card=document.elementFromPoint(x,y)?.closest('.pdf-thumb-card');
  return card&&list.contains(card)?Number(card.dataset.index):null;
 };
 let touchDrag=null,scrollFrame=0;
 const highlight=(target)=>{for(const card of list.children)card.classList.toggle('is-drop-target',Number(card.dataset.index)===target)};
 function stopTouchDrag(commit){
  if(!touchDrag)return;
  const {from,target}=touchDrag;touchDrag=null;cancelAnimationFrame(scrollFrame);scrollFrame=0;highlight(null);
  if(commit&&Number.isInteger(target))move(from,target);
 }
 function autoScroll(){
  if(!touchDrag)return;
  const y=touchDrag.y,viewport=window.innerHeight||document.documentElement.clientHeight;
  if(y<78)window.scrollBy(0,-Math.min(25,(78-y)*.6));
  else if(y>viewport-78)window.scrollBy(0,Math.min(25,(y-(viewport-78))*.6));
  const target=targetAt(touchDrag.x,y);
  if(Number.isInteger(target)){touchDrag.target=target;highlight(target)}
  scrollFrame=requestAnimationFrame(autoScroll);
 }
 const render=()=>{stopTouchDrag(false);list.replaceChildren();for(const [i,p] of pages.entries()){
   const card=document.createElement('article');card.className='pdf-thumb-card';card.draggable=true;card.dataset.index=String(i);
   const img=document.createElement('img');img.src=p.thumbnail;img.alt=`Content preview for page ${p.index+1} of ${p.name}`;img.loading='lazy';img.draggable=false;if(p.rotation)img.style.transform=`rotate(${p.rotation}deg)`;
   const label=document.createElement('div');label.className='pdf-thumb-label';label.textContent=`${i+1}. ${p.name} · page ${p.index+1}`;card.append(img,label);
   const handle=document.createElement('button');handle.type='button';handle.className='pdf-drag-handle';handle.textContent='⠿ Drag to reorder';handle.setAttribute('aria-label','Drag page '+(i+1)+' to another position');handle.title='Drag and scroll to any page';card.append(handle);
   handle.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;e.preventDefault();touchDrag={from:i,target:i,x:e.clientX,y:e.clientY};handle.setPointerCapture?.(e.pointerId);if(!scrollFrame)scrollFrame=requestAnimationFrame(autoScroll)});
   handle.addEventListener('pointermove',e=>{if(!touchDrag||touchDrag.from!==i)return;touchDrag.x=e.clientX;touchDrag.y=e.clientY;const target=targetAt(e.clientX,e.clientY);if(Number.isInteger(target)){touchDrag.target=target;highlight(target)}});
   handle.addEventListener('pointerup',()=>{if(touchDrag?.from===i)stopTouchDrag(true)});
   for(const kind of ['pointercancel','lostpointercapture'])handle.addEventListener(kind,()=>{if(touchDrag?.from===i)stopTouchDrag(false)});
   const actions=document.createElement('div');actions.className='pdf-thumb-actions';
   for(const [name,fn] of [['←',()=>swap(i,i-1)],['→',()=>swap(i,i+1)],['↻',()=>{p.rotation=(p.rotation+90)%360;render()}],['×',()=>{
     if(pages.length<=1){text('At least one PDF page must remain.');return;}
     if(!window.confirm('Remove page '+(i+1)+' from the output PDF? The original file will not be changed.'))return;
     pages.splice(i,1);render();
   }]]){const btn=document.createElement('button');btn.type='button';btn.className='btn secondary';btn.textContent=name;btn.title=name==='×'?'Remove page':name==='↻'?'Rotate page':name==='←'?'Move earlier':'Move later';btn.addEventListener('click',fn);actions.append(btn)}card.append(actions);
   const moveRow=document.createElement('div');moveRow.className='pdf-jump-row';const jump=document.createElement('input');jump.type='number';jump.min='1';jump.max=String(pages.length);jump.value=String(i+1);jump.setAttribute('aria-label','Move page '+(i+1)+' to position');const jumpBtn=document.createElement('button');jumpBtn.type='button';jumpBtn.className='btn secondary';jumpBtn.textContent='Move to';jumpBtn.addEventListener('click',()=>{const destination=Number(jump.value);if(!Number.isInteger(destination)||destination<1||destination>pages.length){text('Choose a page position between 1 and '+pages.length+'.');return}move(i,destination-1)});moveRow.append(jumpBtn,jump);card.append(moveRow);
   card.addEventListener('dragstart',e=>{e.dataTransfer?.setData('text/plain',String(i));if(e.dataTransfer)e.dataTransfer.effectAllowed='move'});
   card.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';highlight(i);const y=e.clientY;if(y<78)window.scrollBy(0,-20);else if(y>window.innerHeight-78)window.scrollBy(0,20)});
   card.addEventListener('dragleave',e=>{if(!card.contains(e.relatedTarget))card.classList.remove('is-drop-target')});
   card.addEventListener('drop',e=>{e.preventDefault();const a=Number(e.dataTransfer?.getData('text/plain'));highlight(null);move(a,i)});
   card.addEventListener('dragend',()=>highlight(null));
   list.append(card);
  }};
 onRun(async()=>{const files=[...$('file').files];if(!files.length||files.length>12)throw Error('Choose 1 to 12 PDF files.');const lib=await pdfLib();pages=[];docs=[];
  for(const f of files){if(!/\.pdf$/i.test(f.name))throw Error('Choose PDF files only.');const pdf=await lib.PDFDocument.load(await f.arrayBuffer()),renderer=await openPdf(f);docs.push(pdf);if(pages.length+pdf.getPageCount()>70)throw Error('Preview up to 70 pages in one batch.');for(let i=0;i<pdf.getPageCount();i++){
    const page=await renderer.getPage(i+1),vp=page.getViewport({scale:.4}),c=canvas(vp.width,vp.height);await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
    pages.push({doc:docs.length-1,index:i,rotation:0,name:f.name,thumbnail:c.toDataURL('image/png')});}
  }render();text(`${pages.length} pages shown. Drag to any position (auto-scrolls), or use Move to for a distant page.`);
 });
 $('secondary').addEventListener('click',async()=>{try{if(!pages.length)throw Error('Load PDF pages first.');const lib=await pdfLib(),out=await lib.PDFDocument.create();for(const entry of pages){const [page]=await out.copyPages(docs[entry.doc],[entry.index]);if(entry.rotation)page.setRotation(lib.degrees((page.getRotation().angle+entry.rotation)%360));out.addPage(page)}download(new Blob([await out.save()],{type:'application/pdf'}),'zrain-organized.pdf');text(`${pages.length} pages arranged. Preview the PDF before downloading.`);}catch(e){error(e)}});
}
function registerOcr(){
  set(`<div class="field-grid">${file('Choose an image')}${select('Recognition language','lang',[['eng','English'],['msa','Bahasa Melayu']])}</div>${notice('OCR runs in the browser using Tesseract.js. The first run downloads a recognition model. It may take time and recognition can contain mistakes.')}${buttons('Extract text')}<div class="field" style="margin-top:16px"><label for="ocrout">Recognized text (editable)</label><textarea id="ocrout" class="bigoutput" rows="11"></textarea></div><div class="actions"><button class="btn secondary" type="button" id="copy">Copy text</button><button class="btn secondary" type="button" id="ocr-download">Download TXT</button></div>${result()}`);
  onRun(async()=>{const f=chosen();if(!f.type.startsWith('image/'))throw Error('Choose a supported image file.');const Tesseract=await script('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js','Tesseract'),worker=await Tesseract.createWorker(v('lang'));try{const {data}=await worker.recognize(f);$('ocrout').value=data.text;text(`Recognized ${data.text.length} characters. Review the output for errors.`)}finally{await worker.terminate()}});
  $('copy').addEventListener('click',async()=>{if(!v('ocrout'))return toast('Extract text first.');try{await navigator.clipboard.writeText(v('ocrout'));toast('Text copied.')}catch{const field=$('ocrout');field.select();document.execCommand('copy');toast('Text selected for copying.')}});
  $('ocr-download').addEventListener('click',()=>v('ocrout')?downloadText(v('ocrout'),'zrain-extracted-text.txt'):toast('Extract text first.'));
}
function registerJson(){
  set(`<div class="field-grid">${textarea('Paste your JSON','source','{"example":true}')}${select('Action','action',[['pretty','Prettify (2 spaces)'],['minify','Minify']])}</div>${buttons('Validate & format','Download JSON')}<div class="field" style="margin-top:17px"><label for="jsonout">Result</label><textarea id="jsonout" rows="12" class="bigoutput" readonly></textarea></div>${result()}`);
  onRun(()=>{let parsed;try{parsed=JSON.parse(v('source'))}catch(e){throw new Error(`Invalid JSON: ${e.message}`)}$('jsonout').value=v('action')==='pretty'?JSON.stringify(parsed,null,2):JSON.stringify(parsed);text('JSON is valid. Result is ready.')});
  $('secondary').addEventListener('click',()=>{if(!v('jsonout')){toast('Format some JSON first.');return}saveNow(new Blob([v('jsonout')],{type:'application/json'}),'zrain-formatted.json')});
}
function csvRows(source){const rows=[];let row=[],field='',quote=false;source=source.replace(/^\uFEFF/,'');for(let i=0;i<source.length;i++){const ch=source[i];if(quote){if(ch==='"'&&source[i+1]==='"'){field+='"';i++}else if(ch==='"')quote=false;else field+=ch;}else if(ch==='"'){quote=true}else if(ch===','){row.push(field);field=''}else if(ch==='\r'||ch==='\n'){if(ch==='\r'&&source[i+1]==='\n')i++;row.push(field);rows.push(row);field='';row=[];}else field+=ch}if(quote)throw Error('CSV has an unmatched quote.');if(field||row.length){row.push(field);rows.push(row)}return rows}
function csvSerialize(rows){const field=s=>{s=String(s??'');return /[",\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s};return rows.map(row=>row.map(field).join(',')).join('\r\n')+'\r\n'}
function registerCsv(){
  set(`<div class="field-grid">${file('Upload CSV','file','.csv,text/csv')}${select('Whitespace handling','trim',[['yes','Trim outer spaces'],['no','Preserve spaces']])}${select('Duplicate handling','dedupe',[['yes','Remove duplicate rows'],['no','Keep all rows']])}</div>${notice('First row is treated as the column header and always preserved. No AI guesses or automatic value corrections.')}${buttons('Clean CSV','Download cleaned CSV')}${result()}`);
  let output='';onRun(async()=>{const f=chosen(),rows=csvRows(await f.text());if(!rows.length)throw Error('CSV file is empty.');const trim=v('trim')==='yes',dedupe=v('dedupe')==='yes',seen=new Set();let dup=0;const clean=[rows[0].map(x=>trim?x.trim():x)];for(const row of rows.slice(1)){const r=row.map(x=>trim?x.trim():x),key=JSON.stringify(r);if(dedupe&&seen.has(key)){dup++;continue}seen.add(key);clean.push(r)}output=csvSerialize(clean);text(`Processed ${rows.length-1} data row(s). Removed ${dup} duplicate row(s). Output: ${clean.length-1} row(s).`)});
  $('secondary').addEventListener('click',()=>output?saveNow(new Blob([output],{type:'text/csv;charset=utf-8'}),'zrain-cleaned.csv'):toast('Process the CSV first.'));
}
function registerInvoice(){
  set(`<div class="field-grid">${input('Your business / name','seller','Your Business')}${input('Client / recipient','buyer','Client Name')}${input('Invoice number','inv','INV-001')}${input('Currency label','currency','MYR')}${textarea('Items: one per line as description | quantity | unit price','items','Design service | 2 | 150\nHosting | 1 | 30')}${number('Tax (%)','tax',0,0,100,.01)}</div>${notice('A straightforward PDF invoice; it does not store customers or process payments. Review dates, totals and tax compliance yourself.')}${buttons('Generate PDF invoice')}${result()}`);
  onRun(async()=>{const lines=v('items').split(/\r?\n/).filter(x=>x.trim()),items=[];for(const line of lines){const parts=line.split('|').map(x=>x.trim());if(parts.length!==3)throw Error('Each item must follow: description | quantity | price');const [name,qty,price]=parts;const q=Number(qty),p=Number(price);if(!name||!Number.isFinite(q)||!Number.isFinite(p)||q<=0||p<0)throw Error('Invalid item quantity or price.');items.push({name,qty:q,price:p,total:q*p})}if(!items.length)throw Error('Add at least one item.');if(items.length>20)throw Error('Use 20 items or fewer per invoice.');const sum=items.reduce((a,b)=>a+b.total,0),tax=sum*n('tax')/100,total=sum+tax;if(!Number.isFinite(total)||total>1e12)throw Error('Total is too large.');const lib=await pdfLib(),pdf=await lib.PDFDocument.create(),page=pdf.addPage([595,842]),font=await pdf.embedFont(lib.StandardFonts.Helvetica),bold=await pdf.embedFont(lib.StandardFonts.HelveticaBold);const safe=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'?').slice(0,70);const label=(txt,x,y,size=11,b=false)=>page.drawText(safe(txt),{x,y,size,font:b?bold:font,color:lib.rgb(.14,.19,.24),maxWidth:Math.max(20,550-x)});label('INVOICE',43,778,30,true);label(v('inv'),43,750,11);label('From: '+v('seller'),43,712,12,true);label('To: '+v('buyer'),43,684,12);label('Date: '+new Date().toLocaleDateString('en-CA'),43,662,10);page.drawLine({start:{x:43,y:638},end:{x:550,y:638},color:lib.rgb(.73,.31,.21),thickness:1.5});label('ITEM / DESCRIPTION',43,616,10,true);label('QTY',345,616,10,true);label('PRICE',403,616,10,true);label('TOTAL',490,616,10,true);let y=585;for(const item of items){label(item.name.slice(0,42),43,y);label(item.qty,345,y);label(item.price.toFixed(2),403,y);label(item.total.toFixed(2),490,y);y-=20}y-=24;page.drawLine({start:{x:340,y:y+12},end:{x:550,y:y+12},color:lib.rgb(.84,.8,.78)});label('Subtotal',345,y);label(sum.toFixed(2),490,y);label('Tax ('+n('tax')+'%)',345,y-22);label(tax.toFixed(2),490,y-22);label('Grand total ('+v('currency')+')',325,y-52,12,true);label(total.toFixed(2),490,y-52,12,true);download(new Blob([await pdf.save()],{type:'application/pdf'}),`${safeStem(v('inv'))}-invoice.pdf`);text(`Generated invoice for ${v('currency')} ${total.toFixed(2)} (subtotal ${sum.toFixed(2)} + tax ${tax.toFixed(2)}).`)});
}
function markdownSafe(raw){const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');const inline=s=>escape(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>');let code=false;return raw.replaceAll('\r\n','\n').split('\n').map(line=>{if(line.trim().startsWith('```')){code=!code;return code?'<pre>':'</pre>'}if(code)return escape(line)+'\n';const h=line.match(/^(#{1,4})\s+(.+)$/);if(h)return `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;if(/^\s*[-*]\s+/.test(line))return '<p>• '+inline(line.replace(/^\s*[-*]\s+/,''))+'</p>';return line.trim()?`<p>${inline(line)}</p>`:'<div style="height:9px"></div>'}).join('')+(code?'</pre>':'')}
function registerMarkdown(){
  set(`<div class="field-grid">${textarea('Write your Markdown','source','# Zrain Notes\n\n**Made for people.** Built with purpose.\n\n- Build useful tools\n- Test your changes')}<div class="field"><label>Live preview</label><div id="mdpreview" style="min-height:185px;max-height:390px;overflow:auto;background:#fdf8f5;border:1px solid #e8dad0;border-radius:12px;padding:15px;font-size:13px;line-height:1.6"></div></div></div>${buttons('Download Markdown')}${result()}`);
  $('source').value='# Zrain Notes\n\n**Made for people.** Built with purpose.\n\n- Build useful tools\n- Test your changes';const refresh=()=>$('mdpreview').innerHTML=markdownSafe(v('source'));$('source').addEventListener('input',refresh);refresh();onRun(()=>{downloadText(v('source'),'zrain-notes.md','text/markdown');text('Markdown result prepared. Download when ready.')});
}
function registerQR(){
  set(`<div class="field-grid">${textarea('Text or URL','qrtext','https://zrain.web.app')}${number('QR image size (px)','size',360,160,800)}${input('QR color','foreground','#121E2A','color')}${input('Background color','background','#FFFFFF','color')}</div>${notice('The QR code is generated on your device without an external library or uploading text. Leave strong contrast for reliable scanning.')}${buttons('Generate QR','Download PNG')}${preview()}${result()}`);
  $('qrtext').value='https://zrain.web.app';let qrCanvas=null;
  onRun(async()=>{const content=v('qrtext').trim();if(!content)throw Error('Enter text or a URL.');if(new TextEncoder().encode(content).length>900)throw Error('QR content too long (900 UTF-8 bytes maximum).');if(contrast(hexToRgb(v('foreground')),hexToRgb(v('background')))<4.5)throw Error('QR and background colors need more contrast to scan.');
    const size=n('size');if(size<160||size>800)throw Error('QR size must be 160–800 px.');qrCanvas=drawQr(content,size,v('foreground'),v('background'));$('preview').replaceChildren(qrCanvas);text('QR generated locally with a four-module quiet zone. Test scanning it before sharing.')});
  $('secondary').addEventListener('click',async()=>{if(!qrCanvas)return toast('Generate your QR first.');saveNow(await blobOf(qrCanvas),'zrain-qr.png')});
}

function registerTextTools(){
  set(`<div class="field-grid">${textarea('Input text','source','Paste or type your text here')}${select('Operation','operation',[['upper','UPPERCASE'],['lower','lowercase'],['title','Title Case'],['trim','Trim whitespace and empty lines'],['unique','Remove duplicate lines'],['sort','Sort lines A–Z'],['reverse','Reverse line order'],['count','Count words and characters']])}</div>${buttons('Process text','Download result')}<div class="field" style="margin-top:16px"><label for="textout">Output</label><textarea id="textout" rows="9" class="bigoutput"></textarea></div>${result()}`);
  onRun(()=>{const raw=v('source');let out;switch(v('operation')){case 'upper':out=raw.toUpperCase();break;case 'lower':out=raw.toLowerCase();break;case 'title':out=raw.toLowerCase().replace(/\b\p{L}/gu,c=>c.toUpperCase());break;case 'trim':out=raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).join('\n');break;case 'unique':out=[...new Set(raw.split(/\r?\n/))].join('\n');break;case 'sort':out=raw.split(/\r?\n/).sort((a,b)=>a.localeCompare(b)).join('\n');break;case 'reverse':out=raw.split(/\r?\n/).reverse().join('\n');break;default:out=`Words: ${(raw.trim().match(/\S+/g)||[]).length}\nCharacters: ${[...raw].length}\nLines: ${raw.split(/\r?\n/).length}`} $('textout').value=out;text('Text processed.')});
  $('secondary').addEventListener('click',()=>saveNow(new Blob([v('textout')],{type:'text/plain;charset=utf-8'}),'zrain-processed-text.txt'));
}
function randomIndex(max){if(max<=0)throw Error('Empty character set.');const limit=Math.floor(0x100000000/max)*max;const a=new Uint32Array(1);do{crypto.getRandomValues(a)}while(a[0]>=limit);return a[0]%max}
function registerPassword(){
  set(`<div class="field-grid">${number('Password length','length',20,8,80)}<div class="field"><span>Allowed characters</span><div class="checkrow"><input type="checkbox" id="upper" checked/><label for="upper">Uppercase letters</label></div><div class="checkrow"><input type="checkbox" id="lower" checked/><label for="lower">Lowercase letters</label></div><div class="checkrow"><input type="checkbox" id="numbers" checked/><label for="numbers">Numbers</label></div><div class="checkrow"><input type="checkbox" id="symbols" checked/><label for="symbols">Symbols</label></div></div></div>${buttons('Generate password','Copy password')}<div class="field" style="margin-top:14px"><label for="password">Generated password</label><input id="password" type="text" autocomplete="off" readonly/></div>${result()}`);
  onRun(()=>{const sets=[['upper','ABCDEFGHIJKLMNOPQRSTUVWXYZ'],['lower','abcdefghijklmnopqrstuvwxyz'],['numbers','0123456789'],['symbols','!@#$%&*()-_=+?']].filter(([id])=>$(id).checked).map(x=>x[1]);if(!sets.length)throw Error('Select at least one character type.');if(n('length')<sets.length)throw Error('Length is too short for chosen sets.');const chars=sets.map(s=>s[randomIndex(s.length)]),all=sets.join('');while(chars.length<n('length'))chars.push(all[randomIndex(all.length)]);for(let i=chars.length-1;i>0;i--){const j=randomIndex(i+1);[chars[i],chars[j]]=[chars[j],chars[i]]}$('password').value=chars.join('');text('Cryptographically random password generated locally. Nothing is stored or sent.')});
  $('secondary').addEventListener('click',async()=>{if(!v('password'))return toast('Generate a password first.');try{await navigator.clipboard.writeText(v('password'));toast('Password copied to clipboard.')}catch{const el=$('password');el.select();document.execCommand('copy');toast('Password selected for copying.')}});
}
function registerUtm(){
  set(`<div class="field-grid">${input('Destination URL','url','https://example.com')}${input('Campaign source (utm_source)','source','newsletter')}${input('Campaign medium (utm_medium)','medium','email')}${input('Campaign name (utm_campaign)','campaign','launch')}${input('Campaign term (optional)','term','')}${input('Campaign content (optional)','content','')}</div>${buttons('Build URL','Copy URL')}<div class="field" style="margin-top:17px"><label for="utmout">Tracking URL</label><textarea id="utmout" rows="4" class="bigoutput" readonly></textarea></div>${result()}`);
  onRun(()=>{let url;try{url=new URL(v('url'))}catch{throw Error('Enter a valid URL including https://')}if(!['http:','https:'].includes(url.protocol))throw Error('Only HTTP(S) URLs are supported.');for(const field of ['source','medium','campaign','term','content']){const name='utm_'+field,content=v(field).trim();if(content)url.searchParams.set(name,content);else url.searchParams.delete(name)}if(!v('source').trim()||!v('medium').trim()||!v('campaign').trim())throw Error('Source, medium and campaign name are required.');$('utmout').value=url.toString();text('UTM tracking URL built. Review destination before sharing.')});
  $('secondary').addEventListener('click',async()=>{if(!v('utmout'))return toast('Build a URL first.');try{await navigator.clipboard.writeText(v('utmout'));toast('URL copied.')}catch{const el=$('utmout');el.select();document.execCommand('copy')}});
}

function makeTile(row,href,mark='✦'){
  const [id,title,description]=row;
  const a=document.createElement('a');a.className='tool-card';a.href=href;
  const tile=document.createElement('div');tile.className='mark';tile.textContent=mark;
  const name=document.createElement('h3');name.textContent=title;
  const p=document.createElement('p');p.textContent=description;
  const small=document.createElement('small');small.textContent='Open tool →';
  a.append(tile,name,p,small);return a;
}
function workspace(){
  const grid=$('group-grid');
  for(const g of groups){
    const count=g.sections.flatMap(section=>section.tools).length;
    const card=makeTile([g.slug,'Zrain '+g.title,g.description],`./${g.slug}/index.html`,g.symbol);
    card.classList.add('group-card');
    const countTag=document.createElement('span');countTag.className='tool-count';countTag.textContent=`${count} tools in one workspace`;
    card.insertBefore(countTag,card.lastChild);
    grid.append(card);
  }
}
function groupDirectory(){
  if(!group)return;
  const anchor=$('section-nav'),container=$('group-sections');
  for(const [i,section] of group.sections.entries()){
    const id=`section-${i+1}`;
    const jump=document.createElement('a');jump.href=`#${id}`;jump.textContent=section.title;anchor.append(jump);
    const sec=document.createElement('section');sec.className='category-section';sec.id=id;
    const heading=document.createElement('div');heading.className='category-section-heading';
    const copy=document.createElement('div');const h=document.createElement('h3');h.textContent=section.title;
    const description=document.createElement('p');description.textContent=section.description;
    copy.append(h,description);
    const count=document.createElement('span');count.className='section-count';count.textContent=`${section.tools.length} tools`;
    heading.append(copy,count);
    const grid=document.createElement('div');grid.className='tool-grid';
    for(const slug of section.tools){
      const row=catalog.find(item=>item[0]===slug);
      grid.append(makeTile(row,`./${slug}/index.html`,String(catalog.findIndex(item=>item[0]===slug)+1).padStart(2,'0')));
    }
    sec.append(heading,grid);container.append(sec);
  }
}
if(view==='workspace')workspace();
else if(view==='group')groupDirectory();
else {
  const switcher=$('tool-switcher');
  if(switcher)switcher.addEventListener('change',()=>{window.location.href=`../${encodeURIComponent(switcher.value)}/index.html`;});
  if(slug==='color-inspector')registerColor();else if(slug==='image-compare')registerImageCompare();else if(slug==='file-converter')registerFileConverter();else if(slug==='pdf-editor')registerPdfEditor();else if(slug==='pdf-watermark')registerPdfWatermark();else if(slug==='pdf-organizer')registerPdfOrganizer();else if(slug==='text-extractor')registerOcr();else if(slug==='json-studio')registerJson();else if(slug==='csv-cleaner')registerCsv();else if(slug==='invoice-generator')registerInvoice();else if(slug==='markdown-editor')registerMarkdown();else if(slug==='qr-generator')registerQR();else if(slug==='text-tools')registerTextTools();else if(slug==='password-generator')registerPassword();else if(slug==='utm-builder')registerUtm();else if(mountArtTool(slug,{set,file,range,input,buttons,preview,result,onRun,imgFile,renderImage,text,saveNow,$})){}else if(!mountExtendedTool(slug,{set,file,number,select,input,textarea,buttons,preview,result,onRun,chosen,v,n,text,download,downloadText,pdfLib,openPdf,renderPdfPage,zipLib,canvas,imgFile,blobOf,renderImage,safeStem,bytes,$}))registerImageSimple();
}

// Search, quick starts and favourites remain separate from processing engines.
mountDiscovery({view,groupSlug:group?.slug||'',slug});
