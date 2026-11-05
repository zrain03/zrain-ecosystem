/*
 * Fail / File: test/ecosystem-search.test.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan ecosystem search, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests ecosystem search contracts, outputs and failure paths without making production requests.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import { PRODUCTS } from "../public/console-products.js";
import { FAMILIES, TOOLS } from "../public/tools-directory-data.js";
import { HUB_ENTRIES, buildSearchIndex, searchIndex, normalizeSearchText } from "../public/ecosystem-search-core.js";
// BM: read: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan ecosystem search, output dan kes gagal tanpa membuat permintaan production.
// EN: read: Reads relevant records and returns a bounded result to the caller. Module purpose: tests ecosystem search contracts, outputs and failure paths without making production requests.
const read = f => readFile(new URL(f, import.meta.url), "utf8");

test("search indexes every known public project plus all 28 actual tool deep links", () => {
  const index = buildSearchIndex({fallbackProducts: PRODUCTS, families: FAMILIES, tools: TOOLS});
  assert.equal(index.length, Object.keys(PRODUCTS).length + HUB_ENTRIES.length + TOOLS.length);
  assert.equal(new Set(index.map(x=>x.id)).size, index.length);
  assert.equal(index.filter(x=>x.type==="tool").length, 28);
  for(const item of index) { assert.match(item.url, /^https:\/\//); assert.ok(item.name); }
  assert.equal(searchIndex(index, "memory rush")[0].name, "Memory Rush");
  assert.equal(searchIndex(index, "zrain console")[0].name, "Zrain Console");
  assert.equal(searchIndex(index, "invoice")[0].name, "Invoice Generator");
  assert.equal(searchIndex(index, "pdf", {type:"tool", limit:100}).every(x=>x.type==="tool"),true);
  assert.equal(searchIndex(index, "json", {type:"project"}).some(x=>x.type==="tool"),false);
});

test("search normalizes accents, selects better literal matches, and rejects invalid destinations", () => {
  assert.equal(normalizeSearchText("  Mémory  "), "memory");
  const index = buildSearchIndex({
    fallbackProducts: {"x":{name:"JSON Editor",webUrl:"javascript:alert(1)"}},
    families:[{slug:"ok", name:"Zrain Test",url:"https://example.com/"}],
    tools:[{slug:"ok",name:"Safe Tool",family:"ok",description:"Local"}]
  });
  assert.ok(!index.some(x=>x.name==="JSON Editor"));
  assert.equal(searchIndex(index,"safe")[0].name,"Safe Tool");
  assert.equal(searchIndex(index,"nonexistent").length,0);
});

test("published catalog replaces fallback product list; unpublished products cannot leak into search", () => {
  const index=buildSearchIndex({
    fallbackProducts:PRODUCTS, families:FAMILIES, tools:TOOLS,
    publishedProducts:[{
      slug:"public-new-product",name:"New published product",
      category:"ONLINE_SERVICES",primaryUrl:"https://example.com/new",
      description:"An actual published app."
    }]
  });
  assert.ok(index.some(x=>x.name==="New published product"));
  assert.equal(index.some(x=>x.name==="Memory Rush"),false);
  assert.ok(index.some(x=>x.name==="Zrain Ecosystem"));
  assert.equal(index.filter(x=>x.type==="tool").length,28);
});

test('homepage search and eleven categories share the current published catalogue',async()=>{
  const [html,ui,core,style] = await Promise.all([
    read('../public/index.html'),read('../public/ecosystem-unified.mjs'),
    read('../public/ecosystem-catalog.mjs'),read('../public/ecosystem-unified.css')
  ]);
  assert.match(html,/id="search-dialog"/);
  assert.match(html,/id="home-search-input"/);
  assert.match(html,/id="category-board"/);
  assert.match(ui,/renderAllCategories/);
  assert.match(core,/getActiveInventory/);
  assert.match(core,/setPublishedCatalog/);
  assert.match(style,/\.category-card/);
  assert.doesNotMatch(ui,/eval\s*\(/);
});
