# Bitácora de desarrollo — Portfolio Daniel Vélez

> Este archivo concentra el contexto del proyecto por día: qué se construyó, qué se cambió, decisiones tomadas, pendientes y preferencias de trabajo.

## Cómo usar esta bitácora

- Al cierre de cada jornada, agregar una nueva entrada con fecha.
- Registrar cambios funcionales, visuales y técnicos.
- Anotar decisiones de diseño/UX para mantener consistencia.
- Actualizar preferencias de trabajo cuando cambien.

---

## Preferencias de trabajo (acumuladas)

### Estilo y colaboración

- Prefieres trabajar en iteraciones cortas, visuales y muy precisas.
- Te gusta validar cada ajuste en UI (alineación, proporciones, tipografías, hover, ritmo visual).
- Buscas un resultado profesional/premium con identidad personal.
- Prefieres comunicación directa, con foco en ejecutar cambios sin rodeos.

### Dirección de diseño

- Menú fullscreen con estética editorial/awwwards, fuerte presencia tipográfica.
- Hover con marquee dinámico y detalles gráficos personalizados (`menu.svg`).
- Microajustes ópticos (centrado vertical real, espaciado arriba/abajo equilibrado, tamaño exacto de iconos).
- Evitar estilos genéricos; mantener carácter original del proyecto.

### Interacción/cursor

- Durante intro, máxima atención a la animación (sin distracciones de cursor).
- En desktop, prioridad a mostrar solo cursor personalizado cuando corresponda.

---

## Entrada diaria

### Regla de breakpoints — obligatoria en todo código nuevo

> **Instrucción permanente (desde 2026-05-15):**
> Todo bloque de CSS o componente nuevo debe incluir **siempre** media queries para los 4 breakpoints siguientes, en este orden y con estos rangos:

```css
/* ── Desktop (base, sin @media) ── */

/* ── Tablet landscape (769px – 1024px) ── */
@media (max-width: 1024px) and (min-width: 769px) {
}

/* ── Tablet portrait (481px – 768px) ── */
@media (max-width: 768px) and (min-width: 481px) {
}

/* ── Móvil grande / portrait (≤ 480px) ── */
@media (max-width: 480px) {
}
```

> Aplica tanto a CSS puro como a `gsap.matchMedia()` en JS.
> Para JS, usar los rangos equivalentes como strings de media query en `mm.add()`.
> Si un breakpoint no requiere cambios, dejar el bloque vacío con comentario `/* sin cambios */`.

---

#### Resumen del día

Se consolidaron ajustes de UX/UI en navegación y cursor para mejorar enfoque visual, consistencia e inmersión durante la animación de entrada.

#### Cambios implementados

- **Cursor e intro**
  - Se blindó el estado de intro para que el cursor no reaparezca por flujos paralelos.
  - Se introdujo control explícito de estado con `intro-activa` en `js/hero.js`.
  - Se centralizó la liberación del cursor con helpers para evitar `remove` prematuros de `cursor-oculto`.
  - Se agregó salvaguarda en `js/cursor.js` para ignorar revelado del cursor personalizado si `cursor-oculto` está activo.

- **Cursor nativo vs personalizado**
  - Se forzó ocultación del cursor nativo cuando se usa cursor custom en dispositivos de puntero fino (`hover: hover` y `pointer: fine`).
  - Se evitó afectar dispositivos táctiles.

- **Menú / marquee**
  - Se transformó el marquee hover en loop continuo sin corte perceptible.
  - Se creó estructura de loop duplicado en `js/nav.js` (`.nav-menu-loop` con pista original + clon).
  - Se ajustaron estilos/animación en `css/base.css` para desplazamiento continuo.

#### Archivos modificados

- `js/hero.js`
- `js/cursor.js`
- `js/nav.js`
- `css/base.css`

#### Decisiones técnicas

- Evitar lógica distribuida que quite `cursor-oculto` sin contexto del estado global de intro.
- Usar clases de estado (`intro-activa`) para gobernar comportamiento cruzado entre módulos.
- Mantener marquee continuo con duplicación de contenido en runtime para no duplicar manualmente HTML en cada página.

#### Estado actual

- Intro: cursor oculto de forma robusta mientras la secuencia está activa.
- Desktop: se prioriza cursor personalizado sin mostrar cursor nativo.
- Menú: marquee visualmente infinito al hover/focus.

#### Pendientes sugeridos (siguiente sesión)

