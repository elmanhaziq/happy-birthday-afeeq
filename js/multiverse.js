// Scene 03 — the Afeeq multiverse: character select with tilt card and joke stats.
import { $, $$, sfx, unlock, restartAnim, reduceMotion, pick } from './core.js?v=8';

const CHARACTERS = [
  {
    id: 'mage', img: 'img/opt/6-sm.webp', pos: '55% 50%',
    cls: 'CLASS: SORCERER · ELEMENT: NAP', name: 'THE SLEEP MAGE',
    desc: 'Master of the ancient art of sleeping anywhere. Cars. Couches. Probably while reading this.',
    stats: [['Charisma', 70], ['Intelligence', 64], ['Aura', 92], ['Birthday Energy', 35], ['Unnecessary Confidence', 88]],
    ability: 'Instant Nap: unconscious in any moving vehicle within 4 minutes. Cooldown: none.',
    weak: 'Mornings. All of them.',
    roast: 'Excellent choice. He won\'t notice. He\'s asleep.',
  },
  {
    id: 'rice', img: 'img/opt/5-sm.webp', pos: '68% 40%',
    cls: 'CLASS: CHEF?? · ELEMENT: WIND', name: 'THE RICE WHISPERER',
    desc: 'Can lower the temperature of any meal using only his breath and an alarming amount of patience.',
    stats: [['Charisma', 61], ['Intelligence', 77], ['Aura', 70], ['Birthday Energy', 80], ['Unnecessary Confidence', 95]],
    ability: 'Cooling Breath: −0.5°C per minute. Any rice. Any day.',
    weak: 'Rice that\'s already cold. He doesn\'t know what to do with himself.',
    roast: 'The rice trembles.',
  },
  {
    id: 'ronin', img: 'img/opt/1-sm.webp', pos: '22% 88%',
    cls: 'CLASS: WANDERER · ELEMENT: LANTERN', name: 'THE IPOH RONIN',
    desc: 'Roams old-town streets under red lanterns, searching for the next photo spot and the next white coffee.',
    stats: [['Charisma', 94], ['Intelligence', 70], ['Aura', 99], ['Birthday Energy', 88], ['Unnecessary Confidence', 120]],
    ability: 'Tourist Stance: smiles at the camera no matter what is happening behind him.',
    weak: 'Group photos where he has to share the frame.',
    roast: 'A man of culture. And lanterns.',
  },
  {
    id: 'couch', img: 'img/opt/4-sm.webp', pos: '58% 50%',
    cls: 'CLASS: GAMER · ELEMENT: WIFI', name: 'THE COUCH LEGEND',
    desc: 'Fights his greatest battles lying down, phone held at the perfect angle, lamp as his only witness.',
    stats: [['Charisma', 66], ['Intelligence', 83], ['Aura', 85], ['Birthday Energy', 50], ['Unnecessary Confidence', 104]],
    ability: 'Horizontal Focus: ignores all humans for one ranked match. Or six.',
    weak: 'Gravity, when the phone slips.',
    roast: 'Player 1 is… lying down. Respect.',
  },
  {
    id: 'knight', img: 'img/opt/2-sm.webp', pos: '48% 58%',
    cls: 'CLASS: PALADIN · ELEMENT: NASI', name: 'THE BAMBOO KNIGHT',
    desc: 'Sworn protector of Nasi Bamboo Sungai Klah. Unpaid. Unbothered. Fully moisturised.',
    stats: [['Charisma', 97], ['Intelligence', 72], ['Aura', 90], ['Birthday Energy', 100], ['Unnecessary Confidence', 110]],
    ability: 'Brand Loyalty: promotes a restaurant for free, forever, with a full smile.',
    weak: 'The sign literally says get a table before queueing.',
    roast: 'Honour. Loyalty. Rice.',
  },
];

let current = 0;
const seen = new Set();

function render(i, animate = true) {
  current = i;
  const c = CHARACTERS[i];
  seen.add(c.id);
  $$('.mv-opt').forEach((b, k) => {
    b.setAttribute('aria-selected', k === i);
    b.tabIndex = k === i ? 0 : -1;
  });
  const img = $('#mvImg');
  img.src = c.img;
  img.alt = c.name;
  img.style.objectPosition = c.pos;
  $('#mvClass').textContent = c.cls;
  $('#mvName').textContent = c.name;
  $('#mvDesc').textContent = c.desc;
  $('#mvAbility').textContent = c.ability;
  $('#mvWeak').textContent = c.weak;
  const ul = $('#mvStats');
  ul.innerHTML = c.stats.map(([n, v]) =>
    `<li><span>${n}</span><span class="bar${v > 100 ? ' over' : ''}" role="meter" aria-label="${n}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(v, 100)}"><i></i></span><span class="num">${v}${v > 100 ? '!' : ''}</span></li>`).join('');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('#mvStats .bar i').forEach((bar, k) => (bar.style.width = Math.min(c.stats[k][1], 100) + '%'));
  }));
  if (animate) { restartAnim($('#mvCard'), 'swap'); sfx.click(); }
  if (seen.size === CHARACTERS.length) unlock('multiverse');
}

function choose() {
  const c = CHARACTERS[current];
  const box = $('#mvChosen');
  box.innerHTML = '<p>PLAYER 1 HAS CHOSEN</p><h3></h3><q></q><p style="margin-top:26px;font-size:.8rem;opacity:.6">tap anywhere to continue</p>';
  box.querySelector('h3').textContent = c.name;
  box.querySelector('q').textContent = c.roast;
  box.classList.add('show');
  sfx.levelUp();
  const close = () => { box.classList.remove('show'); box.removeEventListener('click', close); $('#mvChoose').focus({ preventScroll: true }); };
  box.addEventListener('click', close);
  setTimeout(close, 2600);
}

function initTilt() {
  const card = $('#mvCard');
  if (reduceMotion || !matchMedia('(pointer: fine)').matches) return;
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--ry', `${(x - .5) * 14}deg`);
    card.style.setProperty('--rx', `${(.5 - y) * 10}deg`);
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
  });
  card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
}

export function initMultiverse() {
  const sel = $('#mvSelect');
  CHARACTERS.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'mv-opt';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.innerHTML = `<img src="${c.img}" alt="" width="56" height="56" loading="lazy" style="object-position:${c.pos}"><span><b>${c.name.replace('THE ', '')}</b><small>${c.cls.split('·')[0].replace('CLASS: ', '')}</small></span>`;
    b.addEventListener('click', () => render(i));
    b.addEventListener('keydown', e => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
      const n = (current + d + CHARACTERS.length) % CHARACTERS.length;
      render(n);
      sel.children[n].focus();
    });
    sel.appendChild(b);
  });
  seen.clear();
  render(0, false);
  seen.clear(); // the default card doesn't count until the section is actually seen
  $('#mvChoose').addEventListener('click', choose);
  initTilt();
  new IntersectionObserver(([en], io) => { if (en.isIntersecting) { seen.add(CHARACTERS[current].id); render(current, false); io.disconnect(); } }, { threshold: .4 }).observe($('#mvCard'));
}
