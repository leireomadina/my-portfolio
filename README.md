# Leire's Portfolio

Hi there! 👋
Keep in mind that the current version is a MVP. This means that the project is actively a work in progress, with continuous improvements and refinements underway. [Take a look](https://leireomadina.vercel.app/) and stay tuned for updates and new features.👀

## 🚀 Tech

This project was crafted using [Astro](https://astro.build/), a web framework designed for building content-driven websites. I chose it for the following reasons:
- Simplicity: based on HTML, CSS and JavaScript/TypeScript.
- Flexibility: component-based architecture and integration with JS frameworks like Vue or React for high interactive components (islands architecture). This facilitates reusability and project scalability.
- Server-first and zero JS by default: fast loading times and better user experience.
- Great SEO, ideal for a portfolio.

Astro has proven to be a remarkable discovery, and the development experience has been very enjoyable overall.

### Styling
- **SASS (SCSS)** with a global design system: variables, mixins and utility functions auto-injected into every component.

### Tooling
- **TypeScript** for type safety.
- **Vitest** + **happy-dom** for unit-testing Astro components via the Astro Container API.
- **ESLint** and **Prettier** for linting and formatting.

### Deployment
- Deployed to **Vercel** via the `@astrojs/vercel` adapter.

## 🧞 Commands

All commands are run from the root of the project using the terminal:

| Command                | Action                                                    |
| :--------------------- | :-------------------------------------------------------- |
| `pnpm install`         | Installs dependencies                                     |
| `pnpm dev`             | Starts local dev server at `localhost:4321`               |
| `pnpm build`           | Builds the production site to `./dist/`                   |
| `pnpm preview`         | Previews the build locally, before deploying              |
| `pnpm check`           | Runs `astro check` for type-checking against the project  |
| `pnpm test`            | Runs the test suite with Vitest                           |
| `pnpm lint:fix`        | Lints the project with ESLint and auto-fixes issues       |
| `pnpm format`          | Formats the code with Prettier                            |
| `pnpm astro ...`       | Runs CLI commands like `astro add` and `astro check`      |
| `pnpm astro --help`    | Gets help using the Astro CLI                              |


---

Thanks for stopping by! Your support and feedback are greatly appreciated. 😊
