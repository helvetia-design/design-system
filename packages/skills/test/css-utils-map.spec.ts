import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { extractClasses, extractModifiers } from '../scripts/diff-css-utils.mjs'
import { loadMap, mapToken } from '../skills/ds-migrate-from-baloise/scripts/scan-css-utils.mjs'

type Group = { variants: string[]; bases: string[] }
type CssUtilsMap = {
  variants: {
    renamed: Record<string, string>
    lost: string[]
    unchanged: string[]
    identical: Group[]
    unsupported: Group[]
  }
  structure: Record<string, string>
  structureLost: Record<string, string[]>
  renamed: Record<string, string>
  approximated: Record<string, string>
  lost: string[]
  core: {
    structure: Record<string, string>
    structureLost: Record<string, string[]>
    lost: string[]
  }
}

const require = createRequire(import.meta.url)

function resolveStylesDir() {
  try {
    return dirname(require.resolve('@helvetia-design/styles/css/utilities'))
  } catch (cause) {
    throw new Error('Build @helvetia-design/styles first: pnpm --filter @helvetia-design/styles build', { cause })
  }
}

const stylesDir = resolveStylesDir()
const helvetiaCss = ['utilities.css', 'design-system.css'].map(file => readFileSync(join(stylesDir, file), 'utf8'))
const helvetia = new Set(helvetiaCss.flatMap(css => extractClasses(css)))

const fixture = (name: string) =>
  readFileSync(fileURLToPath(new URL(`./fixtures/css-utils/${name}`, import.meta.url)), 'utf8')
    .split('\n')
    .filter(Boolean)
const baloise = fixture('baloise-19.11.0-classes.txt')
const baloiseModifiers = fixture('baloise-19.11.0-modifiers.txt')

const map: CssUtilsMap = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../skills/ds-migrate-from-baloise/shared/css-utils-map.json', import.meta.url)),
    'utf8',
  ),
)
const index = loadMap(map)

function prefixes(names: Iterable<string>) {
  return new Set([...names].flatMap(name => (name.indexOf(':') > 0 ? [name.slice(0, name.indexOf(':'))] : [])))
}

function splitChain(name: string) {
  const known = new Set([...map.variants.unchanged, ...Object.keys(map.variants.renamed), ...map.variants.lost])
  const chain: string[] = []
  let base = name
  while (base.indexOf(':') > 0 && known.has(base.slice(0, base.indexOf(':')))) {
    chain.push(base.slice(0, base.indexOf(':')))
    base = base.slice(base.indexOf(':') + 1)
  }
  return { chain, base }
}

const structures = { ...map.structure, ...map.core.structure }
const structureLost = [map.structureLost, map.core.structureLost].flatMap(group =>
  Object.entries(group).flatMap(([structure, modifiers]) => modifiers.map(modifier => `${structure} ${modifier}`)),
)
const coreModifiers = [...new Set(Object.values(map.core.structureLost).flat())]
const baseKeys = [
  ...Object.keys(map.structure),
  ...Object.keys(map.renamed),
  ...Object.keys(map.approximated),
  ...map.lost,
  ...Object.values(map.structureLost).flat(),
  ...Object.keys(map.core.structure),
  ...map.core.lost,
]
const groupKeys = [...baseKeys, ...coreModifiers]
const values = [
  ...Object.values(map.structure),
  ...Object.values(map.renamed),
  ...Object.values(map.approximated),
  ...Object.values(map.core.structure),
]

