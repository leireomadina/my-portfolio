# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal single-page portfolio built with Astro + SCSS, deployed to Vercel (`@astrojs/vercel` adapter, site `https://leireomadina.vercel.app`). Package manager is **pnpm**.

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
- **Keep this file current**: when a change moves something described here (section ids, class names, mixins, file locations), update this file in the same change.

## Architecture

- **Single page**: `src/pages/index.astro` composes section components inside `src/layouts/BaseLayout.astro`, which holds all `<head>` SEO/OG meta and imports `src/styles/globals.scss`. `Projects.astro` and `OtherProjects.astro` exist but are not currently mounted in `index.astro`.
- **Content is data-driven**: sections render from JSON in `src/data/` (`experience.json`, `projects.json`, `otherProjects.json`, `socials.json`, `person.json`), imported via named import, e.g. `import { projects } from '@data/projects.json'`. Edit copy there, not in components.
  - `BaseLayout` builds the Person JSON-LD (structured data for search engines) from `person.json` (name, role, employer, location) and the `socials.json` links (`sameAs`). Keep `person.json` in sync with the visible page text.
  - `ExperienceCard` renders titles with `set:html`, so `experience.json` titles may contain HTML. The `.card__title--highlighted` class used inside that HTML is defined globally in `globals.scss` because scoped component styles can't reach it. Only use `set:html` for trusted content from `src/data/`, never for anything from outside the repo.
- **Base building blocks**: `BaseSection` (`<section>` with optional `id`/`class`), `BaseWrapper`, `BaseCard`, and `Link` (handles external links) are reused across sections.
- **In-page navigation**: the menu links come from `src/data/menu.json` (`#about`, `#socials`, `#experience`); those ids live on `AboutMe`, `Socials`, and the `BaseSection` in `Experience`. Keep them in sync when renaming sections.
- **Heading outline**: one `<h1>` in `Header` with the name and role (matches the `<title>`); the tagline under it is a `<p>`, not a heading. Each section starts with an `<h2>` named like its menu link (About, Socials, Experience), visually hidden with the global `.visually-hidden` class until sections get visible titles; headings inside a section are `<h3>` (experience cards add an `<h4>` for the company).
- **Menu** (`Menu.astro`): markup order is links → `<slot />` (Header passes `ThemeToggler`) → hamburger button, so DOM order matches the visual order on both layouts; don't reorder with CSS `order`. The button's `aria-expanded` is the only open/closed state: CSS derives the ✕, the overlay, the scroll lock and hiding the page behind it (mobile only, via `only-mobile`). The script only flips the attribute.
- **Minimal JS**: the site is static Astro with no UI framework; keep it that way. Use plain `<script>` tags and keep state in HTML attributes, as `Menu.astro` does with `aria-expanded`, so CSS can derive the rest. Don't add a client framework.
- **Path aliases** (tsconfig): `@components/*`, `@layouts/*`, `@pages/*`, `@assets/*`, `@data/*`.

## Styling

