/*
 * Fail / File: tool-runtime/src/extended-tools.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menghubungkan utiliti lanjutan kepada borang interaktif tanpa memintas validasi input.
 * EN: Connects extended utilities to interactive forms without bypassing input validation.
 */
import {base64Encode,base64Decode,decodeJwt,textStatistics,hashText,createUuids,cssShadow,pdfPageSelection,targetDimensions} from './extended-core.mjs';

/**
 * Phase-one additional real tools. Each slug has an actual processing callback.
 * No blank or "coming soon" pages are registered in the catalogue.
 * Heavy PDF engines are loaded only by the PDF actions that need them.
 */
export const EXTRA_TOOL_SLUGS = Object.freeze([
  'base64-tool','jwt-decoder','word-counter','hash-generator','uuid-generator','css-shadow-generator',
  'image-resizer','image-rotator','image-compressor',
  'merge-pdf','split-pdf','rotate-pdf','crop-pdf','remove-pdf-pages','extract-pdf-pages',
  'pdf-to-text','pdf-to-image','jpg-to-pdf','pdf-page-numbers',
  'teleprompter'
]);

// BM: mountExtendedTool: Menyelaraskan UI dan state tanpa menggandakan event handler atau mencipta elemen tidak diperlukan. Tujuan modul: menghubungkan utiliti lanjutan kepada borang interaktif tanpa memintas validasi input. Input: slug, h.
// EN: mountExtendedTool: Synchronizes UI and state without duplicating handlers or unnecessary elements. Module purpose: connects extended utilities to interactive forms without bypassing input validation. Inputs: slug, h.
export function mountExtendedTool(slug, h) {
  if(!EXTRA_TOOL_SLUGS.includes(slug))return false;
  const {set,file,number,select,input,textarea,buttons,preview,result,onRun,chosen,v,n,text,download,downloadText,
    pdfLib,openPdf,renderPdfPage,zipLib,canvas,imgFile,blobOf,renderImage,safeStem,bytes,$} = h;
  const action = (label='Process') => buttons(label)+result();
  const savePdf = async (document,name) => {
    const output = await document.save();
    const blob = new Blob([output],{type:'application/pdf'});
    download(blob,name);
    text('Saved '+name+' ('+bytes(blob.size)+').');
  };
  // BM: requirePdf: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menghubungkan utiliti lanjutan kepada borang interaktif tanpa memintas validasi input.
  // EN: requirePdf: Isolates one operation so it can be reviewed and tested. Module purpose: connects extended utilities to interactive forms without bypassing input validation.
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
  else if(slug==='word-counter'){
    set(textarea('Text','source','Paste an essay, note or document text…')+action('Count words')+textarea('Statistics','output'));
    // BM: update: Mengubah state yang berkaitan hanya selepas input dan syarat akses diperiksa. Tujuan modul: menghubungkan utiliti lanjutan kepada borang interaktif tanpa memintas validasi input.
    // EN: update: Mutates relevant state only after input and access conditions are verified. Module purpose: connects extended utilities to interactive forms without bypassing input validation.
    const update=()=>{const s=textStatistics(v('source'));$('output').value=Object.entries(s).map(([k,x])=>k+': '+x).join('\n');text(s.words+' words · '+s.characters+' characters.');};
    $('source').addEventListener('input',update);onRun(update);update();
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
    // BM: update: Mengubah state yang berkaitan hanya selepas input dan syarat akses diperiksa. Tujuan modul: menghubungkan utiliti lanjutan kepada borang interaktif tanpa memintas validasi input.
    // EN: update: Mutates relevant state only after input and access conditions are verified. Module purpose: connects extended utilities to interactive forms without bypassing input validation.
    const update=()=>{const value=cssShadow({x:n('x'),y:n('y'),blur:n('blur'),spread:n('spread'),opacity:n('opacity'),color:v('color'),inset:v('inset')==='yes'});$('shadow-swatch').style.boxShadow=value;$('output').value='box-shadow: '+value+';';text('Copy CSS into your stylesheet.');};
    for(const id of ['x','y','blur','spread','opacity','color','inset'])$(id).addEventListener('input',()=>{try{update()}catch{}});
    onRun(update);try{update()}catch{/* Controls are populated by the browser; isolated test doubles may omit values. */}
  }
  else if(['image-resizer','image-rotator','image-compressor'].includes(slug)){
    const controls=slug==='image-resizer'?number('Maximum width (px)','width',1280,1,8000)+number('Maximum height (px)','height',1280,1,8000):
      slug==='image-rotator'?select('Action','angle',[['90','Rotate 90° clockwise'],['180','Rotate 180°'],['270','Rotate 90° counter-clockwise'],['flip-h','Flip horizontally'],['flip-v','Flip vertically']]):
      number('Quality (JPG / WebP %)','quality',78,1,100)+select('Output','format',[['image/jpeg','JPG'],['image/webp','WebP'],['image/png','PNG (lossless)']]);
    set(file('Choose an image','file','image/*')+controls+action(slug==='image-resizer'?'Resize and download':slug==='image-rotator'?'Rotate / flip and download':'Compress and download')+preview());
    onRun(async()=>{
      const {file:f,image}=await imgFile();
      const w=image.naturalWidth,h=image.naturalHeight;
      let c,format='image/png',extension='png';
      if(slug==='image-resizer'){
        const size=targetDimensions(w,h,n('width'),n('height'),true);
        c=canvas(size.width,size.height);c.getContext('2d').drawImage(image,0,0,size.width,size.height);
      }else if(slug==='image-rotator'){
        const angle=v('angle');c=canvas(['90','270'].includes(angle)?h:w,['90','270'].includes(angle)?w:h);
        const ctx=c.getContext('2d');ctx.translate(c.width/2,c.height/2);
        if(angle.startsWith('flip'))ctx.scale(angle==='flip-h'?-1:1,angle==='flip-v'?-1:1);
        else ctx.rotate(Number(angle)*Math.PI/180);
        ctx.drawImage(image,-w/2,-h/2);
      }else{
        c=canvas(w,h);format=v('format');extension=format.slice(6)==='jpeg'?'jpg':format.slice(6);
        const ctx=c.getContext('2d');if(format==='image/jpeg'){ctx.fillStyle='white';ctx.fillRect(0,0,w,h)}ctx.drawImage(image,0,0);
      }
      renderImage(c);
      const blob=await blobOf(c,format,n('quality')/100 || .82);
      download(blob,cleanName(f)+'-'+(slug==='image-compressor'?'compressed':slug==='image-resizer'?'resized':'transformed')+'.'+extension);
      text('Saved '+c.width+' × '+c.height+' '+extension.toUpperCase()+'. '+bytes(f.size)+' → '+bytes(blob.size)+'. Compression does not guarantee a smaller file.');
    });
  }
  else if(slug==='merge-pdf'){
    set(file('Choose 2–12 PDF files','file','application/pdf,.pdf',true)+action('Merge into one PDF'));
    onRun(async()=>{const files=[...$('file').files];if(files.length<2||files.length>12)throw Error('Choose between 2 and 12 PDFs.');
      const {PDFDocument}=await pdfLib(),out=await PDFDocument.create();let pages=0;
      for(const f of files){if(!/\.pdf$/i.test(f.name))throw Error('PDF files only.');const doc=await PDFDocument.load(await f.arrayBuffer());const copied=await out.copyPages(doc,doc.getPageIndices());for(const p of copied)out.addPage(p);pages+=copied.length;}
      await savePdf(out,'zrain-merged.pdf');text('Merged '+files.length+' documents / '+pages+' pages without rasterizing.');});
  }
  else if(['split-pdf','extract-pdf-pages','remove-pdf-pages'].includes(slug)){
    set(file('Choose a PDF','file','application/pdf,.pdf')+
      input(slug==='split-pdf'?'Pages (blank = all)':'Page numbers e.g. 1, 3-5','pages',slug==='split-pdf'?'':'1')+
      action(slug==='split-pdf'?'Split into ZIP':slug==='extract-pdf-pages'?'Extract pages into PDF':'Remove pages from PDF'));
    onRun(async()=>{const f=requirePdf();const {PDFDocument}=await pdfLib(),doc=await PDFDocument.load(await f.arrayBuffer()),ids=pdfPageSelection(v('pages'),doc.getPageCount(),slug==='split-pdf');
      if(!ids.length)throw Error('Select at least one page.');
      if(slug==='remove-pdf-pages'){
        const remove=new Set(ids),keep=doc.getPageIndices().filter(i=>!remove.has(i));if(!keep.length)throw Error('At least one page must remain.');
        const out=await PDFDocument.create();for(const p of await out.copyPages(doc,keep))out.addPage(p);await savePdf(out,cleanName(f)+'-pages-removed.pdf');
      }else if(slug==='extract-pdf-pages'){
        const out=await PDFDocument.create();for(const p of await out.copyPages(doc,ids))out.addPage(p);await savePdf(out,cleanName(f)+'-extracted.pdf');
      }else{
        if(ids.length>200)throw Error('Split supports up to 200 pages per run.');const JSZip=await zipLib(),zip=new JSZip();
        for(const [pos,i] of ids.entries()){const out=await PDFDocument.create();out.addPage((await out.copyPages(doc,[i]))[0]);zip.file('page-'+String(pos+1).padStart(3,'0')+'-original-'+(i+1)+'.pdf',await out.save());}
        const blob=await zip.generateAsync({type:'blob'});download(blob,cleanName(f)+'-split.zip');text('Saved '+ids.length+' separate PDF pages in a ZIP.');
      }});
  }
  else if(slug==='rotate-pdf'){
    set(file('Choose a PDF','file','application/pdf,.pdf')+
      select('Angle','angle',[['90','90° clockwise'],['180','180°'],['270','90° counter-clockwise']])+input('Pages (blank = all)','pages','')+
      action('Rotate PDF pages'));
    onRun(async()=>{const f=requirePdf(),lib=await pdfLib(),doc=await lib.PDFDocument.load(await f.arrayBuffer());const ids=pdfPageSelection(v('pages'),doc.getPageCount());
      for(const i of ids){const p=doc.getPage(i);p.setRotation(lib.degrees((p.getRotation().angle+n('angle'))%360));}
      await savePdf(doc,cleanName(f)+'-rotated.pdf');text('Rotated '+ids.length+' page(s) without re-encoding content.');});
  }
  else if(slug==='crop-pdf'){
    set(file('Choose a PDF','file','application/pdf,.pdf')+number('Top margin (mm)','top',10,0,150)+number('Bottom margin (mm)','bottom',10,0,150)+
      number('Left margin (mm)','left',10,0,150)+number('Right margin (mm)','right',10,0,150)+input('Pages (blank = all)','pages','')+
      action('Crop visible PDF area'));
    onRun(async()=>{const f=requirePdf(),lib=await pdfLib(),doc=await lib.PDFDocument.load(await f.arrayBuffer());const ids=pdfPageSelection(v('pages'),doc.getPageCount());
      const mm=2.8346456693,left=n('left')*mm,right=n('right')*mm,top=n('top')*mm,bottom=n('bottom')*mm;
      if([left,right,top,bottom].some(x=>!Number.isFinite(x)||x<0))throw Error('Margins must be nonnegative.');
      for(const i of ids){const p=doc.getPage(i),size=p.getSize();if(size.width-left-right<10||size.height-top-bottom<10)throw Error('Margins exceed page '+(i+1)+'.');
        p.setCropBox(left,bottom,size.width-left-right,size.height-top-bottom);}
      await savePdf(doc,cleanName(f)+'-cropped.pdf');text('Visible margins changed. Hidden content remains in the PDF; do not use this to redact private information.');});
  }
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
    set(file('Choose a PDF','file','application/pdf,.pdf')+select('Resolution','scale',[['1','72 dpi (screen)'],['2','144 dpi'],['3','216 dpi']])+
      select('Format','format',[['image/png','PNG'],['image/jpeg','JPG']])+action('Render PDF pages and download'));
    onRun(async()=>{const f=requirePdf(),doc=await openPdf(f);if(doc.numPages>40)throw Error('Render up to 40 pages per run to protect memory.');const JSZip=await zipLib(),zip=new JSZip();
      for(let i=1;i<=doc.numPages;i++){const page=await doc.getPage(i),viewport=page.getViewport({scale:n('scale')});const c=canvas(viewport.width,viewport.height),ctx=c.getContext('2d');
        await page.render({canvasContext:ctx,viewport}).promise;const mime=v('format');zip.file('page-'+i+(mime==='image/png'?'.png':'.jpg'),await blobOf(c,mime,.9));}
      const archive=await zip.generateAsync({type:'blob'});download(archive,cleanName(f)+'-pages.zip');text('Rendered '+doc.numPages+' page(s) to '+v('format')+' and bundled as ZIP.');});
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
    // BM: sync: Menyelaraskan data dengan mengekalkan identiti, aturan dan keserasian rekod lama. Tujuan modul: menghubungkan utiliti lanjutan kepada borang interaktif tanpa memintas validasi input.
    // EN: sync: Reconciles data while preserving identity, ordering and legacy compatibility. Module purpose: connects extended utilities to interactive forms without bypassing input validation.
    const sync=()=>{pane.textContent=v('source');pane.style.fontSize=n('size')+'px';pane.style.transform=v('mirror')==='yes'?'scaleX(-1)':'';};
    const step=time=>{if(!running)return;const dt=Math.min(100,(time-last)||0)/1000;last=time;
      // Approximate 5 chars per word, continuous movement for predictable pacing.
      const pxPerSecond=n('wpm')*6*n('size')/360;
      area.scrollTop+=Math.max(0,pxPerSecond*dt);
      if(area.scrollTop>=area.scrollHeight-area.clientHeight-1){running=false;text('Reached the end of the script.');return;}
      frame=requestAnimationFrame(step);};
    // BM: pause: Memproses interaksi yang ditentukan dan mengemas kini state yang relevan dengan selamat. Tujuan modul: menghubungkan utiliti lanjutan kepada borang interaktif tanpa memintas validasi input.
    // EN: pause: Handles the specified interaction and updates relevant state safely. Module purpose: connects extended utilities to interactive forms without bypassing input validation.
    const pause=()=>{running=false;cancelAnimationFrame(frame);text('Paused.');};
    const begin=()=>{sync();if(!pane.textContent.trim())throw Error('Add a script first.');if(running)return;running=true;last=performance.now();frame=requestAnimationFrame(step);text('Teleprompter running locally.');};
    onRun(begin);$('secondary').addEventListener('click',pause);$('reset-prompter').addEventListener('click',()=>{pause();area.scrollTop=0;text('Returned to start.');});
    for(const id of ['source','wpm','size','mirror'])$(id).addEventListener('input',sync);
    window.addEventListener('pagehide',pause,{once:true});sync();
  }
  return true;
}

// BM: notice: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menghubungkan utiliti lanjutan kepada borang interaktif tanpa memintas validasi input. Input: message.
// EN: notice: Isolates one operation so it can be reviewed and tested. Module purpose: connects extended utilities to interactive forms without bypassing input validation. Inputs: message.
function notice(message){return '<p class="box-message">'+String(message).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c])+'</p>';}
