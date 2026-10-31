import { API_BASE_URL } from "../api-config.js";
import { safeHttpsUrl, safeLogoUrl } from "../product-catalog-client.js";

const byId = id => document.getElementById(id);
const form = byId("product-form");
const inputs = {
  name: byId("product-name"), slug: byId("product-slug"), description: byId("product-description"),
  category: byId("product-category"), logoUrl: byId("product-logo"),
  primaryAction: byId("product-action"), primaryLabel: byId("product-label"),
  primaryUrl: byId("product-url"), secondaryLabel: byId("product-secondary-label"),
  secondaryUrl: byId("product-secondary-url"), sortOrder: byId("product-order")
};
let jwt = null; // Intentionally in memory; never localStorage/sessionStorage.
let editing = null;
let list = [];

function showNotice(element, message) {
  element.textContent = message;
  element.hidden = !message;
}
async function request(path, options = {}) {
  if (!API_BASE_URL || !safeHttpsUrl(API_BASE_URL)) throw new Error("Admin API is not configured yet.");
  const response = await fetch(API_BASE_URL.replace(/\/$/, "") + path, {
    ...options, headers: { Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(jwt ? { Authorization: "Bearer " + jwt } : {}), ...options.headers }
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (jwt) signOut();
    }
    let message = "Request failed (" + response.status + ").";
    try { const data = await response.json(); message = data.error || message; } catch {}
    throw new Error(message);
  }
  return response.json();
}
function signOut() {
  jwt = null; editing = null;
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
    const auth = await request("/api/admin/auth/login", { method: "POST", body: JSON.stringify({
      email: byId("signin-email").value.trim(), password: byId("signin-password").value
    }) });
    if (typeof auth.accessToken !== "string" || !auth.accessToken) throw new Error("Invalid login response.");
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
  } finally { submit.disabled = false; }
});
byId("signout").addEventListener("click", signOut);
byId("new-product").addEventListener("click", resetForm);
byId("reset-product").addEventListener("click", resetForm);

function resetForm() {
  editing = null; form.reset();
  inputs.logoUrl.value = "/zrain-logo.webp";
  inputs.primaryLabel.value = "Play now";
  inputs.sortOrder.value = "0";
  byId("editor-title").textContent = "Add product";
  updateLogo();
}
function updateLogo() {
  const url = safeLogoUrl(inputs.logoUrl.value);
  byId("logo-preview").src = url || "/zrain-logo.webp";
}
inputs.logoUrl.addEventListener("change", updateLogo);
inputs.primaryAction.addEventListener("change", () => {
  const defaults = { CONSOLE:"Play now", WEBSITE:"Open Web App", GITHUB:"View on GitHub",
    PLAY_STORE:"Get on Google Play", DOCUMENTATION:"View Documentation", SHOWCASE:"View Showcase" };
  inputs.primaryLabel.value = defaults[inputs.primaryAction.value];
});
function editProduct(p) {
  editing = p.id;
  for (const [key, control] of Object.entries(inputs)) control.value = p[key] ?? "";
  updateLogo();
  byId("editor-title").textContent = "Edit: " + p.name;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}
function button(label, action, actionName) {
  const node = document.createElement("button"); node.type = "button";
  node.textContent = label; node.className = "secondary";
  node.addEventListener("click", action);
  node.setAttribute("aria-label", actionName);
  return node;
}
function displayProducts(products) {
  const root = byId("product-list");
  root.replaceChildren();
  if (!products.length) {
    const p = document.createElement("p"); p.textContent = "No products added yet."; p.className = "muted";
    root.append(p); return;
  }
  for (const product of products) {
    const row = document.createElement("article"); row.className = "product-row";
    const header = document.createElement("div"); header.className = "product-top";
    const logo = document.createElement("img"); logo.src = safeLogoUrl(product.logoUrl) || "/zrain-logo.webp"; logo.width = 42; logo.height = 42; logo.alt = "";
    const copy = document.createElement("div"); copy.className = "product-copy";
    const title = document.createElement("strong"); title.textContent = product.name;
    const description = document.createElement("small"); description.textContent = product.category.replaceAll("_", " ");
    copy.append(title, description);
    const status = document.createElement("span"); status.className = "status"; status.textContent = product.status;
    header.append(logo, copy, status);
    const actions = document.createElement("div"); actions.className = "actions";
    actions.append(button("Edit", () => editProduct(product), "Edit " + product.name));
    const publish = product.status !== "PUBLISHED";
    actions.append(button(publish ? "Publish" : "Unpublish", () => changeStatus(product.id, publish ? "publish" : "unpublish"), (publish ? "Publish " : "Unpublish ") + product.name));
    if (product.status !== "ARCHIVED") actions.append(button("Archive", () => {
      if (confirm("Archive " + product.name + "?")) changeStatus(product.id, "archive");
    }, "Archive " + product.name));
    row.append(header, actions); root.append(row);
  }
}
async function refresh() {
  list = await request("/api/admin/products");
  displayProducts(list);
}
async function changeStatus(id, action) {
  try {
    await request("/api/admin/products/" + encodeURIComponent(id) + "/" + action, { method: "POST" });
    showNotice(byId("dashboard-notice"), "Product updated.");
    await refresh();
  } catch (error) { showNotice(byId("dashboard-notice"), error.message); }
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(Object.entries(inputs).map(([key, element]) => [key, element.value.trim()]));
  data.sortOrder = Number(data.sortOrder);
  if (!safeLogoUrl(data.logoUrl)) return showNotice(byId("dashboard-notice"), "Enter a valid image URL.");
  if (!safeHttpsUrl(data.primaryUrl) || (data.secondaryUrl && !safeHttpsUrl(data.secondaryUrl)))
    return showNotice(byId("dashboard-notice"), "Product destination URLs must use HTTPS.");
  const submit = byId("save-product");
  submit.disabled = true;
  try {
    await request(editing ? "/api/admin/products/" + encodeURIComponent(editing) : "/api/admin/products",
      { method: editing ? "PUT" : "POST", body: JSON.stringify(data) });
    showNotice(byId("dashboard-notice"), "Product saved as draft or updated successfully.");
    resetForm(); await refresh();
  } catch (error) { showNotice(byId("dashboard-notice"), error.message); }
  finally { submit.disabled = false; }
});
if (!API_BASE_URL) showNotice(byId("signin-error"), "Admin API has not been configured. No sign-in is available yet.");
