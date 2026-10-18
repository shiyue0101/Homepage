(() => {
  'use strict';
  const supportedHash = ['', '#home', '#/', '#!/home', '#!/', '#top'].includes(decodeURIComponent(location.hash).toLowerCase());
  const homePath = location.pathname.replace(/\/+$/, '') === '' || /index\.html$/i.test(location.pathname);
  if (!supportedHash || !homePath) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 980) return;
  if (document.getElementById('companion-cat-stage')) return;

  const stage = document.createElement('div');
  stage.id = 'companion-cat-stage';
  stage.setAttribute('aria-hidden', 'true');
  const sprite = document.createElement('img');
  sprite.id = 'companion-cat-sprite';
  sprite.alt = '';
  stage.appendChild(sprite);
  document.body.appendChild(stage);

  const scriptUrl = document.currentScript?.src || new URL('cat_entrance_assets/companion-cat.js', location.href).href;
  // Use WALK frames for the companion cat entering from the right.
  const walkFrames = Array.from({ length: 6 }, (_, i) => new URL(`walk-frame-${i + 1}.png`, scriptUrl).href);
  const sitFrames = Array.from({ length: 4 }, (_, i) => new URL(`sit-frame-${i + 1}.png`, scriptUrl).href);
  [...walkFrames, ...sitFrames].forEach(src => { const img = new Image(); img.src = src; });

  let running = false;
  let raf = 0;
  let state = 'idle';
  let started = 0;
  let target = null;
  let baseWidth = 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  function findBubble() {
    const selectors = ['.speech-bubble','.intro-bubble','.intro-box','.intro-card','.about-box','.about-card','.dialog-box','.message-box','#intro-box','#about-box','#intro-card','#speech-bubble'];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.width > 260 && r.height > 180 && r.left < window.innerWidth * 0.72) return r;
    }
    return null;
  }

  function computeTarget() {
    const rect = findBubble();
    const width = clamp(window.innerWidth * 0.18, 190, 290);
    let left, bottom;
    if (rect) {
      left = Math.min(window.innerWidth - width * 0.92, rect.right + Math.max(28, window.innerWidth * 0.02));
      const baseline = rect.top + rect.height * 0.89;
      bottom = clamp(window.innerHeight - baseline, 34, window.innerHeight * 0.22);
    } else {
      left = window.innerWidth * 0.77;
      bottom = window.innerHeight * 0.13;
    }
    return { left, bottom, width };
  }

  function place(left, bottom, src, flip = false) {
    sprite.src = src;
    sprite.style.left = `${left}px`;
    sprite.style.bottom = `${bottom}px`;
    sprite.style.width = `${baseWidth}px`;
    sprite.style.transform = flip ? 'scaleX(-1)' : 'none';
    sprite.style.opacity = '1';
  }

  function cleanup() {
    running = false;
    state = 'idle';
    cancelAnimationFrame(raf);
    sprite.style.opacity = '0';
  }

  function tick(ts) {
    if (!running) return;
    if (!started) started = ts;
    const elapsed = ts - started;

    if (state === 'walk') {
      const duration = 3800;
      const t = clamp(elapsed / duration, 0, 1);
      const startLeft = window.innerWidth + baseWidth * 0.25;
      const left = startLeft + (target.left - startLeft) * ease(t);
      const frame = Math.floor(elapsed / 180) % walkFrames.length;
      place(left, target.bottom, walkFrames[frame], false);
      if (t >= 1) {
        state = 'sit';
        started = ts;
      }
    } else if (state === 'sit') {
      const frameDuration = 220;
      const idx = Math.min(Math.floor(elapsed / frameDuration), sitFrames.length - 1);
      place(target.left, target.bottom, sitFrames[idx], false);
      if (idx >= sitFrames.length - 1 && elapsed > frameDuration * (sitFrames.length - 1) + 100) {
        state = 'done';
      }
    } else if (state === 'done') {
      place(target.left, target.bottom, sitFrames[sitFrames.length - 1], false);
      return;
    }

    raf = requestAnimationFrame(tick);
  }

  function startSequence() {
    if (running) return;
    if (!document.body.contains(stage)) document.body.appendChild(stage);
    target = computeTarget();
    baseWidth = target.width;
    running = true;
    state = 'walk';
    started = 0;
    raf = requestAnimationFrame(tick);
  }

  window.addEventListener('home-typewriter-start', startSequence, { once: true });
  window.addEventListener('resize', () => {
    if (state === 'done') {
      target = computeTarget();
      baseWidth = target.width;
      place(target.left, target.bottom, sitFrames[sitFrames.length - 1], false);
    }
  }, { passive: true });
  window.addEventListener('hashchange', () => {
    const ok = ['', '#home', '#/', '#!/home', '#!/', '#top'].includes(decodeURIComponent(location.hash).toLowerCase());
    if (!ok) cleanup();
  });
})();
