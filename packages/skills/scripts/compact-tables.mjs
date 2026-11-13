#!/usr/bin/env node
import { readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const PAYLOAD = fileURLToPath(new URL('../skills/', import.meta.url))
const FENCE_RE = /^\s*(`{3,}|~{3,})/
const CLOSING_FENCE_RE = /^\s*(`{3,}|~{3,})\s*$/
const ROW_RE = /^\s*\|.*\|\s*$/
const DELIMITER_CELL_RE = /^\s*(:?)-{3,}(:?)\s*$/

/** Returns the table row with the alignment padding around its cell delimiters removed. */
export function compactRow(line, isDelimiterRow = true) {
  const indent = line.match(/^\s*/)[0]
  const cells = splitCells(line.trim())
  if (isDelimiterRow && cells.every(cell => DELIMITER_CELL_RE.test(cell))) {
    return `${indent}| ${cells.map(cell => cell.replace(DELIMITER_CELL_RE, '$1---$2')).join(' | ')} |`
  }
  return `${indent}| ${cells.map(cell => cell.trim()).join(' | ')} |`
}

function splitCells(row) {
  const cells = []
  let current = ''
  let tick = 0
  for (let i = 1; i < row.length - 1; i++) {
    const char = row[i]
    if (char === '\\' && i + 1 < row.length - 1) {
      current += char + row[++i]
      continue
    }
    if (char === '`') {
      let run = 1
      while (row[i + run] === '`') run++
      const ticks = '`'.repeat(run)
      if (tick === 0) tick = run
      else if (tick === run) tick = 0
      current += ticks
      i += run - 1
      continue
    }
    if (char === '|' && tick === 0) {
      cells.push(current)
      current = ''
      continue
    }
    current += char
  }
  cells.push(current)
  return cells
}

/** Returns the Markdown text with every table row outside a fenced code block compacted. */
export function compactMarkdown(text) {
  let fence = null
  let rowIndex = -1
  return text
    .split('\n')
    .map(line => {
      const marker = line.match(FENCE_RE)?.[1]
      if (marker) {
        rowIndex = -1
        if (fence === null) fence = marker
        else if (CLOSING_FENCE_RE.test(line) && marker[0] === fence[0] && marker.length >= fence.length) fence = null
        return line
      }
      if (fence !== null || !ROW_RE.test(line)) {
        rowIndex = -1
        return line
      }
      rowIndex++
      return compactRow(line, rowIndex === 1)
    })
    .join('\n')
}

/** Returns every Markdown file below the folder, sorted. */
export function markdownFiles(dir) {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => join(entry.parentPath, entry.name))
    .sort()
}

/** Compacts the payload tables in place, or with `--check` lists the files that still have padding. */
export function run(args, stdout, dir = PAYLOAD) {
  const unknown = args.filter(arg => arg !== '--check')
  if (unknown.length > 0) {
    stdout.write(`Unknown argument: ${unknown.join(' ')}. Usage: compact-tables.mjs [--check]\n`)
    return 1
  }
  const check = args.includes('--check')
  const padded = []
  for (const file of markdownFiles(dir)) {
    const text = readFileSync(file, 'utf8')
    const compact = compactMarkdown(text)
    if (compact === text) continue
    padded.push(relative(dir, file))
    if (!check) writeFileSync(file, compact)
  }
  for (const file of padded) stdout.write(`${check ? 'padded' : 'compacted'}: ${file}\n`)
  return check && padded.length > 0 ? 1 : 0
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

if (isMainModule()) process.exit(run(process.argv.slice(2), process.stdout))
