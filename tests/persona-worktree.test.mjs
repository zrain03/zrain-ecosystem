/**
 * Fail / File: tests/persona-worktree.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Pastikan audit mengabaikan .git pointer Git worktree tetapi mengesan fail source asing.
 * EN: Ensure audit ignores worktree .git pointers yet rejects unknown source files.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,copyFile,writeFile,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const source=fileURLToPath(new URL('../scripts/check-persona-release.mjs',import.meta.url));
for(const kind of ['file','directory']){
 test('Persona ignores .git '+kind+' without ignoring unexpected source',async()=>{
  const root=await mkdtemp(join(tmpdir(),'zec-worktree-'));
  try{
   await mkdir(join(root,'scripts'));
   await copyFile(source,join(root,'scripts','check-persona-release.mjs'));
   await writeFile(join(root,'README.md'),'fixture');
   const files=['README.md','FILE_PROVENANCE.json','scripts/check-persona-release.mjs'].map(path=>({path,developer:'Zrain',created:'2026-11-05',createdEvidence:'Test fixture',lastUpdated:'2026-11-05',policy:'external-registry',exception:'Fixture'}));
   await writeFile(join(root,'FILE_PROVENANCE.json'),JSON.stringify({schemaVersion:1,developer:'Zrain',files}));
   if(kind==='file')await writeFile(join(root,'.git'),'gitdir: fake\n');
   else await mkdir(join(root,'.git'));
   const run=()=>spawnSync(process.execPath,['scripts/check-persona-release.mjs','--strict'],{cwd:root,encoding:'utf8'});
   const good=run();assert.equal(good.status,0,good.stderr);
   await writeFile(join(root,'unexpected.js'),'Not registered');
   const bad=run();assert.notEqual(bad.status,0);assert.match(bad.stderr,/provenance entry/);
  }finally{await rm(root,{recursive:true,force:true});}
 });
}
