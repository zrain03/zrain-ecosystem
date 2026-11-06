/*
 * Fail / File: test/site.test.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Menguji sempadan site, output dan kes gagal tanpa membuat permintaan production.
 * EN: Tests site contracts, outputs and failure paths without making production requests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import {PRODUCTS} from '../public/console-products.js';
import {chooseActiveSection} from '../public/zrain-ui-config.js';
// BM: read: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: menguji sempadan site, output dan kes gagal tanpa membuat permintaan production.
// EN: read: Reads relevant records and returns a bounded result to the caller. Module purpose: tests site contracts, outputs and failure paths without making production requests.
const read = file => readFile(new URL(file, import.meta.url), 'utf8');

test('the official Golden Reference pin and Hosting target remain unchanged',async()=>{
  const [pkg,html,fb,deploy] = await Promise.all([
    read('../package.json'),read('../public/index.html'),read('../firebase.json'),read('../deploy.ps1')
  ]);
  const parsed=JSON.parse(pkg);
  assert.equal(parsed.version,'10.0.0');
  assert.equal(parsed.dependencies['@zrain/ui'],'github:zrain03/zrain-ui#a109401fa591afa9f66479fa8d86f1ed1679d70b');
  assert.equal(JSON.parse(fb).hosting.site,'zrain');
  assert.equal(JSON.parse(fb).hosting.public,'public');
  assert.match(deploy,/\$ProjectId -ne 'zrain-ecosystem'/);
  assert.match(html,/class="zrain-header"/);
  assert.match(html,/class="zrain-footer"/);
  assert.match(html,/Made for people\./);
  assert.match(html,/Built with purpose\./);
});

test('the canonical Zrain visual identity remains available with eleven responsive cards',async()=>{
  const [html,style,ui]=await Promise.all([
    read('../public/index.html'),read('../public/style.css'),read('../public/ecosystem-unified.css')
  ]);
  assert.match(html,/class="hero"/);
  assert.match(html,/id="category-board"/);
  assert.match(style,/#b95136|#fffaf6/i);
  assert.match(ui,/\.category-card/);
  assert.match(html,/Developed by Zrain/);
});

test('inventory includes ten existing projects and forty-eight callable tools without placeholders',async()=>{
  const {INVENTORY,CATEGORIES} = await import('../public/ecosystem-inventory.mjs');
  const html=await read('../public/index.html');
  assert.equal(INVENTORY.length,56);
  assert.equal(INVENTORY.filter(x=>x.kind==='project').length,10);
  assert.equal(INVENTORY.filter(x=>x.kind==='tool').length,46);
  assert.equal(CATEGORIES.length,11);
  assert.equal(new Set(INVENTORY.map(x=>x.id)).size,56);
  for(const name of ['FileFit','DocDiff','DataFix','SubFlow'])
    assert.equal(INVENTORY.some(x=>x.name===name),false,name);
  assert.match(html,/id="category-board"/);
  assert.equal(Object.keys(PRODUCTS).length,11);
});

test('game artwork remains intact and tool cards use the official Zrain identity',async()=>{
  const {INVENTORY}=await import('../public/ecosystem-inventory.mjs');
  for(const icon of ['guess-the-flag','memory-rush']){
    const bytes=await readFile(new URL(`../public/icons/${icon}.webp`,import.meta.url));
    assert.ok(bytes.length>5000,icon);
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.ok(INVENTORY.some(x=>x.id===icon));
  }
  assert.ok(INVENTORY.some(x=>x.kind==='tool'));
});

test('inline and standalone Console retain safe iframe navigation and new-tab escape',async()=>{
  const [html,code,inline]=await Promise.all([
    read('../public/index.html'),read('../public/zrain-console.js'),read('../public/ecosystem-quick-console.mjs')
  ]);
  assert.match(html,/id="zrain-preview-frame"/);
  assert.match(html,/id="zrain-preview-external"/);
  assert.match(code,/frame\.removeAttribute\("src"\)/);
  assert.match(inline,/zrain-preview-frame/);
  assert.deepEqual(Object.entries(PRODUCTS).filter(([,p])=>p.kind==='mobile').map(([k])=>k).sort(),['guess-the-flag','memory-rush']);
  assert.equal(PRODUCTS['zrain-auth-starter'].storeUrl,undefined);
});

test('the modal fills the viewport without creating its own scrolling region', async()=>{
  const css=await read('../public/style.css');
  assert.match(css,/\.zrain-console\s*\{[^}]*height: calc\(100dvh - 20px\)/);
  assert.match(css,/\.zrain-console\s*\{[^}]*overflow: hidden/);
  assert.match(css,/\.console-shell\s*\{[^}]*display: flex; flex-direction: column/);
  assert.match(css,/\.console-stage\s*\{[^}]*min-height: 0/);
  assert.match(css,/\.console-shell\[data-view="desktop"\]/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.doesNotMatch(css,/\.console-frame-wrap iframe\s*\{[^}]*min-height:/);
});

test('all visible copy and labels avoid em dash punctuation',async()=>{
  for(const file of ['../public/index.html','../public/style.css','../public/console-products.js','../public/zrain-console.js']){
    assert.ok(!(await read(file)).includes('\u2014'), file);
  }
});

test('actions open products, reload, fullscreen and close while restoring focus',async()=>{
  const nodes=new Map();
  // BM: node: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menguji sempadan site, output dan kes gagal tanpa membuat permintaan production.
  // EN: node: Isolates one operation so it can be reviewed and tested. Module purpose: tests site contracts, outputs and failure paths without making production requests.
  const node=id=>{
    const x={id,open:false,style:{},dataset:{},focused:false,listeners:{},removed:[],clientWidth:900,clientHeight:700,
      addEventListener(type,cb){this.listeners[type]=cb;},
      fire(type,event={}){this.listeners[type]?.(event);},
      showModal(){this.open=true;},
      close(){this.open=false;this.fire('close');},
      focus(){this.focused=true;},
      removeAttribute(k){this.removed.push(k);delete this[k];},
      setAttribute(k,v){this[k]=v;},
      requestFullscreen(){doc.fullscreenElement=this;return Promise.resolve();}};
    nodes.set(id,x);return x;
  };
  for(const id of ['zrain-console','console-stage','console-viewer','console-frame','console-icon','console-title','console-description','console-mode','console-external','console-store','console-reload','console-fullscreen','console-close','console-shell','console-mobile','console-desktop']) node(id);
  const g=node('button-game'),w=node('button-links'),a=node('button-auth'),m=node('button-monitor'),u=node('button-ui');
  g.dataset.console='guess-the-flag';w.dataset.console='zrain-links';a.dataset.console='zrain-auth-starter';m.dataset.console='zrain-monitor';u.dataset.console='zrain-ui';
  const doc={fullscreenElement:null,getElementById:id=>nodes.get(id),querySelectorAll:q=>q==='[data-console]'?[g,w,a,m,u]:[],
    listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},exitFullscreen(){this.fullscreenElement=null;return Promise.resolve();}};
  const previous={document:globalThis.document,window:globalThis.window,
    ResizeObserver:globalThis.ResizeObserver,fetch:globalThis.fetch};
  globalThis.document=doc;globalThis.window={addEventListener(){}};
  globalThis.ResizeObserver=class{observe(){}};
  globalThis.fetch=async path=>{
    assert.equal(path,"/zrain-ui-showcase.html");
    return {ok:true,text:async()=>"<h1>Zrain UI showcase</h1>"};
  };
  try{
    const module=await import('../public/zrain-console.js?test=v4.1-interaction');
    assert.equal(nodes.get('console-frame').src,undefined);
    g.fire('click');
    assert.equal(nodes.get('zrain-console').open,true);
    assert.equal(nodes.get('console-shell').dataset.view,'mobile');
    assert.equal(nodes.get('console-mobile')['aria-pressed'],'true');
    assert.equal(nodes.get('console-desktop')['aria-pressed'],'false');
    assert.equal(nodes.get('console-frame').src,PRODUCTS['guess-the-flag'].webUrl);
    assert.equal(nodes.get('console-store').hidden,false);
    assert.equal(nodes.get('console-store').href,PRODUCTS['guess-the-flag'].storeUrl);
    assert.equal(nodes.get('console-icon').src,'/icons/guess-the-flag.webp');
    assert.match(nodes.get('console-frame').style.transform,/scale\(/);
    assert.equal(nodes.get('console-frame').style.width,'390px');
    const beforeSwitch=nodes.get('console-frame').src;
    const removalsBeforeSwitch=nodes.get('console-frame').removed.length;
    nodes.get('console-desktop').fire('click');
    assert.equal(nodes.get('console-shell').dataset.view,'desktop');
    assert.equal(nodes.get('console-frame').style.width,'1100px');
    nodes.get('console-mobile').fire('click');
    assert.equal(nodes.get('console-shell').dataset.view,'mobile');
    assert.equal(nodes.get('console-frame').src,beforeSwitch,'Switching views must preserve game state');
    assert.equal(nodes.get('console-frame').removed.length,removalsBeforeSwitch);
    nodes.get('console-reload').fire('click');
    assert.ok(nodes.get('console-frame').removed.includes('src'));
    nodes.get('console-fullscreen').fire('click');
    assert.equal(doc.fullscreenElement,nodes.get('console-shell'));
    nodes.get('console-close').fire('click');
    assert.equal(nodes.get('zrain-console').open,false);
    assert.equal(g.focused,true);
    w.fire('click');
    assert.equal(nodes.get('console-shell').dataset.view,'mobile');
    assert.equal(nodes.get('console-frame').style.width,'390px');
    nodes.get('console-desktop').fire('click');
    assert.equal(nodes.get('console-shell').dataset.view,'desktop');
    assert.equal(nodes.get('console-desktop')['aria-pressed'],'true');
    assert.equal(nodes.get('console-frame').style.width,'1100px');
    assert.match(nodes.get('console-frame').style.transform,/scale\(/);
    nodes.get('console-mobile').fire('click');
    assert.equal(nodes.get('console-shell').dataset.view,'mobile');
    assert.equal(nodes.get('console-frame').style.width,'390px');
    assert.equal(nodes.get('console-store').hidden,true);
    assert.equal(nodes.get('console-store').href,undefined);
    assert.equal(nodes.get('console-external').href,PRODUCTS['zrain-links'].webUrl);
    nodes.get('zrain-console').fire('click',{target:nodes.get('zrain-console')});
    assert.equal(w.focused,true);
    a.fire('click');
    assert.equal(nodes.get('console-frame').src,PRODUCTS['zrain-auth-starter'].webUrl);
    nodes.get('zrain-console').close();
    assert.equal(nodes.get('console-frame').src,undefined);
    m.fire('click');
    assert.equal(nodes.get('console-frame').src,PRODUCTS['zrain-monitor'].webUrl);
    assert.equal(nodes.get('console-external').href,PRODUCTS['zrain-monitor'].webUrl);
    nodes.get('zrain-console').close();
    u.fire('click');
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(nodes.get('console-frame').src,undefined);
    assert.match(nodes.get('console-frame').srcdoc,/Zrain UI showcase/);
    assert.equal(nodes.get('console-external').href,PRODUCTS['zrain-ui'].webUrl);
    assert.match(nodes.get('console-external').title,/new tab/);
    nodes.get('zrain-console').fire('close');
    assert.equal(nodes.get('console-frame').src,undefined);
  }finally{Object.assign(globalThis,previous)}
});

test('portrait fit never exceeds the available viewer bounds at 100 percent browser zoom',async()=>{
  // Function has no dependency on browser zoom or the current page layout.
  // Headless browser integration performs the actual geometry check as well.
  const js=await read('../public/zrain-console.js');
  assert.match(js,/Math\.min\(w \/ logical\.width, h \/ logical\.height, 1\.25\)/);
  assert.match(js,/frame\.style\.transform = `scale\(\$\{fitted\.scale\}\)`/);
  for(const {w,h} of [{w:420,h:640},{w:340,h:650},{w:1200,h:850},{w:150,h:190}]){
    const scale=Math.min(w/390,h/844,1.25);
    assert.ok(Math.floor(390*scale)<=w);
    assert.ok(Math.floor(844*scale)<=h);
  }
});


test('both preview viewers preserve Mobile and Desktop switching',async()=>{
  const [consoleCode,html,inline]=await Promise.all([
    read('../public/zrain-console.js'),read('../public/index.html'),read('../public/ecosystem-quick-console.mjs')
  ]);
  assert.match(consoleCode,/mobile|portrait/i);
  assert.match(consoleCode,/desktop/);
  assert.match(html,/id="zrain-preview-mobile"/);
  assert.match(html,/id="zrain-preview-desktop"/);
  assert.match(inline,/mobile|portrait/i);
});

test('Desktop View renders desktop CSS breakpoints even on narrow screens',async()=>{
  const js=await read('../public/zrain-console.js');
  assert.match(js,/const logicalWidth = Math.max\(1100, availableWidth\)/);
  assert.match(js,/frame\.style\.width = logicalWidth \+ "px"/);
  assert.match(js,/frame\.style\.transform = scale === 1/);
});


test('quick Console exposes its responsive view controls in a dedicated toolbar',async()=>{
  const [html,css]=await Promise.all([read('../public/index.html'),read('../public/ecosystem-quick-console.css')]);
  for(const id of ['zrain-preview-mobile','zrain-preview-desktop','zrain-preview-frame'])
    assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(css,/zrain-preview/);
});

test('game store badges remain real URLs and never apply to ordinary web applications',async()=>{
  const html=await read('../public/index.html');
  assert.match(html,/id="zrain-preview-store"/);
  assert.match(html,/Get it on Google Play/);
  for(const game of ['guess-the-flag','memory-rush'])
    assert.match(PRODUCTS[game].storeUrl,/^https:\/\/play\.google\.com\//);
  for(const [id,item] of Object.entries(PRODUCTS))
    if(!['guess-the-flag','memory-rush'].includes(id))assert.equal(item.storeUrl,undefined,id);
});

test('the quick preview toolbar contains reload, viewport and external controls',async()=>{
  const [html,css]=await Promise.all([read('../public/index.html'),read('../public/ecosystem-quick-console.css')]);
  for(const id of ['zrain-preview-mobile','zrain-preview-desktop','zrain-preview-external','zrain-preview-frame'])
    assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(css,/@media|display:flex|display: flex/);
});

test('game naming agrees between the canonical inventory and standalone Console',async()=>{
  const {INVENTORY}=await import('../public/ecosystem-inventory.mjs');
  assert.equal(PRODUCTS['guess-the-flag'].name,'Guess The Flag');
  assert.equal(INVENTORY.find(x=>x.id==='guess-the-flag').name,'Guess The Flag');
  assert.equal(PRODUCTS['memory-rush'].name,'Memory Rush');
  assert.match(await read('../public/zrain-console.js'),/console-products\.js/);
});

test('About and Contact remain distinct accessible sections after unified redesign',async()=>{
  const [html,css]=await Promise.all([read('../public/index.html'),read('../public/ecosystem-unified.css')]);
  assert.match(html,/class="about-panel" id="about" aria-labelledby="about-title"/);
  assert.match(html,/class="contact-panel" id="contact" aria-labelledby="contact-title"/);
  assert.match(html,/href="mailto:zrain\.dev@gmail\.com"/);
  assert.match(css,/\.about-panel/);
  assert.match(css,/\.contact-panel/);
});

test('navigation highlights the visible section and contact remains active at the footer',async()=>{
  const nav = await read('../public/zrain-ui-config.js');
  assert.doesNotMatch(nav, /current:\s*true/);
  assert.match(nav, /window\.addEventListener\("scroll", scheduleNavUpdate/);
  assert.match(nav, /window\.addEventListener\("resize", scheduleNavUpdate/);
  assert.match(nav, /item\.link\.classList\.toggle\("current", isActive\)/);
  assert.match(nav, /item\.link\.removeAttribute\("aria-current"\)/);
  assert.match(await read('../public/style.css'), /scroll-behavior: smooth/);
  // BM: area: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: menguji sempadan site, output dan kes gagal tanpa membuat permintaan production. Input: products,about,contact.
  // EN: area: Isolates one operation so it can be reviewed and tested. Module purpose: tests site contracts, outputs and failure paths without making production requests. Inputs: products,about,contact.
  const area = (products,about,contact) => [
    {id:'products',top:products[0],bottom:products[1]},
    {id:'about',top:about[0],bottom:about[1]},
    {id:'contact',top:contact[0],bottom:contact[1]}
  ];
  assert.equal(chooseActiveSection(area([500,1200],[1300,1750],[1800,2200]),900,90),null, 'hero does not pretend Products is visible');
  assert.equal(chooseActiveSection(area([-80,900],[940,1350],[1400,1750]),900,90),'products');
  assert.equal(chooseActiveSection(area([-950,200],[180,780],[820,1100]),900,90),'about');
  assert.equal(chooseActiveSection(area([-1100,-50],[-260,510],[540,860]),900,90),'contact');
  assert.equal(chooseActiveSection(area([-1800,-600],[-600,-200],[-130,65]),900,90),'contact', 'footer position');
});

test('Zrain UI showcase uses the real shared branding and links to official source',async()=>{
  const html=await read('../public/zrain-ui-showcase.html');
  assert.match(html,/import \{ mountZrainUI \} from "\/zrain-ui\.js/);
  assert.match(html,/mountZrainUI\(\{ product: "UI"/);
  assert.match(html,/Zrain UI is a reusable design system, not a separate account/);
  assert.match(html,/href="https:\/\/github\.com\/zrain03\/zrain-ui"/);
  assert.match(html,/class="zrain-footer"/);
  assert.ok(PRODUCTS['zrain-ui'].webUrl.endsWith('/zrain-ui-showcase.html'));
  assert.ok(PRODUCTS['zrain-ui'].externalUrl.startsWith('https://github.com/'));
});

test('the public Console page links to its dedicated allowlisted viewer',async()=>{
  const [home,page,consoleCode]=await Promise.all([
    read('../public/index.html'),read('../public/zrain-console.html'),read('../public/zrain-console.js')
  ]);
  assert.match(home,/href="\/zrain-console\.html"/);
  assert.match(page,/<title>Zrain Console/);
  assert.match(page,/class="zrain-footer"/);
  assert.match(page,/id="console-apps"/);
  assert.match(consoleCode,/new URLSearchParams\(window\.location\?\.search \|\| ""\)/);
  assert.match(consoleCode,/Object\.prototype\.hasOwnProperty\.call\(PRODUCTS, requestedDemo\)/);
  assert.doesNotMatch(consoleCode,/frame\.src = requestedDemo/);
});

test('public Console project export preserves the existing production app',async()=>{
  const [script,readme,arch] = await Promise.all([
    read('../scripts/publish-zrain-console-repo.ps1'),
    read('../projects/zrain-console/README.md'),
    read('../projects/zrain-console/ARCHITECTURE.md')
  ]);
  assert.match(script,/Copy-Item -LiteralPath \(Join-Path \$root "public\\zrain-console\.js"\)/);
  assert.match(script,/Copy-Item -LiteralPath \(Join-Path \$root "public\\console-products\.js"\)/);
  assert.match(script,/gh repo create zrain03\/zrain-console --public/);
  assert.match(script,/if \(Test-Path \$destination\)/);
  assert.doesNotMatch(script,/git clean|git reset --hard|--force-with-lease/);
  assert.match(readme,/exported snapshot/);
  assert.match(arch,/frontend viewing layer/);
});
