import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path'

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  '.next',
  '.angular',
  '.git',
  '.claude',
  'coverage',
  '.nx',
  'storybook-static',
])
const EXTENSIONS = new Set(['.tsx', '.jsx', '.html', '.ts'])

/**
 * Walks the source files under `rootDir`, or only the files and directories in `paths`, and returns the paths that match no source file.
 */
export function scanSourceFiles(rootDir, collect, { extensions = EXTENSIONS, paths = [] } = {}) {
  const root = realpathSync(resolve(rootDir))
  if (!statSync(root).isDirectory()) throw new Error(`Scan root is not a directory: ${root}`)
  if (paths.length === 0) {
    walk(root, root, collect, extensions)
    return []
  }

  const seen = new Set()
  const collectOnce = source => {
    if (seen.has(source.file)) return
    seen.add(source.file)
    collect(source)
  }
  const unmatched = new Set()
  for (const path of paths) {
    const target = resolvePath(root, path)
    if (target.real === root) {
      walk(root, root, collectOnce, extensions)
    } else if (
      !target.real ||
      isAbsolute(target.rel) ||
      target.rel.split('/').some(part => part === '..' || SKIP_DIRS.has(part))
    ) {
      unmatched.add(target.rel)
    } else if (statSync(target.real).isDirectory()) {
      walk(root, target.real, collectOnce, extensions)
    } else if (extensions.has(extname(target.real))) {
      readSource(root, target.real, collectOnce)
    } else {
      unmatched.add(target.rel)
    }
  }
  return [...unmatched].sort()
}

function resolvePath(root, path) {
  const absolute = resolve(root, path)
  let real
  try {
    real = realpathSync(absolute)
  } catch {
    return { rel: toPosix(relative(root, absolute)) }
  }
  return { real, rel: toPosix(relative(root, real)) }
}

function toPosix(path) {
  return path.split(sep).join('/')
}

function walk(rootDir, dir, collect, extensions) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue
    const entryPath = canonicalChild(rootDir, join(dir, entry.name))
    if (!entryPath) continue
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(rootDir, entryPath, collect, extensions)
      continue
    }
    if (!entry.isFile() || !extensions.has(extname(entry.name))) continue
    readSource(rootDir, entryPath, collect)
  }
}

function canonicalChild(rootDir, entryPath) {
  let candidate
  try {
    candidate = realpathSync(entryPath)
  } catch {
    return undefined
  }
  const child = relative(rootDir, candidate)
  return child && child !== '..' && !child.startsWith(`..${sep}`) && !isAbsolute(child) ? candidate : undefined
}

function readSource(rootDir, filePath, collect) {
  let text
  try {
    text = readFileSync(filePath, 'utf8')
  } catch {
    return
  }

  const extension = extname(filePath)
  let masked
  let comments
  collect({
    file: toPosix(relative(rootDir, filePath)),
    text,
    get masked() {
      masked ??= maskSource(text, extension === '.html')
      return masked
    },
    get comments() {
      comments ??= maskComments(text, commentKind(extension))
      return comments
    },
  })
}

function commentKind(extension) {
  if (extension === '.html' || extension === '.vue') return 'markup'
  if (extension === '.css') return 'css'
  if (extension === '.scss' || extension === '.sass' || extension === '.less') return 'scss'
  return 'script'
}

/**
 * Blanks comments only and keeps every string. `kind` is `script`, `css`, `scss` (with `//` line comments) or
 * `markup`, where only `<!--` is a comment outside `<script>` and `<style>` blocks.
 */
