import { FAMILIES, TOOLS } from "./tools-directory-data.js";

const field = document.getElementById("tools-search");
const tabs = document.getElementById("tools-family-filters");
const familiesRoot = document.getElementById("tools-families");
const list = document.getElementById("tools-results");
const status = document.getElementById("tools-count");
const showMore = document.getElementById("tools-show-all");
if (field && tabs && familiesRoot && list && status && showMore) {
  const bySlug = new Map(FAMILIES.map(f => [f.slug, f]));
  let active = "all";
  let expanded = false;
  function element(tag, className, label) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (label !== undefined) el.textContent = label;
    return el;
  }
  function external(label, href, className) {
    const a = element("a", className, label);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  }
  for (const f of FAMILIES) {
    const a = external("", f.url, "tools-family-link");
    const name = element("strong", null, f.name);
    const note = element("small", null, String(f.count) + " tools");
    a.append(name, note);
    a.setAttribute("aria-label", "Open " + f.name + " website");
    familiesRoot.append(a);
  }
  const filters = [{slug: "all", name: "All 28 tools"}, ...FAMILIES.map(f => ({slug:f.slug,name:f.name.replace(/^Zrain /,"")}))];
  for (const f of filters) {
    const b = element("button", "tools-filter", f.name);
    b.type = "button";
    b.dataset.family = f.slug;
    b.setAttribute("aria-pressed", String(f.slug === active));
    b.addEventListener("click", () => {
      active = f.slug;
      expanded = false;
      render();
    });
    tabs.append(b);
  }
  function render() {
    const query = field.value.toLowerCase().normalize("NFKD").trim();
    for (const button of tabs.querySelectorAll("button[data-family]")) {
      button.setAttribute("aria-pressed", String(button.dataset.family === active));
    }
    const matched = TOOLS.filter(tool => {
      const family = bySlug.get(tool.family);
      return (active === "all" || tool.family === active) &&
        (!query || [tool.name, tool.description, family.name].join(" ").toLowerCase().includes(query));
    });
    const visible = expanded || query ? matched : matched.slice(0, 9);
    const fragment = document.createDocumentFragment();
    for (const tool of visible) {
      const family = bySlug.get(tool.family);
      const link = external("", family.url + tool.slug + "/", "tools-result");
      const text = element("span", "tools-result-copy");
      text.append(element("strong", null, tool.name),
        element("small", null, family.name),
        element("span", "tools-result-description", tool.description));
      link.append(text, element("span", "tools-result-arrow", "↗"));
      link.setAttribute("aria-label", "Open " + tool.name + " in " + family.name);
      fragment.append(link);
    }
    if (!matched.length) fragment.append(element("p", "tools-empty", "No matching tools. Try another word or select All 28 tools."));
    list.replaceChildren(fragment);
    status.textContent = matched.length + " tool" + (matched.length === 1 ? "" : "s") + " found" +
      (visible.length < matched.length ? " · showing " + visible.length : "");
    showMore.hidden = Boolean(query) || visible.length === matched.length;
  }
  field.addEventListener("input", () => {expanded = false;render()});
  showMore.addEventListener("click", () => {expanded = true;render()});
  render();
}
