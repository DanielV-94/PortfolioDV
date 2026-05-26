/* ═══════════════════════════════════════════════════════════════
   MÉTODO — Scroll horizontal + SplitText + ScrambleText
   Animaciones reversibles, capas de profundidad
═══════════════════════════════════════════════════════════════ */

const Metodo = (() => {
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrambleTextPlugin);

    const section = document.querySelector('.metodo');
    if (!section) return;

    const track   = section.querySelector('.metodo-track');
    const paneles = section.querySelectorAll('.metodo-panel');

    if (!track || !paneles.length) return;

    /* ── ScrambleText en hover para el panel manifiesto ── */
    const manifiestoTexto = section.querySelector('.metodo-manifiesto-texto');
    if (manifiestoTexto && typeof SplitText !== 'undefined') {
      const split = new SplitText(manifiestoTexto, { type: 'words', wordsClass: 'metodo-palabra' });

      split.words.forEach(word => {
        const original = word.textContent;
        let scrambleTween = null;

        word.addEventListener('mouseenter', () => {
          if (scrambleTween) scrambleTween.kill();
          scrambleTween = gsap.to(word, {
            duration: 0.6,
            scrambleText: {
              text: original,
              chars: '!<>-_\\/[]{}—=+*^?#_',
              speed: 0.8,
            },
          });
        });
      });
    }

    const mm = gsap.matchMedia();

    /* ══ DESKTOP/TABLET: scroll horizontal + animaciones reversibles ══ */
    mm.add('(min-width: 600px) and (prefers-reduced-motion: no-preference)', () => {
      const totalWidth = track.scrollWidth;
      const viewWidth  = window.innerWidth;

      /* SplitText en todos los elementos animables */
      const splits = [];

      paneles.forEach(panel => {
        const titulo = panel.querySelector('.metodo-panel-titulo');
        const desc   = panel.querySelector('.metodo-panel-desc');
        const lineas = panel.querySelectorAll('.metodo-titulo-linea');

        if (titulo && typeof SplitText !== 'undefined') {
          const s = new SplitText(titulo, { type: 'words' });
          gsap.set(s.words, { opacity: 0, y: 40, rotateX: -15 });
          splits.push(s);
        }
        if (desc && typeof SplitText !== 'undefined') {
          const s = new SplitText(desc, { type: 'words' });
          gsap.set(s.words, { opacity: 0, y: 20 });
          splits.push(s);
        }
        if (lineas.length && typeof SplitText !== 'undefined') {
          lineas.forEach(linea => {
            const s = new SplitText(linea, { type: 'chars' });
            gsap.set(s.chars, { opacity: 0, y: 50, scale: 0.85 });
            splits.push(s);
          });
        }
      });

      /* Timeline principal — scroll horizontal */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${totalWidth - viewWidth}`,
          scrub: 1.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(track, {
        x: () => -(totalWidth - viewWidth),
        ease: 'none',
      });

      /* Animar cada panel — REVERSIBLE (sin once) */
      paneles.forEach(panel => {
        const titulo    = panel.querySelector('.metodo-panel-titulo');
        const desc      = panel.querySelector('.metodo-panel-desc');
        const num       = panel.querySelector('.metodo-panel-num');
        const watermark = panel.querySelector('.metodo-panel-watermark');
        const lineas    = panel.querySelectorAll('.metodo-titulo-linea');
        const manifiesto = panel.querySelector('.metodo-manifiesto-texto');

        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: tl,
          start: 'left 85%',
          end: 'right 15%',
          onEnter: () => animarEntrada(panel, titulo, desc, num, watermark, lineas, manifiesto),
          onEnterBack: () => animarEntrada(panel, titulo, desc, num, watermark, lineas, manifiesto),
          onLeave: () => animarSalida(panel, titulo, desc, num, watermark, lineas, manifiesto),
          onLeaveBack: () => animarSalida(panel, titulo, desc, num, watermark, lineas, manifiesto),
        });
      });

      function animarEntrada(panel, titulo, desc, num, watermark, lineas, manifiesto) {
        if (watermark) {
          gsap.to(watermark, { scale: 1, opacity: 0.06, duration: 1, ease: 'power2.out' });
        }
        if (num) {
          gsap.to(num, { opacity: 0.7, duration: 0.5, ease: 'power2.out' });
        }
        if (titulo) {
          const words = titulo.querySelectorAll('div');
          gsap.to(words, { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out' });
        }
        if (lineas.length) {
          lineas.forEach((linea, i) => {
            const chars = linea.querySelectorAll('div');
            gsap.to(chars, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.02, ease: 'back.out(1.3)', delay: i * 0.15 });
          });
        }
        if (desc) {
          const words = desc.querySelectorAll('div');
          gsap.to(words, { opacity: 1, y: 0, duration: 0.4, stagger: 0.012, ease: 'power2.out', delay: 0.25 });
        }
        if (manifiesto) {
          const words = manifiesto.querySelectorAll('.metodo-palabra');
          gsap.to(words, { opacity: 1, y: 0, duration: 0.4, stagger: 0.01, ease: 'power2.out' });
        }
      }

      function animarSalida(panel, titulo, desc, num, watermark, lineas, manifiesto) {
        if (watermark) {
          gsap.to(watermark, { scale: 1.2, opacity: 0, duration: 0.5, ease: 'power2.in' });
        }
        if (num) {
          gsap.to(num, { opacity: 0, duration: 0.3, ease: 'power2.in' });
        }
        if (titulo) {
          const words = titulo.querySelectorAll('div');
          gsap.to(words, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' });
        }
        if (lineas.length) {
          lineas.forEach(linea => {
            const chars = linea.querySelectorAll('div');
            gsap.to(chars, { opacity: 0, y: -30, scale: 0.9, duration: 0.3, ease: 'power2.in' });
          });
        }
        if (desc) {
          const words = desc.querySelectorAll('div');
          gsap.to(words, { opacity: 0, y: -10, duration: 0.2, ease: 'power2.in' });
        }
        if (manifiesto) {
          const words = manifiesto.querySelectorAll('.metodo-palabra');
          gsap.to(words, { opacity: 0, y: -10, duration: 0.2, ease: 'power2.in' });
        }
      }

      return () => {
        tl.kill();
        splits.forEach(s => s.revert());
      };
    });

    /* ══ MOBILE: scroll vertical ══ */
    mm.add('(max-width: 599px) and (prefers-reduced-motion: no-preference)', () => {
      track.style.flexDirection = 'column';
      track.style.width = '100%';

      paneles.forEach(panel => {
        panel.style.width = '100%';
        panel.style.height = 'auto';
        panel.style.minHeight = '80vh';
      });

      paneles.forEach(panel => {
        const titulo    = panel.querySelector('.metodo-panel-titulo');
        const desc      = panel.querySelector('.metodo-panel-desc');
        const watermark = panel.querySelector('.metodo-panel-watermark');

        ScrollTrigger.create({
          trigger: panel,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            if (watermark) gsap.to(watermark, { opacity: 0.04, duration: 0.8 });
            if (titulo) gsap.from(titulo, { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out' });
            if (desc) gsap.from(desc, { opacity: 0, y: 20, duration: 0.6, delay: 0.2 });
          },
        });
      });

      return () => {
        track.style.flexDirection = '';
        track.style.width = '';
        paneles.forEach(p => {
          p.style.width = '';
          p.style.height = '';
          p.style.minHeight = '';
        });
      };
    });
  }

  return { init };
})();
