import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Icons } from '@helvetia-design/assets'
import { afterEach, describe, expect, it } from 'vitest'
import { run, scanIconImports } from '../skills/ds-migrate-from-baloise/scripts/scan-icon-imports.mjs'

const scratches: string[] = []

afterEach(() => {
  for (const dir of scratches) rmSync(dir, { recursive: true, force: true })
  scratches.length = 0
})

function createScratchDir() {
  const dir = mkdtempSync(join(tmpdir(), 'ds-migrate-icon-imports-'))
  scratches.push(dir)
  return dir
}

function write(root: string, rel: string, contents: string) {
  const file = join(root, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, contents)
}

describe('scanIconImports', () => {
  it('lists icon imports, symbols, and namespace usages and skips comments, strings, and dist', () => {
    const root = createScratchDir()
    write(
      root,
      'src/AppShell.tsx',
      [
        "import * as balIcons from '@baloise/ds-icons'",
        "import { balIconStarFull, balIconNavGoDown as down } from '@baloise/ds-icons'",
        "import { useBaloiseDesignSystem } from '@baloise/ds-react'",
        "// import { balIconPlus } from '@baloise/ds-icons'",
        "const _note = 'balIconPlus from @baloise/ds-icons'",
        'const _custom = { balIconMyLogo: logo }',
        'useBaloiseDesignSystem({ defaults: { icons: { ...balIcons, ...custom } } })',
        'const _other = notbalIcons',
        'export const star = balIconStarFull',
        '',
      ].join('\n'),
    )
    write(
      root,
      'src/Teaser.tsx',
      [
        "import { balBrandIconLiabilityPurple } from '@baloise/ds-brand-icons'",
        'export const Teaser = () => <BalCard svg={balBrandIconLiabilityPurple} />',
        'export const Own = () => <BalCard svg={ownArtwork} />',
        '',
      ].join('\n'),
    )
    write(root, 'dist/ignored.tsx', "import * as balIcons from '@baloise/ds-icons'\n")

    expect(scanIconImports(root)).toEqual({
      total: 7,
      files: [
        {
          file: 'src/AppShell.tsx',
          findings: [
            { line: 1, snippet: "import * as balIcons from '@baloise/ds-icons'" },
            { line: 2, snippet: "import { balIconStarFull, balIconNavGoDown as down } from '@baloise/ds-icons'" },
            { line: 6, snippet: 'const _custom = { balIconMyLogo: logo }' },
            { line: 7, snippet: 'useBaloiseDesignSystem({ defaults: { icons: { ...balIcons, ...custom } } })' },
            { line: 9, snippet: 'export const star = balIconStarFull' },
          ],
        },
        {
          file: 'src/Teaser.tsx',
          findings: [
            { line: 1, snippet: "import { balBrandIconLiabilityPurple } from '@baloise/ds-brand-icons'" },
            { line: 2, snippet: 'export const Teaser = () => <BalCard svg={balBrandIconLiabilityPurple} />' },
          ],
        },
      ],
    })
  })

  it('finds an Angular registration and leaves templates without icon symbols alone', () => {
    const root = createScratchDir()
    write(
      root,
      'src/app/app.config.ts',
      [
        "import * as icons from '@baloise/ds-icons'",
        "import { provideBaloiseDesignSystem } from '@baloise/ds-angular'",
        'export const appConfig = { providers: [provideBaloiseDesignSystem({ defaults: { icons } })] }',
        '',
      ].join('\n'),
    )
    write(root, 'src/app/app.component.html', '<bal-icon name="star-full"></bal-icon>\n')

    expect(scanIconImports(root)).toEqual({
      total: 2,
      files: [
        {
          file: 'src/app/app.config.ts',
          findings: [
            { line: 1, snippet: "import * as icons from '@baloise/ds-icons'" },
            {
              line: 3,
              snippet: 'export const appConfig = { providers: [provideBaloiseDesignSystem({ defaults: { icons } })] }',
            },
          ],
        },
      ],
    })
  })

  it('limits the scan to the files it is given', () => {
    const root = createScratchDir()
    write(root, 'src/Migrated.tsx', "import { balIconPlus } from '@baloise/ds-icons'\n")
    write(root, 'src/Untouched.tsx', "import { balIconMinus } from '@baloise/ds-icons'\n")

    expect(scanIconImports(root, ['src/Migrated.tsx'])).toEqual({
      total: 1,
      files: [
        {
          file: 'src/Migrated.tsx',
          findings: [{ line: 1, snippet: "import { balIconPlus } from '@baloise/ds-icons'" }],
        },
      ],
    })
  })

  it('normalizes ./ and absolute file arguments and lists arguments that match no source file', () => {
    const root = createScratchDir()
    write(root, 'src/a/Migrated.tsx', "import { balIconPlus } from '@baloise/ds-icons'\n")
    write(root, 'src/Absolute.tsx', "import { balIconMinus } from '@baloise/ds-icons'\n")

    expect(scanIconImports(root, ['./src/a/Migrated.tsx', join(root, 'src/Absolute.tsx'), 'src/Missing.tsx'])).toEqual({
      total: 2,
      files: [
        {
          file: 'src/a/Migrated.tsx',
          findings: [{ line: 1, snippet: "import { balIconPlus } from '@baloise/ds-icons'" }],
        },
        {
          file: 'src/Absolute.tsx',
          findings: [{ line: 1, snippet: "import { balIconMinus } from '@baloise/ds-icons'" }],
        },
      ],
      unmatched: ['src/Missing.tsx'],
    })
  })

  it('scans plain JavaScript and Vue files', () => {
    const root = createScratchDir()
    for (const file of ['main.js', 'icons.mjs', 'legacy.cjs', 'config.mts', 'config.cts', 'App.vue']) {
      write(root, `src/${file}`, "import { balIconPlus } from '@baloise/ds-icons'\n")
    }

    expect(scanIconImports(root).files.map(entry => entry.file)).toEqual([
      'src/App.vue',
      'src/config.cts',
      'src/config.mts',
      'src/icons.mjs',
      'src/legacy.cjs',
      'src/main.js',
    ])
  })

  it('finds require, dynamic import, wrapped namespace imports, and template substitutions', () => {
    const root = createScratchDir()
    write(
      root,
      'src/main.ts',
      [
        "const legacy = require('@baloise/ds-brand-icons')",
        "const lazy = await import('@baloise/ds-icons')",
        'const text = "x \'@baloise/ds-icons\'"',
        'import * as ns',
        "  from '@baloise/ds-icons'",
        'register({ icons: ns })',
        'const html = `<i>${balIconPlus}</i>`',
        'const label = `balIconPlus`',
        'const _member = obj.ns',
        '',
      ].join('\n'),
    )
    write(
      root,
      'src/dollar.ts',
      ["import * as $icons from '@baloise/ds-icons'", 'use($icons)', 'use(my$icons)', ''].join('\n'),
    )

    expect(scanIconImports(root)).toEqual({
      total: 8,
      files: [
        {
          file: 'src/dollar.ts',
          findings: [
            { line: 1, snippet: "import * as $icons from '@baloise/ds-icons'" },
            { line: 2, snippet: 'use($icons)' },
          ],
        },
        {
          file: 'src/main.ts',
          findings: [
            { line: 1, snippet: "const legacy = require('@baloise/ds-brand-icons')" },
            { line: 2, snippet: "const lazy = await import('@baloise/ds-icons')" },
            { line: 4, snippet: 'import * as ns' },
            { line: 5, snippet: "from '@baloise/ds-icons'" },
            { line: 6, snippet: 'register({ icons: ns })' },
            { line: 7, snippet: 'const html = `<i>${balIconPlus}</i>`' },
          ],
        },
      ],
    })
  })

  it('prints the scan JSON and exits 0', () => {
    const root = createScratchDir()
    write(root, 'main.ts', "import { balIconPlus } from '@baloise/ds-icons'\n")
    let text = ''

    const code = run(root, {
      write(chunk: string) {
        text += chunk
      },
    })

    expect(code).toBe(0)
    expect(JSON.parse(text)).toEqual({
      total: 1,
      files: [{ file: 'main.ts', findings: [{ line: 1, snippet: "import { balIconPlus } from '@baloise/ds-icons'" }] }],
    })
  })
})

