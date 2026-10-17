// Match the white star field on the main site.
const starBg = document.getElementById('star-bg');
for (let i = 0; i < 120; i++) {
  const star = document.createElement('span');
  const size = Math.random() * 2 + 1;
  star.style.cssText = `position:absolute;left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;width:${size}px;height:${size}px;background:#fff;border-radius:50%;opacity:.8;`;
  starBg.appendChild(star);
}

// NOTION_PROJECT_TOC_START
// Uses each project's existing .case-toc links; no HTML edits needed.
(() => {
  const source = document.querySelector('.case-study > .case-toc');
  if (!source) return;
  const entries = [...source.querySelectorAll('a[href^="#"]')]
    .map(a => ({ label: a.textContent.trim(), id: decodeURIComponent(a.hash.slice(1)) }))
    .filter(item => item.id && document.getElementById(item.id));
  if (!entries.length) return;

  const nav = document.createElement('nav');
  nav.className = 'project-side-toc';
  nav.setAttribute('aria-label', 'Project section navigation');
  const lines = document.createElement('div');
  lines.className = 'toc-lines';
  lines.setAttribute('aria-hidden', 'true');
  const panel = document.createElement('div');
  panel.className = 'toc-panel';
  const title = document.createElement('p');
  title.className = 'toc-label';
  title.textContent = 'On this page';
  const links = document.createElement('div');
  links.className = 'toc-links';
  const anchors = [];
  const markers = [];
  entries.forEach((entry, index) => {
    const line = document.createElement('span');
    line.style.width = `${8 + (index % 3) * 4}px`;
    lines.appendChild(line);
    markers.push(line);
    const link = document.createElement('a');
    link.href = `#${encodeURIComponent(entry.id)}`;
    link.textContent = entry.label;
    link.addEventListener('click', event => {
      const target = document.getElementById(entry.id);
      if (!target) return;
      event.preventDefault();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', `#${encodeURIComponent(entry.id)}`);
    });
    links.appendChild(link);
    anchors.push(link);
  });
  panel.append(title, links);
  nav.append(lines, panel);
  document.body.appendChild(nav);
  document.body.classList.add('project-side-toc-ready');

  let pending = false;
  function updateCurrent() {
    pending = false;
    const offset = (document.querySelector('.site-header')?.getBoundingClientRect().height || 76) + 48;
    let current = 0;
    entries.forEach((entry, i) => {
      const el = document.getElementById(entry.id);
      if (el && el.getBoundingClientRect().top <= offset) current = i;
    });
    anchors.forEach((a, i) => {
      a.classList.toggle('is-active', i === current);
      if (i === current) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
      markers[i].classList.toggle('is-active', i === current);
    });
  }
  function schedule() {
    if (!pending) {
      pending = true;
      requestAnimationFrame(updateCurrent);
    }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  updateCurrent();
})();
// NOTION_PROJECT_TOC_END

// PROJECT_FLOATING_TOC_V2_START
(function () {
  function initFloatingProjectToc() {
    var article = document.querySelector('main.case-study');
    var original = article && article.querySelector('.case-toc');
    if (!original || document.querySelector('.project-floating-toc')) return;
    var items = Array.from(original.querySelectorAll('a[href^="#"]')).filter(function (a) {
      return a.hash && document.getElementById(decodeURIComponent(a.hash.slice(1)));
    });
    if (!items.length) return;

    var aside = document.createElement('nav');
    aside.className = 'project-floating-toc';
    aside.setAttribute('aria-label', 'Project sections');
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'project-floating-toc-toggle';
    toggle.setAttribute('aria-label', 'Open or close section navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
    aside.appendChild(toggle);
    var heading = document.createElement('div');
    heading.className = 'project-floating-toc-title';
    heading.textContent = 'ON THIS PAGE';
    aside.appendChild(heading);
    var links = document.createElement('div');
    links.className = 'project-floating-toc-links';
    items.forEach(function (source) {
      var a = document.createElement('a');
      a.href = source.getAttribute('href');
      a.textContent = source.textContent.trim();
      a.addEventListener('click', function (event) {
        var target = document.getElementById(a.getAttribute('href').slice(1));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', a.getAttribute('href'));
        if (window.innerWidth < 1350) { aside.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
      });
      links.appendChild(a);
    });
    aside.appendChild(links);
    document.body.appendChild(aside);
    toggle.addEventListener('click', function () {
      var open = aside.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '×' : '☰';
    });
    var floatingLinks = Array.from(links.querySelectorAll('a'));
    var sections = floatingLinks.map(function(a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var queued = false;
    function highlight() {
      queued = false;
      var cutoff = (document.querySelector('.site-header')?.getBoundingClientRect().height || 76) + 80;
      var idx = 0;
      sections.forEach(function (section, i) { if (section.getBoundingClientRect().top <= cutoff) idx = i; });
      floatingLinks.forEach(function (link, i) {
        if (i === idx) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    function schedule() { if (!queued) { queued = true; requestAnimationFrame(highlight); } }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    highlight();
    console.info('[Homepage] Project right-side TOC initialized:', items.length, 'sections');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFloatingProjectToc);
  else initFloatingProjectToc();
})();
// PROJECT_FLOATING_TOC_V2_END

// BEGIN TOC CLICK HIGHLIGHT LOCK
// Keep only the clicked TOC item highlighted while smooth scrolling.
(() => {
  const navSelector = '.project-floating-toc';
  const stateClasses = ['active', 'is-active', 'current'];
  let unlockTimer = null;
  let lockedLink = null;
  let observer = null;

  const getLinks = () => Array.from(
    document.querySelectorAll(`${navSelector} a[href^="#"]`)
  );

  function applyLock() {
    if (!lockedLink) return;
    const links = getLinks();
    if (!links.includes(lockedLink)) return;
    // Disconnect first so our own class edits do not trigger the observer.
    if (observer) observer.disconnect();
    for (const link of links) {
      const selected = link === lockedLink;
      for (const name of stateClasses) {
        // Match existing style conventions, but always set 'active' on target.
        if (name === 'active' || link.classList.contains(name)) {
          link.classList.toggle(name, selected);
        }
      }
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    if (observer) {
      for (const link of links) {
        observer.observe(link, {
          attributes: true,
          attributeFilter: ['class', 'aria-current']
        });
      }
    }
  }

  function unlock() {
    lockedLink = null;
    clearTimeout(unlockTimer);
    if (observer) observer.disconnect();
  }

  function scheduleUnlock() {
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(unlock, 260);
  }

  observer = new MutationObserver(() => {
    if (lockedLink) applyLock();
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest(`${navSelector} a[href^="#"]`);
    if (!link) return;
    const targetId = decodeURIComponent(link.hash.slice(1));
    if (!document.getElementById(targetId)) return;
    lockedLink = link;
    applyLock();
    // Other click listeners may update active classes after ours.
    queueMicrotask(applyLock);
    scheduleUnlock();
  }, true);

  window.addEventListener('scroll', () => {
    if (lockedLink) scheduleUnlock();
  }, { passive: true });

  // Fail-safe for browsers with delayed scroll events or interrupted animation.
  document.addEventListener('keydown', (event) => {
    if (lockedLink && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
      unlock();
    }
  });
})();
// END TOC CLICK HIGHLIGHT LOCK
