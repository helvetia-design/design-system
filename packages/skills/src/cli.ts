#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, realpathSync } from 'node:fs'
import { cp, lstat, mkdir, readdir, readFile, readlink, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const PACKAGE_NAME = '@helvetia-design/skills'
const SKILL_NAME = 'ds-migrate-from-baloise'
const USAGE = 'Usage: skills add [--force]\n'
const MARKER_FILE = '.installed.json'
const LOCK_FILES = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'npm-shrinkwrap.json']

export type CliIo = {
  cwd: string
  stdout: { write(chunk: string): void }
  stderr: { write(chunk: string): void }
  copy?: (source: string, destination: string) => Promise<void>
  rename?: (from: string, to: string) => Promise<void>
}

type FileHashes = Record<string, string>

type Change = { path: string; kind: 'changed' | 'added' | 'removed' }

type MarkerState = { state: 'missing' } | { state: 'invalid' } | { state: 'valid'; files: FileHashes }

const RM_OPTIONS = { recursive: true, force: true, maxRetries: 3 }

function sha256(content: Buffer | string): string {
  return createHash('sha256').update(content).digest('hex')
}

function normalizeLineEndings(content: Buffer): Buffer {
  return Buffer.from(content.toString('latin1').replace(/\r\n/g, '\n'), 'latin1')
}

function findPackageRoot(startDir: string): { dir: string; version: string } {
  let dir = startDir
  while (true) {
    const pkgPath = join(dir, 'package.json')
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name?: string; version?: string }
      if (pkg.name === PACKAGE_NAME) {
        return { dir, version: pkg.version ?? 'unknown' }
      }
    }
    const parent = dirname(dir)
    if (parent === dir) {
      throw new Error(`Could not locate the ${PACKAGE_NAME} package root`)
    }
    dir = parent
  }
}

function findProjectRoot(startDir: string): string {
  let dir = startDir
  while (true) {
    if (existsSync(join(dir, 'package.json')) && LOCK_FILES.some(name => existsSync(join(dir, name)))) {
      return dir
    }
    const parent = dirname(dir)
    if (parent === dir) {
      return startDir
    }
    dir = parent
  }
}

async function hashDirectory(root: string): Promise<FileHashes> {
  const hashes: FileHashes = {}
  async function walk(dir: string, prefix: string): Promise<void> {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath, relative)
      } else if (relative !== MARKER_FILE) {
        if (entry.isSymbolicLink()) {
          hashes[relative] = sha256(`symlink:${await readlink(fullPath)}`)
        } else if (entry.isFile()) {
          hashes[relative] = sha256(normalizeLineEndings(await readFile(fullPath)))
        } else {
          hashes[relative] = 'special'
        }
      }
    }
  }
  await walk(root, '')
  return Object.fromEntries(
    Object.keys(hashes)
      .sort()
      .map(path => [path, hashes[path]]),
  )
}

function diffHashes(baseline: FileHashes, current: FileHashes): Change[] {
  const changes: Change[] = []
  for (const [path, hash] of Object.entries(current)) {
    if (!(path in baseline)) {
      changes.push({ path, kind: 'added' })
    } else if (baseline[path] !== hash) {
      changes.push({ path, kind: 'changed' })
    }
  }
  for (const path of Object.keys(baseline)) {
    if (!(path in current)) {
      changes.push({ path, kind: 'removed' })
    }
  }
  return changes.sort((a, b) => (a.path < b.path ? -1 : 1))
}

async function readMarkerFiles(destination: string): Promise<MarkerState> {
  const markerPath = join(destination, MARKER_FILE)
  if (!existsSync(markerPath)) {
    return { state: 'missing' }
  }
  let marker: unknown
  try {
    marker = JSON.parse(await readFile(markerPath, 'utf8'))
  } catch {
    return { state: 'invalid' }
  }
  const files = (marker as { files?: unknown } | null)?.files
  if (
    typeof files === 'object' &&
    files !== null &&
    !Array.isArray(files) &&
    Object.values(files).every(value => typeof value === 'string')
  ) {
    return { state: 'valid', files: files as FileHashes }
  }
  return { state: 'invalid' }
}

