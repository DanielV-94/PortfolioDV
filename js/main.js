/* ═══════════════════════════════════════════════════════════════
   MAIN — Inicialización global del portfolio
   Registra plugins GSAP y arranca todos los módulos
═══════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  /* ── Registrar plugins GSAP ── */
  const pluginsGSAP = [];
  if (typeof ScrollTrigger !== "undefined") pluginsGSAP.push(ScrollTrigger);
  if (typeof MorphSVGPlugin !== "undefined") pluginsGSAP.push(MorphSVGPlugin);
  if (typeof SplitText !== "undefined") pluginsGSAP.push(SplitText);
  if (pluginsGSAP.length) {
    gsap.registerPlugin(...pluginsGSAP);
  }

  /* ── Configuración global GSAP ── */
  gsap.defaults({
    ease: "power2.inOut",
    duration: 0.8,
  });

  /* ── Inicializar módulos ── */
  Lenis.init();
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
