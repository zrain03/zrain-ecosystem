import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

function mock() {
  const storage = new Map();
  return { ZRAIN_CATALOG_PUBLISH_KEY:"A".repeat(48),
    ZRAIN_ASSETS: {
      async get(key) {
        const item = storage.get(key);
        return item ? { body:item.body, httpEtag:'"abc"', httpMetadata:item.meta } : null;
      },
      async put(key, body, options) {
        storage.set(key, { body, meta:options?.httpMetadata });
      }
    }
  };
}
const sample = { slug:"zrain-links", name:"Zrain Links",description:"Short links",
  logoUrl:"/zrain-logo.webp",status:"PUBLISHED",category:"ONLINE_SERVICES",
  primaryAction:"WEBSITE",primaryLabel:"Open Web App",primaryUrl:"https://zrain-links.web.app/",
  secondaryLabel:null,secondaryUrl:null,sortOrder:10 };
test("public data unavailable until a real published snapshot exists", async()=>{
  const env=mock();
  const response=await worker.fetch(new Request("https://example.workers.dev/api/catalog"),env);
  assert.equal(response.status,404);
});
test("catalog modification rejects requests without backend secret",async()=>{
  const env=mock(), url="https://example.workers.dev/api/catalog";
  const response=await worker.fetch(new Request(url,{method:"PUT",body:JSON.stringify([sample])}),env);
  assert.equal(response.status,401);
});
test("backend may publish valid catalog and any visitor may read it",async()=>{
  const env=mock(), url="https://example.workers.dev/api/catalog";
  const response=await worker.fetch(new Request(url,{method:"PUT",
    headers:{Authorization:"Bearer "+env.ZRAIN_CATALOG_PUBLISH_KEY},
    body:JSON.stringify([sample])}),env);
  assert.equal(response.status,200);
  const get=await worker.fetch(new Request(url),env);
  assert.equal(get.status,200);
  assert.equal(get.headers.get("Access-Control-Allow-Origin"),"*");
  assert.deepEqual(await get.json(),[sample]);
});
test("invalid URLs and archived products cannot enter the public snapshot",async()=>{
  const env=mock(), url="https://example.workers.dev/api/catalog";
  for (const entry of [{...sample,primaryUrl:"javascript:alert(1)"},{...sample,status:"DRAFT"}]) {
    const response=await worker.fetch(new Request(url,{method:"PUT",
      headers:{Authorization:"Bearer "+env.ZRAIN_CATALOG_PUBLISH_KEY},
      body:JSON.stringify([entry])}),env);
    assert.equal(response.status,400);
  }
});
test("logo upload rejects invalid bytes even with permitted content type",async()=>{
  const env=mock();
  const res=await worker.fetch(new Request("https://example.workers.dev/api/media",{
    method:"POST",headers:{Authorization:"Bearer "+env.ZRAIN_CATALOG_PUBLISH_KEY,
      "Content-Type":"image/png"},body:new Uint8Array([1,2,3,4])
  }),env);
  assert.equal(res.status,400);
});
