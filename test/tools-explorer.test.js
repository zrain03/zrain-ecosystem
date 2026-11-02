import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {FAMILIES,TOOLS} from "../public/tools-directory-data.js";
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
test("tools explorer is inside original three-category Products without new product sections",async()=>{
  const html=await read("../public/index.html");
  const script=await read("../public/tools-directory.js");
  const css=await read("../public/style.css");
  assert.equal((html.match(/class="bento-card /g)||[]).length,4);
  assert.match(html,/id="explore-tools"/);
  assert.match(html,/id="tools-search"/);
  assert.match(html,/id="tools-results"/);
  assert.match(html,/\/tools-directory.js/);
  assert.match(script,/\.url \+ tool\.slug \+ "\/"/);
  assert.match(script,/aria-pressed/);
  assert.match(script,/replaceChildren/);
  assert.match(css,/@media\(max-width:480px\)/);
});
test("admin-only import of five published Pages products, existing catalog remains editable",async()=>{
  const [worker,source,admin,html]=await Promise.all([
    read("../catalog-worker/src/index.js"),read("../catalog-worker/src/products.js"),
    read("../public/admin/admin.js"),read("../public/admin/index.html")
  ]);
  assert.match(worker,/\/api\/admin\/products\/import-verified-tools/);
  assert.match(worker,/const claims=await authenticated\(request,env\)/);
  assert.match(source,/VERIFIED_TOOLS/);
  assert.match(admin,/byId\("publish-verified-tools"\)/);
  assert.match(html,/id="publish-verified-tools"/);
  assert.doesNotMatch(admin,/localStorage\.setItem/);
});
test("Console has safe explicit links for all five standalone Zrain websites",async()=>{
  const [js,html]=await Promise.all([read("../public/console-products.js"),read("../public/zrain-console.html")]);
  for (const family of FAMILIES){
    assert.ok(js.includes('"'+family.slug+'"'));
    assert.ok(js.includes(family.url));
    assert.ok(html.includes('/?console='+family.slug));
  }
});

test("PowerShell release script safely captures native Git output without early pipeline exit",async()=>{
  const script=await read("../scripts/deploy-v17-tools-launch.ps1");
  assert.match(script,/\$originLines = @\(& git -C \$root remote get-url origin\)/);
  assert.match(script,/\$origin = \(\$originLines -join ''\)\.Trim\(\)/);
  assert.doesNotMatch(script,/git -C \$root remote get-url origin \| Select-Object/);
});
