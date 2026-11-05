/**
 * Fail / File: scripts/verify-browser-release.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: 2026-11-05
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Audit browser sebenar untuk katalog, scroll lima item, Console dan akses admin tanpa login.
 * EN: Real-browser audit of catalog, five-item scrolling, Console and signed-out admin access.
 */
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const ORIGIN='http://127.0.0.1:8766';
const server=spawn(process.execPath,['scripts/preview.mjs'],{env:{...process.env,PORT:'8766'},stdio:'ignore'});
const results=[];
let browser;
async function ready(){
 for(let i=0;i<50;i++){
  if(server.exitCode!==null)throw new Error('Preview server exited');
  try{const r=await fetch(ORIGIN+'/');if(r.ok)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,150));
 }
 throw new Error('Preview server did not start');
}
async function inspect(viewport,label){
 const page=await browser.newPage({viewport,deviceScaleFactor:1});
 const pageErrors=[];
 page.on('pageerror',error=>pageErrors.push(error.message));
 // BM: Jangan memuatkan laman pihak ketiga atau menghubungi API production dalam preview.
 // EN: Do not load third-party pages or contact production APIs from the local preview.
 await page.route('**/*',route=>{
  if(route.request().url().startsWith(ORIGIN+'/'))return route.continue();
  return route.abort('blockedbyclient');
 });
 try{
  await page.goto(ORIGIN+'/',{waitUntil:'domcontentloaded',timeout:15000});
  await page.locator('.category-card').first().waitFor();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.category-card').count(),11,'11 official categories');
  assert.equal(await page.locator('.category-item').count(),58,'58 source catalog items');
  const rows=await page.locator('.category-card-list').evaluateAll(list=>list.map(node=>({
   items:node.querySelectorAll('.category-item').length,
   clientHeight:node.clientHeight,
   scrollHeight:node.scrollHeight,
   overflowY:getComputedStyle(node).overflowY
  })));
  for(const row of rows)if(row.items>5){
   assert.equal(row.overflowY,'auto','Category with more than five items must scroll');
   assert(row.scrollHeight>row.clientHeight+4,'Category scroll height must exceed visible five items');
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(overflow<=3,'Unexpected horizontal overflow: '+overflow+'px');
  await mkdir('browser-qa',{recursive:true});
  await page.screenshot({path:'browser-qa/'+label+'-homepage.png',fullPage:true});
  await page.locator('.entry-web').first().click();
  assert.equal(await page.locator('#zrain-preview').evaluate(node=>node.open),true,'Inline Console must open');
  assert((await page.locator('#zrain-preview-frame').getAttribute('src'))!=='about:blank','Console iframe source must be set');
  await page.locator('#zrain-preview-desktop').click();
  assert.equal(await page.locator('#zrain-preview-desktop').getAttribute('aria-pressed'),'true');
  await page.locator('#zrain-preview-mobile').click();
  assert.equal(await page.locator('#zrain-preview-mobile').getAttribute('aria-pressed'),'true');
  await page.locator('#zrain-preview-close').click();
  assert.equal(await page.locator('#zrain-preview').evaluate(node=>node.open),false,'Close must dismiss Console');
  await page.locator('#home-search-input').fill('merge pdf');
  assert((await page.locator('#search-preview .search-mini').count())>0,'Search should find PDF tools');
  await page.goto(ORIGIN+'/categories/',{waitUntil:'domcontentloaded'});
  assert((await page.locator('body').innerText()).includes('Categories'),'Categories page should load');
  await page.goto(ORIGIN+'/admin/',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#admin-login').count(),1,'Admin login must exist');
  assert.equal(await page.locator('#admin-dashboard').isVisible(),false,'Admin dashboard must be hidden without login');
  assert.equal(pageErrors.length,0,'Uncaught browser errors: '+pageErrors.join(' | '));
  const result={label,categories:11,choices:58,scrollingCategories:rows.filter(r=>r.items>5).length,horizontalOverflow:overflow,console:true,search:true,adminProtected:true};
  results.push(result);
  console.log('PASS '+JSON.stringify(result));
 }finally{await page.close();}
}
try{
 await ready();
 browser=await chromium.launch({headless:true});
 await inspect({width:1440,height:900},'desktop');
 await inspect({width:390,height:844},'mobile');
 console.log('BROWSER ACCEPTANCE PASSED: desktop and mobile.');
}catch(e){console.error('BROWSER ACCEPTANCE FAILED:',e.stack||e);process.exitCode=1;}
finally{if(browser)await browser.close();server.kill('SIGTERM');}
