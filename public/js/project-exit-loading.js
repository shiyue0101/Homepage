/* project-exit-paw-loading-v1: leave standalone case-study pages gracefully */
(() => {
  'use strict';
  if (!document.querySelector('main.case-study')) return;
  let navigating = false;
  const icon = '<svg class="cat-paw-icon" viewBox="0 0 40 44" aria-hidden="true" focusable="false"><ellipse cx="5" cy="17" rx="4" ry="5" transform="rotate(-22 5 17)"/><ellipse cx="14" cy="8" rx="4" ry="5" transform="rotate(-10 14 8)"/><ellipse cx="26" cy="8" rx="4" ry="5" transform="rotate(10 26 8)"/><ellipse cx="35" cy="17" rx="4" ry="5" transform="rotate(22 35 17)"/><path d="M9 32 C9 25 14 22 20 22 C26 22 31 25 31 32 C31 38 26 40 20 39 C14 40 9 38 9 32Z"/></svg>';
  function overlay() {
    let el = document.getElementById('loading-overlay');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'loading-overlay';
    el.className = 'hidden';
    el.innerHTML = '<div class="loading-content cat-paw-loading" role="status" aria-live="polite" aria-label="Loading"><div class="cat-paw-track" aria-hidden="true">' + Array(6).fill('<span class="cat-paw-step">' + icon + '</span>').join('') + '</div><div class="loading-text">Loading...</div></div>';
    document.body.appendChild(el);
    return el;
  }
  function show() {
    const el = overlay();
    el.classList.remove('hidden');
    el.classList.add('project-exit-loading');
  }
  function reset() {
    navigating = false;
    const el = document.getElementById('loading-overlay');
    if (el) {
      el.classList.remove('project-exit-loading');
      // Do not override the arrival loader if it is still active.
      if (document.readyState === 'complete') el.classList.add('hidden');
    }
  }
  document.addEventListener('click', (event) => {
    if (navigating || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const a = event.target.closest && event.target.closest('a[href]');
    if (!a || a.hasAttribute('download') || a.target && a.target.toLowerCase() !== '_self') return;
    let url;
    try { url = new URL(a.href, location.href); } catch { return; }
    if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // local anchors
    // Only navigate to the actual website. Do not delay links to downloadable assets.
    if (/\.(?:pdf|zip|png|jpe?g|webp|svg|mp3|mp4|webm)$/i.test(url.pathname)) return;
    event.preventDefault();
    navigating = true;
    show();
    // Give the overlay at least two frames to appear before unloading the document.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setTimeout(() => location.assign(url.href), 100);
    }));
    // Safety fallback: navigation blocked by browser or extension.
    setTimeout(() => { if (document.visibilityState === 'visible') reset(); }, 3200);
  }, true);
  // Browser back/forward may restore the document from bfcache.
  addEventListener('pageshow', (event) => { if (event.persisted) reset(); });
})();