- Ajustar velocidad del marquee por breakpoint (desktop grande vs laptop).
- Revisar consistencia del comportamiento de cursor en páginas internas (`sobre-mi.html`, `mi-trabajo.html`, `contacto.html`) si se decide extender cursor custom fuera del home.
- Seguir refinando microalineación óptica del icono `menu.svg` en diferentes densidades de pantalla.

#### Actualización adicional del día (Manifiesto)

##### Resumen

- Se construyó en `index.html` la sección **Manifiesto** con enfoque cinematográfico, incluyendo transición visual entre secciones y narrativa híbrida (vertical + horizontal).

##### Cambios implementados

- **Transición entre Hero y Manifiesto**
  - Se añadió una transición con capa tipo máscara/clip + forma SVG orgánica para separar escenas con mayor intención visual.
- **Sección Manifiesto (scroll híbrido)**
  - Se integró estructura nueva con intro vertical, paneles horizontales y CTA final.
  - Se creó tramo horizontal pinneado para desktop con `ScrollTrigger` y `scrub`, de modo que avance y retroceda al hacer scroll down/up.
  - En mobile se dejó fallback vertical para mantener legibilidad y rendimiento.
- **Animaciones encadenadas**
  - Reveals por bloques y paneles vinculados al progreso del scroll (reversibles al subir).
  - Respeto a `prefers-reduced-motion` para accesibilidad.
- **Copy del manifiesto**
  - Se trabajó versión A/B del texto en `.github/manifiesto.md`.
  - Se eligió oficialmente la **Versión A**.
  - Se alineó el copy de `index.html` con la versión final seleccionada.

##### Archivos modificados/creados

- `index.html` (nueva sección + transición + integración de recursos)
- `js/main.js` (inicialización del módulo de manifiesto)
- `js/manifiesto.js` (**nuevo**)
- `css/manifiesto.css` (**nuevo**)
- `.github/manifiesto.md` (revisión A/B y selección final)

##### Decisiones técnicas

- Se privilegió `ScrollTrigger` con `scrub` para comportamiento bidireccional natural (ida y vuelta).
- Se separó el estilo/animación del manifiesto en archivos propios para mantener orden y escalabilidad.
- Se fijó como base editorial el texto de la **Versión A** por claridad, fuerza y coherencia con la marca personal.

##### Estado actual del manifiesto

- Sección implementada y funcional en `index`.
- Animaciones activas en desktop y fallback correcto en mobile.
- Texto final aprobado: **Versión A**.

##### Próximos ajustes recomendados

- Fine-tuning de ritmo: tiempos de entrada por panel y pausas entre beats narrativos.
- Ajuste fino de velocidad horizontal por breakpoint.
- Pulido final de dirección de arte (contraste, jerarquía y respiración tipográfica por escena).

---

### 2026-05-08

#### Resumen del día

Se hizo una iteración intensa sobre la transición Hero → Manifiesto, se construyó un bloque narrativo centrado con SVG por capas y se aplicó limpieza técnica de CSS/JS para reducir ruido y facilitar revisión visual rápida.

#### Cambios implementados

- **Transición Hero → Manifiesto**
  - Se adelantó la aparición del degradado y del manifiesto para evitar “vacíos” visuales durante el scroll.
  - Se ajustó la coreografía de entrada para que el manifiesto asome antes y acompañe mejor la salida del hero.

- **Bloque de impacto del manifiesto (nuevo enfoque visual)**
  - Se reemplazó el titular anterior por composición centrada:
    - `ALGUNOS DESARROLLAN`
    - `PAGINAS WEB`
    - `....`
    - `YO COREOGRAFIO`
  - Se integraron pares SVG para palabras clave:
    - `EXPERIENCIAS_OUTLINE.svg` (izq) + `EXPERIENCIAS.svg` (der)
    - `DIGITALES.svg` (izq) + `DIGITALES_OUTLINE.svg` (der)
  - Se añadió reveal por scroll tipo highlight de palabras (sin plugin extra, con split por spans en runtime).

- **Pin del manifiesto para reveal progresivo**
  - Se creó un tramo pinneado en la intro del manifiesto: al seguir haciendo scroll, la página no avanza y se revela la secuencia (copy + SVG).
  - Los SVG quedan ocultos al inicio y aparecen desde lados opuestos hasta superponerse al centro.

- **Ajustes de flujo para revisión rápida**
  - Se desactivó temporalmente la intro inicial en `Hero.init()` (línea comentada) para inspeccionar layout y animaciones sin esperar toda la secuencia.