export function maskComments(text, kind) {
  const mask = text.split('')
  let region = kind === 'markup' ? 'markup' : kind
  let i = 0
  while (i < text.length) {
    if (kind === 'markup') {
      const tag = /^<(\/?)(script|style)\b/i.exec(text.slice(i, i + 9))
      if (tag) {
        if (tag[1]) region = 'markup'
        else if (tag[2].toLowerCase() === 'script') region = 'script'
        else region = /\blang\s*=\s*["']?(?:scss|sass|less)\b/i.test(readTag(text, i)) ? 'scss' : 'css'
        i = tag[1] ? i + tag[0].length : closeAt(text, '>', i)
        continue
      }
    }
    if (text.startsWith('<!--', i)) {
      i = blank(mask, i, closeAt(text, '-->', i + 4))
      continue
    }
    if (region === 'markup') {
      i++
      continue
    }
    if (region === 'script' && text[i] === '/') {
      const end = endOfRegex(text, i)
      if (end !== -1) {
        i = end
        continue
      }
    }
    if (
      text.startsWith('//', i) &&
      (region === 'script' || (region === 'scss' && text[i - 1] !== ':' && text[i - 1] !== '('))
    ) {
      const end = text.indexOf('\n', i)
      i = blank(mask, i, end === -1 ? text.length : end)
      continue
    }
    // An unclosed `/*` is JSX text or a regex such as `/^\/*/`, not a comment that runs to the end of the file.
    if (text.startsWith('/*', i) && text.includes('*/', i + 2)) {
      i = blank(mask, i, closeAt(text, '*/', i + 2))
      continue
    }
    const quote = text[i]
    if (quote === '"' || quote === "'" || quote === '`') {
      i = keepTemplate(text, mask, i, false)
      continue
    }
    i++
  }
  return mask.join('')
}

// A `/` opens a regex only where an operand is expected; JSX text after `>` and closing tags after `<` stay plain text.
const REGEX_START_RE =
  /(?:[(,=:[!&|?{};~^%]|=>|(?:^|[^\w$])(?:return|typeof|case|void|delete|throw|yield|await|else|do|in|of|new))$/

function endOfRegex(text, start) {
  if (text[start + 1] === '/' || text[start + 1] === '*') return -1
  const before = text.slice(Math.max(0, start - 16), start).trimEnd()
  if (before ? !REGEX_START_RE.test(before) : start > 16) return -1
  let inClass = false
  let i = start + 1
  while (i < text.length) {
    const ch = text[i]
    if (ch === '\n') return -1
    if (ch === '\\') {
      i += 2
      continue
    }
    if (ch === '[') inClass = true
    else if (ch === ']') inClass = false
    else if (ch === '/' && !inClass) {
      i++
      while (/[a-z]/.test(text[i] ?? '')) i++
      return i
    }
    i++
  }
  return -1
}

function maskSource(text, html) {
  const mask = Array.from(text)
  let i = 0
  while (i < text.length) {
    if (text.startsWith('<!--', i)) {
      i = blank(mask, i, closeAt(text, '-->', i + 4))
      continue
    }
    if (!html && text.startsWith('//', i)) {
      const end = text.indexOf('\n', i)
      i = blank(mask, i, end === -1 ? text.length : end)
      continue
    }
    if (text.startsWith('/*', i)) {
      i = blank(mask, i, closeAt(text, '*/', i + 2))
      continue
    }

    const quote = text[i]
    if (quote === '"' || quote === "'" || quote === '`') {
      i = !html && isTemplatePropertyString(text, i) ? keepTemplate(text, mask, i, true) : blankString(text, mask, i)
      continue
    }
    i++
  }
  return mask.join('')
}

function isTemplatePropertyString(text, quoteIndex) {
  let index = quoteIndex - 1
  while (index >= 0 && /\s/.test(text[index])) index--
  if (text[index] !== ':') return false
  index--
  while (index >= 0 && /\s/.test(text[index])) index--
  const end = index + 1
  while (index >= 0 && /[A-Za-z0-9_$]/.test(text[index])) index--
  return text.slice(index + 1, end) === 'template'
}

function keepTemplate(text, mask, start, blankNested) {
  const quote = text[start]
  const stringEnd = endOfString(text, start)
  let i = start + 1
  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2
      continue
    }
    if (text.startsWith('<!--', i)) {
      const end = closeAt(text, '-->', i + 4)
      if (end <= stringEnd) {
        i = blank(mask, i, end)
        continue
      }
    }
    if (blankNested && (text[i] === '"' || text[i] === "'") && text[i] !== quote) {
      i = blankString(text, mask, i)
      continue
    }
    if (text[i] === quote) return i + 1
    if (quote !== '`' && text[i] === '\n') return i
    i++
  }
  return i
}

function blankString(text, mask, start) {
  return blank(mask, start, endOfString(text, start))
}

/** Returns the index after the string that opens at `start`; with `substitutions`, `${…}` may hold nested strings. */
export function endOfString(text, start, substitutions = false) {
  const quote = text[start]
  let i = start + 1
  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2
      continue
    }
    if (substitutions && quote === '`' && text.startsWith('${', i)) {
      i = endOfSubstitution(text, i + 2)
      continue
    }
    if (text[i] === quote) return i + 1
    if (quote !== '`' && text[i] === '\n') return i
    i++
  }
  return text.length
}

