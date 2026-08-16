import { builtinEnvironments, type Environment } from 'vitest/runtime'

const environment: Environment = {
	name: 'happy-dom-ssr',
	viteEnvironment: 'ssr',
	setup: (global, options) => builtinEnvironments['happy-dom'].setup(global, options),
}

export default environment