- **Limpieza técnica (deuda reducida)**
  - Se removieron reglas CSS muertas/duplicadas y bloques JS no usados.
  - Se eliminó carga/registro de `Draggable` (no utilizado actualmente).
  - Se retiró lógica de navbar con selector inexistente (`#navegacion`/`con-fondo`).

#### Archivos modificados

- `index.html`
- `js/hero.js`
- `js/manifiesto.js`
- `js/main.js`
- `css/manifiesto.css`
- `css/hero.css`
- `css/base.css`

#### Decisiones técnicas

- Mantener `GSAP + ScrollTrigger` como capa principal de orquestación narrativa.
- Implementar highlight por palabras con split propio (sin `SplitText`) para evitar dependencia extra.
- Aplicar limpieza conservadora: solo remover lo claramente no referenciado para no romper UX.
- Priorizar modo de trabajo iterativo visual (desactivar intro temporalmente para test rápido).

#### Estado actual

- Transición Hero → Manifiesto: más temprana y más legible.
- Bloque de impacto: centrado, con tipografía de diálogo y reveal por scroll.
- Secuencia SVG: entrada lateral y convergencia al centro funcional.
- Base CSS/JS: más limpia y sin errores reportados en archivos intervenidos.
- Intro del hero: temporalmente pausada para revisión.

#### Pendientes sugeridos

- Recalibrar duración del pin del manifiesto por breakpoint (desktop/laptop/mobile).
- Ajustar intensidad del highlight (opacidad base, stagger, ritmo narrativo).
- Decidir cuándo reactivar la intro del hero y si se deja un “modo debug” con flag.
- Hacer segunda ronda de limpieza semiautomática de selectores/handlers no usados.

---

## Template para nuevas entradas

### 2026-05-13

#### Resumen del día

Iteración completa sobre la sección **Manifiesto**: rediseño visual, sistema de temas, efectos hover y transición de salida.

#### Cambios implementados

- **Rediseño layout 50/50**
  - Columna izquierda: texto con `SplitText` manual (tokenizer regex), palabras aparecen una a una vía `stagger` con `scrub: 1.8`.
  - Columna derecha: retrato `daniel2.png` (PNG con fondo transparente) a tamaño completo (`width:100%`, `height:100dvh`).

- **Tipografía manifiesto**
  - Fuente `Cloudsters` con ligaduras completas.
  - `font-size: clamp(24.2px, 2.86vw, 57.2px)` desktop, `clamp(19.8px, 5.72vw, 35.2px)` mobile.

- **Resplandor en contorno de la foto**
  - `filter: drop-shadow()` en 3 capas que sigue el alpha del PNG.
  - Colores vinculados a variables de tema (`--manifiesto-drop-1/2/3`).

- **Sombra inset izquierda progresiva**
  - `div.manifiesto-inset-shadow` con `box-shadow: inset 48px 0 80px -20px` que aparece junto a la foto vía GSAP.
  - Sensación de profundidad / foto hundida desde el lado izquierdo.

- **Efecto pixelado en hover**
  - CSS puro: wrap escala `N×` + imagen escala `1/N` con `image-rendering: pixelated`.
  - Ciclo `steps(1)`: 1× → 4× → 16× → 32× → 16× → 4× → 1× en 1.2s.

- **Neon permanente en highlights**
  - `.manifiesto-highlight.neon-activo` se activa en `onStart` del stagger (sin `remove`).
  - Colores y sombras vinculados a variables de tema (`--manifiesto-neon-*`).

- **Sistema de temas en manifiesto**
  - Añadidas variables `--manifiesto-drop-1/2/3` y `--manifiesto-neon-color/s1-s6` a los 6 temas en `variables.css`.
  - Todo el CSS del manifiesto usa estas variables → cambio de tema automático.

- **Transición de salida**
  - `div.salida-manifiesto` (60vh): degradado `--color-acento` → `transparent`.
  - El grid fijo del hero reaparece gradualmente al transparentarse el fondo acento.

#### Archivos modificados

- `index.html` (estructura manifiesto, div overlay inset, div salida)
- `css/manifiesto.css` (reescritura completa)
- `css/variables.css` (variables manifiesto por tema × 6)
- `js/manifiesto.js` (stagger, insetShadow, neon permanente)

#### Decisiones técnicas

- `filter: drop-shadow` en vez de `box-shadow` para respetar el contorno del PNG recortado.
- Sombra inset como elemento DOM separado para poder animarla independientemente con GSAP.
- Variables CSS por tema para que todos los efectos respondan automáticamente al cambio de tema.
- Efecto pixelado: técnica matemática (wrap × img recíproco) en lugar de canvas o JS para máximo rendimiento.

