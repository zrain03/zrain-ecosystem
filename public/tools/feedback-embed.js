/*
 * Fail / File: tool-runtime/src/feedback-embed.js
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (bukti awal daripada ZIP, tarikh asal belum disahkan)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Memaparkan maklum balas GitHub terasing mengikut produk tanpa token admin dalam browser.
 * EN: Displays product-isolated GitHub feedback without browser-side administrator tokens.
 */
/* Zrain Community Feedback: public GitHub Issue comments; no Zrain login, paid DB or admin token. */
(() => {
  'use strict';
  const threads = Object.freeze({
    'zrain-links':16, 'zrain-monitor':17, 'zrain-auth-starter':18,
    'zrain-ui':19, 'zrain-ecosystem':20, 'zrain-console':21,
    'zrain-image-tools':22, 'zrain-pdf-tools':23, 'zrain-document-tools':24,
    'zrain-developer-tools':25, 'zrain-productivity-tools':26
  });
  const loader = document.currentScript;
  // BM: node: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memaparkan maklum balas GitHub terasing mengikut produk tanpa token admin dalam browser. Input: tag, cls, value.
  // EN: node: Isolates one operation so it can be reviewed and tested. Module purpose: displays product-isolated GitHub feedback without browser-side administrator tokens. Inputs: tag, cls, value.
  function node(tag, cls, value) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (value !== undefined) e.textContent = value;
    return e;
  }
  // BM: allowed: Mengesahkan prasyarat atau syarat keselamatan sebelum meneruskan aliran. Tujuan modul: memaparkan maklum balas GitHub terasing mengikut produk tanpa token admin dalam browser. Input: url.
  // EN: allowed: Checks a precondition or safety invariant before allowing the flow to continue. Module purpose: displays product-isolated GitHub feedback without browser-side administrator tokens. Inputs: url.
  function allowed(url) {
    try {
      const a = new URL(url);
      return a.protocol === 'https:' && ['github.com','avatars.githubusercontent.com'].includes(a.hostname) ? a.href : null;
    } catch { return null; }
  }
  // BM: link: Mengasingkan satu langkah operasi supaya boleh disemak dan diuji. Tujuan modul: memaparkan maklum balas GitHub terasing mengikut produk tanpa token admin dalam browser. Input: text, href, cls.
  // EN: link: Isolates one operation so it can be reviewed and tested. Module purpose: displays product-isolated GitHub feedback without browser-side administrator tokens. Inputs: text, href, cls.
  function link(text, href, cls) {
    const a = node('a', cls, text);
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  }
  function mount() {
    const product = loader?.dataset.product || document.body?.dataset.feedbackProduct;
    const issueNo = threads[product];
    if (!issueNo) return; // No feedback widget for games, including Flutter Web games.
    let root = document.querySelector('[data-zrain-feedback]');
    if (!root) {
      root = node('section','zr-feedback'); root.dataset.zrainFeedback = '';
      const footer = document.querySelector('footer');
      if (footer) footer.before(root); else document.body.append(root);
    }
    if (root.dataset.mounted) return;
    root.dataset.mounted = '1'; root.classList.add('zr-feedback'); root.id = root.id || 'zrain-feedback';
    root.dataset.product = product;
    const issue = 'https://github.com/zrain03/zrain-ecosystem/issues/' + issueNo;
    const panel = node('section','zr-feedback__panel');
    panel.setAttribute('aria-label','Community feedback for ' + product);
    const head = node('div','zr-feedback__head'), header = node('div'), actions = node('div','zr-feedback__buttons');
    header.append(node('span','zr-feedback__eyebrow','Zrain • Community voices'),
      node('h2',null,'Feedback & transparency'),
      node('p','zr-feedback__intro','Real community comments for ' + product.replaceAll('-', ' ') + '. Suggestions, praise and constructive criticism are all welcome. No paid or fabricated testimonials.'));
    head.append(header);
    actions.append(link('Write a comment ↗',issue + '#issuecomment-new','zr-feedback__button'),
      link('Read on GitHub ↗',issue,'zr-feedback__button secondary'));
    const status = node('p','zr-feedback__status','Comments appear when you reach this section.');
    status.setAttribute('role','status');
    const list = node('div','zr-feedback__list'), paging = node('div','zr-feedback__toolbar');
    const info = node('p','zr-feedback__source','Anyone can read; commenting requires GitHub sign-in. Each Zrain web app has its own discussion. The Zrain repository owner can delete inappropriate comments on GitHub. Constructive negative feedback stays welcome. Do not share private information. ');
    info.append(link('View the original conversation ↗',issue,'zr-feedback__permalink'));
    panel.append(head,actions,status,list,paging,info); root.append(panel);
    let page = 1, busy = false;
    const refresh = node('button','zr-feedback__button secondary','Refresh comments');
    refresh.type = 'button';
    actions.append(refresh);
    // BM: showComment: Menyelaraskan UI dan state tanpa menggandakan event handler atau mencipta elemen tidak diperlukan. Tujuan modul: memaparkan maklum balas GitHub terasing mengikut produk tanpa token admin dalam browser. Input: item.
    // EN: showComment: Synchronizes UI and state without duplicating handlers or unnecessary elements. Module purpose: displays product-isolated GitHub feedback without browser-side administrator tokens. Inputs: item.
    function showComment(item) {
      if (!item || typeof item.body !== 'string') return;
      const card = node('article','zr-feedback__comment'), who = node('div','zr-feedback__who');
      const avatar = node('img','zr-feedback__avatar'); avatar.alt = ''; avatar.loading = 'lazy';
      avatar.width = 37; avatar.height = 37;
      avatar.src = allowed(item.user?.avatar_url) || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      const account = node('div');
      account.append(link(item.user?.login || 'GitHub user', allowed(item.user?.html_url) || issue,'zr-feedback__author'));
      const dt = Date.parse(item.created_at);
      account.append(node('small',null,(Number.isFinite(dt) ? new Date(dt).toLocaleDateString() : 'Date unavailable') + (item.user?.login === 'zrain03' ? ' · Zrain developer' : '')));
      who.append(avatar,account);
      card.append(who,node('p','zr-feedback__body',item.body.slice(0,12000)));
      const permalink = allowed(item.html_url);
      if (permalink) {
        const controls = node('div','zr-feedback__toolbar');
        controls.append(link('View comment on GitHub ↗',permalink,'zr-feedback__permalink'));
        card.append(controls);
      }
      list.append(card);
    }
    // BM: load: Mengambil rekod yang berkaitan dan mengembalikan hasil terhad kepada pemanggil. Tujuan modul: memaparkan maklum balas GitHub terasing mengikut produk tanpa token admin dalam browser.
    // EN: load: Reads relevant records and returns a bounded result to the caller. Module purpose: displays product-isolated GitHub feedback without browser-side administrator tokens.
    async function load() {
      if (busy) return;
      busy = true; paging.replaceChildren();
      status.textContent = 'Loading authentic comments…';
      try {
        const url = 'https://api.github.com/repos/zrain03/zrain-ecosystem/issues/' + issueNo + '/comments?per_page=30&page=' + page;
        const response = await fetch(url,{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
        if (!response.ok) throw new Error('GitHub HTTP ' + response.status);
        const rows = await response.json();
        if (!Array.isArray(rows)) throw new Error('Unexpected GitHub response');
        rows.forEach(showComment);
        page += 1;
        status.textContent = list.children.length ? 'Showing ' + list.children.length + ' genuine public comment(s).' : 'No public comments yet. You can be the first.';
        if (rows.length === 30) {
          const more = node('button','zr-feedback__button secondary','Load more comments');
          // BM: Event click: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
          // EN: click event: handle interaction without mutating source data or bypassing module validation.
          more.type='button'; more.addEventListener('click',load); paging.append(more);
        }
      } catch {
        status.textContent = 'Comments cannot be loaded here right now. You can still read or write on GitHub.';
        const retry = node('button','zr-feedback__button secondary','Try again');
        retry.type='button';retry.addEventListener('click',load);paging.append(retry);
      } finally { busy = false; }
    }
    // BM: Event click: kendalikan interaksi tanpa mengubah sumber data atau memintas validasi modul.
    // EN: click event: handle interaction without mutating source data or bypassing module validation.
    refresh.addEventListener('click',() => { if (busy) return; page = 1; list.replaceChildren(); load(); });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(e => e.isIntersecting)) return;
        observer.disconnect(); load();
      },{rootMargin:'250px'});
      observer.observe(root);
    } else { load(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
