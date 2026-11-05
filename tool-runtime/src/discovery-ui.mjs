/*
 * Fail / File: tool-runtime/src/discovery-ui.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Memasang carian, pilihan kategori, favorites dan recent tools bagi halaman keluarga Tools.
 * EN: Mounts search, category choices, favourites and recent tools on family landing pages.
 */
import {catalog,groups,findGroup} from './catalog.mjs';
import {searchTools,getTool,toolHref,popularSlugs,getFavourites,setFavourite,recordTool,recentTools} from './discovery.mjs';

// Zero external dependencies. All links and labels are built with DOM textContent.
// BM: local: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memasang carian, pilihan kategori, favorites dan recent tools bagi halaman keluarga Tools.
// EN: local: Isolates one operation so it can be reviewed and tested. Module purpose: mounts search, category choices, favourites and recent tools on family landing pages.
const local=()=>{try{return window.localStorage}catch{return null}};
const el=(tag,cls='',content='')=>{const node=document.createElement(tag);if(cls)node.className=cls;if(content)node.textContent=content;return node};
const url=(slug,groupSlug,view)=>view==='tool'?`../${slug}/index.html`:toolHref(slug,groupSlug);

export function mountDiscovery({view,groupSlug,slug}){
 if(typeof document.body?.appendChild!=='function')return;
 const storage=local();
 if(view==='tool')recordTool(storage,slug);
 const subset=view==='workspace'?'':groupSlug;
 // BM: favorites: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memasang carian, pilihan kategori, favorites dan recent tools bagi halaman keluarga Tools.
 // EN: favorites: Isolates one operation so it can be reviewed and tested. Module purpose: mounts search, category choices, favourites and recent tools on family landing pages.
 const favorites=()=>new Set(getFavourites(storage));
 const starred=(item,star)=>{
  const saved=favorites().has(item);star.textContent=saved?'★ Saved':'☆ Save';
  star.setAttribute('aria-pressed',String(saved));star.setAttribute('aria-label',`${saved?'Remove':'Save'} ${getTool(item)?.[1]||item} ${saved?'from':'to'} favourites`);
  star.classList.toggle('is-saved',saved);
 };
 // BM: createStar: Mengubah state yang berkaitan hanya selepas input dan syarat akses diperiksa. Tujuan modul: memasang carian, pilihan kategori, favorites dan recent tools bagi halaman keluarga Tools.
 // EN: createStar: Mutates relevant state only after input and access conditions are verified. Module purpose: mounts search, category choices, favourites and recent tools on family landing pages.
 const createStar=slug=>{
  const button=el('button','discovery-star');button.type='button';button.dataset.starTool=slug;
  starred(slug,button);
  button.addEventListener('click',()=>{
   const saved=favorites().has(slug);
   setFavourite(storage,slug,!saved);
   document.querySelectorAll('[data-star-tool]').forEach(b=>starred(b.dataset.starTool,b));
   renderExtra();
  });
  return button;
 };
 // BM: tile: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memasang carian, pilihan kategori, favorites dan recent tools bagi halaman keluarga Tools. Input: slug.
 // EN: tile: Isolates one operation so it can be reviewed and tested. Module purpose: mounts search, category choices, favourites and recent tools on family landing pages. Inputs: slug.
 const tile=(slug)=>{
  const row=getTool(slug);if(!row)return null;
  const container=el('div','discovery-tile');
  const anchor=el('a','discovery-item');anchor.href=url(slug,subset,view);
  const h=el('strong','',row[1]);const desc=el('span','',row[2]);
  const category=el('small','',findGroup(slug)?.title||'Tools');
  anchor.append(h,desc,category);container.append(anchor,createStar(slug));
  return container;
 };
 // BM: renderItems: Menyelaraskan UI dan state tanpa menggandakan event handler atau mencipta elemen tidak diperlukan. Tujuan modul: memasang carian, pilihan kategori, favorites dan recent tools bagi halaman keluarga Tools. Input: parent,slugs.
 // EN: renderItems: Synchronizes UI and state without duplicating handlers or unnecessary elements. Module purpose: mounts search, category choices, favourites and recent tools on family landing pages. Inputs: parent,slugs.
 const renderItems=(parent,slugs)=>{
  parent.replaceChildren();
  for(const slug of slugs){const row=tile(slug);if(row)parent.append(row)}
 };
 const renderExtra=()=>{
  if(view==='tool')return;
  const allowed=new Set(searchTools('',subset).map(x=>x[0]));
  const f=getFavourites(storage).filter(s=>allowed.has(s));
  const rec=recentTools(storage,subset).filter(s=>!f.includes(s));
  const favSection=document.getElementById('zrain-favourite-section');
  const recSection=document.getElementById('zrain-recent-section');
  if(favSection){favSection.hidden=!f.length;renderItems(document.getElementById('zrain-favourite-items'),f)}
  if(recSection){recSection.hidden=!rec.length;renderItems(document.getElementById('zrain-recent-items'),rec)}
 };
 const root=document.getElementById('discovery-root');
 if(root && view!=='tool'){
  root.className='discovery-root';
  root.innerHTML=`<section class="discovery-find" aria-label="Find a Zrain tool"><div><span class="eyebrow">FIND THE RIGHT TOOL</span><h2>What would you like to do<span class="accent">?</span></h2><p>Search in English or Bahasa Melayu. No account required.</p></div><div class="discovery-search-field"><label class="discovery-search-label" for="zrain-tool-search">Search tools</label><div class="discovery-input-row"><span aria-hidden="true">⌕</span><input id="zrain-tool-search" type="search" autocomplete="off" spellcheck="false" placeholder="Try: tukar gambar, PDF, compare, QR…"/><kbd>Ctrl K</kbd></div><p id="zrain-search-count" class="discovery-count" role="status" aria-live="polite">Search by task or tool name.</p></div></section><section id="zrain-search-section" class="discovery-results" hidden><h3>Search results</h3><div id="zrain-search-items" class="discovery-items"></div></section><section id="zrain-favourite-section" class="discovery-results" hidden><h3>★ Your saved tools <small>Saved on this website and browser</small></h3><div id="zrain-favourite-items" class="discovery-items"></div></section><section id="zrain-recent-section" class="discovery-results" hidden><h3>Recently used <small>Only on this website and browser</small></h3><div id="zrain-recent-items" class="discovery-items"></div></section><section id="zrain-popular-section" class="discovery-results"><h3>Quick starts <small>Practical everyday tasks</small></h3><div id="zrain-popular-items" class="discovery-items"></div></section><details class="discovery-disclosure"><summary>How Zrain tools handle your files and their limitations</summary><p>Your selected files are processed in your browser; this collection does not have a file-upload API or user accounts. Some features load additional libraries or OCR resources from third-party CDNs, and those downloads require internet access. External font assets may also be requested. Browser processing does not mean the page is fully offline.</p><p>Conversion accuracy depends on the source document. Existing PDF text is not directly editable in the basic PDF Editor. Image upscaling increases pixel dimensions but cannot guarantee restoration of original missing details. Review downloads before relying on them.</p></details>`;
  const input=document.getElementById('zrain-tool-search');
  const searchSection=document.getElementById('zrain-search-section');
  const searchItems=document.getElementById('zrain-search-items');
  const searchCount=document.getElementById('zrain-search-count');
  const popular=popularSlugs.filter(s=>searchTools('',subset).some(row=>row[0]===s));
  if(!popular.length)document.getElementById('zrain-popular-section').hidden=true;
  else renderItems(document.getElementById('zrain-popular-items'),popular);
  // BM: onSearch: Memproses interaksi yang ditentukan dan mengemas kini state yang relevan dengan selamat. Tujuan modul: memasang carian, pilihan kategori, favorites dan recent tools bagi halaman keluarga Tools.
  // EN: onSearch: Handles the specified interaction and updates relevant state safely. Module purpose: mounts search, category choices, favourites and recent tools on family landing pages.
  const onSearch=()=>{
   const term=input.value.trim();searchSection.hidden=!term;
   if(!term){searchCount.textContent='Search by task or tool name.';return}
   const matches=searchTools(term,subset,catalog.length).map(row=>row[0]);
   renderItems(searchItems,matches);
   searchCount.textContent=matches.length?`${matches.length} matching ${matches.length===1?'tool':'tools'}`:'No matching tool. Try a different term.';
   if(!matches.length)searchItems.append(el('p','discovery-empty','No results in this workspace.'));
  };
  // BM: Event input: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
  // EN: input event: handle interaction without mutating source data or bypassing module validation.
  input.addEventListener('input',onSearch);
  renderExtra();
 }
 if(view==='tool'){
  const toolbar=document.querySelector('.tool-toolbar');
  if(toolbar){
   const buttons=el('div','discovery-toolbar-actions');
   const searchBtn=el('button','discovery-open','⌕ Find a tool');searchBtn.type='button';
   const save=createStar(slug);save.classList.add('discovery-current-save');
   buttons.append(searchBtn,save);toolbar.append(buttons);
   // BM: Event click: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
   // EN: click event: handle interaction without mutating source data or bypassing module validation.
   searchBtn.addEventListener('click',openPalette);
  }
 }
 // Tool pages do not require the full directory; keyboard search uses a small dialog.
 const dialog=el('dialog','discovery-dialog');
 dialog.innerHTML=`<div class="discovery-dialog-head"><label for="zrain-command-search">Find another Zrain tool</label><button class="discovery-dismiss" type="button" aria-label="Close search">✕</button></div><input type="search" id="zrain-command-search" placeholder="Search this workspace…" autocomplete="off"/><div class="discovery-command-results"></div><p class="discovery-count">Press Esc to close. Results are limited to this product.</p>`;
 document.body.append(dialog);
 const commandInput=dialog.querySelector('input');const commandResults=dialog.querySelector('.discovery-command-results');
 // BM: updateCommand: Mengubah state yang berkaitan hanya selepas input dan syarat akses diperiksa. Tujuan modul: memasang carian, pilihan kategori, favorites dan recent tools bagi halaman keluarga Tools.
 // EN: updateCommand: Mutates relevant state only after input and access conditions are verified. Module purpose: mounts search, category choices, favourites and recent tools on family landing pages.
 const updateCommand=()=>{const result=searchTools(commandInput.value,subset,12).map(row=>row[0]);renderItems(commandResults,result);if(!result.length)commandResults.append(el('p','discovery-empty','No matching tool found.'))};
 commandInput.addEventListener('input',updateCommand);
 dialog.querySelector('button').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 function openPalette(){updateCommand();if(!dialog.open)dialog.showModal();commandInput.focus()}
 document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
   e.preventDefault();const input=document.getElementById('zrain-tool-search');
   if(input){input.focus();input.scrollIntoView({block:'center',behavior:'smooth'})}else openPalette();
  }
  if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){
   e.preventDefault();const input=document.getElementById('zrain-tool-search');if(input)input.focus();else openPalette();
  }
 });
}
