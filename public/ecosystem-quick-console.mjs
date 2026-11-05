/*
 * Fail / File: public/ecosystem-quick-console.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Membuka produk pilihan dalam pratonton pantas dengan fallback tab baharu.
 * EN: Opens selected products in a quick preview with new-tab fallback.
 */
/**
 * Inline Zrain Console: preserves the original preview-first user experience.
 * It opens a known inventory item without leaving the Ecosystem homepage.
 * The full /zrain-console.html workspace remains available as a separate project.
 */
import {GOOGLE_PLAY,logoFor,repoHref,previewHref,getInventoryItem} from './ecosystem-links.mjs';
import {subscribeCatalog} from './ecosystem-catalog.mjs';
import {toolNavigatedInsideFrame} from './ecosystem-frame-sync.mjs';

// BM: get: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: membuka produk pilihan dalam pratonton pantas dengan fallback tab baharu.
// EN: get: Reads relevant records and returns a bounded result to the caller. Module purpose: opens selected products in a quick preview with new-tab fallback.
const get = id => document.getElementById(id);
const dialog = get('zrain-preview');
const shell = get('zrain-preview-shell');
const stage = get('zrain-preview-stage');
const viewer = get('zrain-preview-viewer');
const frame = get('zrain-preview-frame');
const title = get('zrain-preview-title');
const icon = get('zrain-preview-icon');
const details = get('zrain-preview-description');
const modeText = get('zrain-preview-mode');
const mobile = get('zrain-preview-mobile');
const desktop = get('zrain-preview-desktop');
const external = get('zrain-preview-external');
const github = get('zrain-preview-github');
const store = get('zrain-preview-store');
const fullConsole = get('zrain-preview-full-console');
const note = get('zrain-preview-note');
const PHONE = Object.freeze({width:390,height:844});
let selected = null;
let mode = 'desktop';
let focusReturn = null;
let previousHash = '';
let ignoreHash = false;

