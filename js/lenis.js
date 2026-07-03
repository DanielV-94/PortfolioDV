const SmoothScroll = (() => {
  let instance = null;

  function init() {
    if (!window.Lenis) {
      console.warn("Lenis library not loaded");
      return;
    }

    instance = new window.Lenis({
      lerp: 0.08,
      orientation: "vertical",
      touchMultiplier: 1.5,
      wheelMultiplier: 1.2,
      syncTouch: true,
      syncTouchLerp: 0.1,
      easing: (t) => {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      onProgress: (progress) => {
        ScrollTrigger.update();
      },
      autoResize: true,
    });
    gsap.ticker.add((time) => {
      instance.raf(time * 1000);
    });
    instance.on("scroll", () => {
      ScrollTrigger.update();
    });
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
  return {
    init,
    destroy,
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
