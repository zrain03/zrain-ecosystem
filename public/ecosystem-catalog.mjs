/*
 * Fail / File: public/ecosystem-catalog.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (rekod penciptaan asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyelaraskan senarai projek Published daripada Worker tanpa memaparkan Draft atau menggantikan laluan tools yang dibina.
 * EN: Reconciles Published Worker products without exposing Draft entries or overriding compiled tool paths.
 */
/**
 * One current catalogue for homepage, search, standalone Console and admin viewer.
 * Browser tools are bundled in source. Standalone products come from the existing
 * public, Published-only Cloudflare catalogue when available. No credentials, paid
 * APIs or client-side publishing controls are required.
 */
import {INVENTORY as SOURCE, CATEGORIES} from './ecosystem-inventory.mjs';

export const PUBLIC_CATALOG_URL = 'https://zrain-ecosystem-catalog.zrain-dev.workers.dev/api/catalog';
const OMIT_FAMILIES = new Set([
  'zrain-image-tools','zrain-pdf-tools','zrain-document-tools',
  'zrain-developer-tools','zrain-productivity-tools'
]);
import {WORKER_CATEGORIES,categoryFromWorker} from './admin/manage-core.mjs';
const ALLOWED = new Set(Object.keys(WORKER_CATEGORIES));
const baseProjects = new Map(SOURCE.filter(x=>x.kind==='project').map(x=>[x.id,x]));
const sourceTools = SOURCE.filter(x=>x.kind==='tool');
let current = Object.freeze([...SOURCE]);
let lastRefresh = 0;
let connected = false;
const listeners = new Set();

function https(value) {
  if (typeof value !== 'string' || value.length>500) return null;
  try {
    const x=new URL(value);
    if (x.protocol!=='https:' || !x.hostname || x.username || x.password || x.port) return null;
    return x.href;
  } catch { return null; }
}
function clean(value,max) {
  if(typeof value!=='string')return null;
  const x=value.trim();
  return x && x.length<=max ? x : null;
}
function websiteFor(row,known) {
  // GitHub/Play Store actions are source links rather than embeddable sites.
  if(['CONSOLE','WEBSITE','SHOWCASE','DOCUMENTATION'].includes(row.primaryAction))
    return https(row.primaryUrl) || known?.url || null;
  if (known?.url) return known.url;
  return https(row.secondaryUrl);
}
export function reconcilePublishedCatalog(rows,source=SOURCE) {
  if(!Array.isArray(rows))throw new TypeError('Public catalog must be an array');
  const projects=new Map(source.filter(x=>x.kind==='project').map(x=>[x.id,x]));
  const tools=source.filter(x=>x.kind==='tool');
  const mapped=[];
  const seen=new Set();
  for(const row of rows) {
    if(!row || row.status!=='PUBLISHED' || !ALLOWED.has(row.category))continue;
    const slug=clean(row.slug,80);
    if(!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || seen.has(slug) || OMIT_FAMILIES.has(slug))continue;
    // Never let the backend replace an actual compiled tool's route.
    if (tools.some(t=>t.id===slug))continue;
    const name=clean(row.name,100);
    const description=clean(row.description,300);
    if(!name || !description)continue;
    const known=projects.get(slug);
    const url=websiteFor(row,known);
    if(!url)continue;
    seen.add(slug);
    const isGithub= row.primaryAction==='GITHUB' && https(row.primaryUrl)?.startsWith('https://github.com/zrain03/');
    const secondaryGithub=https(row.secondaryUrl)?.startsWith('https://github.com/zrain03/');
    mapped.push(Object.freeze({
      id:slug,name,description,category:categoryFromWorker(row.category,known?.category),
      kind:'project',url,
      keywords:known?.keywords||[name,description].join(' '),
      repoUrl:known?.repoUrl||(isGithub?https(row.primaryUrl):secondaryGithub?https(row.secondaryUrl):null)
    }));
  }
  // A successful public response is authoritative for managed projects;
  // Draft/archived/deleted entries are not displayed or counted.
  const consoleApp = projects.get('zrain-console');
  return Object.freeze([
    ...tools,
    ...(consoleApp && !seen.has('zrain-console') ? [consoleApp] : []),
    ...mapped
  ]);
}
export function inventoryStats(items=current) {
  const projects=items.filter(x=>x.kind==='project').length;
  const tools=items.filter(x=>x.kind==='tool').length;
  return Object.freeze({projects,tools,total:projects+tools,categories:CATEGORIES.length,
    byCategory:Object.freeze(Object.fromEntries(CATEGORIES.map(c=>[c.id,items.filter(x=>x.category===c.id).length])))});
}
export function getActiveInventory(){return current;}
export function subscribeCatalog(callback) {
  listeners.add(callback);
  return ()=>listeners.delete(callback);
}
export function setPublishedCatalog(rows) {
  const next=reconcilePublishedCatalog(rows);
  current=next;
  const stats=inventoryStats(next);
  for(const listener of [...listeners])listener(next,stats);
  if (typeof document !== 'undefined' && typeof CustomEvent !== 'undefined')
    document.dispatchEvent(new CustomEvent('zrain:catalog-updated',{detail:{stats}}));
  return stats;
}
let pending=null;
export async function refreshPublicCatalog(fetcher=fetch,{minAge=30000,signal}={}) {
  const now=Date.now();
  if(pending)return pending;
  if(now-lastRefresh<minAge)return inventoryStats();
  pending=(async()=>{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),6500);
    try {
      const result=await fetcher(PUBLIC_CATALOG_URL,{headers:{Accept:'application/json'},cache:'no-store',signal:signal||controller.signal});
      if(!result.ok)throw new Error('Catalog unavailable');
      const body=await result.json();
      if(!Array.isArray(body))throw new Error('Unexpected catalog payload');
      const stats=setPublishedCatalog(body);
      lastRefresh=Date.now();
      return stats;
    } catch {
      // Offline/local preview keeps the 58-source snapshot, never fabricates
      // changes, and never exposes Draft products.
      lastRefresh=Date.now();
      return inventoryStats();
    } finally {clearTimeout(timeout);pending=null;}
  })();
  return pending;
}
// Refresh on return to the tab, without polling or extra paid infrastructure.
export function connectCatalogRefresh() {
  if (typeof document==='undefined' || connected)return;
  connected = true;
  void refreshPublicCatalog();
  window.addEventListener('pageshow',()=>void refreshPublicCatalog());
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')void refreshPublicCatalog();
  });
}
