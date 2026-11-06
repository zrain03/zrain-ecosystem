/**
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Ujian regresi UX ringkas untuk semua 46 tools.
 * EN: Simple-UX regression coverage for all 46 tools.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {groups,catalog} from '../src/catalog.mjs';
import {fieldPlaceholder} from '../src/form-copy.mjs';
import {artDimensions} from '../src/art-core.mjs';
const root=resolve(import.meta.dirname,'..');
const read=(path)=>readFile(join(root,path),'utf8');

test('every live tool page opens on its input, without a duplicate oversized hero',async()=>{
  for(const group of groups){
    for(const slug of group.sections.flatMap(s=>s.tools)){
      const html=await read(`dist/${group.slug}/${slug}/index.html`);
      assert.match(html, /class="app-shell"/);
      assert.match(html, /class="tool-description"/);
      assert.doesNotMatch(html, /class="hero"/);
      assert.match(html,/zrain-community\.web\.app\/embed\.js/);
    }
  }
  assert.equal(catalog.length,46);
});

test('no generic visual help or automatic question-mark helper is injected',async()=>{
  const app=await read('src/app.js');
  assert.doesNotMatch(app,/inline-help-button|How to use · optional help|Start here · Your simple guide|field-help/);
  const help=await read('src/ux-help.mjs');
  assert.doesNotMatch(help,/Set this option before running the tool/);
});

test('ambiguous PDF page inputs explain accepted syntax with a placeholder',()=>{
  for(const slug of ['split-pdf','remove-pdf-pages','rotate-pdf','crop-pdf']){
    assert.match(fieldPlaceholder(slug,'pages','Pages'),/1,3,5|2,4/);
  }
  assert.match(fieldPlaceholder('emoji-art','emojis','Emojis to use'),/🌸/);
  assert.match(fieldPlaceholder('utm-builder','url','Destination URL'),/https:/);
});

test('emoji grid density changes visibly without altering source aspect rules',()=>{
  const low=artDimensions(1280,720,'emoji-art',10);
  const high=artDimensions(1280,720,'emoji-art',100);
  assert.ok(high.cols>=low.cols*2);
  assert.ok(high.rows>=low.rows*2);
  assert.ok(Math.abs(low.rows/low.cols-720/1280)<.04);
});

test('emoji export uses exact source width and height instead of arbitrary cell grid',async()=>{
  const art=await read('src/art-core.mjs');
  assert.match(art,/out\.width=w;out\.height=h;/);
  assert.match(art,/sx\.imageSmoothingQuality='high'/);
  assert.match(art,/w\*h>16000000/);
});
