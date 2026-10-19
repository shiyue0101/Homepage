/* homepage-mobile-header-fix-v1 */
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  let last = 0;
  function syncHeaderHeight() {
    const h = Math.ceil(header.getBoundingClientRect().height);
    if (h > 0 && h !== last) {
      last = h;
      document.documentElement.style.setProperty('--header-height', h + 'px');
    }
  }
  syncHeaderHeight();
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(header);
  }
  window.addEventListener('resize', syncHeaderHeight, {passive:true});
  document.fonts?.ready?.then(syncHeaderHeight);
})();
