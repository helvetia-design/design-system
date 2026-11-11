#!/usr/bin/env node
import { readFileSync, realpathSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  endOfString,
  lineAt,
  lineStart,
  lineText,
  scanSourceFiles,
  SOURCE_EXTENSIONS,
  toSnippet,
} from './source-scan.mjs'

const SPECIFIER_RE = /['"]@baloise\/ds-(?:brand-)?icons['"]/g
// balIconClick is the bal-date event, legacy @baloise/ds-icons has no click icon.
const SYMBOL_RE = /\bbal(?:Brand)?Icon(?!Click\b)[A-Z]\w*/g
const BINDING_SYMBOL_RE = /(?<![\w$])bal(?:Brand)?Icon(?!Click\b)[A-Z][\w$]*/g
// Attribute bindings whose value source-scan masks: [x]="", [attr.x]="", bind-x="", *ngX="", :x="", v-bind:x="".
const BINDING_RE = /(?<=\s)(?:\[[^\]\s=]+\]|bind-[\w.-]+|\*ng\w+|v-bind:[\w.-]+|:[\w.-]+)\s*=\s*(["'])/g
const CANDIDATE_EXTENSIONS = new Set(['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'])
const MINIFIED_RE = /\.min\.[cm]?js$/
const ICON_NAME_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
const IMPORT_PREFIX_RE = /(?:\bfrom|\bimport|\brequire\s*\()\s*\(?$/
const NAME_MAP = JSON.parse(readFileSync(new URL('../shared/icon-name-map.json', import.meta.url), 'utf8'))
const NAME_GROUPS = new Map()
for (const group of ['renamed', 'approximated']) {
  for (const name of Object.keys(NAME_MAP[group])) NAME_GROUPS.set(name, group)
}
for (const name of NAME_MAP.lost) NAME_GROUPS.set(name, 'lost')
for (const name of NAME_MAP.changed) NAME_GROUPS.set(name, 'changed')
const RENAME_TARGETS = new Set(NAME_MAP.renameTargets ?? [])
const NAMESPACE_RE = /\bimport\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s+from\s*['"]@baloise\/ds-(?:brand-)?icons['"]/g
// The specifier is a string, which source-scan masks, so a real import is told apart from a
// commented one by the keyword that survives masking on the same line.
const IMPORT_KEYWORD_RE = /\b(?:from|import|require)\b/

export function scanIconImports(rootDir, files = []) {
  const found = []
  const candidates = []
  const unmatched = scanSourceFiles(
    rootDir,
    source => {
      collect(source, found)
      if (CANDIDATE_EXTENSIONS.has(extname(source.file)) && !MINIFIED_RE.test(source.file)) {
        collectCandidates(source, candidates)
      }
    },
    { extensions: SOURCE_EXTENSIONS, paths: files },
  )
  const result = group(found)
  const withCandidates = candidates.length > 0 ? { ...result, candidates: group(candidates) } : result
  return unmatched.length > 0 ? { ...withCandidates, unmatched } : withCandidates
}

export function run(rootDir, stdout, files = []) {
  stdout.write(`${JSON.stringify(scanIconImports(rootDir, files), null, 2)}\n`)
  return 0
}

function group(found) {
  const byFile = new Map()
  for (const finding of found) {
    const list = byFile.get(finding.file) ?? []
    list.push(finding)
    byFile.set(finding.file, list)
  }

  const files = [...byFile.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([file, findings]) => ({
      file,
      findings: findings.sort((a, b) => a.line - b.line).map(({ file: _file, ...finding }) => finding),
    }))

  return {
    total: files.reduce((sum, file) => sum + file.findings.length, 0),
    files,
  }
}

function collect(source, found) {
  const { file, text, masked, comments } = source
  const lines = new Set()
  const namespaces = []
  const add = index => {
    const line = lineAt(text, index)
    if (lines.has(line)) return
    lines.add(line)
    found.push({ file, line, snippet: toSnippet(lineText(text, index)) })
  }

  SPECIFIER_RE.lastIndex = 0
  let match
  while ((match = SPECIFIER_RE.exec(text)) !== null) {
    if (IMPORT_KEYWORD_RE.test(lineText(masked, match.index))) add(match.index)
  }

  NAMESPACE_RE.lastIndex = 0
  while ((match = NAMESPACE_RE.exec(text)) !== null) {
    if (masked.startsWith('import', match.index)) namespaces.push(match[1])
  }

  const visible = index => masked[index] !== ' ' || inTemplateSubstitution(text, index)

  SYMBOL_RE.lastIndex = 0
  while ((match = SYMBOL_RE.exec(text)) !== null) if (visible(match.index)) add(match.index)

  BINDING_RE.lastIndex = 0
  while ((match = BINDING_RE.exec(comments)) !== null) {
    const start = match.index + match[0].length
    const end = comments.indexOf(match[1], start)
    if (end === -1) continue
    for (const index of symbolsOutsideStrings(comments, start, end)) add(index)
    BINDING_RE.lastIndex = end + 1
  }

  for (const name of namespaces) {
    const usage = new RegExp(`(?<![\\w$])(?<![^.]\\.)${escapeRegExp(name)}(?![\\w$])`, 'g')
    while ((match = usage.exec(text)) !== null) if (visible(match.index)) add(match.index)
  }
}

function symbolsOutsideStrings(text, start, end) {
  let value = text.slice(start, end)
  for (let i = 0; i < value.length; i++) {
    if (value[i] !== "'" && value[i] !== '"' && value[i] !== '`') continue
    const close = Math.min(endOfString(value, i), value.length)
    value = value.slice(0, i) + ' '.repeat(close - i) + value.slice(close)
    i = close - 1
  }
  return [...value.matchAll(BINDING_SYMBOL_RE)].map(match => start + match.index)
}

function collectCandidates(source, candidates) {
  const { file, text, masked, comments } = source
  let i = 0
  while (i < comments.length) {
    const ch = comments[i]
    // A quote that source-scan left visible, such as a JSX apostrophe or one in a regex, opens no string.
    if ((ch !== "'" && ch !== '"' && ch !== '`') || masked[i] !== ' ') {
      i++
      continue
    }
    const end = endOfString(text, i, true)
    if (text[end - 1] === ch && end - i >= 2) {
      const name = text.slice(i + 1, end - 1)
      const group = ICON_NAME_RE.test(name) ? candidateGroup(name) : undefined
      const before = group ? text.slice(lineStart(text, i), i) : ''
      // A bare `info` or `alert` is usually a color or level, so the shim prefixes need an icon key on the line.
      const iconContext = group !== 'shim' || /icon/i.test(before)
      if (group && iconContext && !IMPORT_PREFIX_RE.test(before)) {
        const finding = { file, line: lineAt(text, i), snippet: toSnippet(lineText(text, i)), name, group }
        if (group === 'changed' && RENAME_TARGETS.has(name)) finding.renameTarget = true
        candidates.push(finding)
      }
    }
    i = Math.max(end, i + 1)
  }
}

function candidateGroup(name) {
  const group = NAME_GROUPS.get(name)
  if (group) return group
  if ((name.startsWith('alert') || name.startsWith('info')) && name !== 'alert-triangle' && name !== 'info-circle') {
    return 'shim'
  }
  return undefined
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// source-scan blanks whole template literals, so `${…}` substitutions are found by walking back to an
// unclosed `${` before the enclosing backtick.
function inTemplateSubstitution(text, index) {
  let depth = 0
  for (let i = index - 1; i >= 0; i--) {
    const ch = text[i]
    if (ch === '`' && depth === 0) return false
    if (ch === '}') depth++
    if (ch === '{') {
      if (depth === 0) return text[i - 1] === '$'
      depth--
    }
  }
  return false
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
    process.exit(run(root, process.stdout, process.argv.slice(3)))
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  }
}
