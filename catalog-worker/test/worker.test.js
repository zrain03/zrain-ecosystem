import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";
import { EXISTING } from "../src/products.js";

const baseURL="https://zrain-admin.test";
const origin="https://zrain.web.app";
const adminEmail="admin@example.com";
const password="long-random-password-1234567890ABCDEF";
function mock() {
  const entries=new Map();
  return {
    env:{
      ZRAIN_CATALOG:{
        async get(k){return entries.get(k)??null;},
        async put(k,v){entries.set(k,v);},
      },
      ZRAIN_ALLOWED_ORIGIN:origin,
      ZRAIN_ADMIN_EMAIL:adminEmail,
      ZRAIN_ADMIN_PASSWORD:password,
      ZRAIN_JWT_SECRET_BASE64:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
    },
    entries
  };
}
async function send(env,path,method="GET",data,token,extras={}) {
  return worker.fetch(new Request(baseURL+path,{
    method,headers:{
      Origin:origin,
      ...(data!==undefined?{"Content-Type":"application/json"}:{}),
      ...(token?{Authorization:"Bearer "+token}:{}),
      ...extras
    },
    ...(data!==undefined?{body:JSON.stringify(data)}:{})
  }),env);
}
async function login(env) {
  const response=await send(env,"/api/admin/auth/login","POST",
    {email:adminEmail,password});
  assert.equal(response.status,200);
  return (await response.json()).accessToken;
}
test("Worker health does not require credentials or a database",async()=>{
  const response=await send({},"/api/health");
  assert.equal(response.status,200);
  assert.equal((await response.json()).storage,"workers-kv-free");
});
test("an unbound KV namespace fails closed",async()=>{
  const noStorage={ZRAIN_ALLOWED_ORIGIN:origin};
  assert.equal((await send(noStorage,"/api/catalog")).status,503);
  assert.equal((await send(noStorage,"/api/admin/auth/login","POST",{email:adminEmail,password})).status,503);
});
test("public website keeps static fallback until there is a real published catalog",async()=>{
  const {env}=mock();
  assert.equal((await send(env,"/api/catalog")).status,404);
  assert.equal((await send(env,"/api/products")).status,404);
});
test("secret admin login signs a short-lived JWT and does not offer registration",async()=>{
  const {env}=mock();
  const result=await send(env,"/api/admin/auth/login","POST",{email:adminEmail,password});
  assert.equal(result.status,200);
  const auth=await result.json();
  assert.equal(auth.tokenType,"Bearer");
  assert.equal(auth.expiresIn,900);
  assert.equal((await send(env,"/api/admin/auth/me","GET",undefined,auth.accessToken)).status,200);
  assert.equal((await send(env,"/api/admin/auth/me")).status,401);
  assert.equal((await send(env,"/api/v1/auth/register","POST",{email:"new@example.com"})).status,404);
});
test("wrong password is rejected and repeated guesses are rate-limited",async()=>{
  const {env}=mock();
  for(let i=0;i<5;i++){
    const response=await send(env,"/api/admin/auth/login","POST",
      {email:adminEmail,password:"incorrect"});
    assert.equal(response.status,401);
  }
  assert.equal((await send(env,"/api/admin/auth/login","POST",
    {email:adminEmail,password})).status,429);
});
test("a forged token or incorrect Origin cannot access the admin API",async()=>{
  const {env}=mock();
  const jwt=await login(env);
  assert.equal((await send(env,"/api/admin/products","GET",undefined,jwt+"bad")).status,401);
  const response=await send(env,"/api/admin/products","GET",undefined,jwt,
    {Origin:"https://attacker.example"});
  assert.equal(response.status,403);
});
test("existing product import is idempotent and remains in Draft",async()=>{
  const {env}=mock(), jwt=await login(env);
  const a=await send(env,"/api/admin/products/import-existing","POST",undefined,jwt);
  assert.equal((await a.json()).added,6);
  assert.equal((await (await send(env,"/api/admin/products","GET",undefined,jwt)).json()).length,6);
  assert.deepEqual(await (await send(env,"/api/catalog")).json(),[]);
  const b=await send(env,"/api/admin/products/import-existing","POST",undefined,jwt);
  assert.deepEqual(await b.json(),{added:0,skipped:6,totalAvailable:6});
  assert.equal(EXISTING.length,6);
});
test("published products appear publicly without manual sync and cannot be modified anonymously",async()=>{
  const {env}=mock(),jwt=await login(env);
  await send(env,"/api/admin/products/import-existing","POST",undefined,jwt);
  const rows=await (await send(env,"/api/admin/products","GET",undefined,jwt)).json();
  const p=rows.find(x=>x.slug==="memory-rush");
  assert.equal((await send(env,"/api/admin/products/"+p.id+"/publish","POST")).status,401);
  assert.equal((await send(env,"/api/admin/products/"+p.id+"/publish","POST",undefined,jwt)).status,200);
  const response=await send(env,"/api/catalog");
  assert.equal(response.status,200);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"),"*");
  assert.deepEqual((await response.json()).map(x=>x.slug),["memory-rush"]);
  assert.equal((await send(env,"/api/admin/products/"+p.id+"/unpublish","POST",undefined,jwt)).status,200);
  assert.deepEqual(await (await send(env,"/api/catalog")).json(),[]);
  assert.equal((await (await send(env,"/api/admin/catalog/sync","POST",undefined,jwt)).json()).published,0);
});
test("new products are Draft; duplicate and invalid URLs are rejected; editing preserves order",async()=>{
  const {env}=mock(),jwt=await login(env);
  const p={
    slug:"filefit",name:"FileFit",description:"Compress and convert files.",
    category:"ONLINE_SERVICES",logoUrl:"/zrain-logo.webp",
    primaryAction:"WEBSITE",primaryLabel:"Open Website",
    primaryUrl:"https://example.com/",secondaryLabel:null,secondaryUrl:null
  };
  const add=await send(env,"/api/admin/products","POST",p,jwt);
  assert.equal(add.status,200);
  const created=await add.json();
  assert.equal(created.status,"DRAFT");
  assert.equal(created.sortOrder,10);
  assert.equal((await send(env,"/api/admin/products","POST",p,jwt)).status,409);
  assert.equal((await send(env,"/api/admin/products","POST",
    {...p,slug:"unsafe",primaryUrl:"javascript:alert(1)"},jwt)).status,400);
  const edited=await send(env,"/api/admin/products/"+created.id,"PUT",
    {...p,name:"FileFit Updated"},jwt);
  assert.equal((await edited.json()).sortOrder,10);
});
test("unconfigured admin credentials fail closed",async()=>{
  const {env}=mock();
  env.ZRAIN_ADMIN_PASSWORD="";
  assert.equal((await send(env,"/api/admin/auth/login","POST",
    {email:adminEmail,password:"x"})).status,503);
});
test("KV Free quotas fail with an error, never a paid upgrade",async()=>{
  const {env}=mock(),jwt=await login(env);
  env.ZRAIN_CATALOG.put=async()=>{throw new Error("Free KV daily write limit reached");};
  const response=await send(env,"/api/admin/products/import-existing","POST",undefined,jwt);
  assert.equal(response.status,503);
  assert.match((await response.json()).error,/Free quota/);
});
test("oversized requests and missing JSON type are blocked",async()=>{
  const {env}=mock(),jwt=await login(env);
  const bytes=new Uint8Array(250_001);
  const response=await worker.fetch(new Request(baseURL+"/api/admin/products",{
    method:"POST",
    headers:{Origin:origin,Authorization:"Bearer "+jwt,"Content-Type":"application/json"},
    body:new ReadableStream({start(c){c.enqueue(bytes);c.close();}}),duplex:"half"
  }),env);
  assert.equal(response.status,413);
  assert.equal((await send(env,"/api/admin/products","POST",
    {name:"Incomplete"},jwt,{"Content-Type":"text/plain"})).status,415);
});
test("R2/media upload and paid service endpoints are absent",async()=>{
  const {env}=mock();
  assert.equal((await send(env,"/api/media","POST",{x:1})).status,404);
  assert.equal((await send(env,"/api/admin/catalog/logo","POST",{x:1})).status,401);
});

