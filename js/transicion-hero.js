/* ═══════════════════════════════════════════════════════════════
  TRANSICIÓN HERO — 4 fases secuenciales scrubbeadas al scroll

  GEOMETRÍA DEL LAYOUT:
  ┌─────────────────────────────────────────────────────────────┐
  │ .hero-sticky-stage  (height: 210dvh)                        │
  │   └─ .hero  (sticky top:0, height:100dvh)                   │
  │        ← el hero es sticky durante los 210dvh del stage     │
  ├─────────────────────────────────────────────────────────────┤
  │ #transicionHero  (margin-top: -100dvh, min-height: 200dvh)  │
  │   └─ .transicion-hero-stage  (sticky top:0)                 │
  │        ← se superpone sobre el hero durante su scroll       │
  └─────────────────────────────────────────────────────────────┘

  ESTRATEGIA:
  - NO pinear nada extra. El hero ya es sticky dentro de su stage.
  - El trigger del scrub es .hero-sticky-stage (el rail que ya existe).
  - El hero se anima mientras está sticky (scroll 0 → 110dvh del stage).
  - Las líneas de texto se animan mientras #transicionHero está en pantalla.
  - Dos ScrollTriggers independientes, cada uno con su trigger correcto.
═══════════════════════════════════════════════════════════════ */

