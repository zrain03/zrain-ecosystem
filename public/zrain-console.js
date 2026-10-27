import { PRODUCTS } from "./console-products.js?v=4.1.4";

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

function clearFrame() {
  frame.removeAttribute("src");
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

function loadCurrent() {
  if (!current) return;
  // Remove the prior document before loading to reset its JS/game state.
  clearFrame();
  frame.src = current.webUrl;
}

function openConsole(id, trigger) {
  const product = PRODUCTS[id];
  if (!product || dialog.open) return;
  opener = trigger;
  current = product;
  setView("mobile");
  icon.src = product.icon;
  icon.alt = "";
  name.textContent = product.name;
  description.textContent = product.description;
  frame.title = product.name + " web app";
  external.href = product.webUrl;
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

for (const control of document.querySelectorAll("[data-console]")) {
  control.addEventListener("click", () => openConsole(control.dataset.console, control));
}

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
