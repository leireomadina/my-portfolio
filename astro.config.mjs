import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://astro.build/config
export default defineConfig({
	site: 'https://leireomadina.vercel.app',
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
		build: {
			cssMinify: 'esbuild',
			// Without a target, esbuild rewrites min/max-width media queries into range
			// syntax (`width>=680px`), which Safari < 16.4 ignores, breaking the layout there
			cssTarget: ['chrome105', 'edge105', 'firefox121', 'safari15.4'],
		},
	},
	adapter: vercel({
		imageService: true,
		devImageService: 'sharp',
	}),
})
