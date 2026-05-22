/* =================================================================
   MANIFIESTO — Layout 50/50
   Izquierda : texto Cloudsters, palabras aparecen una a una (scrub)
   Derecha   : retrato Daniel, fade-in progresivo (scrub)
   Pin activo: el scroll actúa como revelador

   MÓVIL (≤767px): imagen ocupa toda la pantalla → aparece primero
   → scroll aplica blur progresivo → palabras emergen encima
================================================================= */

const Manifiesto = (() => {
  /* ── Utilidad: divide párrafo en .manifiesto-word preservando <span> ── */
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

    /* SVG compartido de convergencia */
    const svg = document.querySelector(
      "#convergencia .convergencia-fila--fill",
    );

    /* Guardar el HTML original del párrafo UNA sola vez —
       al cambiar de breakpoint mm.add corre cleanup + re-init,
       y splitWords se llamaría sobre HTML ya fragmentado.       */
    const originalParrafoHTML = parrafo.innerHTML;

    const mm = gsap.matchMedia();

    /* ================================================================
       DESKTOP (≥768px) — comportamiento original: 50/50, texto izq
    ================================================================ */
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        parrafo.innerHTML = originalParrafoHTML; /* restaurar antes de split */
        const words = splitWords(parrafo);
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

    /* ================================================================
       MÓVIL (≤767px) — imagen primero → blur → texto encima
       Fases:
         0  → SVG sale hacia arriba
         1  → imagen aparece (fade-in)
         2  → imagen recibe blur progresivo + overlay oscuro activo
         3  → palabras emergen una a una sobre la imagen desenfocada
    ================================================================ */
    mm.add(
      "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
      () => {
        parrafo.innerHTML = originalParrafoHTML; /* restaurar antes de split */
        const words = splitWords(parrafo);
        const totalWords = words.length;

        /* Estado inicial: imagen y texto invisibles */
        gsap.set(retrato, { autoAlpha: 0, scale: 1.05, clipPath: "inset(6% 3% 6% 3%)" });
        gsap.set(colImagen, { filter: "blur(0px)" });
        gsap.set(words, { autoAlpha: 0, y: 8 });
        if (insetShadow) gsap.set(insetShadow, { autoAlpha: 0 });
        /* En móvil el SVG de convergencia no participa — se oculta directamente */
        if (svg) gsap.set(svg, { autoAlpha: 0 });

        /* Referencia a las capas de glitch para el flash automático */
        const glitchLayers = section.querySelector(".manifiesto-glitch-layers");

        /* ── Pre-animación: la foto aparece mientras la sección sube al viewport ──
           Empieza cuando el top de la sección entra al 85% del viewport,
           termina cuando llega al top (antes de que se pinie).
           Así el usuario ya ve la foto antes de que empiece el scrub del texto. */
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
            /* Dispara el glitch flash cuando la imagen está ~70% visible */
            if (!glitchFlashDisparado && p >= 0.7 && glitchLayers) {
              glitchFlashDisparado = true;
              glitchLayers.classList.add("glitch-flash");
              /* Apagar el flash después de 1.2s */
              setTimeout(() => {
                glitchLayers.classList.remove("glitch-flash");
              }, 1200);
            }
            /* Resetear si el usuario scrollea hacia arriba */
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
              /* Quitar overlay oscuro si el usuario vuelve atrás */
              if (colImagen) colImagen.classList.remove("overlay-activo");
            },
          },
        });

        /* Fase 1 (0→0.18): foto ya llega visible — asegurar estado final del reveal */
        tl.to(retrato, { autoAlpha: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.18, ease: "none" }, 0);

        /* Fase 2 (0.18→0.44): imagen recibe blur progresivo */
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

        /* Fase 3 (0.46→fin): palabras emergen una a una encima */
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
