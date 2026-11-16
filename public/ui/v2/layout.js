(() => {
  'use strict';
  const script = document.currentScript;
  const asset = name => new URL(name, script.src).href;
  const product = script.dataset.product || 'zrain-ecosystem';
  const noMenu = script.hasAttribute('data-no-menu');
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
      import(asset('runtime.mjs?v=feedback-20261116')),
      Promise.all([...(native ? [] : [stylesheet('reference.css')]), stylesheet('integration.css?v=feedback-20261116')])
    ]);
    if (native) {
      const top = document.querySelector('.zr-compact-v44 .zr-experience-top');
      if (!top) throw new Error('Native Zrain layout is missing.');
      if (noMenu) top.querySelector('.zr-compact-progress')?.remove();
      top.querySelector('.zr-sticker-field')?.remove();
      mountZrainStickers({root:top,footer:top.querySelector('.zr-compact-footer')});
      document.documentElement.dataset.zrainLayout = 'ready';
      return;
    }
    const content = document.querySelector('[data-zrain-content]') || document.querySelector('main');
    if (!content) throw new Error('Zrain product content is missing.');
    const links = noMenu ? [{label:'Home'},{label:'Feedback'}] : JSON.parse(script.dataset.menu || '[{"label":"Home","href":"/"},{"label":"Feedback","href":"#community"}]');
    if (links.length < 2) throw new Error('Zrain header requires at least two menu items.');
    document.documentElement.classList.add('zr-shared-page');
    for (const node of document.querySelectorAll('[data-zrain-header],[data-zrain-footer],[data-zrain-legacy]')) {
      node.classList.add('zr-original-hidden');
      if(node.matches('footer'))node.classList.remove('zrain-footer');
    }
    const views = links.map((link,index) => ({
      label:link.label,labelBM:link.labelBM || link.label,
      eyebrow:'',headline:[''],description:'',primary:'',feedback:index === links.length-1
    }));
    const api = mountZrainCompact({
      product:script.dataset.label || 'Zrain',
      communityId:product, miniGame:true, splash:true, views,
      onLanguageChange(language) {
        const i18n = window.ZrainI18n;
        if (i18n && i18n.lang !== language) i18n.setLanguage(language);
      },
      onThemeChange(theme) {
        if (product === 'zrain-ecosystem') document.body.dataset.theme = theme;
      }
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
    if (noMenu) progress.remove();
    function showActive(index) {
      steps.forEach((step,i) => {
        step.classList.toggle('is-current',index===i);
        if(i===index)step.setAttribute('aria-current','page');else step.removeAttribute('aria-current');
      });
      progress.style.setProperty('--progress',index/(steps.length-1)*100+'%');
    }
    let activeIndex = 0;
    function refreshActive() {
      const index = links.findIndex(link => link.view
        ? document.body.dataset.view===link.view
        : link.href && new URL(link.href,location.href).href===location.href);
      activeIndex = index < 0 ? 0 : index;
      showActive(activeIndex);
    }
    steps.forEach((step,index) => step.addEventListener('click', event => {
      event.stopImmediatePropagation();
      const link = links[index];
      if (link.view) {
        content.querySelector('[data-go="'+CSS.escape(link.view)+'"]')?.click();
        refreshActive();
      } else if (link.href) location.assign(new URL(link.href, location.href));
    },true));
    document.addEventListener('keydown', event => {
      if (noMenu || !progress.getClientRects().length || !event.altKey || event.ctrlKey || event.metaKey ||
          event.target.closest?.('input,textarea,select,[contenteditable]')) return;
      const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!offset) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      steps[activeIndex + offset]?.click();
    },true);
    window.addEventListener('hashchange',refreshActive);
    document.addEventListener('zrain:languagechange', refreshActive);
    new MutationObserver(refreshActive).observe(document.body,{attributes:true,attributeFilter:['data-view']});
    refreshActive();
    footer.querySelector('.zr-compact-contact button')?.addEventListener('click',event=>{
      event.stopImmediatePropagation();
      const fallback = new URL('https://zrain-community.web.app/product.html');
      fallback.searchParams.set('product',product);
      const section = slot.querySelector('#zrain-feedback, #community-feedback, #zrain-community');
      const destination = script.dataset.feedbackHref || (section ? '#' + section.id : fallback.href);
      const url = new URL(destination, location.href);
      location.assign(url);
    },true);
    await api.ready;
    document.documentElement.dataset.zrainLayout = 'ready';
  }
  start().catch(error => console.error('Zrain shared layout failed',error));
})();
