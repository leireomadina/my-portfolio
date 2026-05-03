import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://astro.build/config
export default defineConfig({
	site: 'https://leireomadina.github.io/my-portfolio',
	integrations: [sitemap()],
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					api: 'modern-compiler',
					additionalData: `
						@use "${path.resolve(__dirname, './src/styles/base/_functions.scss')}" as *;
						@use "${path.resolve(__dirname, './src/styles/base/_mixins.scss')}" as *;
						@use "${path.resolve(__dirname, './src/styles/base/_variables.scss')}" as *;
					`,
				},
			},
		},
	},
	adapter: vercel({
		imageService: true,
		devImageService: 'sharp',
	}),
})
