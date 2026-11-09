#!/usr/bin/env node
import { realpathSync } from 'node:fs'
import { basename, extname, posix, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  baloiseDependencies,
  DEPENDENCY_FIELDS,
  detectPackageManager,
  installCommand,
  LOCKFILES,
  SOURCE_EXTENSIONS,
} from './detect-baloise.mjs'
import { scanMigratable } from './scan-migratable.mjs'
import { scanSourceFiles, toSnippet } from './source-scan.mjs'

const GATE_EXTENSIONS = new Set([...SOURCE_EXTENSIONS, '.less'])
const YAML_EXTENSIONS = new Set(['.yml', '.yaml'])
const EXTENSIONS = new Set([...GATE_EXTENSIONS, ...YAML_EXTENSIONS])
const STRING_ENTRY_FILES = new Set(['angular.json', 'project.json'])
const LEGACY_RE = /@baloise\/ds-[a-z]/
const LEGACY_KEY_RE = /^@baloise\/ds-[a-z]/
const PACKAGE_RE = /@baloise\/ds-[a-z0-9-]+/g
const DEPENDENCY_LINE_RE = /^\s*"@baloise\/ds-[a-z0-9-]+"\s*:/
const TODO_RE = /TODO: remove these legacy Baloise imports once the Helvetia migration is verified/
const REMOVE_RE = /@baloise\/ds-styles\/(?:dist\/)?css\/(?:structure|core)(?:\.min)?(?:\.css)?(?![\w/-])/
const TARGET = `[^'"\\s]*@baloise\\/ds-styles\\/(?:dist\\/)?css\\/(?:structure|core)(?:\\.min)?(?:\\.css)?`
const STATEMENT_RES = [
  new RegExp(`^@(?:import|use)\\s+(['"])${TARGET}\\1\\s*;?$`),
  new RegExp(`^import\\s+(['"])${TARGET}\\1\\s*;?$`),
  new RegExp(`^<link\\b[^<>]*\\shref\\s*=\\s*(["'])${TARGET}\\1[^<>]*>$`, 'i'),
]
const STRING_ENTRY_RE = new RegExp(`^"${TARGET}"\\s*,?$`)
const ASSETS_RES = [
  /@baloise\/ds-styles\/(?:(?:dist\/)?css|sass)\/font(?:\.min)?(?:\.css|\.sass|\.scss)?(?![\w/-])/,
  /@baloise\/ds-fonts\b/,
  /@baloise\/ds-favicons\b/,
]
const UTILITIES_RE = /@baloise\/ds-styles\/(?:dist\/)?css\/utilities\//

export function scanCleanup(rootDir) {
  const root = realpathSync(resolve(rootDir))
  const { suggested, notYet } = scanMigratable(root, [], { extensions: GATE_EXTENSIONS })
  if (suggested.length > 0 || notYet.length > 0) {
    return { status: 'incomplete', outstanding: { suggested, notYet } }
  }

  const lines = []
  const manifests = []
  const unreadable = []
  scanSourceFiles(
    root,
    ({ file, text, comments }) => {
      const name = basename(file)
      if (LOCKFILES.has(name)) return
      let dependencyKeyLines = new Set()
      if (name === 'package.json') {
        const manifest = parseJson(text)
        if (!manifest) {
          unreadable.push(file)
          return
        }
        manifests.push({ packageJsonPath: file, manifest })
        dependencyKeyLines = findDependencyKeyLines(text)
      }
      collectLines(file, text, comments, dependencyKeyLines, lines)
    },
    { extensions: EXTENSIONS },
  )

  const byPosition = (a, b) => a.file.localeCompare(b.file) || a.line - b.line
  const removeLines = lines
    .filter(entry => entry.type === 'remove')
    .sort(byPosition)
    .map(({ file, line, snippet, kind }) => ({ file, line, snippet, kind }))
  const keptLines = lines.filter(entry => entry.type === 'keep').sort(byPosition)
  const commented = lines
    .filter(entry => entry.type === 'commented')
    .sort(byPosition)
    .map(({ file, line, snippet }) => ({ file, line, snippet }))
  const dependencies = planDependencies(manifests, keptLines)
  const packageManager = detectPackageManager(root)

  return {
    status: removeLines.length > 0 || dependencies.remove.length > 0 ? 'ready' : 'nothing-to-clean-up',
    packageManager,
    installCommand: installCommand(packageManager),
    remove: { lines: removeLines, dependencies: dependencies.remove },
    keep: {
      lines: keptLines.map(({ file, line, snippet, reason }) => ({ file, line, snippet, reason })),
      dependencies: dependencies.keep,
    },
    commented,
    unreadable: unreadable.sort(),
  }
}

export function run(rootDir, stdout) {
  stdout.write(`${JSON.stringify(scanCleanup(rootDir), null, 2)}\n`)
  return 0
}

function collectLines(file, text, comments, dependencyKeyLines, found) {
  const raw = text.split('\n')
  const active = comments.split('\n')
  const context = {
    isPackageJson: basename(file) === 'package.json',
    isYaml: YAML_EXTENSIONS.has(extname(file)),
    hasStringEntries: STRING_ENTRY_FILES.has(basename(file)),
  }
  const entries = raw.map((line, index) =>
    dependencyKeyLines.has(index) ? null : classify(line, active[index] ?? '', context),
  )

  entries.forEach((entry, index) => {
    if (!entry) return
    if (entry.type === 'todo') Object.assign(entry, resolveTodo(raw, entries, index))
    found.push({ file, line: index + 1, snippet: toSnippet(raw[index]), ...entry })
  })
}

