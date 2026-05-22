---
inclusion: always
---

# Responsive Design Rules

Every new element added to this project (page, section, component, animation, effect, or interaction) MUST include responsive styles for all breakpoints below, in addition to the desktop base styles.

This applies to both CSS and JavaScript (GSAP `matchMedia()`).

## Breakpoints (ordered by specificity)

| Name | Media Query | Notes |
|------|-------------|-------|
| Desktop | _(base styles, no `@media`)_ | Default target |
| Tablet landscape | `(max-width: 1024px) and (orientation: landscape)` | |
| Tablet portrait | `(max-width: 1024px) and (orientation: portrait)` | |
| Mobile portrait | `(max-width: 599px)` | |
| Mobile landscape | `(max-width: 768px) and (orientation: landscape)` | |

## CSS Template

When writing new CSS, include all breakpoints in this order:

```css
/* ── Desktop (base) ── */
.selector { }

/* ── Tablet landscape ── */
@media (max-width: 1024px) and (orientation: landscape) { }

/* ── Tablet portrait ── */
@media (max-width: 1024px) and (orientation: portrait) { }

/* ── Mobile portrait ── */
@media (max-width: 599px) { }

/* ── Mobile landscape ── */
@media (max-width: 768px) and (orientation: landscape) { }
```

If a breakpoint requires no changes, keep the block with a comment:

```css
@media (max-width: 599px) {
  /* Sin cambios — hereda de tablet portrait */
}
```

## JavaScript Template (GSAP matchMedia)

When writing GSAP animations, wrap logic in `gsap.matchMedia()`:

```js
const mm = gsap.matchMedia();

mm.add("(min-width: 1025px)", () => { /* Desktop */ });
mm.add("(max-width: 1024px) and (orientation: landscape)", () => { /* Tablet landscape */ });
mm.add("(max-width: 1024px) and (orientation: portrait)", () => { /* Tablet portrait */ });
mm.add("(max-width: 599px)", () => { /* Mobile portrait */ });
mm.add("(max-width: 768px) and (orientation: landscape)", () => { /* Mobile landscape */ });
```

## Hover and Interaction

- All `:hover` styles MUST be wrapped in `@media (hover: hover) and (pointer: fine)` to prevent activation on touch devices.
- Use `:focus-visible` as the universal accessible alternative.

## Complexity Rule — Ask Before Implementing

If the addition is complex (multi-column layout, scroll-driven animations, elaborate visual compositions, many positioned elements), ask the user before implementing breakpoints:

1. How should it look/behave in tablet landscape?
2. How should it look/behave in tablet portrait?
3. How should it look/behave in mobile?
4. Are there elements that hide, reorder, or resize drastically?
5. Should animations be simplified or removed on small screens?

Do NOT assume responsive behavior for complex additions — ask first.

## When This Rule Applies

| Action | Responsive required |
|--------|-------------------|
| New page | Yes |
| New section | Yes |
| New component | Yes |
| New animation | Yes |
| New visual effect | Yes |
| New interactive element | Yes |
| Simple bug fix | Only if it affects layout |
