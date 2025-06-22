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

        expect(result).toContain('Section content')
    })

    it('should render correctly with all props', async () => {
        const container = await AstroContainer.create()
        const result = await container.renderToString(BaseSection, {
            props: {
                id: 'test-id',
                class: 'test-class'
		    },
        })

        expect(result).toContain('id="test-id"')
        expect(result).toMatch(/class="[^"]*\btest-class\b[^"]*"/)
    })
})