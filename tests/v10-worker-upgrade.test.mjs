/*
 * Fail / File: tests/v10-worker-upgrade.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan v10 worker upgrade, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests v10 worker upgrade contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const upgrade = fileURLToPath(new URL('../scripts/upgrade-worker-categories.mjs',import.meta.url));
test('source-only Worker migration preserves legacy codes and safely backs up before change',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'zrain-admin-v10-'));
 try{
  const path=join(dir,'catalog-worker','src','products.js');
  await mkdir(join(dir,'catalog-worker','src'),{recursive:true});
  const source='const CATEGORIES = new Set(["GAMES","DEVELOPER_TOOLS","ONLINE_SERVICES","WEB_UTILITIES"]);\nexport default true;\n';
  await writeFile(path,source);
  execFileSync(process.execPath,[upgrade,path]);
  const result=await readFile(path,'utf8');
  assert.match(result,/"PLAY","DESIGN","DOCUMENTS","BUILD","EVERYDAY"/);
  assert.match(result,/"GAMES","DEVELOPER_TOOLS","ONLINE_SERVICES","WEB_UTILITIES"/);
  assert.equal(await readFile(path+'.before-zrain-unified-v10','utf8'),source);
  execFileSync(process.execPath,[upgrade,path]);
  assert.equal(await readFile(path,'utf8'),result);
 }finally{await rm(dir,{recursive:true,force:true});}
});
