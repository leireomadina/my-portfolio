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

## Architecture

- **Single page**: `src/pages/index.astro` composes section components inside `src/layouts/BaseLayout.astro`, which holds all `<head>` SEO/OG meta and imports `src/styles/globals.scss`. `Projects.astro` and `OtherProjects.astro` exist but are not currently mounted in `index.astro`.
- **Content is data-driven**: sections render from JSON in `src/data/` (`experience.json`, `projects.json`, `otherProjects.json`, `socials.json`), imported via named import, e.g. `import { projects } from '@data/projects.json'`. Edit copy there, not in components.
  - `ExperienceCard` renders titles with `set:html`, so `experience.json` titles may contain HTML. The `.card__title--highlighted` class used inside that HTML is defined globally in `globals.scss` because scoped component styles can't reach it.
- **Base building blocks**: `BaseSection` (`<section>` with optional `id`/`class`), `BaseWrapper`, `BaseCard`, and `Link` (handles external links) are reused across sections.
- **In-page navigation**: `Menu.astro` links to `#about`, `#socials`, `#experience`; those ids live on `AboutMe`, `Socials`, and the `BaseSection` in `Experience`. Keep them in sync when renaming sections.
- **Path aliases** (tsconfig): `@components/*`, `@layouts/*`, `@pages/*`, `@assets/*`, `@data/*`.

## Styling

- `astro.config.mjs` auto-injects `src/styles/base/_functions.scss`, `_mixins.scss`, and `_variables.scss` into every SCSS block via Vite `additionalData`. Use `$font-*`/`$color-*` variables, `toRem()`, and breakpoint mixins directly in component `<style lang="scss">` without importing them.
- Never hard-code colours (hex/rgb) in component styles or `src/styles/base/_themes.scss`; use the `$color-*` variables from `_variables.scss`. If a colour has no variable, add one there, named by colour like the existing ones (e.g. `$color-green-lighter`, `$color-lighter-grey`), rather than by role. Plain `.scss` files such as `_themes.scss` don't get the auto-injection, so they need `@use 'variables' as *;`.
- Breakpoint mixins are mobile-first `min-width`: `mobile` (400px), `big-mobile` (500px), `tablet` (680px), `desktop` (1180px); plus `max-width` variants `only-mobile` (680px) and `only-small-mobile` (480px).
- **Dark mode**: `ThemeToggler.astro` toggles a `dark` class on `<html>` (persisted in `localStorage` under `COLOUR_MODE`, falling back to `prefers-color-scheme`). All dark-theme overrides live centrally in `src/styles/base/_themes.scss` using global selectors that target component class names, so renaming a component's classes requires updating `_themes.scss` too.
- Component styles are scoped by Astro by default; global rules go in `src/styles/`.

## Testing

Tests in `test/` render Astro components server-side with the experimental Astro Container API. Use `renderAstroComponent(Component, { props, slots })` from `test/helpers.ts`, which returns a DOM fragment you can query. Vitest runs in a custom `happy-dom` environment with Vite's SSR environment (`test/happy-dom-ssr-environment.ts`), configured through Astro's `getViteConfig` so aliases and SCSS injection work in tests. Vitest globals are off, so import `describe`/`it`/`expect` explicitly.

## Code style

Prettier: tabs, no semicolons, single quotes, `trailingComma: 'es5'`, with `prettier-plugin-astro`. ESLint uses `plugin:astro/recommended` with the TypeScript parser for `.astro` files.
