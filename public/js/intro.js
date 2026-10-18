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
  // CAT TYPEWRITER SYNC BEGIN
  // The cat animation must finish before the first letter is typed.
  let timer = null;
  let started = false;
  let watchdog = null;
  const onCatFinished = () => startTyping();
  function startTyping() {
    if (started) return;
    started = true;
    window.dispatchEvent(new Event('home-typewriter-start'));
    clearTimeout(watchdog);
    window.removeEventListener('cat-entrance-complete', onCatFinished);
    timer = setInterval(() => {
      introText.textContent = text.slice(0, ++position);
      if (position >= text.length) finish();
    }, 15);
    window.addEventListener('keydown', skip);
  }
  function finish() {
    clearInterval(timer);
    introText.textContent = text;
    window.removeEventListener('keydown', skip);
  }
  function skip(event) {
    if (event.ctrlKey) finish();
  }
  const home = location.pathname.replace(/\/+$/, '') === '';
  const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const catInstalled = !!document.querySelector('script[src*="/js/cat-entrance.js"]');
  const supportedHash = ['', '#home', '#/', '#!/home', '#!/', '#top'].includes(decodeURIComponent(location.hash).toLowerCase());
  if (home && motionAllowed && catInstalled && supportedHash) {
    introText.textContent = '';
    window.addEventListener('cat-entrance-complete', onCatFinished, { once: true });
    // Fail-safe: a failed animation should never hide the introduction forever.
    watchdog = setTimeout(startTyping, 12000);
  } else {
    startTyping();
  }
  // CAT TYPEWRITER SYNC END
});

