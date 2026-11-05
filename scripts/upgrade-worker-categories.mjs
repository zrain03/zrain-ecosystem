/*
 * Fail / File: scripts/upgrade-worker-categories.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menyediakan migrasi kategori admin yang serasi dengan kod lama sebelum Worker diubah.
 * EN: Prepares backward-compatible administrator-category migration before Worker changes.
 */
/**
 * Explicit, local-only safe backend migration. Run against a source file in
 * zrain-ecosystem/catalog-worker/src/products.js before Worker deployment.
 * NEVER deploys, edits Git remotes, or changes Cloudflare credentials.
 */
import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const file=process.argv[2];
if(!file)throw new Error('Usage: node scripts/upgrade-worker-categories.mjs <path-to-catalog-worker/src/products.js>');
const target=resolve(file);
if(!target.replaceAll('\\','/').endsWith('/catalog-worker/src/products.js'))
  throw new Error('This tool only updates the exact catalog-worker/src/products.js file.');
const old='const CATEGORIES = new Set(["GAMES","DEVELOPER_TOOLS","ONLINE_SERVICES","WEB_UTILITIES"]);';
const next='const CATEGORIES = new Set(["GAMES","DEVELOPER_TOOLS","ONLINE_SERVICES","WEB_UTILITIES","PLAY","DESIGN","DOCUMENTS","BUILD","EVERYDAY"]);';
const contents=await readFile(target,'utf8');
if(contents.includes(next)){console.log('Worker category schema already supports five categories.');process.exit(0);}
if(!contents.includes(old))throw new Error('Unexpected Worker schema, source unchanged. Review backend before migration.');
const backup=target+'.before-zrain-unified-v10';
await copyFile(target,backup,1); // COPYFILE_EXCL, never overwrite an existing backup.
await writeFile(target,contents.replace(old,next),'utf8');
console.log('Backend category validation updated locally. Backup: '+backup);
console.log('No deployment performed. Run the full Worker test suite before a reviewed release.');
