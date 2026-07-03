const Preguntas = (() => {
  let itemActivo = null; // referencia al .preguntas-item abierto actualmente

  function init() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    const seccion = document.querySelector('.preguntas');
    if (!seccion) return;

    const items = gsap.utils.toArray('.preguntas-item');
    if (!items.length) return;

    gsap.registerPlugin(ScrollTrigger);

    items.forEach(item => {
      const panel = item.querySelector('.preguntas-panel');
      const contenido = item.querySelector('.preguntas-panel-contenido');
      gsap.set(panel, { height: 0 });
      gsap.set(contenido, { opacity: 0 });
      item.querySelector('.preguntas-trigger').setAttribute('aria-expanded', 'false');
      panel.setAttribute('hidden', '');
    });

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

    iniciarReveal(seccion, items);
  }

  function toggleItem(item) {
    const estaAbierto = item === itemActivo;

    if (estaAbierto) {
      cerrarItem(item);
      itemActivo = null;
    } else {
      if (itemActivo) {
        cerrarItem(itemActivo);
      }
      abrirItem(item);
      itemActivo = item;
    }
  }

  function abrirItem(item) {
    const panel = item.querySelector('.preguntas-panel');
    const contenido = item.querySelector('.preguntas-panel-contenido');
    const trigger = item.querySelector('.preguntas-trigger');

    panel.removeAttribute('hidden');
    trigger.setAttribute('aria-expanded', 'true');
    item.classList.add('preguntas-item--activo');

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

  function cerrarItem(item) {
    const panel = item.querySelector('.preguntas-panel');
    const contenido = item.querySelector('.preguntas-panel-contenido');
    const trigger = item.querySelector('.preguntas-trigger');

    trigger.setAttribute('aria-expanded', 'false');
    item.classList.remove('preguntas-item--activo');

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

  function iniciarReveal(seccion, items) {
    const titulo = seccion.querySelector('.preguntas-titulo');

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReduced) {
      gsap.set(titulo, { opacity: 1, y: 0 });
      items.forEach(item => gsap.set(item, { opacity: 1, y: 0 }));
      return;
    }

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(titulo, { opacity: 0, y: 40 });
      items.forEach(item => gsap.set(item, { opacity: 0, y: 30 }));

      const tlReveal = gsap.timeline({
        scrollTrigger: {
          trigger: seccion,
          start: 'top 80%',
          once: true
        }
      });

      tlReveal.to(titulo, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out'
      })
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
