// Source: https://angelika.me/2025/02/01/astro-component-unit-tests/
import type { ComponentProps } from 'astro/types'
import { experimental_AstroContainer as AstroContainer, type ContainerRenderOptions } from 'astro/container'

type AstroContainerInstance = Awaited<ReturnType<typeof AstroContainer.create>>

type AstroComponentFactory = Parameters<AstroContainerInstance['renderToString']>[0]

type RenderOptions<T extends AstroComponentFactory> = Omit<ContainerRenderOptions, 'props'> & {
  // @ts-expect-error ComponentProps no encaja exactamente
  props?: ComponentProps<T>
};

export async function renderAstroComponent<T extends AstroComponentFactory>(
  Component: T,
  options: RenderOptions<T> = {},
) {
  const container = await AstroContainer.create()
  const result = await container.renderToString(Component, options)

  const template = document.createElement('template')
  template.innerHTML = result

  return template.content
}