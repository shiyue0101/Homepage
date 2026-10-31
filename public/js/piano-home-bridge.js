// Accept navigation only from this page's piano iframe.
(() => {
  const frame = document.getElementById("piano-home-frame");
  if (!frame) return;
  window.addEventListener("message", (event) => {
    if (
      event.origin !== location.origin ||
      event.source !== frame.contentWindow
    )
      return;
    if (
      event.data?.type !== "yue-piano-navigation-v1" ||
      typeof event.data.path !== "string"
    )
      return;
    const page = HomepageRoutes.pageForPath(event.data.path);
    if (page === "home") showHome({ push: true, transition: true });
    else if (page) showSection(page, true);
  });
})();
