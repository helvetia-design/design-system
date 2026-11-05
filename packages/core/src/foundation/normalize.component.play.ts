import { expect, test } from '@helvetia-design/playwright'
import type { Page } from '@playwright/test'

const DESIGN_SYSTEM_CSS = require.resolve('@helvetia-design/styles/css/design-system.min')
const ZERO_WIDTH_SPACE = '"​"'
const SAFARI_LIST_FIX = { content: ZERO_WIDTH_SPACE, float: 'left' }

const mount = async (page: Page, html: string, authorCss = '') => {
  await page.setContent(`<style>${authorCss}</style>${html}`)
  await page.addStyleTag({ path: DESIGN_SYSTEM_CSS })
}

const beforeOf = (page: Page) =>
  page.getByTestId('item').evaluate(el => {
    const style = getComputedStyle(el, '::before')
    return { content: style.content, float: style.cssFloat }
  })

test.describe('normalize nav li::before', () => {
  test('adds the zero-width space to plain nav list items', async ({ page }) => {
    await mount(page, '<nav><ul><li data-testid="item">Item</li></ul></nav>')
    expect(await beforeOf(page)).toEqual(SAFARI_LIST_FIX)
  })

  for (const tag of ['bal-nav', 'bal-pagination', 'bal-tabs']) {
    test(`skips list items inside ${tag}`, async ({ page }) => {
      await mount(page, `<${tag}><nav><ul><li data-testid="item">Item</li></ul></nav></${tag}>`)
      expect(['none', 'normal']).toContain((await beforeOf(page)).content)
    })
  }

  test('skips nested list items inside a Baloise component', async ({ page }) => {
    await mount(page, '<bal-nav><nav><ul><li><ul><li data-testid="item">Item</li></ul></li></ul></nav></bal-nav>')
    expect(['none', 'normal']).toContain((await beforeOf(page)).content)
  })

  test('keeps the fix for Baloise-like classes outside Baloise components', async ({ page }) => {
    await mount(page, '<nav><ul class="bal-pagination__list"><li data-testid="item">Item</li></ul></nav>')
    expect(await beforeOf(page)).toEqual(SAFARI_LIST_FIX)
  })

  test('keeps zero specificity against earlier author rules', async ({ page }) => {
    await mount(page, '<nav><ul><li data-testid="item">Item</li></ul></nav>', `nav li::before { content: 'x'; }`)
    expect((await beforeOf(page)).content).toBe('"x"')
  })
})
