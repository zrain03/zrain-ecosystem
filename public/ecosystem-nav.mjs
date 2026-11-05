/*
 * Fail / File: public/ecosystem-nav.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyelaraskan pautan anchor dan keadaan navigasi apabila kategori ditatal.
 * EN: Synchronizes anchor links and navigation state as categories scroll.
 */
/**
 * Zrain sticky section navigation: clicking is as reliable as scrolling.
 * Community feedback content mounts asynchronously, so its anchor is re-aligned
 * after the panel appears. No timers are required to poll the page.
 */
const nav=[...document.querySelectorAll('.zrain-header [data-nav-section]')];
const sequence=[
  ['discover',['discover','categories','how-it-works','about']],
  ['contact',['contact']],
  ['community',['zrain-feedback']]
];
const sections=sequence.flatMap(([key,ids])=>ids.map(id=>({key,node:document.getElementById(id)}))).filter(x=>x.node);
// BM: preferReduced: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyelaraskan pautan anchor dan keadaan navigasi apabila kategori ditatal.
// EN: preferReduced: Isolates one operation so it can be reviewed and tested. Module purpose: synchronizes anchor links and navigation state as categories scroll.
const preferReduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const headingOffset=()=>Math.ceil((document.querySelector('.zrain-header')?.getBoundingClientRect().height||80)+16);
let pressed=null;
let locked=false;
let token=0;
let scheduled=false;

