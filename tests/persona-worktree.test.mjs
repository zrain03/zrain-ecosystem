/**
 * Fail / File: tests/persona-worktree.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Pastikan audit Persona melindungi fail source dalam checkout biasa dan Git worktree.
 * EN: Ensure Persona audit protects source files in regular checkouts and Git worktrees.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,copyFile,writeFile,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const script=fileURLToPath(new URL('../scripts/check-persona-release.mjs',import.meta.url));

async function fixture(kind){
 const root=await mkdtemp(join(tmpdir(),'zrain-persona-worktree-'));
 await mkdir(join(root,'scripts'));
 await copyFile(script,join(root,'scripts','check-persona-release.mjs'));
 const records=['FILE_PROVENANCE.json','README.md','scripts/check-persona-release.mjs'];
 const files=records.map(path=>({
  path,developer:'Zrain',created:'2026-11-05',createdEvidence:'Test fixture',lastUpdated:'2026-11-05',
  policy:'external-registry',exception:'The fixture checks path inventory only'
 }));
 await writeFile(join(root,'FILE_PROVENANCE.json'),JSON.stringify({schemaVersion:1,developer:'Zrain',files}));
 await writeFile(join(root,'README.md'),'Fixture file');
 await mkdir(join(root,'node_modules'));
 await writeFile(join(root,'node_modules','ignored.js'),'Ignore dependency files');
 if(kind==='file')await writeFile(join(root,'.git'),'gitdir: ../repo/.git/worktrees/example\n');
 else {
  await mkdir(join(root,'.git'));
  await writeFile(join(root,'.git','config'),'[core]\n');
 }
 return root;
}
const run=root=>spawnSync(process.execPath,['scripts/check-persona-release.mjs','--strict'],{cwd:root,encoding:'utf8'});

for(const gitType of ['file','directory']){
 test('Persona audit ignores .git '+gitType+' while validating actual files',async()=>{
  const root=await fixture(gitType);
  try{
   const ok=run(root);
   assert.equal(ok.status,0,ok.stdout+ok.stderr);
   await writeFile(join(root,'unexpected.js'),'Unregistered file');
   const bad=run(root);
   assert.notEqual(bad.status,0,'Unregistered source file must fail provenance');
   assert.match(bad.stderr,/Each source file must have exactly one provenance entry/);
  }finally{await rm(root,{recursive:true,force:true});}
 });
}
