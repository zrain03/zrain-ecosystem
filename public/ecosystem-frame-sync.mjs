/*
 * Fail / File: public/ecosystem-frame-sync.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyelaraskan metadata iframe dengan pilihan Console tanpa memuatkan semula sesi produk.
 * EN: Synchronizes iframe metadata with Console selection without reloading product sessions.
 */
/**
 * Keep Zrain Console metadata in sync when a visitor uses "Switch function"
 * inside a same-origin browser tool. The embedded page, not the previous
 * title, is the source of truth. External websites are never inspected.
 */
// BM: resolveToolNavigation: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyelaraskan metadata iframe dengan pilihan Console tanpa memuatkan semula sesi produk. Input: href, origin, findItem.
// EN: resolveToolNavigation: Isolates one operation so it can be reviewed and tested. Module purpose: synchronizes iframe metadata with Console selection without reloading product sessions. Inputs: href, origin, findItem.
export function resolveToolNavigation(href, origin, findItem) {
  if (typeof href !== 'string' || typeof origin !== 'string' ||
      typeof findItem !== 'function') return null;
  try {
    const target = new URL(href, origin);
    if (target.origin !== new URL(origin).origin) return null;
    // The current static tools use both /tools/id/ and /tools/id/index.html.
    const match = /^\/tools\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(?:index\.html)?$/.exec(target.pathname);
    if (!match) return null;
    const item = findItem(match[1]);
    if (!item || item.kind !== 'tool') return null;
    // Confirm the item belongs to the official catalogue, not an arbitrary path.
    const official = new URL(item.url, origin);
    if (official.origin !== target.origin ||
        official.pathname !== '/tools/' + match[1] + '/') return null;
    return item;
  } catch { return null; }
}

// BM: toolNavigatedInsideFrame: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyelaraskan metadata iframe dengan pilihan Console tanpa memuatkan semula sesi produk. Input: frame, origin, findItem.
// EN: toolNavigatedInsideFrame: Isolates one operation so it can be reviewed and tested. Module purpose: synchronizes iframe metadata with Console selection without reloading product sessions. Inputs: frame, origin, findItem.
export function toolNavigatedInsideFrame(frame, origin, findItem) {
  try {
    // Browser raises SecurityError for a different origin; ignore it.
    const href = frame?.contentWindow?.location?.href;
    return resolveToolNavigation(href, origin, findItem);
  } catch { return null; }
}
