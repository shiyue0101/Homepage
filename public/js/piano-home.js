const notesLayer = document.getElementById("notes-layer");
const whiteKeysEl = document.getElementById("white-keys");
const piano = document.getElementById("piano");
const modeToggle = document.getElementById("mode-toggle");
const pianoShell = document.getElementById("piano-shell");
const modeStatus = document.getElementById("mode-status");
let navigationEnabled = true;
modeToggle.addEventListener("click", () => {
  navigationEnabled = !navigationEnabled;
  document
    .querySelector(".piano-floating-tooltip")
    ?.classList.remove("visible");
  modeToggle.setAttribute("aria-pressed", String(navigationEnabled));
  modeToggle.querySelector(".toggle-text").textContent = navigationEnabled
    ? "Navigation on"
    : "Free play";
  modeToggle.setAttribute(
    "aria-label",
    navigationEnabled
      ? "Switch to free play mode"
      : "Switch to navigation mode",
  );
  modeStatus.textContent = navigationEnabled
    ? "♪ Choose a section or play freely"
    : "All keys play music";
  pianoShell.classList.toggle("is-free", !navigationEnabled);
  document.getElementById("keyboard-note").textContent = navigationEnabled
    ? "Play a melody and get to know me  ♪  Navigation on: marked notes open pages"
    : "Play a melody and get to know me  ♪  Free play: every piano key plays a note";
});

// Full-size 88-key piano: MIDI 21 (A0) through MIDI 108 (C8).
// Natural keys are the white keys. A4 = MIDI 69 = 440 Hz.
const noteNames = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const whitePitchClasses = new Set([0, 2, 4, 5, 7, 9, 11]);
const whiteMidi = Array.from({ length: 88 }, (_, i) => i + 21).filter((midi) =>
  whitePitchClasses.has(midi % 12),
);
const formatNote = (midi) => noteNames[midi % 12] + (Math.floor(midi / 12) - 1);
// Spread navigation across the full keyboard, leaving every other note free to play.
const navigationNotes = [
  ["C4", "about", "About Me"],
  ["D4", "projects", "Projects"],
  ["F4", "experience", "Experience"],
  ["A4", "life", "Life"],
  ["C5", "contact", "Contact"],
];
const navMap = Object.fromEntries(
  navigationNotes.map(([note, view, label]) => {
    const index = whiteMidi.findIndex((midi) => formatNote(midi) === note);
    if (index < 0) throw new Error("Navigation note not found: " + note);
    return [index, { view, label }];
  }),
);
const keyboardViewport = document.getElementById("keyboard-viewport");
const keyboardTrack = document.getElementById("keyboard-track");
const freqFromMidi = (m) => 440 * Math.pow(2, (m - 69) / 12);
let suppressClickUntil = 0;

function showView(name) {
  const paths = {
    about: "/about",
    projects: "/projects",
    experience: "/professional",
    life: "/life",
    contact: "/contact",
    home: "/",
  };
  if (paths[name])
    window.parent.postMessage(
      { type: "yue-piano-navigation-v1", path: paths[name] },
      window.location.origin,
    );
}

// Tooltip is a sibling of the keys, so it can float above black keys
// without raising the hovered white key itself.
const floatingTooltip = document.createElement("span");
floatingTooltip.className = "piano-floating-tooltip";
floatingTooltip.setAttribute("aria-hidden", "true");
keyboardTrack.appendChild(floatingTooltip);
function showKeyTooltip(key, label) {
  if (!navigationEnabled) return;
  floatingTooltip.textContent = label;
  floatingTooltip.style.left = `${key.offsetLeft + key.offsetWidth / 2}px`;
  floatingTooltip.classList.add("visible");
}
function hideKeyTooltip() {
  floatingTooltip.classList.remove("visible");
}

