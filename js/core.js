// Shared utilities: DOM helpers, sound, confetti, achievements, toasts.

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const store = {
  get(k, fallback) { try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ---------------- sound (synthesised, off by default) ---------------- */
let ctx = null;
let soundOn = false;
export const audioCtx = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());
export const isSoundOn = () => soundOn;

export function tone(freq, dur = .15, type = 'square', vol = .07, when = 0) {
  if (!soundOn) return;
  const a = audioCtx();
  const t = a.currentTime + when;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + .02);
}

function noise(dur = .3, vol = .2, when = 0, filterFreq = 800) {
  if (!soundOn) return;
  const a = audioCtx();
  const t = a.currentTime + when;
  const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = a.createBufferSource();
  const f = a.createBiquadFilter();
  const g = a.createGain();
  src.buffer = buf;
  f.type = 'lowpass'; f.frequency.value = filterFreq;
  g.gain.value = vol;
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

export const sfx = {
  click: () => tone(660, .05, 'square', .05),
  boop: () => { tone(520, .08); tone(780, .1, 'square', .06, .07); },
  bad: () => { tone(160, .25, 'sawtooth', .09); tone(110, .3, 'sawtooth', .09, .12); },
  alarm: () => { for (let i = 0; i < 6; i++) tone(i % 2 ? 1046 : 880, .09, 'square', .06, i * .1); },
  type: () => tone(rand(180, 260), .03, 'square', .02),
  thud: () => { tone(70, .35, 'sine', .3); noise(.2, .25, 0, 400); },
  whoosh: () => noise(.5, .15, 0, 2400),
  pop: () => tone(rand(500, 900), .07, 'triangle', .09),
  levelUp: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, .18, 'square', .07, i * .09)),
  achieve: () => [784, 988, 1318].forEach((f, i) => tone(f, .14, 'triangle', .1, i * .08)),
  drumroll: (secs = 2.6) => { for (let t = 0; t < secs; t += .05) noise(.05, .08 + t * .03, t, 600); },
  snore: () => {
    if (!soundOn) return;
    const a = audioCtx(); const t = a.currentTime;
    const o = a.createOscillator(); const g = a.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(110, t + .5); o.frequency.linearRampToValueAtTime(60, t + 1);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.08, t + .3); g.gain.exponentialRampToValueAtTime(.0001, t + 1.05);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + 1.1);
  },
};

const N = { G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784 };
const SONG = [
  ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
  ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
  ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3],
];
let songBusy = false;
export function playSong() {
  if (songBusy || !soundOn) return;
  songBusy = true;
  const beat = .4;
  let t = 0;
  for (const [n, d] of SONG) {
    tone(N[n], d * beat * .95, 'triangle', .12, t);
    tone(N[n] / 2, d * beat * .9, 'sine', .05, t);
    t += d * beat;
  }
  setTimeout(() => (songBusy = false), t * 1000);
}

export function setSound(on) {
  soundOn = on;
  if (on) audioCtx().resume?.();
  const hud = $('#soundBtn');
  hud.textContent = on ? '🔊' : '🔇';
  hud.setAttribute('aria-pressed', on);
  hud.setAttribute('aria-label', on ? 'Sound on. Turn sound off' : 'Sound off. Turn sound on');
  const intro = $('#introSound');
  if (intro) {
    intro.setAttribute('aria-pressed', on);
    intro.innerHTML = on ? '🔊 <span>SOUND ON</span>' : '🔇 <span>SOUND OFF · tap for the full experience</span>';
  }
  if (on) sfx.achieve();
}

export function initSound() {
  $('#soundBtn').addEventListener('click', () => setSound(!soundOn));
  $('#introSound')?.addEventListener('click', () => setSound(!soundOn));
}

