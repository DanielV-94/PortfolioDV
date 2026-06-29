/* ═══════════════════════════════════════════════════════════════
   CONTACTO — Animaciones GSAP premium
   Hero (SplitText + partículas) + Manifiesto (reveal palabras)
   + Cierre (ScrambleText + glow) + Links (stagger cards)
═══════════════════════════════════════════════════════════════ */

const Contacto = (() => {
  function init() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);
    if (typeof ScrambleTextPlugin !== 'undefined') gsap.registerPlugin(ScrambleTextPlugin);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ══════════════════════════════════════════════════════════
       HERO — Intro animada con SplitText y partículas
    ══════════════════════════════════════════════════════════ */
    const heroEtiqueta = document.querySelector('.contacto-hero-etiqueta');
    const heroLineas = document.querySelectorAll('.contacto-hero-titulo .linea-inner');
    const heroSub = document.querySelector('.contacto-hero-sub');
    const scrollIndicador = document.querySelector('.contacto-scroll-indicador');
    const heroParticulas = document.getElementById('contactoParticulas');

    if (prefersReduced) {
      if (heroEtiqueta) heroEtiqueta.style.opacity = '1';
      heroLineas.forEach(l => l.style.transform = 'translateY(0)');
      if (heroSub) heroSub.style.opacity = '1';
      if (scrollIndicador) scrollIndicador.style.opacity = '1';
    } else {
      /* Timeline del hero */
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .to(heroEtiqueta, { opacity: 1, duration: 1, delay: 0.3 })
        .to(heroLineas, { y: 0, duration: 1.2, stagger: 0.15 }, '-=0.6')
        .to(heroSub, { opacity: 0.7, duration: 1 }, '-=0.7')
        .to(scrollIndicador, { opacity: 1, duration: 1 }, '-=0.5');

      /* Ocultar scroll indicador al hacer scroll */
      ScrollTrigger.create({
        start: 'top top',
        end: '200px top',
        onUpdate: (self) => {
          if (self.progress > 0.3) gsap.to(scrollIndicador, { opacity: 0, duration: 0.3 });
        }
      });

      /* ── Partículas flotando en el hero ── */
      if (heroParticulas) {
        const numParticulas = 25;
        const colores = [
          'var(--color-acento)',
          'var(--color-texto-suave)',
          'var(--color-acento-hover)'
        ];

        for (let i = 0; i < numParticulas; i++) {
          const particula = document.createElement('div');
          particula.className = 'contacto-hero-particula';
          const size = gsap.utils.random(2, 5);
          particula.style.width = size + 'px';
          particula.style.height = size + 'px';
          particula.style.background = colores[i % colores.length];
          particula.style.left = gsap.utils.random(5, 95) + '%';
          particula.style.top = gsap.utils.random(10, 90) + '%';
          heroParticulas.appendChild(particula);
        }

        const particulas = heroParticulas.querySelectorAll('.contacto-hero-particula');
        particulas.forEach((p) => {
          gsap.to(p, {
            y: gsap.utils.random(-60, -150),
            x: gsap.utils.random(-20, 20),
            opacity: gsap.utils.random(0.3, 0.7),
            duration: gsap.utils.random(5, 10),
            delay: gsap.utils.random(0, 4),
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        });
      }
    }

    /* ══════════════════════════════════════════════════════════
       MANIFIESTO — Reveal palabra por palabra con scroll
    ══════════════════════════════════════════════════════════ */
    if (!prefersReduced) {
      const manifiestoSection = document.getElementById('contactoManifiesto');
      const manifiestoParrafos = manifiestoSection ?
        manifiestoSection.querySelectorAll('.contacto-manifiesto-contenido p') : [];

      if (manifiestoSection && manifiestoParrafos.length) {
        manifiestoParrafos.forEach(p => {
          const html = p.innerHTML;
          const wrapped = html.replace(/(\S+)/g,
            '<span class="palabra-contacto" style="display:inline-block; opacity:0; transform:translateY(50px) rotateX(20deg); transform-origin:bottom center;">$1</span>');
          p.innerHTML = wrapped;
        });

        const palabras = manifiestoSection.querySelectorAll('.palabra-contacto');
        if (palabras.length) {
          gsap.to(palabras, {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.5,
            stagger: 0.02,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: manifiestoSection,
              start: 'top 75%',
              end: 'bottom 45%',
              scrub: 1.2
            }
          });
        }
      }

      /* ══════════════════════════════════════════════════════════
         CIERRE — Frase impactante con SplitText + glow
      ══════════════════════════════════════════════════════════ */
      const cierreGlow = document.getElementById('contactoCierreGlow');
          /* Glow que aparece con el texto */
          if (cierreGlow) {
            cierreTl.to(cierreGlow, {
              opacity: 0.45,
              scale: 1,
              duration: 1,
              ease: 'power2.out'
            }, 0.3);
          }
       
      /* ══════════════════════════════════════════════════════════
         LINKS — Cards con stagger reveal
      ══════════════════════════════════════════════════════════ */
      const linksSection = document.getElementById('contactoLinks');
      const linksTitulo = linksSection ? linksSection.querySelector('.contacto-links-titulo') : null;
      const linksCards = linksSection ? linksSection.querySelectorAll('.contacto-link-card') : [];

      if (linksSection && linksCards.length) {
        /* Título */
        if (linksTitulo) {
          gsap.to(linksTitulo, {
            opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: linksSection, start: 'top 85%', toggleActions: 'play none none reverse' }
          });
        }

        /* Cards con stagger */
        gsap.to(linksCards, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: linksSection,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        });
      }
    }
  }

  return { init };
})();
