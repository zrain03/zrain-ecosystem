/*
 * Fail / File: tool-runtime/src/art-tools.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 source)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengekalkan implementasi fungsi Tools terkini dengan sempadan keselamatan browser.
 * EN: Preserves the latest approved Tools implementation and browser security boundaries.
 */
import {ART_SLUGS,makeArtwork,artworkPdf} from './art-core.mjs';

/** Five accessible mobile-first art pages, retaining original-image preview. */
export function mountArtTool(slug,h){
  if(!ART_SLUGS.includes(slug))return false;
  const {set,file,range,input,buttons,preview,result,onRun,imgFile,renderImage,text,saveNow,$}=h;
  const emoji=slug==='emoji-art';
  const outputLabel=slug==='pixel-art'?'pixel art':emoji?'emoji art':'character art';
  set(`<div class="field-grid">${file('Choose an image')}${emoji?input('Emojis to use','emojis','🌸 🌻 💛'):''}${range('Detail','detail',60,10,100)}</div>`+
      `${buttons('Refresh preview')}`+
      `<section class="generated-output" aria-label="Artwork result"><h3>Art preview</h3>${preview()}`+
      `<div id="art-downloads" class="actions" aria-live="polite"></div></section>${result()}`);
  const exportArea=$('art-downloads');
  let last=null,serial=0,busy=false,pending=false;
  async function generate(){
    if(!($('file')?.files?.length))return;
    if(busy){pending=true;return}
    busy=true;const attempt=++serial;
    try{
      const {image}=await imgFile();
      const art=makeArtwork(image,slug,$('detail').value,$('emojis')?.value);
      if(attempt!==serial)return;
      last=art;renderImage(art.canvas);exportArea.replaceChildren();
      const kinds=['PNG','PDF',...(slug==='emoji-art'||slug==='pixel-art'?[]:['TXT'])];
      for(const kind of kinds){
        const button=document.createElement('button');button.type='button';button.className='btn'+(kind==='PNG'?'':' secondary');button.textContent='Download '+kind;
        button.addEventListener('click',async()=>{
          if(!last)return;
          const name=slug+'-'+Date.now();
          if(kind==='PNG')last.canvas.toBlob(b=>b?saveNow(b,name+'.png'):text('Could not export PNG. Please try again.'),'image/png');
          if(kind==='PDF')saveNow(artworkPdf(last.canvas),name+'.pdf');
          if(kind==='TXT')saveNow(new Blob([last.text],{type:'text/plain;charset=utf-8'}),name+'.txt');
        });
        exportArea.append(button);
      }
      text(`Preview ready: ${art.columns} × ${art.rows} ${outputLabel}. Change Detail${emoji?' or Emojis':''} to update.`);
    }catch(e){last=null;exportArea.replaceChildren();text('Error: '+(e?.message||String(e)))}
    finally{busy=false;if(pending){pending=false;void generate();}}
  }
  onRun(generate);
  let timeout;
  const schedule=()=>{exportArea.replaceChildren();last=null;clearTimeout(timeout);timeout=setTimeout(()=>{void generate()},180)};
  $('file').addEventListener('change',schedule);
  $('detail').addEventListener('input',schedule);
  if(emoji)$('emojis').addEventListener('input',schedule);
  return true;
}
