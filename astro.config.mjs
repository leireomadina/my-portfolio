import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
	site: 'https://leireomadina.github.io/my-portfolio',
	integrations: [sitemap()],
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `
						@use "./src/styles/base/_functions.scss" as *;
						@use "./src/styles/base/_mixins.scss" as *;
						@use "./src/styles/base/_variables.scss" as *;
					`
				}
			}
		}
	}
})
