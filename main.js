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

// 全局变量跟踪介绍状态
let globalIntroState = 0;

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
      globalIntroState = 1; // 更新全局状态
    } else {
      menuPanel.style.display = 'none';
      typeWriter(introBrief, () => {
        introArrow.style.visibility = 'visible';
        // 不显示菜单
      });
      introArrow.innerHTML = '<b>&#8595;</b>';
      introArrow.removeAttribute('title');
      introState = 0;
      globalIntroState = 0; // 更新全局状态
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

const pathToPage = {
  '/education': 'education',
  '/projects': 'projects',
  '/skills': 'skills',
  '/contact': 'contact',
  '/professional': 'professional',
};

function showSection(page, push = false) {
  // 显示加载遮罩
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('hidden');
  }

  crtFlash.classList.add('active');
  setTimeout(() => {
    Object.values(sections).forEach(sec => {
      sec.classList.remove('active');
      sec.classList.add('hidden');
    });
    sections[page].classList.add('active');
    sections[page].classList.remove('hidden');
    document.getElementById('typewriter-tip').style.display = 'none';
    // 修复 Education 详情不显示的问题：延迟绑定点击事件
    if (page === 'education') {
      const eduItems = document.querySelectorAll('.edu-inventory-item');
      eduItems.forEach(item => {
        item.onclick = null; // 解绑旧事件，防止重复绑定
        item.addEventListener('click', () => {
          const key = item.getAttribute('data-key');
          // 取消所有选中
          eduItems.forEach(i => i.classList.remove('selected'));
          // 选中当前
          item.classList.add('selected');
          if (key === 'mystery') {
            // 如果是问号格子，短暂高亮后自动取消选中，不弹窗
            setTimeout(() => {
              item.classList.remove('selected');
            }, 120);
            return;
          }
          // 显示弹窗
          const modal = document.getElementById(`edu-detail-${key}`);
          if (modal) modal.classList.add('active');
        });
      });
    } else if (page === 'professional') {
      setupProfessionalList();
    } else if (page === 'projects') {
      // 进入Project Experience页面时重置选中状态和详情面板
      const projectIcons = document.querySelectorAll('.project-icon');
      const projectPanel = document.getElementById('project-detail-panel');
      projectIcons.forEach(i => i.classList.remove('selected'));
      if (projectPanel) {
        projectPanel.innerHTML = '<div class="project-detail-placeholder">Click a project icon to view details</div>';
      }
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

    // 延迟隐藏加载遮罩
    setTimeout(() => {
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    }, 300);
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
  // 显示加载遮罩
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('hidden');
  }

  crtFlash.classList.add('active');
  setTimeout(() => {
    Object.values(sections).forEach(sec => {
      sec.classList.remove('active');
      sec.classList.add('hidden');
    });
    crtFlash.classList.remove('active');
    backBtn.classList.remove('visible');

    // 确保主页内容显示
    const main = document.getElementById('main');
    main.style.display = 'flex';

    // 检查当前显示的文本内容来决定是否显示菜单
    const introText = document.getElementById('intro-text');
    const currentText = introText.textContent || introText.innerText;
    const isDetailedContent = currentText.includes("currently a master's student") || currentText.includes("What do you want to know");

    if (isDetailedContent) {
      menuPanel.style.removeProperty('display'); // 移除内联样式，让CSS自然生效
      globalIntroState = 1; // 更新全局状态
    } else {
      menuPanel.style.display = 'none';
      globalIntroState = 0; // 更新全局状态
    }

    document.getElementById('intro-dialog').style.removeProperty('display');
    document.getElementById('cake').style.removeProperty('display');
    document.getElementById('typewriter-tip').style.removeProperty('display');

    history.pushState({}, '', '/');

    // 延迟隐藏加载遮罩
    setTimeout(() => {
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    }, 300);
  }, 200);
});

// 路由处理
function handleRoute() {
  const path = window.location.pathname;
  const page = pathToPage[path] || 'home';

  // 显示加载遮罩
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('hidden');
  }

  if (page === 'home') {
    // 首页逻辑
    document.getElementById('main').style.display = 'flex';
    Object.values(sections).forEach(sec => {
      sec.classList.remove('active');
      sec.classList.add('hidden');
    });
    backBtn.classList.remove('visible');

    // 检查当前显示的文本内容来决定是否显示菜单
    const introText = document.getElementById('intro-text');
    const currentText = introText.textContent || introText.innerText;
    const isDetailedContent = currentText.includes("currently a master's student") || currentText.includes("What do you want to know");

    if (isDetailedContent) {
      menuPanel.style.removeProperty('display'); // 移除内联样式，让CSS自然生效
      globalIntroState = 1; // 更新全局状态
    } else {
      menuPanel.style.display = 'none';
      globalIntroState = 0; // 更新全局状态
    }

    document.getElementById('intro-dialog').style.removeProperty('display');
    document.getElementById('cake').style.removeProperty('display');
    document.getElementById('typewriter-tip').style.removeProperty('display');

    // 延迟隐藏加载遮罩，让首页内容有时间初始化
    setTimeout(() => {
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    }, 800);
  } else {
    // 子页面逻辑
    document.getElementById('main').style.display = 'none';
    showSection(page, false);

    // 延迟隐藏加载遮罩，让页面内容有时间渲染
    setTimeout(() => {
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    }, 600);
  }
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function () {
  // 初始化路由
  handleRoute();

  // 其他初始化代码...
  setupProfessionalList();

  // 确保加载遮罩在页面完全加载后隐藏
  setTimeout(() => {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }, 1000);
});

