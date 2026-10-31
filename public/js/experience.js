// Each experience has one HTML template; switching entries preserves rich copy.
function syncProfessionalPanelHeight() {
  const list = document.querySelector("#professional .prof-list");
  const panel = document.getElementById("prof-detail-panel");
  if (!list || !panel) return;

  // Desktop: the left list defines the shared height. The right panel scrolls
  // internally if the selected experience contains more content.
  if (window.matchMedia("(min-width: 1001px)").matches) {
    panel.style.height = `${list.offsetHeight}px`;
    panel.style.overflowY = "auto";
  } else {
    // Preserve the existing stacked, natural-height layout on smaller screens.
    panel.style.height = "";
    panel.style.overflowY = "";
  }
}

function setupProfessionalList() {
  const list = document.querySelector(".prof-list");
  const panel = document.getElementById("prof-detail-panel");
  if (!list || !panel) return;
  function select(item) {
    const template = document.getElementById("experience-" + item.dataset.key);
    if (!template) return;
    list
      .querySelectorAll(".prof-list-item")
      .forEach((entry) => entry.classList.toggle("selected", entry === item));
    panel.replaceChildren(template.content.cloneNode(true));
    syncProfessionalPanelHeight();
    updateProfessionalScrollbar();
  }
  list.addEventListener("click", (event) => {
    const item = event.target.closest(".prof-list-item");
    if (item && list.contains(item)) select(item);
  });
  window.addEventListener("resize", syncProfessionalPanelHeight);
  const selected = list.querySelector(".selected");
  if (selected) select(selected);
}
function updateProfessionalScrollbar() {
  const section = document.getElementById("professional");
  if (section)
    section.style.overflowY =
      section.scrollHeight > section.clientHeight ? "auto" : "hidden";
}


/* EXPERIENCE_EQUAL_HEIGHT_INITIAL_V3
   Sync right outer card to the LEFT list, including the first render. */
(function () {
  let scheduled = false;
  let watchingList = null;
  let listObserver = null;
  let watchingPanel = null;
  let panelObserver = null;

  function sync() {
    const list = document.querySelector('#professional .prof-list');
    const panel = document.querySelector('#professional .prof-detail-panel');
    if (!list || !panel) return;
    if (!window.matchMedia('(min-width: 761px)').matches) {
      panel.style.removeProperty('height');
      panel.style.removeProperty('max-height');
      return;
    }
    const height = Math.ceil(list.getBoundingClientRect().height);
    if (height > 0) {
      panel.style.setProperty('height', height + 'px', 'important');
      panel.style.setProperty('max-height', height + 'px', 'important');
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      sync();
    });
  }

  function installObservers() {
    const list = document.querySelector('#professional .prof-list');
    const panel = document.querySelector('#professional .prof-detail-panel');
    if (list && list !== watchingList) {
      if (listObserver) listObserver.disconnect();
      watchingList = list;
      if ('ResizeObserver' in window) {
        listObserver = new ResizeObserver(schedule);
        listObserver.observe(list);
      }
    }
    if (panel && panel !== watchingPanel) {
      if (panelObserver) panelObserver.disconnect();
      watchingPanel = panel;
      panelObserver = new MutationObserver(schedule);
      panelObserver.observe(panel, { childList: true });
    }
    schedule();
  }

  // Capture clicks before the site's selection handler, then sync after rendering.
  document.addEventListener('click', function (event) {
    if (event.target.closest('#professional .prof-list-item')) {
      requestAnimationFrame(schedule);
    }
  }, true);
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', installObservers);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) installObservers();
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installObservers);
  } else {
    installObservers();
  }
  // Rebind if SPA navigation rebuilds Experience nodes.
  const rootObserver = new MutationObserver(function () {
    const list = document.querySelector('#professional .prof-list');
    const panel = document.querySelector('#professional .prof-detail-panel');
    if (list !== watchingList || panel !== watchingPanel) installObservers();
  });
  if (document.documentElement) {
    rootObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
