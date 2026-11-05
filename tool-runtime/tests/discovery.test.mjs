/*
 * Fail / File: tool-runtime/tests/discovery.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan discovery, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests discovery contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {groups,catalog} from '../src/catalog.mjs';
import {searchTools,groupTools,getFavourites,setFavourite,recordTool,recentTools,storageKey,toolHref,popularSlugs} from '../src/discovery.mjs';
// BM: store: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menguji sempadan discovery, output dan kes gagal tanpa membuat permintaan production.
// EN: store: Isolates one operation so it can be reviewed and tested. Module purpose: tests discovery contracts, outputs and failure paths without making production requests.
const store=()=>{const m=new Map();return {getItem(k){return m.get(k)??null},setItem(k,v){m.set(k,v)},raw:m}};
const root=resolve(import.meta.dirname,'../dist');
test('English and Malay natural-language queries find relevant utilities',()=>{
 assert.ok(searchTools('tukar gambar').some(([id])=>id==='image-converter'));
 assert.ok(searchTools('kabur hd').some(([id])=>id==='image-enhancer'));
 assert.ok(searchTools('resume pdf word').some(([id])=>id==='file-converter'));
 assert.ok(searchTools('metadata osint').some(([id])=>id==='image-inspector'));
 assert.ok(searchTools('invois').some(([id])=>id==='invoice-generator'));
 assert.ok(searchTools('banding dokumen').some(([id])=>id==='compare'));
});
test('search is scoped to independent website products',()=>{
 assert.equal(searchTools('invois','zrain-pdf-tools').length,0);
 assert.ok(['pdf-editor','pdf-organizer','pdf-watermark','merge-pdf','split-pdf'].every(x=>groupTools('zrain-pdf-tools').includes(x)));
 assert.equal(searchTools('', 'zrain-image-tools').length,16);
 for(const g of groups){
  const found=searchTools('',g.slug);assert.equal(found.length,g.sections.flatMap(s=>s.tools).length);
 }
});
test('all 48 tools remain discoverable and none appear in two products',()=>{
 assert.equal(searchTools('').length,catalog.length);
 const all=groups.flatMap(g=>groupTools(g.slug));assert.equal(new Set(all).size,catalog.length);
 assert.ok(popularSlugs.every(id=>all.includes(id)));
});
test('favourites persist locally, toggle correctly and never require authentication',()=>{
 const local=store();assert.deepEqual(getFavourites(local),[]);
 setFavourite(local,'qr-generator',true);setFavourite(local,'qr-generator',true);
 setFavourite(local,'image-converter',true);
 assert.deepEqual(getFavourites(local),['qr-generator','image-converter']);
 assert.equal(JSON.parse(local.raw.get(storageKey)).length,2);
 setFavourite(local,'qr-generator',false);
 assert.deepEqual(getFavourites(local),['image-converter']);
});
test('malformed or disabled browser storage does not crash favourites',()=>{
 const local=store();local.raw.set(storageKey,'{broken');assert.deepEqual(getFavourites(local),[]);
 assert.deepEqual(setFavourite(null,'image-converter',true),['image-converter']);
 assert.deepEqual(getFavourites({getItem(){throw Error('disabled')}}),[]);
});
test('recent tools are bounded and filtered per product',()=>{
 const local=store();for(const row of catalog)recordTool(local,row[0]);
 assert.equal(recentTools(local).length,5);
 recordTool(local,'qr-generator');recordTool(local,'qr-generator');
 assert.equal(recentTools(local)[0],'qr-generator');
 assert.equal(recentTools(local,'zrain-pdf-tools').every(s=>groupTools('zrain-pdf-tools').includes(s)),true);
});
test('product-owned links use the correct directory depth',()=>{
 assert.equal(toolHref('qr-generator',''),'./zrain-developer-tools/qr-generator/index.html');
 assert.equal(toolHref('qr-generator','zrain-developer-tools'),'./qr-generator/index.html');
});
test('every independently deployable website includes the discovery modules',async()=>{
 const shared=['discovery.mjs','discovery-ui.mjs'];
 for(const g of groups){
  const dir=join(root,g.slug);
  for(const f of shared)assert.ok((await stat(join(dir,f))).size>0);
  const html=await readFile(join(dir,'index.html'),'utf8');
  assert.ok(html.includes('id="discovery-root"'));
  assert.ok(html.includes('zrain-logo.webp'));
 }
 const home=await readFile(join(root,'index.html'),'utf8');
 assert.ok(home.includes('id="discovery-root"'));
 const js=await readFile(join(root,'discovery-ui.mjs'),'utf8');
 for(const phrase of ['zrain-tool-search','zrain-favourite-section','zrain-recent-section','Ctrl K','role="status"','aria-pressed'])assert.ok(js.includes(phrase),phrase);
});
