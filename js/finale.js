// Scene 05 — the ceremony: countdown, level-up, spotlight reveal, gift letter, true ending.
import { $, sfx, boom, rain, playSong, sleep, achCount, achTotal, reduceMotion, rand } from './core.js?v=7';

const PHOTOS = ['1', '2', '3', '4', '5', '6'];

function updateCounts() {
  const txt = `${achCount()}/${achTotal}`;
  $('#finaleAch').textContent = txt;
  $('#teCount').textContent = txt;
  const done = achCount() >= achTotal;
  $('#lockedEnd').hidden = done;
  const un = $('#unlockedEnd');
  if (done && un.hidden) {
    un.hidden = false;
    buildStickers();
  } else if (!done) un.hidden = true;
}

function buildStickers() {
  const wall = $('#stickerWall');
  wall.innerHTML = '';
  PHOTOS.forEach((n, i) => {
    const img = document.createElement('img');
    img.src = `img/opt/${n}-sm.webp`;
    img.alt = '';
    img.loading = 'lazy';
    img.style.left = `${8 + i * 14 + rand(-3, 3)}%`;
    img.style.top = `${rand(5, 45)}%`;
    img.style.setProperty('--r', `${rand(-14, 14)}deg`);
    img.style.animationDelay = `${i * .12}s`;
    wall.appendChild(img);
  });
}

async function countdown() {
  const cd = $('#countdown');
  const num = $('#cdNum');
  cd.hidden = false;
  document.body.classList.add('modal-open');
  sfx.drumroll(3);
  for (const n of reduceMotion ? ['🎂'] : ['3', '2', '1']) {
    num.textContent = n;
    num.classList.remove('tick'); void num.offsetWidth; num.classList.add('tick');
    sfx.thud();
    await sleep(reduceMotion ? 400 : 950);
  }
  cd.hidden = true;
  document.body.classList.remove('modal-open');
}

async function ceremony() {
  const btn = $('#ceremonyBtn');
  btn.disabled = true;
  await countdown();
  const show = $('#finaleShow');
  show.hidden = false;
  btn.textContent = 'CEREMONY IN PROGRESS ↓';
  show.scrollIntoView({ behavior: 'instant', block: 'start' });
  sfx.levelUp();
  boom(1.6);
  rain(3500);
  setTimeout(playSong, 900);
  setTimeout(() => ($('#xpFill').style.width = '100%'), 400);
}

function openGift() {
  const gift = $('#gift');
  if (gift.classList.contains('opened')) return;
  gift.classList.add('opened');
  gift.setAttribute('aria-expanded', 'true');
  sfx.whoosh();
  setTimeout(() => {
    const letter = $('#letter');
    letter.hidden = false;
    letter.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    boom(.6);
  }, 500);
}

export function initFinale() {
  $('#ceremonyBtn').addEventListener('click', ceremony);
  $('#gift').addEventListener('click', openGift);
  $('#runBack').addEventListener('click', () => { boom(2); rain(2500); playSong(); sfx.levelUp(); });
  document.addEventListener('achievement', updateCounts);
  updateCounts();
}
