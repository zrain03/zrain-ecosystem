/*
 * Fail / File: public/product-directory.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Memaparkan kad produk yang diterbitkan dengan aksi Console dan pautan sumber yang sesuai.
 * EN: Renders Published product cards with Console actions and appropriate source links.
 */
import { ENABLE_DYNAMIC_CATALOG, LOCAL_PREVIEW } from "./api-config.js";
import { fetchPublicCatalog } from "./product-catalog-client.js";
import { registerPublishedProducts } from "./zrain-console.js";

const roots = {
  GAMES: document.querySelector("#games .product-list"),
  DEVELOPER_TOOLS: document.querySelector(".dev-card .product-list"),
  ONLINE_SERVICES: document.querySelector("#services-products")
};

// BM: actionLink: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memaparkan kad produk yang diterbitkan dengan aksi Console dan pautan sumber yang sesuai. Input: product, secondary = false.
// EN: actionLink: Isolates one operation so it can be reviewed and tested. Module purpose: renders Published product cards with Console actions and appropriate source links. Inputs: product, secondary = false.
function actionLink(product, secondary = false) {
  const repoSecondary = secondary && product.primaryAction === "GITHUB" &&
    product.primaryUrl.startsWith("https://github.com/");
  const label = secondary ? (repoSecondary ? "View on GitHub" : product.secondaryLabel) :
    (product.category === "GAMES" ? "Play Now" : "Open Web App");
  const url = secondary ? (repoSecondary ? product.primaryUrl : product.secondaryUrl) :
    product.primaryUrl;
  const action = document.createElement(secondary ? "a" : "button");
  action.className = secondary ? "item-cta product-action product-action-secondary"
    : "item-cta product-action product-action-primary";
  if (!secondary) {
    action.type = "button";
    action.dataset.console = product.slug;
  } else {
    const local = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    action.href = local && url === "https://zrain.web.app/zrain-ui-showcase.html"
      ? "/zrain-ui-showcase.html" : url;
    action.target = "_blank";
    action.rel = "noopener noreferrer";
  }
  action.setAttribute("aria-label", label + ": " + product.name);
  action.append(document.createTextNode(label + " "));
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  action.append(arrow);
  return action;
}

// BM: makeCard: Menghasilkan representasi yang diperlukan tanpa mengubah input asal secara tidak sengaja. Tujuan modul: memaparkan kad produk yang diterbitkan dengan aksi Console dan pautan sumber yang sesuai. Input: product.
// EN: makeCard: Produces the required representation without unintentionally mutating the input. Module purpose: renders Published product cards with Console actions and appropriate source links. Inputs: product.
export function makeCard(product) {
  const card = document.createElement("article");
  card.className = "product-entry";
  const image = document.createElement("img");
  image.className = "app-mark app-icon";
  image.src = product.logoUrl;
  image.width = 46;
  image.height = 46;
  image.alt = "";
  const copy = document.createElement("div");
  copy.className = "app-copy";
  const title = document.createElement("strong");
  title.textContent = product.name;
  const description = document.createElement("small");
  description.textContent = product.description;
  copy.append(title, description);
  const actions = document.createElement("div");
  actions.className = "product-actions";
  actions.append(actionLink(product));
  if ((product.secondaryLabel && product.secondaryUrl) ||
      (product.primaryAction === "GITHUB" && product.primaryUrl.startsWith("https://github.com/"))) {
    actions.append(actionLink(product, true));
  }
  card.append(image, copy, actions);
  return card;
}

// BM: renderCatalog: Menyelaraskan UI dan state tanpa menggandakan event handler atau mencipta elemen tidak diperlukan. Tujuan modul: memaparkan kad produk yang diterbitkan dengan aksi Console dan pautan sumber yang sesuai. Input: products.
// EN: renderCatalog: Synchronizes UI and state without duplicating handlers or unnecessary elements. Module purpose: renders Published product cards with Console actions and appropriate source links. Inputs: products.
export function renderCatalog(products) {
  // Web Utilities is a legacy internal category, not a separate visual section.
  const groups = { GAMES: [], DEVELOPER_TOOLS: [], ONLINE_SERVICES: [] };
  for (const product of products) {
    const section = product.category === "WEB_UTILITIES" ? "ONLINE_SERVICES" : product.category;
    if (!groups[section]) throw new Error("Unknown catalog category");
    groups[section].push(product);
  }
  for (const [section, items] of Object.entries(groups)) {
    const root = roots[section];
    if (!root) continue;
    root.replaceChildren(...items.map(makeCard));
    const card = root.closest(".bento-card");
    card.hidden = items.length === 0;
    const count = card.querySelector(".count-pill");
    if (count) {
      const label = section === "GAMES" ? "GAMES" :
        section === "DEVELOPER_TOOLS" ? "TOOLS" : "SERVICES";
      count.textContent = String(items.length).padStart(2, "0") + " " + label;
    }
  }
  registerPublishedProducts(products);
  document.dispatchEvent(new CustomEvent("zrain:catalog-rendered", {detail:{products}}));
}

if (ENABLE_DYNAMIC_CATALOG) {
  // Only show development status on localhost, not to public visitors.
  let status = null;
  if (LOCAL_PREVIEW) {
    status = document.createElement("p");
    status.className = "catalog-local-status";
    status.setAttribute("role", "status");
    status.textContent = "Local Admin preview: connecting to product database...";
    document.querySelector("#products .section-heading")?.after(status);
  }
  fetchPublicCatalog().then(products => {
    if (!products) return;
    renderCatalog(products);
    if (status) status.textContent = "Local Admin preview: showing " +
      products.length + " published products from the database.";
  }).catch(() => {
    // Keep the six original cards if public catalog cannot be loaded.
    if (status) status.textContent = "Local catalog unavailable. Original cards preserved.";
  });
}
