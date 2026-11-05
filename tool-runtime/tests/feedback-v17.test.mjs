/*
 * Fail / File: tool-runtime/tests/feedback-v17.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan feedback v17, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests feedback v17 contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const js=await readFile(new URL('src/feedback-embed.js',root),'utf8');
const css=await readFile(new URL('src/feedback.css',root),'utf8');
test('feedback module never stores admin tokens or inserts untrusted HTML',()=>{
 assert.doesNotMatch(js,/innerHTML|insertAdjacentHTML|localStorage|auth_token|GITHUB_TOKEN|personal_access_token/i);
 assert.match(js,/textContent/);
 assert.match(js,/View comment on GitHub/);
 assert.match(js,/Refresh comments/);
});
test('module is compatible with strict CSP using external stylesheet',()=>{
 assert.doesNotMatch(js,/createElement\(['"]style['"]\)/);
 assert.match(css,/\.zr-feedback/);
});
test('no feedback in games; every web product has its own thread',()=>{
 for(const slug of ['zrain-links','zrain-monitor','zrain-auth-starter','zrain-ui','zrain-ecosystem','zrain-console','zrain-image-tools','zrain-pdf-tools','zrain-document-tools','zrain-developer-tools','zrain-productivity-tools']) assert.match(js,new RegExp("'"+slug+"':"));
 for(const slug of ['guess-the-flag','memory-rush','cryptoquest']) assert.doesNotMatch(js,new RegExp("'"+slug+"':"));
});

test('feedback heading and owner-management links are actually appended to the document',()=>{
 assert.match(js,/head\.append\(header\)/);
 assert.match(js,/View comment on GitHub/);
 assert.match(js,/Refresh comments/);
});
