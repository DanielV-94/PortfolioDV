document.addEventListener("DOMContentLoaded", () => {
  const pluginsGSAP = [];
  if (typeof ScrollTrigger !== "undefined") pluginsGSAP.push(ScrollTrigger);
  if (typeof MorphSVGPlugin !== "undefined") pluginsGSAP.push(MorphSVGPlugin);
  if (typeof SplitText !== "undefined") pluginsGSAP.push(SplitText);
  if (pluginsGSAP.length) {
    gsap.registerPlugin(...pluginsGSAP);
  }

  gsap.defaults({
    ease: "power2.inOut",
    duration: 0.8,
  });

  Cursor.init();
  Hero.init();
  if (typeof TransicionHero !== "undefined") {
    TransicionHero.init();
  }
  if (typeof Convergencia !== "undefined") {
    Convergencia.init();
  }
  if (typeof Manifiesto !== "undefined") {
    Manifiesto.init();
  }
  if (typeof Habilidades !== "undefined") {
    Habilidades.init();
  }
  if (typeof Proyectos !== "undefined") {
    Proyectos.init();
  }
  if (typeof Metodo !== "undefined") {
    Metodo.init();
  }
  if (typeof Preguntas !== "undefined") {
    Preguntas.init();
  }
  if (typeof Footer !== "undefined") {
    Footer.init();
  }
  if (typeof Nav !== "undefined") {
    Nav.init();
  }
  if (typeof TemaSelector !== "undefined") {
    TemaSelector.init();
  }
  if (typeof ModoCaos !== "undefined") {
    ModoCaos.init();
  }
  if (typeof ModoCreativo !== "undefined") {
    ModoCreativo.init();
  }
});
