/*
 * Fail / File: public/admin/unified-admin.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (rekod penciptaan asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menapis senarai admin read-only menggunakan semua sebelas kategori aktif.
 * EN: Filters the read-only admin directory using all eleven active categories.
 */
/**
 * Unified Ecosystem inventory INSIDE the existing authenticated admin dashboard.
 * It does not replace sign-in, JWT handling, password settings or the real CRUD.
 * Static 48-tool build configuration cannot be published or unpublished by the
 * old backend, which only knows projects, so no fake persistence is offered.
 */
import { CATEGORIES } from '../ecosystem-inventory.mjs';
import {getActiveInventory,inventoryStats,subscribeCatalog,connectCatalogRefresh} from '../ecosystem-catalog.mjs';
import {sortedByName,logoFor,repoHref,previewLinkHref} from '../ecosystem-links.mjs';

const host = document.getElementById('dashboard') || document.getElementById('admin-demo-dashboard');
if (host) {
  const el = (tag, cls='', value) => { const n=document.createElement(tag); if(cls)n.className=cls; if(value!==undefined)n.textContent=value; return n; };
  const panel=el('section','unified-admin-panel');
  panel.id='unified-admin-management';
  panel.setAttribute('aria-labelledby','unified-admin-title');
  const top=el('div','unified-admin-title-row');
  const h=el('div');
  h.append(el('p','unified-admin-eyebrow','ZRAIN ECOSYSTEM · UNIFIED CATALOGUE'),el('h2','', 'All projects & tools'));
  const description=el('p','unified-admin-muted','Browse the current published destinations by category. Manage standalone projects in the authenticated editor below.');
  h.append(description);
  const website=el('a','unified-admin-link','Preview homepage ↗');website.href='/';website.target='_blank';website.rel='noopener noreferrer';
  top.append(h,website);
  const quicknav=el('nav','unified-admin-quicknav');
  quicknav.setAttribute('aria-label','Admin workspace navigation');
  for(const [href,title] of [
    ['#unified-admin-management','Overview & catalogue'],
    ['#product-list','Manage published products'],
    ['#product-form','Edit existing product'],
    ['#password-settings','Account settings'],
    ['/#categories','Public homepage']
  ]) {
    const a=el('a','',title);a.href=href;quicknav.append(a);
  }
  const stats=el('div','unified-admin-stats');
  const values=[['0','Catalogue entries'],['0','Independent applications'],['0','Browser tools'],['0','Categories']];
  for(const [v,label] of values){const c=el('div','unified-admin-stat');c.append(el('strong','',v),el('span','',label));stats.append(c);}
  const warning=el('p','unified-admin-warning','Publishing status: the 48 tool pages are source-managed in this alpha. The existing product database controls standalone product entries, not 48 individual tool records. This panel is read-only until the API supports unified entries.');
  const filters=el('div','unified-admin-filters');
  const search=el('input','unified-admin-search');search.type='search';search.placeholder='Search the current catalogue';search.setAttribute('aria-label','Search catalogue');
  const category=el('select','unified-admin-select');category.setAttribute('aria-label','Filter category');
  const opts=[['all','All 11 categories'],...CATEGORIES.map(v=>[v.id,v.title])];
  for(const [id,label] of opts){const opt=el('option','',label);opt.value=id;category.append(opt);}
  const kind=el('select','unified-admin-select');kind.setAttribute('aria-label','Filter entry type');
  for(const [id,label] of [['all','All types'],['project','Projects'],['tool','Tools']]){const opt=el('option','',label);opt.value=id;kind.append(opt);}
  filters.append(search,category,kind);
  const counts=el('p','unified-admin-count');counts.setAttribute('aria-live','polite');
  const rows=el('div','unified-admin-rows');
  function render(){
    const q=search.value.trim().toLocaleLowerCase();
    const match=sortedByName(getActiveInventory().filter(item=>(category.value==='all'||item.category===category.value)&&
      (kind.value==='all'||item.kind===kind.value)&&
      (!q||[item.name,item.description,item.keywords].join(' ').toLocaleLowerCase().includes(q))));
    const frag=document.createDocumentFragment();
    for(const item of match){
      const row=el('div','unified-admin-row');
      const img=el('img');img.width=34;img.height=34;img.alt='';
      img.src=logoFor(item);
      img.addEventListener('error',()=>{img.src='/zrain-logo.webp';},{once:true});
      const body=el('div','unified-admin-row-main');body.append(el('strong','',item.name),el('small','',item.description));
      const tag=el('span','unified-admin-tag',CATEGORIES.find(x=>x.id===item.category)?.title||item.category);
      const status=el('span','unified-admin-status',item.kind==='tool'?'Source-managed':'Independent app');
      const href=el('a','unified-admin-link','Preview Web App');href.href=previewLinkHref(item);href.target='_blank';href.rel='noopener noreferrer';
      const repo=repoHref(item);
      row.append(img,body,tag,status,href);
      if(repo){const link=el('a','unified-admin-link','GitHub ↗');link.href=repo;link.target='_blank';link.rel='noopener noreferrer';row.append(link);}
      frag.append(row);
    }
    if(!match.length)frag.append(el('p','unified-admin-muted','No matching entries.'));
    rows.replaceChildren(frag);
    counts.textContent=match.length+' of '+inventoryStats().total+' entries';
  }
  [search,category,kind].forEach(c=>c.addEventListener('input',render));
  const updateStats=()=>{
    const snapshot=inventoryStats();
    [snapshot.total,snapshot.projects,snapshot.tools,snapshot.categories].forEach((value,index)=>{
      stats.children[index]?.querySelector('strong') && (stats.children[index].querySelector('strong').textContent=String(value));
    });
    render();
  };
  subscribeCatalog(updateStats);
  panel.append(top,quicknav,stats,warning,filters,counts,rows);
  // The section is mounted within #dashboard, which original admin.js shows
  // only AFTER the administrator is authenticated. No authorization bypass.
  host.insertBefore(panel, host.querySelector('.admin-grid') || null);
  updateStats();
  connectCatalogRefresh();
}