#### Estado actual

- ✅ Layout 50/50 con scroll-reveal palabras + retrato
- ✅ Neon por tema en highlights
- ✅ Resplandor contorno imagen por tema
- ✅ Sombra inset izquierda progresiva
- ✅ Efecto pixelado hover
- ✅ Transición de salida acento → grid
- ✅ Media queries desktop/tablet/mobile
- ✅ Código CSS/JS limpio sin reglas muertas

#### Pendientes sugeridos

- Ajustar velocidad stagger por breakpoint (tablet puede necesitar ritmo más rápido).
- Decidir siguiente sección después del manifiesto (¿proyectos / mi trabajo?).
- Revisar consistencia del sistema de temas en páginas internas.

---

### YYYY-MM-DD

#### Resumen del día

-

#### Cambios implementados

-

#### Archivos modificados

-

#### Decisiones técnicas

-

#### Estado actual

-

#### Pendientes sugeridos

-

---

### 2026-05-19

#### Resumen del día

Sesión enfocada en responsive del menú overlay para tablet/mobile y corrección del efecto neon en la sección Convergencia.

#### Cambios implementados

- **Menú responsive — nuevos breakpoints**
  - Se añadieron media queries específicas para:
    - Tablet landscape (`≤1024px` + `orientation: landscape`)
    - Tablet portrait (`≤1024px` + `orientation: portrait`)
    - Mobile portrait (`≤599px`)
    - Mobile landscape (`≤768px` + `orientation: landscape`)
  - Ajustes por breakpoint: `--nav-title-size`, `min-height` de filas, padding del shell, footer grid layout, esquinas HUD.
  - Footer: 3 cols compactas en tablet landscape, 2 cols en tablet portrait (copy full-width), 1 col en mobile portrait, 3 cols ultra-compactas en mobile landscape.

- **Hover del menú — protección touch**
  - Se envolvieron todos los estilos `:hover` del `.nav-menu-row` dentro de `@media (hover: hover) and (pointer: fine)`.
  - En dispositivos touch el hover ya no se "pega" al primer tap.
  - `:focus-visible` se mantiene fuera del media query para accesibilidad universal.

- **Neon en Convergencia — fix de disparo**
  - El `ScrollTrigger` separado para el neon nunca se disparaba porque la sección está pinneada y el cálculo de offset era incorrecto.
  - Se movió la lógica al `onUpdate` del ScrollTrigger principal, detectando `progress >= 0.28`.
  - Se cambió el color del glow de `--color-acento` (invisible sobre fondo acento) a blanco `#ffffff`.
  - Se aumentó la intensidad: 4 capas de `drop-shadow` (4px, 12px, 28px, 56px).

- **Neon reversible**
  - Si el usuario hace scroll up y el progreso baja de 0.20, el timeline neon se mata, los filtros se resetean y queda listo para re-dispararse al volver a bajar.
  - `_dispararNeon` ahora retorna el timeline para poder matarlo externamente.

#### Archivos modificados

- `css/base.css` (breakpoints responsive menú + hover touch-safe)
- `js/convergencia.js` (neon: fix disparo, color blanco, intensidad, reversibilidad)

#### Decisiones técnicas

- Usar `orientation` en media queries para diferenciar tablet landscape vs portrait — el ancho solo no basta porque un iPad en portrait tiene 768px pero mucha altura.
- `@media (hover: hover) and (pointer: fine)` es la forma correcta de proteger hover en touch — no depende del ancho sino de la capacidad real del dispositivo.
- Mover el neon al `onUpdate` del mismo ScrollTrigger que controla el pin evita problemas de cálculo de posición con elementos pinneados.
- Hacer el neon reversible con umbral de histéresis (dispara en 0.28, resetea en 0.20) para evitar flickering si el usuario scrollea lento en la zona límite.

#### Estado actual

- ✅ Menú overlay responsive en 4 breakpoints + desktop
- ✅ Hover solo en dispositivos con mouse real
- ✅ Focus-visible funcional en todos los dispositivos
- ✅ Neon visible (blanco sobre fondo acento)
- ✅ Neon reversible al hacer scroll up
- ✅ Footer del menú adaptado por orientación

#### Pendientes sugeridos

- Verificar visualmente el neon en los temas oscuros (acid, synthwave, rave) — el blanco debería funcionar pero vale confirmar.
- Probar el menú en dispositivos reales (iPad, iPhone, Android tablet).
- Considerar agregar una animación de tap/active en mobile para dar feedback visual al tocar los ítems del menú (en lugar del hover).

