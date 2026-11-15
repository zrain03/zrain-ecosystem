/*
 * Fail / File: catalog-worker/src/workshop.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-15
 * Dikemas kini / Last updated: 2026-11-15
 * BM: Aktifkan katalog boleh disunting dengan laluan sebenar setiap keluarga alat.
 * EN: Activate the editable catalogue using each tool family's actual routes.
 */
import {INVENTORY} from '../../public/ecosystem-inventory.mjs';
import {categoryToWorker} from '../../public/admin/manage-core.mjs';
import {findGroup} from '../../tool-runtime/src/catalog.mjs';
import {VERIFIED_TOOLS, loadProducts, newProduct, nextOrder, saveProducts, validateProduct} from './products.js';

// A new activation is required for the catalogue containing editable tool records.
export const WORKSHOP_ACTIVE_KEY = 'workshop-active-v3';

const productRows = INVENTORY.filter(item => item.id !== 'zrain-console').map(item => {
  const tool = item.kind === 'tool';
  const family = tool ? findGroup(item.id) : null;
  if (tool && !family) throw new Error('Missing deployed tool family for ' + item.id);
  return {
    slug: item.id, name: item.name, description: item.description,
    category: categoryToWorker(item.category),
    logoUrl: ['guess-the-flag', 'memory-rush'].includes(item.id)
      ? '/icons/' + item.id + '.webp' : '/zrain-mascot.png',
    primaryAction: 'WEBSITE',
    primaryLabel: 'Open Web App',
    primaryUrl: tool ? 'https://' + family.slug + '.pages.dev/' + item.id + '/' : item.url,
    secondaryLabel: item.repoUrl ? 'View on GitHub' : null,
    secondaryUrl: item.repoUrl || null,
    kind: item.kind
  };
});

export async function activateWorkshop(kv) {
  if (await kv.get(WORKSHOP_ACTIVE_KEY) === '1') return;
  const rows = await loadProducts(kv);
  let changed = false;
  for (const entry of [...productRows, ...VERIFIED_TOOLS]) {
    const existing = rows.find(row => row.slug === entry.slug);
    if (existing) {
      if (entry.kind === 'tool' && existing.kind !== 'tool') {
        existing.kind = 'tool';
        changed = true;
      }
      continue;
    }
    const valid = validateProduct(entry);
    if (!valid) throw new Error('Invalid catalogue metadata for ' + entry.slug);
    rows.push({
      ...newProduct(valid, nextOrder(rows, valid.category)),
      kind: entry.kind || 'project',
      status: 'PUBLISHED'
    });
    changed = true;
  }
  if (changed) await saveProducts(kv, rows);
  await kv.put(WORKSHOP_ACTIVE_KEY, '1');
}
