/*
 * Fail / File: public/ecosystem-console.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengawal pembukaan, pemuatan dan penutupan Console pada halaman Ecosystem.
 * EN: Controls opening, loading and closing the Ecosystem inline Console.
 */
import {CATEGORIES} from './ecosystem-inventory.mjs';
import {getActiveInventory,subscribeCatalog,connectCatalogRefresh} from './ecosystem-catalog.mjs';
import {GOOGLE_PLAY,logoFor,repoHref,previewHref,getInventoryItem,sortedByName} from './ecosystem-links.mjs';
import {toolNavigatedInsideFrame} from './ecosystem-frame-sync.mjs';

// BM: byId: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mengawal pembukaan, pemuatan dan penutupan Console pada halaman Ecosystem.
// EN: byId: Isolates one operation so it can be reviewed and tested. Module purpose: controls opening, loading and closing the Ecosystem inline Console.
const byId = id => document.getElementById(id);
const list = byId('console-apps');
const search = byId('console-search');
const categories = byId('console-categories');
const title = byId('console-selected');
const summary = byId('console-description');
const note = byId('console-notice');
const frame = byId('console-iframe');
const stage = byId('console-stage');
const viewer = byId('console-viewer');
const shell = byId('console-shell');
const external = byId('console-open');
const github = byId('console-github');
const store = byId('console-store');
const mobile = byId('console-mobile');
const desktop = byId('console-desktop');
const viewLabel = byId('console-view-label');
const count = byId('console-count');
const details = byId('console-details');

let selected = null;
let category = 'all';
let mode = 'mobile';
const PHONE = Object.freeze({width:390,height:844});

// BM: el: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mengawal pembukaan, pemuatan dan penutupan Console pada halaman Ecosystem. Input: tag, className = '', content.
// EN: el: Isolates one operation so it can be reviewed and tested. Module purpose: controls opening, loading and closing the Ecosystem inline Console. Inputs: tag, className = '', content.
function el(tag, className = '', content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = content;
  return element;
}

// BM: mark: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mengawal pembukaan, pemuatan dan penutupan Console pada halaman Ecosystem. Input: src, name.
// EN: mark: Isolates one operation so it can be reviewed and tested. Module purpose: controls opening, loading and closing the Ecosystem inline Console. Inputs: src, name.
function mark(src, name) {
  const img = el('img', 'console-item-logo');
  img.src = src;
  img.alt = name === 'Guess The Flag' || name === 'Memory Rush' ? name + ' logo' : 'Zrain logo';
  img.width = 36; img.height = 36; img.decoding = 'async';
  img.addEventListener('error',()=>{ if (img.src !== new URL('/zrain-logo.webp', location.href).href) img.src='/zrain-logo.webp'; },{once:true});
  return img;
}

// BM: layoutFrame: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mengawal pembukaan, pemuatan dan penutupan Console pada halaman Ecosystem.
// EN: layoutFrame: Isolates one operation so it can be reviewed and tested. Module purpose: controls opening, loading and closing the Ecosystem inline Console.
function layoutFrame() {
  if (!selected) return;
  const w = Math.max(1, stage.clientWidth - 20);
  const h = Math.max(1, stage.clientHeight - 20);
  if (mode === 'desktop') {
    const logicalWidth = Math.max(1100, w);
    const scale = Math.min(1, w / logicalWidth);
    viewer.style.width = Math.floor(logicalWidth * scale) + 'px';
    viewer.style.height = h + 'px';
    frame.style.width = logicalWidth + 'px';
    frame.style.height = Math.ceil(h / scale) + 'px';
    frame.style.transform = scale === 1 ? 'none' : `scale(${scale})`;
  } else {
    const scale = Math.min(w / PHONE.width, h / PHONE.height, 1.25);
    viewer.style.width = Math.max(1,Math.floor(PHONE.width * scale)) + 'px';
    viewer.style.height = Math.max(1,Math.floor(PHONE.height * scale)) + 'px';
    frame.style.width = PHONE.width + 'px';
    frame.style.height = PHONE.height + 'px';
    frame.style.transform = `scale(${scale})`;
  }
}

