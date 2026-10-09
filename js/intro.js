// Scene 01 — the mysterious introduction.
import { $, sleep, sfx, boom, playSong, unlock, reduceMotion, restartAnim, pick } from './core.js?v=7';

const LINES = [
  { text: 'A VERY IMPORTANT EVENT IS ABOUT TO BEGIN...', big: true },
  { text: 'World leaders have been notified.' },
  { text: 'His mother has been warned.' },
  { text: 'The subject has been located.' },
];

const WAKE_STEPS = [
  { status: 'SUBJECT STATUS: <b>STILL ASLEEP.</b> Not even a twitch.', btn: 'WAKE HIM UP (HARDER)' },
  { status: 'He said <b>"lima minit lagi."</b> Classic.', btn: 'BANGUN!!!' },
  { status: 'SUBJECT STATUS: <b>ONE EYE OPEN.</b> That\'s the best we\'ll get.', btn: 'ENTER AT YOUR OWN RISK' },
];

let running = true;
let rafId = 0;
let wakes = 0;
let typingToken = 0;

/* -------- floating dust, only while the intro is visible -------- */
function startDust() {
  const cv = $('#dust');
  const c = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w, h, parts;
  const resize = () => {
    w = cv.width = innerWidth * dpr;
    h = cv.height = innerHeight * dpr;
    const n = innerWidth < 700 ? 40 : 80;
    parts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: (Math.random() * 1.8 + .4) * dpr, vy: -(Math.random() * .25 + .05) * dpr, vx: (Math.random() - .5) * .15 * dpr, a: Math.random() * .6 + .2 }));
  };
  resize();
  addEventListener('resize', resize);
  const tick = () => {
    if (!running) return;
    c.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      c.beginPath();
      c.fillStyle = `rgba(232,184,74,${p.a})`;
      c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      c.fill();
    }
    rafId = requestAnimationFrame(tick);
  };
  if (!reduceMotion) tick();
}

async function typeLines() {
  const token = ++typingToken;
  const box = $('#introLines');
  box.innerHTML = '';
  for (const line of LINES) {
    const p = document.createElement('p');
    p.className = 'intro-line' + (line.big ? ' big' : '');
    box.appendChild(p);
    if (reduceMotion) { p.textContent = line.text; continue; }
    const cur = document.createElement('span');
    cur.className = 'cursor';
    cur.innerHTML = '&nbsp;';
    for (let i = 1; i <= line.text.length; i++) {
      if (token !== typingToken) return;
      p.textContent = line.text.slice(0, i);
      p.appendChild(cur);
      if (i % 2) sfx.type();
      await sleep(line.big ? 45 : 28);
    }
    cur.remove();
    await sleep(line.big ? 700 : 420);
  }
  if (token !== typingToken) return;
  const btn = $('#revealBtn');
  btn.hidden = false;
  btn.focus({ preventScroll: true });
}

function flash() {
  if (reduceMotion) return;
  const f = document.createElement('div');
  f.className = 'flash';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 800);
}

function revealVictim() {
  typingToken++;
  flash();
  sfx.thud();
  $('#introStage1').hidden = true;
  $('#introStage2').hidden = false;
  $('#wakeBtn').focus({ preventScroll: true });
}

function wake() {
  const subj = $('.intro-subject');
  restartAnim(subj, 'shake');
  if (wakes < WAKE_STEPS.length) {
    sfx.alarm();
    const s = WAKE_STEPS[wakes];
    $('#subjectStatus').innerHTML = s.status;
    $('#wakeBtn').textContent = s.btn;
    wakes++;
    return;
  }
  unlock('woke');
  exitIntro(true);
}

export function exitIntro(celebrate) {
  const intro = $('#intro');
  if (intro.hidden) return;
  typingToken++;
  sfx.whoosh();
  intro.classList.add('leaving');
  document.body.classList.remove('intro-active');
  if (celebrate) { setTimeout(() => boom(1.2), 300); playSong(); }
  setTimeout(() => {
    intro.hidden = true;
    running = false;
    cancelAnimationFrame(rafId);
    $('.archive-head')?.scrollIntoView({ behavior: 'instant' });
    $('.stamp-mother')?.classList.add('in');
    setTimeout(sfx.thud, 300);
  }, reduceMotion ? 0 : 1000);
}

export function replayIntro() {
  const intro = $('#intro');
  wakes = 0;
  $('#introStage1').hidden = false;
  $('#introStage2').hidden = true;
  $('#revealBtn').hidden = true;
  $('#wakeBtn').textContent = 'WAKE HIM UP';
  $('#subjectStatus').innerHTML = 'SUBJECT STATUS: <b>ASLEEP.</b> OBVIOUSLY.';
  intro.hidden = false;
  intro.classList.remove('leaving');
  document.body.classList.add('intro-active');
  running = true;
  startDust();
  typeLines();
}

export function initIntro() {
  $('#revealBtn').addEventListener('click', revealVictim);
  $('#wakeBtn').addEventListener('click', wake);
  $('#skipIntro').addEventListener('click', () => exitIntro(false));
  // light follows the pointer for a bit of depth
  const light = $('.intro-light');
  $('#intro').addEventListener('pointermove', e => {
    if (reduceMotion) return;
    light.style.left = `${50 + (e.clientX / innerWidth - .5) * 20}%`;
    light.style.top = `${45 + (e.clientY / innerHeight - .5) * 20}%`;
  });
  setInterval(() => { if (running && !$('#introStage2').hidden && wakes === 0) sfx.snore(); }, 2600);
  startDust();
  typeLines();
}
