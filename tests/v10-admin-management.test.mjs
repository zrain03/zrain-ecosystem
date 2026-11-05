/*
 * Fail / File: tests/v10-admin-management.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan v10 admin management, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests v10 admin management contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {WORKER_CATEGORIES,categoryFromWorker,categoryToWorker,visibleManagedProject} from '../public/admin/manage-core.mjs';
import {INVENTORY} from '../public/ecosystem-inventory.mjs';
import {reconcilePublishedCatalog,inventoryStats} from '../public/ecosystem-catalog.mjs';
// BM: read: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan v10 admin management, output dan kes gagal tanpa membuat permintaan production.
// EN: read: Reads relevant records and returns a bounded result to the caller. Module purpose: tests v10 admin management contracts, outputs and failure paths without making production requests.
const read=p=>readFile(new URL(p,import.meta.url),'utf8');

test('11 official admin category codes round-trip through the Worker schema',()=>{
 const cases={GAMES:'games',AI:'ai',INFRASTRUCTURE:'infrastructure',PRESENCE:'links',OPERATIONS:'monitoring',PDF:'pdf',IMAGES:'image',DOCUMENTS:'document',CREATIVE:'art',DEVELOPER:'developer',PRODUCTIVITY:'productivity'};
 for(const [code,id] of Object.entries(cases)){
  assert.equal(categoryFromWorker(code),id);
  assert.equal(categoryToWorker(id),code);
 }
 assert.equal(categoryFromWorker('ONLINE_SERVICES','links'),'links');
 assert.equal(categoryFromWorker('DEVELOPER_TOOLS','monitoring'),'monitoring');
 assert.equal(WORKER_CATEGORIES.GAMES,'games');
});
test('a new published application appears in its chosen official category',()=>{
 for(const [category,expected] of Object.entries({GAMES:'games',AI:'ai',PRESENCE:'links',IMAGES:'image',DOCUMENTS:'document',DEVELOPER:'developer'})){
  const result=reconcilePublishedCatalog([{slug:'new-project',name:'New project',description:'Real web app',category,status:'PUBLISHED',primaryAction:'WEBSITE',primaryUrl:'https://example.com/app'}]);
  assert.equal(result.find(p=>p.id==='new-project')?.category,expected);
  assert.equal(inventoryStats(result).total,50);
 }
});
test('admin changes to an explicit new category are preserved',()=>{
 const next=reconcilePublishedCatalog([{slug:'zrain-links',name:'Zrain Links',description:'Links',category:'DEVELOPER',status:'PUBLISHED',primaryAction:'WEBSITE',primaryUrl:'https://zrain-links.web.app/'}]);
 assert.equal(next.find(p=>p.id==='zrain-links')?.category,'developer');
});
test('old family websites never double count as projects',()=>{
  assert.equal(visibleManagedProject({slug:'zrain-image-tools',status:'PUBLISHED'}),false);
  assert.equal(visibleManagedProject({slug:'zrain-gifts',status:'DRAFT'}),true);
  assert.equal(visibleManagedProject({slug:'zrain-gifts',status:'ARCHIVED'}),true);
});
test('new admin is a real protected editor, demo is visibly marked as non-persistent',async()=>{
  const [live,preview,script,styles]=await Promise.all([
    read('../public/admin/index.html'),read('../public/admin-layout-preview.html'),
    read('../public/admin/manage.mjs'),read('../public/admin/manage.css')
  ]);
  assert.match(live,/data-admin-mode="live"/);
  assert.match(preview,/data-admin-mode="preview"/);
  assert.match(preview,/not saved to Cloudflare or GitHub/);
  assert.match(live,/id="admin-login"/);
  assert.match(live,/id="admin-dashboard" hidden/);
  assert.match(script,/\/api\/admin\/auth\/login/);
  assert.match(script,/\/api\/admin\/products/);
  assert.match(script,/\/api\/admin\/auth\/password/);
  assert.match(script,/jwt \? \{ Authorization: 'Bearer '/);
  assert.doesNotMatch(script,/localStorage|sessionStorage/);
  assert.doesNotMatch(script,/\.innerHTML\s*=/);
  assert.match(styles,/\.admin-columns/);
  for(const c of ['GAMES','AI','INFRASTRUCTURE','PRESENCE','OPERATIONS','PDF','IMAGES','DOCUMENTS','CREATIVE','DEVELOPER','PRODUCTIVITY'])assert.ok(live.includes(`value="${c}"`));
});
test('all existing 48 tools still exist and are never editable via old project CRUD',async()=>{
  assert.equal(INVENTORY.filter(x=>x.kind==='tool').length,48);
  const admin=await read('../public/admin/manage.mjs');
  assert.match(admin,/item\.kind === 'project'/);
  assert.match(admin,/Source-managed/);
  assert.match(admin,/sourceTools/);
});