async function recoverLeftovers(temp: string, backup: string, destination: string): Promise<void> {
  await rm(temp, RM_OPTIONS)
  if (existsSync(backup)) {
    if (existsSync(destination)) {
      await rm(backup, RM_OPTIONS)
    } else {
      await mkdir(dirname(destination), { recursive: true })
      await rename(backup, destination)
    }
  }
}

function formatChanges(changes: Change[], marker: MarkerState['state']): string {
  const list = changes.map(change => `  ${change.kind}: ${change.path}`).join('\n')
  const note =
    'These files differ from the new version. This list cannot tell local edits from upstream changes, which happens once per project:'
  const reason =
    marker === 'valid'
      ? `Local changes found in the installed ${SKILL_NAME} skill:`
      : marker === 'invalid'
        ? `${MARKER_FILE} in the installed ${SKILL_NAME} skill is invalid. ${note}`
        : `No ${MARKER_FILE} found in the installed ${SKILL_NAME} skill (installed before this check existed). ${note}`
  return `${reason}\n${list}\nRun "skills add --force" to overwrite them.\n`
}

export async function run(
  argv: string[],
  io: CliIo = { cwd: process.cwd(), stdout: process.stdout, stderr: process.stderr },
): Promise<number> {
  const isAdd = argv[0] === 'add'
  const force = argv.length === 2 && argv[1] === '--force'
  if (!isAdd || (argv.length !== 1 && !force)) {
    io.stderr.write(USAGE)
    return 1
  }

  const packageRoot = findPackageRoot(dirname(fileURLToPath(import.meta.url)))
  const source = join(packageRoot.dir, 'skills', SKILL_NAME)
  const claudeDir = join(findProjectRoot(io.cwd), '.claude')
  const destination = join(claudeDir, 'skills', SKILL_NAME)
  const temp = join(claudeDir, `.${SKILL_NAME}.tmp`)
  const backup = join(claudeDir, `.${SKILL_NAME}.bak`)
  const copy = io.copy ?? (async (from, to) => cp(from, to, { recursive: true, force: true }))
  const swap = io.rename ?? rename

  if (!existsSync(source)) {
    io.stderr.write(`Skill payload not found at ${source}\n`)
    return 1
  }

  await recoverLeftovers(temp, backup, destination)

  if (existsSync(destination) && !force) {
    if (!(await lstat(destination)).isDirectory()) {
      io.stderr.write(
        `The installed ${SKILL_NAME} path is not a folder:\n  changed: .\nRun "skills add --force" to overwrite it.\n`,
      )
      return 1
    }
    const installed = await hashDirectory(destination)
    const marker = await readMarkerFiles(destination)
    const baseline = marker.state === 'valid' ? marker.files : await hashDirectory(source)
    const changes = diffHashes(baseline, installed)
    if (changes.length > 0) {
      io.stderr.write(formatChanges(changes, marker.state))
      return 1
    }
  }

  await mkdir(dirname(destination), { recursive: true })
  try {
    await copy(source, temp)
    const marker = { version: packageRoot.version, files: await hashDirectory(temp) }
    await writeFile(join(temp, MARKER_FILE), `${JSON.stringify(marker, null, 2)}\n`)

    if (existsSync(destination)) {
      await swap(destination, backup)
      try {
        await swap(temp, destination)
      } catch (swapError) {
        try {
          await swap(backup, destination)
        } catch (rollbackError) {
          throw new AggregateError(
            [swapError, rollbackError],
            `Could not swap in the new skill folder and could not restore the previous one; it is kept at ${backup}`,
          )
        }
        throw swapError
      }
      await rm(backup, RM_OPTIONS)
    } else {
      await swap(temp, destination)
    }
  } finally {
    await rm(temp, RM_OPTIONS)
  }

  io.stdout.write(`Copied ${SKILL_NAME} to ${destination}\n`)
  return 0
}

function isMainModule(): boolean {
  const entry = process.argv[1]
  if (!entry) {
    return false
  }
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(resolve(entry))
  } catch {
    return pathToFileURL(resolve(entry)).href === import.meta.url
  }
}

if (isMainModule()) {
  run(process.argv.slice(2))
    .then(code => process.exit(code))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
