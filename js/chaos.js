// Scene 04 — the chaos room: do-not-press, aura detector, diagnostic,
// wish generator, light switch secrets and the wake-up minigame.
import { $, $$, sfx, unlock, pick, rand, sleep, popText, restartAnim, reduceMotion, boom, store } from './core.js?v=7';

/* ---------------- DO NOT PRESS ---------------- */
function initDontPress() {
  const btn = $('#dontPress');
  const msg = $('#pressMsg');
  const lines = ['Bro.', 'It literally says DO NOT PRESS.', 'Afeeq would be disappointed. If he was awake.', 'Final warning. I\'m serious.'];
  const after = ['You already broke it once.', 'Still pressing? Respect.', 'There\'s nothing else. Promise.', '…okay there might be.', 'Go wish him happy birthday instead.'];
  let presses = 0, crashed = false;
  btn.addEventListener('click', async () => {
    presses++;
    restartAnim(btn, 'angry');
    sfx.bad();
    unlock('pressed');
    if (!crashed && presses <= lines.length) { msg.textContent = lines[presses - 1]; return; }
    if (!crashed) { crashed = true; await crash(); msg.textContent = 'Okay you broke it. Happy now?'; return; }
    msg.textContent = pick(after);
  });
}

async function crash() {
  const el = $('#crash');
  const pct = $('#crashPct');
  const prevFocus = document.activeElement;
  el.hidden = false;
  document.body.classList.add('modal-open');
  el.tabIndex = -1;
  el.focus();
  sfx.thud();
  const steps = reduceMotion ? [100] : [0, 7, 13, 30, 31, 32, 58, 77, 99, 99, 99, 100];
  for (const s of steps) { pct.textContent = s; await sleep(280); }
  await sleep(500);
  el.hidden = true;
  document.body.classList.remove('modal-open');
  prevFocus?.focus?.({ preventScroll: true });
  unlock('crash');
}

/* ---------------- AURA DETECTOR ---------------- */
function initAura() {
  const btn = $('#auraBtn');
  const station = $('.st-aura');
  const fill = $('#gFill');
  const needle = $('#gNeedle');
  const msg = $('#auraMsg');
  const results = [
    'AURA: +9,999. Source: the hair.',
    'AURA: +4,200. Mostly from the Inter jersey.',
    'AURA: OFF THE CHARTS. The chart fell asleep.',
    'AURA: −50 for blowing on rice. +5,000 for not caring.',
    'AURA: ∞. Device needs a nap now. Like him.',
  ];
  const DURATION = 2600;
  let start = 0, raf = 0, holding = false;
  const set = p => {
    fill.style.strokeDashoffset = 100 - p * 100;
    const jitter = p > .3 ? rand(-4, 4) * p : 0;
    needle.style.transform = `rotate(${-90 + p * 180 + jitter}deg)`;
  };
  const loop = now => {
    if (!holding) return;
    const p = Math.min(1, (now - start) / DURATION);
    set(p);
    if (Math.random() < .3) sfx.click();
    if (p >= 1) { finish(); return; }
    raf = requestAnimationFrame(loop);
  };
  const begin = e => {
    if (holding) return;
    e?.preventDefault?.();
    holding = true;
    station.classList.add('scanning');
    btn.textContent = 'SCANNING… KEEP HOLDING';
    msg.textContent = 'Detecting aura levels…';
    start = performance.now();
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    if (!holding) return;
    holding = false;
    cancelAnimationFrame(raf);
    station.classList.remove('scanning');
    btn.textContent = 'HOLD TO SCAN';
    msg.textContent = 'Scan aborted. Aura requires commitment.';
    set(0);
  };
  const finish = () => {
    holding = false;
    station.classList.remove('scanning');
    needle.style.transform = 'rotate(100deg)';
    msg.textContent = pick(results);
    btn.textContent = 'SCAN AGAIN';
    sfx.levelUp();
    unlock('aura');
    setTimeout(() => { if (!holding) set(0); }, 2500);
  };
  btn.addEventListener('pointerdown', e => { btn.setPointerCapture?.(e.pointerId); begin(e); });
  btn.addEventListener('pointerup', stop);
  btn.addEventListener('pointercancel', stop);
  btn.addEventListener('contextmenu', e => e.preventDefault());
  btn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) begin(e); });
  btn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') stop(); });
  btn.addEventListener('blur', stop);
}

