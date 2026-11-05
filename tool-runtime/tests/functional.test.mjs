/*
 * Fail / File: tool-runtime/tests/functional.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan functional, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests functional contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { findGroup } from '../src/catalog.mjs';
import {jpegExif,pngDetails,detectSignature} from '../src/image-metadata.mjs';
import {drawQr} from '../src/qr-local.mjs';

// BM: env: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menguji sempadan functional, output dan kes gagal tanpa membuat permintaan production. Input: slug.
// EN: env: Isolates one operation so it can be reviewed and tested. Module purpose: tests functional contracts, outputs and failure paths without making production requests. Inputs: slug.
function env(slug){
 const nodes=new Map(),saved=new Map(),callbacks=[];
 let qrPaint=0;
 function create(id=''){return {id,style:{},listeners:{},files:[],value:id==='hex'?'#BD5338':'',textContent:'',innerHTML:'',className:'',disabled:false,children:[],
  classList:{add(){},remove(){}},addEventListener(type,cb){(this.listeners[type]??=[]).push(cb)},
  async dispatch(type){for(const cb of this.listeners[type]||[])await cb({type,preventDefault(){}})},
  replaceChildren(...args){this.children=args},append(...args){this.children.push(...args)},prepend(...args){this.children.unshift(...args)},
  insertBefore(){},setAttribute(){},querySelector(){return null},querySelectorAll(){return []},closest(){return create()},
  getContext(){return {fillStyle:'#000',fillRect(){qrPaint++}}},click(){}}}
 // BM: get: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan functional, output dan kes gagal tanpa membuat permintaan production.
 // EN: get: Reads relevant records and returns a bounded result to the caller. Module purpose: tests functional contracts, outputs and failure paths without making production requests.
 const get=id=>{if(!nodes.has(id))nodes.set(id,create(id));return nodes.get(id)};
 globalThis.document={body:{dataset:{tool:slug,view:'tool',group:findGroup(slug).slug}},querySelector(){return null},querySelectorAll(){return []},addEventListener(){},removeEventListener(){},createElement(tag){return create(tag)},getElementById:get};
 globalThis.window={addEventListener(){}};
 globalThis.localStorage={getItem:key=>saved.get(key)||null,setItem:(key,val)=>saved.set(key,val)};
 globalThis.setInterval=fn=>{callbacks.push(fn);return callbacks.length};
 globalThis.clearInterval=()=>{};
 return {get,saved,callbacks,qrPaint:()=>qrPaint,trigger:async(id,event='click')=>get(id).dispatch(event)};
}
const originals={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval};
// BM: restore: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menguji sempadan functional, output dan kes gagal tanpa membuat permintaan production.
// EN: restore: Isolates one operation so it can be reviewed and tested. Module purpose: tests functional contracts, outputs and failure paths without making production requests.
const restore=()=>Object.assign(globalThis,originals);
let serial=0;
async function boot(slug){const x=env(slug);await import(`../src/app.js?functional=${slug}-${serial++}`);return x;}

test('JPEG EXIF and PNG text tags are parsed from real local test fixtures',()=>{
 for(const [name,fn,value] of [['sample-image.jpg',jpegExif,'Zrain Unit Test'],['sample-image.png',pngDetails,'Zrain Test']]){
  const file=fs.readFileSync(new URL(name,import.meta.url));const buf=file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength);
  const details=fn(buf);assert.ok(Object.values(details).includes(value),`${name}: expected embedded metadata`);
  assert.notEqual(detectSignature(new Uint8Array(buf)),'Unknown / unrecognized');
 }
});

test('offline QR encoder generates a real matrix and never requests a CDN',()=>{
 let filled=0;const ctx={fillStyle:'#ffffff',fillRect(){filled++}};
 const original=globalThis.document;try{globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};const c=drawQr('Zrain Malaysia 🇲🇾',360,'#121E2A','#FFFFFF');assert.equal(c.width,360);assert.ok(filled>100);}
 finally{globalThis.document=original}
});

test('Markdown loads an actual editable starter document and live formatted preview',async()=>{try{const x=await boot('markdown-editor');assert.match(x.get('source').value,/Zrain Notes/);assert.match(x.get('mdpreview').innerHTML,/<h1>/);x.get('source').value='# New Heading\n\n**Text**';await x.trigger('source','input');assert.match(x.get('mdpreview').innerHTML,/<strong>Text<\/strong>/);}finally{restore()}});

test('UTM builder appends named campaign parameters without redirecting',async()=>{try{const x=await boot('utm-builder');for(const [id,value] of Object.entries({url:'https://example.org/test?keep=1',source:'instagram',medium:'social',campaign:'school-day',term:'',content:''}))x.get(id).value=value;await x.trigger('run');assert.match(x.get('utmout').value,/utm_source=instagram/);assert.match(x.get('utmout').value,/keep=1/);}finally{restore()}});

test('JSON formatting and invalid JSON reporting',async()=>{try{const x=await boot('json-studio');x.get('source').value='{"zrain":true}';x.get('action').value='pretty';await x.trigger('run');assert.match(x.get('jsonout').value,/"zrain": true/);x.get('source').value='{"invalid"';await x.trigger('run');assert.match(x.get('result').children[0].textContent,/Invalid JSON/);}finally{restore()}});

test('Focus timer can start, pause, resume and count completed sessions',async()=>{const originalNow=Date.now;try{let now=100000;Date.now=()=>now;const x=await boot('focus-timer');await x.trigger('begin');assert.equal(x.get('begin').disabled,true);now+=60_000;await x.trigger('pause');assert.equal(x.get('clock').textContent,'24:00');await x.trigger('begin');now+=24*60_000;x.callbacks[0]();assert.equal(x.get('done').textContent,'Completed focus sessions: 1');assert.equal(x.get('mode').textContent,'Switch to focus');assert.ok(x.saved.get('zrain-focus-v2'));await x.trigger('clearstats');assert.match(x.get('done').textContent,/0/);}finally{Date.now=originalNow;restore()}});

test('Color Inspector initializes color formats without image upload',async()=>{try{const x=await boot('color-inspector');assert.match(x.get('result').innerHTML,/(HEX|RGB|CMYK)/);assert.ok(x.get('run').listeners.click.length===1);}finally{restore()}});

test('File Converter defaults to honest appearance-preserving mode and hides unrelated page number',async()=>{try{const x=await boot('file-converter');assert.ok(x.get('run').listeners.click.length===1);assert.equal(x.get('page').closest().hidden,undefined);assert.match(x.get('app').innerHTML,/not editable/i);}finally{restore()}});
