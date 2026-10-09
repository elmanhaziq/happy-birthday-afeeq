# AFEEQ.EXE — Classified Birthday Event

Live: https://elmanhaziq.github.io/happy-birthday-afeeq/

A static site (plain HTML/CSS/JS ES modules, no build step) served by GitHub Pages from the root of `main`. Push to `main` and Pages redeploys in about a minute.

## Scenes
1. **Intro**: typewriter cold open → "REVEAL THE VICTIM" → wake him up (3 tries).
2. **The Embarrassment Archive**: classified dossier with click-to-leak redactions, then 6 exhibits revealed one at a time (mugshot, magazine cover, forensic evidence photo, award nomination, CCTV feed, wanted poster).
3. **The Afeeq Multiverse**: choose-your-character with tilt card and joke stats.
4. **The Chaos Room**: DO NOT PRESS, aura detector (hold), system diagnostic, wish generator, a very normal light switch, and the Wake Afeeq Up minigame.
5. **The Finale**: countdown, level-up, spotlight reveal, gift letter, and a secret true ending for 10/10 achievements.

## Secrets
- Type `afeeq` on a keyboard, tap the logo 7 times, or hit the `z z z` in the footer.
- The light switch in the Chaos Room.
- Achievements persist in the visitor's browser (🏆 in the top bar shows hints).

## Editing
- **Birthday letter**: `index.html`, inside `<article class="letter">`. There's an `EDIT` comment where a personal memory can go.
- **Captions and jokes**: exhibit copy is in `index.html`; character stats in `js/multiverse.js`; wishes, diagnostic lines and aura results in `js/chaos.js`; news ticker in `js/archive.js`.
- **Photos**: originals in `img/`, optimised WebP copies in `img/opt/` (`N.webp` full, `N-sm.webp` small).

## Files
```
index.html
css/style.css
js/main.js         entry point
js/core.js         sound, confetti, achievements, toasts, helpers
js/intro.js        scene 01
js/archive.js      scene 02
js/multiverse.js   scene 03
js/chaos.js        scene 04
js/finale.js       scene 05
js/secret.js       dream easter egg
img/, img/opt/
```

Sound is synthesised in the browser with WebAudio (no audio files) and is **off** until the 🔇 toggle is pressed.
