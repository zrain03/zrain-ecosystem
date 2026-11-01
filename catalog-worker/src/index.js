// Public catalog + logos. Never put the publish secret in the browser or source.
const MAX_CATALOG_BYTES = 250_000;
const MAX_MEDIA_BYTES = 2_000_000;
const CATALOG_KEY = "catalog/published.json";
const TEXT = { "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff" };
function respond(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...TEXT, ...headers } });
}
function allowed(url) {
  try { const u = new URL(url);
    return u.protocol === "https:" && !!u.hostname && !u.username && !u.password && !u.port;
  } catch { return false; }
}
function validLogo(path) {
  return typeof path === "string" &&
    (/^\/(?!\/)(?!.*\.\.)[a-zA-Z0-9_./-]+$/.test(path) || allowed(path));
}
function validCatalog(value) {
  if (!Array.isArray(value) || value.length > 300) return false;
  const slugs = new Set();
  const categories = new Set(["GAMES","DEVELOPER_TOOLS","ONLINE_SERVICES","WEB_UTILITIES"]);
  const actions = new Set(["CONSOLE","WEBSITE","GITHUB","PLAY_STORE","DOCUMENTATION","SHOWCASE"]);
  for (const item of value) {
    if (!item || item.status !== "PUBLISHED" || typeof item.slug !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || slugs.has(item.slug) ||
        typeof item.name !== "string" || !item.name.trim() || item.name.length > 100 ||
        typeof item.description !== "string" || item.description.length > 300 ||
        !categories.has(item.category) || !actions.has(item.primaryAction) ||
        typeof item.primaryLabel !== "string" || !item.primaryLabel.trim() ||
        item.primaryLabel.length > 50 || !allowed(item.primaryUrl) ||
        !validLogo(item.logoUrl) ||
        ((item.secondaryLabel == null) !== (item.secondaryUrl == null)) ||
        (item.secondaryUrl != null && (!allowed(item.secondaryUrl) ||
         typeof item.secondaryLabel !== "string" || !item.secondaryLabel.trim()))) return false;
    slugs.add(item.slug);
  }
  return true;
}
function authorized(request, env) {
  const key = env.ZRAIN_CATALOG_PUBLISH_KEY;
  const given = request.headers.get("Authorization");
  return typeof key === "string" && key.length >= 32 &&
    given === "Bearer " + key;
}
// Bound the upload size while reading. Content-Length is optional and cannot be trusted.
async function readLimited(request, limit) {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let position = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, position);
    position += chunk.byteLength;
  }
  return bytes;
}
function mediaType(bytes) {
  if (bytes.length >= 8 &&
      bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71 &&
      bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return "image/jpeg";
  if (bytes.length >= 12 &&
      String.fromCharCode(...bytes.subarray(0,4)) === "RIFF" &&
      String.fromCharCode(...bytes.subarray(8,12)) === "WEBP") return "image/webp";
  return null;
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "GET" && path === "/api/health")
      return respond({ status: "ok", service: "zrain-ecosystem-catalog" },
        200, { "Cache-Control":"no-store" });
    if (request.method === "GET" && path === "/api/catalog") {
      const object = await env.ZRAIN_ASSETS.get(CATALOG_KEY);
      if (!object) return respond({ error: "Catalog not published" }, 404,
        { "Access-Control-Allow-Origin":"*", "Cache-Control":"no-store" });
      return new Response(object.body, {
        headers: { ...TEXT, "Access-Control-Allow-Origin":"*",
          "Cache-Control":"public, max-age=30, stale-while-revalidate=60",
          "ETag":object.httpEtag || "" }
      });
    }
    if (request.method === "GET" && /^\/api\/media\/[a-f0-9-]{36}\.(?:png|jpg|webp)$/.test(path)) {
      const object = await env.ZRAIN_ASSETS.get("media/" + path.slice("/api/media/".length));
      if (!object) return respond({ error:"Not found" }, 404);
      return new Response(object.body, {
        headers: { "Content-Type":object.httpMetadata?.contentType || "application/octet-stream",
          "Cache-Control":"public, max-age=31536000, immutable",
          "X-Content-Type-Options":"nosniff",
          "Access-Control-Allow-Origin":"*" }
      });
    }
    if (path === "/api/catalog" && request.method === "PUT") {
      if (!authorized(request, env)) return respond({ error:"Unauthorized" }, 401);
      if (Number(request.headers.get("Content-Length")) > MAX_CATALOG_BYTES)
        return respond({ error:"Catalog too large" }, 413);
      const data = await readLimited(request, MAX_CATALOG_BYTES);
      if (!data) return respond({ error:"Catalog too large" }, 413);
      let parsed;
      try { parsed = JSON.parse(new TextDecoder().decode(data)); }
      catch { return respond({ error:"Invalid JSON" }, 400); }
      if (!validCatalog(parsed)) return respond({ error:"Invalid published catalog" }, 400);
      await env.ZRAIN_ASSETS.put(CATALOG_KEY, JSON.stringify(parsed), {
        httpMetadata: { contentType: "application/json" }
      });
      return respond({ published:parsed.length, success:true }, 200, { "Cache-Control":"no-store" });
    }
    if (path === "/api/media" && request.method === "POST") {
      if (!authorized(request, env)) return respond({ error:"Unauthorized" }, 401);
      if (Number(request.headers.get("Content-Length")) > MAX_MEDIA_BYTES)
        return respond({ error:"Image too large" }, 413);
      const bytes = await readLimited(request, MAX_MEDIA_BYTES);
      if (!bytes || !bytes.length)
        return respond({ error:"Image must be under 2 MB" }, 413);
      const type = mediaType(bytes);
      if (!type || type !== request.headers.get("Content-Type")?.split(";")[0]?.trim())
        return respond({ error:"Upload PNG, JPEG or WebP only" }, 400);
      const extension = { "image/png":"png","image/jpeg":"jpg","image/webp":"webp" }[type];
      const name = crypto.randomUUID() + "." + extension;
      await env.ZRAIN_ASSETS.put("media/" + name, bytes, {
        httpMetadata: { contentType: type }
      });
      return respond({ url: url.origin + "/api/media/" + name }, 201,
        { "Cache-Control":"no-store" });
    }
    return respond({ error:"Not found" }, 404, { "Cache-Control":"no-store" });
  }
};
