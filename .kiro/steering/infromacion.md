---
inclusion: always
---

# Project Context — Daniel Velez Creative Portfolio

## Overview

Premium multi-page portfolio for Daniel Velez, a creative web developer based in Guadalajara, México. The site targets Awwwards-level quality with cinematic animations, scroll-driven storytelling, and an interactive sticker system that lets users customize the visual theme.

## Tech Stack

- **HTML/CSS/JS** — No frameworks, no bundlers. Vanilla only.
- **GSAP** (local copy in `/gsap-public/`) — Core animation engine with ScrollTrigger, SplitText, Flip, Observer, Draggable, CustomEase.
- **Architecture** — Multi-page HTML (`index.html`, `sobre-mi.html`, `contacto.html`, `mi-trabajo.html`), each loading shared CSS/JS modules.
- **Fonts** — Custom OTF/TTF loaded via `@font-face` from `/Rsc/Fonts/`.
- **Assets** — `/Rsc/` for fonts, images, SVGs, stickers.

## File Organization

```
/css          → One file per section/concern (variables.css, base.css, hero.css, manifiesto.css, etc.)
/js           → One IIFE module per section (hero.js, manifiesto.js, convergencia.js, nav.js, cursor.js, main.js)
/Rsc          → Fonts, images, SVGs, stickers
/gsap-public  → Local GSAP library (ESM + minified)
```

## Code Conventions

### CSS
- CSS custom properties defined in `variables.css` — all theming goes through `--color-*` and `--fuente-*` vars.
- **Typography rule (new sections only, from Habilidades onward)**: Headings (`h1`–`h5`) use `var(--fuente-display)`. Body/paragraph text uses `var(--fuente-parrafo)`. Previous sections (Hero, Transición, Convergencia, Manifiesto) keep their existing font choices.
- Class names in **Spanish**, semantic and natural (`.fondo-grid`, `.esquina--sup-izq`, `.nav-menu-row`, `.cursor-daniel`).
- BEM-like naming with double-dash for modifiers (`.esquina--inf-der`).
- Section headers use box-drawing comment blocks: `/* ═══ TITLE ═══ */` for major sections, `/* ── subtitle ── */` for subsections.
- Theme switching via `[data-tema="nombre"]` attribute on `:root`.
- 6 themes: `neutro` (default), `acid`, `synthwave`, `rave`, `collage`, `holographic`.
- All color transitions use `var(--transicion-tema)`.

### JavaScript
- Each section is an **IIFE module** exposing an `init()` function: `const ModuleName = (() => { function init() {...} return { init }; })();`
- GSAP `matchMedia()` wraps all animation logic for responsive breakpoints.
- Comments in Spanish.
- No `import`/`export` — scripts loaded via `<script>` tags in HTML.
- `main.js` orchestrates initialization order.

### Naming Language
- All class names, variable names, comments, and identifiers are in **Spanish**.
- File names are in Spanish (lowercase, hyphenated): `transicion-hero.js`, `convergencia.css`.

## Theming System

The site has a sticker-based theme system. Each theme corresponds to a sticker collection and changes the entire color palette via CSS custom properties on `[data-tema]`. Theme transitions are animated with `--transicion-tema: 0.9s cubic-bezier(0.16, 1, 0.3, 1)`.

## Animation Philosophy

- **Interaction-first**: Define the experience before the layout.
- **Cinematic quality**: Neon flickers, scroll-driven reveals, convergence effects, parallax.
- **Performance-aware**: Use `will-change` sparingly, prefer transforms/opacity, leverage GSAP's optimizations.
- **Reduced motion**: Respect `prefers-reduced-motion` — disable or simplify animations.

## Design Principles

- No generic templates or boilerplate.
- Every animation must serve the narrative.
- Propose 2–3 creative variations before coding a new section.
- Evaluate trade-offs (Design Critic Mode) before committing to an approach.
- Maintain visual, technical, and narrative consistency across all pages.
- Ask questions before implementing complex sections — do not assume.

## SEO & Accessibility

- Semantic HTML structure.
- Meta tags optimized for México/Guadalajara keywords.
- Bilingual support planned (ES/EN).
- `:hover` protected with `@media (hover: hover) and (pointer: fine)`.
- `:focus-visible` used as universal accessible alternative.
- Custom cursors hidden on touch devices.

## Key Constraints

- Never generate generic or template-like code.
- Remove obsolete CSS/JS in each iteration — no dead code.
- Do not advance to coding without asking clarifying questions first.
- Balance extreme animation with performance (target 60fps).
- All new code must include responsive breakpoints (see responsive steering file).
