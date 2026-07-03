const Contacto = (() => {
  function init() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);
    if (typeof ScrambleTextPlugin !== 'undefined') gsap.registerPlugin(ScrambleTextPlugin);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const heroEtiqueta = document.querySelector('.contacto-hero-etiqueta');
    const heroLineas = document.querySelectorAll('.contacto-hero-titulo .linea-inner');
    const heroSub = document.querySelector('.contacto-hero-sub');
    const scrollIndicador = document.querySelector('.contacto-scroll-indicador');
    const heroParticulas = document.getElementById('contactoParticulas');

    if (prefersReduced) {
      if (heroEtiqueta) heroEtiqueta.style.opacity = '1';
      heroLineas.forEach(l => l.style.transform = 'translateY(0)');
      if (heroSub) heroSub.style.opacity = '1';
      if (scrollIndicador) scrollIndicador.style.opacity = '1';
    } else {
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .to(heroEtiqueta, { opacity: 1, duration: 1, delay: 0.3 })
        .to(heroLineas, { y: 0, duration: 1.2, stagger: 0.15 }, '-=0.6')
        .to(heroSub, { opacity: 0.7, duration: 1 }, '-=0.7')
        .to(scrollIndicador, { opacity: 1, duration: 1 }, '-=0.5');

      ScrollTrigger.create({
        start: 'top top',
        end: '200px top',
        onUpdate: (self) => {
          if (self.progress > 0.3) gsap.to(scrollIndicador, { opacity: 0, duration: 0.3 });
        }
      });

      const globalParticulas = document.getElementById('contactoParticulasGlobal');
      if (globalParticulas) {
        const numParticulas = 90;
        const coloresNeon = [
          'var(--color-acento)',
          'var(--manifiesto-neon-color1, var(--color-acento))',
          'var(--manifiesto-neon-color2, var(--color-acento))',
          'var(--manifiesto-neon-color3, var(--color-texto-suave))',
          'var(--color-acento-hover)',
          'var(--manifiesto-neon-color4, var(--color-acento))'
        ];

        const particulasData = [];

        for (let i = 0; i < numParticulas; i++) {
          const particula = document.createElement('div');
          particula.className = 'particula-global';
          const size = gsap.utils.random(3, 12);
          const color = coloresNeon[i % coloresNeon.length];
          particula.style.width = size + 'px';
          particula.style.height = size + 'px';
          particula.style.background = color;
          particula.style.boxShadow = `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}, 0 0 ${size * 3.5}px ${color}`;
          const x = gsap.utils.random(2, 98);
          const y = gsap.utils.random(2, 98);
          particula.style.left = x + '%';
          particula.style.top = y + '%';
          particula.style.opacity = '0';
          globalParticulas.appendChild(particula);
          particulasData.push({ el: particula, baseX: x, baseY: y, size: size });
        }

        const allParticulas = globalParticulas.querySelectorAll('.particula-global');

        allParticulas.forEach((p) => {
          gsap.to(p, {
            y: gsap.utils.random(-80, -180),
            x: gsap.utils.random(-30, 30),
            opacity: gsap.utils.random(0.4, 0.9),
            duration: gsap.utils.random(5, 10),
            delay: gsap.utils.random(0, 3),
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        });

        const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (isDesktop) {
          let mouseX = window.innerWidth / 2;
          let mouseY = window.innerHeight / 2;

          document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
          });

          function animarRepulsion() {
            particulasData.forEach((data) => {
              const rect = data.el.getBoundingClientRect();
              const px = rect.left + rect.width / 2;
              const py = rect.top + rect.height / 2;
              const dx = px - mouseX;
              const dy = py - mouseY;
              const distancia = Math.sqrt(dx * dx + dy * dy);
              const radio = 250;

              if (distancia < radio) {
                const fuerza = (1 - distancia / radio) * 120;
                const angulo = Math.atan2(dy, dx);
                const empujeX = Math.cos(angulo) * fuerza;
                const empujeY = Math.sin(angulo) * fuerza;
                gsap.to(data.el, {
                  x: empujeX,
                  y: empujeY,
                  scale: 1.5,
                  duration: 0.3,
                  ease: 'power2.out',
                  overwrite: 'auto'
                });
              } else {
                gsap.to(data.el, {
                  scale: 1,
                  duration: 1.5,
                  ease: 'elastic.out(1, 0.4)',
                  overwrite: 'auto'
                });
              }
            });
            requestAnimationFrame(animarRepulsion);
          }
          animarRepulsion();
        }
      }

      if (heroParticulas) {
        const numHero = 30;
        const coloresHero = [
          'var(--color-acento)',
          'var(--manifiesto-neon-color1, var(--color-acento))',
          'var(--manifiesto-neon-color2, var(--color-acento))'
        ];

        for (let i = 0; i < numHero; i++) {
          const particula = document.createElement('div');
          particula.className = 'contacto-hero-particula';
          const size = gsap.utils.random(5, 16);
          const color = coloresHero[i % coloresHero.length];
          particula.style.width = size + 'px';
          particula.style.height = size + 'px';
          particula.style.background = color;
          particula.style.boxShadow = `0 0 ${size}px ${color}, 0 0 ${size * 2.5}px ${color}, 0 0 ${size * 4}px ${color}`;
          particula.style.left = gsap.utils.random(2, 98) + '%';
          particula.style.top = gsap.utils.random(5, 95) + '%';
          heroParticulas.appendChild(particula);
        }

        const particulas = heroParticulas.querySelectorAll('.contacto-hero-particula');
        particulas.forEach((p) => {
          gsap.to(p, {
            y: gsap.utils.random(-100, -250),
            x: gsap.utils.random(-40, 40),
            opacity: gsap.utils.random(0.5, 1),
            duration: gsap.utils.random(4, 9),
            delay: gsap.utils.random(0, 3),
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        });
      }
    }

    if (!prefersReduced) {
      const manifiestoSection = document.getElementById('contactoManifiesto');
      const manifiestoParrafos = manifiestoSection ?
        manifiestoSection.querySelectorAll('.contacto-manifiesto-contenido p') : [];

      if (manifiestoSection && manifiestoParrafos.length) {
        gsap.set(manifiestoParrafos, { opacity: 0, y: 40 });

        gsap.to(manifiestoParrafos, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: manifiestoSection,
            start: 'top 75%',
            end: 'bottom 50%',
            scrub: 1
          }
        });
      }

      const cierreSection = document.getElementById('contactoCierre');
      const cierreTexto = document.getElementById('contactoCierreTexto');
      const cierreGlow = document.getElementById('contactoCierreGlow');

      if (cierreSection && cierreTexto) {
        if (typeof SplitText !== 'undefined') {
          const split = new SplitText(cierreTexto, { type: 'chars,words' });
          gsap.set(split.chars, { opacity: 0, y: 60, rotateX: -40 });

          const cierreTl = gsap.timeline({
            scrollTrigger: {
              trigger: cierreSection,
              start: 'top 70%',
              end: 'center 40%',
              scrub: 1
            }
          });

          cierreTl.to(split.chars, {
            opacity: 1, y: 0, rotateX: 0,
            stagger: 0.02, ease: 'power3.out'
          });

          if (cierreGlow) {
            cierreTl.to(cierreGlow, {
              opacity: 0.15, scale: 1, duration: 1, ease: 'power2.out'
            }, 0.3);
          }
        } else {
          gsap.fromTo(cierreTexto,
            { opacity: 0, y: 60 },
            {
              opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
              scrollTrigger: { trigger: cierreSection, start: 'top 70%', toggleActions: 'play none none reverse' }
            }
          );
        }
      }
       
      const linksSection = document.getElementById('contactoLinks');
      const linksTitulo = linksSection ? linksSection.querySelector('.contacto-links-titulo') : null;
      const linksCards = linksSection ? linksSection.querySelectorAll('.contacto-link-card') : [];

      if (linksSection && linksCards.length) {
        if (linksTitulo) {
          gsap.to(linksTitulo, {
            opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: linksSection, start: 'top 85%', toggleActions: 'play none none reverse' }
          });
        }

        gsap.to(linksCards, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: linksSection,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        });
      }
    }
  }

  return { init };
})();
