# Styles architecture

How the styles of this site are organised, and the rules to follow when changing them.

## 1. Philosophy

- **Plain CSS, no framework.** The site is plain Astro with scoped `<style>` blocks in standard CSS. No preprocessor, no CSS framework, no CSS-in-JS, no utility classes.
- **State lives in HTML, CSS reacts to it.** Interactive state is an HTML attribute, such as the menu button's `aria-expanded`. CSS derives everything else from it (overlay, scroll lock, icon), and the script only flips the attribute.
- **Fluid first, breakpoints last.** Sizes and spacing grow with the screen using `clamp()`, and layouts adapt on their own where possible (`flex-wrap`, `max-width`). A media query is only for a real change of layout, not for nudging a font size.
- **Respect the user's settings.** Text grows with the browser text size (sizes are in `rem`), and animations respect `prefers-reduced-motion`.
- **Small and predictable.** Few global rules and one stylesheet in the build. Prefer plain, well-known CSS over clever tricks, so anyone can read and change it. When a trick is really needed, add a comment explaining why.

## 2. File structure

```
src/styles/
  globals.css        ← imported once, in BaseLayout.astro; imports the files below
  base/
    tokens.css       ← fonts, colours (by hue) and text sizes
    themes.css       ← light/dark theme: role colours (--color-text, --color-accent…)
    typography.css   ← @font-face rules
    normalize.css    ← normalize.css v8
    reset.css        ← box-sizing, list reset
```

- **Tokens and themes** are custom properties on `:root`/`html`, so every component can use them with `var(...)` without importing anything.
- **Component styles** live in the component's own `<style>` block. Astro scopes them, so they can't leak into other components.
- **Global styles** go in `src/styles/`: fonts, reset, tokens, themes and the few global helpers (`.visually-hidden`).
- **Exception:** a global rule that only exists for one component's behaviour stays in that component, wrapped in `:global(...)`. Example: `Menu.astro` locks the page scroll with `:global(html:has(...))` while the menu is open.

## 3. Tokens

All tokens are in `src/styles/base/tokens.css`.

