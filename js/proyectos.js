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

    mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
      items.forEach(item => {
        const proyecto = item.dataset.proyecto;
        item.addEventListener('mouseenter', () => mostrarPreview(proyecto));
        item.addEventListener('focus', () => mostrarPreview(proyecto));
      });

      const lista = section.querySelector('.proyectos-lista');
      if (lista) lista.addEventListener('mouseleave', ocultarPreviews);

      gsap.from(items, {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      });

      setTimeout(() => {
        if (!activoActual && previews.length) {
          mostrarPreview(items[0].dataset.proyecto);
        }
      }, 1500);

      return () => { gsap.set(items, { clearProps: 'all' }); };
    });

    mm.add('(max-width: 1024px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)', () => {
      _initTapInteraction(items, section, previews, mostrarPreview);

      gsap.from(items, {
        opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      });

      return () => { gsap.set(items, { clearProps: 'all' }); };
    });

    mm.add('(max-width: 1024px) and (orientation: portrait) and (min-width: 600px) and (prefers-reduced-motion: no-preference)', () => {
      _initTapInteraction(items, section, previews, mostrarPreview);

      gsap.from(items, {
        opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      });

      return () => { gsap.set(items, { clearProps: 'all' }); };
    });

    mm.add('(max-width: 599px) and (prefers-reduced-motion: no-preference)', () => {
      _initMobileCards(items, section, previews);

      gsap.from(items, {
        opacity: 0, y: 20, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      });

      return () => { gsap.set(items, { clearProps: 'all' }); };
    });

    mm.add('(max-width: 768px) and (orientation: landscape) and (prefers-reduced-motion: no-preference)', () => {
      _initMobileCards(items, section, previews);

      gsap.from(items, {
        opacity: 0, y: 20, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      });

      return () => { gsap.set(items, { clearProps: 'all' }); };
    });
  }

  function _initTapInteraction(items, section, previews, mostrarPreview) {
    let lastTapItem = null;
    let lastTapTime = 0;
    const DOUBLE_TAP_THRESHOLD = 400;

    items.forEach(item => {
      item.addEventListener('click', (e) => {
        const now = Date.now();
        const proyecto = item.dataset.proyecto;

        if (lastTapItem === item && (now - lastTapTime) < DOUBLE_TAP_THRESHOLD) {
          lastTapItem = null;
          lastTapTime = 0;
          return;
        }

        e.preventDefault();
        lastTapItem = item;
        lastTapTime = now;

        mostrarPreview(proyecto);
        items.forEach(i => i.classList.remove('proyecto-activo-mobile'));
        item.classList.add('proyecto-activo-mobile');

        previews.forEach(prev => {
          if (prev.dataset.proyecto === proyecto) {
            prev.classList.add('activo', 'fondo-mobile');
          } else {
            prev.classList.remove('activo', 'fondo-mobile');
          }
        });
      });
    });

    document.addEventListener('touchstart', (e) => {
      if (!section.contains(e.target)) {
        items.forEach(i => i.classList.remove('proyecto-activo-mobile'));
        previews.forEach(prev => prev.classList.remove('activo', 'fondo-mobile'));
        lastTapItem = null;
      }
    });
  }

  function _initMobileCards(items, section, previews) {
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
