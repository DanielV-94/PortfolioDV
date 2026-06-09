/* ═══════════════════════════════════════════════════════════════
   MI TRABAJO — Scroll horizontal pinneado por proyecto
   Cada proyecto se pinnea y la galería se desplaza horizontalmente
═══════════════════════════════════════════════════════════════ */

const MiTrabajo = (() => {
  function init() {
    /* ── Guard clauses ── */
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    /* ── Detección de reduced-motion ── */
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    /* ── Inicializar scroll horizontal por cada proyecto ── */
    const proyectos = document.querySelectorAll('.proyecto');
    if (!proyectos.length) return;

    proyectos.forEach((proyecto) => {
      const galeriaScroll = proyecto.querySelector('.proyecto-galeria-scroll');
      if (!galeriaScroll) return;

      /* Calcular cuánto necesita desplazarse */
      /* La galería empieza con la main visible a la derecha (50% del viewport) */
      const getScrollAmount = () => {
        return -(galeriaScroll.scrollWidth - window.innerWidth);
      };

      /* Posicionar galería inicialmente a la derecha (50% del viewport) */
      gsap.set(galeriaScroll, { x: window.innerWidth * 0.5 });

      /* ── Pin + scroll horizontal ── */
      gsap.to(galeriaScroll, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: proyecto,
          start: 'top top',
          end: () => `+=${galeriaScroll.scrollWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });
    });
  }

  return { init };
})();
