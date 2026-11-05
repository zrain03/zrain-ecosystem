/*
 * Fail / File: catalog-worker/src/index.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menghala permintaan Worker kepada kesihatan, katalog awam dan route admin berautorisasi.
 * EN: Routes Worker requests to health, public catalogue and authorized administrator endpoints.
 */
// Zrain Ecosystem Admin API and public catalog.
// Production target: Cloudflare Workers Free + Workers KV Free ONLY.
// No Render, R2, third-party paid database, payments or automatic upgrades.
import { KEYS, EXISTING, VERIFIED_TOOLS, validateProduct, loadProducts, saveProducts,
  publishProducts, publicProducts, newProduct, nextOrder } from "./products.js";
import { authConfigured, issueJWT, verifyJWT, passwordMatches, rateLimitKey,
  readPasswordOverride, savePasswordOverride } from "./auth.js";

const OFFICIAL_PROJECTS = [
  {
    "slug": "guess-the-flag",
    "name": "Guess The Flag",
    "description": "Learn countries and flags with 190 flags and practice modes.",
    "category": "GAMES",
    "logoUrl": "/icons/guess-the-flag.webp",
    "primaryAction": "CONSOLE",
    "primaryLabel": "Play Now",
    "primaryUrl": "https://guesstheflag-zrain.web.app/",
    "secondaryLabel": "View on GitHub",
    "secondaryUrl": "https://github.com/zrain03/guess-the-flag"
  },
  {
    "slug": "memory-rush",
    "name": "Memory Rush",
    "description": "Grid, Number and Pattern Recall memory games.",
    "category": "GAMES",
    "logoUrl": "/icons/memory-rush.webp",
    "primaryAction": "CONSOLE",
    "primaryLabel": "Play Now",
    "primaryUrl": "https://memoryrush-zrain.web.app/",
    "secondaryLabel": "View on GitHub",
    "secondaryUrl": "https://github.com/zrain03/memory-rush"
  },
  {
    "slug": "zrain-auth-starter",
    "name": "Zrain Auth Starter",
    "description": "Java Spring Boot JWT authentication developer demo and template.",
    "category": "INFRASTRUCTURE",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "CONSOLE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain03.github.io/zrain-auth-starter/",
    "secondaryLabel": "View on GitHub",
    "secondaryUrl": "https://github.com/zrain03/zrain-auth-starter"
  },
  {
    "slug": "zrain-ui",
    "name": "Zrain UI",
    "description": "Shared design system and component showcase.",
    "category": "INFRASTRUCTURE",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "CONSOLE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain.web.app/zrain-ui-showcase.html",
    "secondaryLabel": "View on GitHub",
    "secondaryUrl": "https://github.com/zrain03/zrain-ui"
  },
  {
    "slug": "zrain-console",
    "name": "Zrain Console",
    "description": "Open Zrain applications in a unified workspace.",
    "category": "OPERATIONS",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "CONSOLE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain.web.app/zrain-console.html",
    "secondaryLabel": "View on GitHub",
    "secondaryUrl": "https://github.com/zrain03/zrain-console"
  },
  {
    "slug": "zrain-links",
    "name": "Zrain Links",
    "description": "Create short links, QR previews and visits links.",
    "category": "PRESENCE",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "CONSOLE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain-links.web.app/",
    "secondaryLabel": "View on GitHub",
    "secondaryUrl": "https://github.com/zrain03/zrain-links"
  },
  {
    "slug": "zrain-monitor",
    "name": "Zrain Monitor",
    "description": "Monitor uptime and public HTTPS services.",
    "category": "OPERATIONS",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "CONSOLE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain-monitor.web.app/",
    "secondaryLabel": "View on GitHub",
    "secondaryUrl": "https://github.com/zrain03/zrain-monitor"
  },
  {
    "slug": "zrain-ai",
    "name": "Zrain AI",
    "description": "Multilingual AI assistant with chat, research and tools.",
    "category": "AI",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "CONSOLE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain-ai.web.app/",
    "secondaryLabel": null,
    "secondaryUrl": null
  },
  {
    "slug": "zrain-gifts",
    "name": "Zrain Gifts",
    "description": "Public creator pages, project links and ways to support creators.",
    "category": "PRESENCE",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "CONSOLE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain-gifts.web.app/",
    "secondaryLabel": null,
    "secondaryUrl": null
  },
  {
    "slug": "zrain-community",
    "name": "Zrain Community",
    "description": "Public comments, feedback and independent product communities with reusable integration.",
    "category": "INFRASTRUCTURE",
    "logoUrl": "/zrain-logo.webp",
    "primaryAction": "CONSOLE",
    "primaryLabel": "Open Web App",
    "primaryUrl": "https://zrain-community.web.app/",
    "secondaryLabel": null,
    "secondaryUrl": null
  }
];
const MAX_REQUEST_BYTES=250_000;
const JSON_HEADERS={"Content-Type":"application/json; charset=utf-8",
  "X-Content-Type-Options":"nosniff","Cache-Control":"no-store"};
