// Shared star field for the homepage and project pages.
(() => {
  const background = document.getElementById('star-bg');
  if (!background) return;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 120; i++) {
    const star = document.createElement('span');
    const size = Math.random() * 2 + 1;
    star.className = 'star';
    star.style.cssText = `left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;width:${size}px;height:${size}px;`;
    fragment.appendChild(star);
  }
  background.appendChild(fragment);
})();
