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

  // Typewriter starts independently of any cat entrance animation.
  let timer = null;
  function finish() {
    clearInterval(timer);
    introText.textContent = text;
    window.removeEventListener('keydown', skip);
  }
  function skip(event) {
    if (event.ctrlKey) finish();
  }
  timer = setInterval(() => {
    introText.textContent = text.slice(0, ++position);
    if (position >= text.length) finish();
  }, 15);
  window.addEventListener('keydown', skip);
});

