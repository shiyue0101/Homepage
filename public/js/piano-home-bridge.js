/* PIANO_HOME_V23_INTEGRATION: iframe -> existing site router. */
(() => {
  const frame = document.getElementById('piano-home-frame');
  if (!frame) return;
  const routes = { '/':'home', '/about':'about', '/projects':'projects',
    '/professional':'professional', '/life':'life', '/contact':'contact' };
  const normalize = () => {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    document.body.classList.toggle('yue-piano-home', path === '/');
  };
  const originalShowHome = window.showHome;
  const originalShowSection = window.showSection;
  // Route functions are global lexical bindings; scripts execute in order.
  window.addEventListener('message', e => {
    if (e.origin !== location.origin || e.source !== frame.contentWindow) return;
    const payload = e.data;
    if (!payload || payload.type !== 'yue-piano-navigation-v1') return;
    const page = routes[payload.path];
    if (!page) return;
    if (page === 'home') showHome({push:true,transition:true});
    else showSection(page,true);
    // Class change after the existing router's 200ms fade midpoint.
    setTimeout(normalize, 210);
  });
  // Handle navigation from the main site header and browser history.
  window.addEventListener('popstate', () => setTimeout(normalize, 0));
  document.querySelector('.site-header')?.addEventListener('click', e => {
    if (e.target.closest('a[data-nav-page]')) setTimeout(normalize, 210);
  });
  document.getElementById('back-btn')?.addEventListener('click', () => setTimeout(normalize,210));
  // Internal SPA project routing updates history separately.
  const originalPush = history.pushState;
  history.pushState = function(...args) {
    const result = originalPush.apply(this,args);
    queueMicrotask(normalize);
    return result;
  };
  normalize();
})();
