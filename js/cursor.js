/* ═══════════════════════════════════════════════════════════════
   CURSOR — Sistema de doble cursor
   · Usuario: punto neutro + etiqueta "tú"
   · Daniel:  punto neón + etiqueta "Daniel" + movimiento animado
═══════════════════════════════════════════════════════════════ */

const Cursor = (() => {
  const elUsuario = document.getElementById("cursorUsuario");
  const elDaniel = document.getElementById("cursorDaniel");

  let mousePosX = window.innerWidth / 2;
  let mousePosY = window.innerHeight / 2;
  let curPosX = mousePosX;
  let curPosY = mousePosY;
  let etiquetaMostrada = false;

  /* ── Suavizado RAF del cursor usuario ── */
  function suavizar() {
    const velocidad = 0.13;
    curPosX += (mousePosX - curPosX) * velocidad;
    curPosY += (mousePosY - curPosY) * velocidad;

    gsap.set(elUsuario, { x: curPosX, y: curPosY });
    requestAnimationFrame(suavizar);
  }

  /* ── Registrar hover en elementos interactivos ── */
  function registrarHovers() {
    const selectores = "a, button, [contenteditable], .hero-nombre-daniel";
    document.querySelectorAll(selectores).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        gsap.to(elUsuario.querySelector(".cursor-punto"), {
          scale: 3.4,
          duration: 0.3,
          ease: "power2.out",
        });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(elUsuario.querySelector(".cursor-punto"), {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });
  }

  /* ── Init ── */
  function init() {
    const usaPunteroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!usaPunteroFino || !elUsuario || !elDaniel) return;

    document.body.classList.add("usa-cursor-custom");

    // Posición inicial off-screen
    gsap.set(elUsuario, { x: -200, y: -200 });
    gsap.set(elDaniel, { x: -300, y: -300 });

    const elCoordsUsuario = document.getElementById("coordsUsuario");

    document.addEventListener("mousemove", (e) => {
      mousePosX = e.clientX;
      mousePosY = e.clientY;

      if (document.body.classList.contains("cursor-oculto")) return;

      if (elCoordsUsuario) {
        elCoordsUsuario.textContent = `x: ${e.clientX}  y: ${e.clientY}`;
      }

      if (!etiquetaMostrada) {
        etiquetaMostrada = true;
        elUsuario.classList.add("visible");
      }
    });

    document.addEventListener("mouseleave", () => {
      gsap.to(elUsuario, { opacity: 0, duration: 0.3 });
    });

    document.addEventListener("mouseenter", () => {
      gsap.to(elUsuario, { opacity: 1, duration: 0.3 });
    });

    registrarHovers();
    suavizar();
  }

  return {
    init,
  };
})();