| Group | Tokens | Use |
|---|---|---|
| Fonts | `--font-title`, `--font-title-italic`, `--font-body`, `--font-body-italic`, `--font-body-regular`, `--font-body-bold` | `font-family: var(--font-body)` |
| Colours | `--color-green-*`, `--color-pink-*`, `--color-light`, `--color-dark`, `--color-white`, `--color-*grey` | Only in `themes.css`. Components use the role colours (see [Theming](#4-theming)) |
| Text sizes | `--text-xs` … `--text-2xl` | `font-size: var(--text-m)`. See [Fluid sizing](#5-fluid-sizing) |

- **Colours are named by hue** (`--color-pink-dark`), not by role, so the palette reads like a palette. The role names live in `themes.css`.
- **Never hard-code a colour** in a component. If a colour is missing, add it to `tokens.css`, named by hue like the others, and point a role colour to it.
- **Adding a token:** add it to `tokens.css` with a short comment saying what it's for, and list it here.

## 4. Theming

`src/styles/base/themes.css` sets the **role colours** for each theme. Components only use these:

| Role | Light | Dark | Used for |
|---|---|---|---|
| `--color-bg` | `--color-light` | `--color-dark` | Page background, mobile menu overlay |
| `--color-text` | `--color-dark` | `--color-light` | Text, sun icon |
| `--color-link` | `--color-green-dark` | `--color-green-lighter` | Links, social links' border and arrows |
| `--color-accent` | `--color-pink-dark` | `--color-pink-light` | Headline highlights, About numbers, experience titles |
| `--color-border` | `--color-grey` | `--color-lighter-grey` | Card and list lines |

- An inline script in `BaseLayout`'s `<head>` adds the `dark` class to `<html>` before the first paint (so dark mode doesn't flash light), and `ThemeToggler.astro` switches it. The dark theme only redefines the role colours on `html.dark`, so **components never mention the theme**. The one exception is the toggle itself, which shows the sun or the moon.
- **Icons** use `stroke="currentColor"`, so they take the colour of the link around them.
- **New colour need?** Use an existing role. If none fits, add a role in `themes.css` with a value for both themes.
- The theme change fades `background-color` and `color` (0.25s), and doesn't fade with reduced motion.

## 5. Fluid sizing

Most sizes don't jump at a breakpoint. They grow in a straight line between a small and a large screen, and stop growing outside that range.

### Text sizes

Use the text tokens from `tokens.css`:

| Token | Size | Used for |
|---|---|---|
| `--text-xs` | 16px, grows only above ~1067px (`max(1rem, 1.5vw)`) | Name, role, desktop menu links |
| `--text-s` | 16px → 24px | Tags |
| `--text-m` | 20px → 32px | Dates, company |
| `--text-l` | 24px → 32px (from 680px) | Body text, About titles |
| `--text-xl` | 19.2px → 64px | Experience titles |
| `--text-2xl` | 25.6px → 80px | About numbers and specialities |

Unless noted, sizes grow between a 320px and a 1180px screen. Two sizes stay in their component because they're used once: the headline (`.header__title`, `clamp(1.925rem, 11vw, clamp(5rem, 4.5vw, 6rem))`) and the body text from 1180px (`clamp(2rem, 2vw, 2.5rem)`, which keeps growing to 40px at 2000px).

### How to read a fluid value

Every fluid value has the same shape:

```css
/*    smallest   start  growth  from        over   largest */
clamp(1.25rem,   1.25rem + 12 * (100vw - 320px) / 860, 2rem)
```

Read it as: **start at 20px (1.25rem); once the screen is wider than 320px, grow 12px over the next 860px; never go below 1.25rem or above 2rem.** So it's 20px on a 320px screen, 26px on a 750px screen and 32px from 1180px.

To change it, change the design numbers: the start size, how much it grows (32 − 20 = 12), from which screen (320px) and over how many pixels (1180 − 320 = 860). To shrink instead of grow, use `-`: `clamp(2rem, 3rem - 16 * (100vw - 320px) / 360, 3rem)` goes from 48px to 32px. [Utopia](https://utopia.fyi) is a handy calculator if you'd rather not do the sums.

### Rules

- **Text that changes with the screen uses a token.** Add a step to the scale only when no existing one is close enough. A size that stays the same at every width (e.g. the mobile menu links at `2rem`) can be a plain `rem` value in the component.
- **Spacing** used only once (paddings, gaps, margins) is written in place with the same `clamp()` shape.
- **Always keep `rem` ends.** A size in plain `vw` ignores the user's browser text size.
- **One value is often enough.** If the difference between screens doesn't matter visually, don't make it fluid.

### Breakpoints that remain

These change the layout, or a value that isn't a straight line between two screen sizes, so they stay as media queries:

| Where | Breakpoint | Why |
|---|---|---|
| `Menu.astro` | 680px (and below 680px) | Hamburger and full-screen overlay below, inline links above |
| `AboutMe.astro` | 1180px | Hand-placed 12-column grid |
| `BaseLayout.astro` | 680px | Page padding: none on phones, so cards use the full width; grows from 24px to 48px above |
| `BaseLayout.astro` | 1180px | Body text switches to `clamp(2rem, 2vw, 2.5rem)` (see above) |
| `ExperienceCard.astro` | 1180px | Project list limited to 70% of the card for readable lines; full width below |
| `ExperienceCard.astro` | 1180px | Title and dates on one line. With wrapping instead, cards at the same width would differ (dates beside short titles, below long ones) |
| `Header.astro` | up to 480px | Line break after "with", so the tagline keeps three lines instead of leaving "products" alone |

## 6. Breakpoints

Breakpoints are plain values, mobile-first:

- `@media (min-width: 680px)`: tablet and up
- `@media (min-width: 1180px)`: desktop
- `@media not all and (min-width: 680px)`: below tablet, without overlapping 680px
- `@media (max-width: 480px)`: only the tagline break in `Header.astro`

Use only these values. Where each one is used and why: "Breakpoints that remain" above.

Write `min-width`/`max-width`, never range syntax (`width >= 680px`): Safari before 16.4 ignores it.

They aren't named (`@custom-media --tablet`): that needs Lightning CSS and a draft CSS feature, for three values used in a few places. Revisit it with the design system.

## 7. BEM rules and patterns

Class names follow [BEM](https://getbem.com/): **block**, **block\_\_element**, **block--modifier**.

### Rules

1. **One block per component**, named after it: `Menu.astro` → `menu`, `ExperienceCard.astro` → `experience-card`.
2. **Elements are flat:** `menu__bar`, never `menu__toggle__bar`, however deep the HTML is.
3. **Modifiers are variants** and always go with the base class: `class="about__intro about__intro--role"`, never the modifier alone.
4. **State lives in attributes**, not modifiers: `aria-expanded`, `aria-current`, or `data-*` when no ARIA attribute fits. CSS reads it: `.menu__toggle[aria-expanded='true']`.
5. **Write class names in full**, so searching for a class finds every place it's used. No `&__title` (plain CSS can't build class names anyway).
6. **Style classes, not tags**: no bare `li` or `p` selectors in components.
7. **Global helpers** have no block prefix and live in `globals.css`: `.visually-hidden`.

### Nesting

Plain CSS nesting is fine for **pseudo-classes and media queries** inside a rule:

```css
.menu__toggle {
	display: flex;

	@media (min-width: 680px) {
		display: none;
	}
}
```

The build lowers it for older browsers. Don't nest one class inside another: write `.menu__toggle[aria-expanded='true'] .menu__bar` as one flat selector.

### Do and don't

| Don't | Do |
|---|---|
| `<span class="header__headline--highlighted">` (modifier without its base) | `<span class="header__highlight">` (an element) |
| `<span class="header__nowrap">` (names what the CSS does) | `<span class="header__phrase">` (names what it is; the CSS decides it doesn't wrap) |
| `.menu-toggle.is-open` | `.menu__toggle[aria-expanded='true']` |
| `<p class="intro intro--role role">` | `<p class="about__intro about__intro--role">` |
| `li { … }` in a component | `.socials-nav__item { … }` |
| `.dark .card { … }` in a global file | `border-color: var(--color-border)` in the component |

### Patterns

- **Styling a child component:** Astro's scoped styles don't reach into another component, so pass it a class of your own block: `<Link class="menu__link">`, `<ArrowIcon class="socials-nav__icon" />`, and style `.menu__link` as usual. The child accepts `class` and spreads `...rest` on its root element: `...rest` carries the parent's scope attribute, without which the parent's styles can't reach it (see [Astro: passing a class to a child component](https://docs.astro.build/en/guides/styling/#passing-a-class-to-a-child-component)). `Link` and the icons already do this.
- **`:global()`** is only for HTML that isn't a component you can pass a class to: content from `set:html` (below) and page-level rules like `Menu.astro`'s `html:has(...)` scroll lock.
- **HTML from data (`set:html`):** it isn't scoped either. Style it from the component that renders it: `ExperienceCard` styles `.experience-card__title :global(.experience-card__highlight)`, the class used in `experience.json`.
- **Shared shells:** `BaseCard` owns the `base-card` block (padding and line). The content inside gets its own block (`experience-card`), so the two never fight over the same class. Every block matches its file name: `BaseCard` → `base-card`, `Card` → `card`, `ExperienceCard` → `experience-card`.

## 8. Browser support

Safari 15.4+, Chrome/Edge 105+ and Firefox 121+, set as `build.cssTarget` in `astro.config.mjs`.

- Before using a CSS feature, check on [caniuse.com](https://caniuse.com) that it works in all of them. `:has()` sets the Firefox minimum.
- Nesting is lowered by the build for these targets, so it's safe.
- Keep `cssTarget`: without it, the build rewrites `min-width` into range syntax, which Safari before 16.4 ignores.

## 9. Accessibility

- **Text size:** sizes are in `rem`, or `clamp()` with `rem` ends, so text follows the user's browser settings. Check the page with the browser text size at 200%.
- **Contrast:** check text and icon colours against the background in both the light and dark theme.
- **Focus:** everything interactive needs a visible focus style, and tab order must match the visual order. Don't reorder with CSS `order`.
- **Motion:** every animation or transition has a `@media (prefers-reduced-motion: reduce)` rule that turns it off. Known gap: the photo's scroll fade-in in `Socials.astro`.
- **Hidden headings:** sections have an `<h2>` for screen readers, hidden with the global `.visually-hidden` class.

## 10. Checklist for a new component

- [ ] One block, named after the component; flat elements; modifiers only with their base class.
- [ ] Colours from the role tokens (`--color-text`, `--color-accent`…), never hex and never `.dark` selectors.
- [ ] Text sizes from the `--text-*` scale; fonts from `--font-*`.
- [ ] Sizes in `rem`; fluid values with the `clamp()` shape above, `rem` ends.
- [ ] No new breakpoint unless the layout really changes; `min-width`/`max-width`, never range syntax.
- [ ] Interactive state in an attribute (`aria-*`/`data-*`), visible focus style, reduced-motion rule for any transition.
- [ ] Checked in light and dark, at 375px and 1440px.
