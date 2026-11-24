# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal single-page portfolio built with Astro and plain CSS, deployed to Vercel (`@astrojs/vercel` adapter, site `https://leireomadina.vercel.app`). Package manager is **pnpm**.

## Commands

- `pnpm dev` — dev server at `localhost:4321`
- `pnpm build` / `pnpm preview` — production build to `dist/` and local preview
- `pnpm check` — `astro check` type-checking (tsconfig extends `astro/tsconfigs/strict`)
- `pnpm test` — Vitest (watch mode); `pnpm test --run` for a single pass
- Single test file: `pnpm test --run test/BaseSection.test.ts`; single test by name: `pnpm test --run -t "all props"`
- `pnpm lint:fix` — ESLint with auto-fix; `pnpm format` — Prettier write

## Astro docs

The project-scoped `astro-docs` MCP server (`.mcp.json`) exposes `search_astro_docs`. Before writing or changing code that uses an Astro API, config option or directive, check it there instead of relying on memory, especially experimental APIs like the Container API, which can break in minor releases. Compare what you find with the installed `astro` version, which is in `pnpm-lock.yaml` (`package.json` only has the allowed range). If the docs conflict with a rule in this file, this file wins: these are deliberate project choices.

## Workflow

- **Before calling a change done**, run `pnpm check`, `pnpm test --run` and `pnpm lint:fix`, plus `pnpm build` when config or dependencies changed. For visual changes, also check the page on the dev server in light and dark mode at mobile and desktop widths. The dev server sometimes keeps serving a component's old `<style>` CSS after an edit, even though the HTML updates. Check with `curl 'http://localhost:4321/src/components/<Name>.astro?astro&type=style&index=0&lang.css'`, then `touch` the file and reload the page to force a refresh.
- **Git**: don't commit or push unless asked. Work on feature branches (`feat/…`) and match the existing commit message style: a short imperative sentence such as "Add …" or "Fix …".
- **Dependencies**: don't add any without asking, and add them only with `pnpm`.
- **Keep this file current**: when a change moves something described here (section ids, class names, tokens, file locations), update this file in the same change.

## Architecture

- **Single page**: `src/pages/index.astro` composes section components inside `src/layouts/BaseLayout.astro`, which holds all `<head>` SEO/OG meta and imports `src/styles/globals.css`. `Projects.astro` and `OtherProjects.astro` exist but are not currently mounted in `index.astro`.
- **Content is data-driven**: sections render from JSON in `src/data/` (`experience.json`, `projects.json`, `otherProjects.json`, `socials.json`, `person.json`), imported via named import, e.g. `import { projects } from '@data/projects.json'`. Edit copy there, not in components.
  - `BaseLayout` builds the Person JSON-LD (structured data for search engines) from `person.json` (name, role, employer, location) and the `socials.json` links (`sameAs`). Keep `person.json` in sync with the visible page text.
  - `ExperienceCard` renders titles with `set:html`, so `experience.json` titles may contain HTML. The `.experience-card__highlight` class used inside that HTML is styled in `ExperienceCard.astro` with `:global()`, because scoped styles don't reach `set:html` content. Only use `set:html` for trusted content from `src/data/`, never for anything from outside the repo.
- **Base building blocks**: `BaseSection` (`<section>` with optional `id`/`class`), `BaseWrapper`, `BaseCard`, and `Link` (handles external links) are reused across sections.
- **In-page navigation**: the menu links come from `src/data/menu.json` (`#about`, `#socials`, `#experience`); those ids live on `AboutMe`, `Socials`, and the `BaseSection` in `Experience`. Keep them in sync when renaming sections.
- **Heading outline**: one `<h1>` in `Header` with the name and role (matches the `<title>`); the tagline under it is a `<p>`, not a heading. Each section starts with an `<h2>` named like its menu link (About, Socials, Experience), visually hidden with the global `.visually-hidden` class until sections get visible titles; headings inside a section are `<h3>` (experience cards add an `<h4>` for the company).
- **Menu** (`Menu.astro`): markup order is links → `<slot />` (Header passes `ThemeToggler`) → hamburger button, so DOM order matches the visual order on both layouts; don't reorder with CSS `order`. The button's `aria-expanded` is the only open/closed state: CSS derives the ✕, the overlay, the scroll lock and hiding the page behind it (mobile only, via `@media not all and (min-width: 680px)`). The script only flips the attribute.
- **Minimal JS**: the site is static Astro with no UI framework; keep it that way. Use plain `<script>` tags and keep state in HTML attributes, as `Menu.astro` does with `aria-expanded`, so CSS can derive the rest. Don't add a client framework.
- **Path aliases** (tsconfig): `@components/*`, `@layouts/*`, `@pages/*`, `@assets/*`, `@data/*`.

## Styling

