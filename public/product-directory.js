import { ENABLE_DYNAMIC_CATALOG } from "./api-config.js";
import { fetchPublicCatalog } from "./product-catalog-client.js";
import { registerPublishedProducts } from "./zrain-console.js";

const roots = {
  GAMES: document.querySelector("#games .product-list"),
  DEVELOPER_TOOLS: document.querySelector(".dev-card .product-list"),
  ONLINE_SERVICES: document.querySelector("#services-products")
};

function makeCard(product) {
  const inConsole = product.primaryAction === "CONSOLE";
  const node = document.createElement(inConsole ? "button" : "a");
  node.className = "product-item product-button";
  if (inConsole) {
    node.type = "button";
    node.dataset.console = product.slug;
  } else {
    node.href = product.primaryUrl;
    node.rel = "noopener noreferrer";
    node.target = "_blank";
  }
  node.setAttribute("aria-label", product.primaryLabel + ": " + product.name);
  const image = document.createElement("img");
  image.className = "app-mark app-icon";
  image.src = product.logoUrl;
  image.width = 46; image.height = 46; image.alt = "";
  const copy = document.createElement("span"); copy.className = "app-copy";
  const title = document.createElement("strong"); title.textContent = product.name;
  const detail = document.createElement("small"); detail.textContent = product.description;
  copy.append(title, detail);
  const cta = document.createElement("span"); cta.className = "item-cta";
  cta.textContent = product.primaryLabel + " ";
  const arrow = document.createElement("span"); arrow.setAttribute("aria-hidden", "true"); arrow.textContent = "↗";
  cta.append(arrow);
  node.append(image, copy, cta);
  if (!product.secondaryUrl || !product.secondaryLabel) return node;

  // Links are siblings, not nested inside a button, for valid accessible HTML.
  const wrapper = document.createElement("div");
  wrapper.className = "product-entry";
  const secondary = document.createElement("a");
  secondary.className = "product-secondary-link";
  secondary.href = product.secondaryUrl;
  secondary.target = "_blank";
  secondary.rel = "noopener noreferrer";
  secondary.textContent = product.secondaryLabel + " ↗";
  wrapper.append(node, secondary);
  return wrapper;
}

function utilitiesRoot() {
  const existing = document.getElementById("web-utilities-products");
  if (existing) return existing;
  const card = document.createElement("section");
  card.className = "bento-card services-card";
  card.id = "web-utilities";
  const heading = document.createElement("h3"); heading.textContent = "Web Utilities";
  const list = document.createElement("div"); list.className = "product-list"; list.id = "web-utilities-products";
  card.append(heading, list);
  document.querySelector(".bento-grid").append(card);
  return list;
}

export function renderCatalog(products) {
  const groups = Object.fromEntries(Object.keys(roots).map(key => [key, []]));
  groups.WEB_UTILITIES = [];
  for (const product of products) groups[product.category].push(product);
  for (const [category, items] of Object.entries(groups)) {
    const root = category === "WEB_UTILITIES" ?
      (items.length ? utilitiesRoot() : document.getElementById("web-utilities-products")) : roots[category];
    if (!root) continue;
    root.replaceChildren(...items.map(makeCard));
    const counter = root.closest(".bento-card")?.querySelector(".count-pill");
    if (counter) counter.textContent = String(items.length).padStart(2, "0") + " " +
      (category === "GAMES" ? "GAMES" : category === "DEVELOPER_TOOLS" ? "TOOLS" : "SERVICES");
  }
  registerPublishedProducts(products);
}

if (ENABLE_DYNAMIC_CATALOG) {
  // A visible development-only status makes it clear whether the homepage is
  // showing saved admin content or the fallback cards shipped in the HTML.
  const status = document.createElement("p");
  status.className = "catalog-local-status";
  status.setAttribute("role", "status");
  status.textContent = "Local Admin preview: connecting to the product database...";
  document.querySelector("#products .section-heading")?.after(status);
  fetchPublicCatalog().then(products => {
    if (products) {
      renderCatalog(products);
      status.textContent = "Local Admin preview: showing " + products.length +
        " published product" + (products.length === 1 ? "" : "s") +
        " from the database. The live website is unchanged.";
    }
  }).catch(() => {
    status.textContent = "Local Admin preview: API unavailable or invalid data. " +
      "Showing the original website cards instead.";
    // Keep the original six static cards if the API is down or malformed.
  });
}
