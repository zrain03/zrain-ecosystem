import { API_BASE_URL } from "./api-config.js";

const ACTIONS = new Set(["CONSOLE", "WEBSITE", "GITHUB", "PLAY_STORE", "DOCUMENTATION", "SHOWCASE"]);
const CATEGORIES = new Set(["GAMES", "DEVELOPER_TOOLS", "ONLINE_SERVICES", "WEB_UTILITIES"]);
export function safeHttpsUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !!url.hostname && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
export function safeLogoUrl(value) {
  if (typeof value !== "string") return null;
  if (/^\/(?!\/)(?!.*\.\.)(?:[a-zA-Z0-9_./-])+$/.test(value)) return value;
  return safeHttpsUrl(value);
}
export function normalizeCatalog(rows) {
  if (!Array.isArray(rows)) throw new Error("Catalog response must be an array");
  const ids = new Set();
  return rows.map(row => {
    if (!row || row.status !== "PUBLISHED" || typeof row.slug !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) || ids.has(row.slug) ||
        !CATEGORIES.has(row.category) || !ACTIONS.has(row.primaryAction) ||
        !safeHttpsUrl(row.primaryUrl) || !safeLogoUrl(row.logoUrl) ||
        typeof row.name !== "string" || !row.name.trim() ||
        typeof row.description !== "string" || typeof row.primaryLabel !== "string" ||
        !row.primaryLabel.trim()) throw new Error("Catalog entry is invalid");
    ids.add(row.slug);
    return {
      slug: row.slug, name: row.name, description: row.description,
      category: row.category, logoUrl: safeLogoUrl(row.logoUrl),
      primaryAction: row.primaryAction, primaryLabel: row.primaryLabel,
      primaryUrl: safeHttpsUrl(row.primaryUrl),
      secondaryLabel: row.secondaryLabel || null,
      secondaryUrl: row.secondaryUrl ? safeHttpsUrl(row.secondaryUrl) : null,
      sortOrder: Number.isInteger(row.sortOrder) ? row.sortOrder : 0
    };
  }).sort((a,b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}
export async function fetchPublicCatalog(fetcher = fetch) {
  if (!API_BASE_URL) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const result = await fetcher(API_BASE_URL.replace(/\/$/, "") + "/api/products", {
      signal: controller.signal, headers: { Accept: "application/json" }
    });
    if (!result.ok) throw new Error("Catalog request failed");
    return normalizeCatalog(await result.json());
  } finally { clearTimeout(timeout); }
}
