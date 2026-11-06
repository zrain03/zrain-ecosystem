/**
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Contoh input ringkas untuk medan teks; tanpa tutorial tambahan.
 * EN: Compact field examples instead of extra tutorials or generic help icons.
 */
const examples = {
  pages: 'e.g. 1,3,5 or 2-6',
  emojis: 'e.g. 🌸 🌼 💛',
  mark: 'e.g. My brand',
  bg: '#FFFFFF',
  label: 'e.g. Reviewed',
  seller: 'e.g. Your business name',
  buyer: 'e.g. Customer name',
  inv: 'e.g. INV-001',
  currency: 'e.g. MYR',
  url: 'e.g. https://example.com',
  source: 'e.g. instagram',
  medium: 'e.g. social',
  campaign: 'e.g. product-launch',
  term: 'Optional campaign keyword',
  content: 'Optional link label',
  hex: '#BD5338',
  output: 'Your result will appear here',
  textout: 'Your result will appear here',
  password: 'Generate a password first',
  utmout: 'Generated link appears here'
};
export function fieldPlaceholder(slug,id,label=''){
  if(id==='pages'){
    if(slug==='split-pdf')return 'e.g. 1,3,5 or 2-6 · blank = all pages';
    if(slug==='remove-pdf-pages')return 'e.g. 2,4 or 6-8';
    return 'e.g. 1,3,5 or 2-6 · blank = all pages';
  }
  if(Object.hasOwn(examples,id))return examples[id];
  if(/url|website|link/i.test(label))return 'e.g. https://example.com';
  if(/text|script|message|note|description/i.test(label))return 'Type or paste your text here';
  if(/filename|name/i.test(label))return 'Enter a name';
  return 'Enter '+label.toLowerCase().replace(/\s*\([^)]*\)/g,'').trim();
}
