#!/usr/bin/env node
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { detectFramework, IMPORT_EXTENSIONS, readJson } from './detect-baloise.mjs'
import { lineAt, lineText, readTag, scanSourceFiles, toSnippet } from './source-scan.mjs'

const EXTENSIONS = new Set([...IMPORT_EXTENSIONS, '.mts', '.cts'])
const JSON_FILES = new Set(['angular.json', 'package.json', 'project.json'])
const PUBLIC_DIR_CONFIGS = [
  ...['js', 'mjs', 'cjs', 'ts', 'mts', 'cts'].map(ext => `vite.config.${ext}`),
  ...['js', 'mjs', 'cjs', 'ts'].map(ext => `next.config.${ext}`),
]
const LINE_RES = [
  /@baloise\/ds-styles\/(?:dist\/)?css\/(?:font|all|basic|baloise-design-system)(?:\.min)?(?:\.css)?(?![\w/-])/,
  /@helvetia-design\/styles\/(?:(?:dist\/)?css\/design-system(?:\.local)?(?:\.min)?(?:\.css)?|scss\/design-system(?:\.scss)?)(?![\w/-])/,
  /@baloise\/ds-fonts\b/,
  /@baloise\/ds-favicons\b/,
]
const TAG_START_RE = /<(?:link|meta)\b/gi
const FAVICON_TAG_RE =
  /^<link\b[\s\S]*\srel\s*=\s*(["']?)\s*(?:(?:shortcut\s+)?icon|apple-touch-icon(?:-precomposed)?|manifest)\s*\1(?=[\s/>])|^<meta\b[\s\S]*\bname\s*=\s*["']msapplication-config["']/i

export function scanAssets(rootDir) {
  const root = realpathSync(resolve(rootDir))
  const found = []
  scanSourceFiles(
    root,
    ({ file, text }) => {
      if (file.endsWith('.json') && !JSON_FILES.has(basename(file))) return
      collect(file, text, found)
    },
    EXTENSIONS,
  )
  const { total, files } = group(found)
  return { total, project: describeProject(root), files }
}

export function run(rootDir, stdout) {
  stdout.write(`${JSON.stringify(scanAssets(rootDir), null, 2)}\n`)
  return 0
}

function collect(file, text, found) {
  const lines = new Set()
  const add = (index, raw) => {
    const line = lineAt(text, index)
    if (lines.has(line)) return
    lines.add(line)
    found.push({ file, line, snippet: toSnippet(raw) })
  }

  let offset = 0
  for (const line of text.split('\n')) {
    if (LINE_RES.some(re => re.test(line))) add(offset, lineText(text, offset))
    offset += line.length + 1
  }

  TAG_START_RE.lastIndex = 0
  let match
  while ((match = TAG_START_RE.exec(text)) !== null) {
    const tag = readTag(text, match.index)
    if (FAVICON_TAG_RE.test(tag)) add(match.index, tag)
  }
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
      findings: findings.sort((a, b) => a.line - b.line).map(({ line, snippet }) => ({ line, snippet })),
    }))

  return {
    total: files.reduce((sum, file) => sum + file.findings.length, 0),
    files,
  }
}

function describeProject(root) {
  return {
    framework: detectFramework(readJson(join(root, 'package.json'))),
    publicDir: servesPublicDir(root) ? 'public' : null,
    angularAssets: angularAssets(root),
  }
}

function angularAssets(root) {
  let text
  try {
    text = readFileSync(join(root, 'angular.json'), 'utf8')
  } catch {
    return null
  }

  let config
  try {
    config = JSON.parse(toStrictJson(text))
  } catch (error) {
    throw new Error(`angular.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }

  const result = []
  for (const [project, definition] of Object.entries(config?.projects ?? {})) {
    for (const [target, options] of Object.entries(definition?.architect ?? definition?.targets ?? {})) {
      const assets = options?.options?.assets
      if (!Array.isArray(assets)) continue
      const entries = assets.filter(entry => JSON.stringify(entry).includes('src/assets'))
      if (entries.length > 0) result.push({ project, target, entries })
    }
  }
  return result
}

// The Angular CLI reads angular.json as JSON with comments and trailing commas.
function toStrictJson(text) {
  return text
    .replace(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (_, string) => string ?? '')
    .replace(/("(?:\\.|[^"\\])*")|,(\s*[}\]])/g, (_, string, close) => string ?? close)
}

function servesPublicDir(root) {
  return isDirectory(join(root, 'public')) || PUBLIC_DIR_CONFIGS.some(name => existsSync(join(root, name)))
}

function isDirectory(path) {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
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
