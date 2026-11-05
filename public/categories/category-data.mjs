/*
 * Fail / File: public/categories/category-data.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-03 (berdasarkan header dataset asal)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Taksonomi kanonik bagi 58 item unik dan 11 kategori bersama pemeriksaan pendua.
 * EN: Canonical taxonomy for 58 unique items and 11 categories with duplicate detection.
 */
// BM: Taksonomi 3 November 2026 telah diluluskan bagi 58 item dalam 11 kategori.
// EN: The 3 November 2026 taxonomy is approved for 58 items across 11 categories.
// Exactly 58 distinct items, each in one category. No billing or backend access.
export const CATEGORIES = Object.freeze([
  {id:'games',name:'Games & Interactive Learning',description:'Games and interactive learning experiences.',items:['Guess the Flag','Memory Rush']},
  {id:'ai',name:'Artificial Intelligence',description:'Useful AI-powered applications.',items:['Zrain AI']},
  {id:'infrastructure',name:'Developer Infrastructure & SDKs',description:'APIs, libraries, shared UI and developer foundations.',items:['Zrain Community','Zrain UI','Zrain Auth Starter']},
  {id:'links',name:'Digital Presence & Link Tools',description:'Share links, track campaigns, create QR codes and showcase your work.',items:['Zrain Links','UTM Builder','QR Generator','Zrain Gifts']},
  {id:'monitoring',name:'Monitoring & Operations',description:'Monitor web services and manage Zrain applications.',items:['Zrain Monitor','Zrain Console']},
  {id:'pdf',name:'PDF Tools',description:'Edit, combine, organize, split, convert and extract PDF content.',items:['Crop PDF','Extract PDF Pages','Merge PDF','PDF Organizer','Remove PDF Pages','Rotate PDF','Split PDF','PDF Editor','PDF Page Numbers','PDF Watermark','JPG & PNG to PDF','PDF to Images','PDF to Text']},
  {id:'image',name:'Image Tools',description:'Improve, edit, convert, inspect and compare images.',items:['Background Remover','Compress Image','Image Converter','Image Cropper','Image Enhancer','Resize Image','Rotate & Flip Image','Watermark','Color Inspector','Image Compare','Image Inspector']},
  {id:'document',name:'Document Tools',description:'Handle documents, text conversion, OCR and structured data.',items:['File Converter','Text Extractor','Compare','CSV Cleaner','Markdown Editor','Text Tools','Word Counter']},
  {id:'art',name:'Digital Art & Creative Design',description:'Create visual art, collages, icons and image-based artwork.',items:['Collage Maker','Emoji Art','Icon Maker','Image to ASCII','Pixel Art']},
  {id:'developer',name:'Developer Utilities & Security',description:'Format data, decode tokens and generate developer resources.',items:['Base64 Converter','JSON Studio','JWT Decoder','Password Generator','SHA Hash Generator','UUID Generator','CSS Shadow Generator']},
  {id:'productivity',name:'Productivity & Business Tools',description:'Focus, present information and make basic business documents.',items:['Focus Timer','Teleprompter','Invoice Generator']}
]);

export const CATEGORY_COUNTS = Object.freeze(CATEGORIES.map(c => ({id:c.id,name:c.name,count:c.items.length})));
export const TOTAL_ITEMS = CATEGORIES.reduce((sum,c)=>sum+c.items.length,0);

export function slugify(value) {
  return String(value ?? '').normalize('NFKD').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
export function validateTaxonomy() {
  const categoryIds = new Set();
  const names = new Set();
  for (const cat of CATEGORIES) {
    if (categoryIds.has(cat.id)) throw new Error('Duplicate category: ' + cat.id);
    categoryIds.add(cat.id);
    for (const item of cat.items) {
      const key=slugify(item);
      if (names.has(key)) throw new Error('Item assigned more than once: ' + item);
      names.add(key);
    }
  }
  if (CATEGORIES.length!==11 || TOTAL_ITEMS!==58 || names.size!==58)
    throw new Error('Expected exactly 11 categories and 58 unique items');
  for (const item of ['Zrain Links','UTM Builder','QR Generator','Zrain Gifts'])
    if (!CATEGORIES.find(c=>c.id==='links').items.includes(item)) throw new Error('Digital Presence grouping has changed');
  return true;
}

// URLs that have been established in Zrain project records. Unknown project URLs
// are intentionally omitted, never invented. Live inventory URLs take priority.
export const KNOWN_PROJECT_URLS = Object.freeze({
  'guess-the-flag':'https://guesstheflag-zrain.web.app/',
  'memory-rush':'https://memoryrush-zrain.web.app/',
  'zrain-ai':'https://zrain-ai.web.app/',
  'zrain-auth-starter':'https://github.com/zrain03/zrain-auth-starter',
  'zrain-ui':'https://github.com/zrain03/zrain-ui',
  'zrain-links':'https://zrain-links.web.app/',
  'zrain-monitor':'https://zrain-monitor.web.app/',
  'zrain-console':'https://zrain.web.app/zrain-console.html'
});

// Some tools may be labeled differently in a deployed registry.
const ALIASES = Object.freeze({
  'base64-converter':['base64-tool','base64-encoder','base64-decoder'],
  'sha-hash-generator':['hash-generator','sha-generator'],
  'jpg-and-png-to-pdf':['images-to-pdf','image-to-pdf','jpg-to-pdf','png-to-pdf'],
  'image-to-ascii':['image-to-ascii-art'],
  'rotate-and-flip-image':['rotate-image','flip-image','rotate-flip-image'],
  'extract-pdf-pages':['extract-pages-pdf'],
  'pdf-page-numbers':['add-page-numbers'],
  'word-counter':['word-count']
});

function validUrl(value) {
  if(typeof value!=='string' || !value.trim())return null;
  const u=value.trim();
  if(/^\/(?!\/)(?!.*\.\.)[\w/.#?&=%-]+$/.test(u))return u;
  try {const obj=new URL(u);return (obj.protocol==='https:' && !obj.username && !obj.password) ? obj.href : null;}
  catch{return null;}
}

export function normalizeCandidates(rows) {
  if (!Array.isArray(rows))return [];
  return rows.map(item=>({
    name:String(item.name ?? item.title ?? item.label ?? ''),
    slug:String(item.id ?? item.slug ?? item.toolId ?? ''),
    url:validUrl(item.url ?? item.href ?? item.webUrl ?? item.primaryUrl ?? item.websiteUrl ?? item.path),
    published:item.status==null || item.status==='PUBLISHED' || item.status==='published'
  })).filter(x=>x.published && x.url && (x.name || x.slug));
}

export function resolvePortfolio(candidates=[]) {
  validateTaxonomy();
  const resolved=normalizeCandidates(candidates);
  const lookup=new Map();
  for(const row of resolved)for(const key of [row.name,row.slug]){
    const slug=slugify(key);
    if(slug && !lookup.has(slug))lookup.set(slug,row.url);
  }
  return CATEGORIES.map(category=>({
    ...category,
    items:category.items.map(name=>{
      const id=slugify(name);
      const keys=[id,...(ALIASES[id]??[])];
      let url=keys.map(key=>lookup.get(key)).find(Boolean) ?? KNOWN_PROJECT_URLS[id] ?? null;
      return {name,id,url};
    })
  }));
}
