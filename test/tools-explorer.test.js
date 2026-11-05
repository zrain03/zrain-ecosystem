/*
 * Fail / File: test/tools-explorer.test.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan tools explorer, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests tools explorer contracts, outputs and failure paths without making production requests.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PRODUCTS} from "../public/console-products.js";
import {FAMILIES,TOOLS} from "../public/tools-directory-data.js";
// BM: read: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan tools explorer, output dan kes gagal tanpa membuat permintaan production.
// EN: read: Reads relevant records and returns a bounded result to the caller. Module purpose: tests tools explorer contracts, outputs and failure paths without making production requests.
const read = filename => readFile(new URL(filename,import.meta.url),"utf8");

test("five distinct official Cloudflare Pages sites contain 28 unique real tool links",()=>{
  assert.equal(FAMILIES.length,5);
  assert.equal(TOOLS.length,28);
  assert.equal(new Set(TOOLS.map(x=>x.slug)).size,28);
  assert.equal(new Set(FAMILIES.map(x=>x.slug)).size,5);
  const counts=[13,3,4,5,3];
  FAMILIES.forEach((f,i)=>{
    assert.equal(f.count,counts[i]);
    assert.equal(f.url,"https://"+f.slug+".pages.dev/");
    assert.ok(["ONLINE_SERVICES","DEVELOPER_TOOLS"].includes(f.category));
    assert.equal(TOOLS.filter(t=>t.family===f.slug).length,counts[i]);
  });
  for(const tool of TOOLS) assert.ok(FAMILIES.some(f=>f.slug===tool.family));
});
test('all forty-eight tools are discoverable in eleven categories without duplicate portals',async()=>{
  const [html,ui]=await Promise.all([read('../public/index.html'),read('../public/ecosystem-unified.mjs')]);
  const {INVENTORY,CATEGORIES}=await import('../public/ecosystem-inventory.mjs');
  assert.equal(INVENTORY.filter(x=>x.kind==='tool').length,48);
  assert.equal(CATEGORIES.length,11);
  assert.match(html,/id="category-board"/);
  assert.match(ui,/category-card-list/);
  assert.doesNotMatch(html,/id="five-family-portals"/);
});

test('verified tool-family imports remain protected and cannot be published anonymously',async()=>{
  const [worker,source,admin,html]=await Promise.all([
    read('../catalog-worker/src/index.js'),read('../catalog-worker/src/products.js'),
    read('../public/admin/manage.mjs'),read('../public/admin/index.html')
  ]);
  assert.match(worker,/\/api\/admin\/products\/import-verified-tools/);
  assert.match(worker,/authenticated\(request,env\)/);
  assert.match(source,/VERIFIED_TOOLS/);
  assert.match(html,/id="project-form"/);
  assert.match(admin,/\/api\/admin\/auth\/login/);
});

test('all five product families have explicit HTTPS destinations without URL construction from user input',async()=>{
  const products=await read('../public/console-products.js');
  for(const family of FAMILIES){
    assert.ok(PRODUCTS[family.slug] || products.includes('"'+family.slug+'"'),family.slug);
    assert.match(family.url,/^https:\/\//);
    assert.match(products,new RegExp('"'+family.slug+'"'));
  }
});

test("PowerShell release script safely captures native Git output without early pipeline exit",async()=>{
  const script=await read("../scripts/deploy-v17-tools-launch.ps1");
  assert.match(script,/\$originLines = @\(& git -C \$root remote get-url origin\)/);
  assert.match(script,/\$origin = \(\$originLines -join ''\)\.Trim\(\)/);
  assert.doesNotMatch(script,/git -C \$root remote get-url origin \| Select-Object/);
});
