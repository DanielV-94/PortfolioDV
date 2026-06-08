# Design Document

## Overview

Sección de preguntas frecuentes (FAQ) para el portfolio creativo de Daniel Velez. Acordeón vertical minimalista con comportamiento exclusivo (un item abierto a la vez), animaciones GSAP para apertura/cierre (slide + fade), revelado escalonado via ScrollTrigger, soporte completo del sistema de 6 temas, y responsive en 5 breakpoints.

## Architecture

La sección de preguntas frecuentes (`.preguntas`) sigue la arquitectura existente del proyecto: un archivo CSS independiente (`css/preguntas.css`) y un módulo IIFE en JavaScript (`js/preguntas.js`). La sección se inserta en `index.html` inmediatamente después de la sección `.metodo` y antes de los scripts GSAP.

El módulo JS controla dos sistemas de animación:
1. **ScrollTrigger Reveal** — revelado escalonado al entrar en viewport
2. **Accordion Engine** — apertura/cierre exclusivo con animaciones slide + fade

```
index.html
├── <section class="preguntas">  ← HTML semántico con ARIA
│
css/preguntas.css                ← Estilos visuales + responsive (5 breakpoints)
│
js/preguntas.js                  ← IIFE: Preguntas.init()
│   ├── ScrollTrigger reveal (stagger)
│   └── Accordion engine (exclusivo, GSAP timelines)
│
main.js → Preguntas.init()       ← Orquestación
```

---

## Components and Interfaces

### Components

### 1. HTML Structure (index.html)

```html
<!-- Inmediatamente después de </section> de .metodo -->
<section class="preguntas" id="preguntas" aria-label="Preguntas frecuentes">

  <h2 class="preguntas-titulo">Preguntas Frecuentes</h2>

  <div class="preguntas-contenedor">

    <!-- Acordeon Item (×5–8) -->
    <div class="preguntas-item" data-pregunta="1">
      <button class="preguntas-trigger"
              role="button"
              tabindex="0"
              aria-expanded="false"
              aria-controls="preguntas-panel-1">
        <span class="preguntas-trigger-texto">¿Pregunta aquí?</span>
        <span class="preguntas-trigger-icono" aria-hidden="true">+</span>
      </button>
      <div class="preguntas-panel"
           id="preguntas-panel-1"
           role="region"
           aria-labelledby="preguntas-trigger-1"
           hidden>
        <div class="preguntas-panel-contenido">
          <p>Respuesta aquí.</p>
        </div>
      </div>
    </div>

    <!-- ... más items ... -->
  </div>

</section>
```

**Decisiones clave:**
- Se usa `<button>` como trigger (nativo de teclado, no necesita `role="button"` extra pero se incluye por consistencia con el requisito).
- `hidden` en el panel como estado inicial (accesible + no visible).
- `aria-expanded` en el trigger se sincroniza con el estado JS.
- `aria-controls` conecta trigger con panel via id único.

### 2. CSS Module (`css/preguntas.css`)

