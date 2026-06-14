/* ═══════════════════════════════════════════════════════════════
   FOOTER — Animación de entrada del CTA con ScrollTrigger
   Módulo IIFE con revelado al entrar al viewport
═══════════════════════════════════════════════════════════════ */

const Footer = (() => {
  /* ── Inicialización ── */
  function init() {
    /* ── Guard clauses: dependencias GSAP ── */
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    /* ── Registrar plugins ── */
    gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== 'undefined') {
      gsap.registerPlugin(SplitText);
    }

    const footerCta = document.querySelector('.footer-cta');
    const subtitulo = document.querySelector('.footer-subtitulo');
    const titulo = document.querySelector('.footer-titulo');
    if (!footerCta || !subtitulo || !titulo) return;

    /* ── Detección de prefers-reduced-motion ── */
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    /* ── Animación del subtítulo ── */
    gsap.set(subtitulo, { opacity: 0, y: 20 });

    gsap.to(subtitulo, {
      scrollTrigger: {
        trigger: '.footer',
        start: 'top 80%',
        once: true
      },
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    });

    /* ── Animación del título con SplitText (si disponible) ── */
    if (typeof SplitText !== 'undefined') {
      const split = new SplitText(titulo, { type: 'chars' });
      gsap.set(split.chars, { opacity: 0, y: 80, rotateX: -90 });

      const mm = gsap.matchMedia();

      /* ── Desktop (≥1025px) ── */
      mm.add('(min-width: 1025px)', () => {
        gsap.to(split.chars, {
          scrollTrigger: { trigger: '.footer', start: 'top 75%', once: true },
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.7, stagger: 0.03, ease: 'back.out(1.7)', delay: 0.2
        });
      });

      /* ── Tablet landscape (≤1024px, landscape) ── */
      mm.add('(max-width: 1024px) and (orientation: landscape)', () => {
        gsap.to(split.chars, {
          scrollTrigger: { trigger: '.footer', start: 'top 80%', once: true },
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.6, stagger: 0.025, ease: 'back.out(1.7)', delay: 0.2
        });
      });

      /* ── Tablet portrait (≤1024px, portrait) ── */
      mm.add('(max-width: 1024px) and (orientation: portrait)', () => {
        gsap.to(split.chars, {
          scrollTrigger: { trigger: '.footer', start: 'top 80%', once: true },
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.6, stagger: 0.025, ease: 'back.out(1.7)', delay: 0.2
        });
      });

      /* ── Mobile portrait (≤599px) ── */
      mm.add('(max-width: 599px)', () => {
        gsap.to(split.chars, {
          scrollTrigger: { trigger: '.footer', start: 'top 85%', once: true },
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.5, stagger: 0.02, ease: 'back.out(1.5)', delay: 0.15
        });
      });

      /* ── Mobile landscape (≤768px, landscape) ── */
      mm.add('(max-width: 768px) and (orientation: landscape)', () => {
        gsap.to(split.chars, {
          scrollTrigger: { trigger: '.footer', start: 'top 85%', once: true },
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.5, stagger: 0.02, ease: 'back.out(1.5)', delay: 0.15
        });
      });
    } else {
      /* ── Fallback sin SplitText ── */
      gsap.set(titulo, { opacity: 0, y: 60 });
      gsap.to(titulo, {
        scrollTrigger: { trigger: '.footer', start: 'top 80%', once: true },
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power2.out', delay: 0.3
      });
    }
  }

  return { init };
})();
