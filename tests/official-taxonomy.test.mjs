/**
 * Fail / File: tests/official-taxonomy.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Lindungi 58 item, 11 kategori, mapping Worker dan scroll lima item.
 * EN: Protect 58 items, 11 categories, Worker mappings and five-item scroll.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {INVENTORY,CATEGORIES} from '../public/ecosystem-inventory.mjs';
import {CATEGORIES as OFFICIAL,validateTaxonomy,slugify} from '../public/categories/category-data.mjs';
import {categoryFromWorker,categoryToWorker} from '../public/admin/manage-core.mjs';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
test('58 unique entries are distributed under the canonical 11 categories',()=>{
 assert.equal(validateTaxonomy(),true);
 assert.equal(INVENTORY.length,58);
 assert.equal(CATEGORIES.length,11);
 assert.equal(INVENTORY.filter(x=>x.kind==='project').length,10);
 assert.equal(INVENTORY.filter(x=>x.kind==='tool').length,48);
 assert.deepEqual(CATEGORIES.map(c=>c.id),OFFICIAL.map(c=>c.id));
 const names=INVENTORY.map(x=>slugify(x.name));
 assert.equal(new Set(names).size,58);
 for(const c of OFFICIAL){
  assert.deepEqual(INVENTORY.filter(x=>x.category===c.id).map(x=>slugify(x.name)).sort(),c.items.map(slugify).sort());
 }
});
test('all category codes round-trip and legacy products retain their known categories',()=>{
 for(const c of CATEGORIES)assert.equal(categoryFromWorker(categoryToWorker(c.id)),c.id);
 assert.equal(categoryFromWorker('ONLINE_SERVICES','links'),'links');
 assert.equal(categoryFromWorker('DEVELOPER_TOOLS','monitoring'),'monitoring');
});
test('homepage generates category jumps and caps each list after five visible rows',async()=>{
 const ui=await read('../public/ecosystem-unified.mjs');
 const html=await read('../public/index.html');
 assert.match(ui,/CATEGORIES\.map\(renderCategory\)/);
 assert.match(ui,/querySelectorAll\('\.category-item'\)/);
 assert.match(ui,/items\.length<=5/);
 assert.match(ui,/fifth\.bottom-first\.top/);
 assert.match(html,/id="count-total">58/);
 assert.match(html,/id="count-categories">11/);
 assert.match(html,/id="category-jumps"/);
});

// BM: Dua komponen shared UI pada Tools mesti sama byte demi byte dengan root Golden Reference.
// EN: Tool shared UI copies must be byte-for-byte equal to the root Golden Reference assets.
test('all five Tools families use the same Golden Reference source components',async()=>{
 const readBinary=p=>readFile(new URL(p,import.meta.url));
 for(const file of ['brand.css','zrain-ui.js','zrain-logo.webp']){
  const root=await readBinary('../public/'+file);
  const tool=await readBinary('../tool-runtime/src/'+file);
  assert.deepEqual(tool,root,'Tool source copy diverged: '+file);
 }
 const packageJson=JSON.parse(await read('../package.json'));
 assert.match(packageJson.dependencies['@zrain/ui'],/a109401fa591afa9f66479fa8d86f1ed1679d70b/);
});
