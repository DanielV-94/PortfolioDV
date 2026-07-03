const MiTrabajo = (() => {
  function init() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const proyectos = document.querySelectorAll('.proyecto');
    if (!proyectos.length) return;

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

    function crearMarqueeMobile(proyecto) {
      const galeriaScroll = proyecto.querySelector('.proyecto-galeria-scroll');
      if (!galeriaScroll) return;

      const items = galeriaScroll.innerHTML;
      galeriaScroll.innerHTML = items + items;

      const totalItems = galeriaScroll.children.length;
      const halfItems = totalItems / 2;
      let anchoSet = 0;
      for (let i = 0; i < halfItems; i++) {
        anchoSet += galeriaScroll.children[i].offsetWidth + 16; }

      gsap.set(galeriaScroll, { x: 0 });

      const marqueeTl = gsap.to(galeriaScroll, {
        x: -anchoSet,
        ease: 'none',
        duration: anchoSet / 50, repeat: -1
      });

      proyecto._marqueeTl = marqueeTl;

      const imagenes = galeriaScroll.querySelectorAll('.proyecto-img, .proyecto-video');
      imagenes.forEach((img) => {
        img.addEventListener('click', () => {
          expandirImagen(img, marqueeTl);
        });
      });
    }

    function expandirImagen(elemento, marqueeTl) {
      marqueeTl.pause();

      const overlay = document.createElement('div');
      overlay.className = 'proyecto-img-expandida activa';

      const cerrar = document.createElement('button');
      cerrar.className = 'proyecto-img-expandida-cerrar';
      cerrar.setAttribute('aria-label', 'Cerrar imagen');
      cerrar.innerHTML = '✕';
      overlay.appendChild(cerrar);

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

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1025px)', () => {
      proyectos.forEach((proyecto) => {
        crearScrollHorizontal(proyecto, 0.5);
      });
    });

    mm.add('(max-width: 1024px) and (min-width: 600px) and (orientation: landscape)', () => {
      proyectos.forEach((proyecto) => {
        crearScrollHorizontal(proyecto, 0.55);
      });
    });

    mm.add('(max-width: 1024px) and (min-width: 600px) and (orientation: portrait)', () => {
      proyectos.forEach((proyecto) => {
        crearScrollHorizontal(proyecto, 0.6);
      });
    });

    mm.add('(max-width: 599px) and (orientation: portrait)', () => {
      proyectos.forEach((proyecto) => {
        crearMarqueeMobile(proyecto);
      });

      return () => {
        proyectos.forEach((proyecto) => {
          if (proyecto._marqueeTl) {
            proyecto._marqueeTl.kill();
            proyecto._marqueeTl = null;
          }
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

    mm.add('(max-width: 768px) and (orientation: landscape)', () => {
      proyectos.forEach((proyecto) => {
        crearScrollHorizontal(proyecto, 0.48);
      });
    });
  }

  return { init };
})();
