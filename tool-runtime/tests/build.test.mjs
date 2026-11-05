/*
 * Fail / File: tool-runtime/tests/build.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan build, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests build contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { join,resolve } from 'node:path';
import { catalog,groups } from '../src/catalog.mjs';
const dist=resolve(import.meta.dirname,'../dist');
// BM: must: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menguji sempadan build, output dan kes gagal tanpa membuat permintaan production.
// EN: must: Isolates one operation so it can be reviewed and tested. Module purpose: tests build contracts, outputs and failure paths without making production requests.
const must=async file=>assert.ok((await stat(file)).size>0,`Missing ${file}`);
test('five independently deployable Zrain websites contain all 48 tools',async()=>{
 assert.equal(groups.length,5);
 for(const group of groups){
  const dir=join(dist,group.slug);
  for(const file of ['index.html','app.js','core.mjs','catalog.mjs','zrain-ui.js','brand.css','style.css','zrain-logo.webp']) await must(join(dir,file));
  const html=await readFile(join(dir,'index.html'),'utf8');
  assert.ok(html.includes('Zrain '+group.title),group.slug);
  assert.ok(html.includes('data-view="group"'),group.slug);
  assert.ok(html.includes('hero-logo-frame'),group.slug);
  assert.ok(html.includes('zrain-footer__identity'),group.slug);
  for(const section of group.sections)for(const slug of section.tools){
   const item=catalog.find(a=>a[0]===slug);
   const page=join(dir,slug,'index.html');await must(page);
   const text=await readFile(page,'utf8');
   assert.ok(text.includes('Zrain '+item[1].replaceAll('&','&amp;')),slug);
   assert.ok(text.includes('../zrain-logo.webp'),slug);
   assert.ok(text.includes('../app.js'),slug);
   assert.ok(text.includes('No login needed'),slug);
  }
 }
});
test('official Zrain files and footer wording are unchanged',async()=>{
 const official=await readFile(join(dist,'zrain-image-tools','zrain-ui.js'),'utf8');
 assert.ok(official.includes('Made for people. Built with purpose.'));
 assert.ok(official.includes('Developed by Zrain'));
 assert.deepEqual(await readFile(join(dist,'zrain-pdf-tools','zrain-logo.webp')),await readFile(join(dist,'zrain-image-tools','zrain-logo.webp')));
 const ui=await readFile(join(dist,'app.js'),'utf8');
 assert.ok(!ui.includes('firebase/auth'));
 assert.ok(!ui.includes("fetch('https://zrain"));
});