---

### 2026-05-20

#### Resumen del día

Sesión amplia: efecto glitch en imagen del manifiesto, ajustes de variables de temas, renombrado de stickers holographic, y creación del selector de tema "AMBIENTACIÓN" como componente global.

#### Cambios implementados

- **Imagen del manifiesto — entrada cinematográfica**
  - Se reemplazó el fade-in simple por un reveal con `scale(1.08)` + `clip-path: inset(8%)` que se abre progresivamente con el scroll.
  - Efecto visual: la imagen "respira" al aparecer, más profesional que un simple opacity.

- **Efecto glitch on hover (desktop)**
  - Se reemplazó el efecto pixelado anterior por un glitch CSS con 3 capas absolutas.
  - Cada capa usa `clip-path: inset()` + `translate3d()` + `hue-rotate()` con keyframes propios.
  - Desplazamientos sutiles (2-4px), rotaciones de color suaves — elegante, no agresivo.
  - Protegido con `@media (hover: hover) and (pointer: fine)`.

- **Flash automático de glitch en mobile**
  - Cuando la imagen alcanza ~70% de visibilidad, se activa la clase `.glitch-flash` por 1.2 segundos.
  - Reversible: si el usuario scrollea hacia arriba, se resetea para dispararse de nuevo.

- **Ajustes de variables de temas**
  - Neutro: limpieza de `ff` redundantes en hex (`#b5770cff` → `#b5770c`).
  - Collage: `--color-texto-suave` de `#a89880` → `#b8a078` (más cálido, acorde a stickers fotorealistas).
  - Holographic: `--color-grid` de `0.07` → `0.09` (grid más visible para estética iridiscente).

- **Renombrado de stickers holographic**
  - 43 archivos renombrados de `sticker-#.svg` a `holo-#.svg` en la carpeta `Rsc/Stickers/holographic/`.

- **Selector de tema "AMBIENTACIÓN" (nuevo componente)**
  - Pill flotante vertical en borde izquierdo (alineada a `left: 42px` con las esquinas HUD).
  - Al click se expande mostrando 6 círculos de color (uno por tema) con nombre.
  - Tema activo tiene ring/glow animado.
  - Backdrop blur + borde sutil (glassmorphism coherente con el HUD).
  - Persistencia con `localStorage` — el tema se mantiene al navegar entre páginas.
  - Script inline en `<head>` aplica tema antes del render (evita flash).
  - Animación GSAP: entrada con delay, expansión con stagger, pulse elástico al seleccionar.
  - Cierre con click fuera o ESC.

- **Responsive del selector de tema**
  - Desktop: pill vertical, borde izquierdo.
  - Tablet landscape/portrait: mismo diseño, más compacto.
  - Mobile portrait: bottom center (FAB), se expande hacia arriba, horizontal.
  - Mobile landscape: bottom center, horizontal, nombres ocultos.

- **Páginas internas actualizadas**
  - `sobre-mi.html`, `mi-trabajo.html`, `contacto.html`: se agregó el selector de tema, script de persistencia, y se cambió GSAP de CDN a copia local.

- **Steering files del proyecto**
  - Se creó `.kiro/steering/responsive-obligatorio.md` con la regla de breakpoints obligatorios.
  - Se refinó `.kiro/steering/infromacion.md` con contexto completo del proyecto (tech stack, convenciones, temas, filosofía).

#### Archivos creados

- `css/tema-selector.css`
- `js/tema-selector.js`
- `.kiro/steering/responsive-obligatorio.md`

#### Archivos modificados

- `index.html` (glitch layers + selector de tema + script inline + link CSS)
- `css/manifiesto.css` (glitch reemplaza pixelado + responsive)
- `js/manifiesto.js` (entrada cinematográfica + flash mobile)
- `css/variables.css` (ajustes de colores en 3 temas)
- `js/main.js` (inicialización TemaSelector)
- `js/convergencia.js` (neon reversible — sesión anterior continuada)
- `sobre-mi.html` (selector de tema + GSAP local)
- `mi-trabajo.html` (selector de tema + GSAP local)
- `contacto.html` (selector de tema + GSAP local)
- `.kiro/steering/infromacion.md` (refinado)

#### Decisiones técnicas