test("readiness blocks the web release when configuration is incomplete", async () => {
  const { env } = mock();
  assert.equal((await send(env, "/api/ready")).status, 200);
  env.ZRAIN_ADMIN_PASSWORD = "";
  const response = await send(env, "/api/ready");
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ready, false);
});

test("administrator can change to a 16-character password, and old credentials and tokens stop working",async()=>{
  const {env,entries}=mock();
  const token=await login(env);
  assert.equal((await send(env,"/api/admin/auth/password","POST",
    {currentPassword:"wrong",newPassword:"New-password-2026!"},token)).status,400);
  assert.equal((await send(env,"/api/admin/auth/password","POST",
    {currentPassword:password,newPassword:"short"},token)).status,400);
  const changed=await send(env,"/api/admin/auth/password","POST",
    {currentPassword:password,newPassword:"New-password-2026!"},token);
  assert.equal(changed.status,200);
  assert.deepEqual(await changed.json(),{changed:true,message:"Password updated. Sign in again."});
  const stored=entries.get("admin/password-override-v1");
  assert.ok(stored);
  assert.equal(stored.includes("New-password-2026!"),false);
  assert.equal((await send(env,"/api/admin/auth/me","GET",undefined,token)).status,401);
  assert.equal((await send(env,"/api/admin/auth/login","POST",
    {email:adminEmail,password})).status,401);
  const fresh=await send(env,"/api/admin/auth/login","POST",
    {email:adminEmail,password:"New-password-2026!"});
  assert.equal(fresh.status,200);
  const newToken=(await fresh.json()).accessToken;
  assert.equal((await send(env,"/api/admin/auth/me","GET",undefined,newToken)).status,200);
  assert.equal((await send(env,"/api/admin/auth/password","POST",
    {currentPassword:"New-password-2026!",newPassword:"Another-password-2026"},newToken)).status,200);
  assert.equal((await send(env,"/api/admin/auth/me","GET",undefined,newToken)).status,401);
});

test("missing or malformed password overrides fail closed",async()=>{
  const {env,entries}=mock();
  entries.set("admin/password-override-v1",'{"hash":"invalid"}');
  assert.equal((await send(env,"/api/admin/auth/login","POST",
    {email:adminEmail,password})).status,503);
});
