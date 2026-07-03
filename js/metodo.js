const Metodo = (() => {
  const soportaHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (typeof ScrambleTextPlugin !== 'undefined') gsap.registerPlugin(ScrambleTextPlugin);

    const section = document.querySelector('.metodo');
    if (!section) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
      const kills = [];

      _initIntro(section, kills);

      _initManifiestoPinned(section, kills);

      _initActosCards(section, kills);

      return () => { kills.forEach(k => k()); };
    });

    mm.add('(max-width: 1024px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)', () => {
      const kills = [];

      _initIntro(section, kills);
      _initManifiestoPinned(section, kills);
      _initActosCards(section, kills);

      return () => { kills.forEach(k => k()); };
    });

    mm.add('(max-width: 1024px) and (orientation: portrait) and (min-width: 600px) and (prefers-reduced-motion: no-preference)', () => {
      const kills = [];

      _initIntro(section, kills);
      _initManifiestoPinned(section, kills);
      _initActosCards(section, kills);

      return () => { kills.forEach(k => k()); };
    });

    mm.add('(max-width: 599px) and (prefers-reduced-motion: no-preference)', () => {
      _initMobileVertical(section);
      return () => {};
    });

    mm.add('(max-width: 768px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)', () => {
      _initMobileVertical(section);
      return () => {};
    });
  }

  function _initIntro(section, kills) {
    const stageIntro = section.querySelector('.metodo-stage--intro');
    if (!stageIntro) return;

    const lineas = stageIntro.querySelectorAll('.metodo-titulo-linea');
    const splits = [];

    if (lineas.length && typeof SplitText !== 'undefined') {
      lineas.forEach(linea => {
        const s = new SplitText(linea, { type: 'chars' });
        gsap.set(s.chars, { opacity: 0 });
        splits.push(s);
      });
    }

    ScrollTrigger.create({
      trigger: stageIntro,
      start: 'top 60%',
      end: 'bottom 20%',
      onEnter: () => _revelarIntro(lineas),
      onEnterBack: () => _revelarIntro(lineas),
      onLeave: () => _ocultarIntro(lineas),
      onLeaveBack: () => _ocultarIntro(lineas),
    });

    kills.push(() => { splits.forEach(s => s.revert()); });
  }

  function _revelarIntro(lineas) {
    lineas.forEach((linea, i) => {
      const chars = linea.querySelectorAll('div');
      gsap.killTweensOf(chars);
      gsap.fromTo(chars,
        { opacity: 0, y: 80, rotateY: -45, scale: 0.7 },
        { opacity: 1, y: 0, rotateY: 0, scale: 1, duration: 0.8, stagger: 0.03, ease: 'back.out(1.4)', delay: i * 0.25, force3D: true }
      );
    });
  }

  function _ocultarIntro(lineas) {
    lineas.forEach(linea => {
      const chars = linea.querySelectorAll('div');
      gsap.killTweensOf(chars);
      gsap.to(chars, { opacity: 0, y: -40, rotateY: 30, scale: 0.8, duration: 0.4, ease: 'power2.in' });
    });
  }

  function _initManifiestoPinned(section, kills) {
    const wrapper = section.querySelector('.metodo-manifiesto-wrapper');
    const panel   = section.querySelector('.metodo-panel--manifiesto');
    const texto   = section.querySelector('.metodo-manifiesto-texto');
    if (!wrapper || !panel || !texto) return;
    if (typeof ScrambleTextPlugin === 'undefined') return;

    const words = texto.querySelectorAll('.metodo-palabra');
    if (!words.length) return;

    const originals = [];
    words.forEach(w => {
      if (!w.dataset.original) w.dataset.original = w.textContent;
      originals.push(w.dataset.original);
    });

    texto.style.position = 'relative';
    texto.style.width = '100%';
    texto.style.height = '100%';

    const panelW = panel.offsetWidth;
    const panelH = panel.offsetHeight;
    const paddingX = panelW * 0.03;
    const paddingY = panelH * 0.03;
    const floatTimelines = [];

    const totalWords = words.length;
    const cols = Math.ceil(Math.sqrt(totalWords * (panelW / panelH)));
    const rows = Math.ceil(totalWords / cols);
    const usableW = panelW - paddingX * 2;
    const usableH = panelH - paddingY * 2;
    const cellW = usableW / cols;
    const cellH = usableH / rows;

    words.forEach((w, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const jitterX = gsap.utils.random(-cellW * 0.3, cellW * 0.3);
      const jitterY = gsap.utils.random(-cellH * 0.3, cellH * 0.3);
      const baseX = paddingX + col * cellW + cellW * 0.5 + jitterX;
      const baseY = paddingY + row * cellH + cellH * 0.5 + jitterY;

      const randScale = gsap.utils.random(0.8, 2.2);
      const randRotation = gsap.utils.random(-15, 15);

      gsap.set(w, {
        position: 'absolute',
        left: 0, top: 0,
        x: baseX, y: baseY,
        scale: randScale,
        rotation: randRotation,
        opacity: 0.7,
      });

      w.dataset.disperseX = baseX;
      w.dataset.disperseY = baseY;
      w.dataset.disperseScale = randScale;
      w.dataset.disperseRotation = randRotation;

      const binLen = originals[i].length;
      let bin = '';
      for (let j = 0; j < binLen; j++) bin += Math.random() > 0.5 ? '1' : '0';
      w.textContent = bin;

      const floatTl = gsap.to(w, {
        y: `+=${gsap.utils.random(-12, 12)}`,
        x: `+=${gsap.utils.random(-6, 6)}`,
        rotation: `+=${gsap.utils.random(-3, 3)}`,
        duration: gsap.utils.random(2.5, 4.5),
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
      floatTimelines.push(floatTl);
    });

    let lastRevealed = -1;
    let reordered = false;

    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 1.2,
      onUpdate: (self) => {
        const progress = self.progress;
        const totalWords = words.length;

        if (progress < 0.60) {
          const decodeProgress = progress / 0.60;
          const shouldReveal = Math.floor(decodeProgress * totalWords);

          if (shouldReveal > lastRevealed) {
            for (let i = lastRevealed + 1; i <= Math.min(shouldReveal, totalWords - 1); i++) {
              gsap.to(words[i], {
                duration: 0.6,
                scrambleText: { text: originals[i], chars: '01', revealDelay: 0.1, speed: 0.6 },
                color: 'var(--color-acento)',
                textShadow: '0 0 12px var(--color-acento), 0 0 30px var(--color-acento)',
                opacity: 1,
                onComplete: () => {
                  gsap.to(words[i], {
                    color: 'var(--color-texto)',
                    textShadow: 'none',
                    duration: 0.8,
                    ease: 'power2.out',
                  });
                }
              });
              if (floatTimelines[i]) floatTimelines[i].kill();
            }
          } else if (shouldReveal < lastRevealed) {
            for (let i = lastRevealed; i > shouldReveal; i--) {
              const binLen = originals[i].length;
              let bin = '';
              for (let j = 0; j < binLen; j++) bin += Math.random() > 0.5 ? '1' : '0';
              gsap.to(words[i], {
                duration: 0.3,
                scrambleText: { text: bin, chars: '01', speed: 1 },
                color: 'var(--color-texto)',
                textShadow: 'none',
                opacity: 0.7,
              });
            }
          }
          lastRevealed = shouldReveal;

          if (reordered) {
            reordered = false;
            texto.style.fontFeatureSettings = '';
            texto.style.fontVariantLigatures = '';
            words.forEach((w, idx) => {
              gsap.to(w, {
                x: parseFloat(w.dataset.disperseX),
                y: parseFloat(w.dataset.disperseY),
                scale: parseFloat(w.dataset.disperseScale),
                rotation: parseFloat(w.dataset.disperseRotation),
                position: 'absolute',
                fontSize: '',
                duration: 0.8,
                ease: 'power3.out',
              });
            });
            texto.style.height = '100%';
          }
        }

        if (progress >= 0.60 && !reordered) {
          reordered = true;

          floatTimelines.forEach(ft => ft.kill());

          texto.style.fontFeatureSettings = '"liga" 1, "dlig" 1, "calt" 1';
          texto.style.fontVariantLigatures = 'discretionary-ligatures common-ligatures contextual';

          words.forEach((w, i) => {
            gsap.to(w, {
              x: 0, y: 0,
              scale: 1,
              rotation: 0,
              position: 'relative',
              duration: 1.2,
              ease: 'power3.inOut',
              delay: i * 0.012,
              force3D: true,
            });
          });

          words.forEach((w, i) => {
            if (w.textContent !== originals[i]) {
              gsap.to(w, {
                duration: 0.5,
                scrambleText: { text: originals[i], chars: '01', speed: 1 },
                color: 'var(--color-texto)',
                textShadow: 'none',
              });
            }
          });
          texto.style.height = 'auto';
        }
      },
    });

    if (soportaHover && typeof ScrambleTextPlugin !== 'undefined') {
      texto.addEventListener('mouseenter', (e) => {
        const word = e.target.closest('.metodo-palabra');
        if (!word || !word.dataset.original) return;
        if (word.textContent === word.dataset.original) {
          gsap.to(word, { duration: 0.6, scrambleText: { text: word.dataset.original, chars: '!<>-_\\/[]{}—=+*^?#_', speed: 0.8 } });
        }
      }, true);
    }

    kills.push(() => { st.kill(); floatTimelines.forEach(ft => ft.kill()); });
  }

  function _initActosCards(section, kills) {
    const wrapper = section.querySelector('.metodo-acordeon-wrapper');
    if (!wrapper) return;

    const acordeon = wrapper.querySelector('.metodo-acordeon');
    if (!acordeon) return;

    const cards = acordeon.querySelectorAll('.metodo-acordeon-card');
    if (!cards.length) return;

    let cardActiva = null;

    function activarCard(card) {
      if (card === cardActiva) return;

      if (cardActiva) {
        cardActiva.classList.remove('activa');
      }

      card.classList.add('activa');
      cardActiva = card;
    }

    function desactivarTodas() {
      if (!cardActiva) return;
      cardActiva.classList.remove('activa');
      cardActiva = null;
    }

    if (soportaHover) {
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => activarCard(card));
      });

      acordeon.addEventListener('mouseleave', () => desactivarTodas());
    } else {
      cards.forEach(card => {
        card.addEventListener('click', () => {
          if (card === cardActiva) {
            desactivarTodas();
          } else {
            activarCard(card);
          }
        });
      });
    }

    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => _revelarCards(cards),
      onEnterBack: () => _revelarCards(cards),
      onLeave: () => _ocultarCards(cards),
      onLeaveBack: () => _ocultarCards(cards),
    });

    kills.push(() => { desactivarTodas(); });
  }

  function _revelarCards(cards) {
    cards.forEach((card, i) => {
      gsap.killTweensOf(card);
      gsap.fromTo(card,
        { opacity: 0, x: 30, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.6, delay: i * 0.1, ease: 'power3.out' }
      );
    });
  }

  function _ocultarCards(cards) {
    cards.forEach((card, i) => {
      gsap.killTweensOf(card);
      gsap.to(card, { opacity: 0, x: -20, scale: 0.95, duration: 0.4, delay: i * 0.05, ease: 'power2.in' });
    });
  }

  function _initMobileVertical(section) {
    const lineas = section.querySelectorAll('.metodo-titulo-linea');
    if (lineas.length) {
      ScrollTrigger.create({
        trigger: section.querySelector('.metodo-stage--intro'),
        start: 'top 75%',
        once: true,
        onEnter: () => {
          lineas.forEach((l, i) => gsap.from(l, { opacity: 0, y: 40, duration: 0.7, delay: i * 0.15 }));
        },
      });
    }

    const texto = section.querySelector('.metodo-manifiesto-texto');
    if (texto) {
      const palabras = texto.querySelectorAll('.metodo-palabra');
      palabras.forEach(w => {
        if (w.dataset.original) w.textContent = w.dataset.original;
        gsap.set(w, { position: 'relative', x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 });
      });
      texto.style.height = '';
      texto.style.position = '';

      ScrollTrigger.create({
        trigger: texto,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          palabras.forEach((w, i) => {
            gsap.from(w, { opacity: 0, y: 15, duration: 0.4, delay: i * 0.02, ease: 'power2.out' });
          });
        },
      });
    }

    const acordeon = section.querySelector('.metodo-acordeon');
    if (!acordeon) return;

    const cards = acordeon.querySelectorAll('.metodo-acordeon-card');
    let cardActiva = null;

    cards.forEach(card => {
      card.addEventListener('click', () => {
        if (card === cardActiva) {
          card.classList.remove('activa');
          cardActiva = null;
        } else {
          if (cardActiva) cardActiva.classList.remove('activa');
          card.classList.add('activa');
          cardActiva = card;
        }
      });
    });

    ScrollTrigger.create({
      trigger: acordeon,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        cards.forEach((card, i) => {
          gsap.fromTo(card,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, delay: i * 0.08, ease: 'power3.out' }
          );
        });
      },
    });
  }

  return { init };
})();
