# Implementation Plan: Sección Preguntas Frecuentes

## Overview

Implementación de la sección FAQ con acordeón vertical animado con GSAP para el portfolio de Daniel Velez. Se crean dos archivos nuevos (`css/preguntas.css`, `js/preguntas.js`) y se modifican dos existentes (`index.html`, `js/main.js`). El plan sigue un orden incremental: estructura HTML → estilos CSS → lógica JS → integración.

## Tasks

- [x] 1. Crear estructura HTML y archivo CSS base
  - [x] 1.1 Agregar la sección `.preguntas` en index.html después de la sección `.metodo`
    - Insertar el bloque `<section class="preguntas" id="preguntas" aria-label="Preguntas frecuentes">` con el h2, contenedor, y 6 accordion items con estructura semántica completa (button trigger con aria-expanded, aria-controls, panel con role="region", hidden)
    - Agregar `<link rel="stylesheet" href="css/preguntas.css">` en el `<head>` después de metodo.css
    - Agregar `<script src="js/preguntas.js"></script>` antes de main.js en los scripts al final
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 8.1, 8.3, 8.4_

  - [x] 1.2 Crear `css/preguntas.css` con estilos base desktop y responsive
    - Definir estilos para `.preguntas`, `.preguntas-titulo`, `.preguntas-contenedor`, `.preguntas-item`, `.preguntas-trigger`, `.preguntas-trigger-texto`, `.preguntas-trigger-icono`, `.preguntas-panel`, `.preguntas-panel-contenido`
    - Usar exclusivamente custom properties del sistema de temas (`--color-texto`, `--color-acento`, `--color-fondo`, `--color-texto-suave`, `--color-grid`, `--fuente-display`, `--fuente-parrafo`, `--transicion-tema`)
    - Incluir estado `.preguntas-item--activo` para rotación del icono
    - Incluir hover protegido con `@media (hover: hover) and (pointer: fine)` y `:focus-visible`
    - Incluir los 4 bloques responsive: tablet landscape, tablet portrait, mobile portrait, mobile landscape
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.5, 9.1, 9.2_

- [x] 2. Implementar módulo JavaScript del acordeón
  - [x] 2.1 Crear `js/preguntas.js` con IIFE, estado interno y lógica de toggle exclusivo
    - Estructura IIFE con `Preguntas` exponiendo `init()`
    - Guard clauses para GSAP, ScrollTrigger, sección ausente, cero items
    - Estado interno `itemActivo` (closure)
    - Función `toggleItem()` con comportamiento exclusivo (cerrar activo antes de abrir nuevo)
    - Funciones `abrirItem()` y `cerrarItem()` con GSAP timelines (height auto + opacity stagger)
    - Sincronización de `aria-expanded`, `hidden`, y clase `.preguntas-item--activo`
    - Bind de eventos click y keydown (Enter/Space) en cada trigger
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 6.2, 6.3, 8.2_

  - [x] 2.2 Agregar revelado escalonado con ScrollTrigger y gsap.matchMedia()
    - Función `iniciarReveal()` con detección de `prefers-reduced-motion`
    - Usar `gsap.matchMedia()` para envolver la lógica de reveal
    - Timeline: fade + translateY del título, luego stagger de items
    - ScrollTrigger con `start: 'top 80%'` y `once: true`
    - Sin animación si reduced-motion está activo (gsap.set directo)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.6_

  - [ ]* 2.3 Write property test: Exclusive Accordion Invariant
    - **Property 1: Exclusive Accordion Invariant**
    - Para cualquier secuencia de clicks aleatorios en items, nunca más de uno tiene `aria-expanded="true"` y `.preguntas-item--activo`
    - **Validates: Requirements 3.2, 3.4**

  - [ ]* 2.4 Write property test: Toggle Open/Close Behavior
    - **Property 2: Toggle Open Behavior**
    - Para cualquier item cerrado, un click produce estado abierto (aria-expanded="true", hidden removido)
    - **Property 3: Toggle Close Behavior**
    - Para cualquier item abierto, un click produce estado cerrado (aria-expanded="false", hidden añadido)
    - **Validates: Requirements 3.1, 3.3**

  - [ ]* 2.5 Write property test: ARIA State Synchronization
    - **Property 4: ARIA State Synchronization**
    - Después de cualquier interacción, aria-expanded siempre refleja el estado visual (.preguntas-item--activo)
    - **Validates: Requirements 8.3**

  - [ ]* 2.6 Write property test: Keyboard-Click Parity
    - **Property 5: Keyboard-Click Parity**
    - Para cualquier item, Enter/Space produce el mismo estado resultante que click
    - **Validates: Requirements 8.2**

  - [ ]* 2.7 Write property test: ARIA Structure Validity
    - **Property 6: ARIA Structure Validity**
    - Para cualquier item, aria-controls apunta a un id válido en el DOM que es el .preguntas-panel hijo del mismo item
    - **Validates: Requirements 8.1, 8.4**

- [x] 3. Checkpoint - Verificación intermedia
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Integración y cableado final
  - [x] 4.1 Agregar `Preguntas.init()` en `js/main.js`
    - Insertar bloque `if (typeof Preguntas !== 'undefined') { Preguntas.init(); }` después de `Metodo.init()` y antes de `Nav.init()`
    - _Requirements: 6.2_

  - [x] 4.2 Verificar compatibilidad con sistema de temas
    - Confirmar que los 6 temas (neutro, acid, synthwave, rave, collage, holographic) transicionan correctamente los colores de la sección
    - Verificar que `--transicion-tema` se aplica en todos los elementos con `transition: color`
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 4.3 Write integration tests
    - Verificar que ScrollTrigger dispara reveal al 80% viewport
    - Verificar responsive en cada breakpoint
    - Verificar cambio de tema transiciona colores correctamente
    - _Requirements: 5.3, 7.1–7.6, 9.2_

- [x] 5. Checkpoint final
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses vanilla HTML/CSS/JS with local GSAP — no build tools or bundlers
- All class names and comments must be in Spanish following project conventions
- All CSS must include the 5 breakpoints (desktop base + 4 responsive) per steering rules

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7"] },
    { "id": 4, "tasks": ["4.1", "4.2"] },
    { "id": 5, "tasks": ["4.3"] }
  ]
}
```