// BM: layoutFrame: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: membuka produk pilihan dalam pratonton pantas dengan fallback tab baharu.
// EN: layoutFrame: Isolates one operation so it can be reviewed and tested. Module purpose: opens selected products in a quick preview with new-tab fallback.
function layoutFrame() {
  if (!dialog?.open || !selected) return;
  // Calculate actual available viewport space, not a fixed screenshot height.
  const availableWidth = Math.max(1,stage.clientWidth - 16);
  const availableHeight = Math.max(1,stage.clientHeight - 16);
  if (mode === 'desktop') {
    // Desktop sites keep their real desktop breakpoint when viewed on phones.
    const logicalWidth = Math.max(1100,availableWidth);
    const scale = Math.min(1,availableWidth/logicalWidth);
    viewer.style.width = Math.floor(logicalWidth * scale)+'px';
    viewer.style.height = availableHeight+'px';
    frame.style.width = logicalWidth+'px';
    frame.style.height = Math.ceil(availableHeight/scale)+'px';
    frame.style.transform = scale===1 ? 'none' : `scale(${scale})`;
  } else {
    const scale = Math.min(availableWidth/PHONE.width,availableHeight/PHONE.height,1.5);
    viewer.style.width = Math.floor(PHONE.width*scale)+'px';
    viewer.style.height = Math.floor(PHONE.height*scale)+'px';
    frame.style.width = PHONE.width+'px';
    frame.style.height = PHONE.height+'px';
    frame.style.transform = `scale(${scale})`;
  }
}
// BM: view: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: membuka produk pilihan dalam pratonton pantas dengan fallback tab baharu. Input: next.
// EN: view: Isolates one operation so it can be reviewed and tested. Module purpose: opens selected products in a quick preview with new-tab fallback. Inputs: next.
function view(next) {
  if (next!=='mobile' && next!=='desktop') return;
  mode=next;
  shell.dataset.view=mode;
  mobile.setAttribute('aria-pressed',String(mode==='mobile'));
  desktop.setAttribute('aria-pressed',String(mode==='desktop'));
  modeText.textContent=mode==='mobile'?'Mobile view':'Desktop view';
  // Never reload on a view change; keep the visitor's current form/game session.
  layoutFrame();
}
// BM: load: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: membuka produk pilihan dalam pratonton pantas dengan fallback tab baharu.
// EN: load: Reads relevant records and returns a bounded result to the caller. Module purpose: opens selected products in a quick preview with new-tab fallback.
function load() {
  if (!selected) return;
  const destination=previewHref(selected,location.origin);
  frame.src=destination||'about:blank';
}
function setAnchor(a, url) {
  a.hidden=!url;
  if (url) a.href=url;
  else a.removeAttribute('href');
}
// BM: open: Menyelaraskan UI dan state tanpa menggandakan event handler atau mencipta elemen tidak diperlukan. Tujuan modul: membuka produk pilihan dalam pratonton pantas dengan fallback tab baharu. Input: id,trigger=null,{updateHash=true}={}.
// EN: open: Synchronizes UI and state without duplicating handlers or unnecessary elements. Module purpose: opens selected products in a quick preview with new-tab fallback. Inputs: id,trigger=null,{updateHash=true}={}.
function open(id,trigger=null,{updateHash=true}={}) {
  const item=getInventoryItem(id);
  if (!item || !dialog) return false;
  const destination=previewHref(item,location.origin);
  if (!destination) return false;
  if (!dialog.open) {
    previousHash=location.hash.startsWith('#app=') ? '' : location.hash;
    focusReturn=trigger || document.activeElement;
    // Modal-on-modal is confusing; close global search before opening a preview.
    const searchDialog=get('search-dialog');
    if (searchDialog?.open) searchDialog.close();
    dialog.showModal();
  }
  selected=item;
  icon.src=logoFor(item);
  icon.alt=['guess-the-flag','memory-rush'].includes(item.id) ? item.name+' logo' : 'Zrain logo';
  icon.onerror=()=>{icon.onerror=null;icon.src='/zrain-logo.webp';};
  title.textContent=item.name;
  details.textContent=item.description + (item.kind==='tool' ?
    ' This tool works within your browser. Choose the input, review the output and download when ready.' :
    ' This Zrain application operates independently and may have its own account or security requirements.');
  frame.title=item.name+' web application preview';
  setAnchor(external,destination);
  setAnchor(github,repoHref(item));
  setAnchor(store,GOOGLE_PLAY[item.id]);
  fullConsole.href='/zrain-console.html?app='+encodeURIComponent(item.id);
  note.textContent='Preview of the official Zrain website. Some sign-in providers may restrict embedded views. Use Open in new tab if needed.';
  // A full-width workspace for tools; familiar portrait viewport for games.
  view(item.category==='play'?'mobile':'desktop');
  load();
  requestAnimationFrame(layoutFrame);
  if (updateHash && location.hash!=='#app='+encodeURIComponent(item.id)) {
    history.pushState({zrainPreview:item.id},'',location.pathname+location.search+'#app='+encodeURIComponent(item.id));
  }
  get('zrain-preview-close').focus();
  return true;
}
// The tool's own "Switch function" dropdown navigates inside our iframe.
// Update the outside Console title and actions without reloading the new tool.
// BM: syncToolNavigation: Menyelaraskan data dengan mengekalkan identiti, aturan dan keserasian rekod lama. Tujuan modul: membuka produk pilihan dalam pratonton pantas dengan fallback tab baharu.
// EN: syncToolNavigation: Reconciles data while preserving identity, ordering and legacy compatibility. Module purpose: opens selected products in a quick preview with new-tab fallback.
function syncToolNavigation() {
  if (!dialog?.open || !selected) return;
  const current = toolNavigatedInsideFrame(frame, location.origin, getInventoryItem);
  if (!current || current.id === selected.id) return;
  selected = current;
  icon.src = logoFor(current);
  icon.alt = 'Zrain logo';
  title.textContent = current.name;
  details.textContent = current.description +
    ' This tool works within your browser. Choose the input, review the output and download when ready.';
  frame.title = current.name + ' web application preview';
  setAnchor(external, previewHref(current, location.origin));
  setAnchor(github, repoHref(current));
  setAnchor(store, GOOGLE_PLAY[current.id]);
  fullConsole.href = '/zrain-console.html?app=' + encodeURIComponent(current.id);
  if (location.hash.startsWith('#app=')) {
    history.replaceState(history.state, '', location.pathname + location.search +
      '#app=' + encodeURIComponent(current.id));
  }
}
// BM: Event load: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
// EN: load event: handle interaction without mutating source data or bypassing module validation.
frame.addEventListener('load', syncToolNavigation);

