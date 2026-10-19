// SITE_COPYRIGHT_FOOTER_V1: per-section footer; do not create one inside SPA iframe.
(() => {
  function insert() {
    ["projects", "professional", "life", "contact", "skills"].forEach((id) => {
      const section = document.getElementById(id);
      if (!section || section.querySelector(":scope > .site-copyright-footer"))
        return;
      const footer = document.createElement("footer");
      footer.className = "site-copyright-footer";
      footer.setAttribute("aria-label", "Copyright");
      footer.textContent = "© 2026 Yue Shi";
      section.appendChild(footer);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", insert, { once: true });
  } else insert();
})();
