/* ═══════════════════════════════════════════════════════════════
   MI TRABAJO — Scroll horizontal pinneado por proyecto
   Cada proyecto se pinnea y la galería se desplaza horizontalmente.
   En mobile (≤599px): marquee infinito + tap para expandir imagen.
   Usa gsap.matchMedia() para adaptar comportamiento por breakpoint.
═══════════════════════════════════════════════════════════════ */

const MiTrabajo = (() => {
  function init() {
    /* ── Guard clauses ── */
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    /* ── Detección de reduced-motion ── */
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    /* ── Proyectos disponibles ── */
    const proyectos = document.querySelectorAll('.proyecto');
    if (!proyectos.length) return;

    /* ══════════════════════════════════════════════════════════
       Función reutilizable — Scroll horizontal con pin (desktop/tablet)
    ══════════════════════════════════════════════════════════ */
    function crearScrollHorizontal(proyecto, offsetInicial) {
      const galeriaScroll = proyecto.querySelector('.proyecto-galeria-scroll');
      if (!galeriaScroll) return;

      const getScrollAmount = () => {
        return -(galeriaScroll.scrollWidth - window.innerWidth);
      };

      gsap.set(galeriaScroll, { x: window.innerWidth * offsetInicial });

      gsap.to(galeriaScroll, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: proyecto,
          start: 'top top',
          end: () => `+=${galeriaScroll.scrollWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });
    }

    /* ══════════════════════════════════════════════════════════
       Función — Marquee infinito para mobile
       Duplica las imágenes para crear loop seamless.
    ══════════════════════════════════════════════════════════ */
    function crearMarqueeMobile(proyecto) {
      const galeriaScroll = proyecto.querySelector('.proyecto-galeria-scroll');
      if (!galeriaScroll) return;

      /* Duplicar contenido para crear loop infinito */
      const items = galeriaScroll.innerHTML;
      galeriaScroll.innerHTML = items + items;

      /* Calcular ancho de un set completo */
      const totalItems = galeriaScroll.children.length;
      const halfItems = totalItems / 2;
      let anchoSet = 0;
      for (let i = 0; i < halfItems; i++) {
        anchoSet += galeriaScroll.children[i].offsetWidth + 16; /* 16px = 1rem gap */
      }

      /* Posicionar al inicio */
      gsap.set(galeriaScroll, { x: 0 });

      /* Marquee infinito con repeat -1 */
      const marqueeTl = gsap.to(galeriaScroll, {
        x: -anchoSet,
        ease: 'none',
        duration: anchoSet / 50, /* Velocidad: 50px/s — ritmo tranquilo */
        repeat: -1
      });

      /* ── Almacenar referencia para pausar/resumir ── */
      proyecto._marqueeTl = marqueeTl;

      /* ── Tap para expandir imagen ── */
      const imagenes = galeriaScroll.querySelectorAll('.proyecto-img, .proyecto-video');
      imagenes.forEach((img) => {
        img.addEventListener('click', () => {
          expandirImagen(img, marqueeTl);
        });
      });
    }

    /* ══════════════════════════════════════════════════════════
       Función — Expandir imagen en overlay
    ══════════════════════════════════════════════════════════ */
    function expandirImagen(elemento, marqueeTl) {
      /* Pausar marquee */
      marqueeTl.pause();

      /* Crear overlay */
      const overlay = document.createElement('div');
      overlay.className = 'proyecto-img-expandida activa';

      /* Botón cerrar */
      const cerrar = document.createElement('button');
      cerrar.className = 'proyecto-img-expandida-cerrar';
      cerrar.setAttribute('aria-label', 'Cerrar imagen');
      cerrar.innerHTML = '✕';
      overlay.appendChild(cerrar);

      /* Clonar elemento (imagen o video) */
      const clon = elemento.cloneNode(true);
      clon.removeAttribute('class');
      clon.style.cssText = '';
      if (clon.tagName === 'VIDEO') {
        clon.autoplay = true;
        clon.muted = true;
        clon.loop = true;
      }
      overlay.appendChild(clon);

      document.body.appendChild(overlay);

      /* Cerrar al tocar overlay o botón */
      function cerrarOverlay() {
        overlay.classList.remove('activa');
        setTimeout(() => {
          overlay.remove();
          marqueeTl.resume();
        }, 300);
      }

      cerrar.addEventListener('click', cerrarOverlay);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrarOverlay();
      });
    }

    /* ══════════════════════════════════════════════════════════
       matchMedia — Adaptar comportamiento por breakpoint
       IMPORTANTE: Las queries deben ser mutuamente excluyentes
       para que mobile no active también tablet portrait.
    ══════════════════════════════════════════════════════════ */
    const mm = gsap.matchMedia();

    /* Desktop (>1024px) — galería empieza al 50% del viewport */
    mm.add('(min-width: 1025px)', () => {
      proyectos.forEach((proyecto) => {
        crearScrollHorizontal(proyecto, 0.5);
      });
    });

    /* Tablet landscape (≤1024px AND >768px, landscape) */
    mm.add('(max-width: 1024px) and (min-width: 600px) and (orientation: landscape)', () => {
      proyectos.forEach((proyecto) => {
        crearScrollHorizontal(proyecto, 0.55);
      });
    });

    /* Tablet portrait (≤1024px AND >599px, portrait) */
    mm.add('(max-width: 1024px) and (min-width: 600px) and (orientation: portrait)', () => {
      proyectos.forEach((proyecto) => {
        crearScrollHorizontal(proyecto, 0.6);
      });
    });

    /* Mobile portrait (≤599px) — Marquee infinito sin pin */
    mm.add('(max-width: 599px) and (orientation: portrait)', () => {
      proyectos.forEach((proyecto) => {
        crearMarqueeMobile(proyecto);
      });

      /* Cleanup: al salir del breakpoint eliminar duplicados */
      return () => {
        proyectos.forEach((proyecto) => {
          if (proyecto._marqueeTl) {
            proyecto._marqueeTl.kill();
            proyecto._marqueeTl = null;
          }
          /* Restaurar HTML original (quitar duplicados) */
          const galeriaScroll = proyecto.querySelector('.proyecto-galeria-scroll');
          if (galeriaScroll) {
            const totalItems = galeriaScroll.children.length;
            const halfItems = totalItems / 2;
            while (galeriaScroll.children.length > halfItems) {
              galeriaScroll.removeChild(galeriaScroll.lastChild);
            }
          }
        });
      };
    });

    /* Mobile landscape (≤768px AND ≤599px height, landscape) */
    mm.add('(max-width: 768px) and (orientation: landscape)', () => {
      proyectos.forEach((proyecto) => {
        crearScrollHorizontal(proyecto, 0.48);
      });
    });
  }

  return { init };
})();
