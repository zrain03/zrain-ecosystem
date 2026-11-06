/*
 * Fail / File: tests/v91-frame-sync.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan v91 frame sync, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests v91 frame sync contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolveToolNavigation,toolNavigatedInsideFrame} from '../public/ecosystem-frame-sync.mjs';
import {getInventoryItem} from '../public/ecosystem-links.mjs';
const origin='http://127.0.0.1:8769';

test('switching from Teleprompter to Split PDF resolves actual iframe page',()=>{
  const item=resolveToolNavigation(origin+'/tools/split-pdf/index.html',origin,getInventoryItem);
  assert.equal(item?.id,'split-pdf');
  assert.equal(item?.name,'Split PDF');
  assert.equal(resolveToolNavigation('/tools/teleprompter/',origin,getInventoryItem)?.name,'Teleprompter');
});
test('the embedded tool must match an official allowed same-origin route',()=>{
  for (const path of [
    '/tools/fake-tool/', '/tools/memory-rush/', '/tools/split-pdf/other.html',
    'https://example.com/tools/split-pdf/',
    'javascript:alert(1)', '/tools/../admin/'
  ]) assert.equal(resolveToolNavigation(path,origin,getInventoryItem),null,path);
  assert.equal(resolveToolNavigation('/tools/merge-pdf/?foo=bar',origin,getInventoryItem)?.id,'merge-pdf');
});
test('cross-origin iframe access or missing contentWindow never crashes Console',()=>{
  const blocked={contentWindow:{get location(){throw new DOMException('Denied','SecurityError')}}};
  assert.equal(toolNavigatedInsideFrame(blocked,origin,getInventoryItem),null);
  assert.equal(toolNavigatedInsideFrame({contentWindow:{location:{href:origin+'/tools/jwt-decoder/'}}},origin,getInventoryItem)?.id,'jwt-decoder');
  assert.equal(toolNavigatedInsideFrame({},origin,getInventoryItem),null);
});
test('both Console experiences update active metadata after the iframe loads, without reloading it',async()=>{
  const [inline,consoleJs]=await Promise.all([
    readFile(new URL('../public/ecosystem-quick-console.mjs',import.meta.url),'utf8'),
    readFile(new URL('../public/ecosystem-console.mjs',import.meta.url),'utf8')
  ]);
  assert.match(inline,/frame\.addEventListener\('load', syncToolNavigation\)/);
  assert.match(inline,/title\.textContent = current\.name/);
  assert.match(inline,/fullConsole\.href = '\/zrain-console\.html\?app='/);
  assert.match(consoleJs,/frame\.addEventListener\('load'/);
  assert.match(consoleJs,/loadFrame:false, keepView:true/);
  assert.match(consoleJs,/if \(loadFrame\) loadCurrent\(\)/);
});
