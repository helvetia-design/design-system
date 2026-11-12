import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } })

const errors = []
page.on('console', m => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', e => errors.push(e.message))

await page.goto('http://localhost:3210/')
await page.locator('text=Stresstest').scrollIntoViewIfNeeded()
await page.waitForTimeout(1500)

console.log('console/page errors:', errors)

const rows = await page.locator('#stress-proof .demo-check').evaluateAll(els =>
  els.map(el => ({
    label: el.querySelector('.demo-check-label')?.textContent,
    value: el.querySelector('.demo-check-value')?.textContent,
    ok: el.classList.contains('is-ok'),
    bad: el.classList.contains('is-bad'),
  })),
)
console.log(JSON.stringify(rows, null, 2))

await page.screenshot({ path: '/tmp/stress-section.png', fullPage: false })
await browser.close()
