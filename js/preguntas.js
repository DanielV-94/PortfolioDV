/* ═══════════════════════════════════════════════════════════════
   PREGUNTAS — Acordeón FAQ con GSAP
   Comportamiento exclusivo, animaciones slide + fade, accesibilidad
═══════════════════════════════════════════════════════════════ */

const Preguntas = (() => {
  /* ── Estado interno ── */
  let itemActivo = null; // referencia al .preguntas-item abierto actualmente

  /* ── Inicialización ── */
  function init() {
    /* Guard clauses */
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    const seccion = document.querySelector('.preguntas');
    if (!seccion) return;

    const items = gsap.utils.toArray('.preguntas-item');
    if (!items.length) return;

    /* Registrar plugin */
    gsap.registerPlugin(ScrollTrigger);

    /* ── Estado inicial: todos cerrados ── */
    items.forEach(item => {
      const panel = item.querySelector('.preguntas-panel');
      const contenido = item.querySelector('.preguntas-panel-contenido');
      gsap.set(panel, { height: 0 });
      gsap.set(contenido, { opacity: 0 });
      item.querySelector('.preguntas-trigger').setAttribute('aria-expanded', 'false');
      panel.setAttribute('hidden', '');
    });

    /* ── Bind de eventos ── */
    items.forEach(item => {
      const trigger = item.querySelector('.preguntas-trigger');

      trigger.addEventListener('click', () => toggleItem(item));

      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleItem(item);
        }
      });
    });

    /* ── ScrollTrigger Reveal ── */
    iniciarReveal(seccion, items);
  }

  /* ═══════════════════════════════════════════════════════════════
     TOGGLE — Abrir/cerrar con comportamiento exclusivo
  ═══════════════════════════════════════════════════════════════ */

  function toggleItem(item) {
    const estaAbierto = item === itemActivo;

    if (estaAbierto) {
      /* Cerrar el item activo */
      cerrarItem(item);
      itemActivo = null;
    } else {
      /* Comportamiento exclusivo: cerrar activo antes de abrir nuevo */
      if (itemActivo) {
        cerrarItem(itemActivo);
      }
      abrirItem(item);
      itemActivo = item;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     ABRIR — Timeline GSAP: height auto + opacity stagger
  ═══════════════════════════════════════════════════════════════ */

  function abrirItem(item) {
    const panel = item.querySelector('.preguntas-panel');
    const contenido = item.querySelector('.preguntas-panel-contenido');
    const trigger = item.querySelector('.preguntas-trigger');

    /* Sincronizar ARIA y clase */
    panel.removeAttribute('hidden');
    trigger.setAttribute('aria-expanded', 'true');
    item.classList.add('preguntas-item--activo');

    /* Animación: altura desde 0 a auto, luego opacidad con solapamiento */
    const tl = gsap.timeline();
    tl.to(panel, {
      height: 'auto',
      duration: 0.5,
      ease: 'power2.out'
    })
    .to(contenido, {
      opacity: 1,
      duration: 0.3,
      ease: 'power1.out'
    }, '-=0.2');
  }

  /* ═══════════════════════════════════════════════════════════════
     CERRAR — Timeline GSAP: opacity primero, luego height a 0
  ═══════════════════════════════════════════════════════════════ */

  function cerrarItem(item) {
    const panel = item.querySelector('.preguntas-panel');
    const contenido = item.querySelector('.preguntas-panel-contenido');
    const trigger = item.querySelector('.preguntas-trigger');

    /* Sincronizar ARIA y clase */
    trigger.setAttribute('aria-expanded', 'false');
    item.classList.remove('preguntas-item--activo');

    /* Animación inversa: opacidad a 0, luego altura a 0, hidden onComplete */
    const tl = gsap.timeline({
      onComplete: () => {
        panel.setAttribute('hidden', '');
      }
    });
    tl.to(contenido, {
      opacity: 0,
      duration: 0.2,
      ease: 'power1.in'
    })
    .to(panel, {
      height: 0,
      duration: 0.4,
      ease: 'power2.in'
    }, '-=0.1');
  }

  /* ═══════════════════════════════════════════════════════════════
     REVEAL — Revelado escalonado con ScrollTrigger y matchMedia
  ═══════════════════════════════════════════════════════════════ */

  function iniciarReveal(seccion, items) {
    const titulo = seccion.querySelector('.preguntas-titulo');

    /* ── Detección de prefers-reduced-motion ── */
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReduced) {
      /* Sin animación: mostrar todo directamente */
      gsap.set(titulo, { opacity: 1, y: 0 });
      items.forEach(item => gsap.set(item, { opacity: 1, y: 0 }));
      return;
    }

    /* ── matchMedia para envolver lógica de reveal ── */
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      /* Estado inicial para reveal */
      gsap.set(titulo, { opacity: 0, y: 40 });
      items.forEach(item => gsap.set(item, { opacity: 0, y: 30 }));

      /* Timeline de revelado con ScrollTrigger */
      const tlReveal = gsap.timeline({
        scrollTrigger: {
          trigger: seccion,
          start: 'top 80%',
          once: true
        }
      });

      /* Título: fade + translateY (0.7s, power2.out) */
      tlReveal.to(titulo, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out'
      })
      /* Items: stagger secuencial (0.5s cada uno, 0.1 stagger, solapamiento -0.3) */
      .to(items, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.1
      }, '-=0.3');
    });
  }

  return { init };
})();