- Nombre "AMBIENTACIÓN" para el selector de tema — metáfora teatral coherente con la narrativa bailarín→programador.
- Pill flotante minimalista en vez de panel lateral — menos intrusivo, más descubrible.
- En mobile se mueve a bottom center (FAB) porque el espacio lateral es insuficiente.
- `localStorage` con key `dv-tema-activo` para persistencia cross-page sin backend.
- Script inline en `<head>` para aplicar tema antes del primer paint — evita FOUC (flash of unstyled content).
- Glitch CSS puro (no JS) para el hover — mejor rendimiento y no depende de GSAP para funcionar.
- Flash automático en mobile como alternativa al hover inexistente en touch.

#### Estado actual

- ✅ Selector de tema funcional en todas las páginas
- ✅ Persistencia de tema con localStorage
- ✅ Efecto glitch sutil on hover (desktop)
- ✅ Flash automático de glitch en mobile
- ✅ Entrada cinematográfica de la imagen del manifiesto
- ✅ Variables de temas ajustadas
- ✅ Stickers holographic renombrados
- ✅ Steering files configurados
- ✅ Responsive completo en selector de tema (4 breakpoints)

#### Pendientes sugeridos

- Verificar visualmente el selector de tema en todos los temas (contraste del ring/glow).
- Probar la persistencia navegando entre páginas.
- Considerar agregar una transición suave al cambiar de tema (overlay tipo "cortina" o fade).
- Agregar el selector de tema a futuras páginas nuevas.
- Decidir si el selector se oculta durante la intro del hero o aparece desde el inicio.


---

## Sesión — 26 de mayo 2026

### Resumen de lo realizado

#### Fixes críticos
- **Lenis conflicto de nombre**: El módulo IIFE `const Lenis = (...)` sobrescribía `window.Lenis` (constructor de la librería). Renombrado a `SmoothScroll` en `js/lenis.js` y `main.js`.
- **Lenis removido**: Se quitó completamente Lenis (librería + wrapper + inicialización) porque causaba conflictos con las animaciones de ScrollTrigger.
- **`scroll-behavior: smooth` eliminado**: Causaba el efecto "escalonado" al pelear con el scrub de GSAP. Cambiado a `scroll-behavior: auto` en `base.css`.
- **Burbuja de edición en mobile**: Centrada correctamente con `xPercent: -50` en GSAP (antes el CSS `left:50%` peleaba con GSAP `x`).
- **Color editable en hero**: Cambiado de `--color-acento` a `--color-editable` para el estado base, con transición suave al `--color-editable-activo` cuando el usuario modifica.
- **Exclusión mutua Caos/Creativo**: Al activar uno se desactiva el otro automáticamente.
- **Cursor desactivado temporalmente** para editar MotionPath (pendiente reactivar).

#### Sección Habilidades (rediseño completo)
- **Carrusel 3D en arco**: Cards recorren un arco de esquina inf-izq a sup-der (como medio arcoíris).
- **Cards liquid glass**: `backdrop-filter: blur(24px)`, bordes luminosos, reflejo superior, sombras internas.
- **Cards de categoría**: Tinte con `--color-editable` / `--color-editable-activo`, título centrado.
- **Numeración global** (01-29) con `--fuente-editable`, nombre con `--fuente-display`.
- **Categoría IA & Productividad** agregada: Claude Code, Copilot, Cursor, ChatGPT, Ollama, v0.
- **Mobile**: Marquee infinito automático (cards duplicadas, loop con GSAP, pausa al tocar).
- **Parámetros actuales**: `slotSpacing: 26°`, `arcStart: 0°`, `arcEnd: 95°`, `scrollLength: total * 180`.

#### Sección Proyectos (nueva)
- **4 proyectos**: ENERGIEN, FC LUXE SPA & BEAUTY, EMOZIONY (en desarrollo), LAA REAL STATE (en desarrollo).
- **Layout**: Nombres a la izquierda en `--fuente-display` gigante (ligatures activas), preview a la derecha.
- **Hover**: Revela imagen/placeholder del proyecto correspondiente.
- **Tag "En desarrollo"**: Dentro del preview, aparece solo al hover con fade in.
- **Sin numeración**, sin border-bottom en hover.
- **Click**: Navega a `mi-trabajo.html#proyecto-x`.

#### Sección Método (nueva)
- **Scroll horizontal pinneado** con 7 paneles (intro + párrafo + 5 actos).
- **Panel 1**: Título "El Método: Del Escenario al Servidor" en tipografía gigante con SplitText chars.
- **Panel 2**: Párrafo completo del manifiesto con ScrambleText al hover sobre palabras + imagen de fondo.
- **Paneles 3-7**: Los 5 actos con watermark gigante (número romano), título en display, descripción.
- **SplitText + ScrambleTextPlugin** cargados y activos.
- **Degradado**: De `--color-fondo` a `--color-fondo-secundario` (85% opacidad para que el grid se vea).

