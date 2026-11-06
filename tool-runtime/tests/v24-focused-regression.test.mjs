/*
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Ujian sasaran untuk maklum balas kelulusan v2.4.0, tanpa mengubah tools lain.
 * EN: Focused v2.4.0 approval regression tests, preserving unrelated tools.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {movePdfPage} from '../src/pdf-reorder.mjs';
import {pdfPageSelection} from '../src/extended-core.mjs';
import {buildDocxPrintPreview} from '../src/docx-layout.mjs';
import {catalog,groups} from '../src/catalog.mjs';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFile(join(root,p),'utf8');

test('dragged PDF page can jump directly from page 1 to page 60, preserving remaining order',()=>{
 const pages=Array.from({length:60},(_,i)=>i+1);
 assert.equal(movePdfPage(pages,0,59),pages);
 assert.deepEqual(pages.slice(0,4),[2,3,4,5]);
 assert.deepEqual(pages.slice(-3),[59,60,1]);
 movePdfPage(pages,59,0);assert.deepEqual(pages,Array.from({length:60},(_,i)=>i+1));
});
test('PDF move prevents invalid positions and does not reorder for same position',()=>{
 const pages=['A','B','C'];assert.throws(()=>movePdfPage(pages,0,3),/Invalid page/);
 assert.throws(()=>movePdfPage(pages,0,1.5),/Invalid page/);
 movePdfPage(pages,1,1);assert.deepEqual(pages,['A','B','C']);
});
test('Rearrange PDF exposes drag autoscroll, touch and direct jump, with confirmation before removal',async()=>{
 const s=await read('src/app.js');
 assert.ok(s.includes('setPointerCapture'), 'Touch drag handle');
 assert.ok(s.includes('requestAnimationFrame(autoScroll)'), 'Continuous drag autoscroll');
 assert.ok(s.includes('window.scrollBy'), 'Scroll long page list');
 assert.ok(s.includes('movePdfPage(pages,from,to)'), 'Direct move');
 assert.ok(s.includes('window.confirm(\'Remove page '), 'Confirmation before deletion');
 assert.ok(s.indexOf('window.confirm(\'Remove page ')<s.indexOf('pages.splice(i,1);render();'), 'Confirm before removing');
 assert.ok(s.includes('Move to'), 'Accessible long-distance jump');
});
test('PDF watermark supports custom HEX and updates live preview on color changes',async()=>{
 const s=await read('src/pdf-visual.mjs'),visual=await read('src/visual-editors.mjs');
 assert.ok(s.includes("color:v('color')"));
 assert.ok(s.includes("['mark','opacity','color']"));
 assert.ok(s.includes("$('color-hex').addEventListener('change'"));
 assert.ok(visual.includes('mark.style.color'));
 assert.ok(s.includes("input('Text color','color','#BD5338','color')"));
});
test('Crop PDF explicitly requires an all-pages or selected-pages choice, and validates page input',async()=>{
 const s=await read('src/pdf-visual.mjs');
 assert.match(s,/\['','Choose pages to crop'\]/);
 assert.match(s,/\['all','All pages'\]/);
 assert.match(s,/\['selected','Selected pages'\]/);
 assert.match(s,/v\('scope'\)==='all'\?pdf.getPageIndices\(\)/);
 assert.match(s,/v\('scope'\)==='selected'\?pdfPageSelection/);
 assert.deepEqual(pdfPageSelection('1,5,8-10',10,false),[0,4,7,8,9]);
 assert.deepEqual(pdfPageSelection('',10,false),[]);
 assert.throws(()=>pdfPageSelection('0,20',10,false));
});
test('Word to PDF no longer silently produces a plain-text export',async()=>{
 const s=await read('src/app.js'),guide=await read('src/workflow-guide.mjs');
 assert.match(s,/mode==='docx-print'\|\|mode==='docx-pdf'/);
 assert.ok(s.includes('buildDocxPrintPreview'));
 assert.ok(!s.includes("text('Basic PDF exported as plain text."));
 assert.ok(guide.includes('complex Office layout can still differ'));
});

// BM: DOM Word minimal dalam ujian, supaya warna, saiz dan alignment diuji tanpa CDN/browser.
// EN: Minimal Word DOM fixtures verify visual styles without a CDN or real browser dependency.
const N=(name,attrs={},items=[],content='')=>({localName:name,children:items,textContent:content,
 getAttribute(key){return attrs[key]??null},
 getElementsByTagName(tag){const out=[];function walk(el){for(const ch of el.children){if(tag==='*'||ch.localName===tag)out.push(ch);walk(ch)}}walk(this);return out},
 querySelector(){return null}});
const W=(name,attrs,items,content)=>N(name,attrs,items,content);
test('Word preview retains a red font, bold style, size, alignment and safely escapes content',async()=>{
 const normal=W('style',{'w:styleId':'Normal'},[W('rPr',{},[W('color',{'w:val':'2255AA'})])]);
 const styles=W('styles',{},[normal]);
 const p=W('p',{},[
  W('pPr',{},[W('jc',{'w:val':'center'})]),
  W('r',{},[W('rPr',{},[W('color',{'w:val':'FF0000'}),W('sz',{'w:val':'32'}),W('b')]),W('t',{},[],'Bright <Title>')])
 ]);
 const p2=W('p',{},[W('r',{},[W('t',{},[],'Normal Blue')])]);
 const doc=W('document',{},[W('body',{},[p,p2,W('sectPr',{},[W('pgSz',{'w:w':'11906','w:h':'16838'})])])]);
 const previous=globalThis.DOMParser;
 globalThis.DOMParser=class{parseFromString(raw){return raw==='DOCUMENT'?doc:styles}};
 try{
  const source={file(path){if(path==='word/document.xml')return {async:async()=> 'DOCUMENT'};if(path==='word/styles.xml')return {async:async()=> 'STYLES'};return null}};
  const zip={loadAsync:async()=>source};const output=await buildDocxPrintPreview(new ArrayBuffer(0),zip);
  assert.match(output.html,/text-align:center/);
  assert.match(output.html,/color:#FF0000/);
  assert.match(output.html,/font-size:16pt/);
  assert.match(output.html,/font-weight:700/);
  assert.match(output.html,/&lt;Title&gt;/);
  assert.match(output.html,/color:#2255AA/);
  assert.match(output.pageCss,/@page/);
  assert.match(output.warning,/may still change/);
 }finally{globalThis.DOMParser=previous}
});
test('46 tools across 5 unchanged categories plus new shared converter asset',async()=>{
 assert.equal(catalog.length,46);assert.equal(groups.length,5);
 const file=await read('src/build.mjs');assert.ok(file.includes('docx-layout.mjs'));
 assert.ok(file.includes('pdf-reorder.mjs'));
 const products=JSON.parse(await read('dist/products.json'));
 assert.equal(products.reduce((sum,p)=>sum+p.toolCount,0),46);
});
test('Word print preview includes a styled table and local embedded image without external upload',async()=>{
 const rel=W('Relationship',{Id:'rId7',Target:'media/image1.png'});
 const body=W('body',{},[
   W('tbl',{},[W('tr',{},[W('tc',{},[W('tcPr',{},[W('shd',{'w:fill':'F5E8D8'})]),W('p',{},[W('r',{},[W('t',{},[],'Zrain Table')])])])])]),
   W('p',{},[W('r',{},[W('drawing',{},[W('blip',{'r:embed':'rId7'}),W('extent',{cx:'952500',cy:'476250'})])])])
 ]);
 const previous=globalThis.DOMParser;
 globalThis.DOMParser=class{parseFromString(raw){return raw==='DOCUMENT'?W('document',{},[body]):W('Relationships',{},[rel])}};
 try{
  const files={'word/document.xml':{async:async()=> 'DOCUMENT'},'word/_rels/document.xml.rels':{async:async()=> 'RELS'},'word/media/image1.png':{async:async()=>new Uint8Array([137,80,78,71,1,2,3,4])}};
  const zip={loadAsync:async()=>({file:path=>files[path]||null})};
  const out=await buildDocxPrintPreview(new ArrayBuffer(0),zip);
  assert.match(out.html,/<table>/);assert.match(out.html,/background:#F5E8D8/);
  assert.match(out.html,/data:image\/png;base64,/);assert.match(out.html,/width="100" height="50"/);
  assert.match(out.html,/Zrain Table/);
 }finally{globalThis.DOMParser=previous}
});
