/*
 * Fail / File: test/catalog.test.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan catalog, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests catalog contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeCatalog, safeHttpsUrl, safeLogoUrl } from '../public/product-catalog-client.js';

// BM: read: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan catalog, output dan kes gagal tanpa membuat permintaan production.
// EN: read: Reads relevant records and returns a bounded result to the caller. Module purpose: tests catalog contracts, outputs and failure paths without making production requests.
const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const sample = {
  slug:'filefit', name:'FileFit', description:'Convert files',
  status:'PUBLISHED', category:'WEB_UTILITIES', logoUrl:'/zrain-logo.webp',
  primaryAction:'WEBSITE', primaryLabel:'Open Web App', primaryUrl:'https://filefit.example/',
  sortOrder:4
};

test('public catalog normalizes only valid published entries',()=>{
  assert.deepEqual(normalizeCatalog([sample])[0].name,'FileFit');
  assert.equal(normalizeCatalog([{...sample,slug:'draft',status:'DRAFT'}]).length,0); // updated by publish state upstream
});
test('catalog rejects unsafe URLs, duplicate slugs and invalid actions',()=>{
  assert.equal(safeHttpsUrl('javascript:alert(1)'),null);
  assert.equal(safeLogoUrl('//evil.example/a.png'),null);
  assert.equal(safeLogoUrl('/safe/../bad.png'),null);
  assert.throws(()=>normalizeCatalog([{...sample,primaryUrl:'javascript:alert(1)'}]));
  assert.throws(()=>normalizeCatalog([{...sample,primaryAction:'DOWNLOAD_EXECUTABLE'}]));
  assert.throws(()=>normalizeCatalog([sample,sample]));
});
test('the administrator UI logs in through the protected API and retains tokens only in memory',async()=>{
  const [html,js,worker] = await Promise.all([
    read('../public/admin/index.html'),read('../public/admin/manage.mjs'),read('../catalog-worker/src/index.js')
  ]);
  assert.match(html,/id="login-form"/);
  assert.match(html,/id="project-form"/);
  assert.match(html,/noindex,nofollow/);
  assert.match(js,/\/api\/admin\/auth\/login/);
  assert.match(js,/let jwt = null/);
  assert.doesNotMatch(js,/localStorage\.(?:setItem|getItem)\([^)]*(?:jwt|token)/i);
  assert.match(worker,/authenticated\(request,env\)/);
});
