import js from '@eslint/js'
import eslintPluginAstro from 'eslint-plugin-astro'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'

export default [
	{
		ignores: ['.vscode/', 'public/', 'dist/', '.astro/', '.vercel/'],
	},
	js.configs.recommended,
	...eslintPluginAstro.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tsParser,
		},
	},
	{
		files: ['**/*.astro'],
		languageOptions: {
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: ['.astro'],
			},
		},
	},
]
