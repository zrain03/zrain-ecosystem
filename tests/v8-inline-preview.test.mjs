/*
 * Fail / File: tests/v8-inline-preview.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan v8 inline preview, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests v8 inline preview contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {INVENTORY} from '../public/ecosystem-inventory.mjs';
import {searchCatalog} from '../public/ecosystem-search-engine.mjs';
import {previewLinkHref,consoleHref,getInventoryItem} from '../public/ecosystem-links.mjs';
// BM: read: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan v8 inline preview, output dan kes gagal tanpa membuat permintaan production.
// EN: read: Reads relevant records and returns a bounded result to the caller. Module purpose: tests v8 inline preview contracts, outputs and failure paths without making production requests.
const read=path=>readFile(new URL(path,import.meta.url),'utf8');

test('all 58 official Web App actions point at an inline preview entry, not the full Console page',()=>{
 for(const item of INVENTORY){
  assert.equal(previewLinkHref(item),' /#app='.trimStart()+encodeURIComponent(item.id));
  assert.equal(consoleHref(item),'/zrain-console.html?app='+encodeURIComponent(item.id));
 }
 assert.equal(previewLinkHref({id:INVENTORY[0].id}),null);
 assert.equal(getInventoryItem('not-listed'),null);
 const copied=searchCatalog('kecilkan gambar',{limit:1})[0];
 assert.equal(copied.id,'image-compressor');
 assert.notEqual(copied,getInventoryItem(copied.id));
 assert.equal(previewLinkHref(getInventoryItem(copied.id)),'/#app=image-compressor');
});
test('homepage keeps Console as an independent project, without a top navigation Console tab',async()=>{
 const [html,ui,quick,css,nav]=await Promise.all([
  read('../public/index.html'),read('../public/ecosystem-unified.mjs'),read('../public/ecosystem-quick-console.mjs'),
  read('../public/ecosystem-quick-console.css'),read('../public/ecosystem-nav.mjs')]);
 assert.match(html,/<dialog class="zrain-preview"/);
 assert.match(html,/id="zrain-preview-stage"/);
 for(const id of ['zrain-preview-mobile','zrain-preview-desktop','zrain-preview-reload','zrain-preview-fullscreen','zrain-preview-store','zrain-preview-close']) assert.match(html,new RegExp(`id="${id}"`));
 assert.doesNotMatch(html,/<nav class="main-nav"[^>]*>[^<]*<a[^>]+href="\/zrain-console\.html"/);
 assert.ok(html.includes('id="zrain-feedback" aria-label="Zrain Community feedback"'));
 assert.ok(html.includes('src="https://zrain-community.web.app/embed.js" data-product="zrain-ecosystem"'));
 assert.ok(!html.includes('src="/feedback-embed.js"'));
 assert.ok(html.indexOf('id="contact"')<html.indexOf('id="zrain-feedback"'));
 assert.ok(html.indexOf('id="zrain-feedback"')<html.indexOf('<footer'));
 assert.match(html,/Made for people\. Built with purpose\./);
 assert.match(ui,/data-preview-id|dataset.previewId/);
 assert.match(ui,/const canonical=getInventoryItem\(item.id\)/);
 assert.match(ui,/zrain:open-preview/);
 assert.match(quick,/frame\.src=destination\|\|'about:blank'/);
 assert.match(quick,/new ResizeObserver\(layoutFrame\)/);
 assert.match(quick,/history\.pushState/);
 assert.match(quick,/const searchDialog=get\('search-dialog'\)/);
 assert.match(css,/height:calc\(100dvh - 20px\)/);
 assert.match(nav,/aria-current/);
 assert.match(nav,/addEventListener\('scroll'/);
});
test('standalone Console retains Mobile/Desktop switching and has taller viewport',async()=>{
 const [page,js,style]=await Promise.all([read('../public/zrain-console.html'),read('../public/ecosystem-console.mjs'),read('../public/ecosystem-console.css')]);
 for(const id of ['console-mobile','console-desktop','console-store','console-reload','console-fullscreen','console-iframe'])assert.match(page,new RegExp(`id="${id}"`));
 assert.match(js,/setView\(item.category==='play'\?'mobile':'desktop'\)/);
 assert.match(style,/\.console-stage \{height:max\(700px,calc\(100dvh - 240px\)\)/);
});
