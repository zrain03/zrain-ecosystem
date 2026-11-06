/*
 * Fail / File: tests/unified.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan unified, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests unified contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,resolve} from 'node:path';
import {INVENTORY,CATEGORIES} from '../public/ecosystem-inventory.mjs';
import {searchCatalog,normalize} from '../public/ecosystem-search-engine.mjs';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
// BM: read: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan unified, output dan kes gagal tanpa membuat permintaan production.
// EN: read: Reads relevant records and returns a bounded result to the caller. Module purpose: tests unified contracts, outputs and failure paths without making production requests.
const read=path=>readFile(join(root,path),'utf8');

test('exactly 56 unique choices: 10 projects, 46 callable tool URLs',()=>{
 assert.equal(INVENTORY.length,56);
 assert.equal(INVENTORY.filter(x=>x.kind==='project').length,10);
 assert.equal(INVENTORY.filter(x=>x.kind==='tool').length,46);
 assert.equal(new Set(INVENTORY.map(x=>x.id)).size,56);
 assert.equal(new Set(INVENTORY.map(x=>x.url)).size,56);
 for(const item of INVENTORY){
  assert.ok(item.name.trim()&&item.description.trim());
  if(item.kind==='tool')assert.equal(item.url,`/tools/${item.id}/`);
  else assert.match(item.url,/^https:\/\//);
 }
});
test('eleven categories contain all 56 choices exactly once',()=>{
 assert.equal(CATEGORIES.length,11);
 assert.deepEqual(CATEGORIES.map(c=>c.id),['games','ai','infrastructure','links','monitoring','pdf','image','document','art','developer','productivity']);
 for(const cat of CATEGORIES)assert.equal(INVENTORY.filter(x=>x.category===cat.id).length,cat.count);
 assert.equal(CATEGORIES.reduce((s,c)=>s+c.count,0),56);
});
test('every one of the 46 tools has a real, nonempty HTML page and loaded implementation module',async()=>{
 const app=await read('public/tools/app.js');
 assert.match(app,/mountExtendedTool/);
 assert.match(app,/mountZrainUI\(\{product:'Ecosystem'/);
 for(const item of INVENTORY.filter(x=>x.kind==='tool')){
  const html=await read(`public/tools/${item.id}/index.html`);
  assert.match(html,new RegExp(`data-tool="${item.id}"`));
  assert.match(html,/\.\.\/app\.js/);
  assert.match(html,/Zrain Ecosystem/);
  assert.doesNotMatch(html,/href="https:\/\/zrain-(pdf|image|document|developer|productivity)-tools\.pages\.dev/);
 }
 for(const asset of ['app.js','extended-tools.mjs','core.mjs','extended-core.mjs','style.css','brand.css','zrain-ui.js','zrain-logo.webp','jszip.min.js']){
  assert.ok((await stat(join(root,'public','tools',asset))).size>10,asset);
 }
});
test('source uses official Zrain design and no redundant product family portals',async()=>{
 const [html,css,js]=await Promise.all([read('public/index.html'),read('public/ecosystem-unified.css'),read('public/ecosystem-unified.mjs')]);
 assert.match(html,/Made for people\. Built with purpose\./);
 assert.match(html,/Developed by Zrain/);
 assert.match(html,/zrain-logo\.webp/);
 assert.match(html,/data-product="zrain-ecosystem"/);
 assert.match(html,/id="category-board"/);
 assert.match(html,/id="search-dialog"/);
 assert.match(html,/id="ai-enable"/);
 assert.doesNotMatch(html,/Zrain (?:Image|PDF|Document|Developer|Productivity) Tools/);
 assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
 assert.match(js,/textContent/);
 assert.doesNotMatch(js,/\.innerHTML/);
 assert.match(js,/new Worker\('\/ecosystem-ai-worker\.mjs'/);
});
test('search matches task intent across languages, not only English titles',()=>{
 const cases={
  'gabungkan dua fail pdf':'merge-pdf',
  '合并 PDF':'merge-pdf',
  'أريد دمج ملف PDF':'merge-pdf',
  'fusionner PDF':'merge-pdf',
  'convert JPG to PDF':'jpg-to-pdf',
  'kecilkan gambar':'image-compressor',
  '压缩图片':'image-compressor',
  'buang background gambar':'background-remover',
  'quitar fondo foto':'background-remover',
  'buat QR untuk website':'qr-generator',
  'inspect JWT':'jwt-decoder',
  'buat invois':'invoice-generator',
  'teka bendera':'guess-the-flag',
  'pantau website':'zrain-monitor',
  'generate password':'password-generator',
 };
 for(const [query,want] of Object.entries(cases))assert.equal(searchCatalog(query,{limit:1})[0]?.id,want,query);
 assert.equal(normalize('  Réduire  '),'reduire');
 assert.equal(searchCatalog('zzzxwhononsense').length,0);
});
test('search category and kind filters retain only wanted items',()=>{
 assert.ok(searchCatalog('',{category:'infrastructure',limit:100}).every(x=>x.category==='infrastructure'));
 assert.ok(searchCatalog('',{kind:'project',limit:100}).every(x=>x.kind==='project'));
 assert.equal(searchCatalog('',{kind:'tool',limit:100}).length,46);
});
test('AI model is optional: model code is loaded only after explicit user click',async()=>{
 const [app,worker]=await Promise.all([read('public/ecosystem-unified.mjs'),read('public/ecosystem-ai-worker.mjs')]);
 assert.match(app,/aiButton\.addEventListener\('click'/);
 assert.match(worker,/feature-extraction/);
 assert.match(worker,/paraphrase-multilingual-MiniLM-L12-v2/);
 assert.match(worker,/\binit\b/);
 assert.match(app,/Fast search/);
});
