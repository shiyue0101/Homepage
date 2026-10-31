/* Move content images into their own scrollable rail; keep original page navigation. */
(() => {
  "use strict";
  function init() {
    if (document.querySelector(".split-project-root")) return;
    const root = document.querySelector("main.case-study");
    if (!root || !root.parentNode) {
      console.warn("[split-project] No matching content container.");
      return;
    }
    // Exclude any project footer even if the template nests it in <main>.
    const footers = [
      ...root.querySelectorAll("footer,.site-footer,.project-footer"),
    ];
    footers.forEach((f) => root.parentNode.insertBefore(f, root.nextSibling));
    const blocks = [...root.querySelectorAll("figure")].filter((figure) =>
      figure.querySelector("img,picture,video,iframe"),
    );
    if (!blocks.length) {
      return;
    }
    const wrap = document.createElement("div");
    wrap.className = "split-project-root";
    const text = document.createElement("div");
    text.className = "split-project-text";
    const media = document.createElement("div");
    media.className = "split-project-media";
    text.setAttribute("aria-label", "Project text");
    media.setAttribute("aria-label", "Project images");
    root.parentNode.insertBefore(wrap, root);
    wrap.append(text, media);
    text.appendChild(root);
    blocks.forEach((b) => {
      if (root.contains(b)) media.appendChild(b);
    });
    // Also center copyright which sits outside project content in typical templates.
    document
      .querySelectorAll("footer,.site-footer,.project-footer")
      .forEach((f) => f.classList.add("split-project-footer"));
    // Account for a fixed/sticky site header.  The image rail must begin BELOW it.
    // Also avoid relying on a hardcoded 86px header height (mobile/desktop differ).
    const headerBottom = () => {
      const hs = [
        ...document.querySelectorAll(
          "body > header,header.site-header,.site-header,.navbar,.site-nav",
        ),
      ];
      return hs.reduce((bottom, h) => {
        const r = h.getBoundingClientRect();
        const style = getComputedStyle(h);
        if (
          r.height > 0 &&
          r.top <= 12 &&
          (style.position === "fixed" || style.position === "sticky")
        ) {
          return Math.max(bottom, r.bottom);
        }
        return bottom;
      }, 0);
    };
    const recalc = () => {
      if (matchMedia("(max-width: 820px)").matches) {
        wrap.style.removeProperty("margin-top");
        wrap.style.removeProperty("--split-project-height");
        return;
      }
      // Clear previous adjustment before measuring: repeated resize won't compound it.
      wrap.style.marginTop = "0px";
      const navBottom = headerBottom();
      const desiredTop = navBottom + 22;
      const actualTop = wrap.getBoundingClientRect().top;
      const correction = Math.max(0, desiredTop - actualTop);
      wrap.style.marginTop = correction + "px";
      const footer = document.querySelector(".split-project-footer");
      const footerHeight = footer
        ? Math.min(100, footer.getBoundingClientRect().height)
        : 0;
      const top = wrap.getBoundingClientRect().top;
      wrap.style.setProperty("--split-header-bottom", desiredTop + "px");
      wrap.style.setProperty(
        "--split-project-height",
        Math.max(180, innerHeight - top - footerHeight - 14) + "px",
      );
    };
    document.documentElement.classList.add("split-project-active");
    recalc();
    // Navigation anchors / browser scroll restoration can cause the gallery to start midway.
    // Reset only when initially opening a project, not during subsequent user scrolling.
    const resetInitialScroll = () => {
      text.scrollTop = 0;
      media.scrollTop = 0;
    };
    resetInitialScroll();
    requestAnimationFrame(resetInitialScroll);
    window.addEventListener("resize", recalc, { passive: true });
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) recalc();
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
