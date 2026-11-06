/**
 * Fail / File: scripts/check-persona-release.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05 (source release evidence)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Audit setiap fail source dan header BM/EN; asingkan fail upstream, JSON, binary dan hasil build.
 * EN: Audit each source file and BM/EN header; distinguish upstream, JSON, binary and build outputs.
 */
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {relative,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const ignored=new Set(['node_modules','dist','.git','target','.firebase','__pycache__']);
const policies=new Set(['inline','generated','external-registry','upstream-or-shared','third-party-preserved']);
const ownedFields=['Pembangun / Developer: Zrain','Dicipta / Created:','Dikemas kini / Last updated:'];

// BM: Periksa fail yang benar-benar ada, bukan senarai statik yang mungkin terlepas perubahan.
// EN: Inspect files actually present rather than relying on a stale static list.
async function collect(dir){
  const files=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    // BM: Git worktree menyimpan .git sebagai fail pointer; ia bukan source.
    // EN: Git worktree stores .git as a pointer file, not source.
    if(entry.name==='.git')continue;
    if(entry.isDirectory()){
      if(!ignored.has(entry.name))files.push(...await collect(join(dir,entry.name)));
    }else if(entry.isFile()&&!entry.name.endsWith('.log'))
      files.push(relative(root,join(dir,entry.name)).replaceAll('\\','/'));
  }
  return files;
}

const data=JSON.parse(await readFile(join(root,'FILE_PROVENANCE.json'),'utf8'));
assert.equal(data.developer,'Zrain');
assert.equal(data.schemaVersion,1);
assert.ok(Array.isArray(data.files));
const actual=(await collect(root)).sort();
const records=data.files.map(item=>item.path).sort();
assert.deepEqual(records,actual,'Each source file must have exactly one provenance entry');
assert.equal(new Set(records).size,records.length,'Provenance paths must be unique');

let inline=0,exceptions=0,pending=0;
for(const entry of data.files){
  assert.ok(policies.has(entry.policy),entry.path+' unknown provenance policy');
  assert.ok(entry.developer&&entry.created&&entry.createdEvidence&&entry.lastUpdated,entry.path+' missing metadata');
  if(entry.policy==='generated'){
    assert.ok(entry.path.startsWith('public/tools/'),entry.path+' generated output must stay under public/tools');
    exceptions++;
    continue;
  }
  if(entry.policy!=='inline'){
    assert.ok(entry.exception || entry.policy==='external-registry',entry.path+' requires exception rationale');
    exceptions++;
    continue;
  }
  if(!entry.inlineHeaderVerified){pending++;continue;}
  // BM: Header perlu muncul sebelum kod utama dan mengutamakan BM tepat di atas EN.
  // EN: The header must precede executable code, placing BM directly above EN.
  const text=(await readFile(join(root,entry.path),'utf8')).slice(0,2400);
  for(const field of ownedFields)assert.ok(text.includes(field),entry.path+' missing '+field);
  const bm=text.search(/(?:^|\n)\s*(?:[/*#-]+\s*)?BM:/m);
  const en=text.search(/(?:^|\n)\s*(?:[/*#-]+\s*)?EN:/m);
  assert.ok(bm>=0&&en>bm,entry.path+' must explain BM above EN');
  const matchingDate=entry.created.match(/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(matchingDate || entry.created==='Unverified',entry.path+' created date must be verified or Unverified');
  const updated=entry.lastUpdated.match(/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(updated || entry.lastUpdated==='Not independently verified',entry.path+' updated date invalid');
  inline++;
}
if(process.argv.includes('--strict'))assert.equal(pending,0,'Incomplete inline headers');
console.log(`Zrain Persona provenance: ${actual.length} files, ${inline} verified inline headers, ${exceptions} registered exceptions, ${pending} pending.`);
// BM: Lulusnya header bukan pengganti ujian browser, Java, keselamatan atau semakan semantik manusia.
// EN: Header validation does not replace browser, Java, security or human semantic review.
