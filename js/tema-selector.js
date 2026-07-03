const TemaSelector = (() => {
  const STORAGE_KEY = "dv-tema-activo";
  const TEMAS = ["neutro", "acid", "synthwave", "rave", "collage", "holographic"];

  let panelAbierto = false;
  let elBtn = null;
  let elPanel = null;
  let opciones = [];

  function aplicarTema(tema) {
    if (!TEMAS.includes(tema)) tema = "neutro";
    document.documentElement.setAttribute("data-tema", tema);
    document.body.setAttribute("data-tema", tema);
    localStorage.setItem(STORAGE_KEY, tema);
    actualizarActivo(tema);
  }

  function actualizarActivo(tema) {
    opciones.forEach((op) => {
      const esTema = op.getAttribute("data-tema") === tema;
      op.classList.toggle("activo", esTema);
    });
  }

  function abrir() {
    if (panelAbierto) return;
    panelAbierto = true;

    elPanel.classList.add("activo");
    gsap.killTweensOf(elPanel);
    gsap.fromTo(
      elPanel,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
    );

    const circulos = elPanel.querySelectorAll(".tema-selector-opcion");
    gsap.fromTo(
      circulos,
      { opacity: 0, scale: 0.7 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.25,
        ease: "back.out(1.7)",
        stagger: 0.04,
        delay: 0.08,
      },
    );
  }

  function cerrar() {
    if (!panelAbierto) return;
    panelAbierto = false;

    gsap.killTweensOf(elPanel);
    gsap.to(elPanel, {
      opacity: 0,
      scale: 0.9,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        elPanel.classList.remove("activo");
      },
    });
  }

  function toggle() {
    if (panelAbierto) {
      cerrar();
    } else {
      abrir();
    }
  }

  function init() {
    const temaGuardado = localStorage.getItem(STORAGE_KEY) || "neutro";
    document.documentElement.setAttribute("data-tema", temaGuardado);
    document.body.setAttribute("data-tema", temaGuardado);

    elBtn = document.querySelector(".tema-selector-btn");
    elPanel = document.querySelector(".tema-selector-panel");
    opciones = Array.from(document.querySelectorAll(".tema-selector-opcion"));

    if (!elBtn || !elPanel) return;

    actualizarActivo(temaGuardado);

    elBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });

    opciones.forEach((op) => {
      op.addEventListener("click", (e) => {
        e.stopPropagation();
        const tema = op.getAttribute("data-tema");
        aplicarTema(tema);

        const circulo = op.querySelector(".tema-selector-circulo");
        if (circulo) {
          gsap.fromTo(
            circulo,
            { scale: 1.3 },
            { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" },
          );
        }

        setTimeout(cerrar, 400);
      });
    });

    document.addEventListener("click", () => {
      if (panelAbierto) cerrar();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cerrar();
    });

    const elSelector = document.querySelector(".tema-selector");
    if (elSelector) {
      gsap.to(elSelector, {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        delay: 2.5, });
    }
  }

  return { init, aplicarTema };
})();
