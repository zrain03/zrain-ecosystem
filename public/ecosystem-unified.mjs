/*
 * Fail / File: public/ecosystem-unified.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (rekod penciptaan asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Memaparkan accordion responsif dan kad ringkas dengan satu scroll halaman pada mobile.
 * EN: Renders responsive accordion categories with compact cards and one mobile page scroller.
 */
import { CATEGORIES } from './ecosystem-inventory.mjs';
import {getActiveInventory,inventoryStats,subscribeCatalog,connectCatalogRefresh} from './ecosystem-catalog.mjs';
import { searchCatalog } from './ecosystem-search-engine.mjs';
import {logoFor,repoHref,previewLinkHref,sortedByName,getInventoryItem} from './ecosystem-links.mjs';

const byId = id => document.getElementById(id);
const categoryBoard = byId('category-board');
const homeInput = byId('home-search-input');
const preview = byId('search-preview');
const more = byId('search-more');
const dialog = byId('search-dialog');
const dialogInput = byId('dialog-input');
const results = byId('dialog-results');
const count = byId('dialog-count');
const aiStatus = byId('ai-status');
const aiButton = byId('ai-enable');
const filters = [...document.querySelectorAll('[data-filter]')];
let kind = 'all';
let focusReturn = null;
let modelWorker = null;
let aiReady = false;
let pending = 0;
let aiResults = [];
let aiInput = '';
let modelInitTimer;