- Styles are plain CSS (no Sass) in each component's `<style>` block. The full rules, tokens and BEM patterns are in `docs/styles.md`; follow it when writing styles.
- Tokens are custom properties in `src/styles/base/tokens.css`: fonts (`--font-*`), colours named by hue (`--color-pink-dark`) and text sizes (`--text-xs` … `--text-2xl`). Components use the role colours from `themes.css` (`--color-bg`, `--color-text`, `--color-link`, `--color-accent`, `--color-border`), never hue colours or hex values. If a colour is missing, add it to `tokens.css` by hue and point a role to it.
- Prefer fluid sizes (see below) and intrinsic layout over breakpoints. Use a breakpoint only when the layout really changes (the menu, the About grid, the experience card's title row and project list width, the page padding on phones and the body text on wide screens; see `docs/styles.md`). Breakpoints are mobile-first `min-width`: 680px (tablet) and 1180px (desktop); below tablet is `not all and (min-width: 680px)` (no overlap), and the tagline break uses `max-width: 480px`. Only use these values.
- **Browser support**: Safari 15.4+, Chrome/Edge 105+ and Firefox 121+, set as `build.cssTarget` in `astro.config.mjs`. Check that any CSS feature you use works there. Write media queries as `min-width`/`max-width`, never range syntax (`width >= 680px`), which Safari before 16.4 ignores. Keep the `cssTarget` too: without it, esbuild rewrites `min-width` into range syntax during the build.
- Don't size text in plain `vw`: it ignores the user's browser text size. Use the `--text-*` tokens for text. One-off fluid spacing is written in place as `clamp(<min>rem, <start>rem + <growth> * (100vw - <from>px) / <range>, <max>rem)`; see `docs/styles.md`.
- **Dark mode**: a `dark` class on `<html>`, saved in `localStorage` under `COLOUR_MODE` (falling back to `prefers-color-scheme`). An inline script in `BaseLayout`'s `<head>` sets it before the first paint, so dark mode doesn't flash light; `ThemeToggler.astro` flips it and its `aria-pressed`. Keep the two scripts' key and values in sync. `src/styles/base/themes.css` only redefines the role colours on `html.dark`; components use the roles and never mention the theme (the toggle's own sun/moon icons are the one exception). Icons use `stroke="currentColor"` to follow the link colour.
- Component styles are scoped by Astro by default; global rules go in `src/styles/`. Exception: a global rule that only exists for one component's behaviour stays in that component with `:global(...)` (e.g. `Menu.astro`'s `html`/`body` rules that lock scroll and hide the page while the menu is open).

## Accessibility

- Use semantic HTML first; add `aria-*` only when HTML can't express it.
- Everything interactive must work with the keyboard, in a tab order that matches the visual order, with a visible focus style.
- Check colour contrast in both themes.
- Respect `prefers-reduced-motion` for any animation or transition.

## Testing

Add tests for new components, and for changes to a component's props, slots or rendered output. Style-only changes don't need one. Tests in `test/` render Astro components server-side with the experimental Astro Container API. Use `renderAstroComponent(Component, { props, slots })` from `test/helpers.ts`, which returns a DOM fragment you can query. Vitest runs in a custom `happy-dom` environment with Vite's SSR environment (`test/happy-dom-ssr-environment.ts`), configured through Astro's `getViteConfig` so aliases and styles work in tests. Vitest globals are off, so import `describe`/`it`/`expect` explicitly.

## Conventions

- **Class names** follow BEM (`experience-card__title`, `about__content--year`), with one block per component, flat elements, modifiers only with their base class, state in `aria-*`/`data-*` attributes, and class names written in full. Rules and patterns in `docs/styles.md`.
- **Components**: PascalCase `.astro` files, each declaring its props with an `interface Props`. Reusable building blocks get the `Base*` prefix (`BaseSection`, `BaseCard`, `BaseWrapper`).
- **JS naming**: constants in `UPPER_SNAKE_CASE` (`DARK_THEME_CLASS`, `COLOUR_MODE`), booleans prefixed with `is` (`isMenuOpen`), functions named with a verb (`setColourMode`, `getInitialColourTheme`).
- **British spelling** in JS names and prose (`colour`, `behaviour`). Exceptions: CSS properties and the `--color-*` custom properties, which keep their names.
- **Comments** explain why, not what: the reason, constraint or trade-off the code itself can't show. Don't add a comment that only restates the code. Keep them short and direct, in plain, simple English.
- **Small, focused components**: one job each. When markup or styles start repeating, reuse or extend a `Base*` component rather than copying.
- **Formatting**: Prettier with tabs, no semicolons, single quotes, `trailingComma: 'es5'` and `prettier-plugin-astro`. ESLint uses a flat config (`eslint.config.js`): `@eslint/js` recommended plus `eslint-plugin-astro` recommended, with the TypeScript parser for `.ts` files and `.astro` scripts.
- **Whitespace in markup**: Astro 7's default `compressHTML: 'jsx'` drops whitespace that contains a line break, so unlike plain HTML a line break between text and a tag is not a space. Where a space must survive, write it explicitly, e.g. `I build digital products{' '}` before a `<span>` on the next line (as in `Header.astro`'s tagline). This is also why Prettier sometimes breaks inside tags (moving `>` to the next line) when inline elements touch; don't work around it with `prettier-ignore` or `htmlWhitespaceSensitivity`.
