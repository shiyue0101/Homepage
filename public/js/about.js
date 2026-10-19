(() => {
  "use strict";
  const stories = [
    "I’m curious about how small design decisions influence the way people understand and experience technology.",
    "For me, Human-Computer Interaction is as much about asking thoughtful questions as it is about building useful systems.",
    "Critical making offers a way to think through materials, experiments, and the unexpected results of creating something tangible.",
    "Social computing interests me because technologies can shape how we relate to one another, not just what we do individually.",
    "Physical prototyping helps turn abstract interaction ideas into things that can be experienced, questioned, and refined.",
    "Animal-computer interaction encourages me to consider perspectives and relationships beyond human users.",
    "I enjoy combining empirical studies, design, and prototyping to explore how interactive systems become part of everyday life.",
  ];
  const keyboard = document.getElementById("keyboard"),
    keybed = document.getElementById("keybed"),
    scroll = document.getElementById("scroll"),
    lines = document.getElementById("lines"),
    empty = document.getElementById("empty"),
    counter = document.getElementById("count"),
    floatfield = document.getElementById("floatfield");
  let ctx,
    unlocked = 0,
    lastReveal = -1e9,
    held = new Set(),
    dragStart = null;
  const WHITE = 42,
    from = 36,
    to = 95,
    blackPitches = new Set([1, 3, 6, 8, 10]),
    labels = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  const whites = [];
  for (let m = from; m <= to; m++)
    if (!blackPitches.has(m % 12)) whites.push(m);
  const width = whites.length * WHITE;
  keybed.style.width = width + "px";
  let whiteIndex = 0;
  for (let m = from; m <= to; m++) {
    const black = blackPitches.has(m % 12),
      el = document.createElement("button");
    el.type = "button";
    el.className = black ? "black-key" : "white-key";
    const octave = Math.floor(m / 12) - 1;
    el.setAttribute("aria-label", labels[m % 12] + octave);
    el.dataset.note = m;
    if (black) {
      el.style.left = whiteIndex * WHITE - 11 + "px";
    } else {
      el.style.left = whiteIndex * WHITE + "px";
      el.style.width = WHITE + "px";
      if (m % 12 === 0) el.textContent = "C" + octave;
      whiteIndex++;
    }
    el.addEventListener("click", (e) => {
      if (e.detail === 0) play(m, el);
    });
    keybed.appendChild(el);
  }
  function piano(m) {
    try {
      ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime,
        f = 440 * Math.pow(2, (m - 69) / 12),
        gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
      gain.connect(ctx.destination);
      for (let i = 1; i <= 3; i++) {
        let osc = ctx.createOscillator(),
          g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f * i;
        g.gain.value = [0, 0.78, 0.15, 0.06][i];
        osc.connect(g);
        g.connect(gain);
        osc.start(now);
        osc.stop(now + 1.45);
      }
    } catch (e) {}
  }
  function symbol() {
    const type = Math.floor(Math.random() * 5);
    const stem = type !== 0,
      filled = type >= 2,
      flags = type >= 3 ? type - 2 : 0;
    return `<svg viewBox="0 0 48 68" aria-hidden="true"><ellipse cx="15" cy="49" rx="10" ry="6.7" transform="rotate(-22 15 49)" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2.7"/>${stem ? '<path d="M24 46 V9" stroke="currentColor" stroke-width="2.8" fill="none"/>' : ""}${flags >= 1 ? '<path d="M24 9 C44 13 42 29 28 37 C35 27 32 20 24 19 Z" fill="currentColor"/>' : ""}${flags >= 2 ? '<path d="M24 21 C43 26 41 42 27 47 C34 38 32 32 24 30 Z" fill="currentColor"/>' : ""}</svg>`;
  }
  function float() {
    const el = document.createElement("span");
    el.className = "floatnote";
    el.innerHTML = symbol();
    el.style.setProperty("--left", Math.round(8 + Math.random() * 78) + "%");
    el.style.setProperty("--size", Math.round(24 + Math.random() * 22) + "px");
    el.style.setProperty("--dur", 2.2 + Math.random() * 1.15 + "s");
    el.style.setProperty("--turn", Math.random() * 32 - 16 + "deg");
    floatfield.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }
  function focusLine(line) {
    const target =
      line.offsetTop + line.offsetHeight / 2 - scroll.clientHeight / 2;
    scroll.scrollTo({ top: target, behavior: "smooth" });
    setTimeout(updateFocus, 150);
  }
  function updateFocus() {
    const center = scroll.getBoundingClientRect().top + scroll.clientHeight / 2;
    for (const p of lines.children) {
      const r = p.getBoundingClientRect(),
        dist = Math.abs((r.top + r.bottom) / 2 - center),
        n = Math.min(1, dist / 165);
      p.style.setProperty("--fade", String(Math.max(0.17, 1 - n * 0.78)));
      p.style.setProperty("--blur", n * 1.5 + "px");
      p.style.setProperty("--scale", String(1 - n * 0.045));
    }
  }
  function reveal() {
    if (unlocked >= stories.length) return;
    empty.classList.add("hidden");
    const p = document.createElement("p");
    p.className = "story-line";
    p.textContent = stories[unlocked];
    p.style.opacity = "0";
    p.style.transition = "none";
    lines.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transition = "opacity .6s,transform .6s,filter .25s";
      p.style.opacity = "1";
      focusLine(p);
      setTimeout(updateFocus, 650);
    });
    unlocked++;
    counter.textContent =
      unlocked + " / " + stories.length + " research notes discovered";
  }
  function play(m, el) {
    piano(m);
    float();
    el.classList.add("active");
    setTimeout(() => el.classList.remove("active"), 160);
    const now = performance.now();
    if (unlocked === 0 || now - lastReveal > 800) {
      lastReveal = now;
      reveal();
    }
  }
  scroll.addEventListener("scroll", updateFocus, { passive: true });
  new ResizeObserver(updateFocus).observe(scroll);
  document.getElementById("reset").addEventListener("click", () => {
    unlocked = 0;
    lastReveal = -1e9;
    lines.innerHTML = "";
    empty.classList.remove("hidden");
    counter.textContent = "0 / 7 research notes discovered";
    scroll.scrollTop = 0;
  }); // All piano surfaces, including black and white keys, support drag-to-scroll.
  // Only a short press/release counts as a piano note; drags never play.
  keyboard.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const key = e.target.closest(".white-key,.black-key");
    dragStart = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      left: keyboard.scrollLeft,
      key,
      moved: false,
    };
    keyboard.classList.add("dragging");
    keyboard.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  keyboard.addEventListener("pointermove", (e) => {
    if (!dragStart || e.pointerId !== dragStart.id) return;
    const dx = e.clientX - dragStart.x,
      dy = e.clientY - dragStart.y;
    if (Math.hypot(dx, dy) > 8) dragStart.moved = true;
    if (dragStart.moved) keyboard.scrollLeft = dragStart.left - dx;
  });
  function finishDrag(e, cancelled = false) {
    if (!dragStart || e.pointerId !== dragStart.id) return;
    const original = dragStart;
    const dx = e.clientX - original.x,
      dy = e.clientY - original.y;
    dragStart = null;
    keyboard.classList.remove("dragging");
    if (keyboard.hasPointerCapture(e.pointerId))
      keyboard.releasePointerCapture(e.pointerId);
    if (
      !cancelled &&
      !original.moved &&
      Math.hypot(dx, dy) <= 8 &&
      original.key
    ) {
      play(Number(original.key.dataset.note), original.key);
    }
  }
  keyboard.addEventListener("pointerup", (e) => finishDrag(e));
  keyboard.addEventListener("pointercancel", (e) => finishDrag(e, true));
  keyboard.scrollLeft = Math.max(0, ((60 - from) / 12) * 7 * WHITE - 2 * WHITE);
})();

