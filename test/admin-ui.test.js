/*
 * Fail / File: test/admin-ui.test.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan admin ui, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests admin ui contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// BM: read: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan admin ui, output dan kes gagal tanpa membuat permintaan production.
// EN: read: Reads relevant records and returns a bounded result to the caller. Module purpose: tests admin ui contracts, outputs and failure paths without making production requests.
const read = path => readFile(new URL(path, import.meta.url), 'utf8');

test('the protected editor exposes meaningful fields across eleven categories',async()=>{
  const [html, core, ui] = await Promise.all([
    read('../public/admin/index.html'),read('../public/admin/manage-core.mjs'),read('../public/admin/manage.mjs')
  ]);
  for(const id of ['login-form','admin-dashboard','project-form','field-name','field-description','field-category','field-url','field-github','field-slug','password-form'])
    assert.match(html, new RegExp('id="'+id+'"'), id);
  assert.match(html,/id="metric-categories">11</);
  assert.match(core,/export const CATEGORY_CODES/);
  assert.match(ui,/\/api\/admin\/auth\/login/);
  assert.match(ui,/let jwt = null/);
});

test('the imported inventory includes all six existing live Zrain products as drafts', async () => {
  const source = await read('../backend/src/main/java/dev/zrain/authstarter/products/ExistingProducts.java');
  for (const slug of ['guess-the-flag','memory-rush','zrain-auth-starter',
                      'zrain-monitor','zrain-links','zrain-ui']) {
    assert.ok(source.includes('"' + slug + '"'), slug);
  }
  assert.match(source, /Product\.Action\.GITHUB, "View on GitHub"/);
  assert.match(source, /Product\.Action\.CONSOLE, "Play Now"/);
  const api = await read('../backend/src/main/java/dev/zrain/authstarter/products/ProductApi.java');
  assert.match(api, /import-existing/);
  assert.match(api, /nextPosition/);
});

test('eleven category cards are rendered from one inventory with five-row scrolling',async()=>{
  const {INVENTORY,CATEGORIES} = await import('../public/ecosystem-inventory.mjs');
  const [html, ui] = await Promise.all([read('../public/index.html'),read('../public/ecosystem-unified.mjs')]);
  assert.equal(INVENTORY.length,56);
  assert.equal(CATEGORIES.length,11);
  assert.match(html,/id="category-board"/);
  assert.match(ui,/CATEGORIES\.map\(renderCategory\)/);
  assert.match(ui,/ranked\.slice\(0,5\)/);
  assert.match(ui,/setExpanded\(!state\.open\)/);
});

test('legacy Worker category codes remain readable without overriding official categories',async()=>{
  const {categoryFromWorker,categoryToWorker,WORKER_CATEGORIES} = await import('../public/admin/manage-core.mjs');
  assert.equal(WORKER_CATEGORIES.WEB_UTILITIES,'productivity');
  assert.equal(categoryFromWorker('WEB_UTILITIES','pdf'),'pdf');
  assert.equal(categoryFromWorker('UNKNOWN','games'),'games');
  for(const category of ['games','ai','infrastructure','links','monitoring','pdf','image','document','art','developer','productivity'])
    assert.ok(categoryToWorker(category));
});

test('Zrain UI showcase displays exact hexadecimal codes under every swatch', async () => {
  const page = await read('../public/zrain-ui-showcase.html');
  for (const [name, code] of [
    ['Warm Surface', '#FFFAF6'],
    ['Deep Navy', '#172433'],
    ['Terracotta', '#B95136'],
    ['Soft Mint', '#E6F1EC']
  ]) {
    assert.match(page, new RegExp('<strong>' + name + '</strong><code>' + code + '</code>'));
  }
  assert.equal((page.match(/class="swatch-item"/g)||[]).length, 4);
});

test('the Console offers the local Zrain UI showcase without arbitrary URL injection',async()=>{
  const [consoleCode,showcase] = await Promise.all([
    read('../public/zrain-console.js'),read('../public/zrain-ui-showcase.html')
  ]);
  assert.match(consoleCode,/fetch\("\/zrain-ui-showcase\.html"/);
  assert.match(consoleCode,/frame\.srcdoc = markup/);
  assert.match(showcase,/Zrain UI/);
  assert.doesNotMatch(consoleCode,/frame\.src = requestedDemo/);
});

test('admin publishing remains privileged and account credentials stay outside public HTML',async()=>{
  const [worker,admin,html] = await Promise.all([
    read('../catalog-worker/src/index.js'),read('../public/admin/manage.mjs'),read('../public/admin/index.html')
  ]);
  assert.match(worker,/const claims=await authenticated\(request,env\)/);
  assert.match(worker,/\/api\/admin\/products/);
  assert.match(admin,/\/api\/admin\/auth\/password/);
  assert.match(html,/id="password-form"/);
  assert.doesNotMatch(admin,/localStorage\.setItem\([^,]*jwt/);
});

test('all project preview actions use the allowlisted inline Console',async()=>{
  const {INVENTORY} = await import('../public/ecosystem-inventory.mjs');
  const [html,ui,consoleCode] = await Promise.all([
    read('../public/index.html'),read('../public/ecosystem-unified.mjs'),read('../public/ecosystem-quick-console.mjs')
  ]);
  assert.equal(INVENTORY.filter(x=>x.kind==='project').length,10);
  assert.match(html,/id="zrain-preview-frame"/);
  assert.match(ui,/resultRow\(/);
  assert.match(consoleCode,/zrain-preview-frame/);
  assert.ok(INVENTORY.every(x=>x.url.startsWith('https://')||x.url.startsWith('/')));
});

test('Zrain UI Console loads the local showcase as srcdoc, never a GitHub iframe',async()=>{
  const js=await read('../public/zrain-console.js');
  assert.match(js,/item\.slug === "zrain-ui" \? PRODUCTS\["zrain-ui"\]\.webUrl/);
  assert.match(js,/fetch\("\/zrain-ui-showcase\.html"/);
  assert.match(js,/frame\.srcdoc = markup/);
  assert.match(js,/frame\.removeAttribute\("srcdoc"\)/);
  assert.match(js,/localShowcase: id === "zrain-ui"/);
});
