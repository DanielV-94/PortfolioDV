/* ═══════════════════════════════════════════════════════════════
   NAV — Menú fullscreen (overlay)
   · Toggle con botón hamburguesa
   · Cierre con ESC / click afuera / click en enlace
═══════════════════════════════════════════════════════════════ */

const Nav = (() => {
  const elBtn = document.getElementById("navMenuBtn");
  const elOverlay = document.getElementById("navOverlay");
  const enlaces = Array.from(document.querySelectorAll("[data-nav-link]"));

  let abierto = false;

  function prepararMarquees() {
    const marquees = Array.from(document.querySelectorAll(".nav-menu-marquee"));
    marquees.forEach((marquee) => {
      if (marquee.querySelector(".nav-menu-loop")) return;

      const track = marquee.querySelector(".nav-menu-track");
      if (!track) return;

      const loop = document.createElement("span");
      loop.className = "nav-menu-loop";

      const clone = track.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");

      loop.append(track);
      loop.append(clone);
      marquee.append(loop);
    });
  }

  function abrir() {
    if (!elBtn || !elOverlay || abierto) return;
    abierto = true;

    elBtn.setAttribute("aria-expanded", "true");
    elBtn.setAttribute("aria-label", "Cerrar menú de navegación");
    elBtn.classList.add("activo");

    elOverlay.classList.add("activo");
    elOverlay.removeAttribute("aria-hidden");

    gsap.killTweensOf([elOverlay, ".nav-menu-row"]);
    gsap.to(elOverlay, {
      opacity: 1,
      duration: 0.35,
      ease: "power2.out",
      pointerEvents: "auto",
    });

    gsap.fromTo(
      ".nav-menu-row",
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.48,
        ease: "power3.out",
        stagger: 0.06,
        delay: 0.08,
      },
    );

    document.body.classList.add("nav-abierta");
  }

  function cerrar() {
    if (!elBtn || !elOverlay || !abierto) return;
    abierto = false;

    elBtn.setAttribute("aria-expanded", "false");
    elBtn.setAttribute("aria-label", "Abrir menú de navegación");
    elBtn.classList.remove("activo");

    gsap.killTweensOf([elOverlay, ".nav-menu-row"]);
    gsap.to(elOverlay, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
      pointerEvents: "none",
      onComplete: () => {
        elOverlay.classList.remove("activo");
        elOverlay.setAttribute("aria-hidden", "true");
      },
    });

    document.body.classList.remove("nav-abierta");
  }

  function toggle() {
    if (abierto) {
      cerrar();
      return;
    }
    abrir();
  }

  function init() {
    if (!elBtn || !elOverlay) return;

    prepararMarquees();

    elBtn.addEventListener("click", toggle);

    elOverlay.addEventListener("click", (e) => {
      const clickEnPanel = e.target.closest(".nav-overlay-panel");
      if (!clickEnPanel) cerrar();
    });

    enlaces.forEach((link) => {
      link.addEventListener("click", () => {
        cerrar();
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cerrar();
    });
  }

  return { init };
})();
