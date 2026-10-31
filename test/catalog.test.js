import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeCatalog, safeHttpsUrl, safeLogoUrl } from '../public/product-catalog-client.js';

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
test('admin front end uses real backend login and keeps token in memory',async()=>{
  const [html,js,cfg,backend] = await Promise.all([
    read('../public/admin/index.html'),read('../public/admin/admin.js'),
    read('../public/api-config.js'),
    read('../backend/src/main/java/dev/zrain/authstarter/config/SecurityConfig.java')
  ]);
  assert.match(html,/id="signin-form"/);
  assert.match(html,/id="product-form"/);
  assert.match(html,/noindex,nofollow/);
  assert.match(js,/\/api\/admin\/auth\/login/);
  assert.match(js,/let jwt = null/);
  assert.doesNotMatch(js,/localStorage|sessionStorage/);
  assert.match(backend,/hasRole\("ADMIN"\)/);
  assert.match(cfg,/ENABLE_DYNAMIC_CATALOG = false/);
});