const ALLOW_METHODS="GET, POST, PUT, OPTIONS";
// BM: ErrorResponse: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menghala permintaan Worker kepada kesihatan, katalog awam dan route admin berautorisasi.
// EN: ErrorResponse: Isolates one operation so it can be reviewed and tested. Module purpose: routes Worker requests to health, public catalogue and authorized administrator endpoints.
class ErrorResponse extends Error {
  constructor(status,message){super(message);this.status=status;}
}
function trustedOrigin(request,env) {
  const origin=request.headers.get("Origin");
  if(!origin)return null;
  if(origin==="https://zrain.web.app" && env.ZRAIN_ALLOWED_ORIGIN===origin)return origin;
  if(env.ZRAIN_ALLOW_LOCAL_PREVIEW==="true" &&
     (origin==="http://localhost:5000" || origin==="http://127.0.0.1:5000"))
    return origin;
  return null;
}
// BM: reply: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menghala permintaan Worker kepada kesihatan, katalog awam dan route admin berautorisasi. Input: request,env,body,status=200,publicRead=false,extra={}.
// EN: reply: Isolates one operation so it can be reviewed and tested. Module purpose: routes Worker requests to health, public catalogue and authorized administrator endpoints. Inputs: request,env,body,status=200,publicRead=false,extra={}.
function reply(request,env,body,status=200,publicRead=false,extra={}) {
  const origin=trustedOrigin(request,env);
  const headers={...JSON_HEADERS,...extra};
  if(publicRead)headers["Access-Control-Allow-Origin"]="*";
  else if(origin) {
    headers["Access-Control-Allow-Origin"]=origin;
    headers["Vary"]="Origin";
  }
  return new Response(JSON.stringify(body),{status,headers});
}
// BM: readJSON: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menghala permintaan Worker kepada kesihatan, katalog awam dan route admin berautorisasi. Input: request,limit=MAX_REQUEST_BYTES.
// EN: readJSON: Reads relevant records and returns a bounded result to the caller. Module purpose: routes Worker requests to health, public catalogue and authorized administrator endpoints. Inputs: request,limit=MAX_REQUEST_BYTES.
async function readJSON(request,limit=MAX_REQUEST_BYTES) {
  if(!request.headers.get("Content-Type")?.toLowerCase().includes("application/json"))
    throw new ErrorResponse(415,"JSON required");
  if(Number(request.headers.get("Content-Length"))>limit)
    throw new ErrorResponse(413,"Request too large");
  const bytes=await readLimited(request,limit);
  if(!bytes)throw new ErrorResponse(413,"Request too large");
  try{return JSON.parse(new TextDecoder().decode(bytes));}
  catch {throw new ErrorResponse(400,"Invalid JSON");}
}
// BM: readLimited: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menghala permintaan Worker kepada kesihatan, katalog awam dan route admin berautorisasi. Input: request,limit.
// EN: readLimited: Reads relevant records and returns a bounded result to the caller. Module purpose: routes Worker requests to health, public catalogue and authorized administrator endpoints. Inputs: request,limit.
async function readLimited(request,limit) {
  if(!request.body)return new Uint8Array();
  const reader=request.body.getReader();
  const parts=[];let length=0;
  try{
    while(true){
      const {value,done}=await reader.read();
      if(done)break;
      length+=value.byteLength;
      if(length>limit){await reader.cancel();return null;}
      parts.push(value);
    }
  }finally{reader.releaseLock();}
  const bytes=new Uint8Array(length);
  let offset=0;
  for(const part of parts){bytes.set(part,offset);offset+=part.byteLength;}
  return bytes;
}
// BM: readPublic: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menghala permintaan Worker kepada kesihatan, katalog awam dan route admin berautorisasi. Input: env.
// EN: readPublic: Reads relevant records and returns a bounded result to the caller. Module purpose: routes Worker requests to health, public catalogue and authorized administrator endpoints. Inputs: env.
async function readPublic(env) {
  // Always derive the public catalog from the latest product statuses.
  // This removes manual sync and uses only one Free KV read per page load.
  const products=await loadProducts(env.ZRAIN_CATALOG);
  return products.length ? JSON.stringify(publicProducts(products)) : null;
}
// BM: login: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menghala permintaan Worker kepada kesihatan, katalog awam dan route admin berautorisasi. Input: request,env.
// EN: login: Isolates one operation so it can be reviewed and tested. Module purpose: routes Worker requests to health, public catalogue and authorized administrator endpoints. Inputs: request,env.
async function login(request,env) {
  if(!authConfigured(env))throw new ErrorResponse(503,"Admin is not configured");
  const body=await readJSON(request,4096);
  if(typeof body?.email!=="string"||typeof body?.password!=="string")
    throw new ErrorResponse(400,"Email and password are required");
  if(body.email.length>254 || body.password.length>512)
    throw new ErrorResponse(400,"Credentials invalid");
  const email=body.email.trim().toLowerCase();
  const key=await rateLimitKey(request,email);
  let attempts=0;
  try {
    attempts=Number(await env.ZRAIN_CATALOG.get(key))||0;
  }catch {throw new ErrorResponse(503,"Login temporarily unavailable");}
  if(attempts>=5)throw new ErrorResponse(429,"Too many attempts. Try again later.");
  const credential=await readPasswordOverride(env.ZRAIN_CATALOG);
  const okay=email===env.ZRAIN_ADMIN_EMAIL.trim().toLowerCase() &&
    await passwordMatches(body.password,env,credential);
  if(!okay) {
    try{await env.ZRAIN_CATALOG.put(key,String(attempts+1),{expirationTtl:900});}
    catch {throw new ErrorResponse(503,"Login temporarily unavailable");}
    throw new ErrorResponse(401,"Invalid email or password");
  }
  return {accessToken:await issueJWT(env.ZRAIN_ADMIN_EMAIL,env,
    credential?.version||"bootstrap"),expiresIn:900,tokenType:"Bearer"};
}
// BM: authenticated: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menghala permintaan Worker kepada kesihatan, katalog awam dan route admin berautorisasi. Input: request,env.
// EN: authenticated: Isolates one operation so it can be reviewed and tested. Module purpose: routes Worker requests to health, public catalogue and authorized administrator endpoints. Inputs: request,env.
async function authenticated(request,env) {
  const header=request.headers.get("Authorization");
  if(!header?.startsWith("Bearer "))return null;
  const claims=await verifyJWT(header.slice(7),env);
  if(!claims)return null;
  const credential=await readPasswordOverride(env.ZRAIN_CATALOG);
  return claims.passwordVersion===(credential?.version||"bootstrap")?claims:null;
}
// BM: validateUniqueness: Mengesahkan prasyarat atau syarat keselamatan sebelum meneruskan aliran. Tujuan modul: menghala permintaan Worker kepada kesihatan, katalog awam dan route admin berautorisasi. Input: rows,slug,excluding=null.
// EN: validateUniqueness: Checks a precondition or safety invariant before allowing the flow to continue. Module purpose: routes Worker requests to health, public catalogue and authorized administrator endpoints. Inputs: rows,slug,excluding=null.
function validateUniqueness(rows,slug,excluding=null) {
  if(rows.some(p=>p.slug===slug && p.id!==excluding))
    throw new ErrorResponse(409,"The product ID is already used.");
}
async function saveAndRespond(env,rows,value) {
  await saveProducts(env.ZRAIN_CATALOG,rows);
  return value;
}
// BM: routeAdmin: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menghala permintaan Worker kepada kesihatan, katalog awam dan route admin berautorisasi. Input: request,env,path.
// EN: routeAdmin: Isolates one operation so it can be reviewed and tested. Module purpose: routes Worker requests to health, public catalogue and authorized administrator endpoints. Inputs: request,env,path.
async function routeAdmin(request,env,path) {
  if(path==="/api/admin/auth/login" && request.method==="POST")
    return login(request,env);
  const claims=await authenticated(request,env);
  if(!claims)throw new ErrorResponse(401,"Administrator authentication required");
  if(path==="/api/admin/auth/me" && request.method==="GET")
    return {email:claims.sub,role:"ADMIN"};
  if(path==="/api/admin/auth/password" && request.method==="POST") {
    const data=await readJSON(request,4096);
    if(typeof data?.currentPassword!=="string" ||
       typeof data?.newPassword!=="string" ||
       data.newPassword.length<16 || data.newPassword.length>128)
      throw new ErrorResponse(400,"Use a new password of 16 to 128 characters.");
    const existing=await readPasswordOverride(env.ZRAIN_CATALOG);
    if(!await passwordMatches(data.currentPassword,env,existing))
      throw new ErrorResponse(400,"Current password is incorrect.");
    if(data.currentPassword===data.newPassword)
      throw new ErrorResponse(400,"Choose a different password.");
    await savePasswordOverride(env.ZRAIN_CATALOG,data.newPassword,env);
    return {changed:true,message:"Password updated. Sign in again."};
  }
  if(path==="/api/admin/catalog/status" && request.method==="GET")
    return {configured:authConfigured(env)&&!!env.ZRAIN_CATALOG?.put};
  if(path==="/api/admin/catalog/sync" && request.method==="POST") {
    const rows=await loadProducts(env.ZRAIN_CATALOG);
    return {published:publicProducts(rows).length,success:true};
  }
  if(path==="/api/admin/products" && request.method==="GET")
    return loadProducts(env.ZRAIN_CATALOG);
  // Deliberate, authenticated publishing of the five Cloudflare Pages products.
  // Never overwrites entries already managed by the admin.
  if(path==="/api/admin/products/import-verified-tools" && request.method==="POST") {
    const rows=await loadProducts(env.ZRAIN_CATALOG);
    let added=0,skipped=0;
    for(const entry of VERIFIED_TOOLS) {
      if(rows.some(p=>p.slug===entry.slug)){skipped++;continue;}
      if(rows.length>=300)throw new ErrorResponse(400,"Product limit reached");
      const valid=validateProduct(entry);
      if(!valid)throw new ErrorResponse(500,"Built-in product metadata invalid");
      rows.push({...newProduct(valid,nextOrder(rows,valid.category)),status:"PUBLISHED"});
      added++;
    }
    if(added)await saveProducts(env.ZRAIN_CATALOG,rows);
    return {added,skipped,totalAvailable:VERIFIED_TOOLS.length,publishedNow:added};
  }
  if(path==="/api/admin/products/import-existing" && request.method==="POST") {
    const rows=await loadProducts(env.ZRAIN_CATALOG);
    let added=0;
    for(const entry of EXISTING) {
      if(rows.some(p=>p.slug===entry.slug))continue;
      rows.push(newProduct(entry,entry.sortOrder));
      added++;
    }
    if(added)await saveProducts(env.ZRAIN_CATALOG,rows);
    return {added,skipped:EXISTING.length-added,totalAvailable:EXISTING.length};
  }
  // ZRAIN OFFICIAL 11 CATEGORY SYNC: authenticated, idempotent, KV Free only.
  if(path==="/api/admin/products/sync-official" && request.method==="POST") {
    const rows=await loadProducts(env.ZRAIN_CATALOG);
    let added=0,skipped=0,aligned=0;
    for(const entry of OFFICIAL_PROJECTS) {
      const record=rows.find(p=>p.slug===entry.slug);
      if(record){
        skipped++;
        // Never publish a Draft or Archived entry without explicit admin action.
        if(record.status==='PUBLISHED' && record.category!==entry.category){
          record.category=entry.category;record.updatedAt=new Date().toISOString();aligned++;
        }
        continue;
      }
      if(rows.length>=300)throw new ErrorResponse(400,'Product limit reached');
      const valid=validateProduct(entry);
      if(!valid)throw new ErrorResponse(500,'Official product metadata invalid');
      rows.push({...newProduct(valid,nextOrder(rows,valid.category)),status:'PUBLISHED'});
      added++;
    }
    if(added||aligned)await saveProducts(env.ZRAIN_CATALOG,rows);
    return {added,skipped,aligned,totalOfficial:OFFICIAL_PROJECTS.length};
  }
  if(path==="/api/admin/products" && request.method==="POST") {
    const input=validateProduct(await readJSON(request));
    if(!input)throw new ErrorResponse(400,"Invalid product fields");
    const rows=await loadProducts(env.ZRAIN_CATALOG);
    if(rows.length>=300)throw new ErrorResponse(400,"Product limit reached");
    validateUniqueness(rows,input.slug);
    const product=newProduct(input,nextOrder(rows,input.category));
    rows.push(product);
    return saveAndRespond(env,rows,product);
  }
  const match=path.match(/^\/api\/admin\/products\/([a-f0-9-]{36})(?:\/(publish|unpublish|archive))?$/);
  if(match){
    const rows=await loadProducts(env.ZRAIN_CATALOG);
    const found=rows.find(p=>p.id===match[1]);
    if(!found)throw new ErrorResponse(404,"Product not found");
    if(match[2] && request.method==="POST") {
      found.status={publish:"PUBLISHED",unpublish:"DRAFT",archive:"ARCHIVED"}[match[2]];
      found.updatedAt=new Date().toISOString();
      return saveAndRespond(env,rows,found);
    }
    if(!match[2] && request.method==="PUT") {
      const input=validateProduct(await readJSON(request));
      if(!input)throw new ErrorResponse(400,"Invalid product fields");
      validateUniqueness(rows,input.slug,found.id);
      const order=input.category===found.category?found.sortOrder:nextOrder(rows,input.category);
      Object.assign(found,input,{sortOrder:order,updatedAt:new Date().toISOString()});
      return saveAndRespond(env,rows,found);
    }
  }
  throw new ErrorResponse(404,"Admin endpoint not found");
}

