/* ═══════════════════════════════════════════════════════════════
   PROYECTOS — Hover revela imagen, entrada con ScrollTrigger
═══════════════════════════════════════════════════════════════ */

const Proyectos = (() => {
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const section  = document.querySelector('.proyectos');
    if (!section) return;

    const items    = section.querySelectorAll('.proyectos-item');
    const previews = section.querySelectorAll('.proyectos-preview-img');

    if (!items.length) return;

    /* ── Hover: mostrar/ocultar preview ── */
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

    items.forEach(item => {
      const proyecto = item.dataset.proyecto;

      item.addEventListener('mouseenter', () => mostrarPreview(proyecto));
      item.addEventListener('focus', () => mostrarPreview(proyecto));
    });

    /* Ocultar al salir de la lista completa */
    const lista = section.querySelector('.proyectos-lista');
    if (lista) {
      lista.addEventListener('mouseleave', ocultarPreviews);
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

      return () => {
        gsap.set(items, { clearProps: 'all' });
      };
    });

    /* Mostrar el primer proyecto por defecto después de la animación */
    setTimeout(() => {
      if (!activoActual && previews.length) {
        mostrarPreview(items[0].dataset.proyecto);
      }
    }, 1500);
  }

  return { init };
})();
