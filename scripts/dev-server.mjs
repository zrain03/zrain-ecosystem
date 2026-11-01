import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../public/", import.meta.url)));
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".webp": "image/webp", ".png": "image/png",
  ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".json": "application/json"
};
const server = createServer(async (request, response) => {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405); return response.end("Method not allowed");
    }
    let pathname = new URL(request.url, "http://localhost").pathname;
    pathname = decodeURIComponent(pathname);
    if (pathname === "/" || pathname === "") pathname = "/index.html";
    if (pathname === "/admin" || pathname === "/admin/") pathname = "/admin/index.html";
    const file = resolve(root, "." + pathname);
    if (!file.startsWith(root + sep)) {
      response.writeHead(403); return response.end("Forbidden");
    }
    const bytes = await readFile(file);
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(request.method === "HEAD" ? undefined : bytes);
  } catch {
    response.writeHead(404); response.end("Not found");
  }
});
server.listen(5000, "127.0.0.1", () => {
  process.stdout.write("Zrain local website: http://localhost:5000/ and http://localhost:5000/admin\n");
});
