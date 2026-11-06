/*
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Uji keperluan pelepasan UX 2.3 tanpa menganggap QA peranti sebenar sudah selesai.
 * EN: Assert v2.3 release contracts without overstating real-device coverage.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {catalog,groups} from '../src/catalog.mjs';
import {alphaFromPredictions} from '../src/ai-background.mjs';
const root=resolve(import.meta.dirname,'..');
const read=path=>readFile(join(root,path),'utf8');
const slugs=()=>new Set(catalog.map(row=>row[0]));

test('all 46 tools remain A-Z in the approved families, with OCR moved and Compare Documents retired',()=>{
 assert.equal(catalog.length,46);
 assert.deepEqual(groups.map(g=>g.sections.flatMap(s=>s.tools).length),[18,12,2,11,3]);
 const image=groups[0].sections.flatMap(s=>s.tools);
 const document=groups[2].sections.flatMap(s=>s.tools);
 assert.ok(image.includes('text-extractor'));
 assert.ok(!document.includes('text-extractor'));
 assert.ok(!slugs().has('compare'));
 assert.equal(slugs().has('text-counter'),true);
});

test('crop/image watermark have drag, resize and numerical setting synchronization',async()=>{
 const visual=await read('src/visual-editors.mjs');
 const app=await read('src/app.js');
 for(const prop of ['pointerdown','pointermove','pointerup'])assert.ok(visual.includes(prop));
 assert.ok(visual.includes('cropSelection'));
 assert.ok(visual.includes('watermarkSelection'));
 assert.ok(app.includes("['x','y','w','h']"));
 assert.ok(app.includes('editor.set({x:x/W,y:y/H,w:w/W,h:h/H})'));
 assert.ok(app.includes("$('size').value=Math.round(state.size)"));
});

test('compression only offers smaller encoded image and never larger replacement',async()=>{
 const source=await read('src/extended-tools.mjs');
 assert.match(source,/blob\.size<f\.size/);
 assert.match(source,/This image is already efficiently compressed/);
 assert.match(source,/Reduced from /);
});

test('AI alpha conversion is bounded and monotonic, without requiring remote services during tests',()=>{
 const result=alphaFromPredictions(new Float32Array([0,.25,.5,1]),2,2);
 assert.deepEqual([...result],[0,64,128,255]);
 const flat=alphaFromPredictions(new Float32Array([.3,.3,.3,.3]),2,2);
 assert.deepEqual([...flat],[0,0,0,0]);
});

test('background removal uses a pinned model in the browser and offers plain background choices',async()=>{
 const source=await read('src/ai-background.mjs');
 const app=await read('src/app.js');
 assert.ok(source.includes('25dee37ab19c5b6ad64ba6578eba63f1ae07720c'));
 assert.ok(source.includes("executionProviders:['wasm']"));
 assert.ok(source.includes('maxPixel'));
 for(const color of ['transparent','white','black','custom'])assert.ok(app.includes(color));
 assert.ok(!app.includes('edge-softness'));
});

test('PDF actual previews and controls are present, not only instructions',async()=>{
 const app=await read('src/app.js');
 const ext=await read('src/extended-tools.mjs');
 const pdf=await read('src/pdf-visual.mjs');
 assert.ok(app.includes("page.render({canvasContext:c.getContext('2d'),viewport:vp})"));
 assert.ok(app.includes('card.draggable=true'));
 assert.ok(app.includes("'Move earlier'"));
 assert.ok(ext.includes("btn.textContent='Download PNG'"));
 assert.ok(ext.includes('mountVisualPdfCrop'));
 assert.ok(pdf.includes('watermarkSelection'));
 assert.ok(pdf.includes("['all','All pages']"));
 assert.ok(pdf.includes("['selected','Selected pages']"));
 assert.ok(pdf.includes('CropBox') || pdf.includes('setCropBox'));
});

test('file converter preview and OCR copy/download are in the production app',async()=>{
 const app=await read('src/app.js');
 assert.ok(app.includes('Generated file content preview'));
 assert.ok(app.includes("['copy']")||app.includes("$('copy')"));
 assert.ok(app.includes("$('ocr-download')"));
 assert.ok(app.includes('word/document.xml'));
 assert.ok(app.includes('xl/worksheets/sheet1.xml'));
});

test('compiled sites contain the new modules and retired redirects target live URL patterns',async()=>{
 const products=JSON.parse(await read('dist/products.json'));
 assert.equal(products.reduce((n,p)=>n+p.toolCount,0),46);
 for(const group of products){
  for(const asset of ['visual-editors.mjs','pdf-visual.mjs','ai-background.mjs'])assert.ok((await read('dist/'+group.slug+'/'+asset)).length>100);
 }
 const redirects=await read('dist/zrain-document-tools/_redirects');
 assert.match(redirects,/\/text-extractor\/ https:\/\/zrain-image-tools\.pages\.dev\/text-extractor\/ 301/);
 assert.match(redirects,/\/compare\/ \/ 301/);
});
