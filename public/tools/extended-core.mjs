/*
 * Fail / File: tool-runtime/src/extended-core.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyediakan algoritma browser tambahan yang boleh diuji tanpa rangkaian atau DOM.
 * EN: Provides additional testable browser algorithms independent of network and DOM.
 */
/** Small, testable algorithms for the Zrain Tools v2 extension. No network or DOM. */
export function base64Encode(value, urlSafe = false) {
  const bytes = new TextEncoder().encode(String(value));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  let encoded = btoa(binary);
  return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '') : encoded;
}
// BM: base64Decode: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyediakan algoritma browser tambahan yang boleh diuji tanpa rangkaian atau DOM. Input: value.
// EN: base64Decode: Isolates one operation so it can be reviewed and tested. Module purpose: provides additional testable browser algorithms independent of network and DOM. Inputs: value.
export function base64Decode(value) {
  const clean = String(value).replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 === 1) throw new Error('Invalid Base64 characters or length.');
  const raw = atob(clean.padEnd(Math.ceil(clean.length / 4) * 4, '='));
  return new TextDecoder('utf-8', {fatal: true}).decode(Uint8Array.from(raw, char => char.charCodeAt(0)));
}
// BM: decodeJwt: Menukar atau mengesahkan input tanpa melangkau sempadan data yang selamat. Tujuan modul: menyediakan algoritma browser tambahan yang boleh diuji tanpa rangkaian atau DOM. Input: token.
// EN: decodeJwt: Transforms or validates input without bypassing safe data boundaries. Module purpose: provides additional testable browser algorithms independent of network and DOM. Inputs: token.
export function decodeJwt(token) {
  const pieces = String(token).trim().split('.');
  if (pieces.length !== 3 || pieces.some(part => !part)) throw new Error('JWT must have three non-empty segments.');
  if (token.length > 65536) throw new Error('JWT is unusually large.');
  const parse = value => {
    let data;
    try { data = JSON.parse(base64Decode(value)); } catch { throw new Error('JWT header or payload is not valid Base64URL JSON.'); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('JWT header and payload must be JSON objects.');
    return data;
  };
  return {header: parse(pieces[0]), payload: parse(pieces[1]), signaturePresent: pieces[2].length > 0};
}
// BM: textStatistics: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyediakan algoritma browser tambahan yang boleh diuji tanpa rangkaian atau DOM. Input: value.
// EN: textStatistics: Isolates one operation so it can be reviewed and tested. Module purpose: provides additional testable browser algorithms independent of network and DOM. Inputs: value.
export function textStatistics(value) {
  const text = String(value);
  const trimmed = text.trim();
  const words = trimmed ? (trimmed.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []).length : 0;
  const sentences = trimmed ? (trimmed.match(/[^.!?\n]+[.!?]+|[^.!?\n]+$/gm) || []).filter(x => x.trim()).length : 0;
  return {
    words, characters: [...text].length,
    charactersNoSpaces: [...text.replace(/\s/gu, '')].length,
    sentences, paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0,
    lines: text ? text.split(/\r\n|\r|\n/).length : 0,
    readingMinutes: words ? Math.max(1, Math.ceil(words / 200)) : 0
  };
}
// BM: hashText: Mengesahkan prasyarat atau syarat keselamatan sebelum meneruskan aliran. Tujuan modul: menyediakan algoritma browser tambahan yang boleh diuji tanpa rangkaian atau DOM. Input: text, algorithm = 'SHA-256'.
// EN: hashText: Checks a precondition or safety invariant before allowing the flow to continue. Module purpose: provides additional testable browser algorithms independent of network and DOM. Inputs: text, algorithm = 'SHA-256'.
export async function hashText(text, algorithm = 'SHA-256') {
  if (!['SHA-256', 'SHA-384', 'SHA-512'].includes(algorithm)) throw new Error('Unsupported hash algorithm.');
  if (!globalThis.crypto?.subtle) throw new Error('Hashing requires HTTPS or localhost.');
  const raw = await crypto.subtle.digest(algorithm, new TextEncoder().encode(String(text)));
  return [...new Uint8Array(raw)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
// BM: uuidv7: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyediakan algoritma browser tambahan yang boleh diuji tanpa rangkaian atau DOM. Input: now = Date.now(.
// EN: uuidv7: Isolates one operation so it can be reviewed and tested. Module purpose: provides additional testable browser algorithms independent of network and DOM. Inputs: now = Date.now(.
export function uuidv7(now = Date.now()) {
  if (!Number.isSafeInteger(now) || now < 0 || now >= 2 ** 48) throw new Error('Timestamp is outside the UUID v7 range.');
  const b = crypto.getRandomValues(new Uint8Array(16));
  const t = BigInt(now);
  for (let i = 0; i < 6; i++) b[i] = Number((t >> BigInt((5 - i) * 8)) & 255n);
  b[6] = (b[6] & 15) | 0x70;
  b[8] = (b[8] & 63) | 0x80;
  const h = [...b].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
}
// BM: createUuids: Mengubah state yang berkaitan hanya selepas input dan syarat akses diperiksa. Tujuan modul: menyediakan algoritma browser tambahan yang boleh diuji tanpa rangkaian atau DOM. Input: count, version = '4'.
// EN: createUuids: Mutates relevant state only after input and access conditions are verified. Module purpose: provides additional testable browser algorithms independent of network and DOM. Inputs: count, version = '4'.
export function createUuids(count, version = '4') {
  const n = Number(count);
  if (!Number.isInteger(n) || n < 1 || n > 500) throw new Error('Choose 1 to 500 UUIDs.');
  if (!['4', '7'].includes(String(version))) throw new Error('Choose UUID version 4 or 7.');
  return Array.from({length:n}, () => version === '7' ? uuidv7() : crypto.randomUUID());
}
// BM: cssShadow: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyediakan algoritma browser tambahan yang boleh diuji tanpa rangkaian atau DOM. Input: {x=0,y=8,blur=24,spread=-6,opacity=18,color='#131316',inset=false} = {}.
// EN: cssShadow: Isolates one operation so it can be reviewed and tested. Module purpose: provides additional testable browser algorithms independent of network and DOM. Inputs: {x=0,y=8,blur=24,spread=-6,opacity=18,color='#131316',inset=false} = {}.
export function cssShadow({x=0,y=8,blur=24,spread=-6,opacity=18,color='#131316',inset=false} = {}) {
  const nums = [x,y,blur,spread,opacity].map(Number);
  if (nums.some(n=>!Number.isFinite(n)) || nums[2] < 0 || nums[4] < 0 || nums[4] > 100) throw new Error('Invalid shadow values.');
  if (!/^#[a-f\d]{6}$/i.test(color)) throw new Error('Color must be a six-digit HEX value.');
  const rgb = [1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
  return (inset ? 'inset ' : '') + nums[0] + 'px ' + nums[1] + 'px ' + nums[2] + 'px ' + nums[3] + 'px rgba(' + rgb.join(', ') + ', ' + (nums[4]/100).toFixed(2) + ')';
}
// BM: pdfPageSelection: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyediakan algoritma browser tambahan yang boleh diuji tanpa rangkaian atau DOM. Input: value, count, defaultAll = true.
// EN: pdfPageSelection: Isolates one operation so it can be reviewed and tested. Module purpose: provides additional testable browser algorithms independent of network and DOM. Inputs: value, count, defaultAll = true.
export function pdfPageSelection(value, count, defaultAll = true) {
  if (!Number.isInteger(count) || count < 1) throw new Error('PDF has no pages.');
  const input = String(value || '').trim();
  if (!input) return defaultAll ? Array.from({length:count},(_,i)=>i) : [];
  const picked = [];
  const used = new Set();
  for (const token of input.split(',')) {
    const part = token.trim();
    const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) throw new Error('Use page numbers such as 1, 3-5, 8.');
    const a=Number(m[1]),b=m[2]?Number(m[2]):a;
    if (a<1 || b<1 || a>count || b>count || b<a) throw new Error('Page range is outside the document or reversed.');
    for(let i=a;i<=b;i++) if(!used.has(i-1)){picked.push(i-1);used.add(i-1);}
  }
  return picked;
}
// BM: targetDimensions: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menyediakan algoritma browser tambahan yang boleh diuji tanpa rangkaian atau DOM. Input: width, height, requestedWidth, requestedHeight, preserve=true.
// EN: targetDimensions: Isolates one operation so it can be reviewed and tested. Module purpose: provides additional testable browser algorithms independent of network and DOM. Inputs: width, height, requestedWidth, requestedHeight, preserve=true.
export function targetDimensions(width, height, requestedWidth, requestedHeight, preserve=true) {
  if (![width,height,requestedWidth,requestedHeight].every(Number.isFinite) || width<=0||height<=0) throw new Error('Invalid image dimensions.');
  let w = Math.round(requestedWidth), h = Math.round(requestedHeight);
  if(preserve && w>0 && h>0){const scale=Math.min(w/width,h/height);w=Math.round(width*scale);h=Math.round(height*scale);}
  else if (w>0 && h<=0) h=Math.round(height*w/width);
  else if (h>0 && w<=0) w=Math.round(width*h/height);
  if(w<1||h<1||w*h>32000000)throw new Error('Output must be between 1 pixel and 32 megapixels.');
  return {width:w,height:h};
}
