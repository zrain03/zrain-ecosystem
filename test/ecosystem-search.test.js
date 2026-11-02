import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import { PRODUCTS } from "../public/console-products.js";
import { FAMILIES, TOOLS } from "../public/tools-directory-data.js";
import { HUB_ENTRIES, buildSearchIndex, searchIndex, normalizeSearchText } from "../public/ecosystem-search-core.js";
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

test("homepage has global search dialog and shared catalog event, without replacing Bento products",async()=>{
  const [html,ui,style,directory]=await Promise.all([
    read("../public/index.html"),read("../public/ecosystem-search.js"),
    read("../public/style.css"),read("../public/product-directory.js")
  ]);
  assert.match(html, /id="ecosystem-search"/);
  assert.match(html, /id="ecosystem-query"/);
  assert.match(html, /data-open-search/);
  assert.match(html, /ecosystem-search.js/);
  assert.match(ui, /event\.ctrlKey \|\| event\.metaKey/);
  assert.match(ui, /showModal\(\)/);
  assert.match(ui, /textContent/);
  assert.doesNotMatch(ui, /\.innerHTML/);
  assert.match(directory, /zrain:catalog-rendered/);
  assert.match(style, /\.ecosystem-search::backdrop/);
  assert.equal((html.match(/class="bento-card /g)||[]).length,4);
});