#### Screenshots de proyectos
- Tomados para ENERGIEN y FC LUXE en desktop (3), tablet landscape, tablet portrait, mobile (2).
- Guardados en `Rsc/Img/proyectos/{nombre}/`.
- Pendientes: EMOZIONY y LAA REAL STATE.

#### Archivos nuevos creados
- `css/proyectos.css`
- `css/metodo.css`
- `js/proyectos.js`
- `js/metodo.js`
- `Rsc/Img/proyectos/` (carpetas con screenshots)

#### Plugins GSAP cargados actualmente
- `gsap.min.js` (core)
- `ScrollTrigger.min.js`
- `SplitText.min.js`
- `ScrambleTextPlugin.min.js`
- `Draggable.min.js`
- `InertiaPlugin.min.js`

---

### Pendientes para la próxima sesión

1. **Reactivar cursor personalizado** — Descomentar `Cursor.init()` en `main.js` y restaurar `class="cursor-oculto"` en `<body>`.

2. **Método — animaciones reversibles**: Las animaciones de SplitText no se ven al hacer scroll up. Necesitan `onEnterBack` y `onLeaveBack` funcionales (actualmente están pero no revierten correctamente el SplitText).

3. **Método — panel intro con fondo original**: El primer panel debe mantener `--color-fondo` (no secundario). El degradado hacia `--color-fondo-secundario` debe empezar cuando el scroll horizontal se activa (no antes).

4. **Método — imagen metodo5.png como overlay**: Agregar `Rsc/Img/metodo5.png` como fondo del panel intro con opacidad baja (similar al panel manifiesto que ya tiene imagen).

5. **Screenshots pendientes**: Tomar screenshots de EMOZIONY y LAA REAL STATE (GitHub Pages).

6. **Transición entre secciones**: Revisar que el degradado orgánico entre proyectos → método se vea bien con el grid visible.

7. **Mobile — texto "Algunos desarrollan..."**: El trigger `start: "top 95%"` puede no dispararse en todos los dispositivos. Verificar en mobile real.

---

### Estado actual de la página (orden de secciones)

1. Hero (intro coreografiada + drag + editable)
2. Transición Hero ("Algunos desarrollan páginas web... yo coreografío")
3. Convergencia (SVGs convergiendo)
4. Manifiesto (texto + retrato + glitch)
5. Salida Manifiesto (degradado)
6. **Habilidades** (carrusel 3D en arco, 29 skills + 6 categorías)
7. **Proyectos** (4 proyectos, hover reveal)
8. **Método** (scroll horizontal, 7 paneles, SplitText + ScrambleText)

---


### 2026-05-26 (continuación — sesión vespertina)

#### Resumen del día

Sesión enfocada en resolver pendientes de la bitácora anterior + rediseño completo de animaciones de la sección Método + interacción mobile en Proyectos.

#### Cambios implementados

- **Cursor personalizado reactivado**
  - `Cursor.init()` descomentado en `main.js`.
  - `class="cursor-oculto"` restaurado en `<body>` de `index.html`.

- **Sección Método — animaciones cinematográficas únicas por acto**
  - Reescritura completa de `js/metodo.js` con animaciones diferentes para cada panel:
    - **Acto I**: Cascada desde posiciones Y aleatorias + rotación + elastic bounce. Hover: pulso de escala + color acento.
    - **Acto II**: Palabras entran alternando izquierda/derecha. Descripción encadenada después del título. Hover: ScrambleText en todo el título.
    - **Acto III**: Typewriter con `clipPath` reveal izq→der. Descripción encadenada con blur clearing. Hover: underline animado + color.
    - **Acto IV**: Flip 3D con `rotateX(-90°)` desde abajo con perspectiva. Hover: wave (palabras suben en ola con stagger).
    - **Acto V**: Scale desde 0 con elastic bounce. Descripción con efecto dominó (rotación). Hover: rotación aleatoria por palabra.
  - Todas las animaciones son 100% reversibles al hacer scroll up.
  - Hovers protegidos con `(hover: hover) and (pointer: fine)`.
  - Se usa `gsap.killTweensOf()` antes de cada animación para evitar conflictos.