/** Returns the index after the `}` that closes a `${` whose body starts at `from`. */
export function endOfSubstitution(text, from) {
  const close = closingIndex(text, from - 1, '{', '}')
  return close === text.length ? close : close + 1
}

/** Returns the index of the `right` that closes the `left` at `open`, skipping strings, or `text.length`. */
export function closingIndex(text, open, left, right) {
  let depth = 0
  let i = open
  while (i < text.length) {
    const ch = text[i]
    if (ch === '"' || ch === "'" || ch === '`') {
      i = endOfString(text, i, true)
      continue
    }
    if (ch === left) depth++
    if (ch === right && --depth === 0) return i
    i++
  }
  return text.length
}

function blank(mask, from, to) {
  for (let i = from; i < to; i++) {
    if (mask[i] !== '\n') mask[i] = ' '
  }
  return to
}

function closeAt(text, token, from) {
  const end = text.indexOf(token, from)
  return end === -1 ? text.length : end + token.length
}

export function readTag(text, start) {
  return text.slice(start, tagEnd(text, start))
}

/**
 * Returns the index after the `>` that closes the tag opening at `start`, or `text.length`. It skips quoted values
 * and balanced JSX `{…}` expressions, so the `>` of an arrow function inside a handler does not end the tag.
 */
export function tagEnd(text, start) {
  let i = start + 1
  let quote = ''
  while (i < text.length) {
    const ch = text[i]
    if (quote) {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === quote) quote = ''
      i++
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      i++
      continue
    }
    if (ch === '{') {
      const close = closingIndex(text, i, '{', '}')
      if (close < text.length) {
        i = close + 1
        continue
      }
    }
    if (ch === '>') return i + 1
    i++
  }
  return text.length
}

export function lineText(text, index) {
  const start = text.lastIndexOf('\n', index - 1) + 1
  const end = text.indexOf('\n', index)
  return text.slice(start, end === -1 ? text.length : end)
}

export function lineAt(text, index) {
  let line = 1
  for (let i = 0; i < index; i++) if (text[i] === '\n') line++
  return line
}

export function toSnippet(raw) {
  return raw.replace(/\s+/g, ' ').replace(/ >/g, '>').trim().slice(0, 240)
}

/** Returns the `.ts` file beside an Angular `.html` template, or `undefined` for any other file. */
export function siblingScript(file) {
  return file.endsWith('.html') ? `${file.slice(0, -'.html'.length)}.ts` : undefined
}

const SCRIPT_RE = /\.[jt]sx?$/

/**
 * Runs `scanSourceFiles` and then pushes a `setValue: true` finding into `found` for every `.setValue(` call on a ref
 * typed `elementType`, in each scanned script and in the `.ts` beside each scanned `.html`. Returns the unmatched paths.
 */
