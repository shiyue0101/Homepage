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

document.addEventListener('DOMContentLoaded', function () {
  const introBrief = "Hi! I am Yue.";
  const introDetail = "I am currently a master's student at University of Copenhagen, studying Computer Science. I am particularly interested in human-computer interaction.\n\nWhat do you want to know about me?";
  const introText = document.getElementById('intro-text');
  const introArrow = document.getElementById('intro-arrow');
  let introState = 0;
  let typingTimeouts = [];
  let skipTypewriter = false;

  // 打字机函数，支持 \n -> <br>
  function typeWriter(text, callback) {
    clearTypewriter();
    introText.innerHTML = "";
    skipTypewriter = false;
    introArrow.style.visibility = 'hidden';

    const tokens = text.replace(/\n/g, "<br>").match(/<br>|./g);

    function showAll() {
      clearTypewriter();
      introText.innerHTML = tokens.join("");
      introArrow.style.visibility = 'visible';
      if (callback) callback();
    }

    // 监听Ctrl键
    function onKeyDown(e) {
      if (e.ctrlKey) {
        skipTypewriter = true;
        showAll();
        window.removeEventListener('keydown', onKeyDown);
      }
    }
    window.addEventListener('keydown', onKeyDown);

    tokens.forEach((token, i) => {
      const timeout = setTimeout(() => {
        if (skipTypewriter) return;
        introText.innerHTML += token;
        if (i === tokens.length - 1 && callback) {
          window.removeEventListener('keydown', onKeyDown);
          introArrow.style.visibility = 'visible';
          callback();
        }
      }, i * 50);
      typingTimeouts.push(timeout);
    });
  }

  function clearTypewriter() {
    typingTimeouts.forEach(t => clearTimeout(t));
    typingTimeouts = [];
  }

  // 初始打字显示
  menuPanel.style.display = 'none';
  typeWriter(introBrief, () => {
    introArrow.style.visibility = 'visible';
    // 不显示菜单（只有在 introDetail 阶段才显示）
  });

  // 点击箭头切换
  introArrow.addEventListener('click', () => {
    if (introState === 0) {
      menuPanel.style.display = 'none';
      typeWriter(introDetail, () => {
        const dialog = document.getElementById('intro-dialog');
        dialog.classList.add('move-up');
        setTimeout(() => {
          menuPanel.style.display = '';
          dialog.classList.remove('move-up');
        }, 500);
        introArrow.style.visibility = 'visible';
      });
      introArrow.innerHTML = '<b>&#8593;</b>';
      introArrow.removeAttribute('title');
      introState = 1;
    } else {
      menuPanel.style.display = 'none';
      typeWriter(introBrief, () => {
        introArrow.style.visibility = 'visible';
        // 不显示菜单
      });
      introArrow.innerHTML = '<b>&#8595;</b>';
      introArrow.removeAttribute('title');
      introState = 0;
    }
  });
});

// 菜单切换逻辑
const menuPanel = document.getElementById('menu-panel');
const sections = {
  education: document.getElementById('education'),
  projects: document.getElementById('projects'),
  skills: document.getElementById('skills'),
  contact: document.getElementById('contact'),
  professional: document.getElementById('professional'),
};
const crtFlash = document.getElementById('crt-flash');
const backBtn = document.getElementById('back-btn');
const loadingOverlay = document.getElementById('loading-overlay');
let loadingHideTimer;

const pathToPage = {
  '/education': 'education',
  '/projects': 'projects',
  '/skills': 'skills',
  '/contact': 'contact',
  '/professional': 'professional',
};

function showLoading() {
  clearTimeout(loadingHideTimer);
  loadingOverlay?.classList.remove('hidden');
}

function hideLoading(delay = 0) {
  clearTimeout(loadingHideTimer);
  loadingHideTimer = setTimeout(() => {
    loadingOverlay?.classList.add('hidden');
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

  const introText = document.getElementById('intro-text');
  const currentText = introText.textContent || introText.innerText;
  const isDetailedContent = currentText.includes("currently a master's student") ||
    currentText.includes('What do you want to know');

  if (isDetailedContent) {
    menuPanel.style.removeProperty('display');
  } else {
    menuPanel.style.display = 'none';
  }

  document.getElementById('intro-dialog').style.removeProperty('display');
  document.getElementById('cake').style.removeProperty('display');
  document.getElementById('typewriter-tip').style.removeProperty('display');
}

function showHome({ push = false, transition = false } = {}) {
  showLoading();

  const finish = () => {
    applyHomeState();
    crtFlash.classList.remove('active');

    if (push) {
      history.pushState({}, '', '/');
    }

    hideLoading(transition ? 300 : 800);
  };

  if (transition) {
    crtFlash.classList.add('active');
    setTimeout(finish, 200);
  } else {
    finish();
  }
}

function showSection(page, push = false) {
  showLoading();

  crtFlash.classList.add('active');
  setTimeout(() => {
    Object.values(sections).forEach(sec => {
      sec.classList.remove('active');
      sec.classList.add('hidden');
    });
    updateNavigation(page);
    document.getElementById('main').style.display = 'none';
    sections[page].classList.add('active');
    sections[page].classList.remove('hidden');
    document.getElementById('typewriter-tip').style.display = 'none';
    if (page === 'professional') {
      updateProfessionalScrollbar();
    } else if (page === 'projects') {
      // 进入Project Experience页面时重置选中状态和详情面板
      const projectIcons = document.querySelectorAll('.project-icon');
      projectIcons.forEach(i => i.classList.remove('selected'));
      resetProjectPanel();
    }

    crtFlash.classList.remove('active');
    backBtn.classList.add('visible');
    menuPanel.style.display = 'none';
    document.getElementById('intro-dialog').style.display = 'none';
    document.getElementById('cake').style.display = 'none';
    document.getElementById('typewriter-tip').style.display = 'none';
    if (push) {
      history.pushState({ page }, '', '/' + page);
    }

    hideLoading(300);
  }, 200);
}

menuPanel.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const page = e.target.getAttribute('data-page');
    if (sections[page]) {
      showSection(page, true);
    }
  }
});

