/* ═══════════════════════════════════════════════════════════════
   MÉTODO — Scroll horizontal + animaciones cinematográficas
   SplitText por chars, parallax interno, watermark dramático
═══════════════════════════════════════════════════════════════ */

const Metodo = (() => {
  const soportaHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (typeof ScrambleTextPlugin !== 'undefined') gsap.registerPlugin(ScrambleTextPlugin);

    const section = document.querySelector('.metodo');
    if (!section) return;

    const track   = section.querySelector('.metodo-track');
    const paneles = section.querySelectorAll('.metodo-panel');
    if (!track || !paneles.length) return;

    _initScrambleHover(section);

    const mm = gsap.matchMedia();

    /* ══ DESKTOP/TABLET: scroll horizontal ══ */
    mm.add('(min-width: 600px) and (prefers-reduced-motion: no-preference)', () => {
      const totalWidth = track.scrollWidth;
      const viewWidth  = window.innerWidth;
      const splits = [];

      /* SplitText — chars para títulos, words para desc */
      paneles.forEach((panel) => {
        const titulo = panel.querySelector('.metodo-panel-titulo');
        const desc   = panel.querySelector('.metodo-panel-desc');
        const lineas = panel.querySelectorAll('.metodo-titulo-linea');

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
        if (lineas.length && typeof SplitText !== 'undefined') {
          lineas.forEach(linea => {
            const s = new SplitText(linea, { type: 'chars' });
            gsap.set(s.chars, { opacity: 0 });
            splits.push(s);
          });
        }
      });

      /* Timeline principal — scroll horizontal */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${totalWidth - viewWidth}`,
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(track, { x: () => -(totalWidth - viewWidth), ease: 'none' });

      /* Inicializar decodificador binario del panel manifiesto */
      _initManifiestoDecoder(section, tl);

      /* ── Parallax interno por panel ── */
      _initParallax(paneles, tl);

      /* ── Animaciones por panel ── */
      const panelesArr = Array.from(paneles);
      let actoIndex = 0;

      panelesArr.forEach((panel) => {
        const titulo    = panel.querySelector('.metodo-panel-titulo');
        const desc      = panel.querySelector('.metodo-panel-desc');
        const num       = panel.querySelector('.metodo-panel-num');
        const watermark = panel.querySelector('.metodo-panel-watermark');
        const lineas    = panel.querySelectorAll('.metodo-titulo-linea');
        const manifiesto = panel.querySelector('.metodo-manifiesto-texto');
        const lineaTop  = panel.querySelector('.metodo-panel-linea--top');
        const lineaBot  = panel.querySelector('.metodo-panel-linea--bottom');
        const particulas = panel.querySelector('.metodo-panel-particulas');

        let tipoPanel = 'acto';
        if (panel.classList.contains('metodo-panel--intro')) tipoPanel = 'intro';
        else if (panel.classList.contains('metodo-panel--manifiesto')) tipoPanel = 'manifiesto';
        else actoIndex++;

        const currentActo = actoIndex;

        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: tl,
          start: 'left 55%',
          end: 'right -10%',
          onEnter: () => _animarPanel(tipoPanel, currentActo, panel, titulo, desc, num, watermark, lineas, manifiesto, lineaTop, lineaBot, particulas, 'entrada'),
          onEnterBack: () => _animarPanel(tipoPanel, currentActo, panel, titulo, desc, num, watermark, lineas, manifiesto, lineaTop, lineaBot, particulas, 'entrada'),
          onLeave: () => _animarPanel(tipoPanel, currentActo, panel, titulo, desc, num, watermark, lineas, manifiesto, lineaTop, lineaBot, particulas, 'salida'),
          onLeaveBack: () => _animarPanel(tipoPanel, currentActo, panel, titulo, desc, num, watermark, lineas, manifiesto, lineaTop, lineaBot, particulas, 'salida'),
        });

        if (soportaHover && tipoPanel === 'acto') {
          _registrarHover(currentActo, panel, titulo, desc);
        }
      });

      return () => {
        tl.kill();
        splits.forEach(s => s.revert());
      };
    });

    /* ══ MOBILE: scroll vertical ══ */
    mm.add('(max-width: 599px) and (prefers-reduced-motion: no-preference)', () => {
      track.style.flexDirection = 'column';
      track.style.width = '100%';
      paneles.forEach(p => {
        p.style.width = '100%';
        p.style.height = 'auto';
        p.style.minHeight = 'auto';
      });

      paneles.forEach(panel => {
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
            if (lineas.length) {
              lineas.forEach((l, i) => gsap.from(l, { opacity: 0, y: 40, duration: 0.7, delay: i * 0.15 }));
            }
            if (titulo) gsap.from(titulo, { opacity: 0, y: 30, duration: 0.7 });
            if (desc) gsap.from(desc, { opacity: 0, y: 20, duration: 0.6, delay: 0.2 });
          },
        });
      });

      return () => {
        track.style.flexDirection = '';
        track.style.width = '';
        paneles.forEach(p => { p.style.width = ''; p.style.height = ''; p.style.minHeight = ''; });
      };
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     PARALLAX INTERNO — Capas a diferentes velocidades
  ═══════════════════════════════════════════════════════════════ */

  function _initParallax(paneles, tl) {
    paneles.forEach(panel => {
      const watermark  = panel.querySelector('.metodo-panel-watermark');
      const contenido  = panel.querySelector('.metodo-panel-contenido');
      const particulas = panel.querySelector('.metodo-panel-particulas');

      /* Watermark se mueve más lento (efecto profundidad) */
      if (watermark) {
        gsap.to(watermark, {
          x: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tl,
            start: 'left right',
            end: 'right left',
            scrub: true,
          },
        });
      }

      /* Contenido se mueve ligeramente más rápido */
      if (contenido) {
        gsap.fromTo(contenido, { x: 40 }, {
          x: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tl,
            start: 'left right',
            end: 'right left',
            scrub: true,
          },
        });
      }

      /* Partículas se mueven en dirección opuesta */
      if (particulas) {
        gsap.to(particulas, {
          x: 60,
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tl,
            start: 'left right',
            end: 'right left',
            scrub: true,
          },
        });
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     ANIMACIONES POR TIPO DE PANEL
  ═══════════════════════════════════════════════════════════════ */

  function _animarPanel(tipo, actoIdx, panel, titulo, desc, num, watermark, lineas, manifiesto, lineaTop, lineaBot, particulas, dir) {
    if (dir === 'entrada') {
      _animarWatermark(watermark, 'in');
      _animarNum(num, 'in');
      _animarLineas(lineaTop, lineaBot, 'in');
      _animarParticulas(particulas, 'in');

      if (tipo === 'intro') _entradaIntro(lineas);
      else if (tipo === 'manifiesto') _entradaManifiesto(manifiesto);
      else _entradaActo(actoIdx, titulo, desc);
    } else {
      _animarWatermark(watermark, 'out');
      _animarNum(num, 'out');
      _animarLineas(lineaTop, lineaBot, 'out');
      _animarParticulas(particulas, 'out');

      if (tipo === 'intro') _salidaIntro(lineas);
      else if (tipo === 'manifiesto') _salidaManifiesto(manifiesto);
      else _salidaActo(titulo, desc);
    }
  }

  /* ── Watermark DRAMÁTICO — glitch + escala + distorsión ── */
  function _animarWatermark(el, dir) {
    if (!el) return;
    gsap.killTweensOf(el);
    if (dir === 'in') {
      const tlW = gsap.timeline();
      tlW.fromTo(el,
        { scale: 2.5, opacity: 0, filter: 'blur(20px)', rotateZ: -5 },
        { scale: 1, opacity: 0.08, filter: 'blur(2px)', rotateZ: 0, duration: 1.6, ease: 'expo.out' }
      );
      /* Glitch sutil al final */
      tlW.to(el, { x: 8, skewX: 3, duration: 0.06 }, '-=0.3');
      tlW.to(el, { x: -5, skewX: -2, duration: 0.06 });
      tlW.to(el, { x: 3, skewX: 1, duration: 0.04 });
      tlW.to(el, { x: 0, skewX: 0, duration: 0.08, ease: 'power2.out' });
    } else {
      gsap.to(el, { scale: 0.6, opacity: 0, filter: 'blur(12px)', rotateZ: 3, duration: 0.5, ease: 'power3.in' });
    }
  }

  /* ── Número de acto ── */
  function _animarNum(el, dir) {
    if (!el) return;
    gsap.killTweensOf(el);
    if (dir === 'in') {
      gsap.fromTo(el, { opacity: 0, x: -20 }, { opacity: 0.7, x: 0, duration: 0.5, ease: 'power2.out' });
    } else {
      gsap.to(el, { opacity: 0, x: 20, duration: 0.3, ease: 'power2.in' });
    }
  }

  /* ── Líneas decorativas cinematográficas ── */
  function _animarLineas(top, bot, dir) {
    if (dir === 'in') {
      if (top) {
        gsap.killTweensOf(top);
        gsap.fromTo(top,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 0.6, duration: 1.2, ease: 'power3.inOut' }
        );
      }
      if (bot) {
        gsap.killTweensOf(bot);
        gsap.fromTo(bot,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 0.6, duration: 1.2, ease: 'power3.inOut', delay: 0.15 }
        );
      }
    } else {
      if (top) gsap.to(top, { scaleX: 0, opacity: 0, duration: 0.4, ease: 'power2.in' });
      if (bot) gsap.to(bot, { scaleX: 0, opacity: 0, duration: 0.4, ease: 'power2.in' });
    }
  }

  /* ── Partículas de fondo ── */
  function _animarParticulas(el, dir) {
    if (!el) return;
    gsap.killTweensOf(el);
    if (dir === 'in') {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 0.4, duration: 1.5, ease: 'power2.out' });
    } else {
      gsap.to(el, { opacity: 0, duration: 0.4, ease: 'power2.in' });
    }
  }

  /* ═══ INTRO — Chars cascada 3D ═══ */
  function _entradaIntro(lineas) {
    if (!lineas.length) return;
    lineas.forEach((linea, i) => {
      const chars = linea.querySelectorAll('div');
      gsap.killTweensOf(chars);
      gsap.fromTo(chars,
        { opacity: 0, y: 80, rotateY: -45, scale: 0.7 },
        { opacity: 1, y: 0, rotateY: 0, scale: 1, duration: 0.8, stagger: 0.03, ease: 'back.out(1.4)', delay: i * 0.2, force3D: true }
      );
    });
  }
  function _salidaIntro(lineas) {
    if (!lineas.length) return;
    lineas.forEach(linea => {
      const chars = linea.querySelectorAll('div');
      gsap.killTweensOf(chars);
      gsap.to(chars, { opacity: 0, y: -40, rotateY: 30, scale: 0.8, duration: 0.35, ease: 'power2.in' });
    });
  }

  /* ═══ MANIFIESTO — Decodificación binaria ═══ */
  let _manifiestoDecodeState = { revealed: 0, active: false };

  function _entradaManifiesto(manifiesto) {
    if (!manifiesto) return;
    const words = manifiesto.querySelectorAll('.metodo-palabra');
    gsap.set(words, { opacity: 1 });
    _manifiestoDecodeState.active = true;
  }

  function _salidaManifiesto(manifiesto) {
    if (!manifiesto) return;
    const words = manifiesto.querySelectorAll('.metodo-palabra');
    gsap.to(words, { opacity: 0, duration: 0.2, ease: 'power2.in' });
    _manifiestoDecodeState.active = false;
  }

  function _initManifiestoDecoder(section, tl) {
    const manifiesto = section.querySelector('.metodo-manifiesto-texto');
    const panel = section.querySelector('.metodo-panel--manifiesto');
    if (!manifiesto || !panel || typeof ScrambleTextPlugin === 'undefined') return;

    const words = manifiesto.querySelectorAll('.metodo-palabra');
    if (!words.length) return;

    const originals = [];
    const naturalPositions = [];

    words.forEach(w => {
      if (!w.dataset.original) w.dataset.original = w.textContent;
      originals.push(w.dataset.original);
      const rect = w.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      naturalPositions.push({
        x: rect.left - panelRect.left,
        y: rect.top - panelRect.top,
      });
    });

    manifiesto.style.position = 'relative';
    manifiesto.style.width = '100%';
    manifiesto.style.height = '100%';

    const panelW = panel.offsetWidth;
    const panelH = panel.offsetHeight;
    const padding = 60;

    words.forEach((w, i) => {
      const randX = gsap.utils.random(padding, panelW - padding - 100);
      const randY = gsap.utils.random(padding, panelH - padding - 40);
      const randScale = gsap.utils.random(0.7, 1.8);
      const randRotation = gsap.utils.random(-12, 12);

      gsap.set(w, {
        position: 'absolute',
        left: 0,
        top: 0,
        x: randX,
        y: randY,
        scale: randScale,
        rotation: randRotation,
        opacity: 0.85,
      });

      w.dataset.disperseX = randX;
      w.dataset.disperseY = randY;
      w.dataset.disperseScale = randScale;
      w.dataset.disperseRotation = randRotation;

      const binLen = originals[i].length;
      let bin = '';
      for (let j = 0; j < binLen; j++) bin += Math.random() > 0.5 ? '1' : '0';
      w.textContent = bin;
    });

    let lastRevealed = -1;
    let reordered = false;

    ScrollTrigger.create({
      trigger: panel,
      containerAnimation: tl,
      start: 'left 50%',
      end: 'right 5%',
      onUpdate: (self) => {
        if (!_manifiestoDecodeState.active) return;

        const progress = self.progress;
        const totalWords = words.length;

        if (progress < 0.75) {
          const decodeProgress = progress / 0.75;
          const shouldReveal = Math.floor(decodeProgress * totalWords);

          if (shouldReveal > lastRevealed) {
            for (let i = lastRevealed + 1; i <= Math.min(shouldReveal, totalWords - 1); i++) {
              gsap.to(words[i], {
                duration: 0.5,
                scrambleText: { text: originals[i], chars: '01', revealDelay: 0.1, speed: 0.7 },
              });
            }
          } else if (shouldReveal < lastRevealed) {
            for (let i = lastRevealed; i > shouldReveal; i--) {
              const binLen = originals[i].length;
              let bin = '';
              for (let j = 0; j < binLen; j++) bin += Math.random() > 0.5 ? '1' : '0';
              gsap.to(words[i], { duration: 0.3, scrambleText: { text: bin, chars: '01', speed: 1 } });
            }
          }
          lastRevealed = shouldReveal;

          if (reordered) {
            reordered = false;
            words.forEach(w => {
              gsap.to(w, {
                x: parseFloat(w.dataset.disperseX),
                y: parseFloat(w.dataset.disperseY),
                scale: parseFloat(w.dataset.disperseScale),
                rotation: parseFloat(w.dataset.disperseRotation),
                position: 'absolute',
                duration: 0.6,
                ease: 'power2.out',
              });
            });
            manifiesto.style.height = '100%';
          }
        }

        if (progress >= 0.75 && !reordered) {
          reordered = true;
          words.forEach((w, i) => {
            gsap.to(w, {
              x: 0, y: 0, scale: 1, rotation: 0,
              position: 'relative',
              duration: 0.8,
              ease: 'power3.inOut',
              delay: i * 0.008,
            });
          });
          words.forEach((w, i) => {
            if (w.textContent !== originals[i]) {
              gsap.to(w, { duration: 0.4, scrambleText: { text: originals[i], chars: '01', speed: 1 } });
            }
          });
          manifiesto.style.height = 'auto';
        }
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     ACTOS — Cada uno con animación única (ahora por CHARS)
  ═══════════════════════════════════════════════════════════════ */

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
    if (titulo) {
      const chars = titulo.querySelectorAll('div');
      gsap.killTweensOf(chars);
      gsap.to(chars, { opacity: 0, y: -25, duration: 0.3, ease: 'power2.in' });
    }
    if (desc) {
      const words = desc.querySelectorAll('div');
      gsap.killTweensOf(words);
      gsap.to(words, { opacity: 0, y: -15, filter: 'blur(3px)', duration: 0.25, ease: 'power2.in' });
    }
  }

  /* ── ACTO I: Cascada con Y aleatorio + rotación 3D por char ── */
  function _entradaActo1(titulo, desc) {
    if (titulo) {
      const chars = titulo.querySelectorAll('div');
      gsap.killTweensOf(chars);
      const tlA = gsap.timeline();
      chars.forEach((c, i) => {
        const randomY = gsap.utils.random(60, 140);
        const randomRot = gsap.utils.random(-20, 20);
        tlA.fromTo(c,
          { opacity: 0, y: randomY, rotation: randomRot, scale: 0.6 },
          { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' },
          i * 0.04
        );
      });
    }
    if (desc) {
      const words = desc.querySelectorAll('div');
      gsap.killTweensOf(words);
      gsap.fromTo(words,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.015, ease: 'power2.out', delay: 0.6 }
      );
    }
  }

  /* ── ACTO II: Chars alternando izquierda/derecha con blur ── */
  function _entradaActo2(titulo, desc) {
    if (titulo) {
      const chars = titulo.querySelectorAll('div');
      gsap.killTweensOf(chars);
      const tlA = gsap.timeline();
      chars.forEach((c, i) => {
        const fromX = i % 2 === 0 ? -60 : 60;
        tlA.fromTo(c,
          { opacity: 0, x: fromX, filter: 'blur(8px)', rotateZ: fromX > 0 ? 8 : -8 },
          { opacity: 1, x: 0, filter: 'blur(0px)', rotateZ: 0, duration: 0.6, ease: 'power3.out' },
          i * 0.03
        );
      });
    }
    if (desc) {
      const words = desc.querySelectorAll('div');
      gsap.killTweensOf(words);
      gsap.fromTo(words,
        { opacity: 0, y: 25, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.02, ease: 'power2.out', delay: 0.5 }
      );
    }
  }

  /* ── ACTO III: Typewriter por char con clipPath ── */
  function _entradaActo3(titulo, desc) {
    if (titulo) {
      const chars = titulo.querySelectorAll('div');
      gsap.killTweensOf(chars);
      gsap.fromTo(chars,
        { opacity: 0, clipPath: 'inset(0 100% 0 0)', y: 10 },
        { opacity: 1, clipPath: 'inset(0 0% 0 0)', y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.inOut' }
      );
    }
    if (desc) {
      const words = desc.querySelectorAll('div');
      gsap.killTweensOf(words);
      gsap.fromTo(words,
        { opacity: 0, y: 15, filter: 'blur(5px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, stagger: 0.015, ease: 'power3.out', delay: 0.6 }
      );
    }
  }

  /* ── ACTO IV: Flip 3D por char con perspectiva ── */
  function _entradaActo4(titulo, desc) {
    if (titulo) {
      const chars = titulo.querySelectorAll('div');
      gsap.killTweensOf(chars);
      gsap.fromTo(chars,
        { opacity: 0, rotateX: -90, transformOrigin: '50% 100%', y: 30 },
        { opacity: 1, rotateX: 0, y: 0, duration: 0.7, stagger: 0.035, ease: 'back.out(1.7)', force3D: true }
      );
    }
    if (desc) {
      const words = desc.querySelectorAll('div');
      gsap.killTweensOf(words);
      gsap.fromTo(words,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.012, ease: 'power2.out', delay: 0.5 }
      );
    }
  }

  /* ── ACTO V: Scale elástico por char + dominó ── */
  function _entradaActo5(titulo, desc) {
    if (titulo) {
      const chars = titulo.querySelectorAll('div');
      gsap.killTweensOf(chars);
      gsap.fromTo(chars,
        { opacity: 0, scale: 0, rotation: gsap.utils.random(-15, 15) },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.9, stagger: 0.03, ease: 'elastic.out(1, 0.4)' }
      );
    }
    if (desc) {
      const words = desc.querySelectorAll('div');
      gsap.killTweensOf(words);
      gsap.fromTo(words,
        { opacity: 0, y: 12, rotation: gsap.utils.random(-3, 3) },
        { opacity: 1, y: 0, rotation: 0, duration: 0.5, stagger: { each: 0.02, from: 'start' }, ease: 'power3.out', delay: 0.7 }
      );
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     HOVERS — Únicos por acto (solo desktop)
  ═══════════════════════════════════════════════════════════════ */

  function _registrarHover(actoIdx, panel, titulo, desc) {
    if (!titulo) return;
    const chars = titulo.querySelectorAll('div');

    switch (actoIdx) {
      case 1:
        /* Hover: cada char pulsa en escala + color */
        chars.forEach(c => {
          c.style.cursor = 'default';
          c.addEventListener('mouseenter', () => {
            gsap.to(c, { scale: 1.3, color: 'var(--color-acento)', duration: 0.2, ease: 'elastic.out(1, 0.4)' });
          });
          c.addEventListener('mouseleave', () => {
            gsap.to(c, { scale: 1, color: 'var(--color-texto)', duration: 0.4, ease: 'power2.out' });
          });
        });
        break;

      case 2:
        /* Hover: ola de chars */
        titulo.style.cursor = 'default';
        titulo.addEventListener('mouseenter', () => {
          gsap.to(chars, {
            y: -6, duration: 0.25, stagger: { each: 0.02, from: 'start' }, ease: 'power2.out',
            yoyo: true, repeat: 1,
          });
        });
        break;

      case 3:
        /* Hover: cada char rota al pasar */
        chars.forEach(c => {
          c.style.cursor = 'default';
          c.addEventListener('mouseenter', () => {
            gsap.to(c, { rotation: gsap.utils.random(-8, 8), scale: 1.15, color: 'var(--color-acento)', duration: 0.15 });
          });
          c.addEventListener('mouseleave', () => {
            gsap.to(c, { rotation: 0, scale: 1, color: 'var(--color-texto)', duration: 0.4, ease: 'elastic.out(1, 0.5)' });
          });
        });
        break;

      case 4:
        /* Hover: ScrambleText en chars */
        let scrambling = false;
        titulo.style.cursor = 'default';
        titulo.addEventListener('mouseenter', () => {
          if (scrambling || typeof ScrambleTextPlugin === 'undefined') return;
          scrambling = true;
          chars.forEach(c => {
            const original = c.textContent;
            gsap.to(c, {
              duration: 0.6,
              scrambleText: { text: original, chars: '!<>-_\\/[]{}—=+*^?#', speed: 0.8 },
              onComplete: () => { scrambling = false; }
            });
          });
        });
        break;

      case 5:
        /* Hover: dispersión magnética */
        chars.forEach(c => {
          c.style.cursor = 'default';
          c.addEventListener('mouseenter', () => {
            gsap.to(c, {
              y: gsap.utils.random(-10, 10),
              x: gsap.utils.random(-5, 5),
              scale: 1.2,
              color: 'var(--color-acento)',
              duration: 0.2,
              ease: 'power2.out'
            });
          });
          c.addEventListener('mouseleave', () => {
            gsap.to(c, { y: 0, x: 0, scale: 1, color: 'var(--color-texto)', duration: 0.5, ease: 'elastic.out(1, 0.4)' });
          });
        });
        break;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     SCRAMBLE HOVER — Panel manifiesto
  ═══════════════════════════════════════════════════════════════ */

  function _initScrambleHover(section) {
    if (!soportaHover) return;
    const manifiestoTexto = section.querySelector('.metodo-manifiesto-texto');
    if (!manifiestoTexto || typeof SplitText === 'undefined') return;

    if (typeof ScrambleTextPlugin !== 'undefined') {
      manifiestoTexto.addEventListener('mouseenter', (e) => {
        const word = e.target.closest('.metodo-palabra');
        if (!word || !word.dataset.original) return;
        if (word.textContent === word.dataset.original) {
          gsap.to(word, {
            duration: 0.6,
            scrambleText: { text: word.dataset.original, chars: '!<>-_\\/[]{}—=+*^?#_', speed: 0.8 },
          });
        }
      }, true);
    }
  }

  return { init };
})();
