import { API_BASE_URL } from "../api-config.js";
import { safeHttpsUrl, safeLogoUrl } from "../product-catalog-client.js";

const byId = id => document.getElementById(id);
const form = byId("product-form");
const inputs = {
  name: byId("product-name"),
  slug: byId("product-slug"),
  description: byId("product-description"),
  category: byId("product-category"),
  logoChoice: byId("product-logo-choice"),
  customLogo: byId("product-logo"),
  primaryAction: byId("product-action"),
  primaryLabel: byId("product-label"),
  primaryUrl: byId("product-url"),
  secondaryType: byId("product-secondary-type"),
  secondaryUrl: byId("product-secondary-url")
};

const buttonLabels = Object.freeze({
  CONSOLE: "Play Now",
  WEBSITE: "Open Web App",
  GITHUB: "View on GitHub",
  PLAY_STORE: "Get on Google Play",
  DOCUMENTATION: "View Documentation",
  SHOWCASE: "View Showcase"
});
const secondaryLabels = Object.freeze({
  NONE: null,
  PLAY_STORE: "Get on Google Play",
  GITHUB: "View on GitHub",
  DEMO: "Try Demo",
  SHOWCASE: "View Showcase",
  DOCUMENTATION: "View Documentation",
  WEBSITE: "Open Web App"
});
const IS_LOCAL = ["localhost","127.0.0.1"].includes(location.hostname);
const categories = Object.freeze({
  GAMES: "Games",
  DEVELOPER_TOOLS: "Developer Tools",
  ONLINE_SERVICES: "Online Services",
  WEB_UTILITIES: "Online Services"
});
let jwt = null; // Signed access token is only held in memory.
let editing = null;
let list = [];

function showNotice(element, message) {
  element.textContent = message;
  element.hidden = !message;
}
async function request(path, options = {}) {
  const localApi = typeof location !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(location.hostname) &&
    API_BASE_URL === "http://localhost:8080";
  if (!API_BASE_URL || (!safeHttpsUrl(API_BASE_URL) && !localApi)) {
    throw new Error("Admin API is not configured yet.");
  }
  const response = await fetch(API_BASE_URL.replace(/\/$/, "") + path, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(jwt ? { Authorization: "Bearer " + jwt } : {}),
      ...options.headers
    }
  });
  if (!response.ok) {
    if (jwt && (response.status === 401 || response.status === 403)) signOut();
    let message = "Request failed (" + response.status + ").";
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}
function signOut() {
  jwt = null;
  editing = null;
  list = [];
  byId("dashboard").hidden = true;
  byId("signin-section").hidden = false;
  byId("signin-password").value = "";
}
byId("signin-form").addEventListener("submit", async event => {
  event.preventDefault();
  const submit = byId("signin-submit");
  submit.disabled = true;
  showNotice(byId("signin-error"), "");
  try {
    const auth = await request("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: byId("signin-email").value.trim(),
        password: byId("signin-password").value
      })
    });
    if (typeof auth.accessToken !== "string" || !auth.accessToken) {
      throw new Error("Invalid login response.");
    }
    jwt = auth.accessToken;
    const me = await request("/api/admin/auth/me");
    if (me.role !== "ADMIN") throw new Error("Administrator access required.");
    byId("admin-identity").textContent = "Signed in as " + me.email;
    byId("signin-section").hidden = true;
    byId("dashboard").hidden = false;
    byId("signin-password").value = "";
    resetForm();
    await refresh();
  } catch (error) {
    signOut();
    showNotice(byId("signin-error"), error.message);
  } finally {
    submit.disabled = false;
  }
});
byId("signout").addEventListener("click", signOut);

async function syncWebsite() {
  if (IS_LOCAL) return "Saved in the local database. The live website is unchanged.";
  try {
    const result = await request("/api/admin/catalog/sync", { method: "POST" });
    return "Website synced: " + result.published + " published products. A short cache refresh may apply.";
  } catch (error) {
    return "Saved to database, but website sync failed: " + error.message +
      " Use Retry website sync to publish the latest version.";
  }
}

byId("sync-catalog").addEventListener("click", async () => {
  const button = byId("sync-catalog");
  button.disabled = true;
  try {
    showNotice(byId("dashboard-notice"), await syncWebsite());
  } finally { button.disabled = false; }
});

byId("upload-logo").addEventListener("click", async () => {
  const input = byId("product-logo-file");
  const button = byId("upload-logo");
  if (!input.files.length) return showNotice(byId("dashboard-notice"), "Choose an image first.");
  const file = input.files[0];
  if (file.size > 2_000_000 || !["image/png","image/jpeg","image/webp"].includes(file.type)) {
    return showNotice(byId("dashboard-notice"), "Upload a PNG, JPG or WebP image under 2 MB.");
  }
  const body = new FormData();
  body.append("file", file);
  button.disabled = true;
  try {
    const media = await request("/api/admin/catalog/logo", { method: "POST", body });
    if (!safeHttpsUrl(media.url)) throw new Error("Invalid image URL returned.");
    inputs.logoChoice.value = "custom";
    inputs.customLogo.value = media.url;
    syncPreview();
    showNotice(byId("dashboard-notice"), "Logo uploaded. Save the product to keep this image.");
  } catch (error) {
    showNotice(byId("dashboard-notice"), error.message);
  } finally { button.disabled = false; }
});
byId("new-product").addEventListener("click", () => {
  resetForm();
  byId("product-name").focus();
});
byId("reset-product").addEventListener("click", resetForm);

