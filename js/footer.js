const Footer = (() => {
  function init() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== 'undefined') {
      gsap.registerPlugin(SplitText);
    }

    const footerCta = document.querySelector('.footer-cta');
    const subtitulo = document.querySelector('.footer-subtitulo');
    const titulo = document.querySelector('.footer-titulo');
    if (!footerCta || !subtitulo || !titulo) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

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

    if (typeof SplitText !== 'undefined') {
      const split = new SplitText(titulo, { type: 'chars' });
      gsap.set(split.chars, { opacity: 0, y: 80, rotateX: -90 });

      const mm = gsap.matchMedia();

      mm.add('(min-width: 1025px)', () => {
        gsap.to(split.chars, {
          scrollTrigger: { trigger: '.footer', start: 'top 75%', once: true },
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.7, stagger: 0.03, ease: 'back.out(1.7)', delay: 0.2
        });
      });

      mm.add('(max-width: 1024px) and (orientation: landscape)', () => {
        gsap.to(split.chars, {
          scrollTrigger: { trigger: '.footer', start: 'top 80%', once: true },
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.6, stagger: 0.025, ease: 'back.out(1.7)', delay: 0.2
        });
      });

      mm.add('(max-width: 1024px) and (orientation: portrait)', () => {
        gsap.to(split.chars, {
          scrollTrigger: { trigger: '.footer', start: 'top 80%', once: true },
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.6, stagger: 0.025, ease: 'back.out(1.7)', delay: 0.2
        });
      });

      mm.add('(max-width: 599px)', () => {
        gsap.to(split.chars, {
          scrollTrigger: { trigger: '.footer', start: 'top 85%', once: true },
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.5, stagger: 0.02, ease: 'back.out(1.5)', delay: 0.15
        });
      });

      mm.add('(max-width: 768px) and (orientation: landscape)', () => {
        gsap.to(split.chars, {
          scrollTrigger: { trigger: '.footer', start: 'top 85%', once: true },
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.5, stagger: 0.02, ease: 'back.out(1.5)', delay: 0.15
        });
      });
    } else {
      gsap.set(titulo, { opacity: 0, y: 60 });
      gsap.to(titulo, {
        scrollTrigger: { trigger: '.footer', start: 'top 80%', once: true },
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power2.out', delay: 0.3
      });
    }

    const flotantes = document.querySelector('.flotantes');
    const temaSelector = document.querySelector('.tema-selector');
    const elementosOcultar = [flotantes, temaSelector].filter(Boolean);

    if (elementosOcultar.length) {
      ScrollTrigger.create({
        trigger: '.footer',
        start: 'top 80%',
        end: 'bottom bottom',
        onEnter: () => gsap.to(elementosOcultar, { opacity: 0, pointerEvents: 'none', duration: 0.4, ease: 'power2.out' }),
        onLeaveBack: () => gsap.to(elementosOcultar, { opacity: 1, pointerEvents: 'auto', duration: 0.4, ease: 'power2.out' })
      });
    }
  }

  return { init };
})();
