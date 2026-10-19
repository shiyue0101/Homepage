(() => {
  "use strict";
  const root = document.documentElement;
  const overlay = document.getElementById("loading-overlay");
  if (!overlay) return;
  let finished = false;
  let safety;
  const reveal = () => {
    if (finished) return;
    finished = true;
    clearTimeout(safety);
    root.classList.add("project-paw-ready");
    // Retain the mask during the opacity transition.
    window.setTimeout(() => root.classList.add("project-paw-finished"), 360);
  };
  // Always unblock the visitor even if fonts or scripts never settle.
  safety = window.setTimeout(reveal, 3200);
  const run = async () => {
    try {
      if (document.fonts && document.fonts.ready) {
        await Promise.race([
          document.fonts.ready.catch(() => undefined),
          new Promise((resolve) => window.setTimeout(resolve, 1400)),
        ]);
      }
    } catch (_) {
      /* loading is never allowed to block navigation */
    }
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(reveal);
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
