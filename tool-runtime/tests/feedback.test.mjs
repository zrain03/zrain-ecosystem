/*
 * Fail / File: tool-runtime/tests/feedback.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan feedback, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests feedback contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const source = await readFile(new URL('../src/feedback-embed.js', import.meta.url), 'utf8');
const products = ['zrain-image-tools','zrain-pdf-tools','zrain-document-tools','zrain-developer-tools','zrain-productivity-tools'];
test('every product has a public, distinct GitHub feedback thread', () => {
  for (const [i, slug] of products.entries()) assert.match(source,new RegExp(`'${slug}'\\s*:\\s*${22 + i}`));
});
test('public feedback is real, not fabricated or a paid API', () => {
  assert.match(source,/api\.github\.com\/repos\/zrain03\/zrain-ecosystem\/issues/);
  assert.match(source,/Read on GitHub/);
  assert.match(source,/sign-in/);
  assert.doesNotMatch(source,/guess-the-flag|memory-rush|cryptoquest/);
  assert.doesNotMatch(source,/stripe|paypal|fakeComment|demoComment/i);
});
test('every independent website and tool carries its actual product feedback', async () => {
  for(const slug of products){
    const html=await readFile(new URL(`../dist/${slug}/index.html`, import.meta.url),'utf8');
    assert.match(html,new RegExp(`data-product="${slug}"`));
    assert.match(html,/feedback-embed\.js/);
    assert.match(html,/feedback\.css/);
  }
});
