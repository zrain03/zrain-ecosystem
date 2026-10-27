import { GAMES } from "./game-data.js";

const dialog = document.getElementById("game-console");
const frame = document.getElementById("console-frame");
const viewport = document.getElementById("console-viewport");
const title = document.getElementById("console-title");
const description = document.getElementById("console-description");
const store = document.getElementById("console-store");
const external = document.getElementById("console-external");
const closeButton = document.getElementById("console-close");
const reloadButton = document.getElementById("console-reload");
const fullscreenButton = document.getElementById("console-fullscreen");
let activeGame = null;
let previousFocus = null;

function clearGame() {
  // Release the web application when the user leaves the Console.
  frame.removeAttribute("src");
}

function loadGame() {
  if (!activeGame) return;
  clearGame();
  frame.src = activeGame.webUrl;
}

function openConsole(id, trigger) {
  const game = GAMES[id];
  if (!game || dialog.open) return;
  previousFocus = trigger;
  activeGame = game;
  title.textContent = game.name;
  description.textContent = game.description;
  frame.title = game.name + " web edition";
  store.href = game.storeUrl;
  external.href = game.webUrl;
  dialog.showModal();
  loadGame();
  closeButton.focus();
}

function closeConsole() {
  if (document.fullscreenElement === viewport) {
    document.exitFullscreen?.().catch(() => {});
  }
  if (dialog.open) dialog.close();
}

for (const button of document.querySelectorAll("[data-play]")) {
  button.addEventListener("click", () => openConsole(button.dataset.play, button));
}

closeButton.addEventListener("click", closeConsole);
reloadButton.addEventListener("click", loadGame);
fullscreenButton.addEventListener("click", () => {
  if (document.fullscreenElement === viewport) {
    document.exitFullscreen?.().catch(() => {});
  } else {
    viewport.requestFullscreen?.().catch(() => {});
  }
});

dialog.addEventListener("close", () => {
  clearGame();
  activeGame = null;
  previousFocus?.focus();
  previousFocus = null;
});

// The native dialog also supports Escape. Outside clicks close the Console.
dialog.addEventListener("click", event => {
  if (event.target === dialog) closeConsole();
});
