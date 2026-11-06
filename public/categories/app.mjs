/*
 * Fail / File: public/categories/app.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Memaparkan semua kategori rasmi, pilihan item dan carian di halaman Categories.
 * EN: Renders the canonical categories, entries and search on the Categories page.
 */
import {CATEGORIES,resolvePortfolio,slugify,TOTAL_ITEMS} from './category-data.mjs';

const categoryNav = document.querySelector('#category-filter');
const content = document.querySelector('#category-content');
const search = document.querySelector('#search');
const count = document.querySelector('#result-count');
const status = document.querySelector('#source-status');
let active='all';
let portfolio=resolvePortfolio();

// BM: loadLiveInventory: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: memaparkan semua kategori rasmi, pilihan item dan carian di halaman Categories.
// EN: loadLiveInventory: Reads relevant records and returns a bounded result to the caller. Module purpose: renders the canonical categories, entries and search on the Categories page.
async function loadLiveInventory(){
  const rows=[];
  // Latest Zrain Ecosystem local inventory (46 v2.4 tools and project entries).
  try {
    const mod=await import('../ecosystem-inventory.mjs');
    if(Array.isArray(mod.INVENTORY))rows.push(...mod.INVENTORY);
  }catch{ /* Older deployments may not include this module. */ }
  // Earlier public directory: use its actual family roots and tool slugs.
  try {
    const mod=await import('../tools-directory-data.js');
    if(Array.isArray(mod.FAMILIES)&&Array.isArray(mod.TOOLS)){
      const families=new Map(mod.FAMILIES.map(x=>[x.slug,x]));
      for(const t of mod.TOOLS){
        const f=families.get(t.family);
        if(f?.url && t.slug)rows.push({name:t.name,slug:t.slug,url:new URL(t.slug+'/',f.url).href});
      }
    }
  }catch{}
  // Optional published product catalog. No admin tokens, no write operations.
  try {
    const mod=await import('../product-catalog-client.js');
    if(typeof mod.fetchPublicCatalog==='function'){
      const products=await mod.fetchPublicCatalog();
      if(Array.isArray(products))rows.push(...products);
    }
  }catch{}
  return rows;
}

// BM: el: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memaparkan semua kategori rasmi, pilihan item dan carian di halaman Categories. Input: tag,cls,text.
// EN: el: Isolates one operation so it can be reviewed and tested. Module purpose: renders the canonical categories, entries and search on the Categories page. Inputs: tag,cls,text.
function el(tag,cls,text){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!==undefined)node.textContent=String(text);
  return node;
}
// BM: renderFilters: Menyelaraskan UI dan state tanpa menggandakan event handler atau mencipta elemen tidak diperlukan. Tujuan modul: memaparkan semua kategori rasmi, pilihan item dan carian di halaman Categories.
// EN: renderFilters: Synchronizes UI and state without duplicating handlers or unnecessary elements. Module purpose: renders the canonical categories, entries and search on the Categories page.
function renderFilters(){
  categoryNav.replaceChildren();
  for(const item of [{id:'all',name:'All Categories',items:Array(TOTAL_ITEMS).fill(null)},...CATEGORIES]){
    const b=el('button','filter',item.name+' ('+item.items.length+')');
    b.type='button';b.dataset.category=item.id;
    b.setAttribute('aria-pressed',String(item.id===active));
    // BM: Event click: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
    // EN: click event: handle interaction without mutating source data or bypassing module validation.
    b.addEventListener('click',()=>{active=item.id;renderFilters();render()});
    categoryNav.append(b);
  }
}
function render(){
  const q=slugify(search.value);
  let matches=0;
  const fragment=document.createDocumentFragment();
  for(const group of portfolio){
    if(active!=='all' && active!==group.id)continue;
    const filtered=group.items.filter(item => !q || slugify(item.name).includes(q) || slugify(group.name).includes(q));
    if(!filtered.length)continue;
    matches+=filtered.length;
    const section=el('section','category');
    section.id='cat-'+group.id;
    section.setAttribute('aria-label',group.name);
    const heading=el('div','category-heading');
    const title=el('h2','',group.name);
    const badge=el('span','category-count',String(filtered.length));
    const desc=el('p','category-desc',group.description);
    heading.append(title,badge);section.append(heading,desc);
    const grid=el('div','items');
    for(const item of filtered){
      const card=el(item.url?'a':'div','item');
      if(item.url){card.href=item.url;if(!item.url.startsWith('/')){card.target='_blank';card.rel='noopener noreferrer'}}
      else card.classList.add('unlinked');
      const txt=el('strong','',item.name);
      const meta=el('span','item-meta',item.url?'Open product':'Website link not confirmed');
      card.append(txt,meta);grid.append(card);
    }
    section.append(grid);fragment.append(section);
  }
  if(!matches)fragment.append(el('p','empty','No matching products. Try another search.'));
  content.replaceChildren(fragment);
  count.textContent=matches+' of '+TOTAL_ITEMS+' products and tools';
}

renderFilters();render();
loadLiveInventory().then(rows=>{
  portfolio=resolvePortfolio(rows);
  const linked=portfolio.reduce((sum,c)=>sum+c.items.filter(i=>i.url).length,0);
  status.textContent=linked+' links found in project data or known project records. Availability has not been live-checked.';
  render();
}).catch(()=>{status.textContent='Showing the complete category index. Some links are not yet confirmed.'});
// BM: Event input: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
// EN: input event: handle interaction without mutating source data or bypassing module validation.
search.addEventListener('input',render);
