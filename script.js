(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ================= SOUND (WebAudio, no files needed) ================= */
  let ctx = null;
  let soundOn = true;
  const audio = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());

  function tone(freq, dur = .15, type = 'square', vol = .08, when = 0) {
    if (!soundOn) return;
    const a = audio();
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
  const sfx = {
    boop: () => { tone(520, .08); tone(780, .1, 'square', .07, .07); },
    bad: () => { tone(160, .25, 'sawtooth', .1); tone(110, .3, 'sawtooth', .1, .12); },
    alarm: () => { for (let i = 0; i < 6; i++) tone(i % 2 ? 1046 : 880, .09, 'square', .07, i * .1); },
    snore: () => { if (!soundOn) return; const a = audio(); const t = a.currentTime; const o = a.createOscillator(); const g = a.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(110, t + .5); o.frequency.linearRampToValueAtTime(60, t + 1);
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.09, t + .3); g.gain.exponentialRampToValueAtTime(.0001, t + 1.05);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + 1.1); },
    pop: () => tone(rand(600, 900), .07, 'triangle', .1),
    whoosh: () => { for (let i = 0; i < 8; i++) tone(300 + i * 90, .06, 'triangle', .05, i * .03); },
  };

  // Happy Birthday melody
  const N = { G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784 };
  const song = [
    ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
    ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
    ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
    ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3],
  ];
  let songPlaying = false;
  function playSong() {
    if (songPlaying || !soundOn) return;
    songPlaying = true;
    const beat = .42;
    let t = 0;
    song.forEach(([n, d]) => {
      tone(N[n], d * beat * .95, 'triangle', .14, t);
      tone(N[n] / 2, d * beat * .9, 'sine', .06, t);
      t += d * beat;
    });
    setTimeout(() => (songPlaying = false), t * 1000);
  }

  $('#soundToggle').addEventListener('click', e => {
    soundOn = !soundOn;
    e.currentTarget.textContent = soundOn ? '🔊' : '🔇';
    e.currentTarget.setAttribute('aria-pressed', soundOn);
  });

  /* ================= CONFETTI ================= */
  const colors = ['#F97316', '#2563EB', '#FF4FA3', '#FFD23F', '#22C55E', '#8B5CF6'];
  function boom(power = 1) {
    if (typeof confetti !== 'function' || reduceMotion) return;
    confetti({ particleCount: 140 * power, spread: 90, origin: { y: .65 }, colors });
    setTimeout(() => confetti({ particleCount: 80 * power, angle: 60, spread: 70, origin: { x: 0, y: .7 }, colors }), 200);
    setTimeout(() => confetti({ particleCount: 80 * power, angle: 120, spread: 70, origin: { x: 1, y: .7 }, colors }), 350);
  }
  function rain(ms = 3500) {
    if (typeof confetti !== 'function' || reduceMotion) return;
    const end = Date.now() + ms;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  /* ================= GATE ================= */
  const gateLines = [
    ['Afeeq is currently asleep.', 'As usual. Wake him up to start the party.'],
    ['…he didn\'t move.', 'Not even a twitch. Try again.'],
    ['He said "lima minit lagi".', 'Classic. Keep going.'],
    ['He rolled over.', 'Progress! Hit it harder!'],
    ['ONE EYE IS OPEN 👁️', 'Last push!!!'],
  ];
  let wakes = 0;
  document.body.classList.add('locked');
  const zzzTimer = setInterval(() => wakes < 1 && sfx.snore(), 2600);

  $('#wakeBtn').addEventListener('click', () => {
    wakes++;
    const photo = $('#gatePhoto');
    photo.classList.remove('shake'); void photo.offsetWidth; photo.classList.add('shake');
    $('#snoozeBar').style.width = (wakes / gateLines.length) * 100 + '%';
    if (wakes < gateLines.length) {
      sfx.alarm();
      $('#gateTitle').textContent = gateLines[wakes][0];
      $('#gateSub').textContent = gateLines[wakes][1];
      $('#wakeBtn').textContent = pick(['WAKE UP!! ⏰', 'BANGUN!! 📢', 'NASI DAH SIAP! 🍚', 'SHAKE HIM 🫨']);
    } else {
      clearInterval(zzzTimer);
      $('#gateTitle').textContent = 'HE\'S AWAKE!!! 🎉';
      $('#gateSub').textContent = 'Quick, before he falls asleep again.';
      $('#wakeBtn').disabled = true;
      sfx.whoosh();
      setTimeout(() => {
        $('#gate').classList.add('open');
        document.body.classList.remove('locked');
        boom(1.3);
        playSong();
        setTimeout(() => $('#gate').remove(), 1000);
      }, 700);
    }
  });

  /* ================= HERO letters ================= */
  document.querySelectorAll('.wobble').forEach((w, wi) => {
    [...w.dataset.text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c;
      s.setAttribute('aria-hidden', 'true');
      s.style.animationDelay = (i * .09 + wi * .3) + 's';
      s.addEventListener('mouseenter', sfx.pop);
      w.appendChild(s);
    });
  });

  // photo follows mouse a bit
  const heroPhoto = $('#heroPhoto');
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - .5) * 14;
      const y = (e.clientY / innerHeight - .5) * 14;
      heroPhoto.style.translate = `${x}px ${y}px`;
    });
  }

  /* ================= TICKER ================= */
  const news = [
    'Local man turns one year older, still has not woken up',
    'Nasi Bamboo Sungai Klah stock rises 300% after Afeeq visit',
    'Scientists confirm Afeeq\'s hair has its own gravitational field',
    'Afeeq falls asleep in car, car had not even started yet',
    'Rice reportedly "too hot", Afeeq blows on it for 45 minutes',
    'Ipoh tourism board considers Afeeq as official mascot',
    'Inter Milan sends birthday wishes (unconfirmed)',
    'Friends compile 4,000 photos of him sleeping, release only 2',
  ];
  const tm = $('#tickerMove');
  tm.innerHTML = [...news, ...news].map(n => `<span>${n}</span>`).join('');

  /* ================= DOCUMENTARY BOARD ================= */
  const photos = [
    { src: 'img/2.jpg', cap: 'Brand ambassador', pos: '50% 60%',
      narr: 'Here we see Afeeq, unpaid brand ambassador for Nasi Bamboo Sungai Klah. He has not received a single sen. He does not care. He is simply happy to be near rice.' },
    { src: 'img/3.jpg', cap: 'Back-seat hibernation', pos: '60% 65%',
      narr: 'The car had been moving for four minutes. That was all it took. Note the perfect head-on-window technique, perfected over many years of practice.' },
    { src: 'img/5.jpg', cap: 'Rice cooling specialist', pos: '65% 45%',
      narr: 'In a rare display of patience, the Afeeq blows on his rice. Experts estimate this will continue for another 40 minutes. The rice is now colder than Antarctica.' },
    { src: 'img/1.jpg', cap: 'Ipoh tourist mode', pos: '20% 90%',
      narr: 'Spotted in the wild streets of old town Ipoh, the Afeeq smiles at the camera while everyone else walks past. He is, as always, slightly lost but thriving.' },
    { src: 'img/4.jpg', cap: 'Ranked match, do not disturb', pos: '55% 50%',
      narr: 'Deep in a ranked match. The house could be on fire. A wedding could be happening in the living room. Nothing will break this concentration. Except a lose streak.' },
    { src: 'img/6.jpg', cap: 'Zero consent selfie', pos: '55% 55%',
      narr: 'A friend took this photo while the subject was unconscious. The lighting is divine. The jawline is sculpted. This is, objectively, art. Afeeq has never seen it. Until today.' },
  ];
  const layout = [ // desktop scatter: left %, top px, rotation
    [3, 40, -6], [36, 20, 4], [69, 60, -3], [8, 430, 5], [40, 420, -4], [70, 450, 7],
  ];
  const board = $('#board');
  photos.forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'polaroid reveal';
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `Open photo: ${p.cap}`);
    const [l, t, r] = layout[i];
    el.style.left = `calc(${l}% )`;
    el.style.top = t + 'px';
    el.style.rotate = r + 'deg';
    el.innerHTML = `<span class="tape"></span><img src="${p.src}" alt="${p.cap}" style="object-position:${p.pos}" loading="lazy"><div class="cap">${p.cap}</div>`;
    board.appendChild(el);
    makeDraggable(el, () => openLightbox(i));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); } });
  });

  let z = 10;
  function makeDraggable(el, onClick) {
    let sx, sy, ox, oy, moved = false, dragging = false;
    const isMobile = () => window.matchMedia('(max-width: 860px)').matches;
    el.addEventListener('pointerdown', e => {
      if (isMobile()) return;
      dragging = true; moved = false;
      sx = e.clientX; sy = e.clientY;
      ox = el.offsetLeft; oy = el.offsetTop;
      el.style.zIndex = ++z;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      if (!moved) { el.classList.add('dragging'); sfx.pop(); }
      moved = true;
      const maxX = board.clientWidth - el.offsetWidth, maxY = board.clientHeight - el.offsetHeight;
      el.style.left = Math.max(0, Math.min(maxX, ox + dx)) + 'px';
      el.style.top = Math.max(0, Math.min(maxY, oy + dy)) + 'px';
      el.style.rotate = Math.max(-15, Math.min(15, dx * .05)) + 'deg';
    });
    const end = () => {
      if (!dragging && !isMobile()) return;
      dragging = false;
      el.classList.remove('dragging');
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', () => { if (!moved) onClick(); moved = false; });
  }

  /* ================= LIGHTBOX ================= */
  const lb = $('#lightbox');
  let lbIdx = 0, typeTimer;
  function openLightbox(i) {
    lbIdx = (i + photos.length) % photos.length;
    const p = photos[lbIdx];
    $('#lbImg').src = p.src;
    $('#lbImg').alt = p.cap;
    typeOut($('#lbCap'), p.narr);
    if (!lb.open) lb.showModal();
    sfx.boop();
  }
  function typeOut(el, text) {
    clearInterval(typeTimer);
    if (reduceMotion) { el.textContent = text; return; }
    el.textContent = '';
    let k = 0;
    typeTimer = setInterval(() => {
      el.textContent = text.slice(0, ++k);
      if (k % 3 === 0) tone(rand(180, 260), .03, 'square', .025);
      if (k >= text.length) clearInterval(typeTimer);
    }, 22);
  }
  $('#lbClose').addEventListener('click', () => lb.close());
  $('#lbPrev').addEventListener('click', () => openLightbox(lbIdx - 1));
  $('#lbNext').addEventListener('click', () => openLightbox(lbIdx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', () => clearInterval(typeTimer));

  /* ================= STATS ================= */
  const stats = [
    ['Sleeping ability', 100, '100/100 (world record)', '#8B5CF6'],
    ['Appetite', 98, '98', '#F97316'],
    ['Smile power', 95, '95', '#FF4FA3'],
    ['Hair volume', 130, '130 (exceeds limit)', '#22C55E', true],
    ['Waking up on time', 4, '4 (ERROR)', '#e11d48'],
    ['Gaming focus', 99, '99', '#2563EB'],
  ];
  const sl = $('#statList');
  stats.forEach(([name, v, label, color, over]) => {
    const li = document.createElement('li');
    li.innerHTML = `<div class="stat-top"><span>${name}</span><span class="val">${label}</span></div>
      <div class="bar${over ? ' overflow' : ''}" role="meter" aria-label="${name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(v, 100)}"><span data-v="${v}" style="background:${color}"></span></div>`;
    sl.appendChild(li);
  });

  /* ================= REVEAL ON SCROLL ================= */
  document.querySelectorAll('.title, .section-sub, .char-card, .holes, .cake-wrap, .letter, .sky')
    .forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      if (en.target.classList.contains('char-card')) {
        en.target.querySelectorAll('.bar span').forEach(b => (b.style.width = b.dataset.v + '%'));
      }
      io.unobserve(en.target);
    });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ================= GAME: WAKE AFEEQ UP ================= */
  const sleepy = [
    { src: 'img/3.jpg', pos: '58% 62%' },
    { src: 'img/6.jpg', pos: '55% 55%' },
  ];
  const eating = { src: 'img/5.jpg', pos: '68% 42%' };
  const awake = { src: 'img/2.jpg', pos: '48% 52%' };

  const holesEl = $('#holes');
  const holes = [];
  for (let i = 0; i < 9; i++) {
    const h = document.createElement('button');
    h.className = 'hole';
    h.type = 'button';
    h.setAttribute('aria-label', `Hole ${i + 1}`);
    h.innerHTML = `<div class="mole"><img alt=""></div><span class="tag" hidden></span>`;
    h.addEventListener('pointerdown', e => hit(i, e));
    holesEl.appendChild(h);
    holes.push({ el: h, img: h.querySelector('img'), tag: h.querySelector('.tag'), kind: null, timer: null });
  }

  let score = 0, timeLeft = 20, running = false, spawnTimer, clockTimer;
  let best = 0;
  try { best = +localStorage.getItem('afeeq-best') || 0; } catch {}
  $('#best').textContent = best;

  function show(i, kind) {
    const h = holes[i];
    const pic = kind === 'eat' ? eating : pick(sleepy);
    h.img.src = pic.src;
    h.img.style.objectPosition = pic.pos;
    h.img.style.transform = 'scale(1.8)';
    h.img.style.transformOrigin = pic.pos;
    h.kind = kind;
    h.tag.hidden = false;
    h.tag.textContent = kind === 'eat' ? 'EATING 🍚' : 'zzz…';
    h.el.classList.add('up');
    h.el.setAttribute('aria-label', kind === 'eat' ? 'Afeeq eating, do not tap' : 'Sleeping Afeeq, tap to wake');
    const stay = Math.max(550, 1100 - (20 - timeLeft) * 25);
    h.timer = setTimeout(() => hide(i), stay);
  }
  function hide(i) {
    const h = holes[i];
    clearTimeout(h.timer);
    h.el.classList.remove('up');
    h.kind = null;
    h.el.setAttribute('aria-label', `Hole ${i + 1}`);
    setTimeout(() => { if (!h.kind) h.tag.hidden = true; }, 180);
  }
  function popText(e, text, bad) {
    const p = document.createElement('div');
    p.className = 'pop' + (bad ? ' bad' : '');
    p.textContent = text;
    const x = e.clientX || innerWidth / 2, y = e.clientY || innerHeight / 2;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }
  function hit(i, e) {
    const h = holes[i];
    if (!running || !h.kind) return;
    h.el.classList.remove('bonk'); void h.el.offsetWidth; h.el.classList.add('bonk');
    if (h.kind === 'sleep') {
      score++;
      sfx.boop();
      h.img.src = awake.src;
      h.img.style.objectPosition = awake.pos;
      h.img.style.transformOrigin = awake.pos;
      h.tag.textContent = 'AWAKE!';
      popText(e, pick(['+1 BANGUN!', '+1 WAKEY', '+1 OI!', '+1 SUBUH!']));
      h.kind = 'done';
      clearTimeout(h.timer);
      h.timer = setTimeout(() => hide(i), 350);
    } else if (h.kind === 'eat') {
      score = Math.max(0, score - 2);
      sfx.bad();
      popText(e, '-2 HE\'S EATING!!', true);
      h.kind = 'done';
      clearTimeout(h.timer);
      h.timer = setTimeout(() => hide(i), 300);
    }
    $('#score').textContent = score;
  }
  function spawn() {
    const free = holes.map((h, i) => (h.kind ? -1 : i)).filter(i => i >= 0);
    if (free.length) show(pick(free), Math.random() < .22 ? 'eat' : 'sleep');
    if (timeLeft < 12 && Math.random() < .5 && free.length > 1) show(pick(free.filter(f => !holes[f].kind)), 'sleep');
    spawnTimer = setTimeout(spawn, Math.max(380, 800 - (20 - timeLeft) * 22));
  }
  function startGame() {
    score = 0; timeLeft = 20; running = true;
    $('#score').textContent = 0;
    $('#time').textContent = 20;
    $('#gameMsg').textContent = 'GO GO GO!!!';
    $('#startGame').disabled = true;
    sfx.alarm();
    spawn();
    clockTimer = setInterval(() => {
      timeLeft--;
      $('#time').textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }
  function endGame() {
    running = false;
    clearTimeout(spawnTimer);
    clearInterval(clockTimer);
    holes.forEach((_, i) => hide(i));
    const ranks = [
      [0, 'You are as sleepy as Afeeq himself. 😴'],
      [6, 'Rank: Snoozed alarm clock. ⏰'],
      [11, 'Rank: Mak shouting at 7am. 📢'],
      [16, 'Rank: Bucket of cold water. 🪣'],
      [21, 'LEGENDARY: You woke Afeeq up. Nobody has ever done this. 👑'],
    ];
    const msg = ranks.filter(([m]) => score >= m).pop()[1];
    let newBest = false;
    if (score > best) {
      best = score; newBest = true;
      try { localStorage.setItem('afeeq-best', best); } catch {}
      $('#best').textContent = best;
    }
    $('#gameMsg').textContent = `${score} wake-ups. ${msg}${newBest && score > 0 ? ' NEW BEST!' : ''}`;
    $('#startGame').disabled = false;
    $('#startGame').textContent = 'AGAIN ⏰';
    if (score >= 11) boom(.7);
  }
  $('#startGame').addEventListener('click', startGame);

  /* ================= CAKE ================= */
  const CANDLES = 5;
  const candlesEl = $('#candles');
  let lit = CANDLES;
  for (let i = 0; i < CANDLES; i++) {
    const c = document.createElement('button');
    c.className = 'candle';
    c.type = 'button';
    c.setAttribute('aria-label', `Blow out candle ${i + 1}`);
    c.innerHTML = '<span class="flame"></span>';
    c.addEventListener('click', () => blowOut(c));
    candlesEl.appendChild(c);
  }
  const cakeLines = ['Keep going!', 'Bigger breath!', 'Almost!!', 'ONE MORE!!!'];
  function blowOut(c) {
    if (c.classList.contains('out')) return;
    c.classList.add('out');
    c.setAttribute('aria-label', 'Candle out');
    lit--;
    tone(rand(300, 400), .2, 'sine', .06);
    if (lit > 0) {
      $('#cakeMsg').textContent = cakeLines[CANDLES - lit - 1] || 'Keep going!';
    } else {
      stopMic();
      $('#cakeEl').classList.add('party');
      $('#cakeMsg').textContent = '🎉 WISH GRANTED! (pending approval from Afeeq\'s sleep schedule) 🎉';
      boom(1.5);
      rain(4000);
      playSong();
      setTimeout(relight, 9000);
    }
  }
  function relight() {
    lit = CANDLES;
    $('#cakeEl').classList.remove('party');
    candlesEl.querySelectorAll('.candle').forEach((c, i) => { c.classList.remove('out'); c.setAttribute('aria-label', `Blow out candle ${i + 1}`); });
    $('#cakeMsg').textContent = 'The candles magically relit. Blow again if you want 🔁';
  }

  let micStream = null, micRaf = null;
  async function startMic() {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const a = audio();
      const src = a.createMediaStreamSource(micStream);
      const an = a.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const data = new Uint8Array(an.fftSize);
      let loud = 0;
      $('#micBtn').textContent = '🎤 Listening… BLOW!';
      $('#cakeMsg').textContent = 'Blow into your mic! 💨';
      const loop = () => {
        an.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += ((v - 128) / 128) ** 2;
        const rms = Math.sqrt(sum / data.length);
        if (rms > .18) {
          loud++;
          if (loud > 6) {
            loud = 0;
            const next = candlesEl.querySelector('.candle:not(.out)');
            if (next) blowOut(next);
          }
        } else loud = Math.max(0, loud - 1);
        micRaf = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      $('#cakeMsg').textContent = 'No mic? No problem. Just tap the candles 👆';
    }
  }
  function stopMic() {
    cancelAnimationFrame(micRaf);
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    micStream = null;
    $('#micBtn').textContent = '🎤 Use microphone';
  }
  $('#micBtn').addEventListener('click', () => (micStream ? stopMic() : startMic()));
  $('#songBtn').addEventListener('click', () => { playSong(); boom(.6); });

  /* ================= WISH BALLOONS ================= */
  const sky = $('#sky');
  const seedWishes = [
    'Unlimited Nasi Bamboo forever',
    'Wake up before 12pm (one day)',
    'Win every ranked match',
    'Hair stays this majestic',
    'Inter Milan wins everything',
    'A car ride without falling asleep',
    'Rice that is the perfect temperature',
    'Stay awesome, bro',
  ];
  const balloonColors = ['#FF4FA3', '#FFD23F', '#22C55E', '#7dd3fc', '#F97316', '#c4b5fd'];
  for (let i = 0; i < 5; i++) {
    const c = document.createElement('div');
    c.className = 'cloud';
    const w = rand(80, 160);
    Object.assign(c.style, { width: w + 'px', height: w * .38 + 'px', top: rand(5, 60) + '%', animationDuration: rand(30, 60) + 's', animationDelay: -rand(0, 50) + 's' });
    sky.appendChild(c);
  }
  function releaseBalloon(text, delay = 0) {
    const b = document.createElement('div');
    b.className = 'balloon';
    const dur = rand(9, 14);
    b.style.left = rand(2, 78) + '%';
    b.style.setProperty('--tilt', rand(-12, 12) + 'deg');
    b.style.animationDuration = dur + 's';
    b.style.animationDelay = delay + 's';
    b.innerHTML = `<div class="b" style="background:${pick(balloonColors)}"></div><div class="str"></div>`;
    b.querySelector('.b').textContent = text;
    sky.appendChild(b);
    setTimeout(() => b.remove(), (dur + delay) * 1000 + 200);
  }
  let seedIdx = 0;
  function seedLoop() {
    releaseBalloon(seedWishes[seedIdx++ % seedWishes.length]);
    setTimeout(seedLoop, rand(2200, 3400));
  }
  if (!reduceMotion) seedLoop();

  $('#wishForm').addEventListener('submit', e => {
    e.preventDefault();
    const inp = $('#wishInput');
    const text = inp.value.trim();
    if (!text) { inp.focus(); return; }
    releaseBalloon(text);
    sfx.whoosh();
    inp.value = '';
    if (typeof confetti === 'function' && !reduceMotion) confetti({ particleCount: 40, spread: 60, origin: { y: .8 }, colors });
  });

  /* ================= FINAL ================= */
  $('#finalBtn').addEventListener('click', () => { boom(2); rain(2500); playSong(); });

  // Konami-ish easter egg: type "afeeq"
  let typed = '';
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    typed = (typed + e.key.toLowerCase()).slice(-5);
    if (typed === 'afeeq') {
      document.body.style.transition = 'transform 1s';
      document.body.style.transform = 'rotate(360deg)';
      sfx.whoosh(); boom(1);
      setTimeout(() => { document.body.style.transform = ''; }, 1100);
    }
  });
})();
