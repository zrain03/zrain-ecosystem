// Single-admin authentication for Workers Free.
// The login secret is an encrypted Worker secret, NOT a browser value.
// Use a randomly generated 32+ character password and 32+ byte Base64 JWT key.
const encoder=new TextEncoder();
const encode=value=>btoa(String.fromCharCode(...encoder.encode(value))).replace(/\+/g,"-")
  .replace(/\//g,"_").replace(/=+$/g,"");
function toBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-")
    .replace(/\//g,"_").replace(/=+$/g,"");
}
function fromBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try { return Uint8Array.from(atob(value.replace(/-/g,"+").replace(/_/g,"/")), c=>c.charCodeAt(0)); }
  catch { return null; }
}
function fixedDigestEqual(a,b) {
  if (a.length!==b.length) return false;
  let diff=0;
  for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
  return diff===0;
}
async function digest(value) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(value)));
}
export function authConfigured(env) {
  if (typeof env.ZRAIN_ADMIN_EMAIL!=="string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.ZRAIN_ADMIN_EMAIL) ||
      typeof env.ZRAIN_ADMIN_PASSWORD!=="string" ||
      env.ZRAIN_ADMIN_PASSWORD.length<32 ||
      typeof env.ZRAIN_JWT_SECRET_BASE64!=="string") return false;
  try {
    const bytes=Uint8Array.from(atob(env.ZRAIN_JWT_SECRET_BASE64),c=>c.charCodeAt(0));
    return bytes.length>=32;
  } catch { return false; }
}
async function signingKey(env) {
  const bytes=Uint8Array.from(atob(env.ZRAIN_JWT_SECRET_BASE64),c=>c.charCodeAt(0));
  return crypto.subtle.importKey("raw",bytes,{name:"HMAC",hash:"SHA-256"},false,["sign","verify"]);
}
export async function issueJWT(email,env) {
  const now=Math.floor(Date.now()/1000);
  const head=encode(JSON.stringify({alg:"HS256",typ:"JWT"}));
  const body=encode(JSON.stringify({iss:"zrain-ecosystem",aud:"zrain-admin",sub:email,
    role:"ADMIN",iat:now,exp:now+900}));
  const toSign=head+"."+body;
  const mac=new Uint8Array(await crypto.subtle.sign("HMAC",await signingKey(env),encoder.encode(toSign)));
  return toSign+"."+toBase64Url(mac);
}
export async function verifyJWT(token,env) {
  if (!authConfigured(env)||typeof token!=="string"||token.length>4096) return null;
  const pieces=token.split(".");
  if (pieces.length!==3) return null;
  const signature=fromBase64Url(pieces[2]);
  if (!signature||signature.length!==32) return null;
  try {
    const valid=await crypto.subtle.verify("HMAC",await signingKey(env),signature,
      encoder.encode(pieces[0]+"."+pieces[1]));
    if(!valid)return null;
    const bytes=fromBase64Url(pieces[1]);
    if(!bytes)return null;
    const payload=JSON.parse(new TextDecoder().decode(bytes));
    const now=Math.floor(Date.now()/1000);
    return payload.iss==="zrain-ecosystem" && payload.aud==="zrain-admin" &&
      payload.sub===env.ZRAIN_ADMIN_EMAIL && payload.role==="ADMIN" &&
      Number.isInteger(payload.iat) && payload.iat<=now &&
      Number.isInteger(payload.exp) && payload.exp>now && payload.exp<=now+900
      ? payload : null;
  }catch {return null;}
}
export async function passwordMatches(password,env) {
  if (!authConfigured(env)||typeof password!=="string"||password.length>512) return false;
  const a=await digest(password);
  const b=await digest(env.ZRAIN_ADMIN_PASSWORD);
  return fixedDigestEqual(a,b);
}
export async function rateLimitKey(request,email) {
  const ip=request.headers.get("CF-Connecting-IP")||"unknown";
  const bytes=await digest("zrain-login:"+ip+"|"+email);
  return "rate/"+Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
}
