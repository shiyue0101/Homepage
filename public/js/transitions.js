// SITE_SOFT_TRANSITIONS_V1: shared content-only transition. Keep audio/header mounted.
(() => {
  "use strict";
  const curtain = document.createElement("div");
  curtain.id = "site-soft-transition-curtain";
  curtain.setAttribute("aria-hidden", "true");
  document.body.appendChild(curtain);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let sequence = 0;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const paint = () =>
    new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  async function run(change) {
    const ticket = ++sequence;
    if (!reduced.matches) {
      curtain.classList.add("is-active");
      await wait(210);
    }
    if (ticket !== sequence) return;
    try {
      change();
    } finally {
      await paint();
      if (ticket === sequence) curtain.classList.remove("is-active");
    }
  }
  window.HomepageSoftTransition = { run };
  // Regular top-level navigation: handle only when not viewing a SPA project.
  // The project router handles its own exit via the same run() method.
  document.addEventListener(
    "click",
    (event) => {
      if (document.documentElement.classList.contains("spa-project-open"))
        return;
      const a = event.target.closest(".site-header a[data-nav-page]");
      if (
        !a ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        a.target ||
        a.hasAttribute("download")
      )
        return;
      const page = a.dataset.navPage;
      if (
        page !== "home" &&
        ![
          "about",
          "projects",
          "skills",
          "professional",
          "life",
          "contact",
        ].includes(page)
      )
        return;
      const target = page === "home" ? "/" : "/" + page;
      if (location.pathname === target) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      run(() => {
        if (page === "home") showHome({ push: true, transition: false });
        else showSection(page, true, { transition: false });
      });
    },
    true,
  );
})();
