/**
 * Fail / File: public/admin/manage-core.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (rekod penciptaan asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Pemetaan kategori admin ke Worker dengan sokongan rekod lama tanpa kehilangan data.
 * EN: Map admin categories to Worker codes while preserving legacy catalog records.
 */
import {CATEGORIES} from '../ecosystem-inventory.mjs';
export const CATEGORY_CODES = Object.freeze({
  games:'GAMES',ai:'AI',infrastructure:'INFRASTRUCTURE',links:'PRESENCE',
  monitoring:'OPERATIONS',pdf:'PDF',image:'IMAGES',document:'DOCUMENTS',
  art:'CREATIVE',developer:'DEVELOPER',productivity:'PRODUCTIVITY'
});
const CURRENT_CODES = Object.freeze(Object.fromEntries(Object.entries(CATEGORY_CODES).map(([id,code])=>[code,id])));
export const WORKER_CATEGORIES = Object.freeze({
  ...CURRENT_CODES,
  // BM: Kod lama boleh dibaca menggunakan kategori projek asal apabila ada.
  // EN: Legacy codes defer to the source project's known category where available.
  PLAY:'games',DESIGN:'image',BUILD:'infrastructure',EVERYDAY:'productivity',
  DEVELOPER_TOOLS:'infrastructure',ONLINE_SERVICES:'productivity',WEB_UTILITIES:'productivity',
  APPS:'infrastructure'
});
const LEGACY_CODES = new Set(['PLAY','DESIGN','BUILD','EVERYDAY','DEVELOPER_TOOLS','ONLINE_SERVICES','WEB_UTILITIES','APPS']);
export const BUNDLED_FAMILY_SLUGS = Object.freeze(new Set([
  'zrain-image-tools','zrain-pdf-tools','zrain-document-tools',
  'zrain-developer-tools','zrain-productivity-tools'
]));
export function categoryFromWorker(workerValue, oldSourceCategory=null) {
  if(LEGACY_CODES.has(workerValue) && CATEGORIES.some(x=>x.id===oldSourceCategory))return oldSourceCategory;
  return WORKER_CATEGORIES[workerValue] || (CATEGORIES.some(x=>x.id===oldSourceCategory) ? oldSourceCategory : 'productivity');
}
export function categoryToWorker(uiValue) {
  return CATEGORY_CODES[uiValue] || CATEGORY_CODES.productivity;
}
export function visibleManagedProject(row) {
  return Boolean(row && typeof row.slug==='string' && !BUNDLED_FAMILY_SLUGS.has(row.slug) &&
    ['PUBLISHED','DRAFT','ARCHIVED'].includes(row.status));
}