// 监听浏览器前进后退
window.addEventListener('popstate', handleRoute);

// 齿轮按钮（预留功能）
document.getElementById('gear-btn').addEventListener('click', () => {
  alert('Settings coming soon!');
});

// 像素星星样式
const style = document.createElement('style');
style.innerHTML = `.star {position: absolute; background: #fff; border-radius: 50%; opacity: .8;}`;
document.head.appendChild(style);

// Education 弹窗交互
const eduDetailModals = {
  cph: document.getElementById('edu-detail-cph'),
  tongji: document.getElementById('edu-detail-tongji'),
  mystery: document.getElementById('edu-detail-mystery'),
};
const eduItems = document.querySelectorAll('.edu-inventory-item');
eduItems.forEach(item => {
  item.addEventListener('click', () => {
    const key = item.getAttribute('data-key');
    if (key === 'mystery') {
      item.classList.add('selected');
      setTimeout(() => {
        item.classList.remove('selected');
      }, 120);
      return;
    }

    const isSelected = item.classList.contains('selected');
    eduItems.forEach(i => i.classList.remove('selected'));

    if (isSelected) {
      const modal = document.getElementById(`edu-detail-${key}`);
      if (modal) {
        modal.classList.remove('active');
      }
      return;
    }

    item.classList.add('selected');
    const modal = document.getElementById(`edu-detail-${key}`);
    if (modal) {
      modal.classList.add('active');
    }
  });
});
document.querySelectorAll('.edu-detail-close').forEach(btn => {
  btn.addEventListener('click', e => {
    e.target.closest('.edu-detail-modal').classList.remove('active');
    // 关闭弹窗时取消所有选中
    document.querySelectorAll('.edu-inventory-item').forEach(i => i.classList.remove('selected'));
  });
});
window.addEventListener('click', e => {
  document.querySelectorAll('.edu-detail-modal.active').forEach(modal => {
    if (e.target === modal) {
      modal.classList.remove('active');
      // 点击弹窗外部关闭时也重置所有图标选中状态
      const eduItems = document.querySelectorAll('.edu-inventory-item');
      eduItems.forEach(i => i.classList.remove('selected'));
    }
  });
});

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
if (projectIcons.length && projectPanel) {
  projectIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const isSelected = icon.classList.contains('selected');
      projectIcons.forEach(i => i.classList.remove('selected'));
      if (isSelected) {
        // Deselect and clear panel
        projectPanel.innerHTML = '<div class="project-detail-placeholder">Click a project icon to view details</div>';
      } else {
        icon.classList.add('selected');
        const key = icon.getAttribute('data-project');
        const d = projectDetails[key];
        if (d) {
          projectPanel.innerHTML =
            `<div class='project-detail-title'>${d.title}</div>` +
            `<div class='project-detail-sub'>${d.sub}</div>` +
            `<div class='project-detail-desc'>${d.desc}</div>`;
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

// 联系方式彩蛋
const pcBtn = document.getElementById('contact-pc');
const easterModal = document.getElementById('contact-easter');
const easterClose = document.querySelector('.contact-easter-close');
const quotes = [
  '“Keep calm and code on!”',
  '“Pixel art, pixel heart.”',
  '“Every bug is a side quest.”',
  '“May your coffee be strong and your code bug-free.”',
  '“Adventure awaits in every line of code.”',
];
pcBtn && pcBtn.addEventListener('click', () => {
  if (easterModal) {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('easter-quote').textContent = q;
    easterModal.classList.add('active');
  }
});
window.addEventListener('click', e => {
  if (e.target === easterModal) easterModal.classList.remove('active');
});

document.addEventListener('DOMContentLoaded', function () {
  // Education 背包交互
  const eduItems = document.querySelectorAll('.edu-inventory-item');
  eduItems.forEach(item => {
    item.addEventListener('click', () => {
      const isSelected = item.classList.contains('selected');
      eduItems.forEach(i => i.classList.remove('selected'));

      if (isSelected) {
        // 如果点击的是已选中的图标，取消选中并关闭弹窗
        const key = item.getAttribute('data-key');
        const modal = document.getElementById(`edu-detail-${key}`);
        if (modal) {
          modal.classList.remove('active');
        }
      } else {
        // 选中新图标并显示弹窗
        item.classList.add('selected');
        const key = item.getAttribute('data-key');
        const modal = document.getElementById(`edu-detail-${key}`);
        if (modal) {
          modal.classList.add('active');
        }
      }
    });
  });
});

// Professional Experience 列表交互
function setupProfessionalList() {
  const profItems = document.querySelectorAll('.prof-list-item');
  const profPanel = document.getElementById('prof-detail-panel');
  const profDetails = {
    cph: {
      title: 'University of Copenhagen, Department of Computer Science',
      date: '02/2025 – 04/2025',
      role: "Part-Time, Teaching Assistant for Advanced Topics in Human-Centered Computing",
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
  if (profItems.length && profPanel) {
    profItems.forEach(item => {
      item.addEventListener('click', () => {
        profItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        const key = item.getAttribute('data-key');
        const d = profDetails[key];
        if (d) {
          profPanel.innerHTML =
            `<div class='prof-detail-title'>${d.title}<br><span class='prof-detail-date'>${d.date}</span></div>` +
            `<div class='prof-detail-role'>${d.role}</div>` +
            `<ul class='prof-detail-desc'>${d.desc.map(x => `<li>${x}</li>`).join('')}</ul>`;
        }
      });
    });
  }
  // 自动判断是否需要滚动条
  const professionalSection = document.getElementById('professional');
  if (professionalSection.scrollHeight <= professionalSection.clientHeight) {
    professionalSection.style.overflowY = 'hidden';
  } else {
    professionalSection.style.overflowY = 'auto';
  }
}
document.addEventListener('DOMContentLoaded', setupProfessionalList); 

function toggleProfessionalScrollbar() {
  const section = document.getElementById('professional');
  if (!section) return;

  // 强制刷新 layout（可选）
  section.style.overflowY = 'hidden';

  // 延迟判断是否溢出
  setTimeout(() => {
    if (section.scrollHeight > section.clientHeight) {
      section.style.overflowY = 'auto';
    } else {
      section.style.overflowY = 'hidden';
    }
  }, 0);
}

