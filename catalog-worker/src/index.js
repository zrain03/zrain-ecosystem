// Zrain public product directory. Workers Free + Workers KV Free ONLY.
// No R2, paid storage, images, or billing-dependent integrations.
const MAX_CATALOG_BYTES = 250_000;
const CATALOG_KEY = "catalog/published-v1";
const JSON_HEADERS = Object.freeze({
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff"
});
function respond(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...JSON_HEADERS, ...headers }
  });
}
function allowedHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !!url.hostname && !url.username &&
      !url.password && !url.port && !url.hash.startsWith("#javascript:");
  } catch { return false; }
}
function validLogo(path) {
  return typeof path === "string" && path.length <= 500 &&
    (/^\/(?!\/)(?!.*\.\.)[a-zA-Z0-9_./-]+$/.test(path) || allowedHttpsUrl(path));
}
function validCatalog(value) {
  if (!Array.isArray(value) || value.length > 300) return false;
  const slugs = new Set();
  const categories = new Set(["GAMES", "DEVELOPER_TOOLS", "ONLINE_SERVICES", "WEB_UTILITIES"]);
  const actions = new Set(["CONSOLE", "WEBSITE", "GITHUB", "PLAY_STORE", "DOCUMENTATION", "SHOWCASE"]);
  for (const item of value) {
    if (!item || item.status !== "PUBLISHED" ||
        typeof item.slug !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) ||
        slugs.has(item.slug) ||
        typeof item.name !== "string" || !item.name.trim() || item.name.length > 100 ||
        typeof item.description !== "string" || item.description.length > 300 ||
        !categories.has(item.category) || !actions.has(item.primaryAction) ||
        typeof item.primaryLabel !== "string" || !item.primaryLabel.trim() ||
        item.primaryLabel.length > 50 ||
        !allowedHttpsUrl(item.primaryUrl) ||
        !validLogo(item.logoUrl) ||
        ((item.secondaryLabel == null) !== (item.secondaryUrl == null)) ||
        (item.secondaryUrl != null && (!allowedHttpsUrl(item.secondaryUrl) ||
          typeof item.secondaryLabel !== "string" ||
          !item.secondaryLabel.trim() || item.secondaryLabel.length > 50))) {
      return false;
    }
    slugs.add(item.slug);
  }
  return true;
}
function authorized(request, env) {
  const key = env.ZRAIN_CATALOG_PUBLISH_KEY;
  return typeof key === "string" && key.length >= 32 &&
    request.headers.get("Authorization") === "Bearer " + key;
}
async function readLimited(request, limit) {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (request.method === "GET" && path === "/api/health") {
      return respond({ status: "ok", service: "zrain-ecosystem-catalog", storage: "kv-free" },
        200, { "Cache-Control": "no-store" });
    }
    if (path !== "/api/catalog") {
      return respond({ error: "Not found" }, 404, { "Cache-Control": "no-store" });
    }
    // All catalog operations fail closed if KV has not been bound.
    if (!env.ZRAIN_CATALOG?.get || !env.ZRAIN_CATALOG?.put) {
      return respond({ error: "Catalog not configured" }, 503, { "Cache-Control": "no-store" });
    }
    if (request.method === "GET") {
      try {
        const value = await env.ZRAIN_CATALOG.get(CATALOG_KEY, "text");
        if (value === null) {
          return respond({ error: "Catalog not published" }, 404,
            { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" });
        }
        return new Response(value, {
          headers: {
            ...JSON_HEADERS,
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=30"
          }
        });
      } catch {
        return respond({ error: "Catalog temporarily unavailable" }, 503,
          { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" });
      }
    }
    if (request.method === "PUT") {
      if (!authorized(request, env)) return respond({ error: "Unauthorized" }, 401);
      if (Number(request.headers.get("Content-Length")) > MAX_CATALOG_BYTES) {
        return respond({ error: "Catalog too large" }, 413);
      }
      const data = await readLimited(request, MAX_CATALOG_BYTES);
      if (!data) return respond({ error: "Catalog too large" }, 413);
      let parsed;
      try { parsed = JSON.parse(new TextDecoder().decode(data)); }
      catch { return respond({ error: "Invalid JSON" }, 400); }
      if (!validCatalog(parsed)) return respond({ error: "Invalid published catalog" }, 400);
      try {
        await env.ZRAIN_CATALOG.put(CATALOG_KEY, JSON.stringify(parsed));
      } catch {
        // A Free-plan write limit must fail, NOT trigger an upgrade or bill.
        return respond({ error: "Catalog write unavailable or Free quota reached" }, 503);
      }
      return respond({ published: parsed.length, success: true }, 200,
        { "Cache-Control": "no-store" });
    }
    return respond({ error: "Method not allowed" }, 405, { "Allow": "GET, PUT" });
  }
};
