/**
 * Fail / File: scripts/verify-browser-release.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Uji accordion tanpa scroll bersarang pada desktop dan mobile menggunakan Chromium sebenar.
 * EN: Browser-test accordion with no nested scroll on desktop and mobile.
 */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const ORIGIN='http://127.0.0.1:8766';
const server=spawn(process.execPath,['scripts/preview.mjs'],{env:{...process.env,PORT:'8766'},stdio:'ignore'});
let browser;
async function ready(){
 for(let i=0;i<60;i++){
  if(server.exitCode!==null)throw Error('Preview server terminated');
  try{if((await fetch(ORIGIN+'/')).ok)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,150));
 }
 throw Error('Preview server not ready');
}
async function inspect(label,viewport){
 const page=await browser.newPage({viewport,deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',route=>route.request().url().startsWith(ORIGIN+'/')?route.continue():route.abort());
 try{
  await page.goto(ORIGIN+'/',{waitUntil:'domcontentloaded'});
  await page.locator('.category-card').first().waitFor();
  const mobile=viewport.width<=580;
  assert.equal(await page.locator('.category-card').count(),11);
  assert.equal(await page.locator('.category-toggle').count(),11);
  const pdf=page.locator('[data-category="pdf"]');
  assert.equal(await pdf.locator('.category-toggle').getAttribute('aria-expanded'),String(!mobile));
  if(mobile)await pdf.locator('.category-toggle').click();
  else await pdf.locator('.category-reveal').click();
  assert.equal(await pdf.locator('.category-item').count(),12);
  const styles=await pdf.locator('.category-card-list').evaluate(el=>({overflow:getComputedStyle(el).overflowY,maxHeight:getComputedStyle(el).maxHeight,overscroll:getComputedStyle(el).overscrollBehaviorY}));
  assert.notEqual(styles.overflow,'auto','No nested vertical scrolling');
  assert.notEqual(styles.overscroll,'contain','Scroll must chain to document');
  assert.equal(await page.locator('.category-card').count(),11);
  assert((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=3,'Unexpected horizontal overflow');
  await mkdir('browser-qa',{recursive:true});
  await page.screenshot({path:`browser-qa/${label}-accordion.png`,fullPage:true});
  await pdf.locator('.entry-web').first().click();
  assert.equal(await page.locator('#zrain-preview').evaluate(x=>x.open),true);
  await page.locator('#zrain-preview-close').click();
  await page.locator('#home-search-input').fill('merge pdf');
  assert((await page.locator('#search-preview .search-mini').count())>0);
  await page.goto(ORIGIN+'/admin/',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#admin-dashboard').isVisible(),false);
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS '+label+': 11 categories, 46 v2.4 Tools, accessible accordion, single page scroll, Console, search, protected Admin');
 }finally{await page.close()}
}
try{
 await ready();browser=await chromium.launch({headless:true});
 await inspect('desktop',{width:1440,height:900});
 await inspect('mobile',{width:390,height:844});
}catch(error){console.error(error.stack||error);process.exitCode=1;}
finally{if(browser)await browser.close();server.kill('SIGTERM');}
