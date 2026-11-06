/*
 * Fail / File: tool-runtime/tests/initialization.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 tests)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji fungsi dan regresi sebenar Zrain Tools v2.4.0.
 * EN: Tests real functionality and regressions for Zrain Tools v2.4.0.
 */
import test from 'node:test';import assert from 'node:assert/strict';
import {catalog,groups,findGroup} from '../src/catalog.mjs';
const el=()=>({innerHTML:'',value:'',textContent:'',style:{},classList:{add(){},remove(){}},append(){},replaceChildren(){},addEventListener(){},setAttribute(){},prepend(){},querySelectorAll(){return []},closest(){return el()},insertBefore(){},lastChild:{},querySelector(){return null}});
test('each family landing page initializes without a top-level exception',async()=>{
 const previous=globalThis.document;
 try{for(const group of groups){const nodes=new Map();
 globalThis.document={body:{dataset:{tool:'group',view:'group',group:group.slug}},querySelector(){return null},querySelectorAll(){return []},getElementById(id){if(!nodes.has(id))nodes.set(id,el());return nodes.get(id)},createElement(){return el()}};
 await import(`../src/app.js?group=${group.slug}`);
 assert.ok(nodes.has('group-sections'),`Group missing: ${group.slug}`);
 }}finally{globalThis.document=previous}
});
test('each of the 46 tool UIs initializes with group context',async()=>{
 const prior={document:globalThis.document,setInterval:globalThis.setInterval,window:globalThis.window};
 try{for(const [slug] of catalog){const nodes=new Map();
 globalThis.document={body:{dataset:{tool:slug,view:'tool',group:findGroup(slug).slug}},addEventListener(){},querySelector(){return null},querySelectorAll(){return []},getElementById(id){if(!nodes.has(id))nodes.set(id,Object.assign(el(),{value:id==='hex'?'#BD5338':''}));return nodes.get(id)},createElement(){return el()}};
 globalThis.setInterval=()=>0;globalThis.window={addEventListener(){}};
 await import(`../src/app.js?smoke=${slug}`);
 assert.ok(nodes.has('app'),`App missing: ${slug}`);
 }}finally{globalThis.document=prior.document;globalThis.setInterval=prior.setInterval;globalThis.window=prior.window}
});