/* ---------------- confetti (canvas-confetti from CDN, optional) ---------------- */
const COLORS = ['#d7263d', '#ffd400', '#e8b84a', '#48e5ff', '#7b4dff', '#f7f3ea'];
const hasConfetti = () => typeof window.confetti === 'function' && !reduceMotion;
export function boom(power = 1) {
  if (!hasConfetti()) return;
  const c = window.confetti;
  c({ particleCount: Math.round(140 * power), spread: 100, origin: { y: .6 }, colors: COLORS });
  setTimeout(() => c({ particleCount: Math.round(80 * power), angle: 60, spread: 70, origin: { x: 0, y: .7 }, colors: COLORS }), 200);
  setTimeout(() => c({ particleCount: Math.round(80 * power), angle: 120, spread: 70, origin: { x: 1, y: .7 }, colors: COLORS }), 350);
}
export function rain(ms = 3000) {
  if (!hasConfetti()) return;
  const end = Date.now() + ms;
  (function frame() {
    window.confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: COLORS });
    window.confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ---------------- toasts ---------------- */
export function toast(icon, label, title) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="t-ico">${icon}</span><span><small>${label}</small><b></b></span>`;
  t.querySelector('b').textContent = title;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 4300);
}

export function popText(x, y, text, bad = false) {
  const p = document.createElement('div');
  p.className = 'pop' + (bad ? ' bad' : '');
  p.textContent = text;
  p.style.left = x + 'px';
  p.style.top = y + 'px';
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 900);
}

/* ---------------- achievements ---------------- */
export const ACHIEVEMENTS = [
  { id: 'woke', icon: '⏰', name: 'Human Alarm Clock', desc: 'Woke Afeeq up in the intro.', hint: 'Start at the very beginning.' },
  { id: 'leak', icon: '🗂️', name: 'The Leaker', desc: 'Un-redacted every classified line.', hint: 'Black bars in the dossier are clickable.' },
  { id: 'evidence', icon: '🔎', name: 'Full Disclosure', desc: 'Revealed all 6 exhibits.', hint: 'The Evidence Locker has 6 exhibits.' },
  { id: 'multiverse', icon: '🌌', name: 'Multiverse Tourist', desc: 'Inspected all 5 Afeeqs.', hint: 'Check every Afeeq in the multiverse.' },
  { id: 'pressed', icon: '🔴', name: 'Can\'t Read', desc: 'Pressed the DO NOT PRESS button.', hint: 'It literally says do not press.' },
  { id: 'crash', icon: '💥', name: 'System Breaker', desc: 'Crashed AFEEQ.EXE.', hint: 'Keep pressing what you shouldn\'t.' },
  { id: 'aura', icon: '🌀', name: 'Aura Farmer', desc: 'Completed a full aura scan.', hint: 'Hold. Don\'t let go.' },
  { id: 'dark', icon: '🔦', name: 'Lights Out', desc: 'Found the secrets in the dark.', hint: 'Ordinary objects can be suspicious.' },
  { id: 'gamer', icon: '🎮', name: 'Wake-Up Call', desc: 'Scored 12+ in Wake Afeeq Up.', hint: 'Get good at the minigame.' },
  { id: 'dream', icon: '🐑', name: 'Dream Walker', desc: 'Entered Afeeq\'s dream.', hint: 'Type his name on a keyboard. Or tap the logo a lot.' },
];
const TOTAL = ACHIEVEMENTS.length;
let unlocked = new Set(store.get('afeeq-ach', []));

export const achCount = () => unlocked.size;
export const achTotal = TOTAL;
export const hasAch = id => unlocked.has(id);

export function unlock(id) {
  if (unlocked.has(id)) return;
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return;
  unlocked.add(id);
  store.set('afeeq-ach', [...unlocked]);
  toast(a.icon, 'ACHIEVEMENT UNLOCKED', a.name);
  sfx.achieve();
  renderAch();
  const b = $('#achBtn');
  b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  document.dispatchEvent(new CustomEvent('achievement', { detail: { id, count: unlocked.size } }));
}

function renderAch() {
  $('#achCount').textContent = `${unlocked.size}/${TOTAL}`;
  $('#achList').innerHTML = ACHIEVEMENTS.map(a => {
    const got = unlocked.has(a.id);
    return `<li class="${got ? 'got' : ''}"><span class="ach-ico">${got ? a.icon : '🔒'}</span><span><b>${got ? a.name : '???'}</b><span>${got ? a.desc : 'Hint: ' + a.hint}</span></span></li>`;
  }).join('');
}

export function initAchievements() {
  const dlg = $('#achDialog');
  renderAch();
  $('#achBtn').addEventListener('click', () => dlg.showModal());
  $('#achClose').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  $('#achReset').addEventListener('click', () => {
    unlocked = new Set();
    store.set('afeeq-ach', []);
    renderAch();
    document.dispatchEvent(new CustomEvent('achievement', { detail: { id: null, count: 0 } }));
  });
}

/* ---------------- misc ---------------- */
export function initImageFallbacks() {
  document.addEventListener('error', e => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.failed) return;
    img.dataset.failed = '1';
    img.classList.add('img-missing');
    img.parentElement?.classList.add('img-missing-box');
  }, true);
}

export function initReveal() {
  const io = new IntersectionObserver(entries => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      en.target.classList.add('in');
      en.target.dispatchEvent(new CustomEvent('revealed'));
      io.unobserve(en.target);
    }
  }, { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));
  return io;
}

export function restartAnim(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}
