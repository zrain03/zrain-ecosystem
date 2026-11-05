/*
 * Fail / File: tool-runtime/src/build.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menjana lima laman Tools bebas daripada source dan menyalin aset yang diperlukan ke dist.
 * EN: Builds five independent Tools websites from source and copies required assets into dist.
 */
import { writeFile, mkdir, copyFile, rm, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { catalog, groups } from './catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const out = join(root, 'dist');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
// BM: esc: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menjana lima laman Tools bebas daripada source dan menyalin aset yang diperlukan ke dist.
// EN: esc: Isolates one operation so it can be reviewed and tested. Module purpose: builds five independent Tools websites from source and copies required assets into dist.
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const shared=['style.css','feedback.css','brand.css','feedback-embed.js','zrain-ui.js','app.js','catalog.mjs','core.mjs','image-metadata.mjs','qr-local.mjs','jszip.min.js','discovery.mjs','discovery-ui.mjs','ux-help.mjs','workflow-guide.mjs','extended-core.mjs','extended-tools.mjs'];
const copyAssets=async dir=>{
  for(const f of shared)await copyFile(join(root,'src',f),join(dir,f));
  await copyFile(join(root,'src','zrain-logo.webp'),join(dir,'zrain-logo.webp'));
  await mkdir(join(dir,'licenses'),{recursive:true});
  for(const n of ['QRCode-MIT.txt','JSZip-LICENSE.md'])await copyFile(join(root,'licenses',n),join(dir,'licenses',n));
};
const bySlug=new Map(catalog.map(row=>[row[0],row]));
// BM: cardPage: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menjana lima laman Tools bebas daripada source dan menyalin aset yang diperlukan ke dist. Input: {view,group=null,item=null}.
// EN: cardPage: Isolates one operation so it can be reviewed and tested. Module purpose: builds five independent Tools websites from source and copies required assets into dist. Inputs: {view,group=null,item=null}.
const cardPage=({view,group=null,item=null})=>{
  const inTool=view==='tool';
  const base=inTool?'../':'./';
  const groupName=group?.title||'Tools';
  const title=inTool?`Zrain ${item[1]}`:group?`Zrain ${groupName}`:'Zrain Tools';
  const description=inTool?item[2]:group?group.description:'Useful tools, organised into focused Zrain products.';
  const eyebrow=view==='workspace'?'ZRAIN / THE COLLECTION':group?`ZRAIN / ${esc(group.kind.toUpperCase())}`:'ZRAIN';
  const headline=view==='workspace'?'Useful tools. <em>Clearly organised.</em>':inTool?`Zrain <em>${esc(item[1])}</em>`:`Zrain <em>${esc(groupName)}</em>`;
  const lead=view==='workspace'?`Find the right workspace for what you need. Five products, ${catalog.length} tools, and no account required.`:esc(description);
  const navTarget=view==='workspace'?'#products':inTool?'../index.html':'#tools';
  const navText=view==='workspace'?'Browse products':inTool?`All ${esc(groupName)}`:'Browse tools';
  const appArea=view==='workspace'?
    `<section id="products"><div class="section-heading"><div><p class="eyebrow">THE ZRAIN TOOL COLLECTION</p><h2>Choose a workspace<span class="accent">.</span></h2></div><p>Five separately publishable Zrain products, each with its own collection of utilities.</p></div><div class="tool-grid group-grid" id="group-grid"></div></section>`:
    view==='group'?
    `<section id="tools"><div class="section-heading"><div><p class="eyebrow">${esc(group.kind.toUpperCase())} WORKSPACE</p><h2>Explore the tools<span class="accent">.</span></h2></div><p>${group.sections.reduce((sum,section)=>sum+section.tools.length,0)} utilities in one Zrain product.</p></div><nav id="section-nav" class="section-nav" aria-label="Tool sections"></nav><div id="group-sections"></div></section>`:
    `<section class="app-shell" aria-label="${esc(item[1])} tool"><div class="tool-toolbar"><a class="back-link" href="../index.html">← Back to Zrain ${esc(groupName)}</a><div class="tool-switch"><label for="tool-switcher">Switch tool</label><div class="select-control"><select id="tool-switcher" aria-label="Choose another ${esc(groupName)} tool">${group.sections.flatMap(s=>s.tools).map(slug=>{const row=bySlug.get(slug);return `<option value="${esc(slug)}"${slug===item[0]?' selected':''}>${esc(row[1])}</option>`}).join('')}</select></div></div></div><div class="app-title"><div><span class="eyebrow">${esc(groupName.toUpperCase())}</span><h2>${esc(item[1])}</h2></div><span class="local-chip">◉ Browser processing</span></div><div id="app"></div><p class="app-note">${esc(item[4])}</p></section>`;
  const discoveryMount=inTool?'':'<div id="discovery-root"></div>';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="theme-color" content="#fffaf6"/><meta name="description" content="${esc(description)}"/>
<link rel="icon" href="${base}zrain-logo.webp" type="image/webp"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="${base}style.css"/><link rel="stylesheet" href="${base}brand.css"/>${group?`<link rel="stylesheet" href="${base}feedback.css"/>`:""}
<title>${esc(title)} | Developed by Zrain</title></head>
<body data-tool="${inTool?esc(item[0]):view}" data-group="${group?esc(group.slug):''}" data-view="${view}" data-depth="${inTool?'1':'0'}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="zrain-header"><div class="zrain-header__inner"><div class="zrain-brand"></div><nav class="main-nav"><a href="https://zrain.web.app">Ecosystem</a><a href="${navTarget}">${navText}</a></nav></div></header>
<main class="main" id="main"><div class="hero"><div class="hero-copy"><span class="eyebrow"><span class="dot"></span> ${eyebrow}</span>
<h1>${headline}</h1><p class="lead">${lead}</p><div class="pills"><span class="pill">Free to use</span><span class="pill">No login needed</span><span class="pill">Browser-first</span></div></div>
<div class="hero-decoration" aria-hidden="true"><div class="hero-logo-frame"><img src="${base}zrain-logo.webp" alt="" width="165" height="165"/></div><div class="mini-chip">${view==='workspace'?'Five Zrain products':inTool?esc(groupName):'One simple workspace'}</div></div></div>
${discoveryMount}
${appArea}
${inTool?`<section id="zrain-feedback"></section><script src="https://zrain-community.web.app/embed.js" data-product="${esc(item[0])}" data-target="#zrain-feedback" defer></script>`:""}
</main>
<footer class="zrain-footer"><div class="zrain-footer__inner"><div class="zrain-footer__identity"></div><div class="zrain-footer__links"><a href="https://zrain.web.app">Ecosystem</a><a href="mailto:zrain.dev@gmail.com">Contact</a><a href="https://github.com/zrain03" target="_blank" rel="noopener noreferrer">GitHub</a></div></div></footer>
<div id="toast" role="status" aria-live="polite"></div><script type="module" src="${base}app.js"></script>${group&&!inTool?`<script defer src="${base}feedback-embed.js" data-product="${esc(group.slug)}"></script>`:""}</body></html>`;
};
// A local overview only. Actual product deployable roots are below.
await writeFile(join(out,'index.html'),cardPage({view:'workspace'}));
await copyAssets(out);
const exportManifest=[];
for (const group of groups){
  const dir=join(out,group.slug);
  await mkdir(dir,{recursive:true});
  await writeFile(join(dir,'index.html'),cardPage({view:'group',group}));
  await copyAssets(dir);
  const slugs=group.sections.flatMap(section=>section.tools);
  for(const slug of slugs){
    const item=bySlug.get(slug);
    if(!item)throw Error(`Unknown tool in ${group.slug}: ${slug}`);
    const toolDir=join(dir,slug);
    await mkdir(toolDir,{recursive:true});
    await writeFile(join(toolDir,'index.html'),cardPage({view:'tool',group,item}));
  }
  exportManifest.push({product:`Zrain ${group.title}`,slug:group.slug,description:group.description,toolCount:slugs.length,tools:slugs});
}
await writeFile(join(out,'products.json'),JSON.stringify(exportManifest,null,2));
const ecosystemCategories={
  'zrain-image-tools':'Online Services',
  'zrain-pdf-tools':'Online Services',
  'zrain-document-tools':'Online Services',
  'zrain-developer-tools':'Developer Tools',
  'zrain-productivity-tools':'Online Services'
};
const ecosystemDescriptions={
  'zrain-image-tools':'Browser-based image utilities to convert JPG, PNG and WebP, inspect colors and metadata, compare photos, crop, add watermarks, and create collages and visual art. No account needed. Image enhancement is standard resizing and sharpening, not AI detail recovery.',
  'zrain-pdf-tools':'Free, browser-first tools for merging, splitting, rotating, cropping, reorganizing, extracting text and rendering PDF pages, as well as visible editing and watermarks. Cropping is not redaction; existing PDF text is not directly rewritten. Some features fetch third-party libraries on first use.',
  'zrain-document-tools':'Convert supported PDF, DOCX and image formats in clearly labeled modes, compare text extracted from two documents, extract text from images with OCR and clean CSV data. Complex document layout is not guaranteed to survive conversion.',
  'zrain-developer-tools':'Free browser utilities for JSON, Base64, local JWT decoding, SHA checksums, UUID generation, CSS shadow previews, Markdown, QR codes, passwords and UTM links. JWT decoding does not verify signatures.',
  'zrain-productivity-tools':'Simple invoices, text utilities, timed focus sessions and a basic teleprompter. No account needed; focus history is stored on the current device only. The teleprompter does not yet support remote control, recordings or voice-follow.'
};
const ecosystemEntries=exportManifest.map((p,index)=>({
  name:p.product,slug:p.slug,category:ecosystemCategories[p.slug],
  description:ecosystemDescriptions[p.slug],status:'Draft',
  websiteUrl:null,logoAsset:'zrain-logo.webp',toolCount:p.toolCount,
  note:'Publish each website to its own real address, then add the verified URL to Zrain Ecosystem admin. Draft until live functionality is checked.'
}));
await writeFile(join(out,'ECOSYSTEM-ENTRIES.json'),JSON.stringify(ecosystemEntries,null,2));
console.log(`Built ${groups.length} independent Zrain products containing ${catalog.length} functional tools in dist/.`);
