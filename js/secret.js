// Secret scene: Afeeq's dream. Triggers: type "afeeq", tap the logo 7 times, or the zzz link.
import { $, sfx, unlock, restartAnim } from './core.js?v=7';

let sheepTimer = null;
let counted = 0;
let lastFocus = null;

function spawnSheep() {
  const field = $('#dreamField');
  const s = document.createElement('div');
  s.className = 'sheep';
  s.innerHTML = '<span class="wool"></span><span class="legs"></span><img src="img/opt/6-sm.webp" alt="">';
  field.appendChild(s);
  s.addEventListener('animationend', () => {
    s.remove();
    $('#sheepCount').textContent = ++counted;
    sfx.pop();
  });
}

export function openDream() {
  const d = $('#dream');
  if (!d.hidden) return;
  lastFocus = document.activeElement;
  counted = 0;
  $('#sheepCount').textContent = 0;
  d.hidden = false;
  document.body.classList.add('modal-open');
  $('#dreamClose').focus();
  sfx.snore();
  spawnSheep();
  sheepTimer = setInterval(spawnSheep, 1500);
  unlock('dream');
}

function closeDream() {
  const d = $('#dream');
  d.hidden = true;
  clearInterval(sheepTimer);
  $('#dreamField').querySelectorAll('.sheep').forEach(s => s.remove());
  document.body.classList.remove('modal-open');
  lastFocus?.focus?.({ preventScroll: true });
  sfx.alarm();
}

export function initSecret() {
  let typed = '';
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#dream').hidden) { closeDream(); return; }
    if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName) || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-5);
    if (typed === 'afeeq') openDream();
  });

  let taps = 0, tapTimer = null;
  const logo = $('#logo');
  logo.addEventListener('click', () => {
    taps++;
    restartAnim(logo, 'tap');
    sfx.click();
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => (taps = 0), 2500);
    if (taps >= 7) { taps = 0; openDream(); }
    else if (taps === 1) document.getElementById('archive').scrollIntoView({ behavior: 'smooth' });
  });

  $('#zzzLink').addEventListener('click', openDream);
  $('#dreamClose').addEventListener('click', closeDream);
}
