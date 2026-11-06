/*
 * Fail / File: tool-runtime/tests/approved-ux.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 tests)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji fungsi dan regresi sebenar Zrain Tools v2.4.0.
 * EN: Tests real functionality and regressions for Zrain Tools v2.4.0.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {catalog,groups} from '../src/catalog.mjs';
import {parseEmojis,artDimensions,ART_SLUGS,artworkPdf} from '../src/art-core.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));

test('46 names sorted A-Z independently within 5 groups with right numbering offsets',()=>{
 assert.equal(catalog.length,46);
 assert.equal(groups.length,5);
 assert.deepEqual(groups.map(g=>g.sections.flatMap(s=>s.tools).length),[18,12,2,11,3]);
 const names=new Map(catalog.map(a=>[a[0],a[1]]));
 const slugs=[];
 for(const group of groups){
  const local=group.sections.flatMap(s=>s.tools);
  const titles=local.map(k=>names.get(k));
  assert.deepEqual(titles,[...titles].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base'})));
  slugs.push(...local);
 }
 assert.deepEqual(slugs,catalog.map(x=>x[0]));
});
test('final public catalog excludes retired pages, and includes Text Counter and 5 named art pages',()=>{
 const names=catalog.map(x=>x[1]);
 for(const name of ['Image to Emoji Art','Image to Pixel Art','Image to ASCII Art','Image to Binary Art','Image to Block Art','Text Counter'])assert.ok(names.includes(name),name);
 for(const slug of ['focus-timer','icon-maker','extract-pdf-pages','word-counter','image-to-ascii'])assert.equal(catalog.some(x=>x[0]===slug),false,slug);
 assert.equal(ART_SLUGS.length,5);
});
test('user can supply their own emoji sequences, including skin tone and flags',()=>{
 assert.deepEqual(parseEmojis('🐱 💖 🇲🇾 👍🏽 🐱'),['🐱','💖','🇲🇾','👍🏽']);
 assert.deepEqual(parseEmojis('letters only'),[]);
 assert.equal(parseEmojis('❤️ '.repeat(30)).length,1);
});
test('art sizing is bounded and preserves portrait aspect roughly',()=>{
 const a=artDimensions(400,800,'emoji-art',90);
 const b=artDimensions(800,400,'emoji-art',90);
 assert.ok(a.rows>b.rows);assert.ok(a.cols>0);assert.ok(a.rows<=200);
 assert.throws(()=>artDimensions(0,1,'pixel-art',60));
});
test('published pages show true Zrain Community iframe, not GitHub Issues',async()=>{
 const f=await readFile(join(root,'src/build.mjs'),'utf8');
 assert.match(f,/https:\/\/zrain-community\.web\.app\/embed\.js/);
 assert.match(f,/inTool\?item\[0\]:group\.slug/);
 assert.doesNotMatch(f,/feedback-embed\.js/);
});
test('art export options are manual after live preview, including custom emoji edit',async()=>{
 const f=await readFile(join(root,'src/art-tools.mjs'),'utf8');
 assert.match(f,/Emojis to use/);
 assert.match(f,/Download /);
 assert.match(f,/addEventListener\('input',schedule\)/);
 assert.match(f,/renderImage\(art\.canvas\)/);
 assert.match(f,/artworkPdf/);
});
test('all generated pages have unique tool-specific community identity and input-first design',async()=>{
 const manifest=JSON.parse(await readFile(join(root,'dist/products.json'),'utf8'));
 assert.equal(manifest.reduce((n,p)=>n+p.toolCount,0),46);
 for(const group of manifest){for(const slug of group.tools){
  const html=await readFile(join(root,'dist',group.slug,slug,'index.html'),'utf8');
  assert.match(html,new RegExp('data-product="'+slug+'"'));
  assert.match(html,/id="app"/);
  assert.match(html,/zrain-community\.web\.app/);
  assert.doesNotMatch(html,/github\.com\/zrain03\/zrain-ecosystem\/issues\//);
 }}
});
test('real JPEG bytes embedded in art PDF generate a parseable single-page PDF',async()=>{
 const jpg=await readFile(join(root,'tests/fixtures/test-art.jpg'));
 const fakeCanvas={width:3,height:3,toDataURL:()=>`data:image/jpeg;base64,${jpg.toString('base64')}`};
 const pdf=artworkPdf(fakeCanvas);
 const bytes=new Uint8Array(await pdf.arrayBuffer());
 assert.equal(pdf.type,'application/pdf');
 assert.ok(bytes.length>jpg.length+200);
 assert.ok(Buffer.from(bytes.subarray(0,8)).toString().startsWith('%PDF-1.4'));
 assert.match(Buffer.from(bytes).toString('latin1'),/\/Type \/Page\b/);
 assert.match(Buffer.from(bytes).toString('latin1'),/startxref/);
});

test('retired URL bookmarks redirect without adding extra catalog pages',async()=>{
 const image=await readFile(join(root,'dist/zrain-image-tools/_redirects'),'utf8');
 const pdf=await readFile(join(root,'dist/zrain-pdf-tools/_redirects'),'utf8');
 const developer=await readFile(join(root,'dist/zrain-developer-tools/_redirects'),'utf8');
 assert.match(image,/image-to-ascii\/ \/image-to-ascii-art\/ 301/);
 assert.match(image,/icon-maker\/ \/image-resizer\/ 301/);
 assert.match(pdf,/extract-pdf-pages\/ \/split-pdf\/ 301/);
 assert.match(developer,/word-counter\/ \/text-counter\/ 301/);
});
