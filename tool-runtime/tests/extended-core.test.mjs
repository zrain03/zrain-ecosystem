/*
 * Fail / File: tool-runtime/tests/extended-core.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 tests)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji fungsi dan regresi sebenar Zrain Tools v2.4.0.
 * EN: Tests real functionality and regressions for Zrain Tools v2.4.0.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {base64Encode,base64Decode,decodeJwt,textStatistics,hashText,createUuids,uuidv7,cssShadow,pdfPageSelection,targetDimensions} from '../src/extended-core.mjs';
import {EXTRA_TOOL_SLUGS} from '../src/extended-tools.mjs';
import {catalog, groups} from '../src/catalog.mjs';

test('all nineteen new pages are backed by implementation registrations',()=>{
  assert.equal(EXTRA_TOOL_SLUGS.length,19);
  assert.equal(new Set(EXTRA_TOOL_SLUGS).size,19);
  assert.deepEqual(EXTRA_TOOL_SLUGS.filter(slug=>!catalog.some(x=>x[0]===slug)),[]);
  assert.deepEqual(EXTRA_TOOL_SLUGS.filter(slug=>!groups.some(g=>g.sections.some(s=>s.tools.includes(slug)))),[]);
});
test('Base64 correctly preserves Malay, accents and emoji',()=>{
  const message='Selamat pagi — café 🌍';
  assert.equal(base64Decode(base64Encode(message)),message);
  assert.equal(base64Decode(base64Encode(message,true)),message);
  assert.throws(()=>base64Decode('?abc'),/Invalid Base64/);
  assert.throws(()=>base64Decode('////'),/utf-8|encoded|valid|decod/i);
});
test('JWT shows payload only, rejecting malformed tokens, never claiming verified',()=>{
  const header=base64Encode(JSON.stringify({alg:'HS256',typ:'JWT'}),true);
  const payload=base64Encode(JSON.stringify({sub:'demo',exp:1780000000}),true);
  const parsed=decodeJwt(header+'.'+payload+'.sig');
  assert.equal(parsed.payload.sub,'demo');
  assert.equal(parsed.header.alg,'HS256');
  assert.equal(parsed.signaturePresent,true);
  assert.throws(()=>decodeJwt('invalid'),/three/);
  assert.throws(()=>decodeJwt(base64Encode('[]')+'.'+payload+'.sig'),/objects/);
});
test('word statistics count Unicode characters, lines and paragraphs',()=>{
  const s=textStatistics('Hello world 🌍!\n\nSelamat datang.');
  assert.equal(s.words,4);
  assert.equal(s.characters,[...'Hello world 🌍!\n\nSelamat datang.'].length);
  assert.equal(s.paragraphs,2);
  assert.equal(s.lines,3);
  assert.deepEqual(textStatistics('').words,0);
});
test('SHA hashes use standard UTF-8 known vectors',async()=>{
  assert.equal(await hashText('abc','SHA-256'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal((await hashText('abc','SHA-384')).length,96);
  assert.equal((await hashText('abc','SHA-512')).length,128);
  await assert.rejects(hashText('abc','MD5'),/Unsupported/);
});
test('UUID v4 and v7 have correct version and variant',()=>{
  for(const version of ['4','7']){
    const ids=createUuids(30,version);
    assert.equal(new Set(ids).size,30);
    assert.ok(ids.every(x=>new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-'+version+'[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$').test(x)));
  }
  assert.equal(uuidv7(0).startsWith('00000000-0000-7'),true);
  assert.throws(()=>createUuids(501),/1 to 500/);
});
test('CSS generator prevents invalid colour and negative blur',()=>{
  const css=cssShadow({x:2,y:8,blur:12,spread:0,opacity:25,color:'#ff0000'});
  assert.match(css,/2px 8px 12px 0px rgba\(255, 0, 0, 0\.25\)/);
  assert.throws(()=>cssShadow({color:'expression(alert(1))'}),/Color must/);
  assert.throws(()=>cssShadow({blur:-1}),/Invalid/);
});
test('PDF ranges keep requested order and reject dangerous page numbers',()=>{
  assert.deepEqual(pdfPageSelection('',3),[0,1,2]);
  assert.deepEqual(pdfPageSelection('5, 1-3, 5',5),[4,0,1,2]);
});
test('PDF parser rejects reversed, missing and out of bounds selections',()=>{
  for(const s of ['0','8','4-2','abc','1,,3','1-99']) assert.throws(()=>pdfPageSelection(s,5));
  assert.deepEqual(pdfPageSelection('',5,false),[]);
});
test('image target dimensions preserve aspect ratio and check memory bounds',()=>{
  assert.deepEqual(targetDimensions(2000,1000,800,800),{width:800,height:400});
  assert.deepEqual(targetDimensions(1000,2000,500,500),{width:250,height:500});
  assert.deepEqual(targetDimensions(640,480,320,0),{width:320,height:240});
  assert.throws(()=>targetDimensions(4000,3000,10000,10000),/32 megapixels/);
});
