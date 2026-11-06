/*
 * Fail / File: tool-runtime/tests/core.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 tests)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji fungsi dan regresi sebenar Zrain Tools v2.4.0.
 * EN: Tests real functionality and regressions for Zrain Tools v2.4.0.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {rgbToHex,hexToRgb,rgbToHsl,rgbToCmyk,contrast,lineDiff,diffSummary,xmlEscape,bytes,safeStem} from '../src/core.mjs';
import {catalog,groups,findGroup} from '../src/catalog.mjs';
test('five product families contain all 46 tools exactly once',()=>{
 assert.equal(catalog.length,46);assert.equal(groups.length,5);
 assert.equal(new Set(catalog.map(c=>c[0])).size,46);
 const inGroups=groups.flatMap(g=>g.sections.flatMap(s=>s.tools));
 assert.equal(inGroups.length,46);
 assert.equal(new Set(inGroups).size,46);
 assert.deepEqual([...inGroups].sort(),catalog.map(c=>c[0]).sort());
 for(const [slug,title,description] of catalog){assert.match(slug,/^[a-z0-9-]+$/);assert.ok(title&&description&&findGroup(slug))}
});
test('RGB and HEX roundtrip',()=>{assert.equal(rgbToHex(189,83,56),'#BD5338');assert.deepEqual(hexToRgb('#bd5338'),[189,83,56]);assert.deepEqual(hexToRgb('#fff'),[255,255,255]);assert.throws(()=>hexToRgb('#banana'))});
test('HSL and CMYK color conversions',()=>{assert.deepEqual(rgbToHsl(255,0,0),[0,100,50]);assert.deepEqual(rgbToCmyk(0,0,0),[0,0,0,100]);assert.deepEqual(rgbToCmyk(255,255,255),[0,0,0,0])});
test('contrast math has known WCAG endpoints',()=>{assert.ok(Math.abs(contrast([0,0,0],[255,255,255])-21)<1e-9);assert.equal(contrast([100,100,100],[100,100,100]),1)});
test('diff and conclusion catch numeric edit',()=>{const d=lineDiff('Price 30\nToday','Price 40\nToday');const s=diffSummary(d);assert.equal(s.removed,1);assert.equal(s.added,1);assert.equal(s.numbersChanged,true);assert.equal(s.identical,false)});
test('identical document comparison',()=>{assert.deepEqual(diffSummary(lineDiff('a\nb','a\nb')),{removed:0,added:0,numbersChanged:false,identical:true})});
test('line diff is bounded',()=>assert.throws(()=>lineDiff(Array(700).fill('line').join('\n'),'x'),/650/));
test('content escaping and output filenames',()=>{assert.equal(xmlEscape('<a & b>'), '&lt;a &amp; b&gt;');assert.equal(safeStem('../../something name.png'),'something-name');assert.equal(bytes(1024),'1.0 KB')});
