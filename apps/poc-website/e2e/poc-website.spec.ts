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
    // there should ever need a shadow root to render its structure or its grouping.
    // The one real <ds-accordion> on the page lives in the Stresstest section instead.
    expect(html.match(/<ds-accordion[\s>]/g)).toHaveLength(1)
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
    for (const type of ['header', 'hero', 'text', 'teasergrid', 'carousel', 'faq', 'stresstest', 'cta', 'footer']) {
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

    // The hero/teaser/gallery images load from an external placeholder host; default
    // waitUntil: 'load' blocks on those image requests and can hang well past any
    // reasonable timeout if that host is unreachable from the test environment. The
    // page's own markup is finished long before any image request resolves.
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Versichern, was Ihnen wichtig ist')
    await expect(page.locator('ds-button')).toBeVisible()

    // Stencil strips its hydration annotations once it adopts the server-rendered shadow
    // roots. A leftover c-id means the client re-rendered instead of claiming.
    await expect(page.locator('[c-id]')).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test('the FAQ accordion opens one entry and closes the others natively', async ({ page }) => {
    // The hero/teaser/gallery images load from an external placeholder host; default
    // waitUntil: 'load' blocks on those image requests and can hang well past any
    // reasonable timeout if that host is unreachable from the test environment. The
    // page's own markup is finished long before any image request resolves.
    await page.goto('/', { waitUntil: 'domcontentloaded' })

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
    // The hero/teaser/gallery images load from an external placeholder host; default
    // waitUntil: 'load' blocks on those image requests and can hang well past any
    // reasonable timeout if that host is unreachable from the test environment. The
    // page's own markup is finished long before any image request resolves.
    await page.goto('/', { waitUntil: 'domcontentloaded' })

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
    // The hero/teaser/gallery images load from an external placeholder host; default
    // waitUntil: 'load' blocks on those image requests and can hang well past any
    // reasonable timeout if that host is unreachable from the test environment. The
    // page's own markup is finished long before any image request resolves.
    await page.goto('/', { waitUntil: 'domcontentloaded' })

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
    // The hero/teaser/gallery images load from an external placeholder host; default
    // waitUntil: 'load' blocks on those image requests and can hang well past any
    // reasonable timeout if that host is unreachable from the test environment. The
    // page's own markup is finished long before any image request resolves.
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})

/**
 * The CMS team's actual worry: does a web component swallow the native HTML slotted
 * into it? These checks read the live proof panel `stressTestScript` (page.ts) computes
 * client-side, after hydration — not a visual spot-check, a measured DOM fact.
 */
test.describe('native markup inside a web component', () => {
  test('nothing in the slot is moved into the shadow DOM, and global CSS still reaches it', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))

    // The hero/teaser/gallery images load from an external placeholder host; default
    // waitUntil: 'load' blocks on those image requests and can hang well past any
    // reasonable timeout if that host is unreachable from the test environment. The
    // page's own markup is finished long before any image request resolves.
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.locator('#stress-proof .demo-check').first().waitFor()

    const rows = await page.locator('#stress-proof .demo-check').evaluateAll(els =>
      els.map(el => ({
        label: el.querySelector('.demo-check-label')?.textContent?.trim(),
        value: el.querySelector('.demo-check-value')?.textContent?.trim(),
        ok: el.classList.contains('is-ok'),
      })),
    )

    expect(errors).toEqual([])
    // Every check this panel runs must pass — a `bad` row here means the component
    // actually did swallow or restyle the author's markup, which is the one thing
    // this whole section exists to rule out.
    for (const row of rows) expect(row.ok, row.label).toBe(true)

    expect(rows.find(r => r.label?.includes('ins Shadow DOM verschoben'))?.value).toBe('0')
    expect(Number(rows.find(r => r.label?.includes('Native Elemente im Slot'))?.value)).toBeGreaterThanOrEqual(10)
  })

  test('the deeply nested AEM component instrumentation survives inside the slot', async ({ request }) => {
    const html = await (await request.get('/')).text()

    // A "text" AEM component nested inside the accordion's content slot, the same way
    // AEM authoring lets an editor drop one component inside another's resource tree.
    expect(html).toContain('data-cmp-is="text-nested"')
  })

  test('the accordion still renders its content with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    // The hero/teaser/gallery images load from an external placeholder host; default
    // waitUntil: 'load' blocks on those image requests and can hang well past any
    // reasonable timeout if that host is unreachable from the test environment. The
    // page's own markup is finished long before any image request resolves.
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // SSR + declarative shadow DOM means the component's own chrome (marker, summary)
    // and the slotted native content both render without any JavaScript at all — only
    // the live proof panel (which needs JS to measure anything) stays empty, by design.
    await expect(page.getByText('Ablauf in vier Schritten')).toBeVisible()
    await expect(page.getByText('Checkliste Wasserschaden')).toBeVisible()
    await expect(page.locator('#stress-proof .demo-check')).toHaveCount(0)

    await context.close()
  })
})

/**
 * The stats strip at the foot of the page counts real tags in the authored markup
 * (see page.ts), so these numbers must stay in lockstep with the page content.
 */
test.describe('stats strip', () => {
  test('names the three real components and counts their instances', async ({ page }) => {
    // The hero/teaser/gallery images load from an external placeholder host; default
    // waitUntil: 'load' blocks on those image requests and can hang well past any
    // reasonable timeout if that host is unreachable from the test environment. The
    // page's own markup is finished long before any image request resolves.
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const stats = page.locator('.demo-stats')
    await expect(stats).toBeVisible()
    await expect(stats).toContainText('ds-button, ds-carousel, ds-accordion')

    // 3 real component kinds; this page uses 3 instances of them (1 button, 1 carousel,
    // 1 accordion — the Stresstest section's only). The FAQ's 4 <details name="faq">
    // entries are native, not counted here on purpose.
    const numbers = (await stats.locator('.demo-stats__number').allTextContents()).map(text => text.trim())
    expect(numbers[0]).toBe('3')
    expect(numbers[1]).toBe('3')
  })

  test('is still readable with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    // The hero/teaser/gallery images load from an external placeholder host; default
    // waitUntil: 'load' blocks on those image requests and can hang well past any
    // reasonable timeout if that host is unreachable from the test environment. The
    // page's own markup is finished long before any image request resolves.
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('.demo-stats')).toBeVisible()

    await context.close()
  })
})
