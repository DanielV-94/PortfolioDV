/* ═══════════════════════════════════════════════════════════════
   MODO CAOS — Stickers flotando por todo el documento
   Dos capas de profundidad:
   · Lejana: blur, no draggable, detrás del contenido
   · Cercana: nítida, draggable, encima del contenido
   Sin repulsión — el usuario mueve stickers manualmente (drag)
═══════════════════════════════════════════════════════════════ */

const ModoCaos = (() => {

  /* ── Catálogo de stickers por tema — nombres exactos ── */
  const CATALOGO = {
    acid: [
      'acid','acid1','acid2','acid3','acid4','acid5','acid6','acid7','acid8','acid9',
      'acid10','acid11','acid12','acid13','acid14','acid15','acid17','acid18','acid19',
      'acid20','acid21','acid22','acid23','acid24','acid25','acid26','acid27','acid28',
      'acid29','acid30','acid31','acid32','acid33','acid34','acid35','acid36','acid37',
      'acid38','acid39','acid40','acid41','acid42','acid43','acid44','acid45'
    ].map(n => `Rsc/Stickers/acid/${n}.svg`),

    synthwave: [
      'synth','synth1','synth2','synth3','synth4','synth5','synth7','synth8','synth9',
      'synth10','synth11','synth12','synth13','synth14','synth15','synth16','synth17',
      'synth18','synth19','synth20','synth21','synth22','synth24','synth25','synth26',
      'synth27','synth28','synth29','synth30','synth31','synth32','synth33','synth35',
      'synth36','synth37','synth38','synth39','synth40','synth41','synth42','synth43',
      'synth44','synth45','synth46','synth47','synth48','synth49'
    ].map(n => `Rsc/Stickers/synthwave/${n}.svg`),

    rave: [
      'rave','rave1','rave2','rave3','rave4','rave5','rave6','rave7','rave9',
      'rave10','rave11','rave12','rave13','rave14','rave15','rave16','rave17','rave18',
      'rave19','rave20','rave21','rave22','rave23','rave24','rave25','rave26','rave27',
      'rave28','rave29','rave30','rave31','rave32','rave33','rave34','rave35','rave36',
      'rave37','rave38','rave39','rave40','rave41','rave42','rave43','rave44','rave45','rave46'
    ].map(n => `Rsc/Stickers/rave/${n}.svg`),

    collage: [
      'collage','collage1','collage2','collage3','collage4','collage5','collage6',
      'collage7','collage8','collage9','collage10','collage11','collage12','collage13',
      'collage14','collage15','collage16','collage17','collage18','collage19','collage20',
      'collage21','collage22','collage23','collage24','collage25','collage26','collage27',
      'collage29','collage30','collage31','collage32','collage33','collage34','collage35',
      'collage36','collage37','collage38','collage39','collage40','collage41','collage42',
      'collage43','collage44','collage45','collage46','collage47','collage48'
    ].map(n => `Rsc/Stickers/collage/${n}.svg`),

    holographic: [
      'holo-1','holo-3','holo-4','holo-5','holo-9','holo-10','holo-11','holo-13',
      'holo-15','holo-17','holo-19','holo-20','holo-21','holo-23','holo-35','holo-36',
      'holo-37','holo-38','holo-39','holo-40','holo-41','holo-42','holo-43','holo-44',
      'holo-45','holo-46','holo-47','holo-48','holo-49','holo-50','holo-51','holo-52',
      'holo-53','holo-55','holo-56','holo-57','holo-58','holo-59','holo-61','holo-62',
      'holo-63','holo-64','holo-65'
    ].map(n => `Rsc/Stickers/holographic/${n}.svg`),
  };

  /* ── Dos capas de profundidad ── */
  const CAPAS = {
    lejana: {
      tamanios: ['chico', 'chico', 'mediano'],
      opacidad: [0.20, 0.40],
      blur: [2.5, 5],
      velocidad: 0.35,
      amplitud: 14,
      rotMax: 6,
      draggable: false,
      proporcion: 0.45,
    },
    cercana: {
      tamanios: ['xl', 'grande', 'grande', 'mediano', 'mediano', 'chico'],
      opacidad: [1.0, 1.0],
      blur: [0, 0],
      velocidad: 0.75,
      amplitud: 32,
      rotMax: 22,
      draggable: true,
      proporcion: 0.55,
    },
  };

  /* ── Estado ── */
  let activo       = false;
  let layerLejana  = null;
  let layerCercana = null;
  let stickers     = [];
  let draggables   = [];
  let tweensFlot   = [];
  let btns         = [];

  /* ── Pool de stickers según tema activo ── */
  function obtenerPool() {
    const tema = document.documentElement.getAttribute('data-tema') ||
                 document.body.getAttribute('data-tema') || 'neutro';
    if (tema === 'neutro') return Object.values(CATALOGO).flat();
    return CATALOGO[tema] || Object.values(CATALOGO).flat();
  }

  /* ── Fisher-Yates shuffle ── */
  function mezclar(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ── Cantidad dinámica — caos visual real ── */
  function calcularCantidad(pool, alturaDoc) {
    const area = window.innerWidth * alturaDoc;
    const base = Math.floor(area / 1500);
    return Math.min(pool.length * 20, Math.max(800, base));
  }

  /* ── Crear un sticker DOM ── */
  function crearSticker(src, tamanio, x, y, rot, capa) {
    const el = document.createElement('div');
    el.className = `caos-sticker caos-sticker--${tamanio}`;
    el.setAttribute('aria-hidden', 'true');
    el.dataset.capa = capa;

    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.draggable = false;
    el.appendChild(img);

    const cfg  = CAPAS[capa];
    const blur = cfg.blur[0] + Math.random() * (cfg.blur[1] - cfg.blur[0]);
    const filterVal = blur > 0
      ? `drop-shadow(0 4px 12px rgba(0,0,0,0.18)) blur(${blur.toFixed(1)}px)`
      : 'drop-shadow(0 4px 12px rgba(0,0,0,0.18))';

    gsap.set(el, {
      x, y,
      rotation: rot,
      autoAlpha: 0,
      filter: filterVal,
      pointerEvents: cfg.draggable ? 'auto' : 'none',
    });

    const layer = capa === 'lejana' ? layerLejana : layerCercana;
    layer.appendChild(el);
    return el;
  }

  /* ── Flotación continua ── */
  function iniciarFlotacion(el, capa) {
    const cfg  = CAPAS[capa];
    const dur  = (3 + Math.random() * 4) / cfg.velocidad;
    const dx   = (Math.random() - 0.5) * cfg.amplitud * 2;
    const dy   = (Math.random() - 0.5) * cfg.amplitud * 2;
    const drot = (Math.random() - 0.5) * cfg.rotMax * 2;

    const t = gsap.to(el, {
      x: `+=${dx}`, y: `+=${dy}`, rotation: `+=${drot}`,
      duration: dur,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    tweensFlot.push(t);
    return t;
  }

  /* ── Sincronizar botones ── */
  function sincronizarBtns(estado) {
    btns.forEach(b => b && b.setAttribute('aria-pressed', estado ? 'true' : 'false'));
  }

  /* ── Activar ── */
  function activar() {
    if (activo) return;
    activo = true;
    sincronizarBtns(true);

    /* Ocultar cursor personalizado y mostrar cursor nativo */
    document.body.classList.add('modo-caos-activo');
    document.body.classList.remove('usa-cursor-custom');
    document.body.classList.remove('cursor-oculto');

    const alturaDoc = document.body.scrollHeight;
    const vw        = window.innerWidth;
    const margen    = 60;

    /* Crear los dos layers */
    function mkLayer(cls) {
      const l = document.createElement('div');
      l.className = `modo-caos-layer ${cls}`;
      l.style.height = alturaDoc + 'px';
      document.body.appendChild(l);
      return l;
    }
    layerLejana  = mkLayer('modo-caos-layer--lejana');
    layerCercana = mkLayer('modo-caos-layer--cercana');

    const pool     = obtenerPool();
    const cantidad = calcularCantidad(pool, alturaDoc);
    const mezclado = mezclar(pool);
    let idx = 0;

    const cantLejana  = Math.round(cantidad * CAPAS.lejana.proporcion);
    const cantCercana = cantidad - cantLejana;

    const generar = (cant, capa) => {
      const cfg = CAPAS[capa];
      for (let i = 0; i < cant; i++) {
        const src     = mezclado[idx % mezclado.length];
        const tamanio = cfg.tamanios[i % cfg.tamanios.length];
        const x       = margen + Math.random() * (vw - margen * 2);
        const y       = Math.random() * alturaDoc;
        const rot     = (Math.random() - 0.5) * 40;
        const delay   = Math.random() * 1.8;
        const op      = cfg.opacidad[0] + Math.random() * (cfg.opacidad[1] - cfg.opacidad[0]);
        const el      = crearSticker(src, tamanio, x, y, rot, capa);

        gsap.to(el, {
          autoAlpha: op,
          scale: 0.85 + Math.random() * 0.3,
          duration: 0.5 + Math.random() * 0.4,
          ease: 'back.out(1.4)',
          delay,
          onComplete: () => iniciarFlotacion(el, capa),
        });

        stickers.push({ el, tamanio, src, capa });
        idx++;
      }
    };

    generar(cantLejana,  'lejana');
    generar(cantCercana, 'cercana');

    /* Draggable solo en capa cercana — el usuario mueve stickers manualmente */
    setTimeout(() => {
      if (!activo) return;
      const elsCercana = stickers.filter(s => s.capa === 'cercana').map(s => s.el);
      if (!elsCercana.length) return;

      const d = Draggable.create(elsCercana, {
        type: 'x,y',
        inertia: true,
        cursor: 'grab',
        activeCursor: 'grabbing',
        onDragStart() {
          /* Efecto de "agarrar" — escala + sombra + z-index al frente */
          gsap.killTweensOf(this.target, 'x,y,rotation');
          gsap.to(this.target, {
            scale: 1.15,
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))',
            duration: 0.2,
            ease: 'power2.out',
          });
          this.target.style.zIndex = '200';
        },
        onDragEnd() {
          /* Efecto de "soltar" — vuelve a escala normal */
          gsap.to(this.target, {
            scale: 1,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.18))',
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
              this.target.style.zIndex = '';
            },
          });
          /* Reanudar flotación después de la inercia */
          const info = stickers.find(s => s.el === this.target);
          const target = this.target;
          setTimeout(() => {
            if (info && activo) iniciarFlotacion(target, info.capa);
          }, 800);
        },
      });
      draggables.push(...d);
    }, 600);
  }

  /* ── Desactivar ── */
  function desactivar() {
    if (!activo) return;
    activo = false;
    sincronizarBtns(false);

    /* Restaurar cursor personalizado */
    document.body.classList.remove('modo-caos-activo');
    document.body.classList.add('usa-cursor-custom');

    tweensFlot.forEach(t => t.kill());
    tweensFlot = [];

    draggables.forEach(d => d.kill());
    draggables = [];

    const els = stickers.map(s => s.el);
    gsap.to(els, {
      autoAlpha: 0,
      scale: 0.3,
      rotation: '+=30',
      duration: 0.4,
      ease: 'power2.in',
      stagger: { each: 0.005, from: 'random' },
      onComplete: () => {
        els.forEach(el => el.remove());
        stickers = [];
        [layerLejana, layerCercana].forEach(l => { if (l) l.remove(); });
        layerLejana = layerCercana = null;
      },
    });
  }

  /* ── Toggle ── */
  function toggle() {
    activo ? desactivar() : activar();
  }

  /* ── Init ── */
  function init() {
    if (typeof gsap === 'undefined' || typeof Draggable === 'undefined') return;

    if (typeof InertiaPlugin !== 'undefined') {
      gsap.registerPlugin(Draggable, InertiaPlugin);
    } else {
      gsap.registerPlugin(Draggable);
    }

    const btnBarra = document.getElementById('modoCaosToggle');
    const btnNav   = document.getElementById('navModoCaosToggle');
    btns = [btnBarra, btnNav].filter(Boolean);

    btns.forEach(b => b.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    }));

    /* Entrada animada de la barra de modos */
    const barra = document.querySelector('.modos-barra');
    if (barra) {
      gsap.to(barra, { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 2.8 });
    }

    /* Actualizar altura de layers al redimensionar */
    window.addEventListener('resize', () => {
      if (!activo) return;
      const h = document.body.scrollHeight + 'px';
      if (layerLejana)  layerLejana.style.height  = h;
      if (layerCercana) layerCercana.style.height = h;
    });
  }

  return { init, activar, desactivar, toggle };
})();