/* ---------------- DIAGNOSTIC ---------------- */
function initDiagnostic() {
  const term = $('#terminal');
  const btn = $('#diagBtn');
  const lines = [
    ['C:\\AFEEQ> run diagnostic.exe', ''],
    ['scanning afeeq.exe…', ''],
    ['sleep.module ............ OVERCLOCKED', 'warn'],
    ['alarm_response.dll ...... NOT FOUND', 'err'],
    ['appetite ................ 100% (always)', ''],
    ['hair.sys ................ VOLUME EXCEEDS LIMITS', 'warn'],
    ['patience (rice) ......... INFINITE', ''],
    ['punctuality ............. 404', 'err'],
    ['age ..................... +1 (update installed)', 'warn'],
    ['', ''],
    ['RESULT: no fix available.', 'err'],
    ['he\'s just built like that. happy birthday.', ''],
  ];
  let busy = false;
  btn.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    btn.disabled = true;
    term.innerHTML = '';
    for (const [text, cls] of lines) {
      const span = document.createElement('span');
      if (cls) span.className = cls;
      term.appendChild(span);
      for (let i = 1; i <= text.length; i++) {
        span.textContent = text.slice(0, i);
        if (i % 3 === 0) sfx.type();
        if (!reduceMotion) await sleep(14);
      }
      term.appendChild(document.createTextNode('\n'));
      term.scrollTop = term.scrollHeight;
      if (!reduceMotion) await sleep(cls === 'err' ? 380 : 180);
    }
    busy = false;
    btn.disabled = false;
    btn.textContent = 'RUN AGAIN (it won\'t help)';
  });
}

/* ---------------- WISH GENERATOR (bro edition) ---------------- */
function initWishes() {
  const out = $('#wishOut');
  const slot = out.parentElement;
  const btn = $('#wishBtn');
  const wishes = [
    'May your teammates finally carry for once.',
    'May your rice cool down in under 10 minutes.',
    'May you stay awake for one entire car ride. Just one.',
    'May you find parking on the first try.',
    'May your phone battery outlive your ranked session.',
    'May Inter win something and you never shut up about it.',
    'May your hair finally start paying rent.',
    'May nasi bamboo be free for you, forever.',
    'May your alarm actually work this year.',
    'May nobody find the other 4,000 photos. (We have them.)',
    'May your WiFi never lag during a clutch moment.',
    'May you get a W this year. A real one.',
  ];
  let last = -1, busy = false;
  btn.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    slot.classList.add('rolling');
    const spins = reduceMotion ? 1 : 16;
    for (let i = 0; i < spins; i++) {
      out.textContent = pick(wishes);
      sfx.click();
      await sleep(40 + i * 8);
    }
    let n;
    do { n = Math.floor(Math.random() * wishes.length); } while (n === last);
    last = n;
    out.textContent = wishes[n];
    slot.classList.remove('rolling');
    sfx.boop();
    busy = false;
  });
}

/* ---------------- LIGHT SWITCH ---------------- */
function initLights() {
  const room = $('#chaos');
  const sw = $('#lightSwitch');
  let darkTimer = null;
  const move = (x, y) => {
    const r = room.getBoundingClientRect();
    room.style.setProperty('--x', `${x - r.left}px`);
    room.style.setProperty('--y', `${y - r.top}px`);
  };
  room.addEventListener('pointermove', e => { if (room.classList.contains('dark')) move(e.clientX, e.clientY); });
  room.addEventListener('pointerdown', e => { if (room.classList.contains('dark')) move(e.clientX, e.clientY); });
  sw.addEventListener('click', e => {
    const dark = room.classList.toggle('dark');
    sw.setAttribute('aria-checked', String(!dark));
    sfx.click();
    clearTimeout(darkTimer);
    if (dark) {
      const r = sw.getBoundingClientRect();
      move(r.left + r.width / 2, r.top + r.height / 2);
      darkTimer = setTimeout(() => unlock('dark'), 2500);
    }
  });
}