// BM: setView: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: mengawal pembukaan, pemuatan dan penutupan Console pada halaman Ecosystem. Input: next.
// EN: setView: Isolates one operation so it can be reviewed and tested. Module purpose: controls opening, loading and closing the Ecosystem inline Console. Inputs: next.
function setView(next) {
  if (!['mobile','desktop'].includes(next)) return;
  mode = next;
  shell.dataset.view = mode;
  mobile.setAttribute('aria-pressed',String(mode === 'mobile'));
  desktop.setAttribute('aria-pressed',String(mode === 'desktop'));
  viewLabel.textContent = mode === 'mobile' ? 'Mobile view' : 'Desktop view';
  // Do not reload: an active game or form must not lose its progress.
  layoutFrame();
}

// BM: loadCurrent: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: mengawal pembukaan, pemuatan dan penutupan Console pada halaman Ecosystem.
// EN: loadCurrent: Reads relevant records and returns a bounded result to the caller. Module purpose: controls opening, loading and closing the Ecosystem inline Console.
function loadCurrent() {
  if (!selected) return;
  const target = previewHref(selected,location.origin);
  if (!target) { frame.src='about:blank';return; }
  // Prevent recursively embedding Console inside itself.
  if (selected.id === 'zrain-console') {
    frame.src='about:blank';
    note.textContent='You are already in Zrain Console. Choose another application from the list.';
    stage.dataset.self = 'true';
    return;
  }
  stage.dataset.self = 'false';
  note.textContent='This is a preview of the official website. Some login providers block embedded views. If the page stays blank, use Open in new tab.';
  frame.src=target;
}

// BM: selectApp: Memproses interaksi yang ditentukan dan mengemas kini state yang relevan dengan selamat. Tujuan modul: mengawal pembukaan, pemuatan dan penutupan Console pada halaman Ecosystem. Input: item, {updateUrl=true,loadFrame=true,keepView=false}={}.
// EN: selectApp: Handles the specified interaction and updates relevant state safely. Module purpose: controls opening, loading and closing the Ecosystem inline Console. Inputs: item, {updateUrl=true,loadFrame=true,keepView=false}={}.
function selectApp(item, {updateUrl=true,loadFrame=true,keepView=false}={}) {
  if (!item || selected?.id === item.id && !updateUrl) return;
  selected = item;
  const updatedLogo=mark(logoFor(item),item.name);
  updatedLogo.id='console-selected-icon';
  byId('console-selected-icon').replaceWith(updatedLogo);
  title.textContent=item.name;
  summary.textContent=item.description;
  frame.title=item.name+' web application';
  const page=previewHref(item,location.origin);
  if(page){external.href=page;external.hidden=false;} else {external.hidden=true;external.removeAttribute('href');}
  const repo=repoHref(item);
  github.hidden=!repo;
  if(repo)github.href=repo;else github.removeAttribute('href');
  const play=GOOGLE_PLAY[item.id];
  store.hidden=!play;
  if(play)store.href=play;else store.removeAttribute('href');
  details.textContent=item.kind === 'project' ?
    'Independent Zrain application. Its own account, features and security controls stay with that app.' :
    'Zrain browser tool. Select an input and follow the steps inside the preview. Review the result before downloading or sharing.';
  if (!keepView) setView(item.category==='play'?'mobile':'desktop');
  if (loadFrame) loadCurrent();
  renderList();
  if (updateUrl) {
    const next=new URL(location.href);
    next.searchParams.set('app',item.id);
    next.searchParams.delete('console');
    history.replaceState(null,'',next.pathname+next.search+next.hash);
  }
}

