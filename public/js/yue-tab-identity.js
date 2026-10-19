/* YUE_TAB_IDENTITY_V1: titles follow the actual browser URL, including SPA project routes. */
(() => {
  'use strict';
  const projectNames = {
    'purrpost': 'PurrPost',
    'makiwara': 'Makiwara',
    'masking-ball': 'Masking Ball',
    'turn-taking-band': 'Turn-Taking Band',
    'video-conference': 'Video Conference'
  };
  const pageNames = {
    '/': 'Yue Shi',
    '/projects': 'Yue | Projects',
    '/professional': 'Yue | Experience',
    '/life': 'Yue | Life',
    '/contact': 'Yue | Contact',
    '/skills': 'Yue | Skills'
  };
  const titleForPath = path => {
    const clean = path.replace(/\/+$/, '') || '/';
    if (Object.prototype.hasOwnProperty.call(pageNames, clean)) return pageNames[clean];
    const match = /^\/projects\/([a-z-]+)\.html$/.exec(clean);
    if (match && projectNames[match[1]]) return 'Yue | ' + projectNames[match[1]];
    return 'Yue Shi';
  };
  let updating = false;
  const update = () => {
    if (updating) return;
    const desired = titleForPath(location.pathname);
    if (document.title !== desired) {
      updating = true;
      document.title = desired;
      updating = false;
    }
  };
  window.YueTabTitle = { update, titleForPath };
  // Both native home navigation and the project SPA use History API.
  for (const name of ['pushState', 'replaceState']) {
    const original = history[name];
    history[name] = function (...args) {
      const result = original.apply(this, args);
      update();
      return result;
    };
  }
  window.addEventListener('popstate', update);
  window.addEventListener('pageshow', update);
  // The existing project router assigns document.title after changing the URL.
  // Correct that assignment without modifying project router or its audio lifecycle.
  const title = document.querySelector('head > title');
  if (title) new MutationObserver(update).observe(title, { childList: true, characterData: true, subtree: true });
  update();
})();