describe('css-utils-map.json', () => {
  it('maps only Baloise classes that Helvetia lacks', () => {
    for (const key of baseKeys) {
      expect(baloise, key).toContain(key)
      expect(helvetia.has(key), key).toBe(false)
    }
    for (const modifier of coreModifiers) expect(baloise, modifier).toContain(modifier)
    for (const structure of Object.keys(map.core.structureLost)) expect(map.core.structure).toHaveProperty(structure)
  })

  it('gives the alias is-list the same lost modifiers as list', () => {
    expect(map.core.structureLost['is-list']).toEqual(map.core.structureLost.list)
  })

  it('maps every class to one that Helvetia ships', () => {
    for (const value of values) expect(helvetia.has(value), value).toBe(true)
  })

  it('never maps to a key, so a second run changes nothing', () => {
    const keys = new Set(groupKeys)
    for (const value of [...values, ...Object.values(map.variants.renamed)]) expect(keys.has(value), value).toBe(false)
    for (const value of Object.values(map.variants.renamed)) {
      expect(Object.keys(map.variants.renamed)).not.toContain(value)
    }
  })

  it('puts no class in two groups', () => {
    expect(new Set(groupKeys).size).toBe(groupKeys.length)
  })

  it('covers every Baloise-only class without a variant prefix with exactly one group', () => {
    const covered = new Set(groupKeys)
    const uncovered = baloise.filter(name => !helvetia.has(name) && splitChain(name).chain.length === 0)
    expect(uncovered.filter(name => !covered.has(name))).toEqual([])
  })

  it('knows every variant prefix of both sides', () => {
    const known = new Set([...map.variants.unchanged, ...Object.keys(map.variants.renamed), ...map.variants.lost])
    const helvetiaPrefixes = prefixes(helvetia)
    for (const prefix of [...prefixes(baloise), ...helvetiaPrefixes]) expect(known.has(prefix), prefix).toBe(true)
    for (const prefix of map.variants.unchanged) expect(helvetiaPrefixes.has(prefix), prefix).toBe(true)
    for (const prefix of map.variants.lost) {
      expect(prefixes(baloise).has(prefix), prefix).toBe(true)
      expect(helvetiaPrefixes.has(prefix), prefix).toBe(false)
    }
    for (const [from, to] of Object.entries(map.variants.renamed)) {
      expect(prefixes(baloise).has(from), from).toBe(true)
      expect(helvetiaPrefixes.has(to), to).toBe(true)
    }
  })

  it('lists only real tokens under identical and unsupported', () => {
    for (const { variants, bases } of map.variants.identical) {
      for (const token of variants.flatMap(v => bases.map(b => `${v}:${b}`))) {
        expect(baloise, token).toContain(token)
        expect(helvetia.has(token), token).toBe(true)
      }
    }
    for (const { variants, bases } of map.variants.unsupported) {
      for (const token of variants.flatMap(v => bases.map(b => `${v}:${b}`))) {
        expect(baloise, token).toContain(token)
        expect(helvetia.has(token), token).toBe(false)
      }
    }
  })

  it('leaves every class that Helvetia ships with the same name unchanged', () => {
    const changed = baloise.filter(name => helvetia.has(name) && mapToken(name, index) !== null)
    expect(changed).toEqual([])
  })

  it('maps every other Baloise class to a Helvetia class or reports it as lost', () => {
    const pairModifiers = new Set([...Object.values(map.structureLost).flat(), ...coreModifiers])
    const misses = baloise
      .filter(name => !helvetia.has(name) && !pairModifiers.has(name))
      .map(name => ({ name, move: mapToken(name, index) }))
      .filter(({ move }) => move === null || (move.to === null ? !move.group.endsWith('lost') : !helvetia.has(move.to)))
      .map(({ name, move }) => `${name} -> ${move?.to ?? 'unchanged'}`)
    expect(misses).toEqual([])
  })

  it('lists every structure modifier the Helvetia counterpart lacks, and only those', () => {
    const counterpart = new Set(helvetiaCss.flatMap(css => extractModifiers(css, Object.values(structures))))
    const missing = baloiseModifiers.filter(pair => {
      const [structure, modifier] = pair.split(' ')
      return !counterpart.has(`${structures[structure]} ${modifier}`)
    })
    expect([...structureLost].sort()).toEqual(missing.sort())
  })
})
