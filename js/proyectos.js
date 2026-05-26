/* ═══════════════════════════════════════════════════════════════
   PROYECTOS — Hover revela imagen (desktop), tap revela fondo (mobile)
   Doble-tap navega en mobile, click normal navega en desktop
═══════════════════════════════════════════════════════════════ */

const Proyectos = (() => {
  const esMobile = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const section  = document.querySelector('.proyectos');
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

    if (esMobile) {
      /* ══ MOBILE: tap muestra imagen como fondo, doble-tap navega ══ */
      _initMobileInteraction(items, section, mostrarPreview);
    } else {
      /* ══ DESKTOP: hover muestra preview ══ */
      items.forEach(item => {
        const proyecto = item.dataset.proyecto;
        item.addEventListener('mouseenter', () => mostrarPreview(proyecto));
        item.addEventListener('focus', () => mostrarPreview(proyecto));
      });

      const lista = section.querySelector('.proyectos-lista');
      if (lista) lista.addEventListener('mouseleave', ocultarPreviews);
    }

    /* ── Animación de entrada con ScrollTrigger ── */
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(items, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          once: true,
        },
      });

      return () => { gsap.set(items, { clearProps: 'all' }); };
    });

    /* Mostrar primer proyecto por defecto (solo desktop) */
    if (!esMobile) {
      setTimeout(() => {
        if (!activoActual && previews.length) {
          mostrarPreview(items[0].dataset.proyecto);
        }
      }, 1500);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     MOBILE — Tap muestra imagen como fondo, doble-tap navega
  ═══════════════════════════════════════════════════════════════ */

  function _initMobileInteraction(items, section, mostrarPreview) {
    let lastTapItem = null;
    let lastTapTime = 0;
    const DOUBLE_TAP_THRESHOLD = 400; /* ms */

    items.forEach(item => {
      /* Prevenir navegación por defecto en mobile */
      item.addEventListener('click', (e) => {
        const now = Date.now();
        const proyecto = item.dataset.proyecto;

        if (lastTapItem === item && (now - lastTapTime) < DOUBLE_TAP_THRESHOLD) {
          /* ── Doble-tap: navegar ── */
          /* Dejar que el link funcione normalmente */
          lastTapItem = null;
          lastTapTime = 0;
          return; /* No prevenir — deja navegar */
        }

        /* ── Primer tap: mostrar imagen como fondo ── */
        e.preventDefault();
        lastTapItem = item;
        lastTapTime = now;

        /* Mostrar preview */
        mostrarPreview(proyecto);

        /* Activar estado visual en el item */
        items.forEach(i => i.classList.remove('proyecto-activo-mobile'));
        item.classList.add('proyecto-activo-mobile');

        /* Animar la imagen como fondo */
        _mostrarFondoMobile(section, proyecto);
      });
    });

    /* Cerrar al tocar fuera de la lista */
    document.addEventListener('touchstart', (e) => {
      if (!section.contains(e.target)) {
        items.forEach(i => i.classList.remove('proyecto-activo-mobile'));
        _ocultarFondoMobile(section);
        lastTapItem = null;
      }
    });
  }

  function _mostrarFondoMobile(section, proyecto) {
    const previews = section.querySelectorAll('.proyectos-preview-img');

    previews.forEach(prev => {
      const img = prev.querySelector('img');
      if (!img) return;

      if (prev.dataset.proyecto === proyecto) {
        prev.classList.add('activo', 'fondo-mobile');
      } else {
        prev.classList.remove('activo', 'fondo-mobile');
      }
    });
  }

  function _ocultarFondoMobile(section) {
    const previews = section.querySelectorAll('.proyectos-preview-img');
    previews.forEach(prev => prev.classList.remove('activo', 'fondo-mobile'));
  }

  return { init };
})();
