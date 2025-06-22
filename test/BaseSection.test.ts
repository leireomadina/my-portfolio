import { renderAstroComponent } from "../test/helpers.ts"
import { describe, expect, it } from 'vitest'
import BaseSection from '@components/BaseSection.astro'

describe('Base section component', () => {
    it('should render correctly with default slot', async () => {
        const result = await renderAstroComponent(BaseSection, {
            slots: {
                default: 'Section content',
            },
        })

        const section = result.querySelector('section')
        expect(section).not.toBeNull()
        expect(section?.textContent).toContain('Section content')
    })

    it('should render correctly with all props', async () => {
        const result = await renderAstroComponent(BaseSection, {
            props: {
                id: 'test-id',
                class: 'test-class'
		    },
        })

        const section = result.querySelector('section')
        expect(section).not.toBeNull()
        expect(section?.getAttribute('id')).toBe('test-id')
        expect(section?.classList.contains('test-class')).toBe(true)
    })
})