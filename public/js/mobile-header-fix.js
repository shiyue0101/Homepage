/* homepage-mobile-header-fix-v2: remeasure after breakpoint changes */
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const root = document.documentElement;
  let raf = 0;
  function syncHeaderHeight() {
    raf = 0;
    // The old fix left an inline 116px custom property on :root.
    // Clear it before measuring so desktop's 76px CSS can take effect.
    root.style.removeProperty('--header-height');
    const measured = Math.ceil(header.getBoundingClientRect().height);
    if (measured > 0) {
      root.style.setProperty('--header-height', measured + 'px');
    }
  }
  function schedule() {
    if (raf) return;
    raf = window.requestAnimationFrame(syncHeaderHeight);
  }
  syncHeaderHeight();
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });
  document.fonts?.ready?.then(schedule);
})();
