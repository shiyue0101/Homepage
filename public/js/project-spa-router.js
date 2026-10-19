/* PROJECT_SPA_ROUTER_V3: single parent navbar and audio; no intermediate Projects navigation. */
(() => {
  'use strict';
  const PROJECT_RE = /^\/projects\/(purrpost|masking-ball|turn-taking-band|makiwara|video-conference)\.html$/;
  const REGULAR = new Set(['/', '/projects', '/professional', '/life', '/contact', '/skills']);
  const header = document.querySelector('.site-header');
  if (!header || !document.getElementById('projects') || !document.getElementById('site-music-audio')) return;
  document.querySelectorAll('#spa-project-frame').forEach(el => el.remove());
  const frame = document.createElement('iframe');
  frame.id = 'spa-project-frame';
  frame.title = 'Project details';
  frame.hidden = true;
  document.body.appendChild(frame);
  const cache = new Map();
  const homeTitle = document.title;
  let activePath = null;
  let generation = 0;
  let loadingFrame = false;
  const isProject = p => PROJECT_RE.test(p);
  const plain = (e,a) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && !a.target && !a.hasAttribute('download');

  function hideFrame() {
    generation++;
    activePath = null;
    frame.hidden = true;
    document.documentElement.classList.remove('spa-project-open');
    document.title = homeTitle;
  }
  function regularPath(path, push = true) {
    if (!REGULAR.has(path)) return;
    hideFrame();
    // Call the existing Home router directly; do NOT briefly show Projects first.
    const page = path === '/' ? 'home' : path.slice(1);
    if (page === 'home' && typeof showHome === 'function') showHome({push:false, transition:false});
    else if (page !== 'home' && typeof showSection === 'function') showSection(page, false, {transition:false});
    else { location.assign(path); return; }
    if (push) history.pushState({page}, '', path);
    window.scrollTo(0,0);
  }
  function makeEmbed(source, url) {
    const doc = new DOMParser().parseFromString(source, 'text/html');
    if (!doc.querySelector('main.case-study')) throw new Error('Expected main.case-study');
    // Do not nest another header, music player, or loading overlay inside the project frame.
    doc.querySelectorAll('.site-header, #site-floating-music, #loading-overlay, [data-floating-music-v2]').forEach(el => el.remove());
    doc.querySelectorAll('script[src]').forEach(el => {
      if (/floating-music|project-(exit|paw)-loading|project-loading|project-spa-router/i.test(el.getAttribute('src') || '')) el.remove();
    });
    doc.documentElement.classList.add('site-ready');
    const base = doc.createElement('base');
    base.href = url;
    doc.head.insertBefore(base, doc.head.firstChild);
    const style = doc.createElement('style');
    style.textContent = ':root{--header-height:0px!important} .site-header,#site-floating-music,#loading-overlay{display:none!important} main.case-study{padding-top:32px!important} html,body{scroll-padding-top:0!important}';
    doc.head.appendChild(style);
    // Installed before other scripts: intercept every internal navigation while still in srcdoc.
    const guard = doc.createElement('script');
    guard.textContent = `(${function () {
      const allowed = /^\/(?:projects(?:\/(?:purrpost|masking-ball|turn-taking-band|makiwara|video-conference)\.html)?|professional|life|contact|skills)?\/?$/;
      document.addEventListener('click', function(e) {
        const a = e.target.closest('a[href]');
        if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
        const url = new URL(a.href, document.baseURI);
        if (url.origin !== new URL(document.baseURI).origin || !allowed.test(url.pathname)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        parent.postMessage({type:'homepage-project-spa-navigation-v3', path:url.pathname}, new URL(document.baseURI).origin);
      }, true);
    }.toString()})();`;
    doc.head.appendChild(guard);
    return '<!doctype html>\n' + doc.documentElement.outerHTML;
  }
  async function loadProject(path, {push=false}={}) {
    if (!isProject(path)) return false;
    const current = ++generation;
    try {
      if (!cache.has(path)) {
        const res = await fetch(path, {credentials:'same-origin'});
        if (!res.ok) throw new Error(`Project HTTP ${res.status}`);
        cache.set(path, makeEmbed(await res.text(), new URL(path, location.origin).href));
      }
      if (generation !== current) return true;
      if (push) history.pushState({project:path}, '', path);
      activePath = path;
      document.documentElement.classList.add('spa-project-open');
      document.querySelectorAll('[data-nav-page]').forEach(a => {
        if (a.dataset.navPage === 'projects') a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
      frame.hidden = false;
      loadingFrame = true;
      frame.srcdoc = cache.get(path);
      document.title = path.split('/').pop().replace('.html','').replaceAll('-',' ') + ' — Yue Shi';
      return true;
    } catch(err) {
      if (generation !== current) return false;
      console.error('[Project SPA] project load failed', err);
      if (push) location.assign(path);
      return false;
    }
  }
  // Capturing navigation at the parent stops main.js from applying another route afterward.
  header.addEventListener('click', event => {
    const a = event.target.closest('a[data-nav-page]');
    if (!activePath || !a || !plain(event,a)) return;
    const dest = new URL(a.href, location.href);
    if (dest.origin !== location.origin || !REGULAR.has(dest.pathname)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    regularPath(dest.pathname);
  }, true);
  document.addEventListener('click', event => {
    const a = event.target.closest('a[href]');
    if (!a || !plain(event,a)) return;
    const dest = new URL(a.href, location.href);
    if (dest.origin !== location.origin || !isProject(dest.pathname)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    loadProject(dest.pathname, {push:true});
  }, true);
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'homepage-project-spa-navigation-v3') return;
    const path = event.data.path;
    if (typeof path !== 'string') return;
    if (isProject(path)) loadProject(path, {push:true});
    else if (REGULAR.has(path)) regularPath(path);
  });
  // PROJECT_SPA_BREADCRUMB_GUARD_V4
  // A srcdoc frame can expose location.origin as "null" even when its links
  // resolve against the site's real origin. Capture in the parent as well.
  function interceptFrameNavigation(event) {
    const a = event.target?.closest?.('a[href]');
    if (!a || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || a.target || a.hasAttribute('download')) return;
    let destination;
    try { destination = new URL(a.href, frame.contentDocument.baseURI); }
    catch (_) { return; }
    if (destination.origin !== location.origin) return;
    const path = destination.pathname;
    if (!REGULAR.has(path) && !isProject(path)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (isProject(path)) loadProject(path, {push: true});
    else regularPath(path);
  }
  function bindFrameNavigation() {
    try {
      // window capture precedes document-level listeners in embedded scripts.
      const inner = frame.contentWindow;
      if (inner && inner.location.href === 'about:srcdoc') {
        inner.addEventListener('click', interceptFrameNavigation, true);
      }
    } catch(err) {
      console.warn('[Project SPA] Unable to attach frame navigation guard', err);
    }
  }

  frame.addEventListener('load', () => {
    bindFrameNavigation();
    if (!loadingFrame || !activePath) return;
    loadingFrame = false;
    // Guard against a full homepage accidentally navigating inside the iframe.
    try {
      if (frame.contentWindow.location.href !== 'about:srcdoc') {
        console.warn('[Project SPA] Unexpected iframe navigation; restoring outer router');
        regularPath('/projects');
      }
    } catch(err) { console.warn('[Project SPA] iframe navigation check', err); }
  });
  window.addEventListener('popstate', () => {
    const path = location.pathname;
    if (isProject(path)) loadProject(path);
    else hideFrame(); // main.js popstate handles normal content.
  });
  window.HomepageProjectRouter = {loadProject, hideFrame};
  if (isProject(location.pathname)) loadProject(location.pathname);
})();
