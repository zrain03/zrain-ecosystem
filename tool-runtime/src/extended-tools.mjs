/*
 * Fail / File: tool-runtime/src/extended-tools.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 source)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengekalkan implementasi fungsi Tools terkini dengan sempadan keselamatan browser.
 * EN: Preserves the latest approved Tools implementation and browser security boundaries.
 */
import {mountVisualPdfCrop} from './pdf-visual.mjs';
import {base64Encode,base64Decode,decodeJwt,textStatistics,hashText,createUuids,cssShadow,pdfPageSelection,targetDimensions} from './extended-core.mjs';

/**
 * Phase-one additional real tools. Each slug has an actual processing callback.
 * No blank or "coming soon" pages are registered in the catalogue.
 * Heavy PDF engines are loaded only by the PDF actions that need them.
 */
export const EXTRA_TOOL_SLUGS = Object.freeze([
  'base64-tool','jwt-decoder','text-counter','hash-generator','uuid-generator','css-shadow-generator',
  'image-resizer','image-rotator','image-compressor',
  'merge-pdf','split-pdf','rotate-pdf','crop-pdf','remove-pdf-pages',
  'pdf-to-text','pdf-to-image','jpg-to-pdf','pdf-page-numbers',
  'teleprompter'
]);

export function mountExtendedTool(slug, h) {
  if(!EXTRA_TOOL_SLUGS.includes(slug))return false;
  const {set,file,number,select,input,textarea,buttons,preview,result,onRun,chosen,v,n,text,download,downloadText,
    pdfLib,openPdf,renderPdfPage,zipLib,canvas,imgFile,blobOf,renderImage,safeStem,bytes,$} = h;
  const action = (label='Process') => buttons(label)+result();
  const savePdf = async (document,name) => {
    const output = await document.save();
    const blob = new Blob([output],{type:'application/pdf'});
    download(blob,name);
    text('Prepared '+name+' ('+bytes(blob.size)+').');
  };
  const requirePdf = () => {
    const f=chosen();
    if(!/\.pdf$/i.test(f.name))throw new Error('Choose a PDF file first.');
    return f;
  };
  const cleanName=f=>safeStem(f.name);

  if(slug==='base64-tool'){
    set(textarea('Input text','source','Enter text to encode, or Base64 to decode…')+
      select('Operation','mode',[['encode','Encode UTF-8 to Base64'],['decode','Decode Base64 to UTF-8']])+
      select('Alphabet','alphabet',[['standard','Standard'],['url','URL-safe (no padding)']])+action('Convert text')+
      textarea('Result','output'));
    onRun(()=>{const out=v('mode')==='encode'?base64Encode(v('source'),v('alphabet')==='url'):base64Decode(v('source'));$('output').value=out;text('Converted '+[...out].length+' characters.');});
  }
  else if(slug==='jwt-decoder'){
    set(textarea('JWT token','source','Paste a JWT token here; this page never sends it to Zrain…')+action('Decode token')+notice('Decoding a JWT does not verify its signature or prove it is trusted.')+
      textarea('Decoded header and payload','output'));
    onRun(()=>{const d=decodeJwt(v('source'));const out=JSON.stringify({header:d.header,payload:d.payload},null,2);$('output').value=out;text('Decoded locally. Signature NOT verified. Never treat this as authentication.');});
  }
  else if(slug==='text-counter'){
    set(textarea('Enter or paste text','source','Start typing or paste your text…')+
      '<div class="counter-grid" id="counter-grid" aria-live="polite"></div>'+result());
    const update=()=>{const stats=textStatistics(v('source'));
      $('counter-grid').innerHTML=Object.entries(stats).map(([key,value])=>
        '<div class="counter-stat"><strong>'+value+'</strong><span>'+key.replace(/([A-Z])/g,' $1').toLowerCase()+'</span></div>'
      ).join('');
      text(stats.words+' words · '+stats.characters+' characters.');
    };
    $('source').addEventListener('input',update);update();
  }
  else if(slug==='hash-generator'){
    set(textarea('Input text','source','Paste text for a cryptographic checksum…')+
      select('Algorithm','algo',[['SHA-256','SHA-256'],['SHA-384','SHA-384'],['SHA-512','SHA-512']])+action('Calculate hash')+textarea('Hash (hexadecimal)','output'));
    onRun(async()=>{const out=await hashText(v('source'),v('algo'));$('output').value=out;text('Calculated '+v('algo')+' locally. A hash is not encryption.');});
  }
  else if(slug==='uuid-generator'){
    set(select('UUID version','version',[['4','v4 · Random'],['7','v7 · Time sortable']])+number('How many','amount',5,1,500)+
      action('Generate UUIDs')+textarea('Generated UUIDs','output'));
    onRun(()=>{const ids=createUuids(n('amount'),v('version'));$('output').value=ids.join('\n');text('Generated '+ids.length+' UUIDs with secure browser randomness.');});
  }
  else if(slug==='css-shadow-generator'){
    set(number('X offset (px)','x',0,-100,100)+number('Y offset (px)','y',8,-100,100)+number('Blur (px)','blur',24,0,150)+
      number('Spread (px)','spread',-6,-100,100)+number('Opacity (%)','opacity',18,0,100)+input('Color','color','#131316','color')+
      select('Shadow type','inset',[['no','Outer shadow'],['yes','Inset shadow']])+action('Generate CSS')+
      '<div class="preview"><div id="shadow-swatch" style="width:160px;min-height:110px;margin:30px auto;background:white;border-radius:18px;border:1px solid #ead6ce"></div></div>'+textarea('CSS declaration','output'));
    const update=()=>{const value=cssShadow({x:n('x'),y:n('y'),blur:n('blur'),spread:n('spread'),opacity:n('opacity'),color:v('color'),inset:v('inset')==='yes'});$('shadow-swatch').style.boxShadow=value;$('output').value='box-shadow: '+value+';';text('Copy CSS into your stylesheet.');};
    for(const id of ['x','y','blur','spread','opacity','color','inset'])$(id).addEventListener('input',()=>{try{update()}catch{}});
    onRun(update);try{update()}catch{/* Controls are populated by the browser; isolated test doubles may omit values. */}
  }
  else if(['image-resizer','image-rotator','image-compressor'].includes(slug)){
    const controls=slug==='image-resizer'?select('Size preset','preset',[['custom','Custom size'],['profile','Profile picture (512 × 512)'],['icons','App icon sizes (ZIP)']])+number('Maximum width (px)','width',1280,1,8000)+number('Maximum height (px)','height',1280,1,8000):
      slug==='image-rotator'?select('Action','angle',[['90','Rotate 90° clockwise'],['180','Rotate 180°'],['270','Rotate 90° counter-clockwise'],['flip-h','Flip horizontally'],['flip-v','Flip vertically']]):
      select('Compression','quality',[['balanced','Balanced'],['small','Smaller file'],['strong','Strong']])+select('Output','format',[['auto','Automatic (recommended)'],['image/webp','WebP'],['image/jpeg','JPG'],['image/png','PNG (lossless)']]);
    set(file('Choose an image','file','image/*')+controls+action(slug==='image-resizer'?'Preview resized image':slug==='image-rotator'?'Preview rotated image':'Preview compressed image')+preview());
    onRun(async()=>{
      const {file:f,image}=await imgFile();
      const w=image.naturalWidth,h=image.naturalHeight;
      let c,format='image/png',extension='png';
      if(slug==='image-resizer'){
        const preset=v('preset');
        if(preset==='icons'){
          const JSZip=await zipLib(),zip=new JSZip(),sizes=[16,32,48,64,128,192,256,512];
          for(const size of sizes){
            const square=canvas(size,size),sx=square.getContext('2d');
            const ratio=Math.min(size/w,size/h),dw=w*ratio,dh=h*ratio;
            sx.drawImage(image,(size-dw)/2,(size-dh)/2,dw,dh);
            zip.file('icon-'+size+'.png',await blobOf(square));
            if(size===192)renderImage(square);
          }
          const archive=await zip.generateAsync({type:'blob'});
          download(archive,cleanName(f)+'-app-icons.zip');
          text('Eight transparent PNG icon sizes are prepared in a ZIP. Download when ready.');
          return;
        }
        if(preset==='profile'){
          c=canvas(512,512);const ratio=Math.min(512/w,512/h),dw=w*ratio,dh=h*ratio;
          c.getContext('2d').drawImage(image,(512-dw)/2,(512-dh)/2,dw,dh);
        }else{
          const size=targetDimensions(w,h,n('width'),n('height'),true);
          c=canvas(size.width,size.height);c.getContext('2d').drawImage(image,0,0,size.width,size.height);
        }
      }else if(slug==='image-rotator'){
        const angle=v('angle');c=canvas(['90','270'].includes(angle)?h:w,['90','270'].includes(angle)?w:h);
        const ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);
        if(angle.startsWith('flip'))ctx.scale(angle==='flip-h'?-1:1,angle==='flip-v'?-1:1);
        else ctx.rotate(Number(angle)*Math.PI/180);
        ctx.drawImage(image,-w/2,-h/2);
      }else{
        // BM: Compression menjamin fail disimpan hanya jika ia benar-benar lebih kecil.
        // EN: The compressor offers a download only when its output really is smaller.
        const mode=v('quality'),preferred=v('format'),alpha=(()=>{const test=canvas(2,2),ctx=test.getContext('2d');ctx.drawImage(image,0,0,2,2);return [...ctx.getImageData(0,0,2,2).data].some((z,i)=>i%4===3&&z<255)||/png|webp/.test(f.type);})();
        const formats=preferred==='auto'?(alpha?['image/webp','image/png']:['image/webp','image/jpeg']):[preferred];
        const qualitySteps=mode==='strong'?[.62,.5,.4,.3]:mode==='small'?[.77,.66,.55,.45]:[.88,.82,.72,.6];
        const reductions=mode==='strong'?[1,.85,.72,.6]:mode==='small'?[1,.9,.8]:[1,.92,.84];
        let best=null;
        const goal=f.size*(mode==='strong'?.55:mode==='small'?.72:.88);
        outer:for(const ratio of reductions){
          const width=Math.max(1,Math.round(w*ratio)),height=Math.max(1,Math.round(h*ratio)),candidate=canvas(width,height),ctx=candidate.getContext('2d');ctx.imageSmoothingQuality='high';
          for(const mime of formats){
            ctx.clearRect(0,0,width,height);if(mime==='image/jpeg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height)}ctx.drawImage(image,0,0,width,height);
            for(const q of mime==='image/png'?[1]:qualitySteps){const blob=await blobOf(candidate,mime,q);if(blob.type!==mime)continue;
              if(blob.size<f.size&&(!best||blob.size<best.blob.size))best={blob,canvas:candidate,mime};
              if(blob.size<=goal){best={blob,canvas:candidate,mime};break outer;}
            }
          }
        }
        if(!best){text('This image is already efficiently compressed. No larger replacement was created. Try an image with more detail.');return;}
        c=best.canvas;format=best.mime;extension=format==='image/jpeg'?'jpg':format==='image/webp'?'webp':'png';renderImage(c);
        download(best.blob,cleanName(f)+'-compressed.'+extension);
        text('Reduced from '+bytes(f.size)+' to '+bytes(best.blob.size)+' ('+Math.round((1-best.blob.size/f.size)*100)+'% smaller). Output '+c.width+' × '+c.height+'.');return;
      }
      renderImage(c);
      const blob=await blobOf(c,format,.9);
      download(blob,cleanName(f)+'-'+(slug==='image-resizer'?'resized':'transformed')+'.'+extension);
      text('Prepared '+c.width+' × '+c.height+' '+extension.toUpperCase()+'.');
    });
  }
  else if(slug==='merge-pdf'){
    set(file('Choose 2–12 PDF files','file','application/pdf,.pdf',true)+action('Merge into one PDF'));
    onRun(async()=>{const files=[...$('file').files];if(files.length<2||files.length>12)throw Error('Choose between 2 and 12 PDFs.');
      const {PDFDocument}=await pdfLib(),out=await PDFDocument.create();let pages=0;
      for(const f of files){if(!/\.pdf$/i.test(f.name))throw Error('PDF files only.');const doc=await PDFDocument.load(await f.arrayBuffer());const copied=await out.copyPages(doc,doc.getPageIndices());for(const p of copied)out.addPage(p);pages+=copied.length;}
      await savePdf(out,'zrain-merged.pdf');text('Merged '+files.length+' documents / '+pages+' pages without rasterizing.');});
  }
  else if(['split-pdf','remove-pdf-pages'].includes(slug)){
    set(file('Choose a PDF','file','application/pdf,.pdf')+
      input('Pages','pages',slug==='split-pdf'?'':'1')+
      (slug==='split-pdf'?select('Output type','splitmode',[['zip','Separate PDF pages (ZIP)'],['pdf','Selected pages (one PDF)']]):'')+
      action(slug==='split-pdf'?'Preview split result':'Remove pages from PDF'));
    onRun(async()=>{const f=requirePdf();const {PDFDocument}=await pdfLib(),doc=await PDFDocument.load(await f.arrayBuffer()),ids=pdfPageSelection(v('pages'),doc.getPageCount(),slug==='split-pdf');
      if(!ids.length)throw Error('Select at least one page.');
      if(slug==='remove-pdf-pages'){
        const remove=new Set(ids),keep=doc.getPageIndices().filter(i=>!remove.has(i));if(!keep.length)throw Error('At least one page must remain.');
        const out=await PDFDocument.create();for(const p of await out.copyPages(doc,keep))out.addPage(p);await savePdf(out,cleanName(f)+'-pages-removed.pdf');
      }else if(v('splitmode')==='pdf'){
        const out=await PDFDocument.create();for(const p of await out.copyPages(doc,ids))out.addPage(p);
        await savePdf(out,cleanName(f)+'-selected-pages.pdf');
      }else{
        if(ids.length>200)throw Error('Split supports up to 200 pages per run.');const JSZip=await zipLib(),zip=new JSZip();
        for(const [pos,i] of ids.entries()){const out=await PDFDocument.create();out.addPage((await out.copyPages(doc,[i]))[0]);zip.file('page-'+String(pos+1).padStart(3,'0')+'-original-'+(i+1)+'.pdf',await out.save());}
        const blob=await zip.generateAsync({type:'blob'});download(blob,cleanName(f)+'-split.zip');text('Prepared '+ids.length+' separate PDF pages in a ZIP.');
      }});
  }
  else if(slug==='rotate-pdf'){
    set(file('Choose a PDF','file','application/pdf,.pdf')+
      select('Angle','angle',[['90','90° clockwise'],['180','180°'],['270','90° counter-clockwise']])+input('Pages','pages','')+
      action('Rotate PDF pages'));
    onRun(async()=>{const f=requirePdf(),lib=await pdfLib(),doc=await lib.PDFDocument.load(await f.arrayBuffer());const ids=pdfPageSelection(v('pages'),doc.getPageCount());
      for(const i of ids){const p=doc.getPage(i);p.setRotation(lib.degrees((p.getRotation().angle+n('angle'))%360));}
      await savePdf(doc,cleanName(f)+'-rotated.pdf');text('Rotated '+ids.length+' page(s) without re-encoding content.');});
  }
  else if(slug==='crop-pdf'){mountVisualPdfCrop({...h});}
  else if(slug==='pdf-page-numbers'){
    set(file('Choose a PDF','file','application/pdf,.pdf')+
      select('Position','position',[['bottom-right','Bottom right'],['bottom-center','Bottom center'],['bottom-left','Bottom left'],['top-right','Top right']])+number('Start numbering at','start',1,1,10000)+
      select('First page','cover',[['include','Include first page'],['skip','Skip cover page']])+action('Add page numbers'));
    onRun(async()=>{const f=requirePdf(),lib=await pdfLib(),doc=await lib.PDFDocument.load(await f.arrayBuffer()),font=await doc.embedFont(lib.StandardFonts.Helvetica);const pages=doc.getPages();
      for(let i=0;i<pages.length;i++){if(i===0&&v('cover')==='skip')continue;const page=pages[i];const size=page.getSize();const label=String(n('start')+i-(v('cover')==='skip'?1:0));
        const width=font.widthOfTextAtSize(label,10),position=v('position'),right=position.endsWith('right'),left=position.endsWith('left');
        page.drawText(label,{x:right?size.width-40-width:left?32:(size.width-width)/2,y:position.startsWith('top')?size.height-34:30,size:10,font,color:lib.rgb(.2,.25,.3)});
      }await savePdf(doc,cleanName(f)+'-numbered.pdf');});
  }
  else if(slug==='pdf-to-text'){
    set(file('Choose text-based PDF','file','application/pdf,.pdf')+action('Extract and download text')+textarea('Extracted text','output'));
    onRun(async()=>{const f=requirePdf(),doc=await openPdf(f);let out='';for(let i=1;i<=doc.numPages;i++){
      const data=await(await doc.getPage(i)).getTextContent();out+='--- PAGE '+i+' ---\n'+data.items.map(x=>x.str||'').join(' ')+'\n\n';}
      $('output').value=out;downloadText(out,cleanName(f)+'.txt');text('Text extracted from '+doc.numPages+' page(s). Scans without a text layer require OCR.');});
  }
  else if(slug==='pdf-to-image'){
    set(file('Choose a PDF','file','application/pdf,.pdf')+select('Image quality','scale',[['1.5','Normal'],['2','High quality'],['3','Extra sharp']])+action('Show PDF pages')+ '<div class="pdf-thumb-grid" id="image-pages"></div>');
    let prepared=[];
    async function drawPages(){const f=requirePdf(),doc=await openPdf(f);if(doc.numPages>40)throw Error('Preview up to 40 PDF pages.');const region=$('image-pages');region.replaceChildren();prepared=[];
      for(let i=1;i<=doc.numPages;i++){const pg=await doc.getPage(i),small=pg.getViewport({scale:.45}),thumb=canvas(small.width,small.height);await pg.render({canvasContext:thumb.getContext('2d'),viewport:small}).promise;
       const article=document.createElement('article');article.className='pdf-thumb-card';const image=document.createElement('img');image.src=thumb.toDataURL('image/png');image.alt='Preview of PDF page '+i;
       const title=document.createElement('div');title.className='pdf-thumb-label';title.textContent='Page '+i;const btn=document.createElement('button');btn.className='btn secondary';btn.textContent='Download PNG';btn.type='button';
       btn.addEventListener('click',async()=>{btn.disabled=true;try{const page=await doc.getPage(i),vp=page.getViewport({scale:Number(v('scale'))}),full=canvas(vp.width,vp.height);await page.render({canvasContext:full.getContext('2d'),viewport:vp}).promise;download(await blobOf(full,'image/png'),cleanName(f)+'-page-'+i+'.png');text('PNG prepared for page '+i+'.')}catch(e){text('Error: '+e.message)}finally{btn.disabled=false}});
       article.append(image,title,btn);region.append(article);prepared.push(i);
      }
      text('Showing '+prepared.length+' PDF pages. Choose a page to download as PNG.');
    }
    $('file').addEventListener('change',()=>{if($('file').files.length)drawPages().catch(e=>text('Error: '+e.message))});
    onRun(async()=>{const f=requirePdf(),doc=await openPdf(f);if(!prepared.length)await drawPages();const zip=await zipLib(),archive=new zip();
      for(let i=1;i<=doc.numPages;i++){const pg=await doc.getPage(i),vp=pg.getViewport({scale:Number(v('scale'))}),c=canvas(vp.width,vp.height);await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;archive.file('page-'+i+'.png',await blobOf(c,'image/png'));}
      download(await archive.generateAsync({type:'blob'}),cleanName(f)+'-pages-png.zip');text('All '+doc.numPages+' pages prepared as PNG files in ZIP.');});
  }
  else if(slug==='jpg-to-pdf'){
    set(file('Choose JPG or PNG images','file','image/jpeg,image/png',true)+
      select('Page size','page',[['fit','Fit each image'],['a4','A4 portrait']])+action('Create PDF from pictures'));
    onRun(async()=>{const files=[...$('file').files];if(!files.length||files.length>30)throw Error('Choose 1 to 30 images.');const lib=await pdfLib(),doc=await lib.PDFDocument.create();
      for(const f of files){if(!/^image\/(jpeg|png)$/.test(f.type))throw Error('JPG and PNG only.');const image=await createImageBitmap(f,{imageOrientation:'from-image'});if(image.width*image.height>32000000){image.close();throw Error('Image too large.');}
        const c=canvas(image.width,image.height);c.getContext('2d').drawImage(image,0,0);image.close();const png=await blobOf(c,'image/png');const embed=await doc.embedPng(await png.arrayBuffer());
        const w=v('page')==='fit'?embed.width:595.28,h=v('page')==='fit'?embed.height:841.89,page=doc.addPage([w,h]),scale=Math.min(w/embed.width,h/embed.height);page.drawImage(embed,{x:(w-embed.width*scale)/2,y:(h-embed.height*scale)/2,width:embed.width*scale,height:embed.height*scale});}
      await savePdf(doc,'zrain-images.pdf');});
  }
  else if(slug==='teleprompter'){
    set(textarea('Speech script','source','Paste your script. Use short paragraphs for readability.')+
      number('Reading speed (words per minute)','wpm',130,40,350)+number('Text size (px)','size',36,18,80)+
      select('Mirror text','mirror',[['no','Normal'],['yes','Mirror horizontally']])+buttons('Start / resume','Pause')+
      '<button type="button" id="reset-prompter" class="btn secondary">Reset position</button>'+result()+
      '<div class="teleprompter-window" id="prompter-window" tabindex="0" aria-label="Scrolling script preview" style="max-height:400px;min-height:250px;overflow:auto;background:#111827;color:#fff;border-radius:14px;padding:22px;"><div id="prompter-text" style="white-space:pre-wrap;line-height:1.7"></div></div>');
    let last=0,frame=0,running=false;
    const area=$('prompter-window'),pane=$('prompter-text');
    const sync=()=>{pane.textContent=v('source');pane.style.fontSize=n('size')+'px';pane.style.transform=v('mirror')==='yes'?'scaleX(-1)':'';};
    const step=time=>{if(!running)return;const dt=Math.min(100,(time-last)||0)/1000;last=time;
      // Approximate 5 chars per word, continuous movement for predictable pacing.
      const pxPerSecond=n('wpm')*6*n('size')/360;
      area.scrollTop+=Math.max(0,pxPerSecond*dt);
      if(area.scrollTop>=area.scrollHeight-area.clientHeight-1){running=false;text('Reached the end of the script.');return;}
      frame=requestAnimationFrame(step);};
    const pause=()=>{running=false;cancelAnimationFrame(frame);text('Paused.');};
    const begin=()=>{sync();if(!pane.textContent.trim())throw Error('Add a script first.');if(running)return;running=true;last=performance.now();frame=requestAnimationFrame(step);text('Teleprompter running locally.');};
    onRun(begin);$('secondary').addEventListener('click',pause);$('reset-prompter').addEventListener('click',()=>{pause();area.scrollTop=0;text('Returned to start.');});
    for(const id of ['source','wpm','size','mirror'])$(id).addEventListener('input',sync);
    window.addEventListener('pagehide',pause,{once:true});sync();
  }
  return true;
}

function notice(message){return '<p class="box-message">'+String(message).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c])+'</p>';}
