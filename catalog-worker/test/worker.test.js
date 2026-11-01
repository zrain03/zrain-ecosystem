import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

function mock() {
  const storage = new Map();
  return {
    ZRAIN_CATALOG_PUBLISH_KEY: "A".repeat(48),
    ZRAIN_CATALOG: {
      async get(key) { return storage.get(key) ?? null; },
      async put(key, data) { storage.set(key, data); }
    }
  };
}
const sample = {
  slug: "zrain-links", name: "Zrain Links", description: "Short links",
  logoUrl: "/zrain-logo.webp", status: "PUBLISHED",
  category: "ONLINE_SERVICES",
  primaryAction: "WEBSITE", primaryLabel: "Open Web App",
  primaryUrl: "https://zrain-links.web.app/",
  secondaryLabel: null, secondaryUrl: null, sortOrder: 10
};
const url = "https://zrain-ecosystem-catalog.example.workers.dev/api/catalog";
const authorized = env => ({ Authorization: "Bearer " + env.ZRAIN_CATALOG_PUBLISH_KEY });
const put = (env, list, headers) =>
  worker.fetch(new Request(url, {
    method: "PUT", headers: headers ?? authorized(env), body: JSON.stringify(list)
  }), env);

test("no catalog exists until the admin publishes one", async () => {
  const response = await worker.fetch(new Request(url), mock());
  assert.equal(response.status, 404);
});

test("catalog modification requires the backend secret", async () => {
  const response = await put(mock(), [sample], {});
  assert.equal(response.status, 401);
});

test("published product JSON is available anonymously via KV", async () => {
  const env = mock();
  const published = await put(env, [sample]);
  assert.equal(published.status, 200);
  assert.equal((await published.json()).published, 1);
  const response = await worker.fetch(new Request(url), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
  assert.deepEqual(await response.json(), [sample]);
});

test("unsafe URL or unpublished product is rejected", async () => {
  const env = mock();
  for (const entry of [
    { ...sample, primaryUrl: "javascript:alert(1)" },
    { ...sample, status: "DRAFT" },
    { ...sample, logoUrl: "data:image/svg+xml,<svg/>" },
    { ...sample, secondaryLabel: "Demo", secondaryUrl: "http://invalid" }
  ]) assert.equal((await put(env, [entry])).status, 400);
});

test("an unbound KV namespace fails closed", async () => {
  assert.equal((await worker.fetch(new Request(url), {})).status, 503);
  assert.equal((await put({ ZRAIN_CATALOG_PUBLISH_KEY: "A".repeat(48) }, [sample])).status, 503);
});

test("KV Free quota rejection returns unavailable rather than upgrading", async () => {
  const env = mock();
  env.ZRAIN_CATALOG.put = async () => { throw new Error("KV Free write limit reached"); };
  const response = await put(env, [sample]);
  assert.equal(response.status, 503);
});

test("oversized streaming catalog is rejected without Content-Length", async () => {
  const env = mock();
  const bytes = new Uint8Array(250_001);
  bytes.fill(32);
  const request = new Request(url, {
    method: "PUT",
    headers: authorized(env),
    body: new ReadableStream({ start(c) { c.enqueue(bytes); c.close(); } }),
    duplex: "half"
  });
  assert.equal((await worker.fetch(request, env)).status, 413);
});

test("media uploads are not supported and no R2 integration is required", async () => {
  const response = await worker.fetch(
    new Request("https://zrain-ecosystem-catalog.example.workers.dev/api/media", { method: "POST" }),
    mock()
  );
  assert.equal(response.status, 404);
});
