import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
	site: 'https://leireomadina.vercel.app',
	integrations: [sitemap()],
	vite: {
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
