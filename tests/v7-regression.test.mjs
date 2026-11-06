/*
 * Fail / File: tests/v7-regression.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan v7 regression, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests v7 regression contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {INVENTORY, CATEGORIES} from '../public/ecosystem-inventory.mjs';
import {GOOGLE_PLAY, OFFICIAL_LOGOS,logoFor,consoleHref,repoHref,previewHref,sortedByName,getInventoryItem} from '../public/ecosystem-links.mjs';
// BM: read: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan v7 regression, output dan kes gagal tanpa membuat permintaan production.
// EN: read: Reads relevant records and returns a bounded result to the caller. Module purpose: tests v7 regression contracts, outputs and failure paths without making production requests.
const read = name => readFile(new URL(name,import.meta.url),'utf8');

test('every one of 56 Web Apps uses the same Console entry point and is allowlisted',()=>{
 assert.equal(INVENTORY.length,56);
 for(const item of INVENTORY){
  assert.equal(consoleHref(item),'/zrain-console.html?app='+encodeURIComponent(item.id));
  assert.equal(getInventoryItem(item.id),item);
  assert.ok(previewHref(item,'http://127.0.0.1:8766'));
  if (item.kind==='project')if(item.repoUrl)assert.match(repoHref(item),/^https:\/\/github\.com\/zrain03\//);
  else assert.equal(repoHref(item),null);
 }
 assert.equal(consoleHref({id:'guess-the-flag'}),null);
 assert.equal(consoleHref({id:'not-real'}),null);
 assert.equal(getInventoryItem('not-real'),null);
 assert.equal(previewHref({id:'guess-the-flag'}),null);
});

test('every category and Console directory support a predictable A-Z order',()=>{
 for(const group of CATEGORIES){
  const rows=sortedByName(INVENTORY.filter(x=>x.category===group.id));
  assert.equal(rows.length,group.count);
  assert.deepEqual(rows.map(x=>x.name),[...rows.map(x=>x.name)].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'})));
 }
 const console=sortedByName(INVENTORY);
 assert.equal(console.length,56);
 assert.equal(console[0].name,'Add Image Watermark');
});

test('game icons are unique and Google Play URLs are exact; every other logo is Zrain',()=>{
 assert.notEqual(OFFICIAL_LOGOS['guess-the-flag'],OFFICIAL_LOGOS['memory-rush']);
 assert.match(GOOGLE_PLAY['guess-the-flag'],/com\.zrain\.guesstheflag/);
 assert.match(GOOGLE_PLAY['memory-rush'],/com\.zrain\.memoryrush/);
 for(const item of INVENTORY){
  if(item.id==='guess-the-flag'||item.id==='memory-rush')assert.match(logoFor(item),/\.webp$/);
  else assert.equal(logoFor(item),'/zrain-logo.webp');
 }
});

test('homepage keeps the official tagline and opens Web Apps in the inline Console',async()=>{
 const [html,ui,css,brand]=await Promise.all([read('../public/index.html'),read('../public/ecosystem-unified.mjs'),read('../public/ecosystem-unified.css'),read('../public/brand.css')]);
 assert.match(html,/aria-label="Made for people\. Built with purpose\."/);
 assert.match(html,/Explore the Zrain Ecosystem\./);
 assert.match(html,/id="how-it-works"/);
 assert.match(ui,/const route = previewLinkHref\(item\)/);
 assert.doesNotMatch(ui,/link\.href = url/);
 assert.doesNotMatch(html,/View all/);
 assert.doesNotMatch(html,/—/);
 assert.doesNotMatch(ui,/—/);
 assert.doesNotMatch(css,/\.zrain-footer\{background:/);
 assert.match(brand,/background: var\(--zrain-brand-paper\)/);
 assert.match(css,/\.category-card:focus-within/);
 assert.match(css,/prefers-reduced-motion/);
});

test('Console preserves the original viewing features and description per application',async()=>{
 const [html,js,css]=await Promise.all([read('../public/zrain-console.html'),read('../public/ecosystem-console.mjs'),read('../public/ecosystem-console.css')]);
 for(const id of ['console-mobile','console-desktop','console-reload','console-fullscreen','console-store','console-github','console-open','console-iframe','console-selected-icon','console-description','console-search','console-apps'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(js,/frame\.title=item\.name/);
 assert.match(js,/setView\(item.category==='play'\?'mobile':'desktop'\)/);
 assert.match(js,/frame\.style\.transform/);
 assert.match(js,/frame\.src='about:blank'/);
 assert.match(js,/sortedByName\(getActiveInventory\(\)\.filter/);
 assert.match(js,/GOOGLE_PLAY\[item\.id\]/);
 assert.match(js,/get\('console'\)/); // old ?console URL support documented in source
 assert.match(css,/#console-shell:fullscreen/);
 assert.doesNotMatch(html,/—/);
});

test('Admin inventory lists in alphabetical order, uses Console and keeps auth isolated',async()=>{
 const [admin,preview]=await Promise.all([read('../public/admin/unified-admin.mjs'),read('../public/admin-layout-preview.html')]);
 assert.match(admin,/getElementById\('dashboard'\)/);
 assert.match(admin,/sortedByName\(getActiveInventory\(\)\.filter/);
 assert.match(admin,/href=previewLinkHref\(item\)/);
 assert.match(admin,/const repo=repoHref\(item\)/);
 assert.match(admin,/read-only until the API supports unified entries/);
 assert.match(preview,/Design preview only/); // Updated v10 preview is interactive but non-persistent.
 assert.doesNotMatch(preview,/—/);
});