```css
/* ═══════════════════════════════════════════════════════════════
   PREGUNTAS — Sección FAQ con acordeón vertical
   Animaciones controladas por GSAP (preguntas.js)
═══════════════════════════════════════════════════════════════ */

/* ── Base: estructura de la sección ── */
.preguntas {
  position: relative;
  z-index: 5;
  width: 100%;
  padding: 8rem 4rem;
  background: transparent; /* Hereda grilla del body */
}

.preguntas-titulo {
  font-family: var(--fuente-display);
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  color: var(--color-texto);
  margin-bottom: 4rem;
  text-align: center;
  transition: color var(--transicion-tema);
}

/* ── Contenedor del acordeón ── */
.preguntas-contenedor {
  max-width: 900px;
  margin: 0 auto;
}

/* ── Item individual ── */
.preguntas-item {
  border-bottom: 1px solid var(--color-grid);
  transition: border-color var(--transicion-tema);
}

/* ── Trigger (botón clickeable) ── */
.preguntas-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.8rem 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: var(--color-texto);
  transition: color var(--transicion-tema);
}

.preguntas-trigger-texto {
  font-family: var(--fuente-display);
  font-size: clamp(1.2rem, 2.5vw, 1.8rem);
  line-height: 1.3;
}

.preguntas-trigger-icono {
  font-family: var(--fuente-display);
  font-size: 1.8rem;
  color: var(--color-acento);
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    color var(--transicion-tema);
  flex-shrink: 0;
  margin-left: 1rem;
}

/* Estado activo del icono (rotado por JS via clase) */
.preguntas-item--activo .preguntas-trigger-icono {
  transform: rotate(45deg);
}

/* ── Panel de respuesta ── */
.preguntas-panel {
  overflow: hidden;
  height: 0;
}

.preguntas-panel-contenido {
  padding: 0 0 2rem 0;
  opacity: 0;
}

.preguntas-panel-contenido p {
  font-family: var(--fuente-parrafo);
  font-size: clamp(0.95rem, 1.5vw, 1.1rem);
  line-height: 1.7;
  color: var(--color-texto-suave);
  transition: color var(--transicion-tema);
}

/* ── Hover protegido ── */
@media (hover: hover) and (pointer: fine) {
  .preguntas-trigger:hover .preguntas-trigger-texto {
    color: var(--color-acento);
  }
}

/* ── Focus visible ── */
.preguntas-trigger:focus-visible {
  outline: 2px solid var(--color-acento);
  outline-offset: 4px;
  border-radius: 4px;
}
```

**Responsive (5 breakpoints):**

```css
/* ── Tablet landscape ── */
@media (max-width: 1024px) and (orientation: landscape) {
  .preguntas { padding: 6rem 3rem; }
  .preguntas-contenedor { max-width: 800px; }
}

/* ── Tablet portrait ── */
@media (max-width: 1024px) and (orientation: portrait) {
  .preguntas { padding: 6rem 2.5rem; }
  .preguntas-contenedor { max-width: 100%; }
  .preguntas-titulo { margin-bottom: 3rem; }
}

/* ── Mobile portrait ── */
@media (max-width: 599px) {
  .preguntas { padding: 4rem 1.5rem; }
  .preguntas-trigger { padding: 1.4rem 0; }
  .preguntas-trigger-icono { font-size: 1.4rem; }
  .preguntas-titulo { margin-bottom: 2.5rem; }
}

/* ── Mobile landscape ── */
@media (max-width: 768px) and (orientation: landscape) {
  .preguntas { padding: 4rem 2rem; }
  .preguntas-contenedor { max-width: 700px; }
}
```

### 3. JavaScript Module (`js/preguntas.js`)

