/* ═══════════════════════════════════════════════════════════════
   MÉTODO — Scroll horizontal + animaciones únicas por acto
   Cada panel tiene su propia personalidad visual
═══════════════════════════════════════════════════════════════ */

const Metodo = (() => {
  /* Detectar si el dispositivo soporta hover real */
  const soportaHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (typeof ScrambleTextPlugin !== 'undefined') gsap.registerPlugin(ScrambleTextPlugin);

    const section = document.querySelector('.metodo');
    if (!section) return;

    const track   = section.querySelector('.metodo-track');
    const paneles = section.querySelectorAll('.metodo-panel');
    if (!track || !paneles.length) return;

    /* ── ScrambleText hover en panel manifiesto ── */
    _initScrambleHover(section);

    const mm = gsap.matchMedia();

    /* ══ DESKTOP/TABLET: scroll horizontal ══ */
    mm.add('(min-width: 600px) and (prefers-reduced-motion: no-preference)', () => {
      const totalWidth = track.scrollWidth;
      const viewWidth  = window.innerWidth;
      const splits = [];

      /* SplitText en todos los paneles */
      paneles.forEach((panel, idx) => {
        const titulo = panel.querySelector('.metodo-panel-titulo');
        const desc   = panel.querySelector('.metodo-panel-desc');
        const lineas = panel.querySelectorAll('.metodo-titulo-linea');

        if (titulo && typeof SplitText !== 'undefined') {
          const s = new SplitText(titulo, { type: 'words' });
          gsap.set(s.words, { opacity: 0 });
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

      /* ── Animaciones por panel ── */
      const panelesArr = Array.from(paneles);
      let actoIndex = 0;

      panelesArr.forEach((panel, idx) => {
        const titulo    = panel.querySelector('.metodo-panel-titulo');
        const desc      = panel.querySelector('.metodo-panel-desc');
        const num       = panel.querySelector('.metodo-panel-num');
        const watermark = panel.querySelector('.metodo-panel-watermark');
        const lineas    = panel.querySelectorAll('.metodo-titulo-linea');
        const manifiesto = panel.querySelector('.metodo-manifiesto-texto');

        /* Determinar qué tipo de panel es */
        let tipoPanel = 'acto';
        if (panel.classList.contains('metodo-panel--intro')) tipoPanel = 'intro';
        else if (panel.classList.contains('metodo-panel--manifiesto')) tipoPanel = 'manifiesto';
        else actoIndex++;

        ScrollTrigger.create({
          trigger: panel,
          containerAnimation: tl,
          start: 'left 55%',
          end: 'right -10%',
          onEnter: () => _animarPanel(tipoPanel, actoIndex, panel, titulo, desc, num, watermark, lineas, manifiesto, 'entrada'),
          onEnterBack: () => _animarPanel(tipoPanel, actoIndex, panel, titulo, desc, num, watermark, lineas, manifiesto, 'entrada'),
          onLeave: () => _animarPanel(tipoPanel, actoIndex, panel, titulo, desc, num, watermark, lineas, manifiesto, 'salida'),
          onLeaveBack: () => _animarPanel(tipoPanel, actoIndex, panel, titulo, desc, num, watermark, lineas, manifiesto, 'salida'),
        });

        /* Registrar hovers únicos por acto */
        if (soportaHover && tipoPanel === 'acto') {
          _registrarHover(actoIndex, panel, titulo, desc);
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
        p.style.minHeight = '80vh';
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
     ANIMACIONES POR TIPO DE PANEL
  ═══════════════════════════════════════════════════════════════ */

  function _animarPanel(tipo, actoIdx, panel, titulo, desc, num, watermark, lineas, manifiesto, dir) {
    if (dir === 'entrada') {
      _animarWatermark(watermark, 'in');
      _animarNum(num, 'in');

      if (tipo === 'intro') _entradaIntro(lineas);
      else if (tipo === 'manifiesto') _entradaManifiesto(manifiesto);
      else _entradaActo(actoIdx, titulo, desc);
    } else {
      _animarWatermark(watermark, 'out');
      _animarNum(num, 'out');

      if (tipo === 'intro') _salidaIntro(lineas);
      else if (tipo === 'manifiesto') _salidaManifiesto(manifiesto);
      else _salidaActo(titulo, desc);
    }
  }

  /* ── Watermark (común) ── */
  function _animarWatermark(el, dir) {
    if (!el) return;
    gsap.killTweensOf(el);
    if (dir === 'in') {
      gsap.fromTo(el, { scale: 1.5, opacity: 0, filter: 'blur(8px)' },
        { scale: 1, opacity: 0.06, filter: 'blur(2px)', duration: 1.4, ease: 'power3.out' });
    } else {
      gsap.to(el, { scale: 0.8, opacity: 0, filter: 'blur(6px)', duration: 0.4, ease: 'power2.in' });
    }
  }

  /* ── Número de acto (común) ── */
  function _animarNum(el, dir) {
    if (!el) return;
    gsap.killTweensOf(el);
    if (dir === 'in') {
      gsap.fromTo(el, { opacity: 0, x: -20 }, { opacity: 0.7, x: 0, duration: 0.5, ease: 'power2.out' });
    } else {
      gsap.to(el, { opacity: 0, x: 20, duration: 0.3, ease: 'power2.in' });
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

  /* ═══ MANIFIESTO — Decodificación binaria + dispersión → reorden ═══ */
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

  /* Inicializar dispersión + decodificación progresiva */
  function _initManifiestoDecoder(section, tl) {
    const manifiesto = section.querySelector('.metodo-manifiesto-texto');
    const panel = section.querySelector('.metodo-panel--manifiesto');
    if (!manifiesto || !panel || typeof ScrambleTextPlugin === 'undefined') return;

    const words = manifiesto.querySelectorAll('.metodo-palabra');
    if (!words.length) return;

    /* Guardar textos originales y posiciones naturales */
    const originals = [];
    const naturalPositions = [];

    words.forEach(w => {
      if (!w.dataset.original) w.dataset.original = w.textContent;
      originals.push(w.dataset.original);
      /* Guardar posición natural (inline flow) */
      const rect = w.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      naturalPositions.push({
        x: rect.left - panelRect.left,
        y: rect.top - panelRect.top,
      });
    });

    /* Hacer el contenedor relative para posicionar absolutamente */
    manifiesto.style.position = 'relative';
    manifiesto.style.width = '100%';
    manifiesto.style.height = '100%';

    /* Dispersar palabras por el viewport con tamaños y rotaciones variadas */
    const panelW = panel.offsetWidth;
    const panelH = panel.offsetHeight;
    const padding = 60; /* margen para no salirse */

    words.forEach((w, i) => {
      /* Posición aleatoria dentro del panel */
      const randX = gsap.utils.random(padding, panelW - padding - 100);
      const randY = gsap.utils.random(padding, panelH - padding - 40);
      const randScale = gsap.utils.random(0.7, 1.8);
      const randRotation = gsap.utils.random(-12, 12);

      /* Posicionar absolutamente */
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

      /* Guardar posición dispersa para poder volver */
      w.dataset.disperseX = randX;
      w.dataset.disperseY = randY;
      w.dataset.disperseScale = randScale;
      w.dataset.disperseRotation = randRotation;

      /* Mostrar como binario inicialmente */
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

        /* Fase 1 (0% - 75%): Decodificar palabras progresivamente */
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
              gsap.to(words[i], {
                duration: 0.3,
                scrambleText: { text: bin, chars: '01', speed: 1 },
              });
            }
          }
          lastRevealed = shouldReveal;

          /* Si estábamos reordenados y volvemos atrás, dispersar de nuevo */
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

        /* Fase 2 (75% - 100%): Reordenar a párrafo legible */
        if (progress >= 0.75 && !reordered) {
          reordered = true;
          /* Animar cada palabra a su posición natural (inline) */
          words.forEach((w, i) => {
            gsap.to(w, {
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              position: 'relative',
              duration: 0.8,
              ease: 'power3.inOut',
              delay: i * 0.008,
            });
          });
          /* Asegurar que todas estén decodificadas */
          words.forEach((w, i) => {
            if (w.textContent !== originals[i]) {
              gsap.to(w, {
                duration: 0.4,
                scrambleText: { text: originals[i], chars: '01', speed: 1 },
              });
            }
          });
          manifiesto.style.height = 'auto';
        }
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     ACTOS — Cada uno con animación única
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
      const words = titulo.querySelectorAll('div');
      gsap.killTweensOf(words);
      gsap.to(words, { opacity: 0, y: -25, duration: 0.3, ease: 'power2.in' });
    }
    if (desc) {
      const words = desc.querySelectorAll('div');
      gsap.killTweensOf(words);
      gsap.to(words, { opacity: 0, y: -15, filter: 'blur(3px)', duration: 0.25, ease: 'power2.in' });
    }
  }

  /* ── ACTO I: Cascada desde posiciones Y aleatorias + rotación ── */
  function _entradaActo1(titulo, desc) {
    if (titulo) {
      const words = titulo.querySelectorAll('div');
      gsap.killTweensOf(words);
      words.forEach((w, i) => {
        const randomY = gsap.utils.random(60, 120);
        const randomRot = gsap.utils.random(-15, 15);
        gsap.fromTo(w,
          { opacity: 0, y: randomY, rotation: randomRot, scale: 0.8 },
          { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.5)', delay: i * 0.08 }
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

  /* ── ACTO II: Alternando izquierda/derecha + desc encadenada ── */
  function _entradaActo2(titulo, desc) {
    if (titulo) {
      const words = titulo.querySelectorAll('div');
      gsap.killTweensOf(words);
      words.forEach((w, i) => {
        const fromX = i % 2 === 0 ? -80 : 80;
        gsap.fromTo(w,
          { opacity: 0, x: fromX, rotateZ: fromX > 0 ? 5 : -5 },
          { opacity: 1, x: 0, rotateZ: 0, duration: 0.7, ease: 'power3.out', delay: i * 0.1 }
        );
      });
    }
    if (desc) {
      const words = desc.querySelectorAll('div');
      gsap.killTweensOf(words);
      /* Encadenar después del título */
      const tituloDelay = titulo ? titulo.querySelectorAll('div').length * 0.1 + 0.3 : 0;
      gsap.fromTo(words,
        { opacity: 0, y: 25, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.02, ease: 'power2.out', delay: tituloDelay }
      );
    }
  }

  /* ── ACTO III: Typewriter (clipPath reveal) + desc con blur ── */
  function _entradaActo3(titulo, desc) {
    if (titulo) {
      const words = titulo.querySelectorAll('div');
      gsap.killTweensOf(words);
      gsap.fromTo(words,
        { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
        { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.6, stagger: 0.12, ease: 'power2.inOut' }
      );
    }
    if (desc) {
      const words = desc.querySelectorAll('div');
      gsap.killTweensOf(words);
      const tituloDelay = titulo ? titulo.querySelectorAll('div').length * 0.12 + 0.2 : 0;
      gsap.fromTo(words,
        { opacity: 0, y: 15, filter: 'blur(5px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, stagger: 0.015, ease: 'power3.out', delay: tituloDelay }
      );
    }
  }

  /* ── ACTO IV: Flip 3D con rotateX + perspectiva ── */
  function _entradaActo4(titulo, desc) {
    if (titulo) {
      const words = titulo.querySelectorAll('div');
      gsap.killTweensOf(words);
      gsap.fromTo(words,
        { opacity: 0, rotateX: -90, transformOrigin: '50% 100%', y: 30 },
        { opacity: 1, rotateX: 0, y: 0, duration: 0.8, stagger: 0.08, ease: 'back.out(1.7)', force3D: true }
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

  /* ── ACTO V: Scale elástico + desc dominó ── */
  function _entradaActo5(titulo, desc) {
    if (titulo) {
      const words = titulo.querySelectorAll('div');
      gsap.killTweensOf(words);
      gsap.fromTo(words,
        { opacity: 0, scale: 0, rotation: -10 },
        { opacity: 1, scale: 1, rotation: 0, duration: 1, stagger: 0.07, ease: 'elastic.out(1, 0.4)' }
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
    const words = titulo.querySelectorAll('div');

    switch (actoIdx) {
      case 1:
        /* Hover: cada palabra pulsa en escala + color */
        words.forEach(w => {
          w.style.cursor = 'default';
          w.addEventListener('mouseenter', () => {
            gsap.to(w, { scale: 1.15, color: 'var(--color-acento)', duration: 0.25, ease: 'elastic.out(1, 0.4)' });
          });
          w.addEventListener('mouseleave', () => {
            gsap.to(w, { scale: 1, color: 'var(--color-texto)', duration: 0.4, ease: 'power2.out' });
          });
        });
        break;

      case 2:
        /* Hover: ScrambleText en todo el título */
        let scrambling = false;
        titulo.style.cursor = 'default';
        titulo.addEventListener('mouseenter', () => {
          if (scrambling || typeof ScrambleTextPlugin === 'undefined') return;
          scrambling = true;
          words.forEach(w => {
            const original = w.textContent;
            gsap.to(w, {
              duration: 0.8,
              scrambleText: { text: original, chars: '!<>-_\\/[]{}—=+*^?#', speed: 0.6 },
              onComplete: () => { scrambling = false; }
            });
          });
        });
        break;

      case 3:
        /* Hover: underline reveal con clip-path */
        words.forEach(w => {
          w.style.cursor = 'default';
          w.style.position = 'relative';
          w.addEventListener('mouseenter', () => {
            gsap.to(w, { color: 'var(--color-acento)', duration: 0.2 });
            gsap.fromTo(w, { backgroundSize: '0% 2px' }, { backgroundSize: '100% 2px', duration: 0.3, ease: 'power2.out' });
          });
          w.addEventListener('mouseleave', () => {
            gsap.to(w, { color: 'var(--color-texto)', backgroundSize: '0% 2px', duration: 0.3 });
          });
        });
        break;

      case 4:
        /* Hover: wave — palabras suben en ola */
        titulo.style.cursor = 'default';
        titulo.addEventListener('mouseenter', () => {
          gsap.to(words, {
            y: -8, duration: 0.3, stagger: { each: 0.05, from: 'start' }, ease: 'power2.out',
            yoyo: true, repeat: 1,
          });
        });
        break;

      case 5:
        /* Hover: cada palabra rota ligeramente al pasar */
        words.forEach(w => {
          w.style.cursor = 'default';
          w.addEventListener('mouseenter', () => {
            gsap.to(w, { rotation: gsap.utils.random(-5, 5), scale: 1.08, duration: 0.2, ease: 'power2.out' });
          });
          w.addEventListener('mouseleave', () => {
            gsap.to(w, { rotation: 0, scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
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

    /* El SplitText ya se hace en el bloque principal, aquí solo registramos hovers */
    /* Los hovers se activan después de que la palabra fue decodificada */
    if (typeof ScrambleTextPlugin !== 'undefined') {
      /* Delegación de evento para palabras ya decodificadas */
      manifiestoTexto.addEventListener('mouseenter', (e) => {
        const word = e.target.closest('.metodo-palabra');
        if (!word || !word.dataset.original) return;
        /* Solo hacer hover scramble si la palabra ya muestra su texto original */
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
