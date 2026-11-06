/**
 * Fail / File: tests/default-collapsed-malaysia.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-06
 * Dikemas kini / Last updated: 2026-11-06
 * BM: Lindungi keadaan accordion asal dan identiti asal Malaysia.
 * EN: Protect the default collapsed state and Malaysia origin copy.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync(new URL('../public/ecosystem-unified.mjs',import.meta.url),'utf8');
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
test('every category starts collapsed on desktop and mobile',()=>{
 assert.match(js,/categoryStates\.get\(category\.id\) \|\| \{open:false,all:mobile\}/);
 assert.match(js,/toggle\.addEventListener\('click',\(\)=>setExpanded\(!state\.open\)\)/);
 assert.match(js,/body\.hidden=!open/);
 assert.match(js,/categoryContainers\.get\(category\.id\)\?\.setExpanded\(true\)/);
});
test('about section states Malaysia origin without changing footer tagline',()=>{
 assert.match(html,/Created in Malaysia\. Made for people everywhere\./);
 assert.match(html,/Made for people\. Built with purpose\./);
});