- `astro.config.mjs` auto-injects `src/styles/base/_functions.scss`, `_mixins.scss`, and `_variables.scss` into every SCSS block via Vite `additionalData`. Use `$font-*`/`$color-*` variables, `toRem()`, and breakpoint mixins directly in component `<style lang="scss">` without importing them.
- Never hard-code colours (hex/rgb) in component styles or `src/styles/base/_themes.scss`; use the `$color-*` variables from `_variables.scss`. If a colour has no variable, add one there, named by colour like the existing ones (e.g. `$color-green-lighter`, `$color-lighter-grey`), rather than by role. Plain `.scss` files such as `_themes.scss` don't get the auto-injection, so they need `@use 'variables' as *;`.
- Breakpoint mixins are mobile-first `min-width`: `mobile` (400px), `big-mobile` (500px), `tablet` (680px), `desktop` (1180px); plus `only-mobile` (everything below `tablet`, no overlap) and `only-small-mobile` (`max-width: 480px`). `tablet` and `only-mobile` share the private `$-tablet` value in `_mixins.scss`. Never hard-code breakpoint values in media queries or JS; use the mixins.
- **Browser support**: Safari 15.4+, Chrome/Edge 105+ and Firefox 121+, set as `build.cssTarget` in `astro.config.mjs`. Check that any CSS feature you use works there. Write media queries as `min-width`/`max-width`, never range syntax (`width >= 680px`), which Safari before 16.4 ignores. Keep the `cssTarget` too: without it, esbuild rewrites `min-width` into range syntax during the build.
- Don't size text in plain `vw`: it ignores the user's browser text size. Give it a `rem` floor: `fluid-small-text` (`max(1rem, 1.5vw)`) for the desktop name, role and menu links, and `fluid-vw(…vw)` from `_functions.scss` for large mobile text (floor = its size on a 280px screen, so the default design is unchanged).
- **Dark mode**: `ThemeToggler.astro` toggles a `dark` class on `<html>` (persisted in `localStorage` under `COLOUR_MODE`, falling back to `prefers-color-scheme`). All dark-theme overrides live centrally in `src/styles/base/_themes.scss` using global selectors that target component class names, so renaming a component's classes requires updating `_themes.scss` too. The page background is the `--color-bg` custom property (set per theme on `html`); surfaces that should match the page (e.g. the mobile menu overlay) use `var(--color-bg)` instead of adding dark-mode overrides.
- Component styles are scoped by Astro by default; global rules go in `src/styles/`. Exception: a global rule that only exists for one component's behaviour stays in that component with `:global(...)` (e.g. `Menu.astro`'s `html`/`body` rules that lock scroll and hide the page while the menu is open).

## Accessibility

- Use semantic HTML first; add `aria-*` only when HTML can't express it.
- Everything interactive must work with the keyboard, in a tab order that matches the visual order, with a visible focus style.
- Check colour contrast in both themes.
- Respect `prefers-reduced-motion` for any animation or transition.

## Testing

Add tests for new components, and for changes to a component's props, slots or rendered output. Style-only changes don't need one. Tests in `test/` render Astro components server-side with the experimental Astro Container API. Use `renderAstroComponent(Component, { props, slots })` from `test/helpers.ts`, which returns a DOM fragment you can query. Vitest runs in a custom `happy-dom` environment with Vite's SSR environment (`test/happy-dom-ssr-environment.ts`), configured through Astro's `getViteConfig` so aliases and SCSS injection work in tests. Vitest globals are off, so import `describe`/`it`/`expect` explicitly.

## Conventions

- **Class names** follow BEM (`card__title`, `info__content--year`), with one block per component.
- **Components**: PascalCase `.astro` files, each declaring its props with an `interface Props`. Reusable building blocks get the `Base*` prefix (`BaseSection`, `BaseCard`, `BaseWrapper`).
- **JS naming**: constants in `UPPER_SNAKE_CASE` (`DARK_THEME_CLASS`, `COLOUR_MODE`), booleans prefixed with `is` (`isMenuOpen`), functions named with a verb (`setColourMode`, `getInitialColourTheme`).
- **British spelling** in JS names and prose (`colour`, `behaviour`). Exceptions: CSS properties, and the existing `$color-*` SCSS variables and `--color-*` custom properties, which keep their names.
- **Comments** explain why, not what: the reason, constraint or trade-off the code itself can't show. Don't add a comment that only restates the code. Keep them short and direct, in plain, simple English.
- **Small, focused components**: one job each. When markup or styles start repeating, reuse or extend a `Base*` component rather than copying.
- **Formatting**: Prettier with tabs, no semicolons, single quotes, `trailingComma: 'es5'` and `prettier-plugin-astro`. ESLint uses `plugin:astro/recommended` with the TypeScript parser for `.astro` files.
- **Whitespace in markup**: Astro 7's default `compressHTML: 'jsx'` drops whitespace that contains a line break, so unlike plain HTML a line break between text and a tag is not a space. Where a space must survive, write it explicitly, e.g. `I build digital products{' '}` before a `<span>` on the next line (as in `Header.astro`'s tagline). This is also why Prettier sometimes breaks inside tags (moving `>` to the next line) when inline elements touch; don't work around it with `prettier-ignore` or `htmlWhitespaceSensitivity`.
