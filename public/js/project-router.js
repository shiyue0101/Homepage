// Embed project details while keeping the parent navigation and audio mounted.
(() => {
  "use strict";
  const REGULAR = new Set(HomepageRoutes.pagePaths);
  const header = document.querySelector(".site-header");
  if (
    !header ||
    !document.getElementById("projects") ||
    !document.getElementById("site-music-audio")
  )
    return;
  document.querySelectorAll("#spa-project-frame").forEach((el) => el.remove());
  let frame = document.createElement("iframe");
  frame.id = "spa-project-frame";
  frame.title = "Project details";
  frame.hidden = true;
  document.body.appendChild(frame);
  const cache = new Map();
  let activePath = null;
  let generation = 0;
  let loadingFrame = false;

  let pendingProjectToken = 0;
  let projectRevealFallback = null;
  function beginProjectReveal(token) {
    pendingProjectToken = token;
    clearTimeout(projectRevealFallback);
    document.documentElement.classList.add("spa-project-loading");
    // Hide the previous document *before* fetching the next one.
    frame.hidden = true;
    // Clear stale A now, so a delayed paint can never expose it while B loads.
    // Do not navigate the old iframe to about:blank; that can add a joint-history entry.
    loadingFrame = false;
    projectRevealFallback = setTimeout(() => {
      if (generation !== token || pendingProjectToken !== token) return;
      console.error(
        "[Project SPA] Timed out preparing project; falling back to standalone URL",
      );
      location.assign(activePath || location.pathname);
    }, 7000);
  }
  async function revealProject(token) {
    if (generation !== token || pendingProjectToken !== token || !activePath)
      return;
    try {
      const doc = frame.contentDocument;
      if (
        !doc ||
        doc.querySelector('meta[name="spa-project-request-token"]')?.content !==
          String(token)
      )
        return;
      // Wait for typography and a stable painted frame, not for every long image.
      if (doc.fonts && doc.fonts.ready)
        await Promise.race([
          doc.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 1600)),
        ]);
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      if (generation !== token || pendingProjectToken !== token || !activePath)
        return;
      clearTimeout(projectRevealFallback);
      loadingFrame = false;
      document.documentElement.classList.remove("spa-project-loading");
    } catch (error) {
      console.warn("[Project SPA] Reveal check:", error);
      if (generation === token) {
        clearTimeout(projectRevealFallback);
        document.documentElement.classList.remove("spa-project-loading");
      }
    }
  }
  const isProject = HomepageRoutes.isProject;
  const plain = (e, a) =>
    e.button === 0 &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.altKey &&
    !e.shiftKey &&
    !a.target &&
    !a.hasAttribute("download");

  function hideFrame() {
    generation++;
    activePath = null;
    frame.hidden = true;
    pendingProjectToken = 0;
    clearTimeout(projectRevealFallback);
    document.documentElement.classList.remove("spa-project-loading");
    frame.remove(); // Remove the browsing context instead of navigating it.
    document.documentElement.classList.remove("spa-project-open");
    HomepageRoutes.sync();
  }
  function regularPath(path, push = true) {
    if (!REGULAR.has(path)) return;
    // SITE_SOFT_TRANSITIONS_PROJECT_EXIT_V1
    // Delay closing the iframe until the fade curtain covers its last frame.
    if (
      activePath &&
      window.HomepageSoftTransition &&
      !regularPath.__softBypass
    ) {
      window.HomepageSoftTransition.run(() => {
        regularPath.__softBypass = true;
        try {
          regularPath(path, push);
        } finally {
          regularPath.__softBypass = false;
        }
      });
      return;
    }
    hideFrame();
    // Call the existing Home router directly; do NOT briefly show Projects first.
    const page = path === "/" ? "home" : path.slice(1);
    if (page === "home" && typeof showHome === "function")
      showHome({ push: false, transition: false });
    else if (page !== "home" && typeof showSection === "function")
      showSection(page, false, { transition: false });
    else {
      location.assign(path);
      return;
    }
    if (push) history.pushState({ page }, "", path);
    window.scrollTo(0, 0);
  }
  function makeEmbed(source, url) {
    const doc = new DOMParser().parseFromString(source, "text/html");
    if (!doc.querySelector("main.case-study"))
      throw new Error("Expected main.case-study");
    // Do not nest another header, music player, or loading overlay inside the project frame.
    doc
      .querySelectorAll(
        ".site-header, #site-floating-music, #loading-overlay, [data-music-player]",
      )
      .forEach((el) => el.remove());
    doc.querySelectorAll("script[src]").forEach((el) => {
      if (
        /music-player|floating-music|project-(exit|paw)-loading|project-loading|project-spa-router/i.test(
          el.getAttribute("src") || "",
        )
      )
        el.remove();
    });
    doc.documentElement.classList.add("site-ready");
    const base = doc.createElement("base");
    base.href = url;
    doc.head.insertBefore(base, doc.head.firstChild);
    const style = doc.createElement("style");
    style.textContent =
      ":root{--header-height:0px!important} .site-header,#site-floating-music,#loading-overlay{display:none!important} main.case-study{padding-top:32px!important} html,body{scroll-padding-top:0!important}";
    doc.head.appendChild(style);
    // Installed before other scripts: intercept every internal navigation while still in srcdoc.
    const guard = doc.createElement("script");
    guard.textContent = `(${function () {
      const allowed =
        /^\/(?:projects(?:\/(?:purrpost|masking-ball|turn-taking-band|makiwara|video-conference)\.html)?|professional|life|contact|skills|about)?\/?$/;
      document.addEventListener(
        "click",
        function (e) {
          const a = e.target.closest("a[href]");
          if (
            !a ||
            e.button !== 0 ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            a.target ||
            a.hasAttribute("download")
          )
            return;
          const url = new URL(a.href, document.baseURI);
          const current = new URL(document.baseURI);
          if (url.hash && url.pathname === current.pathname) {
            e.preventDefault();
            document
              .getElementById(decodeURIComponent(url.hash.slice(1)))
              ?.scrollIntoView({
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "auto"
                  : "smooth",
                block: "start",
              });
            return;
          }
          if (
            url.origin !== new URL(document.baseURI).origin ||
            !allowed.test(url.pathname)
          )
            return;
          e.preventDefault();
          e.stopImmediatePropagation();
          parent.postMessage(
            { type: "homepage-project-spa-navigation-v3", path: url.pathname },
            new URL(document.baseURI).origin,
          );
        },
        true,
      );
    }.toString()})();`;
    doc.head.appendChild(guard);
    return "<!doctype html>\n" + doc.documentElement.outerHTML;
  }
  async function loadProject(path, { push = false } = {}) {
    if (!isProject(path)) return false;
    // PROJECT_IFRAME_HISTORY_FIX_V7
    // Exactly one top-level history entry per user-initiated project navigation.
    if (push && location.pathname !== path) {
      if (isProject(location.pathname) && !activePath) {
        history.replaceState({ page: "projects" }, "", "/projects");
      }
      history.pushState({ project: path }, "", path);
    }
    const current = ++generation;
    activePath = path;
    beginProjectReveal(current);
    try {
      if (!cache.has(path)) {
        const res = await fetch(path, { credentials: "same-origin" });
        if (!res.ok) throw new Error(`Project HTTP ${res.status}`);
        cache.set(
          path,
          makeEmbed(await res.text(), new URL(path, location.origin).href),
        );
      }
      if (generation !== current) return true;
      activePath = path;
      document.documentElement.classList.add("spa-project-open");
      document.querySelectorAll("[data-nav-page]").forEach((a) => {
        if (a.dataset.navPage === "projects")
          a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
      frame.remove();
      frame = document.createElement("iframe");
      frame.id = "spa-project-frame";
      frame.title = "Project details";
      frame.hidden = true;
      frame.addEventListener("load", onFrameLoad);
      loadingFrame = true;
      frame.srcdoc = cache
        .get(path)
        .replace(
          /<\/head>/i,
          '<meta name="spa-project-request-token" content="' +
            current +
            '"></head>',
        );
      document.body.appendChild(frame);
      frame.hidden = false;
      HomepageRoutes.sync(path);
      return true;
    } catch (err) {
      if (generation !== current) return false;
      clearTimeout(projectRevealFallback);
      document.documentElement.classList.remove("spa-project-loading");
      console.error("[Project SPA] project load failed", err);
      if (push) location.assign(path);
      return false;
    }
  }
  // Capturing navigation at the parent stops main.js from applying another route afterward.
  header.addEventListener(
    "click",
    (event) => {
      const a = event.target.closest("a[data-nav-page]");
      if (!activePath || !a || !plain(event, a)) return;
      const dest = new URL(a.href, location.href);
      if (
        dest.origin !== location.origin ||
        !REGULAR.has(HomepageRoutes.normalize(dest.pathname))
      )
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      regularPath(HomepageRoutes.normalize(dest.pathname));
    },
    true,
  );
  document.addEventListener(
    "click",
    (event) => {
      const a = event.target.closest("a[href]");
      if (!a || !plain(event, a)) return;
      const dest = new URL(a.href, location.href);
      if (dest.origin !== location.origin || !isProject(dest.pathname)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      // PROJECT_BACK_TO_LIST_20261022
      // When entering a detail from the visible Projects grid, make the previous
      // history entry /projects. Back must restore the grid, not an earlier route.
      const projectList = document.getElementById("projects");
      if (
        projectList &&
        !projectList.classList.contains("hidden") &&
        location.pathname !== "/projects" &&
        !isProject(location.pathname)
      ) {
        history.replaceState({ page: "projects" }, "", "/projects");
      }
      loadProject(dest.pathname, { push: true });
    },
    true,
  );
  window.addEventListener("message", (event) => {
    if (
      event.origin !== location.origin ||
      event.source !== frame.contentWindow ||
      event.data?.type !== "homepage-project-spa-navigation-v3"
    )
      return;
    const path = event.data.path;
    if (typeof path !== "string") return;
    if (isProject(path)) loadProject(path, { push: true });
    else if (REGULAR.has(path)) regularPath(path);
  });
  // PROJECT_SPA_BREADCRUMB_GUARD_V4
  // A srcdoc frame can expose location.origin as "null" even when its links
  // resolve against the site's real origin. Capture in the parent as well.
  function interceptFrameNavigation(event) {
    const a = event.target?.closest?.("a[href]");
    if (
      !a ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      a.target ||
      a.hasAttribute("download")
    )
      return;
    let destination;
    try {
      destination = new URL(a.href, frame.contentDocument.baseURI);
    } catch (_) {
      return;
    }
    if (destination.origin !== location.origin) return;
    const current = new URL(frame.contentDocument.baseURI);
    if (destination.hash && destination.pathname === current.pathname) {
      // A base URL makes native srcdoc anchor clicks load the standalone page.
      // Prevent that navigation; the inner TOC can still update its highlight.
      event.preventDefault();
      frame.contentDocument
        .getElementById(decodeURIComponent(destination.hash.slice(1)))
        ?.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      return;
    }
    const path = destination.pathname;
    if (!REGULAR.has(path) && !isProject(path)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (isProject(path)) loadProject(path, { push: true });
    else regularPath(path);
  }
  function bindFrameNavigation() {
    try {
      // window capture precedes document-level listeners in embedded scripts.
      const inner = frame.contentWindow;
      if (inner && inner.location.href === "about:srcdoc") {
        inner.addEventListener("click", interceptFrameNavigation, true);
      }
    } catch (err) {
      console.warn(
        "[Project SPA] Unable to attach frame navigation guard",
        err,
      );
    }
  }

  function onFrameLoad() {
    if (this !== frame) return;
    bindFrameNavigation();
    if (!loadingFrame || !activePath) return;
    const loadedToken = Number(
      frame.contentDocument?.querySelector(
        'meta[name="spa-project-request-token"]',
      )?.content,
    );
    if (!loadedToken || loadedToken !== pendingProjectToken) return;
    // Guard against a full homepage accidentally navigating inside the iframe.
    try {
      if (frame.contentWindow.location.href !== "about:srcdoc") {
        console.warn(
          "[Project SPA] Unexpected iframe navigation; restoring outer router",
        );
        regularPath("/projects");
      }
    } catch (err) {
      console.warn("[Project SPA] iframe navigation check", err);
    }
    revealProject(loadedToken);
  }
  // HOMEPAGE_HISTORY_RESTORE_V3
  window.addEventListener("popstate", () => {
    const path = HomepageRoutes.normalize(location.pathname);
    if (isProject(path)) {
      loadProject(path, { push: false });
      return;
    }
    hideFrame();
    // main.js also listens to popstate. Explicitly restore the visible
    // Projects section, rather than assuming that removing iframe is enough.
    if (path === "/projects" && typeof showSection === "function") {
      showSection("projects", false, { transition: false });
      document.documentElement.classList.remove(
        "spa-project-open",
        "spa-project-loading",
      );
    }
  });
  window.HomepageProjectRouter = { loadProject, hideFrame };
  if (isProject(location.pathname)) loadProject(location.pathname);
})();
