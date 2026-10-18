// 技能弹窗交互
const skillIcons = document.querySelectorAll('.skill-icon');
const skillModals = {
  python: document.getElementById('skill-modal-python'),
  java: document.getElementById('skill-modal-java'),
  cpp: document.getElementById('skill-modal-cpp'),
  js: document.getElementById('skill-modal-js'),
  arduino: document.getElementById('skill-modal-arduino'),
};
skillIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    const key = icon.getAttribute('data-skill');
    if (skillModals[key]) {
      skillModals[key].classList.add('active');
    }
  });
});
document.querySelectorAll('.skill-modal-close').forEach(btn => {
  btn.addEventListener('click', e => {
    e.target.closest('.skill-modal').classList.remove('active');
  });
});
window.addEventListener('click', e => {
  document.querySelectorAll('.skill-modal.active').forEach(modal => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});

