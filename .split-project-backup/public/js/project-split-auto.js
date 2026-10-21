/* Move content images into their own scrollable rail; keep original page navigation. */
(() => {
  'use strict';
  const excluded = 'header,nav,footer,aside,.project-navigation,.project-nav,.project-toc,.toc,.sidebar,.modal,.lightbox,.split-project-media';
  const mediaQ = 'picture,img,video,iframe';
  const contentQ = '[data-project-content],.project-detail-content,.project-detail,.project-content,.project-main,.project-body,.project-section,.project-article,article,main';
  function eligible(m) {
    if (m.closest(excluded)) return false;
    if (m.tagName === 'IMG' && m.closest('picture')) return false;
    if (m.matches('.icon,.logo,[aria-hidden="true"]')) return false;
    const cs = getComputedStyle(m);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  }
  function mediaIn(el) { return [...el.querySelectorAll(mediaQ)].filter(eligible); }
  function textLength(el) {
    const c = el.cloneNode(true);
    c.querySelectorAll('header,nav,footer,aside,script,style,figcaption').forEach(x => x.remove());
    return (c.textContent || '').trim().length;
  }
  function findRoot() {
    const candidates = [...document.querySelectorAll(contentQ)].filter(el => !el.closest(excluded));
    // Prefer the deepest content container that covers the actual project's images and copy.
    let best = null, bestScore = -Infinity;
    candidates.forEach(el => {
      const ms = mediaIn(el);
      const tl = textLength(el);
      if (!ms.length || tl < 60) return;
      const depth = (() => { let n = el, d = 0; while (n.parentElement) { d++; n = n.parentElement; } return d; })();
      const score = ms.length * 12 + Math.min(tl, 2000) / 100 + depth * 0.5;
      if (score > bestScore) { bestScore = score; best = el; }
    });
    if (best) return best;
    // If text and media live in sibling sections, choose their common page container.
    return [...document.querySelectorAll('main,article,.project-content')].find(el => mediaIn(el).length) || null;
  }
  function isMostlyMedia(el) {
    if (!el || el.matches('main,article,section,[id],.project-content,.project-detail')) return false;
    if (el.querySelector('h1,h2,h3,h4,table,ul,ol,blockquote')) return false;
    const clone = el.cloneNode(true);
    clone.querySelectorAll('img,picture,video,iframe,svg,figcaption,script,style').forEach(x => x.remove());
    return (clone.textContent || '').trim().length < 45;
  }
  function blockFor(m, root) {
    const figure = m.closest('figure');
    if (figure && figure !== root && root.contains(figure)) return figure;
    let n = m;
    while (n.parentElement && n.parentElement !== root && isMostlyMedia(n.parentElement)) {
      n = n.parentElement;
    }
    return n;
  }
  function init() {
    if (document.querySelector('.split-project-root')) return;
    const root = findRoot();
    if (!root || !root.parentNode) { console.warn('[split-project] No matching content container.'); return; }
    // Exclude any project footer even if the template nests it in <main>.
    const footers = [...root.querySelectorAll('footer,.site-footer,.project-footer')];
    footers.forEach(f => root.parentNode.insertBefore(f, root.nextSibling));
    const candidates = mediaIn(root);
    const blocks = [];
    candidates.forEach(m => {
      const b = blockFor(m, root);
      if (blocks.some(x => x === b || x.contains(b))) return;
      for (let i = blocks.length - 1; i >= 0; i--) if (b.contains(blocks[i])) blocks.splice(i, 1);
      blocks.push(b);
    });
    if (!blocks.length) { console.warn('[split-project] No content images found.'); return; }
    const wrap = document.createElement('div'); wrap.className = 'split-project-root';
    const text = document.createElement('div'); text.className = 'split-project-text';
    const media = document.createElement('div'); media.className = 'split-project-media';
    text.setAttribute('aria-label', 'Project text');
    media.setAttribute('aria-label', 'Project images');
    root.parentNode.insertBefore(wrap, root);
    wrap.append(text, media);
    text.appendChild(root);
    blocks.forEach(b => { if (root.contains(b)) media.appendChild(b); });
    // Also center copyright which sits outside project content in typical templates.
    document.querySelectorAll('footer,.site-footer,.project-footer').forEach(f => f.classList.add('split-project-footer'));
    // Account for a fixed/sticky site header.  The image rail must begin BELOW it.
    // Also avoid relying on a hardcoded 86px header height (mobile/desktop differ).
    const headerBottom = () => {
      const hs = [...document.querySelectorAll('body > header,header.site-header,.site-header,.navbar,.site-nav')];
      return hs.reduce((bottom, h) => {
        const r = h.getBoundingClientRect();
        const style = getComputedStyle(h);
        if (r.height > 0 && r.top <= 12 && (style.position === 'fixed' || style.position === 'sticky')) {
          return Math.max(bottom, r.bottom);
        }
        return bottom;
      }, 0);
    };
    const recalc = () => {
      if (matchMedia('(max-width: 820px)').matches) {
        wrap.style.removeProperty('margin-top');
        wrap.style.removeProperty('--split-project-height');
        return;
      }
      // Clear previous adjustment before measuring: repeated resize won't compound it.
      wrap.style.marginTop = '0px';
      const navBottom = headerBottom();
      const desiredTop = navBottom + 22;
      const actualTop = wrap.getBoundingClientRect().top;
      const correction = Math.max(0, desiredTop - actualTop);
      wrap.style.marginTop = correction + 'px';
      const footer = document.querySelector('.split-project-footer');
      const footerHeight = footer ? Math.min(100, footer.getBoundingClientRect().height) : 0;
      const top = wrap.getBoundingClientRect().top;
      wrap.style.setProperty('--split-header-bottom', desiredTop + 'px');
      wrap.style.setProperty('--split-project-height', Math.max(180, innerHeight - top - footerHeight - 14) + 'px');
    };
    document.documentElement.classList.add('split-project-active');
    recalc();
    // Navigation anchors / browser scroll restoration can cause the gallery to start midway.
    // Reset only when initially opening a project, not during subsequent user scrolling.
    const resetInitialScroll = () => { text.scrollTop = 0; media.scrollTop = 0; };
    resetInitialScroll();
    requestAnimationFrame(resetInitialScroll);
    window.addEventListener('resize', recalc, { passive: true });
    window.addEventListener('pageshow', e => { if (e.persisted) recalc(); });
    console.info('[split-project] moved', media.children.length, 'image groups into right column');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
