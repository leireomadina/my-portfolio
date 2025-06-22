import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import BaseSection from '../src/components/BaseSection.astro'

describe('Base section component', () => {
    it('should render correctly with default slot', async () => {
        const container = await AstroContainer.create()
        const result = await container.renderToString(BaseSection, {
            slots: {
                default: 'Section content',
            },
        })

        document.body.innerHTML = result

        const section = document.querySelector('section')
        expect(section).not.toBeNull()
        expect(section?.textContent).toContain('Section content')
    })

    it('should render correctly with all props', async () => {
        const container = await AstroContainer.create()
        const result = await container.renderToString(BaseSection, {
            props: {
                id: 'test-id',
                class: 'test-class'
		    },
        })

        document.body.innerHTML = result
        const section = document.querySelector('section')
        expect(section).not.toBeNull()
        expect(section?.getAttribute('id')).toBe('test-id')
        expect(section?.classList.contains('test-class')).toBe(true)
    })
})