# Styles architecture

How the styles of this site are organised, and the rules to follow when changing them.

> This document is being written step by step during the styles refactor (fluid sizing → BEM clean-up and tokens → removing Sass). Sections marked _To do_ get written when that step lands, so everything here matches what is in the repo today.

## 1. Philosophy

- **Static first, no framework.** The site is plain Astro with scoped `<style>` blocks. No CSS framework, no CSS-in-JS, no utility classes.
- **State lives in HTML, CSS reacts to it.** Interactive state is an HTML attribute, such as the menu button's `aria-expanded`. CSS derives everything else from it (overlay, scroll lock, icon), and the script only flips the attribute.
- **Fluid first, breakpoints last.** Sizes and spacing grow with the screen using `clamp()`, and layouts adapt on their own where possible (`flex-wrap`, `max-width`). A media query is only for a real change of layout, not for nudging a font size.
- **Respect the user's settings.** Text grows with the browser text size (sizes are in `rem`), and animations respect `prefers-reduced-motion`.
- **Small and predictable.** Few global rules and one stylesheet in the build. Prefer plain, well-known CSS over clever tricks, so anyone can read and change it. When a trick is really needed, add a comment explaining why.

## 2. File structure

```
src/styles/
  globals.scss          ← imported once, in BaseLayout.astro
  base/
    _variables.scss     ← fonts and colours ($font-*, $color-*)
    _functions.scss     ← toRem(), fluid()
    _mixins.scss        ← breakpoints, fluid-small-text
    _themes.scss        ← light/dark theme
    _typography.scss    ← @font-face rules
    _normalize.scss     ← normalize.css v8
    _reset.scss         ← box-sizing, list reset
```

- `_variables.scss`, `_functions.scss` and `_mixins.scss` are injected into every component's `<style lang="scss">` by `astro.config.mjs`, so components use them without importing anything.
- **Component styles** live in the component's own `<style>` block. Astro scopes them, so they can't leak into other components.
- **Global styles** go in `src/styles/`: fonts, reset, themes and the few global helpers (`.visually-hidden`).
- **Exception:** a global rule that only exists for one component's behaviour stays in that component, wrapped in `:global(...)`. Example: `Menu.astro` locks the page scroll with `:global(html:has(...))` while the menu is open.

## 3. Tokens

_To do (phase 2: colours and fonts become CSS custom properties)._

## 4. Theming

_To do (phase 2)._

## 5. Fluid sizing

Most sizes don't jump at a breakpoint. They grow in a straight line between a small and a large screen, and stop growing outside that range.

Use the `fluid()` function from `_functions.scss`:

```scss
font-size: fluid(20px, 32px);              // 20px on a 320px screen → 32px on a 1180px screen
padding-top: fluid(48px, 32px, 320px, 680px); // can also shrink, and use another range
```

It returns a `clamp()`:

```css
font-size: clamp(1.25rem, 0.971rem + 1.395vw, 2rem);
```

### How it works

The result has two parts: a **fixed part** (in `rem`) plus a **growth part** (in `vw`, so it changes with the screen). `clamp()` keeps the sum between the smallest and largest size.

Example, `fluid(20px, 32px)`:

1. **Growth per pixel.** Over 860px of screen (320 → 1180) the size grows 12px (20 → 32). So for every pixel the screen gets wider, the size grows 12 ÷ 860 = 0.01395px.
2. **As `vw`.** CSS can only say "per pixel of screen" with `vw` (1vw = 1% of the screen width), so the growth part is 0.01395 × 100 = `1.395vw`.
3. **Fixed part.** On a 320px screen the growth part alone is 0.01395 × 320 = 4.46px, but the size should be 20px. So a fixed 20 − 4.46 = 15.54px (`0.971rem`) is added.
4. **Limits.** `clamp()` stops the size at 20px on smaller screens and 32px on larger ones.

```css
clamp(1.25rem, 0.971rem + 1.395vw, 2rem)
```

| Screen | Fixed part | Growth part | Size |
|---|---|---|---|
| 320px | 15.54px | 4.46px | **20px** |
| 750px | 15.54px | 10.46px | **26px** |
| 1180px | 15.54px | 16.46px | **32px** |

If the size shrinks instead (`$max` smaller than `$min`), the growth per pixel is negative and the same steps apply.

### Rules

- **Always keep `rem` ends.** A size in plain `vw` ignores the user's browser text size. The `rem` part of the formula keeps text growing when the user zooms or sets a larger default size.
- **Default range is 320px → 1180px** (small phone → desktop). Use another range only when a size should stop changing earlier, e.g. `fluid(24px, 32px, 680px, 1180px)` for body text that stays at 24px on phones.
- **One value is often enough.** If the difference between screens doesn't matter visually, don't make it fluid.
- **Small text** (name, role, desktop menu links) uses `fluid-small-text`: `max(1rem, 1.5vw)`. It is the user's base text size, and only grows on screens wider than about 1067px.
- **Body text:** `fluid(24px, 32px, 680px, 1180px)` up to desktop. From `desktop` it is `clamp(2rem, 2vw, 2.5rem)`, so it keeps growing on very wide screens, up to 40px at 2000px.
- **Headline:** `.header__title` uses `clamp(1.925rem, 11vw, clamp(5rem, 4.5vw, 6rem))`, so it fills small screens, stops at 5rem, and only grows again on very wide screens.

### Breakpoints that remain

These change the layout, or a value that isn't a straight line between two screen sizes, so they stay as media queries:

| Where | Breakpoint | Why |
|---|---|---|
| `Menu.astro` | `tablet` / `only-mobile` (680px) | Hamburger and full-screen overlay below, inline links above |
| `AboutMe.astro` | `desktop` (1180px) | Hand-placed 12-column grid |
| `BaseLayout.astro` | `tablet` (680px) | Page padding: none on phones, so cards use the full width; `fluid(24px, 48px, 680px, 1180px)` from tablet up |
| `BaseLayout.astro` | `desktop` (1180px) | Body text switches to `clamp(2rem, 2vw, 2.5rem)` (see above) |
| `ExperienceCard.astro` | `desktop` (1180px) | Project list limited to 70% of the card for readable lines; full width below |
| `ExperienceCard.astro` | `desktop` (1180px) | Title and dates on one line. With wrapping instead, cards at the same width would differ (dates beside short titles, below long ones) |
| `Header.astro` | `desktop` (1180px) | Tagline limited to 70vw; full width below |
| `Header.astro` | `only-small-mobile` (≤480px) | Line break after "with", so the tagline keeps three lines instead of leaving "products" alone |

## 6. Breakpoints

_To do (phase 3: how breakpoints are written once Sass is gone)._

## 7. BEM rules and patterns

_To do (phase 2)._

## 8. Browser support

_To do (phase 3)._ Until then, see "Browser support" in `CLAUDE.md`.

## 9. Accessibility

- **Text size:** sizes are in `rem`, or `clamp()` with `rem` ends, so text follows the user's browser settings. Check the page with the browser text size at 200%.
- **Contrast:** check text and icon colours against the background in both the light and dark theme.
- **Focus:** everything interactive needs a visible focus style, and tab order must match the visual order. Don't reorder with CSS `order`.
- **Motion:** every animation or transition has a `@media (prefers-reduced-motion: reduce)` rule that turns it off. Known gaps, fixed in phase 2: the theme colour transition in `_themes.scss` and the hover scale in `ThemeToggler.astro`.
- **Hidden headings:** sections have an `<h2>` for screen readers, hidden with the global `.visually-hidden` class.

## 10. Checklist for a new component

_To do (phase 2)._
