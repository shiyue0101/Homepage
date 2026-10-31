// One controller owns the project TOC, scroll highlight, and pointer focus.
(() => {
  const source = document.querySelector("main.case-study > .case-toc");
  if (!source) return;
  const entries = [...source.querySelectorAll('a[href^="#"]')]
    .map((link) => ({
      label: link.textContent.trim(),
      target: document.getElementById(decodeURIComponent(link.hash.slice(1))),
    }))
    .filter((entry) => entry.target);
  if (!entries.length) return;
  const nav = document.createElement("nav");
  nav.className = "project-floating-toc";
  nav.setAttribute("aria-label", "Project sections");
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "project-floating-toc-toggle";
  toggle.setAttribute("aria-label", "Open or close section navigation");
  const heading = document.createElement("div");
  heading.className = "project-floating-toc-title";
  heading.textContent = "ON THIS PAGE";
  const list = document.createElement("div");
  list.className = "project-floating-toc-links";
  let lockedIndex = null;
  let unlockTimer;
  let queued = false;
  let pointerFocus = false;
  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "×" : "☰";
  }
  function select(index) {
    entries.forEach((entry, i) => {
      if (i === index) entry.link.setAttribute("aria-current", "location");
      else entry.link.removeAttribute("aria-current");
    });
  }
  function highlight() {
    queued = false;
    if (lockedIndex !== null) return;
    const cutoff =
      (document.querySelector(".site-header")?.getBoundingClientRect().height ||
        76) + 80;
    let current = 0;
    entries.forEach((entry, i) => {
      if (entry.target.getBoundingClientRect().top <= cutoff) current = i;
    });
    select(current);
  }
  function unlock() {
    clearTimeout(unlockTimer);
    lockedIndex = null;
    highlight();
  }
  function scheduleUnlock() {
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(unlock, 260);
  }
  entries.forEach((entry, index) => {
    const link = document.createElement("a");
    link.href = `#${encodeURIComponent(entry.target.id)}`;
    link.textContent = entry.label;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      lockedIndex = index;
      select(index);
      entry.target.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
      history.replaceState(null, "", link.getAttribute("href"));
      if (innerWidth < 1350) setOpen(false);
      scheduleUnlock();
    });
    entry.link = link;
    list.appendChild(link);
  });
  nav.append(toggle, heading, list);
  document.body.appendChild(nav);
  setOpen(false);
  toggle.addEventListener("click", () =>
    setOpen(!nav.classList.contains("is-open")),
  );
  nav.addEventListener("pointerdown", () => {
    pointerFocus = true;
  });
  nav.addEventListener("pointerleave", () => {
    if (pointerFocus && nav.contains(document.activeElement))
      document.activeElement.blur();
    pointerFocus = false;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") pointerFocus = false;
    if (
      lockedIndex !== null &&
      ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(
        event.key,
      )
    )
      unlock();
  });
  function schedule() {
    if (lockedIndex !== null) {
      scheduleUnlock();
      return;
    }
    if (!queued) {
      queued = true;
      requestAnimationFrame(highlight);
    }
  }
  document.addEventListener("scroll", schedule, {
    capture: true,
    passive: true,
  });
  window.addEventListener("resize", schedule, { passive: true });
  highlight();
})();
