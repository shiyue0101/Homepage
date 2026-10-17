// 星空背景生成
const starBg = document.getElementById('star-bg');
function createStars(num = 120) {
  let html = '';
  for (let i = 0; i < num; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2 + 1;
    html += `<div class='star' style='left:${x}vw;top:${y}vh;width:${size}px;height:${size}px;'></div>`;
  }
  starBg.innerHTML = html;
}
createStars();

// A single greeting; page navigation is handled by the header.
document.addEventListener('DOMContentLoaded', () => {
  const text = [
    'Hi :)',
    'I am a master’s graduate in Computer Science from the University of Copenhagen, with a focus on Human-Computer Interaction.',
    'My interests include critical making, social computing, physical prototyping, and animal-computer interaction.',
    'I am particularly interested in how interactive systems shape people’s understanding, experiences, and relationships in everyday settings, and I enjoy combining empirical studies with design and prototyping.'
  ].join('\n\n');
  const introText = document.getElementById('intro-text');
  let position = 0;
  const timer = setInterval(() => {
    introText.textContent = text.slice(0, ++position);
    if (position >= text.length) finish();
  }, 15);
  function finish() {
    clearInterval(timer);
    introText.textContent = text;
    window.removeEventListener('keydown', skip);
  }
  function skip(event) {
    if (event.ctrlKey) finish();
  }
  window.addEventListener('keydown', skip);
});

const sections = {
  projects: document.getElementById('projects'),
  skills: document.getElementById('skills'),
  contact: document.getElementById('contact'),
  professional: document.getElementById('professional'),
  life: document.getElementById('life'),
};
const crtFlash = document.getElementById('crt-flash');
const backBtn = document.getElementById('back-btn');
const loadingOverlay = document.getElementById('loading-overlay');
let loadingHideTimer;

const pathToPage = {
  '/projects': 'projects',
  '/skills': 'skills',
  '/contact': 'contact',
  '/professional': 'professional',
  '/life': 'life',
};

function showLoading() {
  clearTimeout(loadingHideTimer);
  loadingOverlay?.classList.remove('hidden');
}

function hideLoading(delay = 0) {
  clearTimeout(loadingHideTimer);
  loadingHideTimer = setTimeout(() => {
    loadingOverlay?.classList.add('hidden');
    document.documentElement.classList.add('site-ready');
  }, delay);
}