function el(tag, className='', text) {
  const element = document.createElement(tag);
  if (className) element.className=className;
  if (text !== undefined) element.textContent=text;
  return element;
}
// Every Web App action opens the original-style inline Console modal.
// The full Console remains an independent Zrain project in the catalog.
const categoryContainers = new Map();
const categoryAi = new Map();
function toolOrProjectAction(item) {
  const actions = el('span', 'entry-actions');
  const route = previewLinkHref(item);
  if (route) {
    const web = el('a', 'entry-action entry-web', 'Web App ↗');
    web.href = route;
    web.dataset.previewId=item.id;
    web.setAttribute('aria-label', 'Preview ' + item.name + ' without leaving this page');
    actions.append(web);
  }
  const repository = repoHref(item);
  if (repository) {
    const github = el('a','entry-action entry-github','GitHub ↗');
    github.href = repository;
    github.target = '_blank';
    github.rel = 'noopener noreferrer';
    github.setAttribute('aria-label','View ' + item.name + ' on GitHub');
    actions.append(github);
  }
  return actions;
}
function imageFor(item) {
  const img=el('img','entry-logo');
  img.src=logoFor(item);
  img.alt=['guess-the-flag','memory-rush'].includes(item.id) ? item.name + ' game icon' : 'Zrain logo';
  img.width=34;img.height=34;img.loading='lazy';img.decoding='async';
  img.addEventListener('error',()=>{img.src='/zrain-logo.webp';},{once:true});
  return img;
}
function resultRow(item, className='category-item') {
  // Search returns ranked copies. Resolve to the canonical allowlisted entry
  // before generating links, rather than relying on object identity.
  const canonical=getInventoryItem(item.id);
  if (!canonical) throw new Error('Unknown Zrain catalogue item');
  const row=el('article',className+' '+item.kind);
  const body=el('div','category-item-copy');
  const title=el('a','entry-title-link',item.name);
  title.href=previewLinkHref(canonical);
  title.dataset.previewId=canonical.id;
  title.setAttribute('aria-label','Preview '+item.name);
  const desc=el('small','',item.description);
  body.append(title,desc,toolOrProjectAction(canonical));
  row.append(imageFor(item),body);
  return row;
}
// BM: Simpan status kategori walaupun senarai Published berubah semasa pengguna melayari halaman.
// EN: Preserve category open/expanded state across Published catalog refreshes.
const categoryStates = new Map();
function renderCategory(category) {
  const records = sortedByName(getActiveInventory().filter(item => item.category === category.id));
  const mobile = window.matchMedia('(max-width: 580px)').matches;
  const state = categoryStates.get(category.id) || {open:!mobile,all:mobile};
  categoryStates.set(category.id,state);
  const article = el('section','category-card');
  article.id='category-'+category.id;
  article.dataset.category=category.id;
  article.setAttribute('aria-label',category.title+' category');
  const heading=el('div','category-card-top');
  const toggle=el('button','category-toggle');
  toggle.type='button';
  toggle.setAttribute('aria-controls','category-content-'+category.id);
  const icon=el('span','category-card-icon',category.icon);
  icon.setAttribute('aria-hidden','true');
  const titleBlock=el('span','category-toggle-copy');
  titleBlock.append(el('span','category-toggle-title',category.title),el('span','category-card-count',records.length+' choices'));
  const chevron=el('span','category-toggle-chevron','⌄');
  chevron.setAttribute('aria-hidden','true');
  toggle.append(icon,titleBlock,chevron);
  heading.append(toggle,el('p','category-card-description',category.blurb));
  const body=el('div','category-content');
  body.id='category-content-'+category.id;
  const form=el('form','category-search-form');
  form.setAttribute('role','search');
  const label=el('label','visually-hidden','Search within '+category.title);
  const search=el('input','category-search');
  search.type='search';
  search.placeholder='Find in '+category.title+'...';
  search.setAttribute('aria-label','Find a task in '+category.title);
  search.autocomplete='off';
  const list=el('div','category-card-list');
  list.setAttribute('aria-live','polite');
  const more=el('button','category-reveal');
  more.type='button';
  function setExpanded(open){
    state.open=open;
    article.dataset.expanded=String(open);
    toggle.setAttribute('aria-expanded',String(open));
    body.hidden=!open;
  }
  // BM: Mobile tidak mempunyai scroll menegak bersarang. Membuka kategori mengembangkan halaman.
  // EN: Mobile has no nested vertical scroll. Expanding a category grows the page naturally.
  function draw(query='') {
    const matching=query.trim() ?
      searchCatalog(query,{limit:getActiveInventory().length}).filter(item=>item.category===category.id) : records;
    const semantic=categoryAi.get(category.id);
    let ranked=matching;
    if(query.trim() && semantic?.query===query.trim()){
      const ids=new Map(records.map(item=>[item.id,item]));
      const aiMatches=semantic.ranked.filter(v=>v.score>0.35&&ids.has(v.id)).map(v=>ids.get(v.id));
      ranked=[...new Map([...matching.slice(0,2),...aiMatches,...matching].map(item=>[item.id,item])).values()];
    }
    const allVisible=mobile||state.all||Boolean(query.trim());
    const shown=allVisible ? ranked : ranked.slice(0,5);
    list.replaceChildren(...shown.map(item=>resultRow(item)));
    if(!ranked.length){
      const empty=el('div','category-empty','No exact match here. Try the global Zrain AI Search.');
      const button=el('button','category-search-global','Search all categories ↗');
      button.type='button';
      button.addEventListener('click',()=>openDialog(query));
      empty.append(button);list.append(empty);
    }
    more.hidden=mobile || Boolean(query.trim()) || ranked.length<=5;
    more.textContent=state.all?'Show fewer':'Show all '+ranked.length;
    more.setAttribute('aria-expanded',String(state.all));
  }
  toggle.addEventListener('click',()=>setExpanded(!state.open));
  more.addEventListener('click',()=>{state.all=!state.all;draw(search.value);});
  let categoryTimer;
  search.addEventListener('input',()=>{
    categoryAi.delete(category.id);
    draw(search.value);
    if(aiReady&&search.value.trim()){
      clearTimeout(categoryTimer);
      categoryTimer=setTimeout(()=>requestAi(search.value.trim(),category.id),450);
    }
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const top=searchCatalog(search.value,{category:category.id,limit:1})[0];
    if(search.value.trim()&&top)document.dispatchEvent(new CustomEvent('zrain:open-preview',{detail:{id:top.id,trigger:search}}));
    else draw(search.value);
  });
  form.append(label,search);
  body.append(form,list,more);
  article.append(heading,body);
  setExpanded(state.open);
  draw();
  categoryContainers.set(category.id,{article,draw,search,setExpanded});
  return article;
}
function renderAllCategories() {
  // BM: Jangan simpan pautan kategori lama apabila katalog di-refresh.
  // EN: Avoid stale category links when the public catalogue refreshes.
  const jumpNav=byId('category-jumps');
  if(jumpNav)jumpNav.replaceChildren(...CATEGORIES.map(category=>{
    const link=el('a','',category.title);
    link.href='#category-'+category.id;
    link.addEventListener('click',()=>categoryContainers.get(category.id)?.setExpanded(true));
    return link;
  }));
  categoryContainers.clear();
  categoryAi.clear();
  categoryBoard.replaceChildren(...CATEGORIES.map(renderCategory));
}
function updateCounts() {
  const stats=inventoryStats();
  const assign=(id,n)=>{const node=byId(id);if(node)node.textContent=String(n);};
  assign('count-projects',stats.projects);
  assign('count-tools',stats.tools);
  assign('count-categories',stats.categories);
  assign('count-total',stats.total);
  assign('about-total',stats.total);
  const totalButton=byId('browse-search');
  if(totalButton)totalButton.setAttribute('aria-label','Search all '+stats.total+' Zrain choices');
}
renderAllCategories();
updateCounts();
subscribeCatalog(()=>{
  renderAllCategories();
  updateCounts();
  if(dialog?.open)renderDialog();
  if (aiReady && modelWorker) modelWorker.postMessage({type:'reindex',items:getActiveInventory().map(({id,name,description,keywords})=>({id,text:[name,description,keywords].join('. ')}))});
  if(!preview.hidden && homeInput.value.trim())showPreview(homeInput.value.trim());
});
connectCatalogRefresh();