- **Sección Método — panel manifiesto: decodificación binaria**
  - Las palabras aparecen dispersas por el viewport con tamaños variados (0.7× a 1.8×) y rotaciones aleatorias (-12° a 12°).
  - Contenido inicial: código binario (01001...).
  - Fase 1 (0%–75% scroll): cada palabra se decodifica progresivamente de binario a texto real con ScrambleTextPlugin (`chars: '01'`).
  - Fase 2 (75%–100% scroll): todas las palabras se animan a su posición natural (inline, párrafo legible) — escala 1, rotación 0.
  - Al hacer scroll back: se re-dispersan y vuelven a binario.
  - Hover post-decodificación: scramble decorativo con caracteres especiales.

- **Sección Método — imagen metodo5.png como overlay**
  - Agregado `div.metodo-intro-bg` con `background-image` en CSS (no `<img>` tag).
  - `background-size: contain`, `background-position: left center`, `filter: grayscale(0.4)`, `opacity: 0.15`.
  - Título desplazado a la derecha (`margin-left: 20%`) para no tapar la imagen.

- **Sección Método — fondo continuo (fix franja)**
  - `.metodo` cambiado a `background: transparent` (antes tenía `--color-fondo-secundario`).
  - Eliminado `overflow: hidden` de `.metodo`.
  - Eliminado `div.metodo-gradiente-entrada` del HTML.
  - Eliminado `::after` de `.proyectos` que tenía un degradado hacia `--color-fondo-secundario` (era la franja visible).
  - Reducido `padding-bottom` de `.proyectos` de `120px` a `40px`.
  - Reducido `--color-gradiente-fin` del tema neutro de `0.7` a `0.12` para que el radial gradient del fondo fijo no cree franjas visibles.

- **Sección Proyectos — interacción mobile (tap/doble-tap)**
  - Primer tap: muestra la imagen del proyecto como fondo de la sección (opacidad baja, `object-fit: cover`). Nombre se colorea con `--color-acento`.
  - Doble-tap (dentro de 400ms): navega al destino (`mi-trabajo.html#proyecto-x`).
  - Desktop: comportamiento sin cambios (hover muestra preview, click navega).
  - CSS: en mobile/tablet portrait, `.proyectos-preview` se posiciona absolute como fondo.
  - Clase `.fondo-mobile` controla la opacidad y estilo de la imagen como fondo.

#### Archivos modificados

- `index.html` (body class, metodo-intro-bg, eliminación gradiente-entrada)
- `js/main.js` (Cursor.init reactivado)
- `js/metodo.js` (reescritura completa — animaciones únicas + decodificación binaria)
- `js/proyectos.js` (reescritura — lógica mobile tap/doble-tap)
- `css/metodo.css` (fondo transparente, imagen bg, título desplazado, responsive)
- `css/proyectos.css` (eliminación ::after, mobile fondo, responsive)
- `css/variables.css` (gradiente-fin reducido en temas neutro, collage, holographic)

#### Decisiones técnicas

- Animaciones únicas por acto para dar personalidad a cada panel — evitar monotonía visual.
- Decodificación binaria vinculada al scroll progress (no a tiempo) para control total del usuario.
- Dispersión → reorden como metáfora visual: del caos al orden, del código al significado.
- `background-image` en CSS (no `<img>`) para poder aplicar `filter` directamente al div.
- Doble-tap en mobile como patrón de interacción: primer tap = preview, segundo = acción.
- Eliminación del degradado `::after` de proyectos para continuidad visual con el grid.

#### Estado actual

- ✅ Cursor personalizado activo
- ✅ Método: 5 animaciones únicas por acto + hovers interactivos
- ✅ Método: decodificación binaria progresiva con scroll
- ✅ Método: dispersión → reorden de palabras
- ✅ Método: imagen metodo5.png como overlay izquierdo
- ✅ Método: fondo continuo sin franjas
- ✅ Proyectos: tap/doble-tap en mobile
- ✅ Transición proyectos → método sin corte visual

#### Pendientes sugeridos

- **Responsive completo de Habilidades, Proyectos y Método** en tablet landscape, tablet portrait y mobile — verificar visualmente y ajustar UX.
- Verificar que la decodificación binaria funcione bien en mobile (scroll vertical).
- Probar doble-tap en dispositivos reales (iOS Safari, Android Chrome).
- Ajustar la dispersión de palabras del manifiesto para que no se salgan del viewport en pantallas pequeñas.
- Verificar que los temas oscuros (acid, synthwave, rave) se vean bien con los nuevos cambios.

---
