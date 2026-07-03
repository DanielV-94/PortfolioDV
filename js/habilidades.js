const Habilidades = (() => {
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const section  = document.querySelector('.habilidades');
    if (!section) return;

    const carrusel = section.querySelector('.habilidades-carrusel');
    const cards    = gsap.utils.toArray('.habilidades-card');
    if (!carrusel || !cards.length) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
      const total = cards.length;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const radius   = Math.min(vw * 0.52, 620);
      const centerX  = vw * 0.38;
      const centerY  = vh * 0.38;

      const slotSpacing = 26; // grados entre cada card
      const arcStart = 0;     // ángulo de entrada (abajo-derecha)
      const arcEnd   = 95;    // ángulo de salida (arriba-izquierda)
      const arcDeg   = arcEnd - arcStart;

      const scrollLength = total * 180;

      gsap.set(cards, { opacity: 0, scale: 0.7 });

      function getArcPosition(angleDeg) {
        const rad = (angleDeg * Math.PI) / 180;
        return {
          x: centerX - Math.cos(rad) * radius,
          y: centerY - Math.sin(rad) * radius,
          rot: -(angleDeg - 45) * 0.3, // rotación sutil siguiendo la curva
        };
      }

      const visibleMin = arcStart - 15;
      const visibleMax = arcEnd + 15;

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

          const centerAngle = arcDeg * 0.5; // centro del arco
          const totalTravel = (total - 1) * slotSpacing + centerAngle;
          const currentOffset = progress * totalTravel;

          cards.forEach((card, i) => {
            const cardAngle = arcStart + (currentOffset - i * slotSpacing);

            if (cardAngle < visibleMin || cardAngle > visibleMax) {
              gsap.set(card, { opacity: 0, scale: 0.7 });
              return;
            }

            const pos = getArcPosition(cardAngle);

            let opacity = 1;
            const fadeZone = 18;
            if (cardAngle < arcStart + fadeZone) {
              opacity = (cardAngle - arcStart) / fadeZone;
            } else if (cardAngle > arcEnd - fadeZone) {
              opacity = 1 - (cardAngle - (arcEnd - fadeZone)) / fadeZone;
            }
            opacity = gsap.utils.clamp(0, 1, opacity);

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

    mm.add('(max-width: 1024px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)', () => {
      return _initDoubleMarqueePinned(section, carrusel, cards);
    });

    mm.add('(max-width: 1024px) and (orientation: portrait) and (min-width: 600px) and (prefers-reduced-motion: no-preference)', () => {
      return _initDoubleMarqueePinned(section, carrusel, cards);
    });

    mm.add('(max-width: 599px) and (prefers-reduced-motion: no-preference)', () => {
      return _initDoubleMarqueePinned(section, carrusel, cards);
    });

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

  function _initDoubleMarqueePinned(section, carrusel, cards) {
    const mitad = Math.ceil(cards.length / 2);
    const fila1Cards = cards.slice(0, mitad);
    const fila2Cards = cards.slice(mitad);

    const fila1 = document.createElement('div');
    fila1.className = 'habilidades-fila-marquee habilidades-fila-1';
    const fila2 = document.createElement('div');
    fila2.className = 'habilidades-fila-marquee habilidades-fila-2';

    fila1Cards.forEach(c => fila1.appendChild(c));
    fila2Cards.forEach(c => fila2.appendChild(c));

    const clones1 = fila1Cards.map(c => {
      const cl = c.cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      cl.classList.add('habilidades-card--clon');
      fila1.appendChild(cl);
      return cl;
    });
    const clones2 = fila2Cards.map(c => {
      const cl = c.cloneNode(true);
      cl.setAttribute('aria-hidden', 'true');
      cl.classList.add('habilidades-card--clon');
      fila2.appendChild(cl);
      return cl;
    });

    carrusel.innerHTML = '';
    carrusel.appendChild(fila1);
    carrusel.appendChild(fila2);

    [fila1, fila2].forEach(f => {
      f.style.display = 'flex';
      f.style.flexDirection = 'row';
      f.style.alignItems = 'center';
      f.style.gap = '16px';
      f.style.width = 'max-content';
      f.style.padding = '12px 0';
    });
    carrusel.style.display = 'flex';
    carrusel.style.flexDirection = 'column';
    carrusel.style.gap = '20px';
    carrusel.style.width = '100%';
    carrusel.style.height = '100%';
    carrusel.style.justifyContent = 'center';

    const allCards = carrusel.querySelectorAll('.habilidades-card');
    gsap.set(allCards, { opacity: 1, scale: 1, x: 0, y: 0, rotation: 0, position: 'relative' });

    const w1 = fila1.scrollWidth / 2;
    const w2 = fila2.scrollWidth / 2;

    const marquee1 = gsap.to(fila1, {
      x: -w1,
      duration: w1 / 45,
      ease: 'none',
      repeat: -1,
    });

    gsap.set(fila2, { x: -w2 });
    const marquee2 = gsap.to(fila2, {
      x: 0,
      duration: w2 / 45,
      ease: 'none',
      repeat: -1,
    });

    const pauseAll = () => { marquee1.pause(); marquee2.pause(); };
    const playAll = () => { marquee1.play(); marquee2.play(); };
    carrusel.addEventListener('touchstart', pauseAll, { passive: true });
    carrusel.addEventListener('touchend', playAll, { passive: true });

    return () => {
      marquee1.kill();
      marquee2.kill();
      carrusel.removeEventListener('touchstart', pauseAll);
      carrusel.removeEventListener('touchend', playAll);
      carrusel.innerHTML = '';
      carrusel.style.cssText = '';
      [...fila1Cards, ...fila2Cards].forEach(c => carrusel.appendChild(c));
      clones1.forEach(c => c.remove());
      clones2.forEach(c => c.remove());
      gsap.set(cards, { clearProps: 'all' });
    };
  }

  return { init };
})();