```javascript
/* ═══════════════════════════════════════════════════════════════
   PREGUNTAS — Acordeón FAQ con GSAP
   Comportamiento exclusivo, revelado ScrollTrigger, accesibilidad
═══════════════════════════════════════════════════════════════ */

const Preguntas = (() => {
  /* ── Estado interno ── */
  let itemActivo = null; // referencia al item actualmente abierto

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const seccion = document.querySelector('.preguntas');
    if (!seccion) return;

    const items = gsap.utils.toArray('.preguntas-item');
    if (!items.length) return;

    /* ── Registrar ScrollTrigger ── */
    gsap.registerPlugin(ScrollTrigger);

    /* ── Estado inicial: todos cerrados ── */
    items.forEach(item => {
      const panel = item.querySelector('.preguntas-panel');
      const contenido = item.querySelector('.preguntas-panel-contenido');
      gsap.set(panel, { height: 0 });
      gsap.set(contenido, { opacity: 0 });
      item.querySelector('.preguntas-trigger').setAttribute('aria-expanded', 'false');
      panel.setAttribute('hidden', '');
    });

    /* ── Bind de eventos ── */
    items.forEach(item => {
      const trigger = item.querySelector('.preguntas-trigger');
      trigger.addEventListener('click', () => toggleItem(item, items));
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleItem(item, items);
        }
      });
    });

    /* ── ScrollTrigger Reveal ── */
    iniciarReveal(seccion, items);
  }

  /* ── Toggle: abrir/cerrar un item ── */
  function toggleItem(item, items) {
    const estaAbierto = item === itemActivo;

    if (estaAbierto) {
      cerrarItem(item);
      itemActivo = null;
    } else {
      // Cerrar el activo actual (comportamiento exclusivo)
      if (itemActivo) {
        cerrarItem(itemActivo);
      }
      abrirItem(item);
      itemActivo = item;
    }
  }

  /* ── Abrir un item con GSAP timeline ── */
  function abrirItem(item) {
    const panel = item.querySelector('.preguntas-panel');
    const contenido = item.querySelector('.preguntas-panel-contenido');
    const trigger = item.querySelector('.preguntas-trigger');

    // Actualizar ARIA y estado
    panel.removeAttribute('hidden');
    trigger.setAttribute('aria-expanded', 'true');
    item.classList.add('preguntas-item--activo');

    // Animación: altura + opacidad escalonada
    const tl = gsap.timeline();
    tl.to(panel, {
      height: 'auto',
      duration: 0.5,
      ease: 'power2.out'
    })
    .to(contenido, {
      opacity: 1,
      duration: 0.3,
      ease: 'power1.out'
    }, '-=0.2'); // ligero solapamiento
  }

  /* ── Cerrar un item con GSAP timeline ── */
  function cerrarItem(item) {
    const panel = item.querySelector('.preguntas-panel');
    const contenido = item.querySelector('.preguntas-panel-contenido');
    const trigger = item.querySelector('.preguntas-trigger');

    // Actualizar ARIA y estado
    trigger.setAttribute('aria-expanded', 'false');
    item.classList.remove('preguntas-item--activo');

    // Animación inversa: opacidad primero, luego altura
    const tl = gsap.timeline({
      onComplete: () => {
        panel.setAttribute('hidden', '');
      }
    });
    tl.to(contenido, {
      opacity: 0,
      duration: 0.2,
      ease: 'power1.in'
    })
    .to(panel, {
      height: 0,
      duration: 0.4,
      ease: 'power2.in'
    }, '-=0.1');
  }

  /* ── Revelado escalonado con ScrollTrigger ── */
  function iniciarReveal(seccion, items) {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReduced) {
      // Sin animación: mostrar todo directamente
      gsap.set('.preguntas-titulo', { opacity: 1, y: 0 });
      items.forEach(i => gsap.set(i, { opacity: 1, y: 0 }));
      return;
    }

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Estado inicial para reveal
      gsap.set('.preguntas-titulo', { opacity: 0, y: 40 });
      items.forEach(i => gsap.set(i, { opacity: 0, y: 30 }));

      // Timeline de revelado
      const tlReveal = gsap.timeline({
        scrollTrigger: {
          trigger: seccion,
          start: 'top 80%',
          once: true
        }
      });

      tlReveal.to('.preguntas-titulo', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out'
      })
      .to(items, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.1
      }, '-=0.3');
    });
  }

  return { init };
})();
```

---

### Interfaces

### API Pública del Módulo

```javascript
// Preguntas expone únicamente init()
Preguntas.init() → void
```

### Integración en main.js

```javascript
// Agregar después de Metodo.init()
if (typeof Preguntas !== 'undefined') {
  Preguntas.init();
}
```

### HTML Script Tag

```html
<!-- Agregar antes de main.js -->
<script src="js/preguntas.js"></script>
```

### CSS Link Tag

```html
<!-- Agregar en <head> después de metodo.css -->
<link rel="stylesheet" href="css/preguntas.css">
```

---

## Data Models

### Estado del Acordeón

```javascript
// Estado interno del módulo (closure del IIFE)
{
  itemActivo: HTMLElement | null  // Referencia al .preguntas-item abierto
}
```

### Estructura DOM por Item