// BM: mark: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyelaraskan pautan anchor dan keadaan navigasi apabila kategori ditatal. Input: active.
// EN: mark: Isolates one operation so it can be reviewed and tested. Module purpose: synchronizes anchor links and navigation state as categories scroll. Inputs: active.
function mark(active) {
  for(const a of nav) {
    const yes=a.dataset.navSection===active;
    a.classList.toggle('current',yes);
    if (yes)a.setAttribute('aria-current','location');
    else a.removeAttribute('aria-current');
  }
}
// BM: currentFromScroll: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyelaraskan pautan anchor dan keadaan navigasi apabila kategori ditatal.
// EN: currentFromScroll: Isolates one operation so it can be reviewed and tested. Module purpose: synchronizes anchor links and navigation state as categories scroll.
function currentFromScroll() {
  const offset=headingOffset()+25;
  let active='discover';
  for(const {key,node} of sections) {
    if(node.getBoundingClientRect().top<=offset)active=key;
  }
  const remaining=document.documentElement.scrollHeight-window.innerHeight-window.scrollY;
  if(remaining<=3 && document.getElementById('zrain-feedback')?.getBoundingClientRect().top<=window.innerHeight)active='community';
  return active;
}
// BM: updateCategoryJumps: Mengubah state yang berkaitan hanya selepas input dan syarat akses diperiksa. Tujuan modul: menyelaraskan pautan anchor dan keadaan navigasi apabila kategori ditatal.
// EN: updateCategoryJumps: Mutates relevant state only after input and access conditions are verified. Module purpose: synchronizes anchor links and navigation state as categories scroll.
function updateCategoryJumps() {
  const threshold=headingOffset()+75;
  for(const a of document.querySelectorAll('.category-jumps a[href^="#category-"]')) {
    const target=document.getElementById(a.hash.slice(1));
    const on=target && target.getBoundingClientRect().top<=threshold && target.getBoundingClientRect().bottom>threshold;
    a.classList.toggle('current',Boolean(on));
    if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
  }
}
// BM: update: Mengubah state yang berkaitan hanya selepas input dan syarat akses diperiksa. Tujuan modul: menyelaraskan pautan anchor dan keadaan navigasi apabila kategori ditatal.
// EN: update: Mutates relevant state only after input and access conditions are verified. Module purpose: synchronizes anchor links and navigation state as categories scroll.
function update() {
  if(!locked)mark(currentFromScroll());
  updateCategoryJumps();
}
function schedule() {
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;update();});
}
// BM: destination: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyelaraskan pautan anchor dan keadaan navigasi apabila kategori ditatal. Input: id.
// EN: destination: Isolates one operation so it can be reviewed and tested. Module purpose: synchronizes anchor links and navigation state as categories scroll. Inputs: id.
function destination(id) {
  const node=document.getElementById(id);
  if(!node)return null;
  const y=Math.max(0,Math.round(window.scrollY+node.getBoundingClientRect().top-headingOffset()));
  const max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
  return Math.min(y,max);
}
// BM: scrollToAnchor: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyelaraskan pautan anchor dan keadaan navigasi apabila kategori ditatal. Input: key,id,{push=true}={}.
// EN: scrollToAnchor: Isolates one operation so it can be reviewed and tested. Module purpose: synchronizes anchor links and navigation state as categories scroll. Inputs: key,id,{push=true}={}.
function scrollToAnchor(key,id,{push=true}={}) {
  const y=destination(id);
  if(y===null)return;
  token+=1;
  const thisToken=token;
  pressed={key,id};locked=true;
  mark(key);
  if(push)history.pushState(null,'','#'+id);
  window.scrollTo({top:y,behavior:preferReduced()?'instant':'smooth'});
  // scrollend tracks the actual end of smooth navigation on supporting browsers.
  // Fallback releases selection after a short maximum duration.
  // BM: finish: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyelaraskan pautan anchor dan keadaan navigasi apabila kategori ditatal.
  // EN: finish: Isolates one operation so it can be reviewed and tested. Module purpose: synchronizes anchor links and navigation state as categories scroll.
  function finish() {
    if(token!==thisToken)return;
    locked=false;
    const actual=currentFromScroll();
    mark(actual===key?actual:key);
    updateCategoryJumps();
  }
  if('onscrollend' in window)window.addEventListener('scrollend',finish,{once:true});
  else window.setTimeout(finish,900);
  if(preferReduced())finish();
}
for(const a of nav) {
  // BM: Event click: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
  // EN: click event: handle interaction without mutating source data or bypassing module validation.
  a.addEventListener('click',e=>{
    const href=a.getAttribute('href')||'';
    if(!href.startsWith('#'))return;
    const id=href.slice(1);
    if(!document.getElementById(id))return;
    e.preventDefault();
    scrollToAnchor(a.dataset.navSection,id);
  });
}
// Each category chip retains normal hash navigation, with an immediate visual
// selected state, so a mouse click and keyboard activation have the same cue.
for(const a of document.querySelectorAll('.category-jumps a[href^="#category-"]')) {
  // BM: Event click: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
  // EN: click event: handle interaction without mutating source data or bypassing module validation.
  a.addEventListener('click',()=>{
    for(const b of document.querySelectorAll('.category-jumps a'))b.classList.toggle('current',b===a);
  });
}
// Manual movement cancels a previously requested anchor re-alignment.
function cancelAnchor() { pressed=null;locked=false;token++;schedule(); }
window.addEventListener('wheel',cancelAnchor,{passive:true});
window.addEventListener('touchstart',cancelAnchor,{passive:true});
// BM: Event keydown: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
// EN: keydown event: handle interaction without mutating source data or bypassing module validation.
window.addEventListener('keydown',e=>{
  if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))cancelAnchor();
});
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('hashchange',()=>{
  if(location.hash.startsWith('#app='))return; // Console modal deep link.
  schedule();
});
// The actual height of Community may change when feedback is injected.
const community=document.getElementById('zrain-feedback');
if(community && typeof MutationObserver!=='undefined') {
  const observer=new MutationObserver(()=>{
    if(pressed?.key==='community' && (location.hash==='#zrain-feedback')) {
      const y=destination('zrain-feedback');
      if(y!==null && Math.abs(window.scrollY-y)>3)window.scrollTo({top:y,behavior:preferReduced()?'instant':'smooth'});
    }
    schedule();
  });
  observer.observe(community,{childList:true,subtree:false});
}
update();