function updateNavigation(page) {
  document.querySelectorAll('[data-nav-page]').forEach(link => {
    if (link.dataset.navPage === page) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

document.querySelector('.site-header').addEventListener('click', event => {
  const link = event.target.closest('a[data-nav-page]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (link.dataset.navPage === 'home') {
    showHome({ push: true, transition: true });
  } else {
    showSection(link.dataset.navPage, true);
  }
});

function applyHomeState() {
  updateNavigation('home');
  document.getElementById('main').style.display = 'flex';
  Object.values(sections).forEach(section => {
    section.classList.remove('active');
    section.classList.add('hidden');
  });
  backBtn.classList.remove('visible');

  document.getElementById('intro-dialog').style.removeProperty('display');

  document.getElementById('typewriter-tip').style.removeProperty('display');
}

// loading-policy: initial-navigation-only
// The HTML/CSS loading guard covers the first paint of each full document load.
// In-page navigation must never show the loading overlay again.
function showHome({ push = false, transition = false, initial = false } = {}) {
  const finish = () => {
    applyHomeState();
    crtFlash.classList.remove('active');
    if (push) history.pushState({}, '', '/');
    if (initial) hideLoading(0);
  };

  if (transition) {
    crtFlash.classList.add('active');
    setTimeout(finish, 200);
  } else {
    finish();
  }
}

function showSection(page, push = false, { initial = false, transition = true } = {}) {
  if (!sections[page]) return;
  if (transition) crtFlash.classList.add('active');
  const finish = () => {
    Object.values(sections).forEach(sec => {
      sec.classList.remove('active');
      sec.classList.add('hidden');
    });
    updateNavigation(page);
    document.getElementById('main').style.display = 'none';
    sections[page].classList.add('active');
    sections[page].classList.remove('hidden');
    document.getElementById('typewriter-tip').style.display = 'none';
    if (page === 'professional') updateProfessionalScrollbar();
    crtFlash.classList.remove('active');
    backBtn.classList.toggle('visible', !['projects', 'professional', 'contact', 'life'].includes(page));
    document.getElementById('intro-dialog').style.display = 'none';
    if (push) history.pushState({ page }, '', '/' + page);
    if (initial) hideLoading(0);
  };
  if (transition) setTimeout(finish, 200);
  else finish();
}

backBtn.addEventListener('click', () => {
  showHome({ push: true, transition: true });
});

// 路由处理
function handleRoute({ initial = false } = {}) {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const page = pathToPage[path] || 'home';
  if (page === 'home') {
    showHome({ initial });
  } else {
    showSection(page, false, { initial, transition: false });
  }
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function () {
  setupProfessionalList();
  handleRoute({ initial: true });
});

// 监听浏览器前进后退
window.addEventListener('popstate', () => handleRoute());

// 齿轮按钮（预留功能）
document.getElementById('gear-btn').addEventListener('click', () => {
  alert('Settings coming soon!');
});

// 像素星星样式
const style = document.createElement('style');
style.innerHTML = `.star {position: absolute; background: #fff; border-radius: 50%; opacity: .8;}`;
document.head.appendChild(style);

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

// 联系方式弹窗
const mailBtn = document.getElementById('contact-mail');
const mailModal = document.getElementById('contact-modal-mail');
const mailClose = document.querySelector('.contact-modal-close');
mailBtn && mailBtn.addEventListener('click', () => mailModal.classList.add('active'));
mailClose && mailClose.addEventListener('click', () => mailModal.classList.remove('active'));
window.addEventListener('click', e => {
  if (e.target === mailModal) mailModal.classList.remove('active');
});

// Professional Experience 列表交互
const professionalDetails = {
    itu: {
        title: 'IT University of Copenhagen',
        date: '08/2025 – 12/2025',
        role: 'Teaching Assistant for Distributed Systems',
        desc: [
            'Guided students through weekly exercises and live coding sessions, helping them understand technical concepts and complete programming assignments',
            'Participated in weekly teaching team meetings to coordinate teaching activities, share observations from grading, and adjust support strategies for students'
        ]
    },
  cph: {
    title: 'University of Copenhagen, Department of Computer Science',
    date: '02/2025 – 04/2025',
    role: 'Teaching Assistant for Advanced Topics in Human-Centered Computing',
    desc: [
      'Supported students by discussing course topics and answering questions during class sessions and office hours',
      'Co-graded and provided detailed feedback on 4 assignments for 43 students in collaboration with another teaching assistant'
    ]
  },
  bili: {
    title: 'Shanghai Bilibili Technology Ltd',
    date: '09/2022 – 02/2023',
    role: 'Intern, Internship in Front-end Development',
    desc: [
      'Developed a Chrome extension for the backend team to decode logs and display results inline when users select encoded text on specific URLs',
      'Integrated an external script for targeted messaging, based on discussions with product managers and insights from a user questionnaire, improving the overall user experience'
    ]
  },
  tongji: {
    title: 'Tongji University Art Centre',
    date: '03/2020 – 08/2022',
    role: 'Student Job, Assistant of Art Centre and Deputy Leader of Art Troupe',
    desc: [
      'Wrote and typeset articles for the official account to promote campus art activities, increasing followers from 6,295 to 15,754 within one year',
      'Conducted an online survey on improving school art events and analyzed 882 valid responses to identify preferences for activity types and timing among students and teachers'
    ]
  }
};

function setupProfessionalList() {
  const profList = document.querySelector('.prof-list');
  const profPanel = document.getElementById('prof-detail-panel');
  if (!profList || !profPanel) return;

  profList.addEventListener('click', event => {
    const item = event.target.closest('.prof-list-item');
    if (!item || !profList.contains(item)) return;

    const detail = professionalDetails[item.dataset.key];
    if (!detail) return;

    profList.querySelectorAll('.prof-list-item').forEach(otherItem => {
      otherItem.classList.remove('selected');
    });
    item.classList.add('selected');

    profPanel.innerHTML =
      `<div class='prof-detail-title'>${detail.title}<br><span class='prof-detail-date'>${detail.date}</span></div>` +
      `<div class='prof-detail-role'>${detail.role}</div>` +
      `<ul class='prof-detail-desc'>${detail.desc.map(text => `<li>${text}</li>`).join('')}</ul>`;

    updateProfessionalScrollbar();
  });
}

function updateProfessionalScrollbar() {
  const professionalSection = document.getElementById('professional');
  if (!professionalSection) return;

  professionalSection.style.overflowY =
    professionalSection.scrollHeight > professionalSection.clientHeight ? 'auto' : 'hidden';
}
