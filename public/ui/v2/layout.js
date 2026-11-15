(() => {
  'use strict';
  const script = document.currentScript;
  const asset = name => new URL(name, script.src).href;
  const product = script.dataset.product || 'zrain-ecosystem';
  const native = script.hasAttribute('data-native');
  function stylesheet(name) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = asset(name);
      link.onload = resolve;
      link.onerror = reject;
      document.head.append(link);
    });
  }
  async function start() {
    const [{mountZrainCompact, mountZrainStickers}] = await Promise.all([
      import(asset('runtime.mjs')),
      Promise.all([stylesheet('integration.css'), ...(native ? [] : [stylesheet('reference.css')])])
    ]);
    if (native) {
      const top = document.querySelector('.zr-compact-v44 .zr-experience-top');
      if (!top) throw new Error('Native Zrain layout is missing.');
      top.querySelector('.zr-sticker-field')?.remove();
      mountZrainStickers({root:top,footer:top.querySelector('.zr-compact-footer')});
      return;
    }
    const content = document.querySelector('[data-zrain-content]') || document.querySelector('main');
    if (!content) throw new Error('Zrain product content is missing.');
    const links = JSON.parse(script.dataset.menu || '[{"label":"Home","href":"/"},{"label":"Feedback","href":"#community"}]');
    if (links.length < 2) throw new Error('Zrain header requires at least two menu items.');
    document.documentElement.classList.add('zr-shared-page');
    for (const node of document.querySelectorAll('[data-zrain-header],[data-zrain-footer],[data-zrain-legacy]')) {
      node.classList.add('zr-original-hidden');
    }
    const views = links.map((link,index) => ({
      label:link.label,labelBM:link.labelBM || link.label,
      eyebrow:'',headline:[''],description:'',primary:'',feedback:index === links.length-1
    }));
    const api = mountZrainCompact({
      product:script.dataset.label || 'Zrain',
      communityId:product, miniGame:true, splash:true, views
    });
    const shell = api.compactRoot;
    const hero = shell.querySelector('.zr-compact-hero');
    hero.classList.add('zr-original-hidden');
    const slot = document.createElement('div');
    slot.className = 'zr-shared-content';
    hero.after(slot);
    slot.append(content);
    const feedback = document.querySelector('#community-feedback');
    if (feedback && !content.contains(feedback)) slot.append(feedback);
    const footer = shell.querySelector('.zr-compact-footer');
    const steps = [...shell.querySelectorAll('.zr-progress-step')];
    const progress = shell.querySelector('.zr-compact-progress');
    function showActive(index) {
      steps.forEach((step,i) => {
        step.classList.toggle('is-current',index===i);
        if(i===index)step.setAttribute('aria-current','page');else step.removeAttribute('aria-current');
      });
      progress.style.setProperty('--progress',index/(steps.length-1)*100+'%');
    }
    function refreshActive() {
      const index = links.findIndex(link => link.view
        ? document.body.dataset.view===link.view
        : link.href && new URL(link.href,location.href).href===location.href);
      showActive(index < 0 ? 0 : index);
    }
    steps.forEach((step,index) => step.addEventListener('click', event => {
      event.stopImmediatePropagation();
      const link = links[index];
      if (link.view) {
        content.querySelector('[data-go="'+CSS.escape(link.view)+'"]')?.click();
        refreshActive();
      } else if (link.href) location.assign(new URL(link.href, location.href));
    },true));
    document.addEventListener('zrain:languagechange', refreshActive);
    new MutationObserver(refreshActive).observe(document.body,{attributes:true,attributeFilter:['data-view']});
    refreshActive();
    footer.querySelector('.zr-compact-contact button')?.addEventListener('click',event=>{
      event.stopImmediatePropagation();
      const url = new URL('https://zrain-community.web.app/product.html');
      url.searchParams.set('product',product);
      location.assign(url);
    },true);
    await api.ready;
  }
  start().catch(error => console.error('Zrain shared layout failed',error));
})();
