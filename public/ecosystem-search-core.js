/*
 * Fail / File: public/ecosystem-search-core.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menormalisasi teks carian dan membina indeks produk dengan penapisan destinasi selamat.
 * EN: Normalizes search text and builds a product index with safe destination filtering.
 */
// Search data shared by the browser and Node tests. No DOM, no backend and no user data stored.
const CATEGORY_NAMES = Object.freeze({
  GAMES: "Games", DEVELOPER_TOOLS: "Developer Tools",
  ONLINE_SERVICES: "Online Services", WEB_UTILITIES: "Online Services"
});

export const HUB_ENTRIES = Object.freeze([
  {slug: "zrain-ecosystem", name: "Zrain Ecosystem", description: "The home of Zrain products, projects and their public websites.", webUrl: "https://zrain.web.app/", category: "ONLINE_SERVICES"},
  {slug: "zrain-console", name: "Zrain Console", description: "Explore Zrain web applications and open their full websites.", webUrl: "https://zrain.web.app/zrain-console.html", category: "DEVELOPER_TOOLS"}
]);

// BM: normalizeSearchText: Menukar atau mengesahkan input tanpa melangkau sempadan data yang selamat. Tujuan modul: menormalisasi teks carian dan membina indeks produk dengan penapisan destinasi selamat. Input: value.
// EN: normalizeSearchText: Transforms or validates input without bypassing safe data boundaries. Module purpose: normalizes search text and builds a product index with safe destination filtering. Inputs: value.
export function normalizeSearchText(value) {
  return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function safeUrl(input) {
  try {
    const url = new URL(input);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

// BM: projectEntry: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menormalisasi teks carian dan membina indeks produk dengan penapisan destinasi selamat. Input: slug, item, source.
// EN: projectEntry: Isolates one operation so it can be reviewed and tested. Module purpose: normalizes search text and builds a product index with safe destination filtering. Inputs: slug, item, source.
function projectEntry(slug, item, source) {
  const url = safeUrl(item.primaryUrl || item.webUrl);
  if (!url || !item.name || !slug) return null;
  return {
    id: "project:" + slug, type: "project", name: String(item.name),
    description: String(item.description || ""), category: CATEGORY_NAMES[item.category] || "Zrain Projects",
    family: "", url, source
  };
}

// Use the public catalog after it has loaded; unpublished projects do not leak
// into search through the fallback preview list. The two hub navigation entries
// are always public routes and are not admin-managed products.
// BM: buildSearchIndex: Menghasilkan representasi yang diperlukan tanpa mengubah input asal secara tidak sengaja. Tujuan modul: menormalisasi teks carian dan membina indeks produk dengan penapisan destinasi selamat. Input: {fallbackProducts = {}, publishedProducts = null, families = [], tools = []} = {}.
// EN: buildSearchIndex: Produces the required representation without unintentionally mutating the input. Module purpose: normalizes search text and builds a product index with safe destination filtering. Inputs: {fallbackProducts = {}, publishedProducts = null, families = [], tools = []} = {}.
export function buildSearchIndex({fallbackProducts = {}, publishedProducts = null, families = [], tools = []} = {}) {
  const entries = [...HUB_ENTRIES.map(item => projectEntry(item.slug, item, "hub"))];
  if (Array.isArray(publishedProducts)) {
    for (const product of publishedProducts) {
      entries.push(projectEntry(product.slug, product, "published"));
    }
  } else {
    for (const [slug, product] of Object.entries(fallbackProducts)) {
      entries.push(projectEntry(slug, product, "fallback"));
    }
  }
  const familyBySlug = new Map(families.map(item => [item.slug, item]));
  // A tool is a functioning deep link only when its family has an official URL.
  for (const tool of tools) {
    const family = familyBySlug.get(tool.family);
    if (!family) continue;
    const path = String(tool.slug || "");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path)) continue;
    const url = safeUrl(family.url + path + "/");
    if (!url) continue;
    entries.push({
      id: "tool:" + tool.family + "/" + path, type: "tool",
      name: String(tool.name), description: String(tool.description || ""),
      category: "Tool", family: String(family.name), url, source: "tool-directory"
    });
  }
  return [...new Map(entries.filter(Boolean).map(item => [item.id, item])).values()];
}

// BM: searchIndex: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menormalisasi teks carian dan membina indeks produk dengan penapisan destinasi selamat. Input: entries, query = "", {type = "all", limit = 12} = {}.
// EN: searchIndex: Isolates one operation so it can be reviewed and tested. Module purpose: normalizes search text and builds a product index with safe destination filtering. Inputs: entries, query = "", {type = "all", limit = 12} = {}.
export function searchIndex(entries, query = "", {type = "all", limit = 12} = {}) {
  const q = normalizeSearchText(query);
  const terms = q.split(/\s+/).filter(Boolean);
  const wanted = ["all", "project", "tool"].includes(type) ? type : "all";
  return entries
    .filter(item => wanted === "all" || item.type === wanted)
    .map(item => {
      const name = normalizeSearchText(item.name);
      const family = normalizeSearchText(item.family);
      const description = normalizeSearchText(item.description);
      const category = normalizeSearchText(item.category);
      const haystack = [name, description, family, category].join(" ");
      if (!terms.every(term => haystack.includes(term))) return null;
      let score = item.type === "project" ? 15 : 0;
      if (q) {
        if (name === q) score += 400;
        else if (name.startsWith(q)) score += 240;
        else if (name.includes(q)) score += 180;
        if (family.includes(q)) score += 45;
        if (category.includes(q)) score += 25;
        for (const term of terms) {
          if (name.split(" ").some(word => word.startsWith(term))) score += 20;
        }
      }
      return {item, score};
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, Math.min(Math.max(Number(limit) || 12, 1), 100))
    .map(entry => entry.item);
}
