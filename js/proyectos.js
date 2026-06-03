/* ═══════════════════════════════════════════════════════════════
   PROYECTOS — Desktop: hover revela imagen | Tablet: tap/doble-tap
   Mobile: imagen siempre visible de fondo + nombre encima, vertical
═══════════════════════════════════════════════════════════════ */

const Proyectos = (() => {

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const section = document.querySelector('.proyectos');
    if (!section) return;

    const items    = section.querySelectorAll('.proyectos-item');
    const previews = section.querySelectorAll('.proyectos-preview-img');
    if (!items.length) return;

    let activoActual = null;

    function mostrarPreview(proyecto) {
      if (activoActual === proyecto) return;
      activoActual = proyecto;
      previews.forEach(prev => {
        if (prev.dataset.proyecto === proyecto) {
          prev.classList.add('activo');
        } else {
          prev.classList.remove('activo');
        }
      });
    }

    function ocultarPreviews() {
      activoActual = null;
      previews.forEach(prev => prev.classList.remove('activo'));
    }

    const mm = gsap.matchMedia();

    /* ══ DESKTOP (≥1025px) — Hover muestra preview ══ */
    mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
      items.forEach(item => {
        const proyecto = item.dataset.proyecto;
        item.addEventListener('mouseenter', () => mostrarPreview(proyecto));
        item.addEventListener('focus', () => mostrarPreview(proyecto));
      });

      const lista = section.querySelector('.proyectos-lista');
      if (lista) lista.addEventListener('mouseleave', ocultarPreviews);

      /* Animación de entrada */
      gsap.from(items, {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      });

      /* Mostrar primer proyecto por defecto */
      setTimeout(() => {
        if (!activoActual && previews.length) {
          mostrarPreview(items[0].dataset.proyecto);
        }
      }, 1500);

      return () => { gsap.set(items, { clearProps: 'all' }); };
    });

    /* ══ TABLET LANDSCAPE — Tap/doble-tap (como mobile original) ══ */
    mm.add('(max-width: 1024px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)', () => {
      _initTapInteraction(items, section, previews, mostrarPreview);

      gsap.from(items, {
        opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      });

      return () => { gsap.set(items, { clearProps: 'all' }); };
    });

    /* ══ TABLET PORTRAIT — Tap/doble-tap ══ */
    mm.add('(max-width: 1024px) and (orientation: portrait) and (min-width: 600px) and (prefers-reduced-motion: no-preference)', () => {
      _initTapInteraction(items, section, previews, mostrarPreview);

      gsap.from(items, {
        opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      });

      return () => { gsap.set(items, { clearProps: 'all' }); };
    });

    /* ══ MOBILE PORTRAIT — Imagen siempre visible, vertical ══ */
    mm.add('(max-width: 599px) and (prefers-reduced-motion: no-preference)', () => {
      _initMobileCards(items, section, previews);

      gsap.from(items, {
        opacity: 0, y: 20, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      });

      return () => { gsap.set(items, { clearProps: 'all' }); };
    });

    /* ══ MOBILE LANDSCAPE — Imagen siempre visible, vertical ══ */
    mm.add('(max-width: 768px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)', () => {
      _initMobileCards(items, section, previews);

      gsap.from(items, {
        opacity: 0, y: 20, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      });

      return () => { gsap.set(items, { clearProps: 'all' }); };
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     TABLET — Tap muestra imagen, doble-tap navega
  ═══════════════════════════════════════════════════════════════ */

  function _initTapInteraction(items, section, previews, mostrarPreview) {
    let lastTapItem = null;
    let lastTapTime = 0;
    const DOUBLE_TAP_THRESHOLD = 400;

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        const now = Date.now();
        const proyecto = item.dataset.proyecto;

        if (lastTapItem === item && (now - lastTapTime) < DOUBLE_TAP_THRESHOLD) {
          /* Doble-tap: navegar */
          lastTapItem = null;
          lastTapTime = 0;
          return;
        }

        /* Primer tap: mostrar imagen como fondo */
        e.preventDefault();
        lastTapItem = item;
        lastTapTime = now;

        mostrarPreview(proyecto);
        items.forEach(i => i.classList.remove('proyecto-activo-mobile'));
        item.classList.add('proyecto-activo-mobile');

        /* Mostrar como fondo */
        previews.forEach(prev => {
          if (prev.dataset.proyecto === proyecto) {
            prev.classList.add('activo', 'fondo-mobile');
          } else {
            prev.classList.remove('activo', 'fondo-mobile');
          }
        });
      });
    });

    /* Cerrar al tocar fuera */
    document.addEventListener('touchstart', (e) => {
      if (!section.contains(e.target)) {
        items.forEach(i => i.classList.remove('proyecto-activo-mobile'));
        previews.forEach(prev => prev.classList.remove('activo', 'fondo-mobile'));
        lastTapItem = null;
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     MOBILE — Imagen siempre visible de fondo por proyecto, vertical
  ═══════════════════════════════════════════════════════════════ */

  function _initMobileCards(items, section, previews) {
    /* En mobile cada proyecto muestra su imagen siempre visible como fondo
       Los items se muestran uno tras otro verticalmente
       Al hacer scroll, cada item revela su imagen correspondiente */

    let observerKills = [];

    items.forEach(item => {
      const proyecto = item.dataset.proyecto;

      const obs = ScrollTrigger.create({
        trigger: item,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => {
          previews.forEach(prev => {
            if (prev.dataset.proyecto === proyecto) {
              prev.classList.add('activo', 'fondo-mobile');
            } else {
              prev.classList.remove('activo', 'fondo-mobile');
            }
          });
          items.forEach(i => i.classList.remove('proyecto-activo-mobile'));
          item.classList.add('proyecto-activo-mobile');
        },
        onEnterBack: () => {
          previews.forEach(prev => {
            if (prev.dataset.proyecto === proyecto) {
              prev.classList.add('activo', 'fondo-mobile');
            } else {
              prev.classList.remove('activo', 'fondo-mobile');
            }
          });
          items.forEach(i => i.classList.remove('proyecto-activo-mobile'));
          item.classList.add('proyecto-activo-mobile');
        },
      });

      observerKills.push(() => obs.kill());
    });

    /* Mostrar el primero por defecto */
    if (items.length && previews.length) {
      const primerProyecto = items[0].dataset.proyecto;
      previews.forEach(prev => {
        if (prev.dataset.proyecto === primerProyecto) {
          prev.classList.add('activo', 'fondo-mobile');
        }
      });
      items[0].classList.add('proyecto-activo-mobile');
    }
  }

  return { init };
})();
