// Product validation and free KV storage, independent from any paid service.
export const KEYS = Object.freeze({ admin:"admin/products-v1", public:"catalog/published-v1" });
const CATEGORIES = new Set(["GAMES","DEVELOPER_TOOLS","ONLINE_SERVICES","WEB_UTILITIES"]);
const ACTIONS = new Set(["CONSOLE","WEBSITE","GITHUB","PLAY_STORE","DOCUMENTATION","SHOWCASE"]);
function urlOK(value) {
  if (typeof value !== "string" || value.length > 500) return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !!u.hostname && !u.username && !u.password && !u.port;
  } catch { return false; }
}
function logoOK(value) {
  return typeof value === "string" && value.length <= 500 &&
    (/^\/(?!\/)(?!.*\.\.)[a-zA-Z0-9_./-]+$/.test(value) || urlOK(value));
}
export function validateProduct(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const slug = input.slug?.trim(), name = input.name?.trim();
  const description = input.description?.trim();
  const primaryLabel = input.primaryLabel?.trim();
  const secondaryLabel = input.secondaryLabel?.trim() || null;
  const secondaryUrl = input.secondaryUrl?.trim() || null;
  if (typeof slug !== "string" || slug.length > 80 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      typeof name !== "string" || !name || name.length > 100 ||
      typeof description !== "string" || !description || description.length > 300 ||
      !CATEGORIES.has(input.category) || !ACTIONS.has(input.primaryAction) ||
      !logoOK(input.logoUrl) || !urlOK(input.primaryUrl) ||
      typeof primaryLabel !== "string" || !primaryLabel || primaryLabel.length > 50 ||
      (secondaryUrl === null) !== (secondaryLabel === null) ||
      (secondaryUrl !== null && (!urlOK(secondaryUrl) || secondaryLabel.length > 50))) {
    return null;
  }
  return { slug,name,description,category:input.category,logoUrl:input.logoUrl,
    primaryAction:input.primaryAction,primaryLabel,primaryUrl:input.primaryUrl,
    secondaryLabel,secondaryUrl };
}
function existing(slug,name,description,category,logoUrl,primaryAction,primaryLabel,primaryUrl,
                  secondaryLabel,secondaryUrl,sortOrder) {
  return {slug,name,description,category,logoUrl,primaryAction,primaryLabel,primaryUrl,
    secondaryLabel,secondaryUrl,sortOrder};
}
export const EXISTING = Object.freeze([
  existing("guess-the-flag","Guess The Flag","Geography and flag challenges with 190 country flags.","GAMES",
    "/icons/guess-the-flag.webp","CONSOLE","Play Now","https://guesstheflag-zrain.web.app/",
    "Get on Google Play","https://play.google.com/store/apps/details?id=com.zrain.guesstheflag",10),
  existing("memory-rush","Memory Rush","Challenge your memory with Grid, Number and Pattern Recall.","GAMES",
    "/icons/memory-rush.webp","CONSOLE","Play Now","https://memoryrush-zrain.web.app/",
    "Get on Google Play","https://play.google.com/store/apps/details?id=com.zrain.memoryrush",20),
  existing("zrain-auth-starter","Zrain Auth Starter",
    "Reusable Java Spring Boot authentication template with JWT and role-based access.",
    "DEVELOPER_TOOLS","/zrain-logo.webp","GITHUB","View on GitHub",
    "https://github.com/zrain03/zrain-auth-starter","Try Demo",
    "https://zrain03.github.io/zrain-auth-starter/",10),
  existing("zrain-monitor","Zrain Monitor","Monitor public HTTPS services, review incidents and check uptime.",
    "DEVELOPER_TOOLS","/zrain-logo.webp","WEBSITE","Open Web App",
    "https://zrain-monitor.web.app/",null,null,20),
  existing("zrain-ui","Zrain UI","Shared design system and UI components for Zrain products.",
    "DEVELOPER_TOOLS","/zrain-logo.webp","GITHUB","View on GitHub",
    "https://github.com/zrain03/zrain-ui","View Showcase",
    "https://zrain.web.app/zrain-ui-showcase.html",30),
  existing("zrain-links","Zrain Links","Create custom short links, QR previews and visits links.",
    "ONLINE_SERVICES","/zrain-logo.webp","WEBSITE","Open Web App",
    "https://zrain-links.web.app/",null,null,10)
]);
export function newProduct(input, order) {
  return {...input,id:crypto.randomUUID(),sortOrder:order,status:"DRAFT",
    createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
}
export function nextOrder(products,category) {
  return Math.max(0,...products.filter(p=>p.category===category&&p.status!=="ARCHIVED")
    .map(p=>p.sortOrder||0))+10;
}
export function publicProducts(products) {
  return products.filter(p=>p.status==="PUBLISHED").sort((a,b)=>
    (a.sortOrder||0)-(b.sortOrder||0)||a.name.localeCompare(b.name))
    .map(({id,createdAt,updatedAt,...fields})=>fields);
}
export async function loadProducts(kv) {
  const stored=await kv.get(KEYS.admin);
  if (stored===null) return [];
  const rows=JSON.parse(stored);
  if (!Array.isArray(rows)) throw new Error("Stored product catalog invalid");
  return rows;
}
export async function saveProducts(kv,products) {
  if (products.length>300) throw new Error("Product limit reached");
  await kv.put(KEYS.admin,JSON.stringify(products));
}
export async function publishProducts(kv,products) {
  const rows=publicProducts(products);
  await kv.put(KEYS.public,JSON.stringify(rows));
  return rows.length;
}

// Five independently deployed Pages websites confirmed live by the owner.
// Never changes existing Draft, Published, or Archived records without admin action.
export const VERIFIED_TOOLS = Object.freeze([
  {
    "slug": "zrain-image-tools",
    "name": "Zrain Image Tools",
    "description": "Convert, inspect, crop and create images in the browser. Enhancement cannot recover missing detail.",
    "category": "ONLINE_SERVICES",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "WEBSITE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain-image-tools.pages.dev/",
    "secondaryLabel": null,
    "secondaryUrl": null
  },
  {
    "slug": "zrain-pdf-tools",
    "name": "Zrain PDF Tools",
    "description": "Organize and merge PDF pages, add text and apply watermarks. Existing PDF text is not rewritten.",
    "category": "ONLINE_SERVICES",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "WEBSITE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain-pdf-tools.pages.dev/",
    "secondaryLabel": null,
    "secondaryUrl": null
  },
  {
    "slug": "zrain-document-tools",
    "name": "Zrain Document Tools",
    "description": "Convert supported files, compare text, extract OCR and clean CSV. Complex layouts may differ.",
    "category": "ONLINE_SERVICES",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "WEBSITE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain-document-tools.pages.dev/",
    "secondaryLabel": null,
    "secondaryUrl": null
  },
  {
    "slug": "zrain-developer-tools",
    "name": "Zrain Developer Tools",
    "description": "Validate JSON, edit Markdown, create QR images, generate passwords and build UTM links.",
    "category": "DEVELOPER_TOOLS",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "WEBSITE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain-developer-tools.pages.dev/",
    "secondaryLabel": null,
    "secondaryUrl": null
  },
  {
    "slug": "zrain-productivity-tools",
    "name": "Zrain Productivity Tools",
    "description": "Create simple PDF invoices, transform text and use a focus timer with local session history.",
    "category": "ONLINE_SERVICES",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "WEBSITE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain-productivity-tools.pages.dev/",
    "secondaryLabel": null,
    "secondaryUrl": null
  }
]);
