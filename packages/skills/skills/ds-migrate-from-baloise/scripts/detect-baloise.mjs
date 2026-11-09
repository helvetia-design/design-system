#!/usr/bin/env node
import { execFile } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const LEGACY_SCOPE = '@baloise'
const TARGET_SCOPE = '@helvetia-design'
const STYLES_NAME = 'styles'
const INSTALL_NAMES = ['angular', 'core', 'react', STYLES_NAME]
const ICON_NAMES = ['icons', 'brand-icons']
const FONT_FAVICON_NAMES = ['fonts', 'favicons']
const SHORT_NAMES = [...INSTALL_NAMES, ...ICON_NAMES]
const DEPENDENCY_NAMES = [...SHORT_NAMES, ...FONT_FAVICON_NAMES]
const ASSET_NAMES = [...ICON_NAMES, STYLES_NAME, ...FONT_FAVICON_NAMES]
const ASSET_PACKAGES = new Set(ASSET_NAMES.map(short => `${LEGACY_SCOPE}/ds-${short}`))
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', '.next', '.angular', '.git', '.claude', 'coverage'])
const LOCKFILES = new Set(['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'npm-shrinkwrap.json'])
export const IMPORT_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.sass',
  '.vue',
  '.json',
])
const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']
const NOTHING = 'no Baloise Design System installation detected, nothing to migrate'

function targetPackageName(short) {
  return `${TARGET_SCOPE}/${short}`
}

const MISSING_LATEST = `npm view ${targetPackageName('core')} dist-tags did not include a latest tag`

const execFileAsync = promisify(execFile)
const PACKAGE_RE = new RegExp(`${LEGACY_SCOPE}/ds-(?:${SHORT_NAMES.join('|')})\\b`)
const INSTALL_RE = new RegExp(`^${LEGACY_SCOPE}/ds-(?:${INSTALL_NAMES.join('|')})$`)
const DEPENDENCY_RE = new RegExp(`${LEGACY_SCOPE}/ds-(?:${DEPENDENCY_NAMES.join('|')})\\b`)

export async function readNpmDistTags(execImpl = execFileAsync) {
  const { stdout } = await execImpl('npm', ['view', targetPackageName('core'), 'dist-tags', '--json'], {
    encoding: 'utf8',
  })
  const parsed = JSON.parse(stdout)
  return typeof parsed === 'string' ? JSON.parse(parsed) : parsed
}

export async function detectBaloise(rootDir, options = {}) {
  const found = scan(rootDir)
  if (!found) {
    return { status: 'nothing-to-migrate', message: NOTHING }
  }

  const readDistTags = options.readDistTags ?? readNpmDistTags
  const distTags = await readDistTags()
  const version = typeof distTags?.latest === 'string' ? distTags.latest : ''
  if (!version) {
    return { status: 'error', message: MISSING_LATEST }
  }

  const framework = detectFramework(found.manifest)
  const packageManager = detectPackageManager(rootDir)
  return {
    status: 'ready',
    packageManager,
    installCommand: installCommand(packageManager),
    framework,
    packageJsonPath: found.packageJsonPath,
    dependencies: found.dependencies,
    imports: found.imports,
    version,
    aliases: aliasesFor(framework, version, found.dependencies),
  }
}

export async function run(rootDir, stdout, options = {}) {
  const result = await detectBaloise(rootDir, options)
  stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  return result.status === 'error' ? 1 : 0
}

function installCommand(packageManager) {
  if (packageManager === 'pnpm') return 'pnpm install'
  if (packageManager === 'yarn') return 'yarn install'
  return 'npm install'
}

function detectPackageManager(rootDir) {
  if (existsSync(join(rootDir, 'pnpm-lock.yaml'))) return 'pnpm'
  if (existsSync(join(rootDir, 'yarn.lock'))) return 'yarn'
  if (existsSync(join(rootDir, 'package-lock.json'))) return 'npm'
  return 'npm'
}

export function detectFramework(manifest) {
  const names = new Set(dependencyNames(manifest))
  if (names.has('@angular/core')) return 'angular'
  if (names.has('react') || names.has('react-dom')) return 'react'
  return 'html'
}

