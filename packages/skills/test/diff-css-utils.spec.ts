import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  diffClasses,
  diffStylesheets,
  extractClasses,
  extractModifiers,
  parseArgs,
  run,
} from '../scripts/diff-css-utils.mjs'

const scratches: string[] = []

afterEach(() => {
  for (const dir of scratches) rmSync(dir, { recursive: true, force: true })
  scratches.length = 0
})

describe('extractClasses', () => {
  it('reads selectors only, unescapes variants, and skips keyframe steps and comments', () => {
    const css = [
      '/* .commented {} */',
      '.a, .widescreen\\:mb-small:hover > .b { width: 0.5em; margin: .01em }',
      '@media (min-width: 1280px) { .c { top: 0 } }',
      '@keyframes spin { 33.3% { opacity: 0 } }',
    ].join('\n')

    expect(extractClasses(css)).toEqual(['a', 'b', 'c', 'widescreen:mb-small'])
  })
})

describe('extractModifiers', () => {
  it('pairs every class that shares a compound selector with a structure class', () => {
    const css = '.grid.is-mobile > .col.is-half {} .container.is-fluid {} .other.is-x {}'

    expect(extractModifiers(css, ['grid', 'col', 'container'])).toEqual([
      'col is-half',
      'container is-fluid',
      'grid is-mobile',
    ])
  })

  it('skips the classes inside :not()', () => {
    const css = 'a.link:not(.button).is-light {} .select:not(.is-multiple)::after {}'

    expect(extractModifiers(css, ['link', 'select'])).toEqual(['link is-light'])
    expect(extractModifiers('.link:not(:is(.a, .b)).is-light {}', ['link'])).toEqual(['link is-light'])
  })
})

describe('diffClasses', () => {
  it('splits the lists and proposes only renames whose target Helvetia ships', () => {
    const diff = diffClasses(
      ['border-primary-hovered', 'text-red-pressed', 'grid', 'widescreen:flex', 'font-family-title', 'mb-small'],
      ['border-primary-hover', 'ds-grid', 'desktop-lg:flex', 'font-family-heading', 'mb-small', 'gap-sm'],
    )

    expect(diff.identical).toEqual(['mb-small'])
    expect(diff.helvetiaOnly).toEqual([
      'border-primary-hover',
      'ds-grid',
      'desktop-lg:flex',
      'font-family-heading',
      'gap-sm',
    ])
    expect(diff.proposed).toEqual({
      'border-primary-hovered': 'border-primary-hover',
      'grid': 'ds-grid',
      'widescreen:flex': 'desktop-lg:flex',
      'font-family-title': 'font-family-heading',
    })
  })

  it('proposes the ds-* counterpart of a core.css base class', () => {
    expect(diffClasses(['table', 'file'], ['ds-table']).proposed).toEqual({ table: 'ds-table' })
  })

  it('proposes the -active counterpart of a -pressed class', () => {
    expect(diffClasses(['text-red-pressed'], ['text-red-active']).proposed).toEqual({
      'text-red-pressed': 'text-red-active',
    })
  })
})

describe('diffStylesheets', () => {
  it('keeps the rules after a `/*` inside a string', () => {
    const css = '.a::before { content: "/*"; }\n.b { color: red }\n/* end */ .c {}'
    expect(diffStylesheets({ baloise: [{ css }], helvetia: [{ css: '.a {}' }] }).baloiseNames).toEqual(['a', 'b', 'c'])
  })
})

describe('parseArgs and run', () => {
  it('rejects a missing side and an unknown flag', () => {
    expect(() => parseArgs(['--baloise', 'a.css'])).toThrow(/Usage/)
    expect(() => parseArgs(['--nope', 'x'])).toThrow(/Unknown argument/)
    expect(() => parseArgs(['--baloise'])).toThrow(/Missing value/)
  })

  it('matches a filter class literally, not as a pattern', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ds-diff-css-utils-'))
    scratches.push(dir)
    writeFileSync(join(dir, 'b.css'), '.w-1\\.5 {} .w-125 {}')
    writeFileSync(join(dir, 'h.css'), '.x {}')
    let out = ''

    run(['--baloise', `${join(dir, 'b.css')}#w-1.5`, '--helvetia', join(dir, 'h.css')], {
      write: (chunk: string) => (out += chunk),
    } as NodeJS.WritableStream)

    expect(JSON.parse(out).baloiseOnly).toEqual(['w-1.5'])
  })

  it('keeps only the rules of the classes after `#` and writes the class and modifier lists', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ds-diff-css-utils-'))
    scratches.push(dir)
    writeFileSync(join(dir, 'core.css'), '.container, .other {} .container.is-fluid {} .columns {}')
    writeFileSync(join(dir, 'h.css'), '.ds-container {} .is-fluid {}')
    let out = ''

    const code = run(
      [
        '--baloise',
        `${join(dir, 'core.css')}#container`,
        '--helvetia',
        join(dir, 'h.css'),
        '--classes-out',
        join(dir, 'out.txt'),
        '--modifiers-out',
        join(dir, 'modifiers.txt'),
      ],
      { write: (chunk: string) => (out += chunk) } as NodeJS.WritableStream,
    )

    expect(code).toBe(0)
    expect(JSON.parse(out).baloiseOnly).toEqual(['container', 'other'])
    expect(JSON.parse(out).proposed).toEqual({ container: 'ds-container' })
    expect(readFileSync(join(dir, 'out.txt'), 'utf8')).toBe('container\nis-fluid\nother\n')
    expect(readFileSync(join(dir, 'modifiers.txt'), 'utf8')).toBe('container is-fluid\n')
  })
})
