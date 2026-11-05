/*
 * Fail / File: scripts/add-categories-link.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyambung pautan Categories secara idempotent tanpa menggandakan navigasi.
 * EN: Adds Categories navigation idempotently without duplicating navigation.
 */
// Safe, idempotent navigation integration for Zrain Ecosystem.
// Run AFTER any homepage builder that rewrites public/index.html.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(process.cwd());
const path=resolve(root,'public/index.html');
const original=await readFile(path,'utf8');
if(/href=["']\/categories\/?["']/.test(original)){
  console.log('Categories navigation link already present.');
  process.exit(0);
}
// Only modify the first navigation within the header. Fail closed for unknown markup.
const match=original.match(/<header\b[^>]*>[\s\S]*?<nav\b[^>]*>[\s\S]*?<\/nav>/i);
if(!match)throw new Error('Header navigation not found; index.html left unchanged.');
const revisedNav=match[0].replace(/<\/nav>/i,'  <a href="/categories/">Categories</a>\n  </nav>');
if(revisedNav===match[0])throw new Error('Unable to insert navigation link.');
const revised=original.replace(match[0],revisedNav);
if(revised===original)throw new Error('No change made.');
await writeFile(path,revised,'utf8');
console.log('Added Categories link to public/index.html.');