/**
 * Every framework gets `tokens` and `core` on top of its own binding package, because the
 * migration makes the consumer import both directly:
 *
 * - `tokens` — Init writes an `@helvetia-design/tokens/css/base` import into the consumer's own
 *   entry file (the `normalize` and bundled `css/all` rules in SKILL.md).
 * - `core` — the controller and option types live there and are not re-exported by the binding
 *   packages, so `AlertController`, `Alert`, `ModalController` and `ModalOptions` are imported
 *   from `@helvetia-design/core` even in a React or Angular app.
 *
 * Both currently resolve anyway, as transitive dependencies, but only because npm and Yarn
 * flatten `node_modules`. Under pnpm's default layout, where only declared dependencies are
 * linked, those imports fail to resolve. Declaring what the skill tells the consumer to import
 * is the fix.
 *
 * `assets` is added when the app declared `@baloise/ds-icons` or `@baloise/ds-brand-icons`
 * directly, because then it imports icon symbols itself. It is also added for `@baloise/ds-styles`,
 * `@baloise/ds-fonts` and `@baloise/ds-favicons`, because the Assets step copies the self-hosted
 * fonts and favicons from `node_modules/@helvetia-design/assets`, which pnpm only links when the
 * app declares it.
 */
function aliasesFor(framework, version, dependencies) {
  const shared = {
    [targetPackageName('core')]: version,
    [targetPackageName('styles')]: version,
    [targetPackageName('tokens')]: version,
  }
  if (dependencies.some(name => ASSET_PACKAGES.has(name))) shared[targetPackageName('assets')] = version
  if (framework === 'react') return { [targetPackageName('react')]: version, ...shared }
  if (framework === 'angular') return { [targetPackageName('angular')]: version, ...shared }
  return shared
}

function dependencyNames(manifest) {
  const names = []
  for (const field of DEPENDENCY_FIELDS) {
    const block = manifest?.[field]
    if (block && typeof block === 'object') names.push(...Object.keys(block))
  }
  return names
}

function baloiseDependencies(manifest) {
  return [...new Set(dependencyNames(manifest).filter(name => DEPENDENCY_RE.test(name)))].sort()
}

function scan(rootDir) {
  const packages = []
  const imports = []
  walk(rootDir, rootDir, packages, imports)
  if (packages.length === 0 || imports.length === 0) return null

  packages.sort(
    (a, b) => a.packageJsonPath.length - b.packageJsonPath.length || a.packageJsonPath.localeCompare(b.packageJsonPath),
  )
  imports.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
  const chosen = packages[0]
  return {
    manifest: chosen.manifest,
    packageJsonPath: chosen.packageJsonPath,
    dependencies: chosen.dependencies,
    imports,
  }
}

function walk(rootDir, dir, packages, imports) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(rootDir, join(dir, entry.name), packages, imports)
      continue
    }
    if (!entry.isFile()) continue

    const filePath = join(dir, entry.name)
    if (entry.name === 'package.json') {
      const manifest = readJson(filePath)
      const dependencies = manifest ? baloiseDependencies(manifest) : []
      // An icon-only manifest, such as a workspace root, must not win over the app manifest.
      if (dependencies.some(name => INSTALL_RE.test(name))) {
        packages.push({ manifest, packageJsonPath: toPosix(rootDir, filePath), dependencies })
      }
      continue
    }
    if (LOCKFILES.has(entry.name) || !IMPORT_EXTENSIONS.has(extname(entry.name))) continue
    collectImports(rootDir, filePath, imports)
  }
}

function collectImports(rootDir, filePath, imports) {
  let text
  try {
    text = readFileSync(filePath, 'utf8')
  } catch {
    return
  }
  const lines = text.split(/\r?\n/)
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    if (isIgnorableLine(line) || !PACKAGE_RE.test(line)) continue
    const snippet = line.trim().slice(0, 240)
    imports.push({
      file: toPosix(rootDir, filePath),
      line: index + 1,
      snippet,
      kind: kindOf(line),
    })
  }
}

function kindOf(line) {
  if (/<link\b/i.test(line) || /<script\b/i.test(line)) return 'bootstrap'
  if (/@import\b/.test(line) || /@use\b/.test(line)) return 'bootstrap'
  if (new RegExp(`import\\s+['"]${LEGACY_SCOPE}/ds-(?:core|styles)\\b`).test(line)) return 'bootstrap'
  if (new RegExp(`node_modules/${LEGACY_SCOPE}/ds-(?:styles|core)\\b`).test(line)) return 'bootstrap'
  return 'reference'
}

function isIgnorableLine(line) {
  const trimmed = line.trim()
  return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('<!--')
}

export function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

function toPosix(rootDir, filePath) {
  return relative(rootDir, filePath).split(sep).join('/')
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
  run(root, process.stdout)
    .then(code => process.exit(code))
    .catch(error => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
      process.exit(1)
    })
}