function close() {if (dialog?.open) dialog.close();}

// Every Web App and search suggestion uses the same local modal, on the page.
document.addEventListener('click',event=>{
  const a=event.target?.closest?.('[data-preview-id]');
  if (!a) return;
  if (event.button!==0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  const id=a.dataset.previewId;
  if (!getInventoryItem(id)) return;
  event.preventDefault();
  open(id,a);
});
document.addEventListener('zrain:open-preview',event=>{
  open(event.detail?.id,event.detail?.trigger||document.activeElement);
});
// BM: Event click: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
// EN: click event: handle interaction without mutating source data or bypassing module validation.
get('zrain-preview-close').addEventListener('click',close);
mobile.addEventListener('click',()=>view('mobile'));
desktop.addEventListener('click',()=>view('desktop'));
get('zrain-preview-reload').addEventListener('click',load);
get('zrain-preview-fullscreen').addEventListener('click',()=>{
  if (document.fullscreenElement===shell) document.exitFullscreen?.().catch(()=>{});
  else shell.requestFullscreen?.().catch(()=>{});
});
// BM: Event click: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
// EN: click event: handle interaction without mutating source data or bypassing module validation.
dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
dialog.addEventListener('close',()=>{
  frame.src='about:blank';
  selected=null;
  if (document.fullscreenElement===shell) document.exitFullscreen?.().catch(()=>{});
  if(location.hash.startsWith('#app=') && !ignoreHash) {
    history.replaceState(null,'',location.pathname+location.search+previousHash);
  }
  ignoreHash=false;
  if(focusReturn?.isConnected && typeof focusReturn.focus==='function')focusReturn.focus();
  focusReturn=null;
});
if ('ResizeObserver' in window) new ResizeObserver(layoutFrame).observe(stage);
// BM: Event resize: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
// EN: resize event: handle interaction without mutating source data or bypassing module validation.
window.addEventListener('resize',layoutFrame);
document.addEventListener('fullscreenchange',layoutFrame);
window.addEventListener('popstate',()=>{
  const id=location.hash.startsWith('#app=') ? decodeURIComponent(location.hash.slice(5)) : '';
  if(id && getInventoryItem(id)) open(id,null,{updateHash:false});
  else if(dialog.open) {ignoreHash=true;close();}
});
const initial=location.hash.startsWith('#app=') ? decodeURIComponent(location.hash.slice(5)) : null;
if(initial && getInventoryItem(initial)) open(initial,null,{updateHash:false});

// If an administrator unpublishes an active application, never leave a stale
// allowlisted preview open. Other catalogue updates preserve the iframe session.
subscribeCatalog(()=>{
  if(!selected)return;
  const updated=getInventoryItem(selected.id);
  if(!updated) {close();return;}
  selected=updated;
  title.textContent=updated.name;
  details.textContent=updated.description + (updated.kind==='tool' ?
    ' This tool works within your browser. Choose the input, review the output and download when ready.' :
    ' This Zrain application operates independently and may have its own account or security requirements.');
  setAnchor(external,previewHref(updated,location.origin));
  setAnchor(github,repoHref(updated));
});
