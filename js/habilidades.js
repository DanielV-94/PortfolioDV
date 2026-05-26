/* ═══════════════════════════════════════════════════════════════
   HABILIDADES — Carrusel 3D en arco tipo "cinta transportadora"
   Las cards recorren un arco curvo conforme se hace scroll.
   Entran por la derecha, recorren la curva, salen por la izquierda.
   Cuando la última card sale, el pin se libera.
═══════════════════════════════════════════════════════════════ */

const Habilidades = (() => {
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const section  = document.querySelector('.habilidades');
    if (!section) return;

    const carrusel = section.querySelector('.habilidades-carrusel');
    const cards    = gsap.utils.toArray('.habilidades-card');
    if (!carrusel || !cards.length) return;

    const mm = gsap.matchMedia();

    /* ══════════════════════════════════════════════════════════
       DESKTOP + TABLET: Arco 3D — cards recorren la curva
    ══════════════════════════════════════════════════════════ */
    mm.add('(min-width: 600px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)', () => {
      const total = cards.length;

      /* Configuración del arco — de esquina inf-der a esquina sup-izq
         como medio arcoíris ascendente */
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const radius   = Math.min(vw * 0.52, 620);
      /* Centro del arco: esquina inferior derecha del viewport */
      const centerX  = vw * 0.38;
      const centerY  = vh * 0.38;

      /* Cada card ocupa un "slot" angular en el arco.
         El progreso del scroll mueve todas las cards a lo largo del arco.
         Arco va de ~0° (abajo-derecha) a ~90° (arriba-izquierda) */
      const slotSpacing = 26; // grados entre cada card
      const arcStart = 0;     // ángulo de entrada (abajo-derecha)
      const arcEnd   = 95;    // ángulo de salida (arriba-izquierda)
      const arcDeg   = arcEnd - arcStart;

      /* Duración total del scroll: la última card llega al centro del arco
         y ahí se libera el pin. */
      const scrollLength = total * 180;

      /* Estado inicial: todas invisibles */
      gsap.set(cards, { opacity: 0, scale: 0.7 });

      /* Función: dado un ángulo en el arco (0°=derecha, 90°=arriba),
         devuelve x, y para posicionar en un arco ascendente
         desde inf-der hacia sup-izq */
      function getArcPosition(angleDeg) {
        const rad = (angleDeg * Math.PI) / 180;
        return {
          x: centerX - Math.cos(rad) * radius,
          y: centerY - Math.sin(rad) * radius,
          rot: -(angleDeg - 45) * 0.3, // rotación sutil siguiendo la curva
        };
      }

      /* El rango angular visible */
      const visibleMin = arcStart - 15;
      const visibleMax = arcEnd + 15;

      /* ScrollTrigger principal — pin cuando llega al top,
         pero las cards empiezan a aparecer inmediatamente */
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${scrollLength}`,
        scrub: 1.8,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;

          /* El "offset" angular total que se ha recorrido.
             Al inicio (progress=0) la primera card entra por abajo-derecha.
             Al final (progress=1) la última card llega al centro del arco (~47°). */
          const centerAngle = arcDeg * 0.5; // centro del arco
          const totalTravel = (total - 1) * slotSpacing + centerAngle;
          const currentOffset = progress * totalTravel;

          cards.forEach((card, i) => {
            /* Ángulo actual de esta card en el arco */
            const cardAngle = arcStart + (currentOffset - i * slotSpacing);

            /* ¿Está dentro del rango visible? */
            if (cardAngle < visibleMin || cardAngle > visibleMax) {
              gsap.set(card, { opacity: 0, scale: 0.7 });
              return;
            }

            /* Calcular posición en el arco */
            const pos = getArcPosition(cardAngle);

            /* Fade in/out en los bordes */
            let opacity = 1;
            const fadeZone = 18;
            if (cardAngle < arcStart + fadeZone) {
              opacity = (cardAngle - arcStart) / fadeZone;
            } else if (cardAngle > arcEnd - fadeZone) {
              opacity = 1 - (cardAngle - (arcEnd - fadeZone)) / fadeZone;
            }
            opacity = gsap.utils.clamp(0, 1, opacity);

            /* Escala: ligeramente más pequeña en los bordes */
            const normalizedPos = (cardAngle - arcStart) / arcDeg;
            const distFromCenter = Math.abs(normalizedPos - 0.5) * 2;
            const scale = 1 - distFromCenter * 0.12;

            gsap.set(card, {
              x: pos.x,
              y: pos.y,
              rotation: pos.rot,
              z: 0,
              rotateY: 0,
              rotateX: 0,
              opacity: opacity,
              scale: gsap.utils.clamp(0.75, 1, scale),
            });
          });
        },
      });

      return () => {
        st.kill();
        gsap.set(cards, { clearProps: 'all' });
      };
    });

    /* ══════════════════════════════════════════════════════════
       TABLET PORTRAIT (600px–1024px, portrait): Marquee infinito
       Misma lógica que mobile — arco no funciona bien aquí
    ══════════════════════════════════════════════════════════ */
    mm.add('(max-width: 1024px) and (orientation: portrait) and (min-width: 600px) and (prefers-reduced-motion: no-preference)', () => {
      const carrusel = section.querySelector('.habilidades-carrusel');
      const originalCards = Array.from(carrusel.children);
      const clones = originalCards.map(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.classList.add('habilidades-card--clon');
        carrusel.appendChild(clone);
        return clone;
      });

      const allCards = carrusel.querySelectorAll('.habilidades-card');
      gsap.set(allCards, { opacity: 1, scale: 1, x: 0, y: 0, rotation: 0 });

      const totalWidth = carrusel.scrollWidth / 2;
      const marquee = gsap.to(carrusel, {
        x: -totalWidth,
        duration: totalWidth / 50,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % totalWidth),
        },
      });

      const pauseMarquee = () => marquee.pause();
      const playMarquee = () => marquee.play();
      carrusel.addEventListener('touchstart', pauseMarquee, { passive: true });
      carrusel.addEventListener('touchend', playMarquee, { passive: true });

      return () => {
        marquee.kill();
        carrusel.removeEventListener('touchstart', pauseMarquee);
        carrusel.removeEventListener('touchend', playMarquee);
        clones.forEach(c => c.remove());
        gsap.set(allCards, { clearProps: 'all' });
      };
    });

    /* ══════════════════════════════════════════════════════════
       MOBILE PORTRAIT (<600px): Marquee infinito automático
       Las cards se mueven solas en loop horizontal
    ══════════════════════════════════════════════════════════ */
    mm.add('(max-width: 599px) and (prefers-reduced-motion: no-preference)', () => {
      /* Duplicar cards para crear loop infinito */
      const carrusel = section.querySelector('.habilidades-carrusel');
      const originalCards = Array.from(carrusel.children);
      const clones = originalCards.map(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.classList.add('habilidades-card--clon');
        carrusel.appendChild(clone);
        return clone;
      });

      /* Hacer todas visibles */
      const allCards = carrusel.querySelectorAll('.habilidades-card');
      gsap.set(allCards, { opacity: 1, scale: 1, x: 0, y: 0, rotation: 0 });

      /* Animación marquee con GSAP */
      const totalWidth = carrusel.scrollWidth / 2; // mitad porque duplicamos
      const marquee = gsap.to(carrusel, {
        x: -totalWidth,
        duration: totalWidth / 40, // velocidad: 40px por segundo
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % totalWidth),
        },
      });

      /* Pausar al tocar, reanudar al soltar */
      const pauseMarquee = () => marquee.pause();
      const playMarquee = () => marquee.play();
      carrusel.addEventListener('touchstart', pauseMarquee, { passive: true });
      carrusel.addEventListener('touchend', playMarquee, { passive: true });

      return () => {
        marquee.kill();
        carrusel.removeEventListener('touchstart', pauseMarquee);
        carrusel.removeEventListener('touchend', playMarquee);
        clones.forEach(c => c.remove());
        gsap.set(allCards, { clearProps: 'all' });
      };
    });

    /* ══════════════════════════════════════════════════════════
       MOBILE LANDSCAPE (≤768px landscape): Marquee infinito
    ══════════════════════════════════════════════════════════ */
    mm.add('(max-width: 768px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)', () => {
      const carrusel = section.querySelector('.habilidades-carrusel');
      const originalCards = Array.from(carrusel.children);
      const clones = originalCards.map(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.classList.add('habilidades-card--clon');
        carrusel.appendChild(clone);
        return clone;
      });

      const allCards = carrusel.querySelectorAll('.habilidades-card');
      gsap.set(allCards, { opacity: 1, scale: 1, x: 0, y: 0, rotation: 0 });

      const totalWidth = carrusel.scrollWidth / 2;
      const marquee = gsap.to(carrusel, {
        x: -totalWidth,
        duration: totalWidth / 45,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % totalWidth),
        },
      });

      const pauseMarquee = () => marquee.pause();
      const playMarquee = () => marquee.play();
      carrusel.addEventListener('touchstart', pauseMarquee, { passive: true });
      carrusel.addEventListener('touchend', playMarquee, { passive: true });

      return () => {
        marquee.kill();
        carrusel.removeEventListener('touchstart', pauseMarquee);
        carrusel.removeEventListener('touchend', playMarquee);
        clones.forEach(c => c.remove());
        gsap.set(allCards, { clearProps: 'all' });
      };
    });
  }

  return { init };
})();
