/*
 * Fail / File: tool-runtime/src/core.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyediakan operasi kecil yang boleh diuji bagi pemprosesan teks, imej dan data.
 * EN: Provides small testable operations for text, image and data processing.
 */
export const clamp = (n,lo,hi) => Math.max(lo,Math.min(hi,n));
export function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('').toUpperCase()}
export function hexToRgb(hex){const h=hex.replace('#','');if(!/^(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(h))throw new Error('Invalid HEX color');const x=h.length===3?h.split('').map(c=>c+c).join(''):h;return [0,2,4].map(i=>parseInt(x.slice(i,i+2),16))}
export function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;let h=0,s=0,l=(max+min)/2;if(delta){s=delta/(1-Math.abs(2*l-1));switch(max){case r:h=((g-b)/delta)%6;break;case g:h=(b-r)/delta+2;break;default:h=(r-g)/delta+4;}h*=60;if(h<0)h+=360;}return [Math.round(h),Math.round(s*100),Math.round(l*100)]}
// BM: rgbToCmyk: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyediakan operasi kecil yang boleh diuji bagi pemprosesan teks, imej dan data. Input: r,g,b.
// EN: rgbToCmyk: Isolates one operation so it can be reviewed and tested. Module purpose: provides small testable operations for text, image and data processing. Inputs: r,g,b.
export function rgbToCmyk(r,g,b){const k=1-Math.max(r,g,b)/255;if(k>=1)return [0,0,0,100];return [...[r,g,b].map(v=>Math.round((1-v/255-k)/(1-k)*100)),Math.round(k*100)]}
export function luminance(r,g,b){const [R,G,B]=[r,g,b].map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*R+.7152*G+.0722*B}
export function contrast(a,b){const l1=luminance(...a),l2=luminance(...b);return +(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)}
export function xmlEscape(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;')}
export function splitLines(s){return String(s).replaceAll('\r\n','\n').split('\n')}
/** Bounded LCS: avoids quadratic browser stalls on very large inputs. */
// BM: lineDiff: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyediakan operasi kecil yang boleh diuji bagi pemprosesan teks, imej dan data. Input: a,b,max=650.
// EN: lineDiff: Isolates one operation so it can be reviewed and tested. Module purpose: provides small testable operations for text, image and data processing. Inputs: a,b,max=650.
export function lineDiff(a,b,max=650){const A=splitLines(a),B=splitLines(b);if(A.length>max||B.length>max)throw new Error(`Compare supports up to ${max} lines per file. Split larger files into sections.`);const m=A.length,n=B.length;const d=Array.from({length:m+1},()=>new Uint16Array(n+1));for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)d[i][j]=A[i]===B[j]?d[i+1][j+1]+1:Math.max(d[i+1][j],d[i][j+1]);let i=0,j=0;const out=[];while(i<m||j<n){if(i<m&&j<n&&A[i]===B[j]){out.push({type:'equal',value:A[i]});i++;j++;}else if(j<n&&(i===m||d[i][j+1]>=d[i+1][j])){out.push({type:'added',value:B[j++]});}else{out.push({type:'removed',value:A[i++]});}}return out}
export function diffSummary(diff){const rem=diff.filter(v=>v.type==='removed'),add=diff.filter(v=>v.type==='added');const a=rem.map(x=>x.value).join(' '),b=add.map(x=>x.value).join(' ');const nums=s=>(s.match(/\b\d+(?:[.,]\d+)*\b/g)||[]).sort();const numbersChanged=JSON.stringify(nums(a))!==JSON.stringify(nums(b));return {removed:rem.length,added:add.length,numbersChanged,identical:!rem.length&&!add.length}}
export function safeStem(name){return (name||'zrain').replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9_\-]+/g,'-').slice(0,65).replace(/^-+|-+$/g,'')||'zrain'}
export function bytes(n){return n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(1)} KB`:`${(n/1048576).toFixed(2)} MB`}