(() => {
  const counter = document.getElementById("count");
  if (!counter || counter.dataset.aboutInlineCompletion === "v2") return;
  counter.dataset.aboutInlineCompletion = "v2";
  const complete = "That's a little more about me ♡";
  let pending = null;
  const observer = new MutationObserver(() => {
    const content = counter.textContent.trim();
    if (content === complete) return;
    const match = content.match(
      /^(\d+)\s*\/\s*(\d+)\s+research notes discovered$/,
    );
    if (!match) return;
    clearTimeout(pending);
    const done = Number(match[2]) > 0 && Number(match[1]) >= Number(match[2]);
    if (!done) {
      counter.classList.remove("about-count-fading", "about-count-complete");
      return;
    }
    counter.classList.add("about-count-fading");
    pending = setTimeout(
      () => {
        // The visitor may have clicked Replay while the fade was in progress.
        const latest = counter.textContent
          .trim()
          .match(/^(\d+)\s*\/\s*(\d+)\s+research notes discovered$/);
        if (!latest || Number(latest[1]) < Number(latest[2])) return;
        counter.textContent = complete;
        counter.classList.add("about-count-complete");
        counter.classList.remove("about-count-fading");
      },
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 190,
    );
  });
  observer.observe(counter, {
    childList: true,
    characterData: true,
    subtree: true,
  });
})();