function classify(line, activeLine, { isPackageJson, isYaml, hasStringEntries }) {
  const statement = activeLine.trim()
  if (TODO_RE.test(line) && !TODO_RE.test(activeLine)) return { type: 'todo' }
  if (!LEGACY_RE.test(line)) return null
  if (!LEGACY_RE.test(activeLine) || (isYaml && statement.startsWith('#'))) return { type: 'commented' }

  const packages = [...new Set(activeLine.match(PACKAGE_RE))]
  const keep = reason => ({ type: 'keep', reason, packages })
  if (isPackageJson && DEPENDENCY_LINE_RE.test(activeLine)) return keep('manual')
  if (STATEMENT_RES.some(re => re.test(statement)) || (hasStringEntries && STRING_ENTRY_RE.test(statement))) {
    return { type: 'remove', kind: 'import', packages }
  }
  if (REMOVE_RE.test(activeLine)) return keep('manual')
  if (ASSETS_RES.some(re => re.test(activeLine))) return keep('assets')
  if (UTILITIES_RE.test(activeLine)) return keep('css-utils')
  return keep('manual')
}

// The Init TODO covers the contiguous block of legacy lines below it; a commented-out line in that block is no legacy import.
function resolveTodo(raw, entries, index) {
  let next = index + 1
  let blocked = false
  while (next < raw.length && LEGACY_RE.test(raw[next])) {
    const below = entries[next]
    if (below && below.type !== 'commented' && below.type !== 'remove') blocked = true
    next++
  }
  return blocked
    ? { type: 'keep', reason: 'legacy-below', packages: [] }
    : { type: 'remove', kind: 'todo', packages: [] }
}

function parseJson(text) {
  try {
    const value = JSON.parse(text)
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

// Returns the 0-based lines that hold a key directly inside a top-level dependency field, such as `dependencies`.
function findDependencyKeyLines(text) {
  const lines = new Set()
  const stack = []
  let pendingKey = null
  let line = 0
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === '\n') line++
    if (ch === '"') {
      let end = i + 1
      while (end < text.length && text[end] !== '"') end += text[end] === '\\' ? 2 : 1
      const value = text.slice(i + 1, end)
      let after = end + 1
      while (/\s/.test(text[after] ?? '')) {
        if (text[after] === '\n') line++
        after++
      }
      if (text[after] === ':') {
        const keyLine = line - (text.slice(end, after).match(/\n/g)?.length ?? 0)
        pendingKey = value
        const parent = stack.at(-1)
        if (stack.length === 2 && parent.type === 'object' && DEPENDENCY_FIELDS.includes(parent.key)) {
          lines.add(keyLine)
        }
      }
      i = after
      continue
    }
    if (ch === '{' || ch === '[') {
      stack.push({ type: ch === '{' ? 'object' : 'array', key: pendingKey })
      pendingKey = null
    } else if (ch === '}' || ch === ']') {
      stack.pop()
    } else if (ch === ',') {
      pendingKey = null
    }
    i++
  }
  return lines
}

function legacyKeys(manifest) {
  const names = new Set()
  for (const field of DEPENDENCY_FIELDS) {
    const block = manifest[field]
    if (!block || typeof block !== 'object') continue
    for (const name of Object.keys(block)) if (LEGACY_KEY_RE.test(name)) names.add(name)
  }
  return [...names].sort()
}

function planDependencies(manifests, keptLines) {
  const declared = manifests
    .filter(({ manifest }) => legacyKeys(manifest).length > 0)
    .sort((a, b) => a.packageJsonPath.localeCompare(b.packageJsonPath))
    .map(({ packageJsonPath, manifest }) => ({
      packageJsonPath,
      manifest,
      dir: posix.dirname(packageJsonPath),
      names: legacyKeys(manifest),
      migratable: new Set(baloiseDependencies(manifest)),
    }))

  const usage = new Map()
  for (const entry of keptLines) {
    for (const name of entry.packages) {
      const declaring = declared.filter(owner => owner.names.includes(name))
      const scoped = declaring.filter(owner => owner.dir === '.' || entry.file.startsWith(`${owner.dir}/`))
      // A workspace library may import a package that only the app manifest declares.
      for (const owner of scoped.length > 0 ? scoped : declaring) {
        const key = `${owner.packageJsonPath}\0${name}`
        usage.set(key, [...(usage.get(key) ?? []), `${entry.file}:${entry.line}`])
      }
    }
  }

  const remove = []
  const keep = []
  for (const { packageJsonPath, manifest, names, migratable } of declared) {
    for (const name of names) {
      const usedBy = usage.get(`${packageJsonPath}\0${name}`) ?? []
      for (const field of DEPENDENCY_FIELDS) {
        const block = manifest[field]
        if (!block || typeof block !== 'object' || !Object.hasOwn(block, name)) continue
        if (!migratable.has(name)) keep.push({ packageJsonPath, field, name, reason: 'manual', usedBy })
        else if (usedBy.length > 0) keep.push({ packageJsonPath, field, name, reason: 'used', usedBy })
        else remove.push({ packageJsonPath, field, name })
      }
    }
  }
  return { remove, keep }
}

function isMainModule() {
  const entry = process.argv[1]
  if (!entry) return false
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(resolve(entry))
  } catch {
    return pathToFileURL(resolve(entry)).href === import.meta.url
  }
}

if (isMainModule()) {
  const root = process.argv[2] ? resolve(process.argv[2]) : process.cwd()
  try {
    process.exit(run(root, process.stdout))
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  }
}
