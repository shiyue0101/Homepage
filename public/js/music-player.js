// Persistent player state for homepage navigation and standalone project pages.
(() => {
  "use strict";
  const shell = document.getElementById("site-floating-music");
  const audio = document.getElementById("site-music-audio");
  const button = document.getElementById("site-music-toggle");
  const state = document.getElementById("site-music-state");
  if (!shell || !audio || !button || !state) return;
  const KEY = "homepage-floating-music-state-v2";
  let saved = { playing: false, time: 0, x: null, y: null, volume: 0.34 };
  try {
    saved = { ...saved, ...JSON.parse(sessionStorage.getItem(KEY) || "{}") };
  } catch (_) {}
  audio.volume = Number.isFinite(saved.volume)
    ? Math.max(0, Math.min(1, saved.volume))
    : 0.34;
  const B = 54;
  let pos = { x: 0, y: 0 },
    dragging = false,
    wasDragged = false,
    dragStart = null,
    hover = false;
  let desiredPlaying = !!saved.playing;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function pin(x, y) {
    const size = window.innerWidth <= 520 ? 46 : B;
    pos.x = clamp(x, 6, Math.max(6, innerWidth - size - 6));
    pos.y = clamp(y, 6, Math.max(6, innerHeight - size - 6));
    shell.style.left = pos.x + "px";
    shell.style.top = pos.y + "px";
    const left = pos.x + size / 2 < innerWidth / 2;
    shell.classList.toggle("is-left", left);
    // The wrapper extends in a direction determined by which side it is on.
    // Keep the note exactly at the dragged point even when flex order changes.
    shell.style.transform = left
      ? "none"
      : "translateX(calc(-1 * (100% - " + size + "px)))";
  }
  function save() {
    const snapshot = {
      playing: desiredPlaying,
      time: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      x: pos.x,
      y: pos.y,
      volume: audio.volume,
    };
    try {
      sessionStorage.setItem(KEY, JSON.stringify(snapshot));
    } catch (_) {}
  }
  function refresh() {
    const playing = !audio.paused && !audio.ended;
    shell.classList.toggle("is-playing", playing);
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute(
      "aria-label",
      (playing ? "Pause" : "Play") + " The Poet Speaks",
    );
    state.textContent = playing ? "Now playing" : "Paused · Click to play";
  }
  const size = innerWidth <= 520 ? 46 : B;
  // On the right, right-facing panel is anchored by the note; on the left, note is at x.
  pin(
    Number.isFinite(saved.x) ? saved.x : innerWidth - size - 28,
    Number.isFinite(saved.y) ? saved.y : innerHeight - size - 28,
  );
  function expand(v) {
    if (!dragging) shell.classList.toggle("is-expanded", v);
  }
  shell.addEventListener("pointerenter", () => {
    hover = true;
    expand(true);
  });
  shell.addEventListener("pointerleave", () => {
    hover = false;
    expand(false);
  });
  shell.addEventListener("focusin", () => expand(true));
  shell.addEventListener("focusout", () => {
    if (!shell.contains(document.activeElement) && !hover) expand(false);
  });
  button.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    dragStart = {
      x: e.clientX,
      y: e.clientY,
      originX: pos.x,
      originY: pos.y,
      id: e.pointerId,
    };
    wasDragged = false;
    button.setPointerCapture(e.pointerId);
  });
  button.addEventListener("pointermove", (e) => {
    if (!dragStart || e.pointerId !== dragStart.id) return;
    const dx = e.clientX - dragStart.x,
      dy = e.clientY - dragStart.y;
    if (!dragging && Math.hypot(dx, dy) > 6) {
      dragging = true;
      wasDragged = true;
      shell.classList.add("is-dragging");
      shell.classList.remove("is-expanded");
    }
    if (dragging) pin(dragStart.originX + dx, dragStart.originY + dy);
  });
  let dragClickBlockUntil = 0;
  let suppressEdgeClickUntil = 0;
  // EDGE_DRAG_RELEASE_V2: finish consistently even when the button moves away from the pointer.
  const endDrag = (e) => {
    if (!dragStart) return;
    if (e && typeof e.pointerId === "number" && e.pointerId !== dragStart.id)
      return;
    const id = dragStart.id;
    dragStart = null;
    const moved = dragging || wasDragged;
    dragging = false;
    shell.classList.remove("is-dragging");
    if (moved) {
      wasDragged = true;
      suppressEdgeClickUntil = performance.now() + 500;
      shell.classList.remove("is-expanded");
      hover = false;
      save();
      setTimeout(() => {
        if (performance.now() >= suppressEdgeClickUntil) wasDragged = false;
      }, 550);
    }
    if (button.hasPointerCapture && button.hasPointerCapture(id)) {
      try {
        button.releasePointerCapture(id);
      } catch (_) {}
    }
  };
  button.addEventListener("pointerup", endDrag);
  button.addEventListener("pointercancel", endDrag);
  // Captured events reach window even when the cursor is away from the button.
  window.addEventListener("pointerup", endDrag, true);
  window.addEventListener("pointercancel", endDrag, true);
  window.addEventListener("blur", () => endDrag());
  button.addEventListener("lostpointercapture", () => {
    // Defer: native lostpointercapture often occurs while pointerup is dispatching.
    if (dragStart) endDrag();
  });

  // music-drag-click-guard-v1: pointerup may synthesize a click after dragging.
  // Capture it before the normal play/pause click handler can see it.
  button.addEventListener(
    "click",
    (e) => {
      if (wasDragged || Date.now() < dragClickBlockUntil) {
        e.preventDefault();
        e.stopImmediatePropagation();
        wasDragged = false;
      }
    },
    true,
  );
  // The generated click after a drag should not play/pause the audio.
  button.addEventListener(
    "click",
    (e) => {
      if (wasDragged || performance.now() < suppressEdgeClickUntil) {
        e.preventDefault();
        e.stopImmediatePropagation();
        wasDragged = false;
      }
    },
    true,
  );
  button.addEventListener("click", async (e) => {
    if (wasDragged) {
      e.preventDefault();
      wasDragged = false;
      return;
    }
    if (!audio.paused) {
      desiredPlaying = false;
      audio.pause();
      refresh();
      save();
      return;
    }
    try {
      desiredPlaying = true;
      await audio.play();
      refresh();
      save();
    } catch (_) {
      desiredPlaying = false;
      state.textContent = "Click again to play";
      save();
    }
  });
  const restoreTime = () => {
    if (Number.isFinite(saved.time) && saved.time > 0) {
      try {
        audio.currentTime = saved.time;
      } catch (_) {}
    }
  };
  audio.addEventListener("loadedmetadata", restoreTime, { once: true });
  // Attempt continuation on full page navigation. Some browsers block this without a fresh click.
  if (saved.playing) {
    const resume = async () => {
      restoreTime();
      try {
        await audio.play();
      } catch (_) {
        state.textContent = "Click ♫ to resume";
      }
      refresh();
    };
    if (audio.readyState >= 1) resume();
    else audio.addEventListener("loadedmetadata", resume, { once: true });
  }
  audio.addEventListener("play", () => {
    refresh();
    save();
  });
  audio.addEventListener("pause", () => {
    refresh();
    save();
  });
  audio.addEventListener("ended", () => {
    desiredPlaying = false;
    refresh();
    save();
  });
  audio.addEventListener("timeupdate", save);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") save();
  });
  window.addEventListener("pagehide", save);
  // MUSIC_RESIZE_VIEWPORT_RATIO_20261022
  // Scale position using the draggable area (not the old clamped pixels).
  let previousMusicViewport = { width: innerWidth, height: innerHeight };
  window.addEventListener("resize", () => {
    const oldSize = previousMusicViewport.width <= 520 ? 46 : B;
    const newSize = innerWidth <= 520 ? 46 : B;
    const oldRangeX = Math.max(1, previousMusicViewport.width - oldSize - 12);
    const oldRangeY = Math.max(1, previousMusicViewport.height - oldSize - 12);
    const newRangeX = Math.max(0, innerWidth - newSize - 12);
    const newRangeY = Math.max(0, innerHeight - newSize - 12);
    const fractionX = clamp((pos.x - 6) / oldRangeX, 0, 1);
    const fractionY = clamp((pos.y - 6) / oldRangeY, 0, 1);
    previousMusicViewport = { width: innerWidth, height: innerHeight };
    pin(6 + fractionX * newRangeX, 6 + fractionY * newRangeY);
    save();
  });
  refresh();
})();
