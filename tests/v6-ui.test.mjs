/*
 * Fail / File: tests/v6-ui.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan v6 ui, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests v6 ui contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {INVENTORY,CATEGORIES} from '../public/ecosystem-inventory.mjs';
// BM: read: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan v6 ui, output dan kes gagal tanpa membuat permintaan production.
// EN: read: Reads relevant records and returns a bounded result to the caller. Module purpose: tests v6 ui contracts, outputs and failure paths without making production requests.
const read = name => readFile(new URL(name,import.meta.url),'utf8');
test('exactly 56 indexed entries with real deep links',()=>{
 assert.equal(INVENTORY.length,56);
 assert.equal(new Set(INVENTORY.map(x=>x.id)).size,56);
 assert.equal(INVENTORY.filter(x=>x.kind==='project').length,10);
 assert.equal(INVENTORY.filter(x=>x.kind==='tool').length,46);
 assert.equal(CATEGORIES.length,11);
 for (const item of INVENTORY) assert.ok(item.url.startsWith('/') || /^https:\/\//.test(item.url),item.id);
});
test('project GitHub links are only shown when a verified repository exists',()=>{
 const apps=INVENTORY.filter(x=>x.kind==='project');
 for(const app of apps) if(app.repoUrl)assert.match(app.repoUrl,/^https:\/\/github\.com\/zrain03\/[\w-]+$/);
});
test('the two games retain official game logos, all other entries use Zrain brand',async()=>{
 const [source,ui]=await Promise.all([read('../public/ecosystem-links.mjs'),read('../public/ecosystem-unified.mjs')]);
 assert.match(source,/guess-the-flag\.webp/);
 assert.match(source,/memory-rush\.webp/);
 assert.match(source,/return OFFICIAL_LOGOS\[item\?\.id\] \|\| '\/zrain-logo\.webp'/);
 assert.match(ui,/function imageFor/);
});
test('categories have search and expandable previews without nested vertical scrolling',async()=>{
 const ui=await read('../public/ecosystem-unified.mjs');
 assert.match(ui,/category-search-form/);
 assert.match(ui,/searchCatalog\(query,\{limit:getActiveInventory\(\)\.length\}\)/);
 assert.doesNotMatch(ui,/overscroll-behavior:contain/);
 assert.match(ui,/list\.replaceChildren\(\.\.\.shown\.map\(item=>resultRow\(item\)\)\)/);
});
test('all Web App actions use inline Console while full Console retains its controls',async()=>{
 const [ui,consolePage,script]=await Promise.all([
  read('../public/ecosystem-unified.mjs'),read('../public/zrain-console.html'),read('../public/ecosystem-console.mjs')
 ]);
 assert.match(ui,/previewLinkHref\(item\)/);
 assert.doesNotMatch(ui,/openConsole\(item\)/);
 for (const id of ['console-iframe','console-mobile','console-desktop','console-store','console-fullscreen','console-reload','console-selected-icon','console-github','console-open']) {
  assert.ok(consolePage.includes('id="'+id+'"'),id);
 }
 assert.match(script,/history\.replaceState/);
 assert.match(script,/new ResizeObserver\(layoutFrame\)/);
 assert.match(script,/mode === 'desktop'/);
 assert.match(script,/GOOGLE_PLAY\[item\.id\]/);
 assert.match(consolePage,/Made for people\. Built with purpose\./);
});
test('repository links exist only for official project repos and not for tools',async()=>{
 const source=await read('../public/ecosystem-links.mjs');
 const ui=await read('../public/ecosystem-unified.mjs');
 assert.match(source,/url\.hostname === 'github\.com'/);
 assert.match(ui,/const repository = repoHref\(item\)/);
 assert.match(ui,/if \(repository\)/);
});
test('Zrain UI branding and official footer persist',async()=>{
 const [html,css]=await Promise.all([read('../public/index.html'),read('../public/ecosystem-unified.css')]);
 assert.match(html,/Made for people\. Built with purpose\./);
 assert.match(html,/class="zrain-header"/);
 assert.match(html,/class="zrain-footer"/);
 assert.match(css,/--v6-terra: #b95136/);
});
test('Admin integration stays under original authenticated dashboard',async()=>{
 const [js,css]=await Promise.all([read('../public/admin/unified-admin.mjs'),read('../public/admin/unified-admin.css')]);
 assert.match(js,/getElementById\('dashboard'\)/);
 assert.match(js,/insertBefore\(panel/);
 assert.match(js,/read-only until the API supports unified entries/);
 assert.match(css,/\.unified-admin-panel/);
});
test('all 46 tool pages exist on the preview server', async()=>{
 for(const item of INVENTORY.filter(x=>x.kind==='tool')){
  const uri=item.url.replace(/^\//,'');
  const target=new URL('../public/'+uri+'index.html',import.meta.url);
  assert.ok((await stat(target)).size>1000,item.id);
 }
});