backBtn.addEventListener('click', () => {
  showHome({ push: true, transition: true });
});

// 路由处理
function handleRoute() {
  const path = window.location.pathname;
  const page = pathToPage[path] || 'home';

  if (page === 'home') {
    showHome();
  } else {
    document.getElementById('main').style.display = 'none';
    showSection(page, false);
  }
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function () {
  setupEducation();
  setupProfessionalList();
  handleRoute();
});

// 监听浏览器前进后退
window.addEventListener('popstate', handleRoute);

// 齿轮按钮（预留功能）
document.getElementById('gear-btn').addEventListener('click', () => {
  alert('Settings coming soon!');
});

// 像素星星样式
const style = document.createElement('style');
style.innerHTML = `.star {position: absolute; background: var(--accent); border-radius: 50%; opacity: .22;}`;
document.head.appendChild(style);

// Education 弹窗交互：只在页面初始化时绑定一次
function setupEducation() {
  const inventory = document.querySelector('.edu-inventory-grid');
  if (!inventory) return;

  const closeEducationModals = () => {
    document.querySelectorAll('.edu-detail-modal').forEach(modal => {
      modal.classList.remove('active');
    });
    inventory.querySelectorAll('.edu-inventory-item').forEach(item => {
      item.classList.remove('selected');
    });
  };

  inventory.addEventListener('click', event => {
    const item = event.target.closest('.edu-inventory-item');
    if (!item || !inventory.contains(item)) return;

    const key = item.dataset.key;
    const isSelected = item.classList.contains('selected');
    closeEducationModals();

    if (key === 'mystery') {
      item.classList.add('selected');
      setTimeout(() => item.classList.remove('selected'), 120);
      return;
    }

    if (isSelected) return;

    item.classList.add('selected');
    document.getElementById(`edu-detail-${key}`)?.classList.add('active');
  });

  document.querySelectorAll('.edu-detail-close').forEach(button => {
    button.addEventListener('click', closeEducationModals);
  });

  window.addEventListener('click', event => {
    if (event.target.classList?.contains('edu-detail-modal')) {
      closeEducationModals();
    }
  });
}

// Project Experience左右分栏交互
const projectDetails = {
  purrpost: {
    title: 'PurrPost (Remote Pet Interaction)',
    sub: '2023',
    desc: 'A system for remote pet interaction, featuring a smart device and playful interface. <br><b>Fun:</b> Click the cat for a meow!'
  },
  maskingball: {
    title: 'Masking Ball',
    sub: '2022',
    desc: 'An interactive installation simulating neurodiversity and presence using masks and sensors.<br><b>Fun:</b> Click the mask to spin!'
  },
  turnband: {
    title: 'Turn-Taking Band',
    sub: '2022',
    desc: 'A wearable for supporting communication in hybrid work, visualizing turn-taking cues.<br><b>Fun:</b> Click the guitar for a riff!'
  },
  makiwara: {
    title: 'Makiwara DB & Device',
    sub: '2021',
    desc: 'Database and hardware improvements for martial arts training devices.<br><b>Fun:</b> Click the disk for a bounce!'
  }
};
const projectIcons = document.querySelectorAll('.project-icon');
const projectPanel = document.getElementById('project-detail-panel');

function updateProjectScrollbar() {
  if (!projectPanel) return;

  projectPanel.scrollTop = 0;
  projectPanel.classList.remove('is-scrollable');
  projectPanel.classList.toggle('is-scrollable', projectPanel.scrollHeight > projectPanel.clientHeight);
}

function resetProjectPanel() {
  if (!projectPanel) return;

  projectPanel.innerHTML = '<div class="project-detail-placeholder">Click a project icon to view details</div>';
  updateProjectScrollbar();
}

if (projectIcons.length && projectPanel) {
  projectIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const isSelected = icon.classList.contains('selected');
      projectIcons.forEach(i => i.classList.remove('selected'));
      if (isSelected) {
        resetProjectPanel();
      } else {
        icon.classList.add('selected');
        const key = icon.getAttribute('data-project');
        const d = projectDetails[key];
        if (d) {
          projectPanel.innerHTML =
            `<div class='project-detail-title'>${d.title}</div>` +
            `<div class='project-detail-sub'>${d.sub}</div>` +
            `<div class='project-detail-desc'>${d.desc}</div>`;
          updateProjectScrollbar();
        }
      }
    });
  });
}

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
  cph: {
    title: 'University of Copenhagen, Department of Computer Science',
    date: '02/2025 – 04/2025',
    role: 'Part-Time, Teaching Assistant for Advanced Topics in Human-Centered Computing',
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