export function scanSourceFilesWithSetValue(rootDir, collect, { paths = [], elementType, found }) {
  const pushSetValue = ({ file, masked, text }) => {
    for (const index of typedSetValueCalls(masked, elementType)) {
      found.push({ file, index, line: lineAt(text, index), snippet: toSnippet(lineText(text, index)), setValue: true })
    }
  }
  const scanned = new Set()
  const unmatched = scanSourceFiles(
    rootDir,
    source => {
      scanned.add(source.file)
      collect(source)
      if (SCRIPT_RE.test(source.file)) pushSetValue(source)
    },
    { paths },
  )
  for (const file of scanned) {
    const sibling = siblingScript(file)
    if (sibling && !scanned.has(sibling)) scanSourceFiles(rootDir, pushSetValue, { paths: [sibling] })
  }
  return unmatched
}

const IDENT = '([A-Za-z_$][\\w$]*)'
const CHAIN = '(?:[A-Za-z_$][\\w$]*(?:\\(\\))?\\s*[?!]?\\s*\\.\\s*)*[A-Za-z_$][\\w$]*(?:\\(\\))?[?!]?'
const RECEIVER_RE = new RegExp(`(${CHAIN})\\s*$`)
const ALIAS_RE = new RegExp(`\\b(?:const|let|var)\\s+${IDENT}\\s*=\\s*(${CHAIN})\\s*(?:;|$)`, 'gm')
const CONTINUATION_RE = /^\s*[?!]?\s*\./
const declarationCache = new Map()

function declarationsFor(type) {
  let cached = declarationCache.get(type)
  if (!cached) {
    cached = {
      declarations: [
        [`${IDENT}\\s*[!?]?\\s*:\\s*ElementRef\\s*<\\s*${type}\\s*>`, 'nativeElement'],
        [`${IDENT}\\s*=\\s*viewChild(?:\\.required)?\\s*<\\s*ElementRef\\s*<\\s*${type}\\s*>`, 'nativeElement'],
        [`${IDENT}\\s*=\\s*useRef\\s*<\\s*${type}\\b`, 'current'],
        [`${IDENT}\\s*[!?]?\\s*:\\s*${type}\\b`, ''],
        [`${IDENT}\\s*=[^;\\n]*?(?:\\bas\\s+${type}\\b|<\\s*${type}\\s*>\\s*\\()`, ''],
      ].map(([source, wrapper]) => [new RegExp(source, 'g'), wrapper]),
      inlineCast: new RegExp(`\\bas\\s+${type}\\s*\\)\\s*$`),
    }
    declarationCache.set(type, cached)
  }
  return cached
}

function chainParts(receiver) {
  return receiver.replace(/\(\)|[?!\s]/g, '').split('.')
}

function isTypedRef(refs, parts) {
  return refs.some(({ name, wrapper }) =>
    wrapper ? parts.at(-1) === wrapper && parts.at(-2) === name : parts.at(-1) === name,
  )
}

/**
 * Returns the index of every `.setValue(` call in `masked` whose receiver is a reference typed as `elementType`,
 * so a `FormControl.setValue` call on the same line shape is never returned.
 */
export function typedSetValueCalls(masked, elementType) {
  if (!masked.includes(elementType)) return []
  const { declarations, inlineCast } = declarationsFor(elementType)
  const refs = []
  for (const [re, wrapper] of declarations) {
    for (const match of masked.matchAll(re)) refs.push({ name: match[1], wrapper })
  }
  for (const match of masked.matchAll(ALIAS_RE)) {
    if (isTypedRef(refs, chainParts(match[2]))) refs.push({ name: match[1], wrapper: '' })
  }

  const calls = []
  for (const match of masked.matchAll(/\.\s*setValue\s*\(/g)) {
    let start = masked.lastIndexOf('\n', match.index - 1) + 1
    while (start > 0 && CONTINUATION_RE.test(masked.slice(start, match.index + 1))) {
      start = masked.lastIndexOf('\n', start - 2) + 1
    }
    const prefix = masked.slice(start, match.index)
    if (inlineCast.test(prefix)) {
      calls.push(match.index)
      continue
    }
    const receiver = RECEIVER_RE.exec(prefix)?.[1]
    if (receiver && isTypedRef(refs, chainParts(receiver))) calls.push(match.index)
  }
  return calls
}
