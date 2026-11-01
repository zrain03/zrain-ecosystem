import { PRODUCTS } from "./console-products.js?v=4.1.6";

const published = new Map();
export function registerPublishedProducts(products) {
  published.clear();
  for (const item of products) {
    const builtIn = PRODUCTS[item.slug];
    const sourceFirst = ["GITHUB","PLAY_STORE","DOCUMENTATION"].includes(item.primaryAction);
    // The UI design-system preview is always the actual local showcase.
    const webUrl = item.slug === "zrain-ui" ? PRODUCTS["zrain-ui"].webUrl :
      sourceFirst && builtIn ? builtIn.webUrl : item.primaryUrl;
    published.set(item.slug, {
      name: item.name, description: item.description, icon: item.logoUrl,
      webUrl,
      storeUrl: item.secondaryUrl?.includes("play.google.com/store/apps/") ?
        item.secondaryUrl : builtIn?.storeUrl
    });
  }
}

const dialog = document.getElementById("zrain-console");
const stage = document.getElementById("console-stage");
const viewer = document.getElementById("console-viewer");
const frame = document.getElementById("console-frame");
const icon = document.getElementById("console-icon");
const name = document.getElementById("console-title");
const description = document.getElementById("console-description");
const modeLabel = document.getElementById("console-mode");
const external = document.getElementById("console-external");
const store = document.getElementById("console-store");
const reload = document.getElementById("console-reload");
const fullscreen = document.getElementById("console-fullscreen");
const close = document.getElementById("console-close");
const shell = document.getElementById("console-shell");
const mobileButton = document.getElementById("console-mobile");
const desktopButton = document.getElementById("console-desktop");

// Every web app starts with a responsive mobile viewport, including websites.
// The iframe presentation scales to fit the stage without resizing the browser.
// Remote web apps still own their content and sign-in behavior.
const PHONE = Object.freeze({ width: 390, height: 844 });
let current = null;
let opener = null;
let viewMode = "mobile";
let frameVersion = 0;

function clearFrame() {
  frameVersion++;
  frame.removeAttribute("src");
  frame.removeAttribute("srcdoc");
}

export function fitPortrait(bounds, logical = PHONE) {
  const w = Math.max(1, Number(bounds.width) || 1);
  const h = Math.max(1, Number(bounds.height) || 1);
  const scale = Math.min(w / logical.width, h / logical.height, 1.25);
  return {
    scale,
    width: Math.max(1, Math.floor(logical.width * scale)),
    height: Math.max(1, Math.floor(logical.height * scale))
  };
}

function layoutFrame() {
  if (!current) return;
  if (viewMode === "desktop") {
    // Preserve true desktop responsive breakpoints even on a narrow phone.
    // Widen the iframe viewport, then scale its presentation to the stage.
    const availableWidth = Math.max(1, stage.clientWidth - 16);
    const availableHeight = Math.max(1, stage.clientHeight - 16);
    const logicalWidth = Math.max(1100, availableWidth);
    const scale = Math.min(availableWidth / logicalWidth, 1);
    viewer.style.width = Math.floor(logicalWidth * scale) + "px";
    viewer.style.height = availableHeight + "px";
    frame.style.width = logicalWidth + "px";
    frame.style.height = Math.ceil(availableHeight / scale) + "px";
    frame.style.transform = scale === 1 ? "none" : `scale(${scale})`;
    return;
  }
  // The parent's viewport dictates the height, never document scrolling.
  const available = {width: stage.clientWidth - 12, height: stage.clientHeight - 12};
  const fitted = fitPortrait(available);
  viewer.style.width = fitted.width + "px";
  viewer.style.height = fitted.height + "px";
  frame.style.width = PHONE.width + "px";
  frame.style.height = PHONE.height + "px";
  frame.style.transform = `scale(${fitted.scale})`;
}

