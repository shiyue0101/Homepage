// Each experience has one HTML template; switching entries preserves rich copy.
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
    updateProfessionalScrollbar();
  }
  list.addEventListener("click", (event) => {
    const item = event.target.closest(".prof-list-item");
    if (item && list.contains(item)) select(item);
  });
  const selected = list.querySelector(".selected");
  if (selected) select(selected);
}
function updateProfessionalScrollbar() {
  const section = document.getElementById("professional");
  if (section)
    section.style.overflowY =
      section.scrollHeight > section.clientHeight ? "auto" : "hidden";
}
