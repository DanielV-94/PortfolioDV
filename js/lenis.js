/* ═══════════════════════════════════════════════════════════════
   LENIS — Smooth scroll wrapper con integración a GSAP ScrollTrigger
   Ajusta el scroll para que se sienta "fluido como mantequilla"
   con lerp de 0.08 y easing suave para diseño premium
═══════════════════════════════════════════════════════════════ */

const Lenis = (() => {
  let instance = null;

  function init() {
    if (!window.Lenis) {
      console.warn("Lenis library not loaded");
      return;
    }

    instance = new Lenis({
      // Suavidad del scroll: menor = más suave, mayor = más reactivo
      // 0.08 es muy suave (estilo "premium")
      lerp: 0.08,
      
      // Orientation vertical para scroll normal
      orientation: "vertical",
      
      // Multiplicadores para wheel y touch
      touchMultiplier: 1.5,
      wheelMultiplier: 1.2,
      
      // Sync touch para móviles más suave
      syncTouch: true,
      syncTouchLerp: 0.1,
      
      // Easing function para animación suave
      // poder3.out da un final suave natural
      easing: (t) => {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },

      // Event handler para actualizar ScrollTrigger
      onProgress: (progress) => {
        ScrollTrigger.update();
      },
      
      // Auto resize cuando cambia el viewport
      autoResize: true,
    });

    // Integrar con GSAP ticker para sincronización perfecta
    gsap.ticker.add((time) => {
      instance.raf(time * 1000);
    });

    // Sincronizar ScrollTrigger con los cambios de scroll de Lenis
    instance.on("scroll", () => {
      ScrollTrigger.update();
    });

    // Ajustar tamaño cuando se hace resize
    window.addEventListener("resize", () => {
      instance.resize();
    });

    console.log("Lenis initialized with lerp: 0.08 (premium smooth)");
  }

  function destroy() {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  }

  // Exponer métodos públicos
  return {
    init,
    destroy,
    // Permitir controlar el scroll desde fuera si es necesario
    scrollTo: (target, options) => {
      if (instance) {
        instance.scrollTo(target, options);
      }
    },
    stop: () => {
      if (instance) {
        instance.stop();
      }
    },
    start: () => {
      if (instance) {
        instance.start();
      }
    },
  };
})();