function setView(mode) {
  if (mode !== "mobile" && mode !== "desktop") return;
  viewMode = mode;
  shell.dataset.view = mode;
  mobileButton.setAttribute("aria-pressed", String(mode === "mobile"));
  desktopButton.setAttribute("aria-pressed", String(mode === "desktop"));
  modeLabel.textContent = mode === "mobile" ? "Mobile view" : "Desktop view";
  layoutFrame();
  // Resize the same iframe: do not reset a user's game or account session.
}

async function loadCurrent() {
  if (!current) return;
  // Reset the document and invalidate any earlier asynchronous preview load.
  clearFrame();
  if (current.localShowcase) {
    const version = frameVersion;
    try {
      // Trusted local HTML only: srcdoc avoids a framed HTTP navigation
      // and its response headers.
      const response = await fetch("/zrain-ui-showcase.html", {cache:"no-store"});
      if (!response.ok) throw new Error("Showcase unavailable");
      const markup = await response.text();
      if (version !== frameVersion || !current?.localShowcase) return;
      frame.srcdoc = markup;
    } catch {
      if (version !== frameVersion || !current?.localShowcase) return;
      frame.srcdoc = '<!doctype html><html><body style="font:16px sans-serif;padding:24px">' +
        '<h2>Unable to load Zrain UI preview</h2>' +
        '<p>Use Open in new tab to view the showcase.</p></body></html>';
    }
    return;
  }
  frame.src = current.webUrl;
}

function openConsole(id, trigger) {
  const product = published.get(id) || PRODUCTS[id];
  if (!product || dialog.open) return;
  opener = trigger;
  current = {...product, localShowcase: id === "zrain-ui"};
  setView("mobile");
  icon.src = product.icon;
  icon.alt = "";
  name.textContent = product.name;
  description.textContent = product.description;
  frame.title = product.name + " web app";
  external.href = product.webUrl;
  external.title = 'Open website in new tab';
  external.setAttribute('aria-label', external.title);
  store.hidden = !product.storeUrl;
  if (product.storeUrl) store.href = product.storeUrl;
  else store.removeAttribute("href");
  dialog.showModal();
  layoutFrame();
  loadCurrent();
  close.focus();
}

function closeConsole() {
  if (document.fullscreenElement === shell) {
    document.exitFullscreen?.().catch(() => {});
  }
  if (dialog.open) dialog.close();
}

// Static actions are registered directly; delegated clicks only handle new cards.
// This prevents duplicate open events when the original buttons are clicked.
const staticControls = new Set(document.querySelectorAll("[data-console]"));
for (const control of staticControls) {
  control.addEventListener("click", () => openConsole(control.dataset.console, control));
}
document.addEventListener("click", event => {
  const trigger = event.target?.closest?.("[data-console]");
  if (trigger && !staticControls.has(trigger)) openConsole(trigger.dataset.console, trigger);
});

mobileButton.addEventListener("click", () => setView("mobile"));
desktopButton.addEventListener("click", () => setView("desktop"));
reload.addEventListener("click", loadCurrent);
close.addEventListener("click", closeConsole);
fullscreen.addEventListener("click", () => {
  if (document.fullscreenElement === shell) document.exitFullscreen?.().catch(() => {});
  else shell.requestFullscreen?.().catch(() => {});
});

dialog.addEventListener("close", () => {
  clearFrame();
  current = null;
  opener?.focus();
  opener = null;
});

dialog.addEventListener("click", event => {
  if (event.target === dialog) closeConsole();
});

// One layout function supports Mobile/Desktop toggles, viewport resizing,
// fullscreen and short laptop screens without changing the remote applications.
if (typeof ResizeObserver !== "undefined") {
  const resize = new ResizeObserver(layoutFrame);
  resize.observe(stage);
}
document.addEventListener("fullscreenchange", layoutFrame);
window.addEventListener("resize", layoutFrame);

// The public project page links into the REAL production Console.
// Only documented, built-in product IDs are accepted; no arbitrary iframe URL.
const requestedDemo = new URLSearchParams(window.location?.search || "").get("console");
if (requestedDemo && Object.prototype.hasOwnProperty.call(PRODUCTS, requestedDemo)) {
  openConsole(requestedDemo, null);
}
