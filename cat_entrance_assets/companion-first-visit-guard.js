(() => {
  'use strict';
  if (window.__companionFirstVisitGuardV2) return;
  window.__companionFirstVisitGuardV2 = true;
  const main = document.getElementById('main');
  if (!main) return;
  const stageId = 'companion-cat-stage';
  const sitFile = new URL('cat_entrance_assets/sit-frame-4.png', document.baseURI).href;
  let started = false;
  let entranceFinished = false;
  let lastVisible = null;

  function visible() {
    return getComputedStyle(main).display !== 'none' &&
           getComputedStyle(main).visibility !== 'hidden';
  }
  function stage() { return document.getElementById(stageId); }
  function sprite() { return document.getElementById('companion-cat-sprite'); }
  function restoreSitting() {
    const cat = sprite();
    if (!cat) return;
    // Restore a final seated pose; no replay of the entry animation.
    cat.src = sitFile;
    cat.style.transform = 'none';
    cat.style.opacity = '1';
  }
  function sync() {
    const onHome = visible();
    const node = stage();
    if (!node) return;
    node.style.setProperty('display', onHome ? 'block' : 'none', 'important');
    if (onHome && lastVisible === false && started) {
      // If an entry was interrupted, returning still shows the seated cat.
      entranceFinished = true;
      restoreSitting();
    }
    lastVisible = onHome;
  }
  // The original typewriter emits this event once per full document load.
  window.addEventListener('home-typewriter-start', () => {
    started = true;
    requestAnimationFrame(sync);
  });
  const obs = new MutationObserver(sync);
  obs.observe(main, { attributes: true, attributeFilter: ['style', 'class'] });
  // After each route update from main.js, the observer synchronizes visibility.
  document.addEventListener('DOMContentLoaded', sync, { once: true });
  requestAnimationFrame(sync);
  window.addEventListener('pageshow', sync);
  window.addEventListener('popstate', () => requestAnimationFrame(sync));
  window.addEventListener('resize', sync, { passive: true });
})();
