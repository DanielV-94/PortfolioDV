const Manifiesto = (() => {

  function init() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const section = document.getElementById("manifiesto");
    if (!section) return;

    const stage = section.querySelector(".manifiesto-stage");
    const bloque = section.querySelector(".manifiesto-bloque");
    const retrato = section.querySelector(".manifiesto-retrato");
    const colImagen = section.querySelector(".manifiesto-col--imagen");
    const insetShadow = section.querySelector(".manifiesto-inset-shadow");
    const parrafo = bloque ? bloque.querySelector("p") : null;

    if (!stage || !bloque || !retrato || !parrafo) return;

    const svg = document.querySelector("#convergencia .convergencia-fila--fill");
    const fullText = parrafo.innerHTML;

    gsap.set(retrato, { autoAlpha: 0, scale: 1.05 });
    if (insetShadow) gsap.set(insetShadow, { autoAlpha: 0 });

    parrafo.innerHTML = "";
    parrafo.style.visibility = "visible";

    let typewriterDone = false;

    function runTypewriter() {
      if (typewriterDone) return;
      typewriterDone = true;

      gsap.to(retrato, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out" });
      if (insetShadow) gsap.to(insetShadow, { autoAlpha: 0.7, duration: 1.5, ease: "power2.inOut" });

      const chars = [];
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = fullText;

      function extractChars(node) {
        if (node.nodeType === 3) {
          for (let i = 0; i < node.textContent.length; i++) {
            chars.push({ type: "char", value: node.textContent[i] });
          }
        } else if (node.nodeType === 1) {
          chars.push({ type: "openTag", value: node.outerHTML.match(/^<[^>]+>/)[0] });
          node.childNodes.forEach(child => extractChars(child));
          chars.push({ type: "closeTag", value: "</" + node.tagName.toLowerCase() + ">" });
        }
      }

      tempDiv.childNodes.forEach(child => extractChars(child));

      let index = 0;
      let html = "";
      const speed = 18;

      function type() {
        if (index >= chars.length) {
          parrafo.querySelectorAll(".manifiesto-highlight").forEach(hl => {
            hl.classList.add("neon-activo");
          });
          return;
        }

        const chunk = chars[index];
        if (chunk.type === "char") {
          html += chunk.value;
        } else {
          html += chunk.value;
        }
        parrafo.innerHTML = html + '<span class="manifiesto-cursor">|</span>';
        index++;

        if (chunk.type === "char") {
          setTimeout(type, speed);
        } else {
          type();
        }
      }

      setTimeout(type, 400);
    }

    ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      once: true,
      onEnter: runTypewriter,
    });

    if (svg) {
      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        onEnter: () => {
          gsap.to(svg, { yPercent: -160, autoAlpha: 0, duration: 1, ease: "back.inOut" });
          svg.classList.add("is-shared-manifiesto");
        },
        onLeaveBack: () => {
          svg.classList.remove("is-shared-manifiesto");
          gsap.set(svg, { clearProps: "transform,opacity,visibility" });
        },
      });
    }

    const glitchLayers = section.querySelector(".manifiesto-glitch-layers");
    if (glitchLayers && window.matchMedia("(max-width: 767px)").matches) {
      ScrollTrigger.create({
        trigger: section,
        start: "top 40%",
        once: true,
        onEnter: () => {
          glitchLayers.classList.add("glitch-flash");
          setTimeout(() => glitchLayers.classList.remove("glitch-flash"), 1200);
        },
      });
    }
  }

  return { init };
})();