function createWhiteKeys() {
  whiteMidi.forEach((midi, i) => {
    const btn = document.createElement("button");
    const note = formatNote(midi);
    btn.type = "button";
    btn.className = "white-key";
    btn.dataset.index = i;
    if (navMap[i]) {
      btn.classList.add("nav");
      const tag = document.createElement("span");
      tag.className = "key-tooltip";
      tag.textContent = navMap[i].label;
      btn.appendChild(tag);
      btn.addEventListener("mouseenter", () =>
        showKeyTooltip(btn, navMap[i].label),
      );
      btn.addEventListener("mouseleave", hideKeyTooltip);
      btn.addEventListener("focus", () => showKeyTooltip(btn, navMap[i].label));
      btn.addEventListener("blur", hideKeyTooltip);
    }
    btn.setAttribute(
      "aria-label",
      note + (navMap[i] ? ": " + navMap[i].label + " (navigation on)" : ""),
    );
    const name = document.createElement("span");
    name.className = "note-name";
    name.textContent = note;
    btn.appendChild(name);
    btn.addEventListener("click", () => {
      if (performance.now() < suppressClickUntil) return;
      activateKey(btn);
    });
    whiteKeysEl.appendChild(btn);
  });
}
function createBlackKeys() {
  whiteMidi.forEach((midi, i) => {
    if (i >= whiteMidi.length - 1) return;
    if (whiteMidi[i + 1] - midi !== 2) return; // No black note between E–F or B–C.
    const key = document.createElement("button");
    key.type = "button";
    key.className = "black-key";
    const accidental = formatNote(midi + 1);
    key.style.left = `calc(${((i + 1) / whiteMidi.length) * 100}% - 14px)`;
    key.dataset.midi = String(midi + 1);
    key.setAttribute("aria-label", accidental);
    key.addEventListener("click", () => {
      if (performance.now() < suppressClickUntil) return;
      activateKey(key);
    });
    keyboardTrack.appendChild(key);
  });
}
// Clicking a section name sounds (and presses) the matching piano key
// before the existing gentle fade transitions to the destination.
document.querySelectorAll("[data-go]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const destination = btn.dataset.go;
    const entry = navigationNotes.find(([, view]) => view === destination);
    const midi = entry && whiteMidi.find((m) => formatNote(m) === entry[0]);
    const index = midi == null ? -1 : whiteMidi.indexOf(midi);
    const key = index < 0 ? null : whiteKeysEl.children[index];
    if (key) playNote(freqFromMidi(midi), key);
    setTimeout(() => showView(destination), key ? 210 : 0);
  }),
);
// A single activation path for mouse clicks and touch taps.
// On mobile, touch-action/scroll handling can suppress synthesized click.
function activateKey(key) {
  if (!key) return;
  if (key.classList.contains("white-key")) {
    const index = Number(key.dataset.index);
    const midi = whiteMidi[index];
    playNote(freqFromMidi(midi), key);
    if (navigationEnabled && navMap[index]) {
      setTimeout(() => showView(navMap[index].view), 210);
    }
  } else if (key.classList.contains("black-key")) {
    const midi = Number(key.dataset.midi);
    playNote(freqFromMidi(midi), key);
  }
}

// Mobile taps activate on pointerup (independent of synthetic click).
// Scrolling gestures are never treated as navigation.
let touchKeyGesture = null;
keyboardViewport.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "touch") return;
  const key = e.target.closest(".white-key, .black-key");
  touchKeyGesture = {
    id: e.pointerId,
    key,
    x: e.clientX,
    y: e.clientY,
    scroll: keyboardViewport.scrollLeft,
    moved: false,
  };
});
keyboardViewport.addEventListener("pointermove", (e) => {
  const gesture = touchKeyGesture;
  if (!gesture || gesture.id !== e.pointerId) return;
  const dx = e.clientX - gesture.x,
    dy = e.clientY - gesture.y;
  if (Math.abs(dx) > 10 || Math.abs(dy) > 10) gesture.moved = true;
  if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
    keyboardViewport.scrollLeft = gesture.scroll - dx;
  }
});
keyboardViewport.addEventListener("pointerup", (e) => {
  const gesture = touchKeyGesture;
  if (!gesture || gesture.id !== e.pointerId) return;
  touchKeyGesture = null;
  // Guard against the browser subsequently firing a duplicate click.
  suppressClickUntil = performance.now() + 450;
  if (
    !gesture.moved &&
    Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) < 12
  ) {
    activateKey(gesture.key);
  }
});
keyboardViewport.addEventListener("pointercancel", () => {
  touchKeyGesture = null;
});
// Drag horizontally, but keep short taps available for actual note playing.
let drag = null;
keyboardViewport.addEventListener("pointerdown", (e) => {
  if (e.button !== 0 || e.pointerType === "touch") return;
  drag = {
    id: e.pointerId,
    x: e.clientX,
    scroll: keyboardViewport.scrollLeft,
    moved: false,
  };
});
keyboardViewport.addEventListener("pointermove", (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x;
  if (Math.abs(dx) > 6) {
    drag.moved = true;
    keyboardViewport.classList.add("dragging");
    keyboardViewport.scrollLeft = drag.scroll - dx;
  }
});
const finishDrag = () => {
  if (drag?.moved) suppressClickUntil = performance.now() + 250;
  drag = null;
  keyboardViewport.classList.remove("dragging");
};
window.addEventListener("pointerup", finishDrag, true);
window.addEventListener("pointercancel", finishDrag, true);
window.addEventListener("blur", finishDrag);
keyboardViewport.addEventListener(
  "click",
  (e) => {
    if (performance.now() < suppressClickUntil) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },
  true,
);

let soundEnabled = false;

const soundToggle = document.getElementById("piano-sound-toggle");

soundToggle?.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  soundToggle.setAttribute("aria-pressed", String(soundEnabled));

  soundToggle.setAttribute(
    "aria-label",
    soundEnabled ? "Mute piano sound" : "Unmute piano sound",
  );

  soundToggle.querySelector(".sound-label").textContent = soundEnabled
    ? "Sound on"
    : "Sound off";

  soundToggle.querySelector(".mute-slash").style.display = soundEnabled
    ? "none"
    : "";
});

let audioCtx;
function getCtx() {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playNote(freq, el) {
  if (soundEnabled) {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.23, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.15);
  }

  el.classList.add("active");
  setTimeout(() => el.classList.remove("active"), 120);
  spawnNotes(el);
}

