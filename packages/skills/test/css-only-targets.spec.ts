import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)

function resolveDesignSystemCss() {
  try {
    return require.resolve('@helvetia-design/styles/css/design-system')
  } catch (cause) {
    throw new Error('Build @helvetia-design/styles first: pnpm --filter @helvetia-design/styles build', { cause })
  }
}

const css = readFileSync(resolveDesignSystemCss(), 'utf8')

function migration(name: string) {
  return readFileSync(
    fileURLToPath(new URL(`../skills/ds-migrate-from-baloise/components/${name}/migration.md`, import.meta.url)),
    'utf8',
  )
}

const writtenSelectors: Record<string, string[]> = {
  'table': ['.ds-table', '.ds-table.is-wide'],
  'form': [],
  'time-input': [
    '.ds-field',
    '.ds-label',
    '.ds-control',
    '.ds-help',
    '.ds-time-input',
    '.ds-field.is-danger',
    '.ds-field.is-success',
    '.ds-field.is-warning',
    '.ds-field.is-disabled',
  ],
}

const elementsAndPackages = new Set(['ds-angular', 'ds-core', 'ds-form', 'ds-hint', 'ds-migration-report', 'ds-react'])

function escape(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

describe.each(Object.entries(writtenSelectors))('components/%s/migration.md CSS targets', (name, selectors) => {
  const text = migration(name)

  it('finds a design-system.css rule for every class it writes', () => {
    for (const selector of selectors) {
      expect(css, selector).toMatch(new RegExp(`${escape(selector)}(?![\\w-])`))
    }
  })

  it('names every class it writes', () => {
    for (const selector of selectors) {
      for (const cls of selector.split('.').filter(Boolean)) {
        expect(text, cls).toContain(cls)
      }
    }
  })

  it('writes no other ds-* class', () => {
    const written = new Set(selectors.flatMap(selector => selector.split('.').filter(Boolean)))
    const tokens = new Set(text.match(/(?<![\w-])ds-[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? [])
    const unknown = [...tokens].filter(token => !written.has(token) && !elementsAndPackages.has(token))

    expect(unknown).toEqual([])
  })
})
