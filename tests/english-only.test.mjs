/*
 * Fail / File: tests/english-only.test.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-16
 * Dikemas kini / Last updated: 2026-11-16
 * BM: Semak bahasa, butang katalog dan bilangan kategori.
 * EN: Verify language, catalogue action and category counts.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('homepage remains English and opens its product catalogue', () => {
  const html=read('public/index.html');
  assert.ok(!html.includes('id="languageSwitch"'));
  assert.match(html, /setLanguage\('en',false,false\)/);
  const setter=html.match(/function setLanguage\(value,save=true,animate=true\)\{[\s\S]*?\n  \}(?=\r?\n  const api=)/)?.[0];
  assert.ok(setter);
  const context={lang:'en',localStorage:{setItem(){throw Error('Unexpected write')}},applyStatic(){},document:{dispatchEvent(){}},CustomEvent:class{}};
  vm.runInNewContext(setter+';setLanguage("bm",true,false)',context);
  assert.equal(context.lang,'en');
  const action=html.match(/\$\('primaryAction'\)\.addEventListener\('click',\(\)=>\{[^\n]+/)?.[0];
  assert.ok(action);
  let listener,opened=false;
  const ui={view:'hello',$:id=>id==='primaryAction'?{addEventListener:(event,fn)=>listener=fn}:{click:()=>opened=true}};
  vm.runInNewContext(action,ui);listener();assert.ok(opened);
});

test('shelf count follows the categories actually shown', () => {
  const html=read('public/index.html');
  const setup=html.match(/function setupShelves\(\)\{[\s\S]*?\n  \}(?=\r?\n  function renderCategories)/)?.[0];
  assert.ok(setup);
  let label='',rendered=[];
  const document={querySelector:()=>({set textContent(value){label=value}}),createElement:()=>({dataset:{},setAttribute(){},addEventListener(){}})};
  const context={data:{categories:[{id:'a',short:'a',count:2},{id:'b',short:'b',count:0}]},document,$:()=>({append:item=>rendered.push(item)}),tx:a=>a,catName:c=>c.short,escape:value=>value};
  vm.createContext(context);vm.runInContext(setup+';setupShelves()',context);
  assert.equal(label,'1 collection');assert.equal(rendered.length,1);
  context.data.categories[1].count=1;rendered=[];vm.runInContext('setupShelves()',context);
  assert.equal(label,'2 collections');assert.equal(rendered.length,2);
});

test('legacy showcases and shared runtime ignore saved Malay and language requests', () => {
  for(const path of ['public/ui/v2/runtime.mjs','public/zrain-ui-showcase.html','public/ui/v1/header-v4514.html','public/ui/v1/footer-v4514.html']){
    const source=read(path);
    assert.doesNotMatch(source,/(?:compactElement|element)\(doc,'button','zr-lang-switch'\)/,path);
    const initial=source.match(/let language=[^;]+;/)?.[0];
    const setter=source.match(/function setLanguage\(value\)\{[\s\S]*?\n  \}(?=\r?\n  function setTheme)/)?.[0];
    assert.ok(initial && setter,path);
    let saved,notified,dispatched;
    const actions={querySelector(){return null}}, communityButton={querySelector(){return {textContent:''}}}, soundButton={querySelector(){return {textContent:''}},setAttribute(){}};
    const doc={body:{dataset:{sound:'off'}},dispatchEvent(event){dispatched=event.detail.lang}};
    const win={CustomEvent:class {constructor(type,options){this.detail=options.detail}}};
    const make=new Function('safeRead','safeWrite','actions','communityButton','soundButton','doc','win','options',initial+"\nlet theme='night';const t=(en,bm)=>language==='bm'?bm:en;\n"+setter+'\nreturn {setLanguage,getLanguage:()=>language};');
    const api=make(()=>'bm',(key,value)=>{saved=value},actions,communityButton,soundButton,doc,win,{onLanguageChange(value){notified=value}});
    assert.equal(api.getLanguage(),'en',path);api.setLanguage('bm');
    assert.equal(api.getLanguage(),'en',path);assert.equal(saved,'en',path);assert.equal(notified,'en',path);assert.equal(dispatched,'en',path);
  }
});

test('homepage English compatibility API no longer depends on Malay lookup dictionaries',()=>{
  const html=read('public/index.html');
  for(const name of ['viewsBM','categoryBM','productsBM','poseBM','worldBM','poseNames']) assert.doesNotMatch(html,new RegExp('const '+name+'\\s*='));
  const block=html.match(/const api=\{get lang\(\)\{return lang\}[\s\S]*?window\.ZrainI18n=api;/)?.[0];
  assert.ok(block);
  const api=vm.runInNewContext('(()=>{let lang="en";const text=x=>x;const setLanguage=()=>{};let window={};'+block+'return window.ZrainI18n})()');
  assert.equal(api.t('Hello','Hai'),'Hello');assert.equal(api.cat({id:'images',name:'Images'}),'Images');
  assert.equal(api.product({description:'Description'}),'Description');assert.equal(api.view('hello'),null);
  const pose={name:'Waving'};assert.equal(api.pose('wave',pose),pose);assert.equal(api.world(0,'Morning'),'Morning');
});

test('legacy shared views retain English content without Malay dictionaries',()=>{
  for(const path of ['public/zrain-ui-showcase.html','public/ui/v1/header-v4514.html','public/ui/v1/footer-v4514.html']) {
    const html=read(path),start=html.indexOf('const defaultViews = ['),end=html.indexOf('const localize=',start);
    assert.ok(start>=0 && end>start,path);
    const block=html.slice(start,end);
    assert.doesNotMatch(block,/\b(?:bm|labelBM):/,path);
    const data=vm.runInNewContext(block+';({defaultViews,feedbackView})');
    assert.equal(data.defaultViews[0].eyebrow.en,'01 / WHAT ZRAIN UI DOES',path);
    assert.equal(data.feedbackView.headline[0].en,'Your voice.',path);
  }
});

test('catalogue translation helper preserves English output for legacy callers',()=>{
 const html=read('public/index.html');
 const declaration=html.match(/const tx=\(en,bm\)=>lang\(\)===['"]bm['"]\?bm:en;/)?.[0];
 assert.ok(declaration);
 const translate=new Function('lang',declaration+';return tx')(()=> 'en');
 assert.equal(translate('Browse ','Lihat koleksi '),'Browse ');
});

// Legacy language requests cannot change visible contact labels away from English.
test('contact labels remain English for legacy BM requests',()=>{
 for(const path of ["public/ui/v2/runtime.mjs","public/ui/v1/layout.js","public/ui/v1/header-v4514.html","public/ui/v1/footer-v4514.html","public/zrain-ui-showcase.html"]) {
  const source=read(path);
  const declaration=source.match(/const setLanguage=lang=>\{mail\.querySelector\('strong'\)[^\r\n]+?\};/)?.[0];
  assert.ok(declaration,path);
  const fields={mail:{},community:{},small:{},attrs:{}};const mail={querySelector(){return fields.mail}};const community={querySelector(selector){return selector==='strong'?fields.community:fields.small},setAttribute(k,v){fields.attrs[k]=v}};const change=new Function('mail','community',declaration+';return setLanguage')(mail,community);change('bm');assert.equal(fields.mail.textContent,'Email');assert.equal(fields.community.textContent,'Community');assert.equal(fields.small.textContent,'Leave a note');assert.equal(fields.attrs['aria-label'],'Open product Community');
 }
});
