module.exports = {
	trailingComma: 'es5',
	useTabs: true,
	tabWidth: 2,
	semi: false,
	singleQuote: true,
	endOfLine: 'auto',
	plugins: [
		'prettier-plugin-astro',
	],
	overrides: [
    {
      files: '**/*.astro',
      options: {
				parser: 'astro',
			},
    },
  ],
}
