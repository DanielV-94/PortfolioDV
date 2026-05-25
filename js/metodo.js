/* ═══════════════════════════════════════════════════════════════
   MÉTODO — Scroll horizontal pinneado, 5 actos
═══════════════════════════════════════════════════════════════ */

const Metodo = (() => {
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const section = document.querySelector('.metodo');
    if (!section) return;

    const track   = section.querySelector('.metodo-track');
    const paneles = section.querySelectorAll('.metodo-panel');

    if (!track || !paneles.length) return;

    const mm = gsap.matchMedia();

    /* ══ DESKTOP/TABLET: scroll horizontal pinneado ══ */
    mm.add('(min-width: 600px) and (prefers-reduced-motion: no-preference)', () => {
      const totalWidth = track.scrollWidth;
      const viewWidth  = window.innerWidth;

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

      return () => tl.kill();
    });

    /* ══ MOBILE: scroll vertical normal ══ */
    mm.add('(max-width: 599px) and (prefers-reduced-motion: no-preference)', () => {
      track.style.flexDirection = 'column';
      track.style.width = '100%';

      paneles.forEach(panel => {
        panel.style.width = '100%';
        panel.style.height = 'auto';
        panel.style.minHeight = '80vh';
      });

      gsap.from(paneles, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
        },
      });

      return () => {
        track.style.flexDirection = '';
        track.style.width = '';
        paneles.forEach(p => {
          p.style.width = '';
          p.style.height = '';
          p.style.minHeight = '';
        });
        gsap.set(paneles, { clearProps: 'all' });
      };
    });
  }

  return { init };
})();
