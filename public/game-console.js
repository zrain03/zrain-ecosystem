/*
 * Fail / File: public/game-console.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyediakan pengawal paparan permainan yang mengekalkan sesi semasa menukar mod viewer.
 * EN: Implements game viewing controls that preserve sessions across view-mode changes.
 */
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

// BM: clearGame: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyediakan pengawal paparan permainan yang mengekalkan sesi semasa menukar mod viewer.
// EN: clearGame: Isolates one operation so it can be reviewed and tested. Module purpose: implements game viewing controls that preserve sessions across view-mode changes.
function clearGame() {
  // Release the web application when the user leaves the Console.
  frame.removeAttribute("src");
}

function loadGame() {
  if (!activeGame) return;
  clearGame();
  frame.src = activeGame.webUrl;
}

// BM: openConsole: Menyelaraskan UI dan state tanpa menggandakan event handler atau mencipta elemen tidak diperlukan. Tujuan modul: menyediakan pengawal paparan permainan yang mengekalkan sesi semasa menukar mod viewer. Input: id, trigger.
// EN: openConsole: Synchronizes UI and state without duplicating handlers or unnecessary elements. Module purpose: implements game viewing controls that preserve sessions across view-mode changes. Inputs: id, trigger.
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

// BM: closeConsole: Menyelaraskan UI dan state tanpa menggandakan event handler atau mencipta elemen tidak diperlukan. Tujuan modul: menyediakan pengawal paparan permainan yang mengekalkan sesi semasa menukar mod viewer.
// EN: closeConsole: Synchronizes UI and state without duplicating handlers or unnecessary elements. Module purpose: implements game viewing controls that preserve sessions across view-mode changes.
function closeConsole() {
  if (document.fullscreenElement === viewport) {
    document.exitFullscreen?.().catch(() => {});
  }
  if (dialog.open) dialog.close();
}

for (const button of document.querySelectorAll("[data-play]")) {
  // BM: Event click: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
  // EN: click event: handle interaction without mutating source data or bypassing module validation.
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
// BM: Event click: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
// EN: click event: handle interaction without mutating source data or bypassing module validation.
dialog.addEventListener("click", event => {
  if (event.target === dialog) closeConsole();
});
