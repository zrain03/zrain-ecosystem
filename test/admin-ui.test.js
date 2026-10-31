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

test('all six fallback product cards contain their actions inside one outline', async () => {
  const [html, css, js] = await Promise.all([
    read('../public/index.html'),
    read('../public/style.css'),
    read('../public/product-directory.js')
  ]);
  const cards = [...html.matchAll(/<article class="product-entry">([\s\S]*?)<\/article>/g)].map(x => x[1]);
  assert.equal(cards.length, 6);
  for (const name of ['Guess The Flag', 'Memory Rush', 'Zrain Auth Starter', 'Zrain Monitor', 'Zrain UI', 'Zrain Links']) {
    assert.equal(cards.filter(card => card.includes('<strong>' + name + '</strong>')).length, 1, name);
  }
  for (const name of ['Guess The Flag', 'Memory Rush', 'Zrain Auth Starter', 'Zrain UI']) {
    const card = cards.find(x => x.includes('<strong>' + name + '</strong>'));
    assert.match(card, /class="product-actions"/);
    assert.match(card, /product-action-primary/);
    assert.match(card, /product-action-secondary/);
    assert.match(card, /<a class="item-cta product-action product-action-secondary"/);
  }
  assert.match(css, /\.product-entry\{display:grid/);
  assert.match(css, /\.product-actions\{display:flex/);
  assert.match(js, /card\.append\(image, copy, actions\)/);
  assert.doesNotMatch(js, /product-secondary-link|utilitiesRoot/);
});

test('legacy Web Utilities shares the Online Services section, and copy matches behavior', async () => {
  const [directory, home, admin] = await Promise.all([
    read('../public/product-directory.js'),
    read('../public/index.html'),
    read('../public/admin/index.html')
  ]);
  assert.match(directory, /product\.category === "WEB_UTILITIES" \? "ONLINE_SERVICES"/);
  assert.doesNotMatch(directory, /createElement\("section"\)/);
  assert.match(home, /USEFUL WHEN NEEDED/);
  assert.match(home, /Open these services whenever you need them/);
  assert.doesNotMatch(home, /EVERYDAY USE/);
  assert.doesNotMatch(admin, /<option value="WEB_UTILITIES"/);
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

test('local showcase action previews local HEX palette instead of old live page', async () => {
  const [html, client] = await Promise.all([
    read('../public/index.html'),
    read('../public/product-directory.js')
  ]);
  assert.match(html, /href="\\/zrain-ui-showcase\\.html"/);
  assert.match(client, /url === "https:\\/\\/zrain\\.web\\.app\\/zrain-ui-showcase\\.html"/);
});