export function slugify(name) {
  return String(name || "")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "").slice(0, 80).replace(/-$/g, "");
}
function createUniqueSlug(name) {
  const base = slugify(name);
  if (!base) return "";
  const taken = new Set(list.map(product => product.slug));
  let candidate = base;
  for (let i = 2; taken.has(candidate); i++) {
    const suffix = "-" + i;
    candidate = base.slice(0, 80 - suffix.length).replace(/-$/g, "") + suffix;
  }
  return candidate;
}
function logoValue() {
  return inputs.logoChoice.value === "custom" ? inputs.customLogo.value.trim() : inputs.logoChoice.value;
}
function chooseLogo(path) {
  const builtIn = ["/zrain-logo.webp", "/icons/guess-the-flag.webp", "/icons/memory-rush.webp"];
  if (builtIn.includes(path)) {
    inputs.logoChoice.value = path;
    inputs.customLogo.value = "";
  } else {
    inputs.logoChoice.value = "custom";
    inputs.customLogo.value = path || "";
  }
  syncLogo();
}
function syncLogo() {
  byId("custom-logo-wrap").hidden = inputs.logoChoice.value !== "custom";
  const logo = safeLogoUrl(logoValue()) || "/zrain-logo.webp";
  byId("logo-preview").src = logo;
  byId("card-preview-logo").src = logo;
}
function syncSecondary() {
  byId("secondary-url-wrap").hidden = inputs.secondaryType.value === "NONE";
  if (inputs.secondaryType.value === "NONE") inputs.secondaryUrl.value = "";
}
function syncPreview() {
  if (!editing) inputs.slug.value = createUniqueSlug(inputs.name.value);
  byId("preview-name").textContent = inputs.name.value.trim() || "Your product name";
  byId("preview-description").textContent = inputs.description.value.trim() || "Your short description appears here.";
  byId("preview-button").textContent = (inputs.primaryLabel.value.trim() || buttonLabels[inputs.primaryAction.value]) + " ↗";
  syncLogo();
}
function resetForm() {
  editing = null;
  form.reset();
  byId("advanced-options").open = false;
  inputs.primaryLabel.value = buttonLabels.CONSOLE;
  inputs.slug.value = "";
  chooseLogo("/zrain-logo.webp");
  syncSecondary();
  byId("editor-title").textContent = "Add a product";
  byId("save-product").textContent = "Save as Draft";
  syncPreview();
}
function editProduct(product) {
  editing = product.id;
  inputs.name.value = product.name;
  inputs.slug.value = product.slug;
  inputs.description.value = product.description;
  inputs.category.value = product.category === "WEB_UTILITIES" ? "ONLINE_SERVICES" : product.category;
  inputs.primaryAction.value = product.primaryAction;
  inputs.primaryLabel.value = product.primaryLabel;
  inputs.primaryUrl.value = product.primaryUrl;
  chooseLogo(product.logoUrl);
  const found = Object.entries(secondaryLabels).find(([, label]) => label && label === product.secondaryLabel);
  inputs.secondaryType.value = product.secondaryUrl ? (found?.[0] || "WEBSITE") : "NONE";
  inputs.secondaryUrl.value = product.secondaryUrl || "";
  syncSecondary();
  byId("editor-title").textContent = "Edit: " + product.name;
  byId("save-product").textContent = product.status === "PUBLISHED" ? "Save changes to published product" : "Save changes";
  if (inputs.secondaryType.value !== "NONE" || product.primaryLabel !== buttonLabels[product.primaryAction]) {
    byId("advanced-options").open = true;
  } else {
    byId("advanced-options").open = false;
  }
  syncPreview();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}
