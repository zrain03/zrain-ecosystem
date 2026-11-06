/*
 * Fail / File: tool-runtime/tests/ux-help.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 tests)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji fungsi dan regresi sebenar Zrain Tools v2.4.0.
 * EN: Tests real functionality and regressions for Zrain Tools v2.4.0.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,groups} from '../src/catalog.mjs';
import {toolIntro,controlHelp,differenceLegend} from '../src/ux-help.mjs';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
test('all 46 tools include a visible plain-language purpose and usage guide',()=>{
 assert.equal(Object.keys(toolIntro).length,46);
 for(const [slug] of catalog){assert.ok(toolIntro[slug]?.length>75,`Missing ${slug} guide`)}
});
test('difference-map explanation distinguishes color changes from proof of wrongdoing',()=>{
 assert.match(differenceLegend,/red/i);
 assert.match(differenceLegend,/grey/i);
 assert.match(differenceLegend,/compression/i);
 assert.match(differenceLegend,/threshold/i);
 assert.match(controlHelp('image-compare','reveal'),/0%/);
});
test('background remover slider descriptions explain tolerance and edge softness',()=>{
 assert.match(controlHelp('background-remover','tolerance'),/similar|wider/i);
 assert.match(controlHelp('background-remover','feather'),/Edge softness/i);
 assert.match(controlHelp('image-enhancer','scale'),/not a guarantee/i);
});
test('every upload input has contextual instructions and common accessible preview behavior',async()=>{
 const app=await readFile(resolve(root,'src/app.js'),'utf8');
 assert.match(app,/function setupUploadFields\(/);
 assert.match(app,/data-drop-id/);
 assert.match(app,/dragover/);
 assert.match(app,/clipboardData/);
 assert.match(app,/e\.preventDefault\(\);assign\(dest,files\)/);
 assert.match(app,/closest\?\.\('textarea,select,\[contenteditable\]/);
 assert.match(app,/upload-preview/);
 assert.match(app,/PDF preview/);
 assert.match(app,/Text-only excerpt/);
 for(const group of groups){
  const asset=await readFile(resolve(root,'dist',group.slug,'ux-help.mjs'),'utf8');
  assert.ok(asset.includes('differenceLegend'),group.slug);
 }
});
