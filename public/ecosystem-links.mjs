/*
 * Fail / File: public/ecosystem-links.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Membina pautan produk daripada URL yang dibenarkan dan menghalang destinasi tidak diketahui.
 * EN: Builds product links from approved URLs and rejects unknown destinations.
 */
/**
 * Official destinations for the 55 published-in-source Zrain Alpha entries.
 * Web App always goes through Zrain Console, never directly to the destination.
 */
import { getActiveInventory } from './ecosystem-catalog.mjs';

// BM: catalogue: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: membina pautan produk daripada URL yang dibenarkan dan menghalang destinasi tidak diketahui.
// EN: catalogue: Isolates one operation so it can be reviewed and tested. Module purpose: builds product links from approved URLs and rejects unknown destinations.
function catalogue() { return new Map(getActiveInventory().map(item => [item.id, item])); }
export const GOOGLE_PLAY = Object.freeze({
  'guess-the-flag': 'https://play.google.com/store/apps/details?id=com.zrain.guesstheflag',
  'memory-rush': 'https://play.google.com/store/apps/details?id=com.zrain.memoryrush'
});
export const OFFICIAL_LOGOS = Object.freeze({
  'guess-the-flag': 'https://zrain.web.app/icons/guess-the-flag.webp',
  'memory-rush': 'https://zrain.web.app/icons/memory-rush.webp'
});
// BM: logoFor: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: membina pautan produk daripada URL yang dibenarkan dan menghalang destinasi tidak diketahui. Input: item.
// EN: logoFor: Isolates one operation so it can be reviewed and tested. Module purpose: builds product links from approved URLs and rejects unknown destinations. Inputs: item.
export function logoFor(item) {
  return OFFICIAL_LOGOS[item?.id] || '/zrain-logo.webp';
}
export function previewLinkHref(item) {
  if (!item || catalogue().get(item.id) !== item) return null;
  return '/#app=' + encodeURIComponent(item.id);
}
// BM: consoleHref: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: membina pautan produk daripada URL yang dibenarkan dan menghalang destinasi tidak diketahui. Input: item.
// EN: consoleHref: Isolates one operation so it can be reviewed and tested. Module purpose: builds product links from approved URLs and rejects unknown destinations. Inputs: item.
export function consoleHref(item) {
  if (!item || catalogue().get(item.id) !== item) return null;
  return '/zrain-console.html?app=' + encodeURIComponent(item.id);
}
export function repoHref(item) {
  if (!item || catalogue().get(item.id) !== item || !item.repoUrl) return null;
  try {
    const url = new URL(item.repoUrl);
    const match = /^\/zrain03\/[a-zA-Z0-9._-]+\/?$/.test(url.pathname);
    return url.protocol === 'https:' && url.hostname === 'github.com' && match &&
      !url.username && !url.password && !url.search && !url.hash ? url.href : null;
  } catch { return null; }
}
// BM: previewHref: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: membina pautan produk daripada URL yang dibenarkan dan menghalang destinasi tidak diketahui. Input: item, origin = 'https://zrain.web.app'.
// EN: previewHref: Isolates one operation so it can be reviewed and tested. Module purpose: builds product links from approved URLs and rejects unknown destinations. Inputs: item, origin = 'https://zrain.web.app'.
export function previewHref(item, origin = 'https://zrain.web.app') {
  if (!item || catalogue().get(item.id) !== item) return null;
  if (item.id === 'zrain-console') return new URL('/zrain-console.html', origin).href;
  try {
    const address = new URL(item.url, origin);
    // All relative tool URLs stay on this same origin.
    if (item.url.startsWith('/')) return address.origin === new URL(origin).origin ? address.href : null;
    return address.protocol === 'https:' && !address.username && !address.password ? address.href : null;
  } catch { return null; }
}
// BM: sortedByName: Menukar atau mengesahkan input tanpa melangkau sempadan data yang selamat. Tujuan modul: membina pautan produk daripada URL yang dibenarkan dan menghalang destinasi tidak diketahui. Input: items.
// EN: sortedByName: Transforms or validates input without bypassing safe data boundaries. Module purpose: builds product links from approved URLs and rejects unknown destinations. Inputs: items.
export function sortedByName(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'en', {sensitivity:'base'}) || a.id.localeCompare(b.id));
}
export function getInventoryItem(id) {
  return catalogue().get(id) || null;
}