// Gentle highlight on scroll. No content is hidden before JavaScript starts.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) { entry.target.classList.add('seen'); observer.unobserve(entry.target); }
    }
  }, {threshold:0.12,rootMargin:'0px 0px -30px 0px'});
  document.querySelectorAll('.category-card,.about-panel,.contact-panel,.journey-panel').forEach(node => observer.observe(node));
}

function showPreview(query) {
  const found=searchCatalog(query,{limit:5});
  const fragment=document.createDocumentFragment();
  for(const item of found) fragment.append(resultRow(item,'search-mini'));
  if(!found.length)fragment.append(el('p','search-explainer','No matching tools found. Try another description.'));
  preview.replaceChildren(fragment);
  preview.hidden=false;
  more.hidden=true;
}
function searchHome() {
  const q=homeInput.value.trim();
  if(!q){preview.hidden=true;more.hidden=true;return;}
  showPreview(q);
}
homeInput.addEventListener('input',searchHome);
homeInput.addEventListener('keydown',event=>{
  if(event.key==='Enter'){
    event.preventDefault();
    const top=searchCatalog(homeInput.value,{limit:1})[0];
    if(top) document.dispatchEvent(new CustomEvent('zrain:open-preview',{detail:{id:top.id,trigger:homeInput}}));
    else openDialog(homeInput.value);
  }
});
byId('search-submit').addEventListener('click',()=>openDialog(homeInput.value));
more.addEventListener('click',()=>openDialog(homeInput.value));
for(const example of document.querySelectorAll('[data-example]')){
  example.addEventListener('click',()=>{homeInput.value=example.dataset.example;searchHome();homeInput.focus();});
}

