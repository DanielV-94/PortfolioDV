# Requirements Document

## Introduction

Sección de preguntas frecuentes (FAQ) para el portfolio creativo de Daniel Velez. Se presenta como un acordeón vertical minimalista ubicado después de la sección `.metodo` en `index.html`. Utiliza animaciones GSAP para apertura/cierre suave y revelado escalonado al hacer scroll. La sección respeta el sistema de temas existente (`[data-tema]`) y la grilla de fondo del proyecto.

## Glossary

- **Seccion_Preguntas**: Sección HTML (`<section>`) que contiene el conjunto de preguntas frecuentes en formato acordeón vertical
- **Acordeon_Item**: Cada elemento individual del acordeón compuesto por una pregunta (trigger) y una respuesta (contenido expandible)
- **Panel_Respuesta**: Contenedor de la respuesta dentro de un Acordeon_Item que se expande o colapsa con animación
- **GSAP_Modulo_Preguntas**: Módulo JavaScript IIFE (`js/preguntas.js`) que controla las animaciones y la interacción del acordeón
- **CSS_Preguntas**: Archivo de estilos (`css/preguntas.css`) que define la presentación visual de la Seccion_Preguntas
- **ScrollTrigger_Reveal**: Animación de revelado escalonado que se activa cuando la Seccion_Preguntas entra en el viewport mediante GSAP ScrollTrigger
- **Comportamiento_Exclusivo**: Lógica que permite tener máximo un Acordeon_Item abierto simultáneamente, cerrando el anterior al abrir uno nuevo

## Requirements

### Requirement 1: Estructura HTML de la sección

**User Story:** As a visitante del portfolio, I want ver una sección de preguntas frecuentes bien estructurada, so that puedo encontrar respuestas a mis dudas sobre los servicios de Daniel.

#### Acceptance Criteria

1. THE Seccion_Preguntas SHALL renderizarse como un elemento `<section>` con clase `.preguntas` e id `preguntas` ubicado inmediatamente después de la sección `.metodo` en `index.html`
2. THE Seccion_Preguntas SHALL contener un encabezado `<h2>` con la fuente `var(--fuente-display)` y un contenedor para los Acordeon_Items
3. THE Seccion_Preguntas SHALL incluir un atributo `aria-label` descriptivo para accesibilidad
4. WHEN la Seccion_Preguntas se renderiza, THE Seccion_Preguntas SHALL mostrar entre 5 y 8 Acordeon_Items con preguntas traducidas al español relacionadas con servicios de desarrollo web creativo

### Requirement 2: Diseño visual minimalista del acordeón

**User Story:** As a visitante del portfolio, I want que el diseño del acordeón sea limpio y minimalista con preguntas grandes, so that la lectura sea cómoda y el estilo sea coherente con el portfolio premium.

#### Acceptance Criteria

1. THE CSS_Preguntas SHALL definir las preguntas del Acordeon_Item con tipografía grande usando `var(--fuente-display)` y las respuestas con `var(--fuente-parrafo)`
2. THE CSS_Preguntas SHALL aplicar colores exclusivamente mediante las custom properties del sistema de temas (`--color-texto`, `--color-acento`, `--color-fondo`)
3. THE CSS_Preguntas SHALL utilizar la grilla de fondo existente del proyecto como fondo de la sección (background transparente para heredar la grilla del body)
4. THE CSS_Preguntas SHALL incluir un indicador visual (icono o símbolo) en cada Acordeon_Item que comunique su estado abierto o cerrado
5. THE CSS_Preguntas SHALL aplicar transiciones de color con `var(--transicion-tema)` para mantener coherencia durante cambios de tema

### Requirement 3: Comportamiento exclusivo del acordeón

**User Story:** As a visitante del portfolio, I want que solo una pregunta esté abierta a la vez, so that la interfaz permanezca ordenada y pueda concentrarme en una respuesta.

#### Acceptance Criteria

1. WHEN un usuario hace clic en un Acordeon_Item cerrado, THE GSAP_Modulo_Preguntas SHALL abrir el Panel_Respuesta de ese item con animación suave
2. WHEN un usuario hace clic en un Acordeon_Item cerrado y existe otro Acordeon_Item abierto, THE GSAP_Modulo_Preguntas SHALL cerrar el Acordeon_Item previamente abierto antes de abrir el nuevo
3. WHEN un usuario hace clic en un Acordeon_Item que ya está abierto, THE GSAP_Modulo_Preguntas SHALL cerrar ese Panel_Respuesta con animación suave
4. THE GSAP_Modulo_Preguntas SHALL renderizar todos los Acordeon_Items en estado cerrado al cargar la página

### Requirement 4: Animación de apertura y cierre con GSAP

**User Story:** As a visitante del portfolio, I want que la apertura y cierre del acordeón sea fluida y animada, so that la experiencia se sienta premium y cinematográfica.

#### Acceptance Criteria

1. WHEN un Panel_Respuesta se abre, THE GSAP_Modulo_Preguntas SHALL animar la altura del panel desde 0 hasta su altura natural con una duración entre 0.4s y 0.6s usando una curva ease-out
2. WHEN un Panel_Respuesta se abre, THE GSAP_Modulo_Preguntas SHALL animar la opacidad del contenido de 0 a 1 con un ligero retraso respecto a la animación de altura
3. WHEN un Panel_Respuesta se cierra, THE GSAP_Modulo_Preguntas SHALL animar la opacidad del contenido a 0 y luego reducir la altura a 0 con una curva ease-in
4. THE GSAP_Modulo_Preguntas SHALL animar el indicador de estado (rotación o transformación) del Acordeon_Item al abrir y cerrar