function spawnNotes(el) {
  const rect = el.getBoundingClientRect();
  const layerRect = notesLayer.getBoundingClientRect();
  const staffRect = document
    .querySelector(".music-staff")
    .getBoundingClientRect();
  // Each keystroke produces one of six note types (including single and paired eighth notes).
  // SVG avoids missing music-font glyphs on some browsers.
  const types = [
    "whole",
    "half",
    "quarter",
    "eighth",
    "pairedEighth",
    "sixteenth",
  ];
  const type = types[Math.floor(Math.random() * types.length)];
  const n = document.createElement("div");
  n.className = "float-note";
  n.setAttribute("aria-hidden", "true");
  const openHead = `<ellipse cx="15" cy="29" rx="10" ry="7" transform="rotate(-19 15 29)" fill="none" stroke="currentColor" stroke-width="2.8"/>`;
  const filledHead = `<ellipse cx="15" cy="29" rx="10" ry="7" transform="rotate(-19 15 29)" fill="currentColor"/>`;
  const stem = `<path d="M24 27 V1" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" fill="none"/>`;
  const flag = `<path d="M24 2 C42 9 33 19 29 23 C34 12 28 11 24 10 Z" fill="currentColor"/>`;
  const drawing =
    type === "pairedEighth"
      ? `<ellipse cx="11" cy="32" rx="7.5" ry="5.3" transform="rotate(-19 11 32)" fill="currentColor"/>
           <ellipse cx="37" cy="29" rx="7.5" ry="5.3" transform="rotate(-19 37 29)" fill="currentColor"/>
           <path d="M18 30 V5 M44 27 V2 M18 5 L44 2" stroke="currentColor" stroke-width="3.5" fill="none"/>`
      : type === "whole"
        ? `<ellipse cx="18" cy="24" rx="11" ry="7.5" transform="rotate(-18 18 24)" fill="none" stroke="currentColor" stroke-width="3"/>`
        : (type === "half" ? openHead : filledHead) +
          stem +
          (type === "eighth" || type === "sixteenth" ? flag : "") +
          (type === "sixteenth"
            ? `<path d="M24 11 C41 18 33 28 29 32 C34 22 28 20 24 19 Z" fill="currentColor"/>`
            : "");
  n.innerHTML = `<svg viewBox="0 0 52 42" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${drawing}</svg>`;
  const size =
    (type === "pairedEighth" ? 35 : 23) + Math.floor(Math.random() * 9);
  const startY = rect.top - 14;
  // Rise to anywhere from just above the top staff line to its lower
  // spaces, never into the title's region.
  const targetY = staffRect.bottom + 35 + Math.random() * 45;
  const distance = Math.max(70, startY - targetY);
  const duration = Math.min(5.9, Math.max(3.7, distance / 145));
  n.style.width = `${size}px`;
  n.style.height = `${size * 1.15}px`;
  n.style.left = `${rect.left - layerRect.left + rect.width * (0.3 + Math.random() * 0.4)}px`;
  n.style.top = `${startY - layerRect.top}px`;
  n.style.bottom = "auto";
  n.style.setProperty("--dx", `${-38 + Math.random() * 76}px`);
  n.style.setProperty("--rise-distance", `${distance}px`);
  n.style.setProperty("--rise-duration", `${duration}s`);
  notesLayer.appendChild(n);
  setTimeout(() => n.remove(), duration * 1000 + 100);
}

// YUE_RESEARCH_STAFF_AUDIO_V1
// Research notes play their matching piano keys.
// They never activate page navigation.

const researchNotePitches = ["G4", "B4", "A4", "C5"];

const researchNoteButtons = document.querySelectorAll(
  "#view-home .identity-note",
);

researchNoteButtons.forEach((button, noteIndex) => {
  button.addEventListener("click", () => {
    const pitch = researchNotePitches[noteIndex];

    const keyIndex = whiteMidi.findIndex((midi) => formatNote(midi) === pitch);

    if (keyIndex < 0) return;

    const midi = whiteMidi[keyIndex];

    // Select the actual white piano key.
    const pianoKey = whiteKeysEl.children[keyIndex];

    if (!pianoKey) return;

    // Reuse existing audio, key-press animation,
    // and floating-note animation.
    //
    // Do NOT call activateKey(), because that
    // function may trigger page navigation.
    playNote(freqFromMidi(midi), pianoKey);

    // Short feedback on the research note itself.
    button.classList.add("note-playing");

    setTimeout(() => {
      button.classList.remove("note-playing");
    }, 150);
  });
});

createWhiteKeys();
createBlackKeys();
requestAnimationFrame(() => {
  // Keep the five navigation keys in the initial visible range.
  // Their white-key indices span C4..C5; center this range in the viewport.
  const firstIndex = whiteMidi.findIndex((m) => m === 60);
  const lastIndex = whiteMidi.findIndex((m) => m === 72);
  const centerX =
    ((firstIndex + lastIndex + 1) / 2 / whiteMidi.length) *
    keyboardTrack.clientWidth;
  keyboardViewport.scrollLeft = Math.max(
    0,
    centerX - keyboardViewport.clientWidth / 2,
  );
});
