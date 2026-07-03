const Convergencia = (() => {
  function init() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
      return;

    const section = document.getElementById("convergencia");
    if (!section) return;

    const filas = section.querySelectorAll(".convergencia-fila");
    if (filas.length < 5) return;

    const mm = gsap.matchMedia();

    function setFilaSrcs(outlineSrc, fillSrc) {
      filas.forEach((fila, i) => {
        if (i === 2) {
          fila.src = fillSrc;
        } else {
          fila.src = outlineSrc;
        }
      });
    }

    function _dispararNeon(targets) {
      const glowColor = "#ffffff";

      const base = "brightness(0) invert(1)";
      const g = (hex2) =>
        `brightness(0) invert(1) ` +
        `drop-shadow(0 0 4px ${glowColor}) ` +
        `drop-shadow(0 0 12px ${glowColor}${hex2}) ` +
        `drop-shadow(0 0 28px ${glowColor}${hex2}) ` +
        `drop-shadow(0 0 56px ${glowColor}88)`;

      gsap.set(targets, { filter: base });

      const tl = gsap.timeline()
        .to(targets, { filter: g("ff"), duration: 0.08, ease: "none" })
        .to(targets, { filter: g("44"), duration: 0.05, ease: "none" })
        .to(targets, { filter: g("ff"), duration: 0.10, ease: "none" })
        .to(targets, { filter: g("22"), duration: 0.04, ease: "none" })
        .to(targets, { filter: g("ee"), duration: 0.22, ease: "power1.out" })
        .to(targets, { filter: g("55"), duration: 0.06, ease: "none" })
        .to(targets, { filter: g("ff"), duration: 0.18, ease: "power2.out" })
        .to(targets, { filter: g("ff"), duration: 0.8,  ease: "none" })
        .to(targets, { filter: base,    duration: 0.4, ease: "power2.inOut" });

      return tl;
    }

    function runConvergencia() {
      const dirs    = [1, -1, 1, -1, 1];
      const offsets = [150, 150, 150, 150, 150];

      const outlines = [filas[0], filas[1], filas[3], filas[4]];

      filas.forEach((fila, i) => {
        gsap.set(fila, { xPercent: dirs[i] * offsets[i], autoAlpha: 0 });
      });

      let neonDisparado = false;
      let neonTl = null; const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * 1.7}`,
          scrub: 1.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!neonDisparado && self.progress >= 0.28) {
              neonDisparado = true;
              neonTl = _dispararNeon(outlines);
            }

            if (neonDisparado && self.progress < 0.20) {
              neonDisparado = false;
              if (neonTl) {
                neonTl.kill();
                neonTl = null;
              }
              const base = "brightness(0) invert(1)";
              gsap.set(outlines, { filter: base });
            }
          },
        },
      });

      tl.to(
        filas,
        { xPercent: 0, autoAlpha: 1, ease: "power3.out", duration: 0.6 },
        0,
      );

      const yTargets = [200, 100, null, -100, -200];
      filas.forEach((fila, i) => {
        if (yTargets[i] === null) return;
        tl.to(
          fila,
          { yPercent: yTargets[i], autoAlpha: 0, ease: "power2.inOut", duration: 0.6 },
          0.5,
        );
      });

      return () => {
        tl.kill();
        if (neonTl) neonTl.kill();
      };
    }

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        setFilaSrcs("Rsc/Stickers/OUTLINE.svg", "Rsc/Stickers/FILL.svg");
        return runConvergencia();
      },
    );

    mm.add(
      "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
      () => {
        setFilaSrcs(
          "Rsc/Stickers/versionmovil.svg",
          "Rsc/Stickers/versionmovil2.svg",
        );

        const dirs = [1, -1, 1, -1, 1];
        filas.forEach((fila, i) => {
          gsap.set(fila, { xPercent: dirs[i] * 115, autoAlpha: 0 });
        });

        const tl = gsap.timeline({ defaults: { ease: "none" } });

        filas.forEach((fila, i) => {
          tl.to(fila, { xPercent: 0, autoAlpha: 1, duration: 0.2 }, i * 0.16);
        });

        ScrollTrigger.create({
          trigger: section,
          animation: tl,
          start: "top 95%",
          end: "top 5%",
          scrub: 0.6,
          invalidateOnRefresh: true,
        });

        return () => tl.kill();
      },
    );
  }

  return { init };
})();
