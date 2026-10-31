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
