(() => {
  'use strict';
  if (document.getElementById('cat-yarn-intro')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hash = decodeURIComponent(location.hash || '').toLowerCase();
  if (hash && !['#home','#/','#!/home','#!/','#top'].includes(hash)) return;
  const currentPath = location.pathname.toLowerCase();
  if (/\/projects\/|\/project-/.test(currentPath)) return;

  const stage = document.createElement('div');
  stage.id = 'cat-yarn-intro';
  stage.setAttribute('aria-hidden','true');
  const canvas = document.createElement('canvas');
  stage.appendChild(canvas);
  document.body.appendChild(stage);

  const ctx = canvas.getContext('2d');
  if (!ctx) { stage.remove(); return; }

  const scriptUrl = document.currentScript?.src || new URL('/js/cat-entrance.js', location.href).href;
  const yarnBallImg = new Image();
  yarnBallImg.src = new URL('../assets/cat/yarn-ball.png?v=rose-20261018', scriptUrl).href;
  const imgs = Array.from({length: 6}, (_, i) => {
    const img = new Image();
    img.src = new URL(`../assets/cat/cat-frame-${i+1}.png`, scriptUrl).href;
    return img;
  });

  let raf = 0, start = null, w = 0, h = 0, dpr = 1, stopped = false, timeout = 0;
  const clamp = t => Math.max(0, Math.min(1, t));
  const smooth = t => { t = clamp(t); return t*t*(3-2*t); };

  function resize() {
    w = innerWidth; h = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  function point(t) {
    const x = -72 + (w + 188) * t;
    const y = h * 0.66 + Math.sin(t * 3.4 * Math.PI) * Math.min(h * 0.062, 50) + Math.sin(t * 7.1 * Math.PI) * Math.min(h * 0.017, 14);
    return { x, y };
  }

    // YARN_BALL_IMAGE_PATCH_V2
  function drawBall(x, y, angle, r) {
    if (yarnBallImg.complete && yarnBallImg.naturalWidth > 0) {
      const size = r * 3.2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.drawImage(yarnBallImg, -size / 2, -size / 2, size, size);
      ctx.restore();
      return;
    }
    // Simple fallback while the PNG loads.
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#f19aa0';
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function finish() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    stage.classList.add('is-done');
    removeEventListener('resize', resize);
    clearTimeout(timeout);
    // CAT TYPEWRITER SYNC EVENT BEGIN
    timeout = setTimeout(() => {
      stage.remove();
      window.dispatchEvent(new Event('cat-entrance-complete'));
    }, 900);
    // CAT TYPEWRITER SYNC EVENT END
  }

  function render(now) {
    if (stopped) return;
    if (start === null) start = now;
    const e = now - start;
    ctx.clearRect(0, 0, w, h);

    const ballDuration = 3600;
    const catStart = ballDuration * 0.4; // cat enters when ball has rolled about 65%
    const catDuration = 2600;
    const totalDuration = Math.max(ballDuration, catStart + catDuration) + 450;

    // yarn ball and line
    const bt = smooth(e / ballDuration);
    const p = point(bt);
    const radius = Math.max(16, Math.min(26, w * 0.023));
    ctx.beginPath();
    for (let k = 0; k <= 160; k++) {
      const t = bt * k / 160;
      const q = point(t);
      if (k === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
    }
    ctx.strokeStyle = '#ac7082';
    ctx.lineWidth = 2.3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    if (e < ballDuration + 250) drawBall(p.x, p.y, bt * 19.5, radius);

    // straight-running cat
    const ct = clamp((e - catStart) / catDuration);
    if (ct > 0 && ct < 1) {
      const frameInterval = 110;
      const imageIndex = Math.floor((e - catStart) / frameInterval) % 6;
      const image = imgs[imageIndex];
      const cw = Math.max(180, Math.min(w * 0.31, 360));
      const ch = cw * 396 / 611;
      const cx = -cw + (w + cw * 1.18) * smooth(ct);
      const floorY = h * 0.80;
      const bounceMap = [0, -4, 2, -42, -18, -6];
      const cy = floorY - ch + bounceMap[imageIndex];
      if (image.complete && image.naturalWidth) {
        ctx.drawImage(image, cx, cy, cw, ch);
      }
    }

    if (e >= totalDuration) {
      finish();
      return;
    }
    raf = requestAnimationFrame(render);
  }

  raf = requestAnimationFrame(render);
  addEventListener('pagehide', finish, { once: true });
  addEventListener('hashchange', () => {
    const nextHash = location.hash.toLowerCase();
    if (nextHash && !['#home','#/','#!/home','#!/','#top'].includes(nextHash)) finish();
  });
})();
