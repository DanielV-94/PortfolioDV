/* ═══════════════════════════════════════════════════════════════
   SOBRE MÍ — Animaciones GSAP (Hero + secciones)
   Se irá expandiendo sección por sección.
═══════════════════════════════════════════════════════════════ */

const SobreMi = (() => {
  function init() {
    /* ── Guard clauses ── */
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    /* ── Detección de reduced-motion ── */
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ══════════════════════════════════════════════════════════
       HERO — Intro animada
    ══════════════════════════════════════════════════════════ */
    const heroEtiqueta = document.querySelector('.sobre-hero-etiqueta');
    const heroLineas = document.querySelectorAll('.sobre-hero-titulo .linea-inner');
    const heroSubtitulo = document.querySelector('.sobre-hero-subtitulo');
    const scrollIndicador = document.querySelector('.sobre-scroll-indicador');

    if (prefersReduced) {
      /* Sin animaciones — mostrar todo directamente */
      if (heroEtiqueta) heroEtiqueta.style.opacity = '1';
      heroLineas.forEach(l => l.style.transform = 'translateY(0)');
      if (heroSubtitulo) heroSubtitulo.style.opacity = '1';
      if (scrollIndicador) scrollIndicador.style.opacity = '1';
      return;
    }

    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .to(heroEtiqueta, { opacity: 1, duration: 1, delay: 0.5 })
      .to(heroLineas, { y: 0, duration: 1.2, stagger: 0.15 }, '-=0.5')
      .to(heroSubtitulo, { opacity: 1, duration: 1 }, '-=0.8')
      .to(scrollIndicador, { opacity: 1, duration: 1 }, '-=0.5');

    /* Ocultar scroll indicador al hacer scroll */
    ScrollTrigger.create({
      start: 'top top',
      end: '200px top',
      onUpdate: (self) => {
        if (self.progress > 0.3) {
          gsap.to(scrollIndicador, { opacity: 0, duration: 0.3 });
        }
      }
    });
  }

  return { init };
})();
