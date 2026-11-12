import { expect, test } from '@playwright/test'

test.describe('server-rendered demo page', () => {
  test('the response is a finished page before any JavaScript runs', async ({ request }) => {
    const response = await request.get('/')
    expect(response.ok()).toBeTruthy()

    const html = await response.text()

    // Every ds-* element carries its shadow root in the response itself.
    expect(html).toContain('shadowrootmode')
    expect(html).toMatch(/<ds-carousel[\s>]/)
    expect(html).toMatch(/<ds-button[\s>]/)

    // The FAQ accordion is deliberately plain <details>, not <ds-accordion> — nothing
    // here should ever need a shadow root to render its structure or its grouping.
    expect(html).not.toMatch(/<ds-accordion[\s>]/)
    expect(html).toMatch(/<details class="ds-accordion[^"]*" name="faq"/)

    // Headlines and body copy are present as text, not as an empty shell.
    expect(html).toContain('Versichern, was Ihnen wichtig ist')
    expect(html).toContain('Sicherheit, die mitwächst')
    expect(html).toContain('Wie melde ich einen Schaden?')
    expect(html).toContain('Vereinbaren Sie ein unverbindliches Gespräch')
  })

  test('every AEM component section carries its CMS instrumentation', async ({ request }) => {
    const html = await (await request.get('/')).text()

    // One data-cmp-is per authored section — the actual "wrapper" a CMS needs to manage,
    // move, duplicate or track an instance of a block. Plain markup, never a custom element.
    // The server's pretty-printer re-serializes the fragment through a real DOM, which
    // normalizes the attribute to double quotes with the inner JSON quotes HTML-entity
    // escaped (`&quot;`) — standard, correct serialization, not the literal single-quoted
    // form page.ts writes. A browser (or DOMParser) decodes it back transparently.
    for (const type of ['header', 'hero', 'text', 'teasergrid', 'carousel', 'faq', 'cta', 'footer']) {
      expect(html, type).toContain(`data-cmp-is="${type}"`)
      expect(html, type).toContain(
        `data-cmp-data-layer="{&quot;${type}&quot;:{&quot;@type&quot;:&quot;helvetia/components/${type}&quot;}}"`,
      )
    }
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

  test('the FAQ accordion opens one entry and closes the others natively', async ({ page }) => {
    await page.goto('/')

    const entries = page.locator('details[name="faq"]')
    await expect(entries).toHaveCount(4)
    expect(await entries.evaluateAll(els => els.map(el => (el as HTMLDetailsElement).open))).toEqual([
      true,
      false,
      false,
      false,
    ])

    await entries.nth(2).locator('summary').click()
    expect(await entries.evaluateAll(els => els.map(el => (el as HTMLDetailsElement).open))).toEqual([
      false,
      false,
      true,
      false,
    ])
  })

  test('the page is readable with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('Sicherheit, die mitwächst')).toBeVisible()

    // ds-button/-carousel render their content, they just do not react to clicks without
    // the JS bundle. The first FAQ entry is server-rendered open, so its answer is
    // readable without JavaScript too.
    await expect(page.locator('ds-button')).toBeVisible()
    await expect(page.locator('ds-carousel')).toBeVisible()
    await expect(page.getByText('Am schnellsten geht es über das Kundenportal')).toBeVisible()

    await context.close()
  })

  test('the FAQ accordion still opens and closes natively with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')

    // Unlike ds-button/-carousel, <details name="faq"> is a native browser mechanism —
    // this is the one piece of interactivity this page keeps even with JS fully off.
    const entries = page.locator('details[name="faq"]')
    await entries.nth(1).locator('summary').click()

    expect(await entries.evaluateAll(els => els.map(el => (el as HTMLDetailsElement).open))).toEqual([
      false,
      true,
      false,
      false,
    ])

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

/**
 * The stats strip at the foot of the page counts real tags in the authored markup
 * (see page.ts), so these numbers must stay in lockstep with the page content.
 */
test.describe('stats strip', () => {
  test('names the two real components and counts their instances', async ({ page }) => {
    await page.goto('/')

    const stats = page.locator('.demo-stats')
    await expect(stats).toBeVisible()
    await expect(stats).toContainText('ds-button, ds-carousel')

    // 2 real component kinds; this page uses 2 instances of them (1 button, 1 carousel).
    // The FAQ's 4 <details name="faq"> entries are native, not counted here on purpose.
    const numbers = (await stats.locator('.demo-stats__number').allTextContents()).map(text => text.trim())
    expect(numbers[0]).toBe('2')
    expect(numbers[1]).toBe('2')
  })

  test('is still readable with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')

    await expect(page.locator('.demo-stats')).toBeVisible()

    await context.close()
  })
})
