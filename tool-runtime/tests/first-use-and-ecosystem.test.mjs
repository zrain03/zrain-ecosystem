/*
 * Fail / File: tool-runtime/tests/first-use-and-ecosystem.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 tests)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji fungsi dan regresi sebenar Zrain Tools v2.4.0.
 * EN: Tests real functionality and regressions for Zrain Tools v2.4.0.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {catalog,groups} from '../src/catalog.mjs';
import {workflows,modeExplanations} from '../src/workflow-guide.mjs';
const dist=resolve(import.meta.dirname,'../dist');
test('all 46 tools offer a complete first-use guide: purpose, three steps, outcome, clear limitations',()=>{
 assert.equal(Object.keys(workflows).length,46);
 for(const row of catalog){
  const w=workflows[row[0]];
  assert.ok(w,`No guide for ${row[0]}`);
  assert.ok(w.why.length>40,`No meaningful purpose: ${row[0]}`);
  assert.equal(w.steps.length,3,`Needs three steps: ${row[0]}`);
  assert.ok(w.steps.every(step=>step.length>35),`Steps too sparse: ${row[0]}`);
  assert.ok(w.output.length>20&&w.note.length>25,`Needs outcome and caution: ${row[0]}`);
 }
});
test('more complex form modes explain the different outcomes, not just dropdown titles',()=>{
 for(const [slug,expected] of [['file-converter',7],['image-enhancer',6],['image-converter',3],['text-tools',8]]){
  assert.equal(Object.keys(modeExplanations[slug]).length,expected,slug);
  for(const [choice,explain] of Object.entries(modeExplanations[slug]))assert.ok(explain.length>=35,slug+' '+choice);
 }
});
test('five draft Ecosystem entries are individually catalogued in correct categories, never published prematurely',async()=>{
 const entries=JSON.parse(await readFile(join(dist,'ECOSYSTEM-ENTRIES.json'),'utf8'));
 assert.equal(entries.length,5);
 assert.equal(new Set(entries.map(e=>e.slug)).size,5);
 for(const group of groups){
  const item=entries.find(e=>e.slug===group.slug);
  assert.ok(item,group.slug);
  assert.equal(item.status,'Draft');
  assert.equal(item.websiteUrl,null);
  assert.equal(item.category,group.slug==='zrain-developer-tools'?'Developer Tools':'Online Services');
  assert.ok(item.description.length>100);
  assert.equal(item.toolCount,group.sections.flatMap(s=>s.tools).length);
 }
});
test('every standalone product folder includes complete guide module, Zrain visual identity, and its own pages',async()=>{
 for(const group of groups){
  const root=join(dist,group.slug);
  for(const f of ['workflow-guide.mjs','style.css','zrain-ui.js','zrain-logo.webp','index.html'])assert.ok((await stat(join(root,f))).size>50,`${group.slug}/${f}`);
  for(const slug of group.sections.flatMap(s=>s.tools)){
   const html=await readFile(join(root,slug,'index.html'),'utf8');
   assert.ok(html.includes('data-group="'+group.slug+'"'));
   assert.ok(html.includes('https://zrain.web.app'));
  }
 }
});
