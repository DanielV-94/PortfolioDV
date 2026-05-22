/* ═══════════════════════════════════════════════════════════════
   HERO — Animación de entrada coreografiada, DANIEL draggable,
   frase editable con respuesta interactiva de Daniel
═══════════════════════════════════════════════════════════════ */

const Hero = (() => {
  /* ── Elementos DOM ── */
  const elNombreDaniel = document.getElementById("nombreDaniel");
  const elNombreVelez = document.getElementById("nombreVelez");
  const elFrasesEditables = document.querySelectorAll(".hero-frase-editable");
  const elFrasesFijas = document.querySelectorAll(".hero-frase-fija");
  const elReloj = document.getElementById("relojHero");

  /* ─────────────────────────────────────────
     RELOJ EN TIEMPO REAL — GDL (CST/CDT)
  ───────────────────────────────────────── */
  function iniciarReloj() {
    const actualizar = () => {
      if (!elReloj) return;
      const ahora = new Date();
      const opciones = {
        timeZone: "America/Mexico_City",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const hora = new Intl.DateTimeFormat("es-MX", opciones).format(ahora);
      elReloj.textContent = `GDL — ${hora} CST`;
    };
    actualizar();
    setInterval(actualizar, 1000);
  }

  /* ─────────────────────────────────────────
     CONFIG — Variables maestras de la secuencia
     Ajusta delays, duraciones y textos aquí
  ───────────────────────────────────────── */
  const INTRO_CFG = {
    extra_duracion_anim: 0.1,
    texto_leyenda:      'Daniel está editando...',
    dur_fade_nombre:    0.8,
    dur_bbox:           0.6,
    dur_tooltip:        0.35,
    dur_pausa_daniel:   1.5,
    dur_pausa_velez:    1.5,
    dur_char:           0.072,
    dur_fade_out:       0.25,
    dur_pausa_final:    0.5,
    ease_entrada:       'power3.out',
    ease_bbox:          'power3.out',
    delay_esquinas:     0.0,
    delay_leyenda:      0.2,
    delay_daniel:       1.3,
    delay_velez_offset: 0.7,
    delay_frases_offset: 1.1,
    delay_entre_frases: 0.6,
  };

  /* Registro de overlays efímeros para limpiar al final */
  let _overlays = [];
  let _introTl = null;
  let _introSkipBound = false;

  function activarBloqueoCursorIntro() {
    document.body.classList.add('intro-activa');
    document.body.classList.add('cursor-oculto');
  }

  function liberarBloqueoCursorIntro() {
    document.body.classList.remove('intro-activa');
    document.body.classList.remove('cursor-oculto');
  }

  function liberarCursorSiProcede() {
    if (document.body.classList.contains('intro-activa')) return;
    document.body.classList.remove('cursor-oculto');
  }

  /* ─────────────────────────────────────────
     OVERLAY HELPERS
     Elementos DOM posicionados con
     getBoundingClientRect() + GSAP transform.
     Nunca tocan el layout — solo opacity/transform.
  ───────────────────────────────────────── */
  function _regOverlay(el) { _overlays.push(el); return el; }

  function _crearLeyenda(texto) {
    const el = document.createElement('div');
    el.className = 'hero-intro-legend';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.textContent = texto;
    gsap.set(el, { opacity: 0 });
    document.body.appendChild(el);
    return el; // no se registra — se gestiona por separado
  }

  // Flash de pantalla para reforzar sensación de edición "en vivo"
  function _crearFlashIntro() {
    const el = document.createElement('div');
    el.className = 'hero-intro-flash';
    gsap.set(el, { opacity: 0 });
    document.body.appendChild(el);
    return el;
  }

  // Bounding box: tamaño via style inline, posición via GSAP transform
  // Mide el rect REAL del texto visible (no el bloque contenedor)
  function _textRect(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = Array.from(range.getClientRects());
    if (!rects.length) return el.getBoundingClientRect();
    const left   = Math.min(...rects.map(r => r.left));
    const top    = Math.min(...rects.map(r => r.top));
    const right  = Math.max(...rects.map(r => r.right));
    const bottom = Math.max(...rects.map(r => r.bottom));
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  }

  // Bounding box basado en texto real con Range
  function _crearBbox(targetEl) {
    const PAD_X = 16;
    const PAD_TOP = 8;
    const esVelez = targetEl.classList.contains('hero-nombre-velez');
    const r  = _textRect(targetEl);
    // Las fuentes display incluyen espacio de descendentes (~18%) aunque no haya descendentes visibles.
    // Recortamos ese espacio para que el borde inferior quede pegado a las letras.
    const descenderCrop = Math.round(r.height * 0.18);
    const PAD_BOTTOM = -descenderCrop;
    const el = document.createElement('div');
    el.className    = `hero-intro-bbox${esVelez ? ' hero-intro-bbox--velez' : ''}`;
    el.style.width  = (r.width  + PAD_X * 2) + 'px';
    el.style.height = (r.height + PAD_TOP + PAD_BOTTOM) + 'px';
    const bboxLeft = r.left - PAD_X;
    const bboxTop = r.top - PAD_TOP;
    el.dataset.bboxLeft = bboxLeft;
    el.dataset.bboxTop  = bboxTop;
    gsap.set(el, {
      x: bboxLeft,
      y: bboxTop,
      opacity: 0,
      scaleX: 0.76,
      transformOrigin: 'left center',
    });
    document.body.appendChild(el);
    return _regOverlay(el);
  }

  // Label alineada al borde real del bbox
  function _crearLabel(targetEl, texto, posicion, bboxEl) {
    const r  = _textRect(targetEl);
    const el = document.createElement('div');
    el.className   = 'hero-intro-label';
    el.textContent = texto;

    // Medir primero para colocar y mantener visible en viewport
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    const lblW = el.offsetWidth;
    const lblH = el.offsetHeight;
    el.style.visibility = '';

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 8;

    let fx, fy;
    if (posicion === 'bottom-right') {
      const bboxLeft = bboxEl ? parseFloat(bboxEl.dataset.bboxLeft) : (r.left - 16);
      const bboxTop = bboxEl ? parseFloat(bboxEl.dataset.bboxTop) : (r.top - 8);
      const bboxRight = bboxLeft + (bboxEl ? bboxEl.offsetWidth : r.width + 32);
      const bboxBottom = bboxTop + (bboxEl ? bboxEl.offsetHeight : r.height + 9);
      fx = bboxRight - lblW;
      fy = bboxBottom + 8;

      // Si no cabe debajo (caso VELEZ cerca del borde), subirlo arriba del bbox
      if (fy + lblH > vh - pad) {
        fy = bboxTop - lblH - 8;
      }
    } else if (posicion === 'top-right') {
      const bboxLeft = bboxEl ? parseFloat(bboxEl.dataset.bboxLeft) : (r.left - 16);
      const bboxTop = bboxEl ? parseFloat(bboxEl.dataset.bboxTop) : (r.top - 8);
      const bboxRight = bboxLeft + (bboxEl ? bboxEl.offsetWidth : r.width + 32);
      fx = bboxRight - lblW;
      fy = bboxTop - lblH - 8;
    } else {
      fx = bboxEl ? parseFloat(bboxEl.dataset.bboxLeft) : r.left - 16;
      fy = bboxEl ? parseFloat(bboxEl.dataset.bboxTop) - 28 : r.top - 30;
    }

    fx = clamp(fx, pad, vw - lblW - pad);
    fy = clamp(fy, pad, vh - lblH - pad);

    el.dataset.fy = fy;
    gsap.set(el, { x: fx, y: fy + 10, opacity: 0 });
    return _regOverlay(el);
  }

  // Tooltip glassmorphism — borde derecho alineado al borde izquierdo del bbox
  function _crearTooltip(targetEl, props, bboxEl) {
    const r  = _textRect(targetEl);
    const el = document.createElement('div');
    el.className = 'hero-intro-tooltip';
    el.innerHTML  = props.map(([k, v]) =>
      `<span class="tip-row"><span class="tip-key">${k}</span>` +
      `<span class="tip-sep"> = </span><span class="tip-val">${v}</span></span>`
    ).join('');
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    const tipW = el.offsetWidth;
    el.style.visibility = '';
    const bboxLeft = bboxEl ? parseFloat(bboxEl.dataset.bboxLeft) : (r.left - 16);
    const fx = bboxLeft - tipW - 12;
    const fy = r.top + r.height * 0.10;
    el.dataset.fx = fx;
    gsap.set(el, { x: fx + 18, y: fy, opacity: 0 });
    return _regOverlay(el);
  }

  // Fade-out y destrucción de todos los overlays registrados
  function _limpiarOverlays() {
    if (!_overlays.length) return;
    gsap.to(_overlays, {
      opacity: 0,
      duration: INTRO_CFG.dur_fade_out + INTRO_CFG.extra_duracion_anim,
      ease: 'power2.in',
      stagger: 0.04,
      onComplete: () => {
        _overlays.forEach(el => el.remove());
        _overlays = [];
      },
    });
  }

  function _removeIntroArtifactsImmediate() {
    gsap.killTweensOf(_overlays);
    _overlays.forEach((el) => el.remove());
    _overlays = [];

    document.querySelectorAll('.hero-intro-legend, .hero-intro-flash').forEach((el) => {
      gsap.killTweensOf(el);
      el.remove();
    });
  }

  function _finalizarIntroInstantaneo() {
    if (_introTl) {
      _introTl.kill();
      _introTl = null;
    }

    _removeIntroArtifactsImmediate();

    gsap.set([elNombreDaniel, elNombreVelez], { opacity: 1, y: 0, scale: 1 });
    gsap.set(elFrasesFijas, { opacity: 1, y: 0 });

    [...elFrasesEditables].forEach((el) => {
      const original = (el.dataset.original || "").trim();
      if (original) el.textContent = original;
    });

    liberarBloqueoCursorIntro();
  }

  function _bindIntroSkip() {
    if (_introSkipBound) return;
    _introSkipBound = true;

    const maybeSkip = () => {
      if (window.scrollY <= 36) return;
      _finalizarIntroInstantaneo();
      window.removeEventListener('scroll', maybeSkip, { passive: true });
      _introSkipBound = false;
    };

    window.addEventListener('scroll', maybeSkip, { passive: true });
  }

  // Typewriter con cursor parpadeante que simula escritura real
  function _typeWriter(tl, el, texto, t0) {
    el.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'hero-tw-cursor';
    cursor.textContent = '|';
    el.appendChild(cursor);
    let pulseTween;
    tl.call(() => {
      pulseTween = gsap.fromTo(cursor,
        { opacity: 1 },
        { opacity: 0, duration: 0.42, ease: 'steps(1)', yoyo: true, repeat: -1 }
      );
    }, [], t0);
    [...texto].forEach((ch, i) => {
      tl.call(() => {
        el.insertBefore(document.createTextNode(ch), cursor);
      }, [], t0 + (i + 1) * INTRO_CFG.dur_char);
    });
    const tEnd = t0 + (texto.length + 1) * INTRO_CFG.dur_char;
    tl.call(() => {
      if (pulseTween) pulseTween.kill();
      gsap.to(cursor, { opacity: 0, duration: 0.2, onComplete: () => cursor.remove() });
    }, [], tEnd);
    return tEnd;
  }

  /* ─────────────────────────────────────────
     ANIMACIÓN DE ENTRADA COREOGRAFIADA
     "Behind the scenes" — Daniel diseñando en vivo
  ───────────────────────────────────────── */
  function animarEntrada() {
    const C        = INTRO_CFG;
    const dur      = (valorBase) => valorBase + C.extra_duracion_anim;
    const esquinas = document.querySelectorAll('.esquina');
    const isMobile = window.innerWidth < 768;
    const editables = [...document.querySelectorAll('.hero-frase-editable')];
    const textos    = editables.map(el => el.textContent.trim());

    // Durante la intro no se debe ver ningún cursor
    activarBloqueoCursorIntro();

    /* — prefers-reduced-motion: saltar al estado final — */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([elNombreDaniel, elNombreVelez], { opacity: 1, y: 0, scale: 1 });
      gsap.set(elFrasesFijas, { opacity: 1, y: 0 });
      editables.forEach((el, i) => { if (textos[i]) el.textContent = textos[i]; });
      liberarBloqueoCursorIntro();
      return;
    }

    /* — Estado inicial: todo invisible — */
    gsap.set(esquinas,       { opacity: 0 });
    gsap.set(elNombreDaniel, { opacity: 0, y: 50, scale: 0.96 });
    gsap.set(elNombreVelez,  { opacity: 0, y: 50, scale: 0.96 });
    gsap.set(elFrasesFijas,  { opacity: 0, y: 22 });
    editables.forEach(el => { el.textContent = ''; });

    const leyenda = _crearLeyenda(C.texto_leyenda);
    const tl      = gsap.timeline();
    _introTl = tl;

    _bindIntroSkip();

    /* ══ FASE 0: Esquinas HUD ══ */
    tl.to(esquinas, {
      opacity: 1, duration: dur(0.7), stagger: 0.18, ease: 'power2.out',
    }, C.delay_esquinas);

    /* ══ FASE 0a: Doble parpadeo — "live editing" ══ */
    tl.call(() => {
      const flash = _crearFlashIntro();
      gsap.timeline({ onComplete: () => flash.remove() })
        .to(flash, { opacity: 0.70, duration: 0.085, ease: 'power1.out' })
        .to(flash, { opacity: 0.00, duration: 0.13, ease: 'power1.in' })
        .to(flash, { opacity: 0.55, duration: 0.085, ease: 'power1.out', delay: 0.06 })
        .to(flash, { opacity: 0.00, duration: 0.16, ease: 'power1.in' });
    }, [], C.delay_leyenda - 0.18);

    /* ══ FASE 0b: Leyenda "Daniel está editando..." ══ */
    tl.to(leyenda, {
      opacity: 1, duration: dur(0.9), ease: 'power2.out',
    }, C.delay_leyenda);

    tl.call(() => {
      gsap.fromTo(leyenda,
        { opacity: 1 },
        { opacity: 0.35, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }
      );
    }, [], C.delay_leyenda + 1.0);

    /* ══ FASE 1: DANIEL ══ */
    const t_daniel = C.delay_daniel;

    tl.to(elNombreDaniel, {
      opacity: 1, y: 0, scale: 1,
      duration: dur(C.dur_fade_nombre), ease: C.ease_entrada,
    }, t_daniel);

    const t_daniel_overlays = t_daniel + dur(C.dur_fade_nombre) + 0.2;

    tl.call(() => {
      const bbox = _crearBbox(elNombreDaniel);
      gsap.to(bbox, { opacity: 1, scaleX: 1, duration: dur(C.dur_bbox), ease: C.ease_bbox });
    }, [], t_daniel_overlays);

    tl.call(() => {
      const bboxDaniel = _overlays.find(el => el.classList.contains('hero-intro-bbox'));
      const lbl = _crearLabel(elNombreDaniel, 'h1 / First Name', 'top-left', bboxDaniel);
      gsap.to(lbl, { opacity: 1, y: parseFloat(lbl.dataset.fy), duration: dur(C.dur_tooltip), ease: C.ease_bbox });
    }, [], t_daniel_overlays + 0.35);

    tl.call(() => {
      if (isMobile) return;
      const bboxDaniel = _overlays.find(el => el.classList.contains('hero-intro-bbox'));
      const tip = _crearTooltip(elNombreDaniel, [
        ['tracking',    '0.04em'],
        ['font-weight', '700'],
        ['font-size',   'clamp(113px, 21.6vw, 348px)'],
        ['color',       'var(--nombre-daniel)'],
      ], bboxDaniel);
      gsap.to(tip, { opacity: 1, x: parseFloat(tip.dataset.fx), duration: dur(C.dur_tooltip), ease: C.ease_bbox });
    }, [], t_daniel_overlays + 0.55);

    /* ══ FASE 2: VELEZ ══ */
    const t_velez = t_daniel_overlays + C.dur_pausa_daniel + C.delay_velez_offset;

    tl.to(elNombreVelez, {
      opacity: 1, y: 0, scale: 1,
      duration: dur(C.dur_fade_nombre), ease: C.ease_entrada,
    }, t_velez);

    const t_velez_overlays = t_velez + dur(C.dur_fade_nombre) + 0.2;

    tl.call(() => {
      const bbox = _crearBbox(elNombreVelez);
      gsap.to(bbox, { opacity: 1, scaleX: 1, duration: dur(C.dur_bbox), ease: C.ease_bbox });
    }, [], t_velez_overlays);

    tl.call(() => {
      const bboxVelez = _overlays.filter(el => el.classList.contains('hero-intro-bbox')).at(-1);
      const lbl = _crearLabel(elNombreVelez, 'h2 / Last Name', 'top-right', bboxVelez);
      gsap.to(lbl, { opacity: 1, y: parseFloat(lbl.dataset.fy), duration: dur(C.dur_tooltip), ease: C.ease_bbox });
    }, [], t_velez_overlays + 0.35);

    tl.call(() => {
      if (isMobile) return;
      const r = _textRect(elNombreVelez);
      const bboxVelez = _overlays.filter(el => el.classList.contains('hero-intro-bbox')).at(-1);
      const tip = _crearTooltip(elNombreVelez, [
        ['x1', `${Math.round(r.left)}px`],
        ['y1', `${Math.round(r.top)}px`],
        ['x2', `${Math.round(r.right)}px`],
        ['y2', `${Math.round(r.bottom)}px`],
      ], bboxVelez);
      gsap.to(tip, { opacity: 1, x: parseFloat(tip.dataset.fx), duration: dur(C.dur_tooltip), ease: C.ease_bbox });
    }, [], t_velez_overlays + 0.55);

    /* ══ FASE 3: Typewriter — overlays persisten durante la escritura ══ */
    const t_frases_inicio = t_velez_overlays + C.dur_pausa_velez + C.delay_frases_offset;
    let tCursor = t_frases_inicio;

    [...elFrasesFijas].forEach((fija, i) => {
      const tFila = i === 0 ? tCursor : tCursor + C.delay_entre_frases;
      tl.to(fija, { opacity: 1, y: 0, duration: dur(0.4), ease: 'power2.out' }, tFila);
      if (editables[i] && textos[i]) {
        tCursor = _typeWriter(tl, editables[i], textos[i], tFila + 0.5);
      } else {
        tCursor = tFila + dur(0.7);
      }
    });

    /* Overlays desaparecen DESPUÉS de la última frase */
    tl.call(_limpiarOverlays, [], tCursor + 0.3);

    /* ══ FASE 4: Cierre ══ */
    const tFinal = tCursor + C.dur_pausa_final;

    tl.call(() => {
      gsap.killTweensOf(leyenda);
      gsap.to(leyenda, {
        opacity: 0, duration: dur(0.8), ease: 'power2.in',
        onComplete: () => leyenda.remove(),
      });
    }, [], tFinal);

    tl.call(() => {
      liberarBloqueoCursorIntro();
    }, [], tFinal + 0.3);

    tl.call(() => {
      _introTl = null;
      _introSkipBound = false;
    }, [], tFinal + 0.35);

    return tl;
  }

  /* ─────────────────────────────────────────
     RESPUESTA EDITABLE — GSAP (3 palabras)
     Estados: IDLE → DRAGGING → RETURNING →
     MESSAGING → IDLE
  ───────────────────────────────────────── */
  const EDIT_CFG = {
    mensajes: [
      "mmmm mejor no!",
      "deja de cambiar mi diseño! 0 y van 2 eh!!",
      "OK haz lo que quieras!! Me rindo.",
    ],
    debounceEscritura: 950,
    debounceBlur: 120,
    durCursorEntrada: 0.28,
    durCursorMove: 1.15,
    durBubblePop: 0.48,
    bubbleHold: 3.8,
    durBubbleOut: 0.4,
    durCursorOut: 0.32,
    charMensaje: 0.068,
    charRestore: 0.055,
    easeRetorno: "power2.inOut",
    easeBubble: "back.out(1.7)",
    easeType: "power1.inOut",
  };

  let _editMsgIdx = 0;

  let editTl = null;
  let editCursorEl = null;
  let editBubbleEl = null;
  let isProgrammaticEdit = false;
  const editTimeouts = new WeakMap();
  const editArea = document.querySelector(".hero-editable-area") || document.body;

  function limpiarSeleccionEditable() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) sel.removeAllRanges();
  }

  function seleccionarPalabra(el) {
    if (!el) return;
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function getWordRect(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = Array.from(range.getClientRects());
    if (!rects.length) return el.getBoundingClientRect();
    const left = Math.min(...rects.map((r) => r.left));
    const top = Math.min(...rects.map((r) => r.top));
    const right = Math.max(...rects.map((r) => r.right));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  }

  function ensureEditOverlays() {
    if (!editCursorEl) {
      editCursorEl = document.createElement("div");
      /* Reutiliza el mismo cursor visual que el drag */
      editCursorEl.className = "hero-drag-custom-cursor";
      editCursorEl.setAttribute("aria-hidden", "true");
      document.body.appendChild(editCursorEl);
      gsap.set(editCursorEl, { autoAlpha: 0, scale: 0.7 });
    }

    if (!editBubbleEl) {
      editBubbleEl = document.createElement("div");
      /* Reutiliza el mismo estilo de burbuja que el drag */
      editBubbleEl.className = "hero-drag-bubble";
      editBubbleEl.setAttribute("aria-live", "polite");
      editBubbleEl.setAttribute("aria-atomic", "true");
      document.body.appendChild(editBubbleEl);
      gsap.set(editBubbleEl, { autoAlpha: 0, scale: 0, transformOrigin: "center bottom" });
    }
  }

  function killEditTimeline() {
    if (editTl) {
      editTl.kill();
      editTl = null;
    }
    /* Restaurar cursor de usuario si quedó oculto */
    liberarCursorSiProcede();
  }

  /* Typewriter pausado y realista:
     pausa extra en puntuación y espacios,
     variación aleatoria entre caracteres */
  function typewriterCallSequence(tl, text, startAt, onChar) {
    const chars = [...text];
    let t = startAt;
    chars.forEach((char, i) => {
      tl.call(() => onChar(char, i), [], t);
      /* Pausa base + variación aleatoria */
      let delay = EDIT_CFG.charMensaje + (Math.random() * 0.05);
      /* Pausa extra en signos y espacios */
      if (/[.!?,;]/.test(char))  delay += 0.28 + Math.random() * 0.18;
      else if (char === " ")     delay += 0.06 + Math.random() * 0.06;
      t += delay;
    });
    return t;
  }

  function _getSiguienteMensaje() {
    const msg = EDIT_CFG.mensajes[_editMsgIdx % EDIT_CFG.mensajes.length];
    _editMsgIdx++;
    return msg;
  }

  function activarRespuestaDaniel(elEditable) {
        // Parpadeo visual antes de la reacción de Daniel
        const flash = (typeof _crearFlashIntro === 'function') ? _crearFlashIntro() : null;
        if (flash) {
          gsap.timeline({ onComplete: () => flash.remove() })
            .to(flash, { opacity: 0.70, duration: 0.085, ease: 'power1.out' })
            .to(flash, { opacity: 0.00, duration: 0.13, ease: 'power1.in' })
            .to(flash, { opacity: 0.55, duration: 0.085, ease: 'power1.out', delay: 0.06 })
            .to(flash, { opacity: 0.00, duration: 0.16, ease: 'power1.in' });
        }
    if (!elEditable) return;
    ensureEditOverlays();

    const original = (elEditable.dataset.original || "").trim();
    const escrito = (elEditable.textContent || "").trim();
    if (!original || !escrito || escrito === original) return;
    killEditTimeline();

    /* Elegir el siguiente mensaje en secuencia */
    const mensaje = _getSiguienteMensaje();

    const rect = getWordRect(elEditable);
    const targetX = rect.left + rect.width * 0.5;
    const targetY = rect.top + rect.height * 0.56;
    /* En móvil: burbuja centrada verticalmente en la parte alta de pantalla.
       En desktop: clamp para no salirse del viewport. */
    const isMobile = window.innerWidth <= 1024;
    let bubbleX, bubbleY;
    if (isMobile) {
      bubbleX = window.innerWidth / 2;
      bubbleY = window.innerHeight * 0.09;
    } else {
      const bubbleW = Math.min(editBubbleEl.offsetWidth || 220, window.innerWidth * 0.78);
      const bubbleXRaw = targetX + 18;
      bubbleX = Math.min(bubbleXRaw, window.innerWidth - bubbleW - 12);
      bubbleY = targetY - 64;
    }

    editTl = gsap.timeline({
      defaults: { ease: EDIT_CFG.easeRetorno, overwrite: "auto" },
      onComplete: () => {
        editArea.classList.remove("is-edit-reacting");
        liberarCursorSiProcede();
        limpiarSeleccionEditable();
      },
      onInterrupt: () => {
        editArea.classList.remove("is-edit-reacting");
        liberarCursorSiProcede();
        limpiarSeleccionEditable();
      },
    });

    editArea.classList.add("is-edit-reacting");
    /* Ocultar cursor nativo del usuario mientras Daniel reacciona */
    document.body.classList.add("cursor-oculto");

    const startX = window.innerWidth * 0.84;
    const startY = Math.max(24, targetY - 140);

    /* t=0 — cursor aparece en esquina superior derecha */
    editTl
      .set(editCursorEl, {
        x: startX,
        y: startY,
        autoAlpha: 0,
        scale: 0.72,
      }, 0)
      .to(editCursorEl, {
        autoAlpha: 1,
        scale: 1,
        duration: EDIT_CFG.durCursorEntrada,
        ease: "power2.out",
      }, 0)
      /* t=0.06 — se mueve lentamente hacia la palabra */
      .to(editCursorEl, {
        x: targetX,
        y: targetY,
        duration: EDIT_CFG.durCursorMove,
        ease: "power2.inOut",
      }, 0.06)
      /* Cuando llega: selecciona la palabra */
      .call(() => {
        seleccionarPalabra(elEditable);
      }, [], 0.06 + EDIT_CFG.durCursorMove * 0.85)
      /* Pequeña pausa dramática antes de la burbuja */
      .set(editBubbleEl, {
        x: bubbleX,
        y: bubbleY,
        autoAlpha: 1,
        scale: 0,
      }, 0.06 + EDIT_CFG.durCursorMove + 0.22)
      .to(editBubbleEl, {
        scale: 1,
        duration: EDIT_CFG.durBubblePop,
        ease: EDIT_CFG.easeBubble,
      }, 0.06 + EDIT_CFG.durCursorMove + 0.22)
      .call(() => {
        editBubbleEl.textContent = "";
      }, [], 0.06 + EDIT_CFG.durCursorMove + 0.28);

    /* Typewriter del mensaje — inicia 0.32s después de que aparece la burbuja */
    const tTwStart = 0.06 + EDIT_CFG.durCursorMove + 0.32;
    let tMensajeEnd = typewriterCallSequence(editTl, mensaje, tTwStart, (char) => {
      editBubbleEl.textContent += char;
    });

    /* Restaurar texto original letra a letra */
    const tRestoreStart = tMensajeEnd + 0.55;
    editTl.call(() => {
      elEditable.classList.remove("modificada");
      isProgrammaticEdit = true;
      elEditable.textContent = "";
    }, [], tRestoreStart);

    [...original].forEach((char, i) => {
      editTl.call(() => {
        elEditable.textContent += char;
      }, [], tRestoreStart + i * EDIT_CFG.charRestore);
    });

    const tRestoreEnd = tRestoreStart + original.length * EDIT_CFG.charRestore;
    const tBubbleOut = Math.max(tTwStart + EDIT_CFG.bubbleHold, tRestoreEnd + 0.4);

    editTl
      .to(editBubbleEl, {
        autoAlpha: 0,
        y: bubbleY - 12,
        duration: EDIT_CFG.durBubbleOut,
        ease: "power2.in",
      }, tBubbleOut)
      .to(editCursorEl, {
        autoAlpha: 0,
        duration: EDIT_CFG.durCursorOut,
      }, tBubbleOut + 0.06)
      .call(() => {
        isProgrammaticEdit = false;
      }, [], tBubbleOut + EDIT_CFG.durBubbleOut + 0.08);
  }

  /* ─────────────────────────────────────────
     FRASE EDITABLE — Eventos (3 palabras)
  ───────────────────────────────────────── */
  function iniciarEditable() {
    if (!elFrasesEditables.length) return;

    const limpiarTimer = (el) => {
      const timer = editTimeouts.get(el);
      if (timer) {
        clearTimeout(timer);
        editTimeouts.delete(el);
      }
    };

    const programarRespuesta = (el, delay) => {
      limpiarTimer(el);
      const timer = setTimeout(() => {
        const final = (el.textContent || "").trim();
        const original = (el.dataset.original || "").trim();
        if (!final) {
          isProgrammaticEdit = true;
          el.textContent = original;
          isProgrammaticEdit = false;
          el.classList.remove("modificada");
          return;
        }
        if (final !== original) {
          el.blur();
          activarRespuestaDaniel(el);
        }
      }, delay);
      editTimeouts.set(el, timer);
    };

    elFrasesEditables.forEach((el) => {
      const original = (el.dataset.original || el.textContent || "").trim();

      el.addEventListener("focus", () => {
        requestAnimationFrame(() => {
          seleccionarPalabra(el);
        });
      });

      el.addEventListener("input", () => {
        if (isProgrammaticEdit) return;
        const actual = (el.textContent || "").trim();
        el.classList.toggle("modificada", actual !== original && actual.length > 0);
        programarRespuesta(el, EDIT_CFG.debounceEscritura);
      });

      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          el.blur();
        }
      });

      el.addEventListener("blur", () => {
        if (isProgrammaticEdit) return;
        const final = (el.textContent || "").trim();
        if (!final) {
          isProgrammaticEdit = true;
          el.textContent = original;
          isProgrammaticEdit = false;
          el.classList.remove("modificada");
          return;
        }
        if (final !== original) {
          programarRespuesta(el, EDIT_CFG.debounceBlur);
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     DRAG COREOGRAFIADO — DANIEL
     IDLE → DRAGGING → RETURNING → MESSAGING → IDLE
  ───────────────────────────────────────── */
  function iniciarDrag() {
    if (!elNombreDaniel) return;

    const DRAG_CFG = {
      returnEase: "power2.inOut",
      returnDuration: 0.95,
      settleAfterDrop: 0.18,
      grabMoveDuration: 0.18,
      grabPause: 0.12,
      typewriterSpeedMs: 40,
      bubbleInDuration: 0.35,
      bubbleHold: 2.4,
      bubbleOutDuration: 0.25,
      bubbleText: "Interesante... pero dejemoslo como estaba.",
    };

    const STATES = {
      IDLE: 'IDLE',
      DRAGGING: 'DRAGGING',
      RETURNING: 'RETURNING',
      MESSAGING: 'MESSAGING',
    };

    let state = STATES.IDLE;
    let activePointerId = null;
    let startPointerX = 0;
    let startPointerY = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    let currentDx = 0;
    let currentDy = 0;
    let dragOriginPoint = { x: 0, y: 0 };
    let returnTl = null;
    let messageTl = null;
    let dropTl = null;
    let closeBubbleTimer = null;
    let typewriterTimer = null;

    const areaNombres = document.querySelector('.hero-nombres-area') || document.body;

    // Origen fijo de reposo: sin transform aplicada.
    // IMPORTANTE: no leer aquí gsap.getProperty porque durante la intro
    // el elemento arranca en y=50 y eso desplaza el "home" incorrectamente.
    const homeTransform = {
      x: 0,
      y: 0,
    };

    const lineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    lineSvg.classList.add('hero-drag-line-svg');
    lineSvg.setAttribute('width', '100%');
    lineSvg.setAttribute('height', '100%');
    lineSvg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    lineSvg.setAttribute('aria-hidden', 'true');

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add('hero-drag-line');
    lineSvg.appendChild(line);
    document.body.appendChild(lineSvg);

    const dragTip = document.createElement('div');
    dragTip.className = 'hero-drag-tooltip';
    dragTip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dragTip);

    const customCursor = document.createElement('div');
    customCursor.className = 'hero-drag-custom-cursor';
    customCursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(customCursor);

    const messageBubble = document.createElement('div');
    messageBubble.className = 'hero-drag-bubble';
    messageBubble.setAttribute('aria-live', 'polite');
    messageBubble.setAttribute('aria-atomic', 'true');
    document.body.appendChild(messageBubble);

    gsap.set([lineSvg, dragTip, customCursor, messageBubble], { autoAlpha: 0 });

    const getOriginPoint = () => {
      const rect = elNombreDaniel.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    const updateLine = (x2, y2) => {
      gsap.set(line, {
        attr: {
          x1: dragOriginPoint.x,
          y1: dragOriginPoint.y,
          x2,
          y2,
        },
      });
    };

    const updateTooltip = (clientX, clientY) => {
      const tipW = dragTip.offsetWidth || 140;
      const tipH = dragTip.offsetHeight || 30;
      const x = gsap.utils.clamp(8, window.innerWidth - tipW - 8, clientX + 14);
      const y = gsap.utils.clamp(8, window.innerHeight - tipH - 8, clientY - 26);
      dragTip.textContent = `dx: ${Math.round(currentDx)}, dy: ${Math.round(currentDy)}`;
      gsap.set(dragTip, {
        x,
        y,
      });
    };

    const clearTimers = () => {
      if (closeBubbleTimer) {
        clearTimeout(closeBubbleTimer);
        closeBubbleTimer = null;
      }
      if (typewriterTimer) {
        clearTimeout(typewriterTimer);
        typewriterTimer = null;
      }
    };

    const clearTimelines = () => {
      if (dropTl) {
        dropTl.kill();
        dropTl = null;
      }
      if (returnTl) {
        returnTl.kill();
        returnTl = null;
      }
      if (messageTl) {
        messageTl.kill();
        messageTl = null;
      }
      clearTimers();
    };

    const runTypewriter = (text, onDone) => {
      messageBubble.textContent = "";
      let i = 0;
      const tick = () => {
        if (i < text.length) {
          messageBubble.textContent += text[i];
          i += 1;
          typewriterTimer = setTimeout(tick, DRAG_CFG.typewriterSpeedMs);
          return;
        }
        typewriterTimer = null;
        onDone?.();
      };
      tick();
    };

    const showMessageBubble = () => {
      state = STATES.MESSAGING;

      // Garantía dura: antes de la burbuja, DANIEL ya debe estar en casa.
      gsap.set(elNombreDaniel, {
        x: homeTransform.x,
        y: homeTransform.y,
      });

      const p = getOriginPoint();
      const isMobile = window.innerWidth <= 1024;
      let bubbleX, bubbleY, bubbleTOrigin;
      if (isMobile) {
        bubbleX = 0; /* CSS: left:50% + translateX(-50%) centra la burbuja */
        bubbleY = window.innerHeight * 0.09;
        bubbleTOrigin = 'center bottom';
      } else {
        bubbleX = p.x + 24;
        bubbleY = p.y - 52;
        bubbleTOrigin = 'left bottom';
      }
      gsap.set(messageBubble, {
        x: bubbleX,
        y: bubbleY,
        transformOrigin: bubbleTOrigin,
        autoAlpha: 1,
      });

      messageTl = gsap.timeline({ defaults: { overwrite: 'auto' } });
      messageTl.fromTo(
        messageBubble,
        { scale: 0.8, autoAlpha: 0, y: bubbleY + 8 },
        {
          scale: 1,
          autoAlpha: 1,
          y: bubbleY,
          duration: DRAG_CFG.bubbleInDuration,
          ease: 'back.out(1.7)',
        },
      );

      runTypewriter(DRAG_CFG.bubbleText, () => {
        closeBubbleTimer = setTimeout(() => {
          closeBubbleTimer = null;
          gsap.to(messageBubble, {
            autoAlpha: 0,
            y: bubbleY - 8,
            duration: DRAG_CFG.bubbleOutDuration,
            ease: 'power2.in',
            onComplete: () => {
              gsap.set(customCursor, { autoAlpha: 0, scale: 0 });
              resetToIdle();
            },
          });
        }, DRAG_CFG.bubbleHold * 1000);
      });
    };

    const resetToIdle = () => {
      state = STATES.IDLE;
      activePointerId = null;
      areaNombres.classList.remove('is-drag-active');
      // Garantía dura: cerrar SIEMPRE en la posición original.
      gsap.set(elNombreDaniel, {
        x: homeTransform.x,
        y: homeTransform.y,
        scale: 1,
      });
      gsap.set([lineSvg, dragTip], { autoAlpha: 0 });
      gsap.set(customCursor, { autoAlpha: 0, scale: 1 });
      gsap.set(messageBubble, { autoAlpha: 0, scale: 1 });
      liberarCursorSiProcede();
      dragOriginPoint = getOriginPoint();
    };

    const onPointerMove = (ev) => {
      if (state !== STATES.DRAGGING) return;
      if (activePointerId != null && ev.pointerId != null && ev.pointerId !== activePointerId) return;

      const dx = ev.clientX - startPointerX;
      const dy = ev.clientY - startPointerY;

      const targetX = dragStartX + dx;
      const targetY = dragStartY + dy;
      currentDx = targetX - dragStartX;
      currentDy = targetY - dragStartY;

      gsap.set(elNombreDaniel, { x: targetX, y: targetY });
      updateLine(ev.clientX, ev.clientY);
      updateTooltip(ev.clientX, ev.clientY);
    };

    const onPointerUp = (ev) => {
      if (state !== STATES.DRAGGING) return;
      if (activePointerId != null && ev.pointerId != null && ev.pointerId !== activePointerId) return;
      state = STATES.RETURNING;
      document.body.classList.add('cursor-oculto');

      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);

      const releaseX = ev.clientX;
      const releaseY = ev.clientY;
      const releaseDx = releaseX - startPointerX;
      const releaseDy = releaseY - startPointerY;

      const droppedX = dragStartX + releaseDx;
      const droppedY = dragStartY + releaseDy;
      const homeRectPoint = {
        x: dragOriginPoint.x,
        y: dragOriginPoint.y,
      };

      // La palabra queda exactamente donde el usuario la soltó.
      gsap.set(elNombreDaniel, { x: droppedX, y: droppedY });
      const droppedPoint = getOriginPoint();

      areaNombres.classList.add('is-drag-active');

      // Se ocultan ayudas de drag, pero la palabra se queda donde fue soltada.
      gsap.to(dragTip, {
        autoAlpha: 0,
        duration: 0.14,
        ease: 'power1.out',
      });
      gsap.to(lineSvg, {
        autoAlpha: 0,
        duration: 0.18,
        ease: 'power1.out',
      });

      // El cursor asistente aparece DESPUÉS y "toma" la palabra en su nueva posición.
      dropTl = gsap.timeline({ defaults: { overwrite: 'auto' } });
      dropTl
        .set(customCursor, {
          x: releaseX,
          y: releaseY,
          autoAlpha: 0,
          scale: 0,
        }, 0)
        .to({}, { duration: DRAG_CFG.settleAfterDrop }, 0)
        .to(customCursor, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.12,
          ease: 'power2.out',
        }, '>')
        .to(customCursor, {
          x: droppedPoint.x,
          y: droppedPoint.y,
          duration: DRAG_CFG.grabMoveDuration,
          ease: 'power2.out',
        }, '>')
        .to(customCursor, {
          scale: 1.08,
          duration: DRAG_CFG.grabPause,
          ease: 'power1.out',
        }, '>')
        .to(customCursor, {
          scale: 1,
          duration: 0.08,
          ease: 'power1.inOut',
        }, '>')
        .call(() => {
          returnTl = gsap.timeline({
            defaults: { ease: 'power2.out', overwrite: 'auto' },
            onComplete: showMessageBubble,
          });

          returnTl
            .to(elNombreDaniel, {
              x: homeTransform.x,
              y: homeTransform.y,
              scale: 1,
              duration: DRAG_CFG.returnDuration,
              ease: DRAG_CFG.returnEase,
            }, 0)
            .to(customCursor, {
              x: homeRectPoint.x,
              y: homeRectPoint.y,
              duration: DRAG_CFG.returnDuration,
              ease: DRAG_CFG.returnEase,
            }, 0);
        }, [], '>');
    };

    const onPointerDown = (ev) => {
      if (state === STATES.DRAGGING) return;
      if (ev.button !== 0) return;

      // Interrupción explícita: si el usuario vuelve a arrastrar,
      // cancelamos retorno/mensaje y retomamos control inmediato.
      if (state === STATES.RETURNING || state === STATES.MESSAGING) {
        clearTimelines();
        resetToIdle();
      }

      clearTimelines();
      state = STATES.DRAGGING;
      activePointerId = ev.pointerId ?? 'mouse';

      const currentX = parseFloat(gsap.getProperty(elNombreDaniel, 'x')) || 0;
      const currentY = parseFloat(gsap.getProperty(elNombreDaniel, 'y')) || 0;
      dragOriginPoint = getOriginPoint();
      dragStartX = currentX;
      dragStartY = currentY;
      startPointerX = ev.clientX;
      startPointerY = ev.clientY;
      currentDx = 0;
      currentDy = 0;

      gsap.set(lineSvg, { autoAlpha: 1 });
      gsap.set(dragTip, { autoAlpha: 1 });
      gsap.to(elNombreDaniel, { scale: 1.04, duration: 0.16, ease: 'power2.out' });

      updateLine(ev.clientX, ev.clientY);
      updateTooltip(ev.clientX, ev.clientY);

      if (ev.pointerId != null && typeof elNombreDaniel.setPointerCapture === 'function') {
        try { elNombreDaniel.setPointerCapture(ev.pointerId); } catch (_) { /* noop */ }
      }
      document.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerup', onPointerUp, { passive: true });
      document.addEventListener('pointercancel', onPointerUp, { passive: true });
      document.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('mouseup', onMouseUp, { passive: true });
      document.addEventListener('touchmove', onTouchMove, { passive: true });
      document.addEventListener('touchend', onTouchEnd, { passive: true });
      document.addEventListener('touchcancel', onTouchEnd, { passive: true });
    };

    const onMouseMove = (ev) => onPointerMove({ clientX: ev.clientX, clientY: ev.clientY, pointerId: 'mouse' });
    const onMouseUp = (ev) => onPointerUp({ clientX: ev.clientX, clientY: ev.clientY, pointerId: 'mouse' });
    const onTouchMove = (ev) => {
      const t = ev.changedTouches && ev.changedTouches[0];
      if (!t) return;
      onPointerMove({ clientX: t.clientX, clientY: t.clientY, pointerId: 'touch' });
    };
    const onTouchEnd = (ev) => {
      const t = ev.changedTouches && ev.changedTouches[0];
      if (!t) return;
      onPointerUp({ clientX: t.clientX, clientY: t.clientY, pointerId: 'touch' });
    };

    const onResize = () => {
      lineSvg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
      if (state !== STATES.IDLE) {
        gsap.set(line, { attr: { x1: dragOriginPoint.x, y1: dragOriginPoint.y } });
      }
    };

    elNombreDaniel.addEventListener('pointerdown', onPointerDown);
    elNombreDaniel.addEventListener('mousedown', (ev) => {
      if (state === STATES.DRAGGING) return;
      onPointerDown({
        button: ev.button,
        clientX: ev.clientX,
        clientY: ev.clientY,
        pointerId: 'mouse',
      });
    });
    elNombreDaniel.addEventListener('touchstart', (ev) => {
      const t = ev.changedTouches && ev.changedTouches[0];
      if (!t) return;
      onPointerDown({
        button: 0,
        clientX: t.clientX,
        clientY: t.clientY,
        pointerId: 'touch',
      });
    }, { passive: true });
    window.addEventListener('resize', onResize);

    resetToIdle();
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
    iniciarReloj();
    animarEntrada();
    iniciarDrag();
    iniciarEditable();
  }

  return { init };
})();
