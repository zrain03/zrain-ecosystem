/*
 * Fail / File: tests/v9-dynamic-catalog.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan v9 dynamic catalog, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests v9 dynamic catalog contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {INVENTORY} from '../public/ecosystem-inventory.mjs';
import {getActiveInventory,inventoryStats,setPublishedCatalog,reconcilePublishedCatalog,subscribeCatalog,refreshPublicCatalog} from '../public/ecosystem-catalog.mjs';
import {searchCatalog} from '../public/ecosystem-search-engine.mjs';
import {getInventoryItem,previewLinkHref,previewHref} from '../public/ecosystem-links.mjs';

const sourceProjects=INVENTORY.filter(x=>x.kind==='project');
import {CATEGORY_CODES} from '../public/admin/manage-core.mjs';
const category=CATEGORY_CODES;
const published=sourceProjects.map(x=>({
  slug:x.id,name:x.name,description:x.description,category:category[x.category],
  status:'PUBLISHED',primaryAction:'WEBSITE',primaryUrl:x.url
}));
const added={slug:'zrain-new-service',name:'Zrain New Service',description:'Discover an additional independent public application.',
  category:'PRODUCTIVITY',status:'PUBLISHED',primaryAction:'WEBSITE',primaryUrl:'https://example.com/new-service/'};

test('initial alpha snapshot counts are computed, not hardcoded in the counting module',()=>{
 const v=inventoryStats(INVENTORY);
 assert.equal(v.projects,10);assert.equal(v.tools,48);assert.equal(v.total,58);
 assert.deepEqual(v.byCategory,{games:2,ai:1,infrastructure:3,links:4,monitoring:2,pdf:13,image:11,document:7,art:5,developer:7,productivity:3});
});
test('admin adds a Published project: totals and category choices change everywhere',()=>{
 const list=reconcilePublishedCatalog([...published,added]);
 const s=inventoryStats(list);
 assert.equal(s.projects,11);assert.equal(s.tools,48);assert.equal(s.total,59);
 assert.equal(s.byCategory.productivity,4);
 assert.ok(list.some(x=>x.id==='zrain-new-service'));
});
test('unpublishing, archiving or deleting a product removes it from public counts',()=>{
 const rows=published.filter(x=>x.slug!=='memory-rush');
 rows.push({...added,status:'DRAFT'});
 const list=reconcilePublishedCatalog(rows);
 const s=inventoryStats(list);
 assert.equal(s.projects,9);assert.equal(s.total,57);assert.equal(s.byCategory.games,1);
 assert.ok(!list.some(x=>x.id==='zrain-new-service'));
 assert.ok(!list.some(x=>x.id==='memory-rush'));
});
test('legacy tool family products, invalid destinations and duplicate slugs cannot inflate catalogue',()=>{
 const rows=[...published,
  {...added,slug:'zrain-image-tools'},
  {...added,slug:'zrain-pdf-tools'},
  {...added,primaryUrl:'javascript:alert(1)'},
  {...added,status:'ARCHIVED'},
  {...added,slug:'merge-pdf',primaryUrl:'https://example.com/malicious'},
 ];
 const list=reconcilePublishedCatalog(rows);
 assert.equal(inventoryStats(list).total,58);
 assert.equal(list.filter(x=>x.id==='merge-pdf').length,1);
 assert.throws(()=>reconcilePublishedCatalog({products:rows}),/array/);
});
test('published catalogue changes canonical preview allowlist and global search results',()=>{
 const changes=[];const stop=subscribeCatalog((rows,stats)=>changes.push(stats.total));
 try {
   setPublishedCatalog([...published,added]);
   assert.equal(getActiveInventory().length,59);
   assert.equal(searchCatalog('new service')[0].id,'zrain-new-service');
   const gift=getInventoryItem('zrain-new-service');
   assert.ok(gift);
   assert.equal(previewLinkHref(gift),'/#app=zrain-new-service');
   assert.equal(previewHref(gift),'https://example.com/new-service/');
   setPublishedCatalog(published.filter(x=>x.slug!=='memory-rush'));
   assert.equal(getInventoryItem('memory-rush'),null);
   assert.equal(inventoryStats().total,57);
   assert.deepEqual(changes,[59,57]);
 } finally {stop();setPublishedCatalog(published);}
});
test('a successful public API fetch updates the catalogue without requiring private credentials',async()=>{
 // BM: fake: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menguji sempadan v9 dynamic catalog, output dan kes gagal tanpa membuat permintaan production. Input: url,options.
 // EN: fake: Isolates one operation so it can be reviewed and tested. Module purpose: tests v9 dynamic catalog contracts, outputs and failure paths without making production requests. Inputs: url,options.
 const fake=async(url,options)=>{
   assert.ok(url.endsWith('/api/catalog'));
   assert.equal(options.headers.Accept,'application/json');
   assert.equal(options.cache,'no-store');
   assert.ok(!('Authorization' in options.headers));
   return {ok:true,json:async()=>[...published,added]};
 };
 const result=await refreshPublicCatalog(fake,{minAge:0});
 assert.equal(result.total,59);
 setPublishedCatalog(published);
});
test('real homepage, Console, search and admin use the shared catalogue',async()=>{
 // BM: read: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan v9 dynamic catalog, output dan kes gagal tanpa membuat permintaan production.
 // EN: read: Reads relevant records and returns a bounded result to the caller. Module purpose: tests v9 dynamic catalog contracts, outputs and failure paths without making production requests.
 const read=p=>readFile(new URL(p,import.meta.url),'utf8');
 const [html,home,consoleJs,admin,search,nav,inlineCss]=await Promise.all([
  read('../public/index.html'),read('../public/ecosystem-unified.mjs'),
  read('../public/ecosystem-console.mjs'),read('../public/admin/unified-admin.mjs'),
  read('../public/ecosystem-search-engine.mjs'),read('../public/ecosystem-nav.mjs'),
  read('../public/ecosystem-quick-console.css')
 ]);
 for(const id of ['count-projects','count-tools','count-total','about-total'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(home,/subscribeCatalog/);assert.match(home,/renderAllCategories/);
 assert.match(consoleJs,/getActiveInventory/);assert.match(admin,/inventoryStats/);
 assert.match(search,/getActiveInventory/);
 assert.match(nav,/scrollToAnchor/);assert.match(nav,/MutationObserver/);
 assert.match(inlineCss,/flex:1 1 0/);
});