export default {
  async fetch(request,env) {
    const path=new URL(request.url).pathname;
    const isPublic=path==="/api/catalog" || path==="/api/products" || path==="/api/health" || path==="/api/ready";
    const origin=request.headers.get("Origin");
    const allowed=trustedOrigin(request,env);
    if(request.method==="OPTIONS") {
      if(!allowed)return reply(request,env,{error:"Origin not allowed"},403);
      return new Response(null,{status:204,headers:{
        "Access-Control-Allow-Origin":allowed,
        "Access-Control-Allow-Methods":ALLOW_METHODS,
        "Access-Control-Allow-Headers":"Authorization, Content-Type",
        "Access-Control-Max-Age":"300",
        "Vary":"Origin"
      }});
    }
    if(!isPublic && origin && !allowed)
      return reply(request,env,{error:"Origin not allowed"},403);
    if(path==="/api/health" && request.method==="GET")
      return reply(request,env,{status:"ok",service:"zrain-ecosystem-admin-free",
        storage:"workers-kv-free"},200,true);
    if(path==="/api/ready" && request.method==="GET") {
      const ready=Boolean(env.ZRAIN_CATALOG?.get && env.ZRAIN_CATALOG?.put) &&
        authConfigured(env) && env.ZRAIN_ALLOWED_ORIGIN==="https://zrain.web.app";
      return reply(request,env,{ready,storage:"workers-kv-free"},ready?200:503,true);
    }
    if(!env.ZRAIN_CATALOG?.get || !env.ZRAIN_CATALOG?.put)
      return reply(request,env,{error:"KV Free namespace is not bound"},503,isPublic);
    try{
      if((path==="/api/catalog" || path==="/api/products") && request.method==="GET"){
        const result=await readPublic(env);
        if(result===null)return reply(request,env,{error:"Catalog not yet published"},404,true);
        return new Response(result,{headers:{
          ...JSON_HEADERS,"Cache-Control":"no-store",
          "Access-Control-Allow-Origin":"*"}});
      }
      if(path.startsWith("/api/admin/")){
        const value=await routeAdmin(request,env,path);
        return reply(request,env,value,200);
      }
      return reply(request,env,{error:"Not found"},404,isPublic);
    }catch(error) {
      if(error instanceof ErrorResponse)
        return reply(request,env,{error:error.message},error.status,isPublic);
      // Free plan limits or storage outages must fail closed, never auto-upgrade.
      return reply(request,env,{error:"Service unavailable or Free quota reached"},503,isPublic);
    }
  }
};