const TransicionHero = (() => {
  const DEBUG = false;

  /* ─────────────────────────────────────────
     HUD de debug
  ───────────────────────────────────────── */
  function _crearHUD(fases, totalDur) {
    const wrap = document.createElement("div");
    wrap.id = "th-debug-hud";
    wrap.style.cssText = `
      position:fixed;left:50%;bottom:14px;transform:translateX(-50%);
      z-index:100000;pointer-events:none;
      font-family:ui-monospace,monospace;font-size:11px;color:#111;
      background:rgba(255,255,255,0.93);border:1px solid rgba(0,0,0,0.15);
      border-radius:10px;padding:10px 14px 12px;
      box-shadow:0 6px 24px rgba(0,0,0,0.12);
      width:min(600px,92vw);backdrop-filter:blur(8px);
    `;
    wrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-weight:700;letter-spacing:.04em">
        <span>TRANSICIÓN HERO — DEBUG</span><span id="th-pct">0%</span>
      </div>
      <div id="th-rail" style="position:relative;height:14px;border-radius:7px;background:rgba(0,0,0,0.06);overflow:hidden"></div>
      <div id="th-labels" style="position:relative;height:18px;margin-top:4px"></div>
    `;
    document.body.appendChild(wrap);

    const rail   = wrap.querySelector("#th-rail");
    const labels = wrap.querySelector("#th-labels");

    Object.entries(fases).forEach(([nombre, f]) => {
      const left  = (f.start / totalDur) * 100;
      const width = (f.duration / totalDur) * 100;
      const seg = document.createElement("div");
      seg.dataset.fase = nombre;
      seg.style.cssText = `position:absolute;top:0;bottom:0;left:${left}%;width:${width}%;background:${f.color};opacity:.35;transition:opacity 100ms`;
      rail.appendChild(seg);
      const lbl = document.createElement("span");
      lbl.dataset.fase = nombre;
      lbl.textContent = nombre;
      lbl.style.cssText = `position:absolute;left:${left + width / 2}%;top:0;transform:translateX(-50%);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:${f.color};font-weight:700;opacity:.5;transition:opacity 100ms,transform 100ms`;
      labels.appendChild(lbl);
    });

    const head = document.createElement("div");
    head.id = "th-head";
    head.style.cssText = "position:absolute;top:-3px;bottom:-3px;width:2px;left:0;background:#111;transform:translateX(-1px)";
    rail.appendChild(head);

    return {
      update(progress, fases, totalDur) {
        const p = Math.max(0, Math.min(1, progress));
        wrap.querySelector("#th-pct").textContent = (p * 100).toFixed(0) + "%";
        wrap.querySelector("#th-head").style.left = (p * 100).toFixed(2) + "%";
        const tNow = p * totalDur;
        wrap.querySelectorAll("[data-fase]").forEach((node) => {
          const f = fases[node.dataset.fase];
          if (!f) return;
          const activa = tNow >= f.start && tNow <= f.start + f.duration;
          if (node.tagName === "DIV") {
            node.style.opacity = activa ? "0.95" : "0.35";
          } else {
            node.style.opacity = activa ? "1" : "0.5";
            node.style.transform = activa ? "translateX(-50%) scale(1.1)" : "translateX(-50%) scale(1)";
          }
        });
      },
      destroy() { wrap.remove(); },
    };
  }

  function init() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const hero     = document.getElementById("hero");
    const stage    = document.querySelector(".hero-sticky-stage"); // rail del hero sticky
    const section  = document.getElementById("transicionHero");
    const gradient = section?.querySelector(".transicion-hero-gradient");
    const copy     = document.getElementById("transicionHeroCopy");

    if (!hero || !stage || !section || !copy) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(hero, { scale: 0.7, yPercent: -120, opacity: 0 });
      if (gradient) gsap.set(gradient, { autoAlpha: 1 });
      gsap.set(copy.querySelectorAll("p"), { opacity: 1, y: 0 });
      return;
    }

    const mm = gsap.matchMedia();

    /* ══════════════════════════════════════════════════════
       DESKTOP GRANDE (>1024px)
       Geometría: hero-sticky-stage (210dvh) + transicionHero
       superpuesta con margin-top:-100dvh.
       Dos timelines scrubbeados, cada uno con su trigger.
    ══════════════════════════════════════════════════════ */
    mm.add("(min-width: 1025px)", (ctx) => {

      const split = new SplitText(copy, {
        type: "lines",
        linesClass: "trans-line",
      });
      gsap.set(split.lines, { y: 90, opacity: 0, rotationX: 12 });

      const FASES_HERO = {
        shrink: { start: 0.0,  duration: 0.28, color: "#22d3ee" },
        tilt:   { start: 0.28, duration: 0.30, color: "#a78bfa" },
        exit:   { start: 0.65, duration: 0.35, color: "#ef4444" },
      };

      const hud = DEBUG ? _crearHUD(FASES_HERO, 1.0) : null;

      const tlHero = gsap.timeline({
        scrollTrigger: {
          id: "th-hero",
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 2,
          markers: DEBUG ? { startColor: "#10b981", endColor: "#10b981", fontSize: "12px", indent: 200 } : false,
          onUpdate: hud ? (self) => hud.update(self.progress, FASES_HERO, 1.0) : undefined,
          invalidateOnRefresh: true,
        },
      });

      tlHero.to(hero, {
        scale: 0.62,
        z: -120,
        transformOrigin: "50% 50%",
        ease: "power2.inOut",
        duration: FASES_HERO.shrink.duration,
      }, FASES_HERO.shrink.start);

      tlHero.to(hero, {
        rotationX: 28,
        rotationY: -10,
        z: -220,
        ease: "power3.inOut",
        duration: FASES_HERO.tilt.duration,
      }, FASES_HERO.tilt.start);

      tlHero.to(hero, {
        yPercent: -130,
        rotationX: 42,
        opacity: 0,
        ease: "power3.in",
        duration: FASES_HERO.exit.duration,
      }, FASES_HERO.exit.start);

      const tlCopy = gsap.timeline({
        scrollTrigger: {
          id: "th-copy",
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 2,
          markers: DEBUG ? { startColor: "#f59e0b", endColor: "#f59e0b", fontSize: "12px", indent: 100 } : false,
          invalidateOnRefresh: true,
        },
      });

      tlCopy.to(gradient, {
        autoAlpha: 1,
        ease: "power2.inOut",
        duration: 0.4,
      }, 0);

      tlCopy.to(split.lines, {
        y: 0,
        opacity: 1,
        rotationX: 0,
        stagger: 0.18,
        ease: "back.out(1.6)",
        duration: 0.65,
      }, 0.08);

      return () => {
        tlHero.kill();
        tlCopy.kill();
        split.revert();
        if (hud) hud.destroy();
      };
    });

    /* ══════════════════════════════════════════════════════
       TABLET PORTRAIT (768px – 1024px, vertical)
       Misma geometría que desktop (margin-top:-100dvh, sticky)
       pero valores intermedios. En portrait la pantalla es
       alta y angosta — el tilt se siente más porque hay
       más espacio vertical.
    ══════════════════════════════════════════════════════ */
    mm.add("(min-width: 768px) and (max-width: 1024px) and (orientation: portrait)", (ctx) => {

      const split = new SplitText(copy, {
        type: "lines",
        linesClass: "trans-line",
      });
      gsap.set(split.lines, { y: 60, opacity: 0, rotationX: 8 });

      const FASES_HERO = {
        shrink: { start: 0.0,  duration: 0.30, color: "#22d3ee" },
        tilt:   { start: 0.30, duration: 0.28, color: "#a78bfa" },
        exit:   { start: 0.65, duration: 0.35, color: "#ef4444" },
      };

      const hud = DEBUG ? _crearHUD(FASES_HERO, 1.0) : null;

      const tlHero = gsap.timeline({
        scrollTrigger: {
          id: "th-hero-tablet-portrait",
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.8,
          markers: DEBUG ? { startColor: "#10b981", endColor: "#10b981", fontSize: "12px", indent: 180 } : false,
          onUpdate: hud ? (self) => hud.update(self.progress, FASES_HERO, 1.0) : undefined,
          invalidateOnRefresh: true,
        },
      });

      /* Shrink — moderado */
      tlHero.to(hero, {
        scale: 0.68,
        z: -80,
        transformOrigin: "50% 50%",
        ease: "power2.inOut",
        duration: FASES_HERO.shrink.duration,
      }, FASES_HERO.shrink.start);

      /* Tilt — intermedio, sin exagerar en pantalla angosta */
      tlHero.to(hero, {
        rotationX: 18,
        rotationY: -6,
        z: -140,
        ease: "power3.inOut",
        duration: FASES_HERO.tilt.duration,
      }, FASES_HERO.tilt.start);

      /* Exit */
      tlHero.to(hero, {
        yPercent: -120,
        rotationX: 28,
        opacity: 0,
        ease: "power3.in",
        duration: FASES_HERO.exit.duration,
      }, FASES_HERO.exit.start);

      /* Copy */
      const tlCopy = gsap.timeline({
        scrollTrigger: {
          id: "th-copy-tablet-portrait",
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.8,
          invalidateOnRefresh: true,
        },
      });

      tlCopy.to(gradient, {
        autoAlpha: 1,
        ease: "power2.inOut",
        duration: 0.4,
      }, 0);

      tlCopy.to(split.lines, {
        y: 0,
        opacity: 1,
        rotationX: 0,
        stagger: 0.16,
        ease: "back.out(1.4)",
        duration: 0.6,
      }, 0.08);

      return () => {
        tlHero.kill();
        tlCopy.kill();
        split.revert();
        if (hud) hud.destroy();
      };
    });

    /* ══════════════════════════════════════════════════════
       TABLET LANDSCAPE (768px – 1024px, horizontal)
       Pantalla ancha y baja — el viewport es corto en
       altura, así que el tilt se ve más exagerado.
       Reducimos rotationX y damos más recorrido al shrink.
       El scrub es más rápido porque hay menos scroll
       disponible en viewports bajos.
    ══════════════════════════════════════════════════════ */
    mm.add("(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)", (ctx) => {

      const split = new SplitText(copy, {
        type: "lines",
        linesClass: "trans-line",
      });
      gsap.set(split.lines, { y: 50, opacity: 0, rotationX: 6 });

      const FASES_HERO = {
        shrink: { start: 0.0,  duration: 0.32, color: "#22d3ee" },
        tilt:   { start: 0.32, duration: 0.26, color: "#a78bfa" },
        exit:   { start: 0.65, duration: 0.35, color: "#ef4444" },
      };

      const hud = DEBUG ? _crearHUD(FASES_HERO, 1.0) : null;

      const tlHero = gsap.timeline({
        scrollTrigger: {
          id: "th-hero-tablet-landscape",
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
          markers: DEBUG ? { startColor: "#10b981", endColor: "#10b981", fontSize: "12px", indent: 160 } : false,
          onUpdate: hud ? (self) => hud.update(self.progress, FASES_HERO, 1.0) : undefined,
          invalidateOnRefresh: true,
        },
      });

      /* Shrink — más suave, la pantalla baja exagera el efecto */
      tlHero.to(hero, {
        scale: 0.72,
        z: -60,
        transformOrigin: "50% 50%",
        ease: "power2.inOut",
        duration: FASES_HERO.shrink.duration,
      }, FASES_HERO.shrink.start);

      /* Tilt — reducido para viewport bajo */
      tlHero.to(hero, {
        rotationX: 14,
        rotationY: -5,
        z: -100,
        ease: "power3.inOut",
        duration: FASES_HERO.tilt.duration,
      }, FASES_HERO.tilt.start);

      /* Exit */
      tlHero.to(hero, {
        yPercent: -110,
        rotationX: 22,
        opacity: 0,
        ease: "power3.in",
        duration: FASES_HERO.exit.duration,
      }, FASES_HERO.exit.start);

      /* Copy */
      const tlCopy = gsap.timeline({
        scrollTrigger: {
          id: "th-copy-tablet-landscape",
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });

      tlCopy.to(gradient, {
        autoAlpha: 1,
        ease: "power2.inOut",
        duration: 0.4,
      }, 0);

      tlCopy.to(split.lines, {
        y: 0,
        opacity: 1,
        rotationX: 0,
        stagger: 0.14,
        ease: "back.out(1.3)",
        duration: 0.55,
      }, 0.08);

      return () => {
        tlHero.kill();
        tlCopy.kill();
        split.revert();
        if (hud) hud.destroy();
      };
    });

    /* ══════════════════════════════════════════════════════
       MÓVIL (≤767px)
       Geometría diferente: transicion-hero tiene margin-top:0,
       position:relative, sin sticky. El hero está arriba en
       flujo normal. Animaciones simples basadas en visibilidad.
    ══════════════════════════════════════════════════════ */
    mm.add("(max-width: 767px)", (ctx) => {

      /* Estado inicial del hero — visible, sin transformar */
      gsap.set(hero, { clearProps: "all" });

      /* SplitText para las líneas */
      const split = new SplitText(copy, {
        type: "lines",
        linesClass: "trans-line",
      });
      gsap.set(split.lines, { y: 50, opacity: 0 });

      /* ── Hero: shrink + exit cuando el stage sale del viewport ──
         En móvil el hero-sticky-stage mide 210dvh.
         Animamos el hero mientras el stage está en pantalla,
         pero con valores más suaves (sin tilt 3D agresivo en móvil). */
      const tlHero = gsap.timeline({
        scrollTrigger: {
          id: "th-hero-mobile",
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });

      /* Shrink suave */
      tlHero.to(hero, {
        scale: 0.82,
        transformOrigin: "50% 50%",
        ease: "power2.inOut",
        duration: 0.25,
      }, 0);

      /* Leve tilt — más sutil en móvil */
      tlHero.to(hero, {
        rotationX: 10,
        rotationY: -4,
        ease: "power2.inOut",
        duration: 0.20,
      }, 0.25);

      /* Exit */
      tlHero.to(hero, {
        yPercent: -100,
        opacity: 0,
        ease: "power3.in",
        duration: 0.30,
      }, 0.60);

      /* ── Gradiente: entra cuando #transicionHero es visible ──
         En móvil la sección tiene margin-top:0 y flujo normal,
         así que el trigger es la sección misma. */
      const stGradient = ScrollTrigger.create({
        id: "th-gradient-mobile",
        trigger: section,
        start: "top 80%",
        end: "top 20%",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(gradient, { autoAlpha: self.progress });
        },
      });

      /* ── Líneas: entran con toggleAction cuando la sección es visible ──
         back.out para el efecto flote, stagger para el beat. */
      const stLines = ScrollTrigger.create({
        id: "th-lines-mobile",
        trigger: copy,
        start: "top 95%",
        once: true,
        onEnter: () => {
          gsap.to(split.lines, {
            y: 0,
            opacity: 1,
            stagger: 0.14,
            ease: "back.out(1.5)",
            duration: 0.7,
          });
        },
      });

      return () => {
        tlHero.kill();
        stGradient.kill();
        stLines.kill();
        split.revert();
        gsap.set(hero, { clearProps: "all" });
      };
    });
  }

  return { init };
})();
