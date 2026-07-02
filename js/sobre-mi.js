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
      const totalRotation = 640; /* 1.5 vueltas en grados */
      const angleStep = totalRotation / numItems;
      const radiusY = 200; /* radio vertical de la hélice */
      const radiusZ = 500; /* radio de profundidad */
      const spreadX = 1200; /* extensión horizontal total */

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

      /* Tablet portrait: blur imagen cuando texto aparece */
      document.querySelectorAll('.sobre-historia').forEach(section => {
        const imagen = section.querySelector('.sobre-historia-imagen');
        const contenido = section.querySelector('.sobre-historia-contenido');
        if (imagen && contenido) {
          ScrollTrigger.create({
            trigger: contenido,
            start: 'top 85%',
            onEnter: () => imagen.classList.add('texto-visible'),
            onLeaveBack: () => imagen.classList.remove('texto-visible'),
          });
        }
      });

      /* Títulos de historia (reveal char by char) */
      document.querySelectorAll('.reveal-texto').forEach(text => {
        gsap.fromTo(text, { y: 30, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: text, start: 'top 80%', toggleActions: 'play none none reverse' }
        });
      });

      /* Manifiesto — Reveal escalonado palabra por palabra */
      const manifiestoSection = document.querySelector('.sobre-manifiesto');
      const manifiestoParrafos = document.querySelectorAll('.sobre-manifiesto-contenido p');

      if (manifiestoSection && manifiestoParrafos.length) {
        /* Envolver cada palabra en un span para animarla individualmente */
        manifiestoParrafos.forEach(p => {
          const html = p.innerHTML;
          /* Preservar tags <strong> y <em> pero envolver cada palabra */
          const wrapped = html.replace(/(\S+)/g, '<span class="palabra-manifiesto" style="display:inline-block; opacity:0; transform:translateY(60px) rotateX(25deg); transform-origin:bottom center;">$1</span>');
          p.innerHTML = wrapped;
        });

        const palabras = manifiestoSection.querySelectorAll('.palabra-manifiesto');

        if (palabras.length) {
          gsap.to(palabras, {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.6,
            stagger: 0.03,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: manifiestoSection,
              start: 'top 70%',
              end: 'bottom 40%',
              scrub: 1.5
            }
          });
        }
      }

      /* Timeline cards — stack con scroll y rotación */
      const timelineSection = document.getElementById('sobreTimeline');
      const timelineCards = document.querySelectorAll('.sobre-timeline-card');

      if (timelineSection && timelineCards.length) {
        const isMobile = window.matchMedia('(max-width: 599px)').matches;
        const isMobileLandscape = window.matchMedia('(max-width: 768px) and (orientation: landscape)').matches;
        const isTablet = window.matchMedia('(max-width: 1024px) and (min-width: 600px)').matches;

        if (!isMobile && !isMobileLandscape && !isTablet) {
          /* Desktop — Cards reveladas secuencialmente con pin.
             Una sola timeline scrubbeada que pinnea la sección
             y revela cards una por una. */
          const rotations = [-8, -5, 4, -2, 6, -4, 7, -6];
          const positionsX = [-38, -18, -5, 12, -28, 8, 28, 38];
          const positionsY = [-100, -85, -105, -80, -75, -95, -82, -98];

          /* Posicionar todas las cards ocultas debajo */
          timelineCards.forEach((card, i) => {
            gsap.set(card, {
              rotation: rotations[i % rotations.length],
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

          /* Timeline única con pin — revela una card por segmento */
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: timelineSection,
              start: 'top top',
              end: `+=${timelineCards.length * 350}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            }
          });

          timelineCards.forEach((card, i) => {
            const vw = window.innerWidth;
            const targetX = (positionsX[i % positionsX.length] / 100) * vw;
            const targetY = positionsY[i % positionsY.length];

            tl.to(card, {
              x: targetX,
              y: targetY,
              opacity: 1,
              scale: 1,
              duration: 1,
              ease: 'power2.out',
            }, i * 0.8);
          });

          /* Pequeña pausa al final para que se vean todas */
          tl.to({}, { duration: 0.5 });

        } else if (isTablet) {
          /* Tablet — Cards en grid 2 columnas con fade in al scroll */
          timelineCards.forEach((card) => {
            gsap.fromTo(card, { opacity: 0, y: 40 }, {
              opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' }
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

        /* ── Card modal — click to expand ── */
        const overlay = document.getElementById('sobreTimelineOverlay');
        let cardExpandidaOriginalParent = null;
        let cardExpandidaNextSibling = null;

        function expandirCard(card) {
          /* Guardar posición original en el DOM */
          cardExpandidaOriginalParent = card.parentNode;
          cardExpandidaNextSibling = card.nextSibling;
          /* Guardar estilos inline originales para restaurar después */
          card._estiloOriginal = card.getAttribute('style') || '';
          /* Mover card al body para escapar de stacking contexts */
          document.body.appendChild(card);
          /* Limpiar estilos inline de GSAP que interfieren */
          card.removeAttribute('style');
          card.style.cursor = 'pointer';
          card.classList.add('card-expandida');
          if (overlay) overlay.classList.add('activo');
          document.body.style.overflow = 'hidden';
        }

        function cerrarCard() {
          const cardExpandida = document.querySelector('.sobre-timeline-card.card-expandida');
          if (cardExpandida) {
            cardExpandida.classList.remove('card-expandida');
            /* Devolver card a su posición original en el DOM */
            if (cardExpandidaOriginalParent) {
              if (cardExpandidaNextSibling) {
                cardExpandidaOriginalParent.insertBefore(cardExpandida, cardExpandidaNextSibling);
              } else {
                cardExpandidaOriginalParent.appendChild(cardExpandida);
              }
            }
            /* Restaurar estilos inline originales (posición GSAP) */
            if (cardExpandida._estiloOriginal) {
              cardExpandida.setAttribute('style', cardExpandida._estiloOriginal);
            }
            cardExpandidaOriginalParent = null;
            cardExpandidaNextSibling = null;
          }
          if (overlay) overlay.classList.remove('activo');
          document.body.style.overflow = '';
        }

        timelineCards.forEach(card => {
          card.style.cursor = 'pointer';
          card.addEventListener('click', (e) => {
            /* No expandir si se clickeó un enlace */
            if (e.target.closest('a')) return;
            /* No expandir si ya está expandida o si se clickeó el botón cerrar */
            if (card.classList.contains('card-expandida')) return;
            expandirCard(card);
          });

          const cerrarBtn = card.querySelector('.sobre-timeline-card-cerrar');
          if (cerrarBtn) {
            cerrarBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              cerrarCard();
            });
          }
        });

        /* Cerrar al hacer click en el overlay */
        if (overlay) {
          overlay.addEventListener('click', cerrarCard);
        }

        /* Cerrar con Escape */
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') cerrarCard();
        });
      }
    }

    /* ══════════════════════════════════════════════════════════
       CTA — Luces + partículas + reveal editorial tipo manifiesto
    ══════════════════════════════════════════════════════════ */
    const ctaSection = document.getElementById('sobreCta');
    const ctaLuzIzq = document.getElementById('ctaLuzIzq');
    const ctaLuzDer = document.getElementById('ctaLuzDer');
    const ctaGlow = document.getElementById('ctaGlow');
    const ctaParticulas = document.getElementById('ctaParticulas');

    if (ctaSection && !prefersReduced) {

      /* ── Partículas flotando — usan variables del tema ── */
      if (ctaParticulas) {
        const esMovilTablet = window.matchMedia('(max-width: 1024px)').matches;
        const numParticulas = esMovilTablet ? 90 : 60;
        /* Cada partícula usa --manifiesto-neon-color como base
           y una de las variables neon-s1 a s6 como box-shadow */
        const sombras = [
          'var(--manifiesto-neon-color1)',
          'var(--manifiesto-neon-color2)',
          'var(--manifiesto-neon-color3)',
          'var(--manifiesto-neon-color4)',
          'var(--manifiesto-neon-color5)',
          'var(--manifiesto-neon-color6)'
        ];

        for (let i = 0; i < numParticulas; i++) {
          const particula = document.createElement('div');
          particula.className = 'sobre-cta-particula';
          const size = esMovilTablet ? gsap.utils.random(5, 14) : gsap.utils.random(3, 9);
          const sombra = sombras[i % sombras.length];
          particula.style.width = size + 'px';
          particula.style.height = size + 'px';
          particula.style.background = 'var(--manifiesto-neon-color)';
          particula.style.boxShadow = `0 0 ${size * 3}px ${sombra}, 0 0 ${size * 6}px ${sombra}`;
          particula.style.left = gsap.utils.random(2, 98) + '%';
          particula.style.top = gsap.utils.random(2, 98) + '%';
          particula.style.opacity = '0';
          ctaParticulas.appendChild(particula);
        }

        const particulas = ctaParticulas.querySelectorAll('.sobre-cta-particula');

        particulas.forEach((p) => {
          const duracion = gsap.utils.random(3, 8);
          const delay = gsap.utils.random(0, 4);
          gsap.to(p, {
            y: gsap.utils.random(-100, -250),
            x: gsap.utils.random(-50, 50),
            opacity: gsap.utils.random(0.7, 1),
            duration: duracion,
            delay: delay,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        });

        gsap.fromTo(ctaParticulas, { opacity: 0 }, {
          opacity: 1, duration: esMovilTablet ? 0.5 : 1,
          scrollTrigger: esMovilTablet ? undefined : { trigger: ctaSection, start: 'top 80%', end: 'top 40%', scrub: 1 }
        });
      }

      /* ── Luces laterales con scroll + parpadeo ── */
      const luzTl = gsap.timeline({
        scrollTrigger: { trigger: ctaSection, start: 'top 80%', end: 'bottom 40%', scrub: 1.2 }
      });

      /* Las luces entran desde los lados */
      luzTl.to(ctaLuzIzq, { opacity: 1, x: 0, duration: 1, ease: 'power2.out' }, 0);
      luzTl.to(ctaLuzDer, { opacity: 1, x: 0, duration: 1, ease: 'power2.out' }, 0);
      luzTl.to(ctaGlow, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, 0.2);

      /* Parpadeo sutil después de aparecer */
      gsap.to(ctaLuzIzq, { opacity: 0.95, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });
      gsap.to(ctaLuzDer, { opacity: 0.95, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.5 });

      /* ── Texto — Reveal palabra por palabra (mismo estilo manifiesto) ── */
      const ctaTextos = ctaSection.querySelectorAll('.sobre-cta-texto');
      const esMovilOTablet = window.matchMedia('(max-width: 1024px)').matches;

      if (ctaTextos.length && !esMovilOTablet) {
        ctaTextos.forEach(p => {
          const html = p.innerHTML;
          const wrapped = html.replace(/(\S+)/g, '<span class="palabra-cta" style="display:inline-block; opacity:0; transform:translateY(60px) rotateX(25deg); transform-origin:bottom center;">$1</span>');
          p.innerHTML = wrapped;
        });

        const palabrasCta = ctaSection.querySelectorAll('.palabra-cta');
        if (palabrasCta.length) {
          gsap.to(palabrasCta, {
            y: 0, opacity: 1, rotateX: 0,
            duration: 0.6, stagger: 0.025, ease: 'power3.out',
            scrollTrigger: { trigger: ctaSection, start: 'top 65%', end: 'bottom 35%', scrub: 1.5 }
          });
        }
      }

      /* Ocultar luces cuando la sección sale */
      ScrollTrigger.create({
        trigger: ctaSection,
        start: 'bottom 20%',
        end: 'bottom top',
        onLeave: () => gsap.to([ctaLuzIzq, ctaLuzDer], { opacity: 0, duration: 0.5 }),
        onEnterBack: () => gsap.to([ctaLuzIzq, ctaLuzDer], { opacity: 1, duration: 0.5 })
      });
    }
  }

  return { init };
})();