### Requirement 5: Revelado escalonado con ScrollTrigger

**User Story:** As a visitante del portfolio, I want que las preguntas aparezcan de forma escalonada al hacer scroll, so that la experiencia de descubrimiento sea progresiva y atractiva.

#### Acceptance Criteria

1. WHEN la Seccion_Preguntas entra en el viewport, THE ScrollTrigger_Reveal SHALL animar el encabezado de la sección con una animación de entrada (fade + translate desde abajo)
2. WHEN la Seccion_Preguntas entra en el viewport, THE ScrollTrigger_Reveal SHALL animar cada Acordeon_Item con un efecto stagger (entrada secuencial con retraso entre cada item)
3. THE ScrollTrigger_Reveal SHALL iniciar las animaciones cuando la Seccion_Preguntas alcance el 80% inferior del viewport
4. WHILE el usuario tiene activada la preferencia `prefers-reduced-motion: reduce`, THE GSAP_Modulo_Preguntas SHALL mostrar todos los elementos sin animación de revelado

### Requirement 6: Arquitectura de archivos y módulo IIFE

**User Story:** As a desarrollador, I want que la sección siga la arquitectura existente del proyecto, so that el código sea mantenible y consistente.

#### Acceptance Criteria

1. THE CSS_Preguntas SHALL existir como archivo independiente en `css/preguntas.css` siguiendo la convención de un archivo CSS por sección
2. THE GSAP_Modulo_Preguntas SHALL existir como archivo independiente en `js/preguntas.js` estructurado como módulo IIFE que expone una función `init()`
3. THE GSAP_Modulo_Preguntas SHALL registrar los plugins GSAP necesarios (ScrollTrigger) al inicio del módulo
4. THE CSS_Preguntas SHALL incluir nombres de clases y comentarios en español siguiendo la convención BEM-like del proyecto

### Requirement 7: Diseño responsive en 5 breakpoints

**User Story:** As a visitante en cualquier dispositivo, I want que la sección de preguntas se adapte correctamente a mi pantalla, so that la experiencia sea óptima sin importar el dispositivo.

#### Acceptance Criteria

1. THE CSS_Preguntas SHALL definir estilos base para desktop (sin media query) como punto de partida
2. THE CSS_Preguntas SHALL incluir un bloque `@media (max-width: 1024px) and (orientation: landscape)` para tablet landscape
3. THE CSS_Preguntas SHALL incluir un bloque `@media (max-width: 1024px) and (orientation: portrait)` para tablet portrait
4. THE CSS_Preguntas SHALL incluir un bloque `@media (max-width: 599px)` para mobile portrait con tamaños de tipografía reducidos proporcionalmente
5. THE CSS_Preguntas SHALL incluir un bloque `@media (max-width: 768px) and (orientation: landscape)` para mobile landscape
6. THE GSAP_Modulo_Preguntas SHALL utilizar `gsap.matchMedia()` para adaptar parámetros de animación según cada breakpoint

### Requirement 8: Accesibilidad del acordeón

**User Story:** As a visitante que utiliza tecnología asistiva, I want que el acordeón sea navegable con teclado y anuncie su estado, so that puedo acceder al contenido sin ratón.

#### Acceptance Criteria

1. THE Seccion_Preguntas SHALL asignar `role="button"` y `tabindex="0"` al elemento trigger de cada Acordeon_Item para que sea activable con teclado
2. WHEN un usuario presiona Enter o Espacio sobre un Acordeon_Item enfocado, THE GSAP_Modulo_Preguntas SHALL activar la misma lógica de apertura/cierre que el clic
3. THE Seccion_Preguntas SHALL utilizar atributos `aria-expanded` (true/false) en cada trigger para comunicar el estado del Acordeon_Item a lectores de pantalla
4. THE Seccion_Preguntas SHALL utilizar `aria-controls` en cada trigger apuntando al id del Panel_Respuesta correspondiente
5. THE CSS_Preguntas SHALL proteger estilos `:hover` con `@media (hover: hover) and (pointer: fine)` y proveer `:focus-visible` como alternativa accesible

### Requirement 9: Integración con sistema de temas

**User Story:** As a visitante que cambia de tema, I want que la sección de preguntas se adapte visualmente al tema activo, so that la experiencia visual sea unificada en todo el sitio.

#### Acceptance Criteria

1. THE CSS_Preguntas SHALL utilizar exclusivamente custom properties de `variables.css` para colores (`--color-texto`, `--color-acento`, `--color-fondo`, `--color-texto-suave`, `--color-grid`)
2. WHEN el atributo `[data-tema]` cambia en el documento, THE CSS_Preguntas SHALL transicionar todos los colores de la Seccion_Preguntas usando `var(--transicion-tema)`
3. THE CSS_Preguntas SHALL mantener legibilidad y contraste adecuado en los 6 temas existentes (neutro, acid, synthwave, rave, collage, holographic)
