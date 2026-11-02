import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import {PRODUCTS} from '../public/console-products.js';
import {chooseActiveSection} from '../public/zrain-ui-config.js';
const read = file => readFile(new URL(file, import.meta.url), 'utf8');

test('official Zrain UI remains pinned, and deploys only to Hosting site zrain', async()=>{
  const [pkg,html,fb,deploy]=await Promise.all([read('../package.json'),read('../public/index.html'),read('../firebase.json'),read('../deploy.ps1')]);
  const parsed=JSON.parse(pkg);
  assert.equal(parsed.version,'4.1.4');
  assert.equal(parsed.dependencies['@zrain/ui'],'github:zrain03/zrain-ui#fec7b1fe5deab157bdadf0af19d9384b1dc418f0');
  assert.equal(JSON.parse(fb).hosting.site,'zrain');
  assert.equal(JSON.parse(fb).hosting.public,'public');
  // The UI showcase shares zrain.web.app with Zrain Console: allow only
  // same-origin embedding; third-party sites must remain blocked.
  const commonHeaders=JSON.parse(fb).hosting.headers
    .find(rule=>rule.source==="**").headers;
  const framePolicy=commonHeaders.find(header=>header.key==="X-Frame-Options");
  assert.equal(framePolicy.value,"SAMEORIGIN");
  assert.match(deploy,/\$ProjectId -ne 'zrain-ecosystem'/);
  assert.match(deploy,/hosting:sites:get zrain/);
  assert.match(deploy,/npm run test:release/);
  assert.match(html,/class="zrain-header"/);
  assert.match(html,/class="zrain-footer"/);
  assert.match(html,/Made for people\. Built with purpose\./);
  assert.match(html,/Explore the Zrain Ecosystem\./);
  assert.doesNotMatch(html,/class="zrain-brand__tagline"/);
});

