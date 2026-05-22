/* ═══════════════════════════════════════════════════════════════
   HABILIDADES — Scroll horizontal pinneado
   Paneles se desplazan horizontalmente con scrub.
   Títulos e iconos aparecen con stagger al entrar cada panel.
═══════════════════════════════════════════════════════════════ */

const Habilidades = (() => {
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const section = document.querySelector('.habilidades');
    if (!section) return;

    const track   = section.querySelector('.habilidades-track');
    const paneles = section.querySelectorAll('.habilidades-panel');
    const dots    = section.querySelectorAll('.habilidades-dot');

    if (!track || !paneles.length) return;

    const mm = gsap.matchMedia();

    /* ══ DESKTOP / TABLET (≥600px): scroll horizontal pinneado ══ */
    mm.add('(min-width: 600px) and (prefers-reduced-motion: no-preference)', () => {
      const totalWidth = track.scrollWidth;
      const viewWidth  = window.innerWidth;

      /* Timeline principal — mueve el track horizontalmente */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${totalWidth - viewWidth}`,
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            /* Actualizar dots */
            const panelIdx = Math.round(self.progress * (paneles.length - 1));
            dots.forEach((dot, i) => {
              dot.classList.toggle('activo', i === panelIdx);
            });
          },
        },
      });

      tl.to(track, {
        x: () => -(totalWidth - viewWidth),
        ease: 'none',
      });

      /* Animar cada panel cuando entra al viewport */
      paneles.forEach((panel) => {
        const titulo = panel.querySelector('.habilidades-panel-titulo');
        const items  = panel.querySelectorAll('.habilidades-item');

        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: tl,
          start: 'left 80%',
          onEnter: () => {
            if (titulo) {
              gsap.to(titulo, {
                opacity: 1, y: 0,
                duration: 0.6, ease: 'power3.out',
              });
            }
            if (items.length) {
              gsap.to(items, {
                opacity: 1, y: 0, scale: 1,
                duration: 0.5, ease: 'back.out(1.4)',
                stagger: 0.08,
                delay: 0.2,
              });
            }
          },
          onLeaveBack: () => {
            if (titulo) gsap.set(titulo, { opacity: 0, y: 30 });
            if (items.length) gsap.set(items, { opacity: 0, y: 20, scale: 0.85 });
          },
        });
      });

      return () => tl.kill();
    });

    /* ══ MOBILE (<600px): scroll vertical normal, sin pin ══ */
    mm.add('(max-width: 599px) and (prefers-reduced-motion: no-preference)', () => {
      /* En mobile: track es vertical (flex-direction: column) */
      track.style.flexDirection = 'column';
      track.style.width = '100%';

      paneles.forEach((panel) => {
        panel.style.width = '100%';
        panel.style.height = 'auto';
        panel.style.minHeight = '80vh';

        const titulo = panel.querySelector('.habilidades-panel-titulo');
        const items  = panel.querySelectorAll('.habilidades-item');

        ScrollTrigger.create({
          trigger: panel,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            if (titulo) {
              gsap.to(titulo, {
                opacity: 1, y: 0,
                duration: 0.6, ease: 'power3.out',
              });
            }
            if (items.length) {
              gsap.to(items, {
                opacity: 1, y: 0, scale: 1,
                duration: 0.5, ease: 'back.out(1.4)',
                stagger: 0.08,
                delay: 0.15,
              });
            }
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
