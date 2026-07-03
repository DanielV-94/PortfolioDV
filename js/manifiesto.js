const Manifiesto = (() => {
  function splitWords(parrafo) {
    const rawHTML = parrafo.innerHTML;
    const tokens = [];
    const re = /(<span[^>]*>[\s\S]*?<\/span>|[^\s<]+)/g;
    let m;
    while ((m = re.exec(rawHTML)) !== null) tokens.push(m[0]);
    parrafo.innerHTML = tokens
      .map((t) => '<span class="manifiesto-word">' + t + "</span>")
      .join(" ");
    return parrafo.querySelectorAll(".manifiesto-word");
  }

  function init() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
      return;

    const section = document.getElementById("manifiesto");
    if (!section) return;

    const stage = section.querySelector(".manifiesto-stage");
    const bloque = section.querySelector(".manifiesto-bloque");
    const retrato = section.querySelector(".manifiesto-retrato");
    const colImagen = section.querySelector(".manifiesto-col--imagen");
    const insetShadow = section.querySelector(".manifiesto-inset-shadow");
    const parrafo = bloque ? bloque.querySelector("p") : null;

    if (!stage || !bloque || !retrato || !parrafo) return;

    const svg = document.querySelector(
      "#convergencia .convergencia-fila--fill",
    );

    const originalParrafoHTML = parrafo.innerHTML;

    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        parrafo.innerHTML = originalParrafoHTML; const words = splitWords(parrafo);
        const totalWords = words.length;
        const wordsDur = totalWords * 0.08;

        gsap.set(words, { autoAlpha: 0, y: 10 });
        gsap.set(retrato, { autoAlpha: 0, scale: 1.08, clipPath: "inset(8% 4% 8% 4%)" });
        if (insetShadow) gsap.set(insetShadow, { autoAlpha: 0 });
        if (svg) gsap.set(svg, { yPercent: 0, autoAlpha: 1 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * 3.2}`,
            scrub: 1.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onEnter: () => {
              if (svg) svg.classList.add("is-shared-manifiesto");
            },
            onEnterBack: () => {
              if (svg) svg.classList.add("is-shared-manifiesto");
            },
            onLeave: () => {
              if (svg) svg.classList.remove("is-shared-manifiesto");
            },
            onLeaveBack: () => {
              if (svg) {
                svg.classList.remove("is-shared-manifiesto");
                gsap.set(svg, { clearProps: "transform,opacity,visibility" });
              }
            },
          },
        });

        if (svg) {
          tl.to(
            svg,
            {
              yPercent: -160,
              autoAlpha: 0,
              ease: "back.inOut",
              duration: 0.09,
            },
            0,
          );
        }

        tl.to(
          words,
          {
            autoAlpha: 1,
            y: 0,
            ease: "power4.out",
            stagger: {
              each: 0.95,
              onStart() {
                const el = this.targets()[0];
                const hl = el.querySelector(".manifiesto-highlight");
                if (hl) hl.classList.add("neon-activo");
              },
            },
            duration: 2.5,
          },
          0.06,
        );

        tl.to(
          retrato,
          { autoAlpha: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)", ease: "power2.out", duration: wordsDur },
          0.06,
        );
        if (insetShadow) {
          tl.to(
            insetShadow,
            { autoAlpha: 1, ease: "power2.inOut", duration: wordsDur * 1.2 },
            0.06,
          );
        }

        return () => {
          tl.kill();
          if (svg) {
            svg.classList.remove("is-shared-manifiesto");
            gsap.set(svg, { clearProps: "transform,opacity,visibility" });
          }
        };
      },
    );

    mm.add(
      "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
      () => {
        parrafo.innerHTML = originalParrafoHTML; const words = splitWords(parrafo);
        const totalWords = words.length;

        gsap.set(retrato, { autoAlpha: 0, scale: 1.05, clipPath: "inset(6% 3% 6% 3%)" });
        gsap.set(colImagen, { filter: "blur(0px)" });
        gsap.set(words, { autoAlpha: 0, y: 8 });
        if (insetShadow) gsap.set(insetShadow, { autoAlpha: 0 });
        if (svg) gsap.set(svg, { autoAlpha: 0 });

        const glitchLayers = section.querySelector(".manifiesto-glitch-layers");

        let glitchFlashDisparado = false;
        ScrollTrigger.create({
          trigger: section,
          start: "top 85%",
          end: "top 5%",
          scrub: 1.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            gsap.set(retrato, {
              autoAlpha: p,
              scale: 1.05 - (0.05 * p),
              clipPath: `inset(${6 - 6 * p}% ${3 - 3 * p}% ${6 - 6 * p}% ${3 - 3 * p}%)`,
            });
            if (!glitchFlashDisparado && p >= 0.7 && glitchLayers) {
              glitchFlashDisparado = true;
              glitchLayers.classList.add("glitch-flash");
              setTimeout(() => {
                glitchLayers.classList.remove("glitch-flash");
              }, 1200);
            }
            if (glitchFlashDisparado && p < 0.5) {
              glitchFlashDisparado = false;
            }
          },
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * 4.5}`,
            scrub: 2,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onLeaveBack: () => {
              if (colImagen) colImagen.classList.remove("overlay-activo");
            },
          },
        });

        tl.to(retrato, { autoAlpha: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.18, ease: "none" }, 0);

        tl.to(
          colImagen,
          {
            filter: "blur(8px)",
            ease: "power1.inOut",
            duration: 0.26,
            onStart() {
              if (colImagen) colImagen.classList.add("overlay-activo");
            },
          },
          0.18,
        );

        if (insetShadow) {
          tl.to(
            insetShadow,
            { autoAlpha: 0.6, ease: "power2.inOut", duration: 0.28 },
            0.18,
          );
        }

        tl.to(
          words,
          {
            autoAlpha: 1,
            y: 0,
            ease: "power3.out",
            stagger: {
              each: 0.9,
              onStart() {
                const el = this.targets()[0];
                const hl = el.querySelector(".manifiesto-highlight");
                if (hl) hl.classList.add("neon-activo");
              },
            },
            duration: 2.2,
          },
          0.46,
        );

        return () => {
          tl.kill();
          if (colImagen) {
            colImagen.classList.remove("overlay-activo");
            gsap.set(colImagen, { clearProps: "filter" });
          }
        };
      },
    );
  }

  return { init };
})();
