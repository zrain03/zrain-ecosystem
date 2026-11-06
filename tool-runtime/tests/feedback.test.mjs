/*
 * Fail / File: tool-runtime/tests/feedback.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 tests)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji fungsi dan regresi sebenar Zrain Tools v2.4.0.
 * EN: Tests real functionality and regressions for Zrain Tools v2.4.0.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const products=['zrain-image-tools','zrain-pdf-tools','zrain-document-tools','zrain-developer-tools','zrain-productivity-tools'];
const root=new URL('../',import.meta.url);
test('Zrain Community embed used for five family homes and individual tools',async()=>{
  for(const slug of products){
    const html=await readFile(new URL(`../dist/${slug}/index.html`,import.meta.url),'utf8');
    assert.match(html,new RegExp(`data-product="${slug}"`));
    assert.match(html,/https:\/\/zrain-community\.web\.app\/embed\.js/);
    assert.doesNotMatch(html,/feedback-embed\.js|api\.github\.com\/repos\/zrain03\/zrain-ecosystem\/issues/);
  }
});
test('all tool pages have independently addressable Community spaces',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../dist/products.json',import.meta.url),'utf8'));
  for(const family of manifest){for(const tool of family.tools){
    const html=await readFile(new URL(`../dist/${family.slug}/${tool}/index.html`,import.meta.url),'utf8');
    assert.match(html,new RegExp(`data-product="${tool}"`));
  }}
});