/* ---------------- MINIGAME: WAKE AFEEQ UP ---------------- */
function initGame() {
  const sleepy = [{ src: 'img/opt/3-sm.webp', pos: '58% 62%' }, { src: 'img/opt/6-sm.webp', pos: '55% 55%' }];
  const eating = { src: 'img/opt/5-sm.webp', pos: '68% 42%' };
  const awake = { src: 'img/opt/2-sm.webp', pos: '47% 54%' };
  const holesEl = $('#holes');
  const holes = [];
  for (let i = 0; i < 9; i++) {
    const h = document.createElement('button');
    h.className = 'hole';
    h.type = 'button';
    h.setAttribute('aria-label', `Hole ${i + 1}, empty`);
    h.innerHTML = '<div class="mole"><img alt="" width="200" height="200"></div><span class="tag" hidden></span>';
    h.addEventListener('pointerdown', e => hit(i, e.clientX, e.clientY));
    h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const r = h.getBoundingClientRect(); hit(i, r.left + r.width / 2, r.top); } });
    holesEl.appendChild(h);
    holes.push({ el: h, img: h.querySelector('img'), tag: h.querySelector('.tag'), kind: null, timer: null });
  }
  let score = 0, timeLeft = 20, running = false, spawnTimer, clockTimer;
  let best = store.get('afeeq-best', 0);
  $('#best').textContent = best;

  const setPic = (h, pic) => { h.img.src = pic.src; h.img.style.objectPosition = pic.pos; h.img.style.transformOrigin = pic.pos; h.img.style.transform = 'scale(1.9)'; };
  function show(i, kind) {
    const h = holes[i];
    setPic(h, kind === 'eat' ? eating : pick(sleepy));
    h.kind = kind;
    h.tag.hidden = false;
    h.tag.textContent = kind === 'eat' ? 'EATING' : 'zzz…';
    h.el.classList.add('up');
    h.el.setAttribute('aria-label', kind === 'eat' ? `Hole ${i + 1}: Afeeq eating, do not hit` : `Hole ${i + 1}: sleeping Afeeq, hit him`);
    h.timer = setTimeout(() => hide(i), Math.max(560, 1100 - (20 - timeLeft) * 26));
  }
  function hide(i) {
    const h = holes[i];
    clearTimeout(h.timer);
    h.el.classList.remove('up');
    h.kind = null;
    h.el.setAttribute('aria-label', `Hole ${i + 1}, empty`);
    setTimeout(() => { if (!h.kind) h.tag.hidden = true; }, 180);
  }
  function hit(i, x, y) {
    const h = holes[i];
    if (!running || !h.kind || h.kind === 'done') return;
    restartAnim(h.el, 'bonk');
    if (h.kind === 'sleep') {
      score++;
      sfx.boop();
      setPic(h, awake);
      h.tag.textContent = 'AWAKE!';
      popText(x, y, pick(['+1 BANGUN!', '+1 OI!', '+1 WAKEY', '+1 SUBUH!']));
    } else {
      score = Math.max(0, score - 2);
      sfx.bad();
      popText(x, y, '-2 HE\'S EATING', true);
    }
    h.kind = 'done';
    clearTimeout(h.timer);
    h.timer = setTimeout(() => hide(i), 320);
    $('#score').textContent = score;
  }
  function spawn() {
    const free = () => holes.map((h, i) => (h.kind ? -1 : i)).filter(i => i >= 0);
    let f = free();
    if (f.length) show(pick(f), Math.random() < .22 ? 'eat' : 'sleep');
    f = free();
    if (timeLeft < 12 && f.length && Math.random() < .5) show(pick(f), 'sleep');
    spawnTimer = setTimeout(spawn, Math.max(380, 800 - (20 - timeLeft) * 22));
  }
  function start() {
    score = 0; timeLeft = 20; running = true;
    $('#score').textContent = 0;
    $('#time').textContent = 20;
    $('#gameMsg').textContent = 'GO GO GO!!!';
    $('#startGame').disabled = true;
    sfx.alarm();
    spawn();
    clockTimer = setInterval(() => {
      $('#time').textContent = --timeLeft;
      if (timeLeft <= 0) end();
    }, 1000);
  }
  function end() {
    running = false;
    clearTimeout(spawnTimer);
    clearInterval(clockTimer);
    holes.forEach((_, i) => hide(i));
    const ranks = [
      [0, 'You are as sleepy as he is.'],
      [6, 'Rank: Snoozed alarm.'],
      [12, 'Rank: Mak shouting at 7am.'],
      [17, 'Rank: Bucket of cold water.'],
      [22, 'LEGENDARY. Nobody has ever woken him up this much.'],
    ];
    const msg = ranks.filter(([m]) => score >= m).pop()[1];
    const newBest = score > best;
    if (newBest) { best = score; store.set('afeeq-best', best); $('#best').textContent = best; }
    $('#gameMsg').textContent = `${score} wake-ups. ${msg}${newBest && score ? ' NEW BEST.' : ''}`;
    $('#startGame').disabled = false;
    $('#startGame').textContent = 'AGAIN';
    if (score >= 12) { unlock('gamer'); boom(.6); }
  }
  $('#startGame').addEventListener('click', start);
}

export function initChaos() {
  initDontPress();
  initAura();
  initDiagnostic();
  initWishes();
  initLights();
  initGame();
}
