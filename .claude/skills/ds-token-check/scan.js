#!/usr/bin/env node

// Mechanical extraction + classification pass for ds-token-check. Does NOT propose
// aliases, component token names, or Figma gaps — that judgment stays with the agent
// (see SKILL.md "Workflow"). This script only answers: "which --ds-* var() calls exist
// in this component family's .scss/.tsx files, and which layer does each belong to?"

const fs = require('fs')
const path = require('path')
const { globSync } = require('glob')
const { checkNamingForKey, pascalToKebab } = require('./naming-rules')

const COMPONENTS_ROOT = 'packages/core/src/components'
const TOKENS_CSS_PATH = 'packages/tokens/dist/css/base.tokens.css'
const TOKENS_JSON_PATH = 'packages/tokens/tokens/Base.tokens.json'
const COMPONENT_TOKENS_KEY = '🧩 Component'

function findDSRoot() {
  let current = process.cwd()
  while (current !== '/') {
    if (fs.existsSync(path.join(current, COMPONENTS_ROOT))) return current
    current = path.dirname(current)
  }
  throw new Error("Could not find design system root. Make sure you're in the DS repo.")
}

// Finds the family directory for a component name — e.g. "tabs" or "tab" both resolve
// to packages/core/src/components/navigation/tabs/, the shared parent of tabs/, tab/,
// tab-panel/. Sub-components live as SIBLING directories under this same parent, never
// nested inside one another, per packages/core/CONTEXT.md's <category>/<name>/ layout.
function findFamilyDir(dsRoot, componentName) {
  const categoryDirs = fs
    .readdirSync(path.join(dsRoot, COMPONENTS_ROOT), { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  for (const category of categoryDirs) {
    const categoryPath = path.join(dsRoot, COMPONENTS_ROOT, category)
    const familyDirs = fs
      .readdirSync(categoryPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)

    for (const family of familyDirs) {
      if (family === componentName) {
        return { familyDir: path.join(categoryPath, family), familyKebab: family, category }
      }
    }
  }

  // Fallback: componentName might be a sub-component (e.g. "tab" inside the "tabs"
  // family) whose own directory doesn't match the family's name. Search one level
  // deeper for a directory literally named componentName, then return its parent.
  for (const category of categoryDirs) {
    const categoryPath = path.join(dsRoot, COMPONENTS_ROOT, category)
    const familyDirs = fs
      .readdirSync(categoryPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)

    for (const family of familyDirs) {
      const subDirs = fs
        .readdirSync(path.join(categoryPath, family), { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
      if (subDirs.includes(componentName)) {
        return { familyDir: path.join(categoryPath, family), familyKebab: family, category }
      }
    }
  }

  return null
}

// Every directory name that exists anywhere under packages/core/src/components — used
// to tell "component-foreign" (a real token belonging to some OTHER component, e.g.
// --ds-button-color-tertiary-base-text used inside ds-tabs) apart from "unknown"
// (doesn't match any known component namespace at all).
function listAllComponentDirNames(dsRoot) {
  const names = new Set()
  const categoryDirs = fs
    .readdirSync(path.join(dsRoot, COMPONENTS_ROOT), { withFileTypes: true })
    .filter(d => d.isDirectory())
  for (const category of categoryDirs) {
    const categoryPath = path.join(dsRoot, COMPONENTS_ROOT, category.name)
    const familyDirs = fs.readdirSync(categoryPath, { withFileTypes: true }).filter(d => d.isDirectory())
    for (const family of familyDirs) {
      names.add(family.name)
      const subDirs = fs
        .readdirSync(path.join(categoryPath, family.name), { withFileTypes: true })
        .filter(d => d.isDirectory())
      for (const sub of subDirs) names.add(sub.name)
    }
  }
  return names
}

function siblingComponentNames(familyDir) {
  return fs
    .readdirSync(familyDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'test')
    .map(d => d.name)
}

function collectSourceFiles(familyDir) {
  return [
    ...globSync(`${familyDir}/**/*.scss`, { ignore: `${familyDir}/test/**` }),
    ...globSync(`${familyDir}/**/*.tsx`, { ignore: `${familyDir}/test/**` }),
  ].sort()
}

// Pulls every `--ds-xxx` var() reference out of a line, alongside enough context to
// show the agent where it came from: the full line, and whether it's the 2nd argument
// of an `@include vars.local(name, ...)` call (the "resolution target" position) or a
// raw reference used directly in a CSS declaration.
const VAR_RE = /var\((--ds-[a-z0-9-]+)\)/g
const VARS_LOCAL_RE = /@include\s+vars\.local\(\s*([a-z0-9-]+)\s*,/

function extractUsages(file, dsRoot) {
  const relFile = path.relative(dsRoot, file)
  const lines = fs.readFileSync(file, 'utf-8').split('\n')
  const usages = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const varsLocalMatch = line.match(VARS_LOCAL_RE)
    let match
    VAR_RE.lastIndex = 0
    while ((match = VAR_RE.exec(line))) {
      usages.push({
        file: relFile,
        line: i + 1,
        token: match[1],
        context: line.trim(),
        viaVarsLocal: varsLocalMatch ? varsLocalMatch[1] : null,
      })
    }
  }

  return usages
}

function classify(token, familyKebab, siblingNames, allComponentNames, definedTokens) {
  if (!definedTokens.has(token)) return 'missing'
  if (token.startsWith('--ds-global-')) return 'global'
  if (token.startsWith('--ds-alias-')) return 'alias'
  if (token.startsWith('--ds-device-')) return 'device'

  const rest = token.slice('--ds-'.length)
  for (const name of [familyKebab, ...siblingNames]) {
    if (rest === name || rest.startsWith(`${name}-`)) return 'component-own'
  }
  for (const name of allComponentNames) {
    if (rest === name || rest.startsWith(`${name}-`)) return 'component-foreign'
  }
  return 'unknown'
}

function loadComponentLayer(dsRoot) {
  const tokensFile = path.join(dsRoot, TOKENS_JSON_PATH)
  const data = JSON.parse(fs.readFileSync(tokensFile, 'utf-8'))
  return data[COMPONENT_TOKENS_KEY] || {}
}

// Resolves every `component-own` token the family's CODE actually uses to the
// top-level 🧩 Component key it belongs to — NOT by guessing from folder names (a sub-
// component like "tab" may have no own key at all; its tokens live nested inside
// "Tabs", see SKILL.md's "Question 4" design note). Longest-kebab-prefix-match across
// every real top-level key disambiguates cases like "TabPanel" vs "Tabs" sharing the
// "tab" prefix.
function deriveComponentKeys(usages, componentLayer) {
  const topLevelKeys = Object.keys(componentLayer).filter(k => !k.startsWith('$'))
  const found = new Map() // key -> kebab

  for (const usage of usages) {
    if (usage.layer !== 'component-own') continue
    const rest = usage.token.slice('--ds-'.length)

    let best = null
    for (const key of topLevelKeys) {
      const kebab = pascalToKebab(key)
      if (rest === kebab || rest.startsWith(`${kebab}-`)) {
        if (!best || kebab.length > best.kebab.length) best = { key, kebab }
      }
    }
    if (best) found.set(best.key, best.kebab)
  }

  return found
}

function loadDefinedTokens(dsRoot) {
  const cssPath = path.join(dsRoot, TOKENS_CSS_PATH)
  if (!fs.existsSync(cssPath)) {
    throw new Error(`${TOKENS_CSS_PATH} not found — run \`pnpm tokens\` first.`)
  }
  const css = fs.readFileSync(cssPath, 'utf-8')
  const defined = new Set()
  const re = /(--ds-[a-z0-9-]+)\s*:/g
  let match
  while ((match = re.exec(css))) defined.add(match[1])
  return defined
}

function scan(componentName) {
  const dsRoot = findDSRoot()
  const found = findFamilyDir(dsRoot, componentName)
  if (!found) {
    throw new Error(`No component family directory found for "${componentName}" under ${COMPONENTS_ROOT}.`)
  }

  const { familyDir, familyKebab, category } = found
  const siblingNames = siblingComponentNames(familyDir)
  const allComponentNames = listAllComponentDirNames(dsRoot)
  const definedTokens = loadDefinedTokens(dsRoot)
  const files = collectSourceFiles(familyDir)

  const usages = []
  for (const file of files) {
    usages.push(...extractUsages(file, dsRoot))
  }

  for (const usage of usages) {
    usage.layer = classify(usage.token, familyKebab, siblingNames, allComponentNames, definedTokens)
  }

  const componentLayer = loadComponentLayer(dsRoot)
  const componentKeys = deriveComponentKeys(usages, componentLayer)

  const naming = []
  for (const [key, kebab] of componentKeys) {
    naming.push({ key, kebab, violations: checkNamingForKey(kebab, componentLayer[key]) })
  }

  return {
    dsRoot,
    category,
    familyKebab,
    familyDir: path.relative(dsRoot, familyDir),
    siblingNames,
    files: files.map(f => path.relative(dsRoot, f)),
    usages,
    componentKeys: [...componentKeys.keys()],
    naming,
  }
}

module.exports = { scan, findFamilyDir, findDSRoot }

if (require.main === module) {
  const componentName = process.argv[2]
  if (!componentName) {
    console.log('Usage: node scan.js <component-name>')
    process.exit(1)
  }
  try {
    const result = scan(componentName)
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}
