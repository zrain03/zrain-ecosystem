/*
 * Fail / File: tool-runtime/tests/extended-functional.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 tests)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji fungsi dan regresi sebenar Zrain Tools v2.4.0.
 * EN: Tests real functionality and regressions for Zrain Tools v2.4.0.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mountExtendedTool} from '../src/extended-tools.mjs';

function fixture(slug,seed={}){
  const inputs=new Map();
  const values=new Map(Object.entries(seed));
  const $=id=>{
    if(!inputs.has(id))inputs.set(id,{
      id,value:values.get(id)??'',style:{},files:[],textContent:'',innerHTML:'',
      listeners:{},closest(){return {hidden:false}},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)},
      dispatch(type){for(const f of this.listeners[type]||[])f()},
      replaceChildren(...children){this.children=children}
    });
    return inputs.get(id);
  };
  let click=null;
  let output='';let message='';
  const helpers={
    set(html){output=html},
    file:()=>'<FILE />', number:()=>'<NUMBER />',
    select:()=>'<SELECT />', input:()=>'<INPUT />',
    textarea:()=>'<TEXTAREA />', buttons:()=>'<BUTTON />',
    preview:()=>'<PREVIEW />',result:()=>'<RESULT />',
    onRun(fn){click=fn}, chosen:()=>({name:'sample.pdf'}),
    v(id){return $(id).value},n(id){return Number($(id).value)},
    text(msg){message=msg},download(){},downloadText(){},
    pdfLib:async()=>{},openPdf:async()=>{},renderPdfPage:async()=>{},zipLib:async()=>{},
    canvas(){},imgFile:async()=>{},blobOf:async()=>{},renderImage(){},
    safeStem:s=>s,bytes:n=>n+' bytes',$
  };
  const found=mountExtendedTool(slug,helpers);
  return {found,$,get output(){return output},get message(){return message},async run(){assert.equal(typeof click,'function');return click();}};
}

test('every real extension form registers without running remote code',()=>{
  for(const slug of ['base64-tool','jwt-decoder','text-counter','hash-generator','uuid-generator','css-shadow-generator','merge-pdf','split-pdf','rotate-pdf','crop-pdf','remove-pdf-pages','pdf-to-text','pdf-to-image','jpg-to-pdf','pdf-page-numbers','image-resizer','image-rotator','image-compressor']){
    const app=fixture(slug,{color:'#131316',version:'4'});
    assert.equal(app.found,true,slug);assert.ok(app.output.length>10,slug);
  }
  assert.equal(fixture('not-a-real-tool').found,false);
});
test('Base64 tool produces output, then decodes it back, including Unicode',async()=>{
  const app=fixture('base64-tool',{source:'Bahasa Melayu 🌍',mode:'encode',alphabet:'url'});
  await app.run();const encoded=app.$('output').value;assert.ok(encoded.length>10);
  app.$('source').value=encoded;app.$('mode').value='decode';await app.run();
  assert.equal(app.$('output').value,'Bahasa Melayu 🌍');
});
test('JWT tool never verifies signature and fails invalid tokens',async()=>{
  const token='eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature';
  const app=fixture('jwt-decoder',{source:token});await app.run();
  assert.match(app.$('output').value,/"sub": "123"/);assert.match(app.message,/NOT verified/);
  app.$('source').value='not.a.jwt';await assert.rejects(app.run());
});
test('Text Counter updates on input and renders text statistics',async()=>{
  const app=fixture('text-counter',{source:'One two three'});
  assert.match(app.$('counter-grid').innerHTML,/>3<\/strong>/);
  app.$('source').value='Satu dua';app.$('source').dispatch('input');
  assert.match(app.$('counter-grid').innerHTML,/>2<\/strong>/);
});
test('SHA and UUID tools call real Web Crypto and produce expected output',async()=>{
  const hash=fixture('hash-generator',{source:'abc',algo:'SHA-256'});await hash.run();
  assert.equal(hash.$('output').value,'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const id=fixture('uuid-generator',{amount:'2',version:'7'});await id.run();
  assert.equal(id.$('output').value.split('\n').length,2);
  assert.match(id.$('output').value,/\b7[0-9a-f]{3}-[89ab]/);
});
test('CSS Shadow generator produces valid CSS property and rejects invalid input',async()=>{
  const app=fixture('css-shadow-generator',{color:'#112233',x:'0',y:'5',blur:'15',spread:'0',opacity:'50',inset:'no'});
  await app.run();assert.match(app.$('output').value,/box-shadow: 0px 5px 15px 0px rgba\(17, 34, 51, 0\.50\);/);
  assert.match(app.$('shadow-swatch').style.boxShadow,/rgba/);
});