// A tool can navigate to a different function within the same iframe.
// Reflect the actual page in the Console header, sidebar and shared URL.
// No second iframe navigation, so the visitor's page is never reset.
// BM: Event load: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
// EN: load event: handle interaction without mutating source data or bypassing module validation.
frame.addEventListener('load', () => {
  if (!selected) return;
  const current = toolNavigatedInsideFrame(frame, location.origin, getInventoryItem);
  if (current && current.id !== selected.id) {
    selectApp(current, {updateUrl:true, loadFrame:false, keepView:true});
  }
});

// BM: renderList: Menyelaraskan UI dan state tanpa menggandakan event handler atau mencipta elemen tidak diperlukan. Tujuan modul: mengawal pembukaan, pemuatan dan penutupan Console pada halaman Ecosystem.
// EN: renderList: Synchronizes UI and state without duplicating handlers or unnecessary elements. Module purpose: controls opening, loading and closing the Ecosystem inline Console.
function renderList() {
  const term=search.value.trim().toLocaleLowerCase();
  const matched=sortedByName(getActiveInventory().filter(item=>
    (category==='all' || item.category===category) &&
    (!term || [item.name,item.description,item.keywords||''].join(' ').toLocaleLowerCase().includes(term))
  ));
  const fragment=document.createDocumentFragment();
  for(const item of matched){
    const button=el('button','console-list-item');button.type='button';
    button.setAttribute('aria-pressed',String(item.id===selected?.id));
    button.append(mark(logoFor(item),item.name));
    const copy=el('span','console-list-copy');
    copy.append(el('strong','',item.name),el('small','',CATEGORIES.find(c=>c.id===item.category)?.title||'Zrain'));
    button.append(copy);
    // BM: Event click: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
    // EN: click event: handle interaction without mutating source data or bypassing module validation.
    button.addEventListener('click',()=>selectApp(item));
    fragment.append(button);
  }
  if(!matched.length)fragment.append(el('p','console-empty','No matching web app. Try another name.'));
  list.replaceChildren(fragment);
  count.textContent=matched.length+' of '+getActiveInventory().length+' applications';
}

for(const c of [{id:'all',title:'All'},...CATEGORIES]) {
  const b=el('button','console-category',c.title);
  b.type='button'; b.dataset.consoleCategory=c.id;
  // BM: Event click: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
  // EN: click event: handle interaction without mutating source data or bypassing module validation.
  b.addEventListener('click',()=>{
    category=c.id;
    for(const button of categories.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button===b));
    renderList();
  });
  b.setAttribute('aria-pressed',String(c.id==='all'));
  categories.append(b);
}
// BM: Event input: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
// EN: input event: handle interaction without mutating source data or bypassing module validation.
search.addEventListener('input',renderList);
mobile.addEventListener('click',()=>setView('mobile'));
desktop.addEventListener('click',()=>setView('desktop'));
byId('console-reload').addEventListener('click',loadCurrent);
byId('console-fullscreen').addEventListener('click',()=>{
  if(document.fullscreenElement===shell)document.exitFullscreen?.().catch(()=>{});
  else shell.requestFullscreen?.().catch(()=>{});
});
if(typeof ResizeObserver!=='undefined')new ResizeObserver(layoutFrame).observe(stage);
// BM: Event resize: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
// EN: resize event: handle interaction without mutating source data or bypassing module validation.
window.addEventListener('resize',layoutFrame);
document.addEventListener('fullscreenchange',layoutFrame);

const requested=new URLSearchParams(location.search).get('app') || new URLSearchParams(location.search).get('console');
const initial=getInventoryItem(requested)||sortedByName(getActiveInventory())[0];
renderList();
selectApp(initial,{updateUrl:!!requested});

subscribeCatalog(()=>{
  const next=selected && getInventoryItem(selected.id);
  if (next) {
    // Keep selected preview session in place; update counts, titles and list.
    selected=next;
    renderList();
  } else {
    const fallback=sortedByName(getActiveInventory())[0];
    if(fallback)selectApp(fallback);
    else {selected=null;frame.src='about:blank';title.textContent='No published web apps';summary.textContent='Publish an application in Zrain Admin to display it here.';renderList();}
  }
});
connectCatalogRefresh();