```
.preguntas-item [data-pregunta="N"]
├── button.preguntas-trigger
│   ├── [aria-expanded="true|false"]
│   ├── [aria-controls="preguntas-panel-N"]
│   ├── span.preguntas-trigger-texto
│   └── span.preguntas-trigger-icono (aria-hidden)
└── div.preguntas-panel [id="preguntas-panel-N"] [role="region"] [hidden?]
    └── div.preguntas-panel-contenido
        └── p (texto respuesta)
```

### Invariantes de Estado

| Estado | `aria-expanded` | `.preguntas-item--activo` | `hidden` en panel | `height` panel |
|--------|-----------------|---------------------------|-------------------|----------------|
| Cerrado | `"false"` | ausente | presente | `0` |
| Abierto | `"true"` | presente | ausente | `auto` |

---

## Error Handling

| Escenario | Manejo |
|-----------|--------|
| GSAP no cargado | `init()` retorna silenciosamente (guard clause) |
| ScrollTrigger no disponible | `init()` retorna silenciosamente |
| Sección `.preguntas` ausente del DOM | `init()` retorna silenciosamente |
| Cero `.preguntas-item` encontrados | `init()` retorna silenciosamente |
| Panel sin contenido | GSAP anima a `height: auto` que será 0 — sin error |
| Click rápido durante animación | GSAP gestiona tweens en progreso (overwrite default) |
| `prefers-reduced-motion: reduce` | Elementos visibles sin animación de reveal |

---

## Testing Strategy

### Unit Tests (Example-Based)
- Verificar que la sección `.preguntas` existe en el DOM con la estructura correcta (h2, contenedor, items)
- Verificar que todos los items inician cerrados al cargar
- Verificar que `prefers-reduced-motion: reduce` muestra elementos sin animación
- Verificar que el módulo `Preguntas` expone `init()` como función

### Property Tests (100+ iteraciones)
- **Exclusive invariant**: Para cualquier secuencia de clicks aleatorios en items, nunca más de uno está abierto
- **Toggle**: Para cualquier item en cualquier estado, un click produce el estado opuesto
- **ARIA sync**: Para cualquier interacción, aria-expanded siempre refleja el estado visual
- **Keyboard parity**: Para cualquier item, Enter/Space produce el mismo resultado que click
- **ARIA structure**: Para cualquier item, aria-controls apunta a un id válido en el DOM

### Integration Tests
- Verificar que ScrollTrigger dispara el reveal al alcanzar 80% del viewport
- Verificar que cambio de tema transiciona colores correctamente
- Verificar responsive en cada breakpoint

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Exclusive Accordion Invariant

*For any* set of accordion items rendered in the section, at most one item SHALL have `aria-expanded="true"` and the class `.preguntas-item--activo` at any point in time after any sequence of toggle interactions.

**Validates: Requirements 3.2, 3.4**

### Property 2: Toggle Open Behavior

*For any* accordion item that is currently closed (aria-expanded="false"), when a click event is dispatched on its trigger, the item SHALL transition to the open state (aria-expanded="true", panel `hidden` attribute removed).

**Validates: Requirements 3.1**

### Property 3: Toggle Close Behavior

*For any* accordion item that is currently open (aria-expanded="true"), when a click event is dispatched on its trigger, the item SHALL transition to the closed state (aria-expanded="false", panel receives `hidden` attribute after animation completes).

**Validates: Requirements 3.3**

### Property 4: ARIA State Synchronization

*For any* accordion item, after any toggle interaction (click or keyboard), the value of `aria-expanded` on its trigger SHALL match the visual open/closed state of the item: "true" if and only if the item has the class `.preguntas-item--activo`.

**Validates: Requirements 8.3**

### Property 5: Keyboard-Click Parity

*For any* accordion item in any state (open or closed), dispatching a `keydown` event with key "Enter" or " " (Space) on the trigger SHALL produce the same resulting state as dispatching a `click` event on the same trigger.

**Validates: Requirements 8.2**

### Property 6: ARIA Structure Validity

*For any* accordion item, the trigger element SHALL have `aria-controls` pointing to an existing element id in the DOM, and that element SHALL be the `.preguntas-panel` child of the same item.

**Validates: Requirements 8.1, 8.4**