function fillFilters(){for(const button of filters)button.setAttribute('aria-pressed',String(button.dataset.filter===kind));}
function renderDialog() {
  fillFilters();
  const query=dialogInput.value;
  const ranked=searchCatalog(query,{limit:getActiveInventory().length,kind});
  const aiOnThisQuery=aiReady && aiInput===query && aiResults.length>0 && query.trim().length>0;
  let finalRanked=ranked;
  if(aiOnThisQuery) {
    const byId=new Map(ranked.map(v=>[v.id,v]));
    const semantic=aiResults.filter(v=>byId.has(v.id)).map(v=>byId.get(v.id));
    const top=semantic.filter(v=>aiResults.find(x=>x.id===v.id)?.score>0.35);
    const primary=ranked.slice(0,3);
    finalRanked=[...new Map([...primary,...top,...ranked].map(v=>[v.id,v])).values()];
  }
  const fragment=document.createDocumentFragment();
  for(const item of finalRanked) {
    fragment.append(resultRow(item,'dialog-result'));
  }
  if(!finalRanked.length)fragment.append(el('p','dialog-empty','No matching Zrain page found. Try a shorter description or another phrase.'));
  results.replaceChildren(fragment);
  count.textContent=finalRanked.length+' of '+getActiveInventory().length+' matching choices'+(aiOnThisQuery?' · AI-assisted':'');
}
function openDialog(query='') {
  if(!dialog.open) {
    focusReturn=document.activeElement;
    dialog.showModal();
  }
  dialogInput.value=query;
  aiInput=''; aiResults=[];
  kind='all';
  renderDialog();
  dialogInput.focus();
  if(aiReady&&query.trim())requestAi(query);
}
byId('header-search').addEventListener('click',()=>openDialog());
byId('browse-search').addEventListener('click',()=>openDialog());
byId('dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{if(focusReturn?.isConnected)focusReturn.focus();});
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
    event.preventDefault();openDialog();
  }
});
filters.forEach(button=>button.addEventListener('click',()=>{kind=button.dataset.filter;renderDialog();dialogInput.focus();}));
let typingTimer;
dialogInput.addEventListener('input',()=>{
  aiResults=[];aiInput='';renderDialog();
  if(aiReady){clearTimeout(typingTimer);typingTimer=setTimeout(()=>requestAi(dialogInput.value),350);}
});
dialogInput.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown') {const link=results.querySelector('a');if(link){event.preventDefault();link.focus();}}
  if(event.key==='Enter') {const link=results.querySelector('a[data-preview-id]');if(link){event.preventDefault();link.click();}}
});
results.addEventListener('keydown',event=>{
  if(event.key!=='ArrowDown'&&event.key!=='ArrowUp')return;
  const links=[...results.querySelectorAll('a')];
  const i=links.indexOf(document.activeElement);
  if(i<0)return;
  const target=event.key==='ArrowDown'?links[i+1]:links[i-1];
  if(target){event.preventDefault();target.focus();}
  else if(event.key==='ArrowUp'){event.preventDefault();dialogInput.focus();}
});

// Optional multilingual sentence embeddings model. Downloads only after an
// explicit click. Browser-side inference; no API receives the entered query.
const aiTicketCategory = new Map();
function requestAi(query, categoryId = null) {
  if(!aiReady||!query.trim()||!modelWorker)return;
  const ticket=++pending;
  if (categoryId) aiTicketCategory.set(ticket,categoryId);
  modelWorker.postMessage({type:'query',ticket,query});
}
aiButton.addEventListener('click',()=>{
  if(modelWorker)return;
  aiButton.disabled=true;
  aiStatus.textContent='Loading multilingual AI. First use downloads a large model; this may not work on low-memory devices.';
  try {
    modelWorker=new Worker('/ecosystem-ai-worker.mjs',{type:'module'});
    modelWorker.onmessage=event=>{
      const {type,message,ticket,query,ranked}=event.data||{};
      if(type==='progress'){aiStatus.textContent=message||'Preparing AI...';}
      else if(type==='ready') {
        aiReady=true;aiButton.textContent='✓ AI model ready';
        aiStatus.textContent='On-device multilingual AI is active for this session.';
        requestAi(dialogInput.value);
      }
      else if(type==='results' && ticket===pending) {
        const cat = aiTicketCategory.get(ticket);
        aiTicketCategory.delete(ticket);
        if (cat) {
          const target=categoryContainers.get(cat);
          if (target && target.search.value.trim() === query) {
            categoryAi.set(cat,{query,ranked:Array.isArray(ranked)?ranked:[]});
            target.draw(query);
          }
        } else if (query === dialogInput.value) {
          aiInput=query;aiResults=Array.isArray(ranked)?ranked:[];renderDialog();
        }
      }
      else if(type==='error') {
        aiStatus.textContent='AI model unavailable: '+String(message||'Unknown error')+'. Fast search is still available.';
        modelWorker?.terminate();modelWorker=null;aiButton.disabled=false;
      }
    };
    modelWorker.onerror=()=>{
      aiStatus.textContent='Could not start AI model. Fast multilingual search still works.';
      modelWorker?.terminate();modelWorker=null;aiButton.disabled=false;
    };
    modelWorker.postMessage({type:'init',items:getActiveInventory().map(({id,name,description,keywords})=>({id,text:[name,description,keywords].join('. ')}))});
  }catch(error){modelWorker=null;aiButton.disabled=false;aiStatus.textContent='AI initialization failed. Fast search remains available.';}
});
