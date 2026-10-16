// Match the white star field on the main site.
const starBg = document.getElementById('star-bg');
for (let i = 0; i < 120; i++) {
  const star = document.createElement('span');
  const size = Math.random() * 2 + 1;
  star.style.cssText = `position:absolute;left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;width:${size}px;height:${size}px;background:#fff;border-radius:50%;opacity:.8;`;
  starBg.appendChild(star);
}
