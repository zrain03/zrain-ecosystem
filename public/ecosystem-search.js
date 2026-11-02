import { PRODUCTS } from "./console-products.js";
import { FAMILIES, TOOLS } from "./tools-directory-data.js";
import { buildSearchIndex, searchIndex } from "./ecosystem-search-core.js";

const dialog = document.getElementById("ecosystem-search");
const input = document.getElementById("ecosystem-query");
const results = document.getElementById("ecosystem-search-results");
const status = document.getElementById("ecosystem-search-status");
const filterButtons = [...document.querySelectorAll("[data-search-type]")];
const openButtons = [...document.querySelectorAll("[data-open-search]")];
const closeButton = document.getElementById("ecosystem-search-close");

if (dialog && input && results && status && openButtons.length) {
  let items = buildSearchIndex({fallbackProducts: PRODUCTS, families: FAMILIES, tools: TOOLS});
  let active = "all";
  let returnFocus = null;

  function node(tag, className, label) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (label !== undefined) element.textContent = label;
    return element;
  }

  function render() {
    for (const button of filterButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.searchType === active));
    }
    const matched = searchIndex(items, input.value, {type: active, limit: 30});
    const list = document.createDocumentFragment();
    for (const item of matched) {
      const a = node("a", "ecosystem-search-result");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", "Open " + item.name + " in a new tab");
      const icon = node("span", "ecosystem-search-icon", item.type === "tool" ? "⌘" : "◈");
      icon.setAttribute("aria-hidden", "true");
      const copy = node("span", "ecosystem-search-result-copy");
      const title = node("strong", "", item.name);
      const category = node("small", "", item.type === "tool" ? item.family : item.category);
      const desc = node("span", "ecosystem-search-result-description", item.description);
      copy.append(title, category, desc);
      const arrow = node("span", "ecosystem-search-arrow", "↗");
      arrow.setAttribute("aria-hidden", "true");
      a.append(icon, copy, arrow);
      list.append(a);
    }
    if (!matched.length) {
      list.append(node("p", "ecosystem-search-empty", "No matching Zrain projects or tools. Try another search."));
    }
    results.replaceChildren(list);
    status.textContent = matched.length + (matched.length === 30 ? "+ matching results" : " matching results") +
      (input.value.trim() ? ' for "' + input.value.trim() + '"' : "");
  }

  function openSearch() {
    if (dialog.open) return;
    returnFocus = document.activeElement;
    input.value = "";
    active = "all";
    render();
    dialog.showModal();
    input.focus();
  }

  openButtons.forEach(button => button.addEventListener("click", openSearch));
  closeButton?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (returnFocus?.isConnected && typeof returnFocus.focus === "function") returnFocus.focus();
  });
  dialog.addEventListener("click", event => {
    // A click on the dialog backdrop is reported with the dialog as target.
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
  });
  input.addEventListener("input", render);
  input.addEventListener("keydown", event => {
    const links = [...results.querySelectorAll("a")];
    if (event.key === "ArrowDown" && links.length) {
      event.preventDefault();
      links[0].focus();
    }
    if (event.key === "Enter" && links.length) {
      event.preventDefault();
      links[0].click();
    }
  });
  results.addEventListener("keydown", event => {
    const links = [...results.querySelectorAll("a")];
    const index = links.indexOf(document.activeElement);
    if (index === -1) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      (links[index + 1] || input).focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      (links[index - 1] || input).focus();
    }
  });
  filterButtons.forEach(button => button.addEventListener("click", () => {
    active = button.dataset.searchType;
    render();
    input.focus();
  }));
  // The catalog is loaded by the existing public product directory; reuse
  // that validated published-only response, without an extra API request.
  document.addEventListener("zrain:catalog-rendered", event => {
    const publishedProducts = event.detail?.products;
    if (!Array.isArray(publishedProducts)) return;
    items = buildSearchIndex({fallbackProducts: PRODUCTS, publishedProducts, families: FAMILIES, tools: TOOLS});
    if (dialog.open) render();
  });
}
