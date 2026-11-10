import { expect, test } from '@playwright/test'

test.describe('server-rendered demo page', () => {
  test('the response is a finished page before any JavaScript runs', async ({ request }) => {
    const response = await request.get('/')
    expect(response.ok()).toBeTruthy()

    const html = await response.text()

    // Every ds-* element carries its shadow root in the response itself.
    expect(html).toContain('shadowrootmode')
    expect(html).toMatch(/<ds-accordion[\s>]/)
    expect(html).toMatch(/<ds-carousel[\s>]/)
    expect(html).toMatch(/<ds-button[\s>]/)

    // Headlines and body copy are present as text, not as an empty shell.
    expect(html).toContain('Versichern, was Ihnen wichtig ist')
    expect(html).toContain('Sicherheit, die mitwächst')
    expect(html).toContain('Wie melde ich einen Schaden?')
    expect(html).toContain('Vereinbaren Sie ein unverbindliches Gespräch')
  })

  test('hydration claims the server-rendered markup without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', error => errors.push(error.message))

    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Versichern, was Ihnen wichtig ist')
    await expect(page.locator('ds-button')).toBeVisible()

    // Stencil strips its hydration annotations once it adopts the server-rendered shadow
    // roots. A leftover c-id means the client re-rendered instead of claiming.
    await expect(page.locator('[c-id]')).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test('the accordion toggles once JavaScript has run', async ({ page }) => {
    await page.goto('/')

    const summary = page.locator('ds-accordion').nth(1).locator('button')
    await expect(summary).toHaveAttribute('aria-expanded', 'false')

    await summary.click()
    await expect(summary).toHaveAttribute('aria-expanded', 'true')
  })

  test('the page is readable with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('Sicherheit, die mitwächst')).toBeVisible()

    // Components render their content, they just do not react to clicks. The first FAQ
    // entry is server-rendered open, so an answer is readable without JavaScript too.
    await expect(page.locator('ds-button')).toBeVisible()
    await expect(page.locator('ds-carousel')).toBeVisible()
    await expect(page.getByText('Am schnellsten geht es über das Kundenportal')).toBeVisible()

    await context.close()
  })

  test('nothing overflows horizontally at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto('/')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