describe('shared/icons.md', () => {
  it('documents the name shim, the name map groups, and the registration rules', () => {
    const rules = readFileSync(
      fileURLToPath(new URL('../skills/ds-migrate-from-baloise/shared/icons.md', import.meta.url)),
      'utf8',
    )

    for (const phrase of [
      'scan-icon-imports.mjs',
      'alert-triangle',
      'info-circle',
      'icon-name-map.json',
      '`renamed`',
      '`approximated`',
      '`lost`',
      '`changed`',
      '@helvetia-design/assets',
      'BrandIcon<Name>',
      'initializeDesignSystem',
      'DsRootProvider',
      'shared/legacy-config.md',
    ]) {
      expect(rules, phrase).toContain(phrase)
    }
    expect(rules).not.toMatch(/import \* as \w+ from '@helvetia-design\/assets'/)
  })
})

describe('icon-name-map.json', () => {
  const mapPath = fileURLToPath(new URL('../skills/ds-migrate-from-baloise/shared/icon-name-map.json', import.meta.url))
  const map = JSON.parse(readFileSync(mapPath, 'utf8')) as {
    renamed: Record<string, string>
    approximated: Record<string, string>
    lost: string[]
    changed: string[]
  }
  const exists = (name: string) =>
    `Icon${name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')}` in Icons

  it('maps only names the new icon set does not have', () => {
    const legacy = [...Object.keys(map.renamed), ...Object.keys(map.approximated), ...map.lost]
    expect(legacy.filter(exists)).toEqual([])
    expect(new Set(legacy).size).toBe(legacy.length)
  })

  it('lists as changed only names both sets share', () => {
    const mapped = new Set([...Object.keys(map.renamed), ...Object.keys(map.approximated), ...map.lost])
    expect(map.changed.filter(name => !exists(name) || mapped.has(name))).toEqual([])
  })

  it('maps every legacy name onto an icon the new set has', () => {
    const targets = [...Object.values(map.renamed), ...Object.values(map.approximated)]
    expect(targets.filter(name => !exists(name))).toEqual([])
  })
})