for (const key of ["name", "description", "category", "primaryLabel"]) {
  inputs[key].addEventListener("input", syncPreview);
}
inputs.logoChoice.addEventListener("change", syncPreview);
inputs.customLogo.addEventListener("input", syncPreview);
inputs.secondaryType.addEventListener("change", syncSecondary);
inputs.primaryAction.addEventListener("change", () => {
  inputs.primaryLabel.value = buttonLabels[inputs.primaryAction.value];
  syncPreview();
});
function button(label, action, actionName) {
  const node = document.createElement("button");
  node.type = "button";
  node.className = "secondary";
  node.textContent = label;
  node.setAttribute("aria-label", actionName);
  node.addEventListener("click", action);
  return node;
}
function displayProducts(products) {
  const root = byId("product-list");
  root.replaceChildren();
  if (!products.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "No products here yet. Import the existing six, or add a new product.";
    root.append(p);
    return;
  }
  const ranked = Object.keys(categories);
  const ordered = [...products].sort((a, b) =>
    ranked.indexOf(a.category) - ranked.indexOf(b.category) ||
    a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  for (const product of ordered) {
    const row = document.createElement("article");
    row.className = "product-row";
    const header = document.createElement("div");
    header.className = "product-top";
    const logo = document.createElement("img");
    logo.src = safeLogoUrl(product.logoUrl) || "/zrain-logo.webp";
    logo.width = 42; logo.height = 42; logo.alt = "";
    const copy = document.createElement("div");
    copy.className = "product-copy";
    const title = document.createElement("strong");
    title.textContent = product.name;
    const category = document.createElement("small");
    category.textContent = categories[product.category] || product.category;
    const desc = document.createElement("small");
    desc.textContent = product.description;
    copy.append(title, category, desc);
    const status = document.createElement("span");
    status.className = "status";
    status.textContent = product.status === "PUBLISHED" ? "Published" :
      product.status === "DRAFT" ? "Draft" : "Archived";
    header.append(logo, copy, status);
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(button("Edit", () => editProduct(product), "Edit " + product.name));
    if (product.status === "ARCHIVED") {
      actions.append(button("Restore as Draft", () => changeStatus(product.id, "unpublish"),
        "Restore " + product.name));
    } else {
      const publish = product.status !== "PUBLISHED";
      actions.append(button(publish ? "Publish" : "Unpublish",
        () => changeStatus(product.id, publish ? "publish" : "unpublish"),
        (publish ? "Publish " : "Unpublish ") + product.name));
      actions.append(button("Archive", () => {
        if (window.confirm("Archive " + product.name + "? It will no longer be published.")) {
          changeStatus(product.id, "archive");
        }
      }, "Archive " + product.name));
    }
    row.append(header, actions);
    root.append(row);
  }
}
async function refresh() {
  list = await request("/api/admin/products");
  displayProducts(list);
  if (!editing) syncPreview();
}
async function changeStatus(id, action) {
  try {
    const previous = list.find(p => p.id === id)?.status;
    await request("/api/admin/products/" + encodeURIComponent(id) + "/" + action, { method: "POST" });
    await refresh();
    showNotice(byId("dashboard-notice"), previous === "PUBLISHED" || action === "publish"
      ? await syncWebsite() : "Product saved as Draft or Archived.");
  } catch (error) {
    showNotice(byId("dashboard-notice"), error.message);
  }
}
byId("import-existing").addEventListener("click", async () => {
  const button = byId("import-existing");
  if (!window.confirm("Import all 6 existing Zrain products as Drafts? Existing records will not be overwritten.")) return;
  button.disabled = true;
  try {
    const result = await request("/api/admin/products/import-existing", { method: "POST" });
    showNotice(byId("dashboard-notice"),
      result.added + " imported, " + result.skipped + " already present. Review each draft before publishing.");
    await refresh();
  } catch (error) {
    showNotice(byId("dashboard-notice"), error.message);
  } finally {
    button.disabled = false;
  }
});
form.addEventListener("submit", async event => {
  event.preventDefault();
  const logoUrl = logoValue();
  const primaryUrl = inputs.primaryUrl.value.trim();
  const secondaryType = inputs.secondaryType.value;
  const secondaryUrl = secondaryType === "NONE" ? null : inputs.secondaryUrl.value.trim();
  const secondaryLabel = secondaryType === "NONE" ? null : secondaryLabels[secondaryType];
  const error = byId("dashboard-notice");
  if (!inputs.slug.value) return showNotice(error, "Please enter a product name.");
  if (!safeLogoUrl(logoUrl)) return showNotice(error, "Choose a built-in logo or provide a valid HTTPS image URL.");
  if (!safeHttpsUrl(primaryUrl)) return showNotice(error, "Enter a valid HTTPS link for the main button.");
  if (secondaryType !== "NONE" && !safeHttpsUrl(secondaryUrl)) {
    byId("advanced-options").open = true;
    return showNotice(error, "Add a valid HTTPS link for the second button.");
  }
  const data = {
    slug: inputs.slug.value,
    name: inputs.name.value.trim(),
    description: inputs.description.value.trim(),
    category: inputs.category.value,
    logoUrl,
    primaryAction: inputs.primaryAction.value,
    primaryLabel: inputs.primaryLabel.value.trim() || buttonLabels[inputs.primaryAction.value],
    primaryUrl,
    secondaryLabel,
    secondaryUrl
    // Display order is intentionally not sent; the backend assigns it.
  };
  const submit = byId("save-product");
  submit.disabled = true;
  try {
    const publishedBefore = editing && list.some(p => p.id === editing && p.status === "PUBLISHED");
    await request(editing ? "/api/admin/products/" + encodeURIComponent(editing) : "/api/admin/products", {
      method: editing ? "PUT" : "POST", body: JSON.stringify(data)
    });
    resetForm();
    await refresh();
    showNotice(error, publishedBefore ? await syncWebsite()
      : "Draft saved successfully. Press Publish when ready.");
  } catch (ex) {
    showNotice(error, ex.message);
  } finally {
    submit.disabled = false;
  }
});
resetForm();
if (!API_BASE_URL) showNotice(byId("signin-error"), "Admin API has not been configured. Sign-in is not available yet.");
