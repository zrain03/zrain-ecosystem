import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');

test('the new admin editor explains all required fields and hides technical ordering', async () => {
  const [html, js, css] = await Promise.all([
    read('../public/admin/index.html'),
    read('../public/admin/admin.js'),
    read('../public/admin/admin.css')
  ]);
  for (const field of ['product-name','product-description','product-category',
                       'product-logo-choice','product-action','product-url']) {
    assert.match(html, new RegExp('id="' + field + '"'));
  }
  assert.doesNotMatch(html, /id="product-order"/);
  assert.match(html, /id="advanced-options"/);
  assert.match(html, /id="product-slug" readonly/);
  assert.match(html, /id="import-existing"/);
  assert.match(html, /id="preview-name"/);
  assert.match(js, /\/api\/admin\/products\/import-existing/);
  assert.match(js, /createUniqueSlug/);
  assert.doesNotMatch(js, /inputs\.sortOrder/);
  assert.match(css, /\.advanced/);
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
