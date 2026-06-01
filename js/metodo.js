/* ═══════════════════════════════════════════════════════════════
   MÉTODO — 3 partes: Intro (horizontal) → Manifiesto (pin) → Actos (horizontal)
   SplitText por chars, parallax interno, watermark dramático
═══════════════════════════════════════════════════════════════ */

const Metodo = (() => {
  const soportaHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (typeof ScrambleTextPlugin !== 'undefined') gsap.registerPlugin(ScrambleTextPlugin);

    const section = document.querySelector('.metodo');
    if (!section) return;

    const mm = gsap.matchMedia();

    /* ══ DESKTOP/TABLET ══ */
    mm.add('(min-width: 600px) and (prefers-reduced-motion: no-preference)', () => {
      const kills = [];

      /* ── PARTE 1: Intro (título) — sin scroll horizontal, solo reveal ── */
      _initIntro(section, kills);

      /* ── PARTE 2: Manifiesto — pinneado con decodificación ── */
      _initManifiestoPinned(section, kills);

      /* ── PARTE 3: Actos — scroll horizontal ── */
      _initActos(section, kills);

      return () => { kills.forEach(k => k()); };
    });

    /* ══ MOBILE: scroll vertical ══ */
    mm.add('(max-width: 599px) and (prefers-reduced-motion: no-preference)', () => {
      const allPanels = section.querySelectorAll('.metodo-panel');
      const trackActos = section.querySelector('.metodo-track--actos');

      if (trackActos) {
        trackActos.style.flexDirection = 'column';
        trackActos.style.width = '100%';
      }

      allPanels.forEach(p => {
        p.style.width = '100%';
        p.style.height = 'auto';
        p.style.minHeight = 'auto';
      });

      allPanels.forEach(panel => {
        const titulo    = panel.querySelector('.metodo-panel-titulo');
        const desc      = panel.querySelector('.metodo-panel-desc');
        const watermark = panel.querySelector('.metodo-panel-watermark');
        const lineas    = panel.querySelectorAll('.metodo-titulo-linea');

        ScrollTrigger.create({
          trigger: panel,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            if (watermark) gsap.fromTo(watermark, { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 0.04, duration: 1 });
            if (lineas.length) lineas.forEach((l, i) => gsap.from(l, { opacity: 0, y: 40, duration: 0.7, delay: i * 0.15 }));
            if (titulo) gsap.from(titulo, { opacity: 0, y: 30, duration: 0.7 });
            if (desc) gsap.from(desc, { opacity: 0, y: 20, duration: 0.6, delay: 0.2 });
          },
        });
      });

      return () => {
        if (trackActos) { trackActos.style.flexDirection = ''; trackActos.style.width = ''; }
        allPanels.forEach(p => { p.style.width = ''; p.style.height = ''; p.style.minHeight = ''; });
      };
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     PARTE 1: INTRO — Reveal del título
  ═══════════════════════════════════════════════════════════════ */

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
      once: true,
      onEnter: () => {
        lineas.forEach((linea, i) => {
          const chars = linea.querySelectorAll('div');
          gsap.fromTo(chars,
            { opacity: 0, y: 80, rotateY: -45, scale: 0.7 },
            { opacity: 1, y: 0, rotateY: 0, scale: 1, duration: 0.8, stagger: 0.03, ease: 'back.out(1.4)', delay: i * 0.25, force3D: true }
          );
        });
      },
    });

    kills.push(() => { splits.forEach(s => s.revert()); });
  }

  /* ═══════════════════════════════════════════════════════════════
     PARTE 2: MANIFIESTO — Pinneado con decodificación binaria
  ═══════════════════════════════════════════════════════════════ */

  function _initManifiestoPinned(section, kills) {
    const wrapper = section.querySelector('.metodo-manifiesto-wrapper');
    const panel   = section.querySelector('.metodo-panel--manifiesto');
    const texto   = section.querySelector('.metodo-manifiesto-texto');
    if (!wrapper || !panel || !texto) return;
    if (typeof ScrambleTextPlugin === 'undefined') return;

    const words = texto.querySelectorAll('.metodo-palabra');
    if (!words.length) return;

    /* Guardar textos originales */
    const originals = [];
    words.forEach(w => {
      if (!w.dataset.original) w.dataset.original = w.textContent;
      originals.push(w.dataset.original);
    });

    /* Configurar posiciones dispersas */
    texto.style.position = 'relative';
    texto.style.width = '100%';
    texto.style.height = '100%';

    const panelW = panel.offsetWidth;
    const panelH = panel.offsetHeight;
    const padding = 60;
    const floatTimelines = [];

    words.forEach((w, i) => {
      const randX = gsap.utils.random(padding, panelW - padding - 140);
      const randY = gsap.utils.random(padding, panelH - padding - 60);
      const randScale = gsap.utils.random(0.8, 2.2);
      const randRotation = gsap.utils.random(-15, 15);

      gsap.set(w, {
        position: 'absolute',
        left: 0, top: 0,
        x: randX, y: randY,
        scale: randScale,
        rotation: randRotation,
        opacity: 0.7,
      });

      w.dataset.disperseX = randX;
      w.dataset.disperseY = randY;
      w.dataset.disperseScale = randScale;
      w.dataset.disperseRotation = randRotation;

      /* Mostrar como binario */
      const binLen = originals[i].length;
      let bin = '';
      for (let j = 0; j < binLen; j++) bin += Math.random() > 0.5 ? '1' : '0';
      w.textContent = bin;

      /* Flotación sutil — cada palabra oscila suavemente */
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

    /* ScrollTrigger pinneado — controla toda la animación */
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

        /* Fase 1 (0% - 60%): Decodificar con glow cinematográfico */
        if (progress < 0.60) {
          const decodeProgress = progress / 0.60;
          const shouldReveal = Math.floor(decodeProgress * totalWords);

          if (shouldReveal > lastRevealed) {
            for (let i = lastRevealed + 1; i <= Math.min(shouldReveal, totalWords - 1); i++) {
              /* Glow al decodificar */
              gsap.to(words[i], {
                duration: 0.6,
                scrambleText: { text: originals[i], chars: '01', revealDelay: 0.1, speed: 0.6 },
                color: 'var(--color-acento)',
                textShadow: '0 0 12px var(--color-acento), 0 0 30px var(--color-acento)',
                opacity: 1,
                onComplete: () => {
                  /* Quitar glow después de decodificar */
                  gsap.to(words[i], {
                    color: 'var(--color-texto)',
                    textShadow: 'none',
                    duration: 0.8,
                    ease: 'power2.out',
                  });
                }
              });
              /* Detener flotación de esta palabra */
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

          /* Si estábamos reordenados y volvemos atrás, dispersar de nuevo */
          if (reordered) {
            reordered = false;
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

        /* Fase 2 (60% - 100%): Reordenar a párrafo con efecto cinematográfico */
        if (progress >= 0.60 && !reordered) {
          reordered = true;

          /* Matar todas las flotaciones restantes */
          floatTimelines.forEach(ft => ft.kill());

          /* Animar cada palabra a su posición natural */
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

          /* Asegurar que todas estén decodificadas */
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

    /* Hover scramble en desktop */
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

  /* ═══════════════════════════════════════════════════════════════
     PARTE 3: ACTOS — Scroll horizontal con animaciones por char
  ═══════════════════════════════════════════════════════════════ */

  function _initActos(section, kills) {
    const stageActos = section.querySelector('.metodo-stage--actos');
    const trackActos = section.querySelector('.metodo-track--actos');
    if (!stageActos || !trackActos) return;

    const paneles = trackActos.querySelectorAll('.metodo-panel');
    if (!paneles.length) return;

    const splits = [];

    /* SplitText — chars para títulos, words para desc */
    paneles.forEach(panel => {
      const titulo = panel.querySelector('.metodo-panel-titulo');
      const desc   = panel.querySelector('.metodo-panel-desc');

      if (titulo && typeof SplitText !== 'undefined') {
        const s = new SplitText(titulo, { type: 'chars' });
        gsap.set(s.chars, { opacity: 0 });
        splits.push(s);
      }
      if (desc && typeof SplitText !== 'undefined') {
        const s = new SplitText(desc, { type: 'words' });
        gsap.set(s.words, { opacity: 0 });
        splits.push(s);
      }
    });

    const totalWidth = trackActos.scrollWidth;
    const viewWidth  = window.innerWidth;

    /* Timeline principal — scroll horizontal */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stageActos,
        start: 'top top',
        end: () => `+=${totalWidth - viewWidth}`,
        scrub: 1.5,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.to(trackActos, { x: () => -(totalWidth - viewWidth), ease: 'none' });

    /* Parallax interno */
    _initParallax(paneles, tl);

    /* Animaciones por panel */
    let actoIndex = 0;

    paneles.forEach(panel => {
      actoIndex++;
      const currentActo = actoIndex;
      const titulo    = panel.querySelector('.metodo-panel-titulo');
      const desc      = panel.querySelector('.metodo-panel-desc');
      const num       = panel.querySelector('.metodo-panel-num');
      const watermark = panel.querySelector('.metodo-panel-watermark');
      const lineaTop  = panel.querySelector('.metodo-panel-linea--top');
      const lineaBot  = panel.querySelector('.metodo-panel-linea--bottom');
      const particulas = panel.querySelector('.metodo-panel-particulas');

      ScrollTrigger.create({
        trigger: panel,
        containerAnimation: tl,
        start: 'left 55%',
        end: 'right -10%',
        onEnter: () => _animarActoPanel(currentActo, titulo, desc, num, watermark, lineaTop, lineaBot, particulas, 'entrada'),
        onEnterBack: () => _animarActoPanel(currentActo, titulo, desc, num, watermark, lineaTop, lineaBot, particulas, 'entrada'),
        onLeave: () => _animarActoPanel(currentActo, titulo, desc, num, watermark, lineaTop, lineaBot, particulas, 'salida'),
        onLeaveBack: () => _animarActoPanel(currentActo, titulo, desc, num, watermark, lineaTop, lineaBot, particulas, 'salida'),
      });

      if (soportaHover) _registrarHover(currentActo, panel, titulo);
    });

    kills.push(() => { tl.kill(); splits.forEach(s => s.revert()); });
  }

  /* ═══════════════════════════════════════════════════════════════
     PARALLAX INTERNO
  ═══════════════════════════════════════════════════════════════ */

  function _initParallax(paneles, tl) {
    paneles.forEach(panel => {
      const watermark  = panel.querySelector('.metodo-panel-watermark');
      const contenido  = panel.querySelector('.metodo-panel-contenido');
      const particulas = panel.querySelector('.metodo-panel-particulas');

      if (watermark) {
        gsap.to(watermark, { x: -80, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: tl, start: 'left right', end: 'right left', scrub: true } });
      }
      if (contenido) {
        gsap.fromTo(contenido, { x: 40 }, { x: -20, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: tl, start: 'left right', end: 'right left', scrub: true } });
      }
      if (particulas) {
        gsap.to(particulas, { x: 60, y: -30, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: tl, start: 'left right', end: 'right left', scrub: true } });
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     ANIMACIONES DE ACTOS
  ═══════════════════════════════════════════════════════════════ */

  function _animarActoPanel(actoIdx, titulo, desc, num, watermark, lineaTop, lineaBot, particulas, dir) {
    if (dir === 'entrada') {
      _animarWatermark(watermark, 'in');
      _animarNum(num, 'in');
      _animarLineas(lineaTop, lineaBot, 'in');
      _animarParticulas(particulas, 'in');
      _entradaActo(actoIdx, titulo, desc);
    } else {
      _animarWatermark(watermark, 'out');
      _animarNum(num, 'out');
      _animarLineas(lineaTop, lineaBot, 'out');
      _animarParticulas(particulas, 'out');
      _salidaActo(titulo, desc);
    }
  }

  /* ── Watermark DRAMÁTICO ── */
  function _animarWatermark(el, dir) {
    if (!el) return;
    gsap.killTweensOf(el);
    if (dir === 'in') {
      const tlW = gsap.timeline();
      tlW.fromTo(el, { scale: 2.5, opacity: 0, filter: 'blur(20px)', rotateZ: -5 }, { scale: 1, opacity: 0.08, filter: 'blur(2px)', rotateZ: 0, duration: 1.6, ease: 'expo.out' });
      tlW.to(el, { x: 8, skewX: 3, duration: 0.06 }, '-=0.3');
      tlW.to(el, { x: -5, skewX: -2, duration: 0.06 });
      tlW.to(el, { x: 3, skewX: 1, duration: 0.04 });
      tlW.to(el, { x: 0, skewX: 0, duration: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(el, { scale: 0.6, opacity: 0, filter: 'blur(12px)', rotateZ: 3, duration: 0.5, ease: 'power3.in' });
    }
  }

  function _animarNum(el, dir) {
    if (!el) return;
    gsap.killTweensOf(el);
    if (dir === 'in') gsap.fromTo(el, { opacity: 0, x: -20 }, { opacity: 0.7, x: 0, duration: 0.5, ease: 'power2.out' });
    else gsap.to(el, { opacity: 0, x: 20, duration: 0.3, ease: 'power2.in' });
  }

  function _animarLineas(top, bot, dir) {
    if (dir === 'in') {
      if (top) { gsap.killTweensOf(top); gsap.fromTo(top, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 0.6, duration: 1.2, ease: 'power3.inOut' }); }
      if (bot) { gsap.killTweensOf(bot); gsap.fromTo(bot, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 0.6, duration: 1.2, ease: 'power3.inOut', delay: 0.15 }); }
    } else {
      if (top) gsap.to(top, { scaleX: 0, opacity: 0, duration: 0.4, ease: 'power2.in' });
      if (bot) gsap.to(bot, { scaleX: 0, opacity: 0, duration: 0.4, ease: 'power2.in' });
    }
  }

  function _animarParticulas(el, dir) {
    if (!el) return;
    gsap.killTweensOf(el);
    if (dir === 'in') gsap.fromTo(el, { opacity: 0 }, { opacity: 0.4, duration: 1.5, ease: 'power2.out' });
    else gsap.to(el, { opacity: 0, duration: 0.4, ease: 'power2.in' });
  }

  /* ═══ ENTRADAS POR ACTO (chars) ═══ */
  function _entradaActo(actoIdx, titulo, desc) {
    switch (actoIdx) {
      case 1: _entradaActo1(titulo, desc); break;
      case 2: _entradaActo2(titulo, desc); break;
      case 3: _entradaActo3(titulo, desc); break;
      case 4: _entradaActo4(titulo, desc); break;
      case 5: _entradaActo5(titulo, desc); break;
    }
  }

  function _salidaActo(titulo, desc) {
    if (titulo) { const c = titulo.querySelectorAll('div'); gsap.killTweensOf(c); gsap.to(c, { opacity: 0, y: -25, duration: 0.3, ease: 'power2.in' }); }
    if (desc) { const w = desc.querySelectorAll('div'); gsap.killTweensOf(w); gsap.to(w, { opacity: 0, y: -15, filter: 'blur(3px)', duration: 0.25, ease: 'power2.in' }); }
  }

  function _entradaActo1(titulo, desc) {
    if (titulo) {
      const chars = titulo.querySelectorAll('div');
      gsap.killTweensOf(chars);
      chars.forEach((c, i) => {
        gsap.fromTo(c, { opacity: 0, y: gsap.utils.random(60, 140), rotation: gsap.utils.random(-20, 20), scale: 0.6 },
          { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)', delay: i * 0.04 });
      });
    }
    if (desc) { const w = desc.querySelectorAll('div'); gsap.killTweensOf(w); gsap.fromTo(w, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.015, ease: 'power2.out', delay: 0.6 }); }
  }

  function _entradaActo2(titulo, desc) {
    if (titulo) {
      const chars = titulo.querySelectorAll('div');
      gsap.killTweensOf(chars);
      chars.forEach((c, i) => {
        const fromX = i % 2 === 0 ? -60 : 60;
        gsap.fromTo(c, { opacity: 0, x: fromX, filter: 'blur(8px)', rotateZ: fromX > 0 ? 8 : -8 },
          { opacity: 1, x: 0, filter: 'blur(0px)', rotateZ: 0, duration: 0.6, ease: 'power3.out', delay: i * 0.03 });
      });
    }
    if (desc) { const w = desc.querySelectorAll('div'); gsap.killTweensOf(w); gsap.fromTo(w, { opacity: 0, y: 25, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.02, ease: 'power2.out', delay: 0.5 }); }
  }

  function _entradaActo3(titulo, desc) {
    if (titulo) {
      const chars = titulo.querySelectorAll('div');
      gsap.killTweensOf(chars);
      gsap.fromTo(chars, { opacity: 0, clipPath: 'inset(0 100% 0 0)', y: 10 }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.inOut' });
    }
    if (desc) { const w = desc.querySelectorAll('div'); gsap.killTweensOf(w); gsap.fromTo(w, { opacity: 0, y: 15, filter: 'blur(5px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, stagger: 0.015, ease: 'power3.out', delay: 0.6 }); }
  }

  function _entradaActo4(titulo, desc) {
    if (titulo) {
      const chars = titulo.querySelectorAll('div');
      gsap.killTweensOf(chars);
      gsap.fromTo(chars, { opacity: 0, rotateX: -90, transformOrigin: '50% 100%', y: 30 }, { opacity: 1, rotateX: 0, y: 0, duration: 0.7, stagger: 0.035, ease: 'back.out(1.7)', force3D: true });
    }
    if (desc) { const w = desc.querySelectorAll('div'); gsap.killTweensOf(w); gsap.fromTo(w, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.012, ease: 'power2.out', delay: 0.5 }); }
  }

  function _entradaActo5(titulo, desc) {
    if (titulo) {
      const chars = titulo.querySelectorAll('div');
      gsap.killTweensOf(chars);
      gsap.fromTo(chars, { opacity: 0, scale: 0, rotation: gsap.utils.random(-15, 15) }, { opacity: 1, scale: 1, rotation: 0, duration: 0.9, stagger: 0.03, ease: 'elastic.out(1, 0.4)' });
    }
    if (desc) { const w = desc.querySelectorAll('div'); gsap.killTweensOf(w); gsap.fromTo(w, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.02, ease: 'power3.out', delay: 0.7 }); }
  }

  /* ═══════════════════════════════════════════════════════════════
     HOVERS — Por char (solo desktop)
  ═══════════════════════════════════════════════════════════════ */

  function _registrarHover(actoIdx, panel, titulo) {
    if (!titulo) return;
    const chars = titulo.querySelectorAll('div');

    switch (actoIdx) {
      case 1:
        chars.forEach(c => {
          c.style.cursor = 'default';
          c.addEventListener('mouseenter', () => gsap.to(c, { scale: 1.3, color: 'var(--color-acento)', duration: 0.2, ease: 'elastic.out(1, 0.4)' }));
          c.addEventListener('mouseleave', () => gsap.to(c, { scale: 1, color: 'var(--color-texto)', duration: 0.4, ease: 'power2.out' }));
        });
        break;
      case 2:
        titulo.style.cursor = 'default';
        titulo.addEventListener('mouseenter', () => {
          gsap.to(chars, { y: -6, duration: 0.25, stagger: { each: 0.02, from: 'start' }, ease: 'power2.out', yoyo: true, repeat: 1 });
        });
        break;
      case 3:
        chars.forEach(c => {
          c.style.cursor = 'default';
          c.addEventListener('mouseenter', () => gsap.to(c, { rotation: gsap.utils.random(-8, 8), scale: 1.15, color: 'var(--color-acento)', duration: 0.15 }));
          c.addEventListener('mouseleave', () => gsap.to(c, { rotation: 0, scale: 1, color: 'var(--color-texto)', duration: 0.4, ease: 'elastic.out(1, 0.5)' }));
        });
        break;
      case 4:
        if (typeof ScrambleTextPlugin !== 'undefined') {
          let scrambling = false;
          titulo.style.cursor = 'default';
          titulo.addEventListener('mouseenter', () => {
            if (scrambling) return;
            scrambling = true;
            chars.forEach(c => {
              const original = c.textContent;
              gsap.to(c, { duration: 0.6, scrambleText: { text: original, chars: '!<>-_\\/[]{}—=+*^?#', speed: 0.8 }, onComplete: () => { scrambling = false; } });
            });
          });
        }
        break;
      case 5:
        chars.forEach(c => {
          c.style.cursor = 'default';
          c.addEventListener('mouseenter', () => gsap.to(c, { y: gsap.utils.random(-10, 10), x: gsap.utils.random(-5, 5), scale: 1.2, color: 'var(--color-acento)', duration: 0.2, ease: 'power2.out' }));
          c.addEventListener('mouseleave', () => gsap.to(c, { y: 0, x: 0, scale: 1, color: 'var(--color-texto)', duration: 0.5, ease: 'elastic.out(1, 0.4)' }));
        });
        break;
    }
  }

  return { init };
})();