test('light Bento identity remains unchanged with Inter and terracotta',async()=>{
  const [html,css]=await Promise.all([read('../public/index.html'),read('../public/style.css')]);
  assert.match(html,/family=Inter/);
  assert.match(css,/--zr-bg: #fffaf6/);
  assert.match(css,/--zr-terra: #b95136/);
  assert.match(css,/\.bento-grid\s*\{\s*display:\s*grid/);
  assert.equal((html.match(/class="bento-card /g)||[]).length,4);
  assert.doesNotMatch(css, /\.game-console/);
  assert.match(css,/\.zrain-console/);
});

test('directory shows real applications only, with no placeholder projects',async()=>{
  const html=await read('../public/index.html');
  for(const name of ['Guess The Flag','Memory Rush','Zrain Auth Starter','Zrain UI','Zrain Links','Zrain Monitor']) assert.ok(html.includes(name),name);
  for(const name of ['Zrain Error Tracker','FileFit','DocDiff','DataFix','QR Studio','SubFlow']) assert.ok(!html.includes(name),name);
  assert.equal(Object.keys(PRODUCTS).length,11);
  for(const [id,p] of Object.entries(PRODUCTS)){
    if (id.endsWith("-tools")) {
      const consolePage = await read('../public/zrain-console.html');
      assert.ok(consolePage.includes('/?console=' + id), id);
    } else {
      assert.match(html,new RegExp(`data-console="${id}"`));
    }
    assert.ok(p.webUrl.startsWith('https://'));
    assert.ok(p.icon.startsWith('/'));
  }
  assert.match(html, /href="https:\/\/github\.com\/zrain03\/zrain-auth-starter"/);
  assert.match(html, /href="https:\/\/github\.com\/zrain03\/zrain-ui"/);
  assert.match(html, /data-console="zrain-monitor"/);
  assert.match(html, /data-console="zrain-links"/);
  assert.match(html, /03 TOOLS/);
  assert.equal(PRODUCTS["zrain-monitor"].webUrl,"https://zrain-monitor.web.app/");
  assert.equal(PRODUCTS["zrain-ui"].externalUrl,"https://github.com/zrain03/zrain-ui");
});

test('the two actual uploaded game icons are installed, not generic glyphs',async()=>{
  const html=await read('../public/index.html');
  for(const icon of ['guess-the-flag','memory-rush']){
    const bytes=await readFile(new URL(`../public/icons/${icon}.webp`,import.meta.url));
    assert.ok(bytes.length>5000, `${icon} image should not be an empty placeholder`);
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.match(html,new RegExp(`/icons/${icon}\\.webp`));
  }
  assert.ok(!html.includes('class="app-mark flag-mark"'));
  assert.ok(!html.includes('class="app-mark memory-mark"'));
});

test('universal Console keeps every web app in an iframe until Open in new tab is clicked',async()=>{
  const html=await read('../public/index.html');
  const js=await read('../public/zrain-console.js');
  assert.match(html,/<dialog id="zrain-console"/);
  assert.doesNotMatch(html, /<iframe[^>]+\bsrc=/);
  assert.match(html,/id="console-external"/);
  assert.match(html,/target="_blank" rel="noopener noreferrer"/);
  assert.match(html,/id="console-store"/);
  assert.match(js,/frame\.src = current\.webUrl/);
  assert.match(js,/frame\.removeAttribute\("src"\)/);
  assert.match(js,/data-console/);
  assert.deepEqual(Object.entries(PRODUCTS).filter(([,p])=>p.kind==='mobile').map(([id])=>id).sort(),['guess-the-flag','memory-rush']);
  assert.deepEqual(Object.entries(PRODUCTS).filter(([,p])=>p.kind==='web').map(([id])=>id).sort(),['zrain-auth-starter','zrain-developer-tools','zrain-document-tools','zrain-image-tools','zrain-links','zrain-monitor','zrain-pdf-tools','zrain-productivity-tools','zrain-ui']);
  assert.ok(PRODUCTS['guess-the-flag'].storeUrl.includes('com.zrain.guesstheflag'));
  assert.ok(PRODUCTS['memory-rush'].storeUrl.includes('com.zrain.memoryrush'));
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


test('all products use Mobile View by default with optional Desktop View',async()=>{
  const [html,css,js]=await Promise.all([read('../public/index.html'),read('../public/style.css'),read('../public/zrain-console.js')]);
  for(const id of ['console-mobile','console-desktop']) assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/id="console-shell" data-view="mobile"/);
  assert.match(html,/id="console-mobile"[^>]*aria-pressed="true"/);
  assert.match(html,/id="console-desktop"[^>]*aria-pressed="false"/);
  assert.match(css,/\.console-view-button\[aria-pressed="true"\]/);
  assert.match(css,/\.console-shell\[data-view="desktop"\]/);
  assert.match(js,/setView\("mobile"\)/);
  assert.match(js,/desktopButton\.addEventListener\("click"/);
  assert.match(js,/mobileButton\.addEventListener\("click"/);
  assert.doesNotMatch(js,/current\.kind === "web"/);
});


test('Desktop View renders desktop CSS breakpoints even on narrow screens',async()=>{
  const js=await read('../public/zrain-console.js');
  assert.match(js,/const logicalWidth = Math.max\(1100, availableWidth\)/);
  assert.match(js,/frame\.style\.width = logicalWidth \+ "px"/);
  assert.match(js,/frame\.style\.transform = scale === 1/);
});


test('view controls are always visible in the Console header even when info bar is hidden',async()=>{
  const [html,css]=await Promise.all([read('../public/index.html'),read('../public/style.css')]);
  const toolbarStart=html.indexOf('<header class="console-toolbar">');
  const toolbarEnd=html.indexOf('</header>', toolbarStart);
  const header=html.slice(toolbarStart,toolbarEnd);
  assert.ok(toolbarStart > 0);
  assert.match(header,/id="console-mobile"[^>]+aria-pressed="true"/);
  assert.match(header,/id="console-desktop"[^>]+aria-pressed="false"/);
  assert.ok(header.indexOf('id="console-desktop"') < header.indexOf('class="console-actions"'));
  const info=html.slice(html.indexOf('<div class="console-info">'));
  assert.doesNotMatch(info.slice(0,info.indexOf('console-stage')), /id="console-desktop"/);
  assert.match(css,/\.console-toolbar\s*\{\s*display: grid;/);
  assert.match(css,/@media \(max-height: 570px\)\s*\{[^}]*\.console-toolbar \.console-view-switch\s*\{\s*display: inline-flex;/);
  assert.match(html,/style\.css\?v=ecosystem-4\.1\.7/);
});


test('Google Play badge stays in the visible Console toolbar for games only', async()=>{
  const [html,css,js]=await Promise.all([read('../public/index.html'),read('../public/style.css'),read('../public/zrain-console.js')]);
  const header=html.slice(html.indexOf('<header class="console-toolbar">'),html.indexOf('</header>',html.indexOf('<header class="console-toolbar">')));
  const info=html.slice(html.indexOf('<div class="console-info">'),html.indexOf('<section class="console-stage"'));
  assert.match(header, /<a id="console-store"[^>]*hidden>/);
  assert.match(header, /<img src="\/icons\/google-play-badge\.png"/);
  assert.ok(header.indexOf('id="console-fullscreen"') < header.indexOf('id="console-store"'));
  assert.ok(header.indexOf('id="console-store"') < header.indexOf('id="console-external"'));
  assert.doesNotMatch(info, /id="console-store"/);
  assert.match(css, /\.console-store-badge\[hidden\]\s*\{\s*display:\s*none\s*!important/);
  assert.match(css, /@media \(max-width: 660px\)/);
  assert.match(js, /store\.hidden = !product\.storeUrl/);
  const badge=await readFile(new URL('../public/icons/google-play-badge.png',import.meta.url));
  assert.ok(badge.length > 4000);
  assert.equal(badge.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.ok(PRODUCTS['guess-the-flag'].storeUrl.includes('com.zrain.guesstheflag'));
  assert.ok(PRODUCTS['memory-rush'].storeUrl.includes('com.zrain.memoryrush'));
  assert.equal(PRODUCTS['zrain-links'].storeUrl,undefined);
  assert.equal(PRODUCTS['zrain-auth-starter'].storeUrl,undefined);
});


test('Console toolbar controls have equal heights and remain on one desktop row', async()=>{
  const [html,css]=await Promise.all([read('../public/index.html'),read('../public/style.css')]);
  const header=html.slice(html.indexOf('<header class="console-toolbar">'),html.indexOf('</header>',html.indexOf('<header class="console-toolbar">')));
  for(const id of ['console-reload','console-fullscreen','console-store','console-external','console-close'])
    assert.match(header,new RegExp(`id="${id}"`));
  assert.match(css,/grid-template-areas: "product views actions"/);
  assert.match(css,/\.console-toolbar \.console-tool,[\s\S]*?\.console-toolbar \.console-store-badge,[\s\S]*?height: 46px/);
  assert.match(css,/\.console-toolbar \.console-store-badge \{/);
  assert.match(css,/@media \(max-width: 1100px\) and \(min-width: 661px\)/);
  assert.doesNotMatch(css,/@media \(max-width: 1370px\) and \(min-width: 661px\)/);
});

test('Guess The Flag title is consistent in both directory and Console',async()=>{
  const html=await read('../public/index.html');
  assert.equal(PRODUCTS['guess-the-flag'].name,'Guess The Flag');
  assert.match(html, /<strong>Guess The Flag<\/strong>/);
  assert.match(html, /aria-label="Open Guess The Flag in Zrain Console"/);
  assert.doesNotMatch(html, /Guess the Flag/);
  assert.doesNotMatch(await read('../public/console-products.js'), /Guess the Flag/);
  assert.match(html,/zrain-console\.js\?v=4\.2\.0/);
  assert.match(await read('../public/zrain-console.js'),/console-products\.js\?v=4\.1\.6/);
});

test('About and Contact are distinct accessible sections with useful content',async()=>{
  const [html,css]=await Promise.all([read('../public/index.html'),read('../public/style.css')]);
  assert.match(html, /<section class="about-section" id="about" aria-labelledby="about-title">/);
  assert.match(html, /<div class="about-principles" aria-label="How Zrain products are built">/);
  assert.match(html, /Independent by design/);
  assert.match(html, /<section class="contact-section" id="contact" aria-labelledby="contact-title">/);
  assert.match(html, /<h2 id="contact-title">Questions, feedback/);
  assert.match(html, /href="mailto:zrain\.dev@gmail\.com\?subject=Hello%20Zrain"/);
  assert.match(html, /<a class="contact-email" href="mailto:zrain\.dev@gmail\.com">/);
  assert.match(css, /\.contact-section\s*\{/);
});

test('navigation highlights the visible section and contact remains active at the footer',async()=>{
  const nav = await read('../public/zrain-ui-config.js');
  assert.doesNotMatch(nav, /current:\s*true/);
  assert.match(nav, /window\.addEventListener\("scroll", scheduleNavUpdate/);
  assert.match(nav, /window\.addEventListener\("resize", scheduleNavUpdate/);
  assert.match(nav, /item\.link\.classList\.toggle\("current", isActive\)/);
  assert.match(nav, /item\.link\.removeAttribute\("aria-current"\)/);
  assert.match(await read('../public/style.css'), /scroll-behavior: smooth/);
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

test('the public Console project page is discoverable and launches real production previews', async()=>{
  const [home, page, css, client] = await Promise.all([
    read('../public/index.html'),
    read('../public/zrain-console.html'),
    read('../public/zrain-console-page.css'),
    read('../public/zrain-console.js')
  ]);
  assert.match(home,/href="\/zrain-console\.html"/);
  assert.match(page,/<title>Zrain Console/);
  assert.match(page,/mountZrainUI\(\{ product: "Console"/);
  assert.match(page,/class="zrain-footer"/);
  const demoSection = page.split('id="zc-demos-title"')[1].split('id="zc-features-title"')[0];
  const projectNames = [
    'Guess The Flag', 'Memory Rush', 'Zrain Auth Starter', 'Zrain Monitor',
    'Zrain UI', 'Zrain Links', 'Zrain Console', 'Zrain Ecosystem',
    'Zrain Image Tools', 'Zrain PDF Tools', 'Zrain Document Tools',
    'Zrain Developer Tools', 'Zrain Productivity Tools'
  ];
  for(const product of projectNames)
    assert.match(demoSection, new RegExp('<h3>' + product + '</h3>'));
  assert.equal((demoSection.match(/class="zc-demo"/g) || []).length, projectNames.length);
  for(const id of Object.keys(PRODUCTS))
    assert.match(demoSection, new RegExp('href="/\\?console=' + id + '"'));
  assert.match(demoSection, /<h3>Zrain Console<\/h3>/);
  assert.match(demoSection, /Try Console/);
  assert.match(demoSection, /href="\/" target="_top">Explore Ecosystem/);
  assert.match(page,/Source on GitHub/);
  assert.match(page,/iframe/);
  assert.match(css,/\.zc-hero/);
  assert.match(client,/new URLSearchParams\(window\.location\?\.search \|\| ""\)/);
  assert.match(client,/Object\.prototype\.hasOwnProperty\.call\(PRODUCTS, requestedDemo\)/);
  assert.doesNotMatch(client,/frame\.src = requestedDemo/);
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
