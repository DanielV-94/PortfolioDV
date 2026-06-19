/* ═══════════════════════════════════════════════════════════════
   SOBRE MÍ — Animaciones GSAP completas
   Hero + Historia (tilt 3D) + Manifiesto + Timeline + CTA
═══════════════════════════════════════════════════════════════ */

const SobreMi = (() => {
  function init() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ══════════════════════════════════════════════════════════
       ESPIRAL 3D — Hélice horizontal (acostada) de imágenes
       Cada imagen se distribuye en una trayectoria helicoidal:
       X = avance lineal, Y = sin(θ) * radio, Z = cos(θ) * radio
       La hélice cubre 1.5 vueltas (540°)
    ══════════════════════════════════════════════════════════ */
    const espiralTrack = document.getElementById('sobreEspiralTrack');
    const espiralItems = document.querySelectorAll('.sobre-espiral-item');

    if (espiralTrack && espiralItems.length) {
      const numItems = espiralItems.length;
      /* Parámetros de la hélice */
      const totalRotation = 540; /* 1.5 vueltas en grados */
      const angleStep = totalRotation / numItems;
      const radiusY = 200; /* radio vertical de la hélice */
      const radiusZ = 400; /* radio de profundidad */
      const spreadX = 900; /* extensión horizontal total */

      /* Posicionar cada imagen en la hélice */
      espiralItems.forEach((item, i) => {
        const angle = (angleStep * i) * (Math.PI / 180); /* convertir a radianes */
        const progress = i / (numItems - 1); /* 0 → 1 progreso lineal */

        /* Coordenadas helicoidales */
        const x = (progress - 0.5) * spreadX;
        const y = Math.sin(angle) * radiusY;
        const z = Math.cos(angle) * radiusZ;

        /* Opacidad y blur según profundidad (z negativo = atrás) */
        const depthNormalized = (z + radiusZ) / (radiusZ * 2); /* 0 (atrás) → 1 (frente) */
        const opacity = 0.3 + depthNormalized * 0.7;
        const blur = (1 - depthNormalized) * 3;
        const scale = 0.7 + depthNormalized * 0.3;

        gsap.set(item, {
          x: x,
          y: y,
          z: z,
          scale: scale,
          opacity: opacity,
          filter: `blur(${blur}px) saturate(${0.6 + depthNormalized * 0.4}) brightness(${0.6 + depthNormalized * 0.35})`,
          zIndex: Math.round(depthNormalized * 100)
        });
      });

      /* Rotación continua de la hélice */
      if (!prefersReduced) {
        /* Animar re-posicionando los items continuamente */
        const animState = { angle: 0 };
        gsap.to(animState, {
          angle: 360,
          ease: 'none',
          duration: 25,
          repeat: -1,
          onUpdate: function() {
            const offset = animState.angle * (Math.PI / 180);
            espiralItems.forEach((item, i) => {
              const baseAngle = (angleStep * i) * (Math.PI / 180);
              const currentAngle = baseAngle + offset;
              const progress = i / (numItems - 1);

              const x = (progress - 0.5) * spreadX;
              const y = Math.sin(currentAngle) * radiusY;
              const z = Math.cos(currentAngle) * radiusZ;

              const depthNormalized = (z + radiusZ) / (radiusZ * 2);
              const opacity = 0.3 + depthNormalized * 0.7;
              const blur = (1 - depthNormalized) * 3;
              const scale = 0.7 + depthNormalized * 0.3;

              gsap.set(item, {
                x: x,
                y: y,
                z: z,
                scale: scale,
                opacity: opacity,
                filter: `blur(${blur}px) saturate(${0.6 + depthNormalized * 0.4}) brightness(${0.6 + depthNormalized * 0.35})`,
                zIndex: Math.round(depthNormalized * 100)
              });
            });
          }
        });
      }
    }

    /* ══════════════════════════════════════════════════════════
       HERO — Intro animada
    ══════════════════════════════════════════════════════════ */
    const heroEtiqueta = document.querySelector('.sobre-hero-etiqueta');
    const heroLineas = document.querySelectorAll('.sobre-hero-titulo .linea-inner');
    const heroSubtitulo = document.querySelector('.sobre-hero-subtitulo');
    const scrollIndicador = document.querySelector('.sobre-scroll-indicador');

    if (prefersReduced) {
      if (heroEtiqueta) heroEtiqueta.style.opacity = '1';
      heroLineas.forEach(l => l.style.transform = 'translateY(0)');
      if (heroSubtitulo) heroSubtitulo.style.opacity = '1';
      if (scrollIndicador) scrollIndicador.style.opacity = '1';
    } else {
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .to(heroEtiqueta, { opacity: 1, duration: 1, delay: 0.5 })
        .to(heroLineas, { y: 0, duration: 1.2, stagger: 0.15 }, '-=0.5')
        .to(heroSubtitulo, { opacity: 1, duration: 1 }, '-=0.8')
        .to(scrollIndicador, { opacity: 1, duration: 1 }, '-=0.5');

      ScrollTrigger.create({
        start: 'top top',
        end: '200px top',
        onUpdate: (self) => {
          if (self.progress > 0.3) gsap.to(scrollIndicador, { opacity: 0, duration: 0.3 });
        }
      });
    }

    /* ══════════════════════════════════════════════════════════
       TILT 3D — Imagen de historia
    ══════════════════════════════════════════════════════════ */
    const tiltCard = document.getElementById('tiltCard');
    const tiltBg = document.getElementById('tiltBg');
    const tiltFront = document.getElementById('tiltFront');
    const tiltShine = document.getElementById('tiltShine');
    const tiltGlare = document.getElementById('tiltGlare');
    const tiltShadow = document.getElementById('tiltShadow');
    const tiltImagen = document.getElementById('tiltImagen');

    if (tiltImagen && tiltCard && !prefersReduced) {
      const maxTilt = 15;
      let currentX = 0, currentY = 0;
      let targetX = 0, targetY = 0;
      let rafId = null;
      let isHovering = false;

      function updateTilt() {
        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;
        tiltCard.style.transform = `rotateX(${currentY}deg) rotateY(${currentX}deg)`;
        if (tiltBg) tiltBg.style.transform = `translateZ(-50px) scale(1.1) translate(${-currentX * 0.5}px, ${-currentY * 0.5}px)`;
        if (tiltFront) tiltFront.style.transform = `translateZ(40px) translate(${currentX * 1.2}px, ${currentY * 1.2}px)`;
        const frontImg = tiltFront ? tiltFront.querySelector('img') : null;
        if (frontImg) frontImg.style.transform = `scale(1.05) translate(${currentX * 0.3}px, ${currentY * 0.3}px)`;
        if (tiltShadow) tiltShadow.style.transform = `translateZ(-100px) translate(${-currentX * 2}px, ${currentY * 1.5}px) scale(${1 + Math.abs(currentX) / 50})`;
        if (isHovering || Math.abs(currentX - targetX) > 0.01 || Math.abs(currentY - targetY) > 0.01) {
          rafId = requestAnimationFrame(updateTilt);
        }
      }

      tiltImagen.addEventListener('mouseenter', () => {
        isHovering = true;
        if (!rafId) rafId = requestAnimationFrame(updateTilt);
        gsap.to(tiltCard, { scale: 1.02, duration: 0.6, ease: 'power3.out' });
      });

      tiltImagen.addEventListener('mousemove', (e) => {
        const rect = tiltImagen.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const percentX = (x / rect.width) * 2 - 1;
        const percentY = (y / rect.height) * 2 - 1;
        targetX = percentX * maxTilt;
        targetY = -percentY * maxTilt;
        if (tiltShine) tiltShine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 30%, transparent 60%)`;
        if (tiltGlare) tiltGlare.style.background = `linear-gradient(${135 + percentX * 30}deg, transparent 0%, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%, transparent 100%)`;
      });

      tiltImagen.addEventListener('mouseleave', () => {
        isHovering = false;
        targetX = 0;
        targetY = 0;
        gsap.to(tiltCard, { scale: 1, duration: 0.8, ease: 'power3.out' });
        if (!rafId) rafId = requestAnimationFrame(updateTilt);
      });
    }

    /* ══════════════════════════════════════════════════════════
       SCROLL REVEALS — Historia, Manifiesto, Timeline
    ══════════════════════════════════════════════════════════ */
    if (!prefersReduced) {
      /* Imágenes de historia */
      document.querySelectorAll('.sobre-historia-imagen').forEach(img => {
        gsap.fromTo(img, { y: 80, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: img, start: 'top 80%', toggleActions: 'play none none reverse' }
        });
      });

      /* Párrafos de historia */
      document.querySelectorAll('.sobre-historia-contenido p').forEach(p => {
        gsap.fromTo(p, { y: 40, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: p, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
      });

      /* Títulos de historia (reveal char by char) */
      document.querySelectorAll('.reveal-texto').forEach(text => {
        gsap.fromTo(text, { y: 30, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: text, start: 'top 80%', toggleActions: 'play none none reverse' }
        });
      });

      /* Manifiesto */
      document.querySelectorAll('.sobre-manifiesto-contenido p').forEach(p => {
        gsap.fromTo(p, { y: 60, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: p, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
      });

      /* Timeline cards — stack con scroll y rotación */
      const timelineSection = document.getElementById('sobreTimeline');
      const timelineStack = document.getElementById('sobreTimelineStack');
      const timelineCards = document.querySelectorAll('.sobre-timeline-card');

      if (timelineSection && timelineCards.length) {
        const isMobile = window.matchMedia('(max-width: 599px)').matches;
        const isMobileLandscape = window.matchMedia('(max-width: 768px) and (orientation: landscape)').matches;

        if (!isMobile && !isMobileLandscape) {
          /* Desktop/Tablet — Cards distribuidas por el viewport con rotación.
             Cada card tiene una posición X destino repartida por el ancho
             y una rotación tipo naipes esparcidos. */
          const numCards = timelineCards.length;
          const rotations = [-8, -5, 4, -2, 6, -4, 7, -6];
          /* Posiciones X finales — distribuidas por el viewport (% del ancho del stack) */
          const positionsX = [-38, -18, -5, 12, -28, 8, 28, 38];
          /* Posiciones Y finales — ligera variación vertical */
          const positionsY = [-8, 5, -12, 10, 15, -5, 8, -10];

          /* Posicionar todas las cards ocultas debajo */
          timelineCards.forEach((card, i) => {
            gsap.set(card, {
              rotation: rotations[i],
              xPercent: -50,
              yPercent: -50,
              left: '50%',
              top: '50%',
              x: 0,
              y: 600,
              opacity: 0,
              scale: 0.88
            });
          });

          /* Cada card se revela con su propio ScrollTrigger secuencial.
             El end de una es el start de la siguiente. */
          const scrollPerCard = 350; /* px de scroll para revelar cada card */

          timelineCards.forEach((card, i) => {
            const vw = window.innerWidth;
            const targetX = (positionsX[i] / 100) * vw;
            const targetY = positionsY[i];

            gsap.to(card, {
              x: targetX,
              y: targetY,
              opacity: 1,
              scale: 1,
              duration: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: timelineSection,
                start: `top+=${i * scrollPerCard} 50%`,
                end: `top+=${i * scrollPerCard + scrollPerCard} 50%`,
                scrub: 1.2
              }
            });
          });

        } else {
          /* Mobile — Cards sin tilt, apilándose una sobre otra con fade in */
          timelineCards.forEach((card) => {
            gsap.fromTo(card, { y: 60, opacity: 0 }, {
              y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' }
            });
          });
        }
      }
    }

    /* ══════════════════════════════════════════════════════════
       CTA — Luces de teatro con scroll
    ══════════════════════════════════════════════════════════ */
    const ctaSection = document.getElementById('sobreCta');
    const ctaLuzIzq = document.getElementById('ctaLuzIzq');
    const ctaLuzDer = document.getElementById('ctaLuzDer');
    const ctaGlow = document.getElementById('ctaGlow');

    if (ctaSection && !prefersReduced) {
      const ctaTl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaSection,
          start: 'top bottom',
          end: 'bottom 40%',
          scrub: 1.2
        }
      });

      /* Luces laterales */
      ctaTl.to(ctaLuzIzq, { opacity: 1, x: 0, duration: 1 }, 0);
      ctaTl.to(ctaLuzDer, { opacity: 1, x: 0, duration: 1 }, 0);
      ctaTl.to(ctaGlow, { opacity: 1, scale: 1, duration: 1 }, 0.2);

      /* Etiqueta y título */
      ctaTl.to('.sobre-cta-etiqueta', { opacity: 1, duration: 0.3 }, 0.3);
      ctaTl.to('.sobre-cta-titulo', { opacity: 1, duration: 0.4 }, 0.35);

      /* Párrafos */
      document.querySelectorAll('.sobre-cta-parrafo').forEach((p, idx) => {
        ctaTl.to(p, { opacity: 1, y: 0, duration: 0.3 }, 0.4 + idx * 0.08);
      });

      /* Divisores */
      document.querySelectorAll('.sobre-cta-divisor').forEach((d, idx) => {
        ctaTl.to(d, { opacity: 1, scaleX: 1, duration: 0.2 }, 0.5 + idx * 0.12);
      });

      /* Botón */
      ctaTl.to('.sobre-cta-boton', { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.4)' }, 0.85);
    }
  }

  return { init };
})();
