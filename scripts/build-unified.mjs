/*
 * Fail / File: scripts/build-unified.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengintegrasikan halaman Tools hasil build ke dalam public tanpa mengubah logic sumber.
 * EN: Integrates built Tools pages into public without changing their source logic.
 */
import {readFile, writeFile, mkdir, rm, cp, copyFile, readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const here=resolve(fileURLToPath(new URL('.',import.meta.url)));
const root=resolve(here,'..');
const runtime=join(root,'tool-runtime');
const source=join(runtime,'dist');
const destination=join(root,'public','tools');
const manifest=JSON.parse(await readFile(join(root,'docs','runtime-map.json'),'utf8'));

if(process.argv.includes('--rebuild-runtime')){
  // Run the known package build entry point through Node itself. This avoids
  // Windows Node 24 spawnSync npm.cmd EINVAL and does not require a shell.
  execFileSync(process.execPath,[join(runtime,'src','build.mjs')],{cwd:runtime,stdio:'inherit'});
}
if(manifest.length!==46||new Set(manifest.map(x=>x.slug)).size!==46)throw Error('Manifest requires 46 unique real tools.');
await rm(destination,{recursive:true,force:true});
await mkdir(destination,{recursive:true});
// Original JS and CSS runtime depend on relative imports and filenames; preserve them.
// BM: Ambil asset terkini terus daripada source v2.4, bukannya senarai 48 alat lama.
// EN: Include all approved v2.4 modules without falling back to the old 48-tool bundle.
const shared=['form-copy.mjs','style.css','brand.css','zrain-ui.js','app.js','catalog.mjs','core.mjs',
'image-metadata.mjs','qr-local.mjs','jszip.min.js','discovery.mjs','discovery-ui.mjs','ux-help.mjs','workflow-guide.mjs',
'extended-core.mjs','extended-tools.mjs','art-core.mjs','art-tools.mjs','visual-editors.mjs',
'pdf-visual.mjs','docx-layout.mjs','pdf-reorder.mjs','ai-background.mjs','zrain-logo.webp'];
for(const name of shared)await copyFile(join(source,name),join(destination,name));
await cp(join(source,'licenses'),join(destination,'licenses'),{recursive:true});
let app=await readFile(join(destination,'app.js'),'utf8');
const pattern="mountZrainUI({product:group?group.title:'Tools',logoSrc:inTool?'../zrain-logo.webp':'./zrain-logo.webp',productHref:inTool?'../index.html':'./index.html'});";
if(!app.includes(pattern))throw Error('Unexpected original Zrain UI call; inspect before rebuild.');
app=app.replace(pattern,"mountZrainUI({product:'Ecosystem',logoSrc:inTool?'../zrain-logo.webp':'./zrain-logo.webp',productHref:'/'});");
await writeFile(join(destination,'app.js'),app);
await copyFile(join(root,'public','unified-tool.css'),join(destination,'unified-tool.css'));
for(const {slug,family,name} of manifest){
  const page=join(source,family,slug,'index.html');
  let html=await readFile(page,'utf8');
  // Change product names/URLs while preserving the actual tool mount and CSS runtime.
  html=html.replace('<title>','<title>')
    .replace(/<title>[^<]*<\/title>/,`<title>${name.replaceAll('&','&amp;')} | Zrain Ecosystem</title>`)
    .replace('Zrain <em>', '<em>')
    .replace(/← Back to Zrain [^<]+/,'← Back to Zrain Ecosystem')
    .replaceAll('href="../index.html"','href="/"')
    .replaceAll('href="https://zrain.web.app"','href="/"')
    .replace('<link rel="stylesheet" href="../brand.css"/>','<link rel="stylesheet" href="../brand.css"/><link rel="stylesheet" href="../unified-tool.css"/>');
  // The tool selector is a global switcher, not a siloed list of family products.
  const options=manifest.map(item=>`<option value="${item.slug}"${item.slug===slug?' selected':''}>${item.name.replaceAll('&','&amp;')}</option>`).join('');
  html=html.replace(/(<select id="tool-switcher"[^>]*>)[\s\S]*?(<\/select>)/,(_a,start,end)=>start+options+end);
  html=html.replace(/Switch tool<\/label>/,'Switch function</label>');
  html=html.replace('Zrain '+name,'Zrain Ecosystem · '+name);
  html=html.replace('data-product="'+family+'"','data-product="zrain-ecosystem"');
  html=html.replace(/All (?:Image|PDF|Document|Developer|Productivity) Tools/g,'Explore all');
  html=html.replace(/<span class="eyebrow">(?:IMAGE|PDF|DOCUMENT|DEVELOPER|PRODUCTIVITY) TOOLS<\/span>/g,'<span class="eyebrow">ZRAIN ECOSYSTEM</span>');
  html=html.replace(/aria-label="Choose another [^"]* tool"/,'aria-label="Switch to another Zrain function"');
  const target=join(destination,slug);await mkdir(target,{recursive:true});
  await writeFile(join(target,'index.html'),html);
}
// BM: Pautan lama kekal boleh dibuka tetapi tidak dikira atau diiklankan sebagai Tools aktif.
// EN: Retired bookmarks remain usable without inflating the 46-tool public catalog.
const renamedPaths={
 'word-counter':'/tools/text-counter/',
 'extract-pdf-pages':'/tools/split-pdf/',
 'image-to-ascii':'/tools/image-to-ascii-art/',
 'icon-maker':'/tools/image-resizer/',
 'compare':'/',
 'focus-timer':'/'
};
for(const [slug,target] of Object.entries(renamedPaths)){
 if(manifest.some(item=>item.slug===slug))throw Error('Active tool cannot be redirected: '+slug);
 const folder=join(destination,slug);
 await mkdir(folder,{recursive:true});
 await writeFile(join(folder,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${target}"><title>Zrain Tools: Updated Location</title><p>This older tool address has moved or retired. <a href="${target}">Continue to Zrain</a>.</p></html>`);
}
// The old /tools/ directory is not a sixth product. It returns to the hub.
await writeFile(join(destination,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/"><link rel="canonical" href="/"><title>Zrain Ecosystem</title><p>Browse all tools at <a href="/">Zrain Ecosystem</a>.</p></html>`);
console.log(`Integrated ${manifest.length} working tool pages under public/tools/`);
