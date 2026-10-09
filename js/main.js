// Entry point: wires up every scene.
import { $, $$, initSound, initAchievements, initImageFallbacks, initReveal } from './core.js?v=8';
import { initIntro, replayIntro } from './intro.js?v=8';
import { initArchive } from './archive.js?v=8';
import { initMultiverse } from './multiverse.js?v=8';
import { initChaos } from './chaos.js?v=8';
import { initFinale } from './finale.js?v=8';
import { initSecret } from './secret.js?v=8';

function initHud() {
  $('[data-scene="intro"]').addEventListener('click', replayIntro);
  const links = new Map($$('.hud-link[href]').map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(entries => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      links.forEach(a => a.classList.remove('active'));
      links.get(en.target.id)?.classList.add('active');
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main .scene').forEach(s => io.observe(s));
}

initImageFallbacks();
initSound();
initAchievements();
initIntro();
initArchive();
initMultiverse();
initChaos();
initFinale();
initSecret();
initHud();
initReveal();
