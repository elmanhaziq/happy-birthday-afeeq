// Scene 02 — the embarrassment archive: dossier, redactions, six exhibits.
import { $, $$, sfx, unlock, sleep, restartAnim, reduceMotion } from './core.js?v=7';

const NEWS = [
  'Local man turns one year older, still has not woken up',
  'Nasi Bamboo Sungai Klah reports record visit from unpaid ambassador',
  'Scientists confirm Afeeq\'s hair has its own weather system',
  'Car reportedly still parked when Afeeq fell asleep in it',
  'Rice "too hot", man responds with 45 minutes of blowing',
  'Ipoh old town confirms Afeeq smiled at a camera there',
  'Inter Milan jersey sightings at the dinner table continue',
  'Friends release only 6 of an estimated 4,000 sleeping photos',
];

function initTicker() {
  $('#tickerMove').innerHTML = [...NEWS, ...NEWS].map(n => `<span>${n}</span>`).join('');
}

function initRedactions() {
  const bars = $$('.redact');
  bars.forEach(b => {
    b.setAttribute('aria-label', 'Redacted. Activate to reveal.');
    b.addEventListener('click', () => {
      if (b.classList.contains('open')) return;
      b.classList.add('open');
      b.textContent = b.dataset.reveal;
      b.removeAttribute('aria-label');
      sfx.pop();
      if (bars.every(x => x.classList.contains('open'))) unlock('leak');
    });
  });
}

function initLocker() {
  const exhibits = $$('#exhibits .exhibit');
  const btn = $('#nextExhibit');
  const count = $('#exhibitCount');
  let shown = 0;
  btn.addEventListener('click', () => {
    if (shown >= exhibits.length) return;
    const ex = exhibits[shown++];
    ex.hidden = false;
    restartAnim(ex, 'revealing');
    sfx.thud();
    count.textContent = `${shown} / ${exhibits.length} DISCLOSED`;
    if (shown < exhibits.length) {
      btn.textContent = `REVEAL EXHIBIT ${exhibits[shown].dataset.ex}`;
    } else {
      btn.textContent = 'ALL EVIDENCE DISCLOSED';
      btn.disabled = true;
      unlock('evidence');
    }
    // move the button to after the latest exhibit so the flow keeps going
    ex.after(btn.closest('.locker-ctl'));
    ex.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
}

function initMugshot() {
  const photo = $('#mugPhoto');
  const msg = $('#enhanceMsg');
  const btn = $('#enhanceBtn');
  let step = 0;
  btn.addEventListener('click', () => {
    step = (step + 1) % 3;
    photo.classList.toggle('z1', step === 1);
    photo.classList.toggle('z2', step === 2);
    restartAnim(photo, 'flashing');
    sfx.boop();
    if (step === 1) { msg.textContent = 'Enhancing… subject appears to be at peace.'; btn.textContent = '🔍 ENHANCE MORE'; }
    else if (step === 2) { msg.textContent = 'Image cannot be enhanced further. Neither can he.'; btn.textContent = '↺ RESET'; }
    else { msg.textContent = ''; btn.textContent = '🔍 ENHANCE'; }
  });
}

function initMagazine() {
  const mag = $('#mag');
  const btn = $('#flipMag');
  btn.addEventListener('click', () => {
    const flipped = mag.classList.toggle('flipped');
    btn.textContent = flipped ? '📖 BACK TO THE COVER' : '📖 READ THE INTERVIEW';
    sfx.whoosh();
  });
}

function initEvidence() {
  const ph = $('#eviPhoto');
  const btn = $('#analyzeBtn');
  btn.addEventListener('click', () => {
    const on = ph.classList.toggle('analysed');
    btn.textContent = on ? '🧽 CLEAR ANNOTATIONS' : '🖊 RUN FORENSIC ANALYSIS';
    if (on) sfx.boop();
  });
}

function initEnvelope() {
  const env = $('#envelope');
  env.addEventListener('click', async () => {
    if (env.classList.contains('open') || env.dataset.busy) return;
    env.dataset.busy = '1';
    env.querySelector('.env-label').textContent = 'DRUMROLL…';
    sfx.drumroll(1.2);
    await sleep(reduceMotion ? 0 : 1200);
    env.classList.add('open');
    env.setAttribute('aria-expanded', 'true');
    sfx.levelUp();
  });
}

function initCctv() {
  const clock = $('#cctvClock');
  const start = Date.now();
  const pad = n => String(n).padStart(2, '0');
  const update = () => {
    const s = Math.floor((Date.now() - start) / 1000) + 3 * 3600 + 17 * 60;
    clock.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  };
  update();
  setInterval(update, 1000);

  const subs = ['[intense tapping]', '[he smiles at the phone]', '[the lamp watches silently]', '[still tapping]', '[a victory? a meme? unclear]', '[has not blinked in a while]'];
  const cctv = $('#cctv');
  const sub = $('#cctvSub');
  const btn = $('#playCctv');
  let timer = null, i = 0;
  btn.addEventListener('click', () => {
    const playing = cctv.classList.toggle('playing');
    btn.textContent = playing ? '⏸ PAUSE FOOTAGE' : '▶ PLAY FOOTAGE';
    clearInterval(timer);
    if (!playing) { sub.classList.remove('show'); return; }
    const next = () => { sub.textContent = subs[i++ % subs.length]; sub.classList.add('show'); sfx.type(); };
    next();
    timer = setInterval(next, 2200);
  });
}

function initTabs() {
  const tabs = $('#tabs');
  const msg = $('#tabMsg');
  const lines = [
    'Sighting reported. He was asleep.',
    'Sighting confirmed: near food. Obviously.',
    'Caller says he is "on the way". He is not.',
    'Reward claimed. Nasi bamboo already eaten by Afeeq.',
    'Caller hung up. Afeeq fell asleep mid-call.',
    'Last tab gone. This poster is now legally void.',
  ];
  let torn = 0;
  for (let i = 0; i < 6; i++) {
    const t = document.createElement('button');
    t.className = 'tab';
    t.type = 'button';
    t.textContent = 'CALL IF SEEN';
    t.setAttribute('aria-label', `Tear off tab ${i + 1}`);
    t.addEventListener('click', () => {
      t.classList.add('torn');
      t.disabled = true;
      msg.textContent = lines[torn++];
      sfx.whoosh();
    });
    tabs.appendChild(t);
  }
}

export function initArchive() {
  initTicker();
  initRedactions();
  initLocker();
  initMugshot();
  initMagazine();
  initEvidence();
  initEnvelope();
  initCctv();
  initTabs();
  // stamp the head when it comes into view (in case intro was skipped mid-scroll)
  const stamp = $('.stamp-mother');
  new IntersectionObserver(([en], io) => { if (en.isIntersecting) { stamp.classList.add('in'); io.disconnect(); } }, { threshold: .5 }).observe(stamp);
}
