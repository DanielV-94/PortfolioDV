const ModoCreativo = (() => {

  function obtenerPool() {
    if (typeof ModoCaos !== 'undefined' && ModoCaos._obtenerPool) {
      return ModoCaos._obtenerPool();
    }
    const tema = document.documentElement.getAttribute('data-tema') ||
                 document.body.getAttribute('data-tema') || 'neutro';
    return [];
  }

  let activo       = false;
  let cursorEl     = null;
  let layer        = null;
  let pool         = [];
  let poolIdx      = 0;
  let btns         = [];
  let pegados      = [];

  const TAMANIOS = ['xl', 'grande', 'mediano', 'mediano', 'chico', 'chico'];

  function siguienteSticker() {
    if (!pool.length) return '';
    const src = pool[poolIdx % pool.length];
    poolIdx++;
    return src;
  }

  function crearCursor() {
    cursorEl = document.createElement('div');
    cursorEl.className = 'creativo-cursor';
    cursorEl.setAttribute('aria-hidden', 'true');

    const img = document.createElement('img');
    img.src = siguienteSticker();
    img.alt = '';
    img.draggable = false;
    cursorEl.appendChild(img);

    gsap.set(cursorEl, { autoAlpha: 0, scale: 0.8 });
    document.body.appendChild(cursorEl);

    gsap.to(cursorEl, {
      autoAlpha: 1, scale: 1,
      duration: 0.3, ease: 'back.out(1.7)',
    });
  }

  function onMouseMove(e) {
    if (!cursorEl) return;
    cursorEl.style.left = e.clientX + 'px';
    cursorEl.style.top  = e.clientY + 'px';
  }

  function disparar(e) {
    if (!activo || !cursorEl) return;

    const clickX = e.clientX;
    const clickY = e.clientY;
    const docY   = clickY + window.scrollY;

    const imgCursor = cursorEl.querySelector('img');
    const src = imgCursor ? imgCursor.src : '';

    const tamanio = TAMANIOS[Math.floor(Math.random() * TAMANIOS.length)];

    const el = document.createElement('div');
    el.className = `creativo-sticker-pegado creativo-sticker-pegado--${tamanio}`;
    el.setAttribute('aria-hidden', 'true');

    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.draggable = false;
    el.appendChild(img);

    const rotacion = (Math.random() - 0.5) * 30;

    gsap.set(el, {
      x: clickX - 30,
      y: docY - 30,
      scale: 0.2,
      rotation: rotacion,
      autoAlpha: 0,
    });

    layer.appendChild(el);

    gsap.to(el, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.15,
      ease: 'power4.out',
      onComplete: () => {
        gsap.to(el, {
          x: `+=${(Math.random() - 0.5) * 8}`,
          y: `+=${(Math.random() - 0.5) * 6}`,
          rotation: rotacion + (Math.random() - 0.5) * 10,
          duration: 0.12,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        });
      },
    });

    pegados.push(el);

    const elementoDebajo = document.elementFromPoint(clickX, clickY);
    const linkDebajo = elementoDebajo
      ? elementoDebajo.closest('a[href], button[data-nav-link], [data-nav-link]')
      : null;

    if (linkDebajo) {
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';

      setTimeout(() => {
        const href = linkDebajo.getAttribute('href');
        if (href && href !== '#') {
          gsap.to(el, {
            scale: 1.3,
            autoAlpha: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
              if (linkDebajo.tagName === 'A') {
                window.location.href = href;
              } else {
                linkDebajo.click();
              }
            },
          });
        }
      }, 400);
    }

    const nuevoSrc = siguienteSticker();
    if (imgCursor && nuevoSrc) {
      gsap.to(cursorEl, {
        scale: 0.5,
        duration: 0.1,
        ease: 'power2.in',
        onComplete: () => {
          imgCursor.src = nuevoSrc;
          gsap.to(cursorEl, {
            scale: 1,
            duration: 0.2,
            ease: 'back.out(2)',
          });
        },
      });
    }
  }

  function sincronizarBtns(estado) {
    btns.forEach(b => b && b.setAttribute('aria-pressed', estado ? 'true' : 'false'));
  }

  function activar() {
    if (activo) return;
    activo = true;
    sincronizarBtns(true);
    document.body.classList.add('modo-creativo-activo');

    if (typeof ModoCaos !== 'undefined') {
      const tema = document.documentElement.getAttribute('data-tema') ||
                   document.body.getAttribute('data-tema') || 'neutro';
      pool = _buildPool(tema);
    }
    pool = mezclar(pool);
    poolIdx = 0;

    layer = document.createElement('div');
    layer.className = 'modo-creativo-layer';
    layer.style.height = document.body.scrollHeight + 'px';
    document.body.appendChild(layer);

    crearCursor();

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', disparar);
  }

  function desactivar() {
    if (!activo) return;
    activo = false;
    sincronizarBtns(false);
    document.body.classList.remove('modo-creativo-activo');

    if (cursorEl) {
      gsap.to(cursorEl, {
        autoAlpha: 0, scale: 0.3,
        duration: 0.2,
        onComplete: () => { cursorEl.remove(); cursorEl = null; },
      });
    }

    gsap.to(pegados, {
      autoAlpha: 0, scale: 0.3, rotation: '+=20',
      duration: 0.3, ease: 'power2.in',
      stagger: { each: 0.02, from: 'random' },
      onComplete: () => {
        pegados.forEach(el => el.remove());
        pegados = [];
        if (layer) { layer.remove(); layer = null; }
      },
    });

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('click', disparar);
  }

  function toggle() {
    if (!activo) {
      if (typeof ModoCaos !== 'undefined' && ModoCaos.desactivar) {
        ModoCaos.desactivar();
      }
      activar();
    } else {
      desactivar();
    }
  }

  function mezclar(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function _buildPool(tema) {
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

    if (tema === 'neutro') return Object.values(CATALOGO).flat();
    return CATALOGO[tema] || Object.values(CATALOGO).flat();
  }

  function init() {
    if (typeof gsap === 'undefined') return;

    const btnBarra = document.getElementById('modoCreativoToggle');
    const btnNav   = document.getElementById('navModoCreativoToggle');
    btns = [btnBarra, btnNav].filter(Boolean);

    btns.forEach(b => {
      b.removeAttribute('disabled');
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle();
      });
    });

    window.addEventListener('resize', () => {
      if (activo && layer) {
        layer.style.height = document.body.scrollHeight + 'px';
      }
    });
  }

  return { init, activar, desactivar, toggle };
})();
