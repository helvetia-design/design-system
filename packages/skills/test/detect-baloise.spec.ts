import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  detectBaloise,
  lowestMajor,
  parseArgs,
  readNpmAngularPeers,
  readNpmDistTags,
  run,
} from '../skills/ds-migrate-from-baloise/scripts/detect-baloise.mjs'

const NOTHING = 'no Baloise Design System installation detected, nothing to migrate'

const scratches: string[] = []

afterEach(() => {
  for (const dir of scratches) rmSync(dir, { recursive: true, force: true })
  scratches.length = 0
})

function createScratchDir() {
  const dir = mkdtempSync(join(tmpdir(), 'ds-migrate-init-'))
  scratches.push(dir)
  return dir
}

function write(root: string, rel: string, contents: string) {
  const file = join(root, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, contents)
}

function distTags(version: string) {
  // Includes an unrelated tag alongside `latest` to prove resolution reads
  // `latest` specifically, not just the first key in the object.
  return async () => ({ latest: version, snapshot: '0.0.5-snapshot.1-abc1234' })
}

function angularPeers(range = '>=22.0.0') {
  return async () => ({ '@angular/core': range, '@angular/common': range, '@angular/forms': range })
}

describe('detectBaloise', () => {
  it('reports nothing to migrate when no Baloise dependency or import exists', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ name: 'app', dependencies: { react: '19.0.0' } }))

    const result = await detectBaloise(root, {
      readDistTags: async () => {
        throw new Error('npm view should not run when nothing is installed')
      },
    })

    expect(result).toEqual({
      status: 'nothing-to-migrate',
      message: NOTHING,
    })
  })

  it('reports nothing to migrate when a dependency exists but no CSS or JS import does', async () => {
    const root = createScratchDir()
    write(
      root,
      'package.json',
      JSON.stringify({ dependencies: { '@baloise/ds-core': '19.10.2', '@baloise/ds-styles': '19.10.2' } }),
    )

    const result = await detectBaloise(root, {
      readDistTags: async () => {
        throw new Error('npm view should not run without an import')
      },
    })

    expect(result).toEqual({ status: 'nothing-to-migrate', message: NOTHING })
  })

  it('reports nothing to migrate when an import exists but package.json does not depend on Baloise', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ name: 'app' }))
    write(
      root,
      'index.html',
      '<link rel="stylesheet" href="node_modules/@baloise/ds-styles/dist/css/design-system.css" />\n',
    )

    const result = await detectBaloise(root, {
      readDistTags: async () => {
        throw new Error('npm view should not run without a dependency')
      },
    })

    expect(result).toEqual({ status: 'nothing-to-migrate', message: NOTHING })
  })

  it('ignores an import that only exists under a skipped directory', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies: { '@baloise/ds-core': '19.10.2' } }))
    write(
      root,
      'dist/index.html',
      '<script type="module" src="node_modules/@baloise/ds-core/dist/design-system/design-system.esm.js"></script>\n',
    )
    write(root, 'coverage/app.js', "import '@baloise/ds-core'\n")
    write(root, 'storybook-static/main.js', "import '@baloise/ds-core'\n")
    write(root, '.nx/cache/app.js', "import '@baloise/ds-core'\n")

    const result = await detectBaloise(root, {
      readDistTags: async () => {
        throw new Error('imports under dist, coverage, storybook-static and .nx are not an install')
      },
    })

    expect(result).toEqual({ status: 'nothing-to-migrate', message: NOTHING })
  })

  it('ignores a dependency that only exists under node_modules', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ name: 'app' }))
    write(
      root,
      'node_modules/@baloise/ds-core/package.json',
      JSON.stringify({ dependencies: { '@baloise/ds-styles': '19.10.2' } }),
    )
    write(
      root,
      'index.html',
      '<link rel="stylesheet" href="node_modules/@baloise/ds-styles/dist/css/design-system.css" />\n',
    )

    const result = await detectBaloise(root, {
      readDistTags: async () => {
        throw new Error('node_modules is not the app install')
      },
    })

    expect(result).toEqual({ status: 'nothing-to-migrate', message: NOTHING })
  })

  it('ignores a comment-only mention', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies: { '@baloise/ds-styles': '19.10.2' } }))
    write(root, 'src/notes.ts', '// import "@baloise/ds-styles/css/design-system"\n')

    const result = await detectBaloise(root, {
      readDistTags: async () => {
        throw new Error('a comment is not an import')
      },
    })

    expect(result).toEqual({ status: 'nothing-to-migrate', message: NOTHING })
  })

  it('detects an import in a .mts file', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies: { '@baloise/ds-core': '19.10.2' } }))
    write(root, 'src/setup.mts', "import '@baloise/ds-core'\n")

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.0') })

    expect(result).toMatchObject({
      status: 'ready',
      imports: [{ file: 'src/setup.mts', line: 1, snippet: "import '@baloise/ds-core'" }],
    })
  })

  it('detects a React app, pnpm, and aliases for the resolved latest version', async () => {
    const root = createScratchDir()
    write(root, 'pnpm-lock.yaml', 'lockfileVersion: 9\n')
    write(
      root,
      'package.json',
      JSON.stringify({
        dependencies: {
          'react': '19.0.0',
          'react-dom': '19.0.0',
          '@baloise/ds-react': '19.10.2',
          '@baloise/ds-styles': '19.10.2',
        },
      }),
    )
    write(
      root,
      'src/main.tsx',
      ["import '@baloise/ds-styles/css/design-system'", "import { BalButton } from '@baloise/ds-react'", ''].join('\n'),
    )

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.0') })

    expect(result).toEqual({
      status: 'ready',
      packageManager: 'pnpm',
      installCommand: 'pnpm install',
      framework: 'react',
      packageJsonPath: 'package.json',
      dependencies: ['@baloise/ds-react', '@baloise/ds-styles'],
      imports: [
        {
          file: 'src/main.tsx',
          line: 1,
          snippet: "import '@baloise/ds-styles/css/design-system'",
          kind: 'bootstrap',
        },
        {
          file: 'src/main.tsx',
          line: 2,
          snippet: "import { BalButton } from '@baloise/ds-react'",
          kind: 'reference',
        },
      ],
      version: '20.0.0',
      aliases: {
        '@helvetia-design/react': '20.0.0',
        '@helvetia-design/assets': '20.0.0',
        '@helvetia-design/core': '20.0.0',
        '@helvetia-design/styles': '20.0.0',
        '@helvetia-design/tokens': '20.0.0',
      },
    })
  })

  it('uses the resolved latest tag instead of a hardcoded version', async () => {
    const root = createScratchDir()
    write(
      root,
      'package.json',
      JSON.stringify({ dependencies: { '@baloise/ds-styles': '19.10.2', 'react': '19.0.0' } }),
    )
    write(root, 'src/styles.ts', "import '@baloise/ds-styles/css/design-system'\n")

    const result = await detectBaloise(root, { readDistTags: distTags('20.1.0') })

    expect(result).toMatchObject({
      status: 'ready',
      version: '20.1.0',
      aliases: {
        '@helvetia-design/react': '20.1.0',
        '@helvetia-design/core': '20.1.0',
        '@helvetia-design/styles': '20.1.0',
        '@helvetia-design/tokens': '20.1.0',
      },
    })
  })

  it('detects yarn from yarn.lock', async () => {
    const root = createScratchDir()
    write(root, 'yarn.lock', '# yarn lockfile v1\n')
    write(
      root,
      'package.json',
      JSON.stringify({ dependencies: { 'react': '18.0.0', '@baloise/ds-styles': '19.10.2' } }),
    )
    write(root, 'src/index.jsx', "import '@baloise/ds-styles/dist/css/design-system.css'\n")

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result).toMatchObject({ packageManager: 'yarn', installCommand: 'yarn install' })
  })

  it('detects npm from package-lock.json and defaults to npm when no lockfile exists', async () => {
    const withLock = createScratchDir()
    write(withLock, 'package-lock.json', '{}\n')
    write(withLock, 'package.json', JSON.stringify({ dependencies: { '@baloise/ds-core': '19.10.2' } }))
    write(
      withLock,
      'index.html',
      '<script type="module" src="node_modules/@baloise/ds-core/dist/design-system/design-system.esm.js"></script>\n',
    )

    const locked = await detectBaloise(withLock, { readDistTags: distTags('20.0.1') })
    expect(locked).toMatchObject({ packageManager: 'npm', installCommand: 'npm install', framework: 'html' })

    const bare = createScratchDir()
    write(bare, 'package.json', JSON.stringify({ devDependencies: { '@baloise/ds-styles': '19.10.2' } }))
    write(
      bare,
      'index.html',
      '<link rel="stylesheet" href="node_modules/@baloise/ds-styles/dist/css/design-system.css" />\n',
    )

    const unlocked = await detectBaloise(bare, { readDistTags: distTags('20.0.1') })
    expect(unlocked).toMatchObject({
      packageManager: 'npm',
      installCommand: 'npm install',
      framework: 'html',
      dependencies: ['@baloise/ds-styles'],
      aliases: {
        '@helvetia-design/core': '20.0.1',
        '@helvetia-design/core': '20.0.1',
        '@helvetia-design/styles': '20.0.1',
        '@helvetia-design/tokens': '20.0.1',
      },
    })
  })

  it('detects Angular from @angular/core and adds angular plus styles', async () => {
    const root = createScratchDir()
    write(
      root,
      'package.json',
      JSON.stringify({
        dependencies: {
          '@angular/core': '22.0.0',
          '@baloise/ds-angular': '19.10.2',
          '@baloise/ds-styles': '19.10.2',
        },
      }),
    )
    write(
      root,
      'angular.json',
      JSON.stringify({
        projects: {
          app: {
            architect: {
              build: { options: { styles: ['node_modules/@baloise/ds-styles/dist/css/design-system.css'] } },
            },
          },
        },
      }),
    )

    const result = await detectBaloise(root, {
      readDistTags: distTags('20.0.1'),
      readAngularPeers: angularPeers(),
    })

    expect(result).toMatchObject({
      framework: 'angular',
      angular: { installed: '22.0.0', required: '>=22.0.0', compatible: true },
      packageJsonPath: 'package.json',
      aliases: {
        '@helvetia-design/angular': '20.0.1',
        '@helvetia-design/core': '20.0.1',
        '@helvetia-design/styles': '20.0.1',
        '@helvetia-design/tokens': '20.0.1',
      },
      imports: [
        {
          file: 'angular.json',
          line: 1,
          kind: 'bootstrap',
        },
      ],
    })
  })

  it('prefers a manifest at the project root over Baloise manifests in sub-folders', async () => {
    const root = createScratchDir()
    write(root, 'pnpm-lock.yaml', 'lockfileVersion: 9\n')
    write(root, 'package.json', JSON.stringify({ dependencies: { '@baloise/ds-react': '19.10.2' } }))
    write(root, 'apps/web/package.json', JSON.stringify({ dependencies: { '@baloise/ds-angular': '19.10.2' } }))
    write(root, 'src/main.tsx', "import '@baloise/ds-styles/css/all.css'\n")

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result).toMatchObject({ framework: 'html', packageJsonPath: 'package.json' })
  })

  it('stops with an error naming both manifests when two apps depend on Baloise and none sits at the root', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ name: 'workspace' }))
    write(root, 'apps/web/package.json', JSON.stringify({ dependencies: { '@baloise/ds-angular': '19.10.2' } }))
    write(root, 'apps/admin/package.json', JSON.stringify({ dependencies: { '@baloise/ds-react': '19.10.2' } }))
    write(root, 'apps/web/src/styles.scss', "@import '@baloise/ds-styles/css/design-system';\n")

    const result = await detectBaloise(root, {
      readDistTags: async () => {
        throw new Error('npm view should not run when the manifest is ambiguous')
      },
    })

    expect(result.status).toBe('error')
    expect(result.message).toContain('apps/admin/package.json, apps/web/package.json')
    expect(result.message).toContain('<project-root>')
  })

  it('scans a pnpm workspace from one app and keeps that app framework and the workspace package manager', async () => {
    const root = createScratchDir()
    write(root, 'pnpm-lock.yaml', 'lockfileVersion: 9\n')
    write(root, 'package.json', JSON.stringify({ name: 'workspace' }))
    write(
      root,
      'apps/web/package.json',
      JSON.stringify({ dependencies: { '@angular/core': '22.0.0', '@baloise/ds-angular': '19.10.2' } }),
    )
    write(root, 'apps/admin/package.json', JSON.stringify({ dependencies: { '@baloise/ds-react': '19.10.2' } }))
    write(root, 'apps/web/src/styles.scss', "@import '@baloise/ds-styles/css/design-system';\n")

    const result = await detectBaloise(join(root, 'apps/web'), {
      readDistTags: distTags('20.0.1'),
      readAngularPeers: angularPeers(),
    })

    expect(result).toMatchObject({ status: 'ready', installCommand: 'pnpm install', framework: 'angular' })
    expect(Object.keys(result.aliases)).toContain('@helvetia-design/angular')
    expect(Object.keys(result.aliases)).not.toContain('@helvetia-design/react')
  })

  it('lets the packageManager field win over a lockfile', async () => {
    const root = createScratchDir()
    write(root, 'package-lock.json', '{}')
    write(
      root,
      'package.json',
      JSON.stringify({ packageManager: 'pnpm@9.1.0', dependencies: { '@baloise/ds-core': '19.10.2' } }),
    )
    write(root, 'src/styles.scss', "@import '@baloise/ds-styles/css/all';\n")

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result).toMatchObject({ packageManager: 'pnpm', installCommand: 'pnpm install' })
  })

  it('falls through an unsupported packageManager value to the lockfile', async () => {
    const root = createScratchDir()
    write(root, 'pnpm-lock.yaml', 'lockfileVersion: 9\n')
    write(
      root,
      'package.json',
      JSON.stringify({ packageManager: 'deno@1', dependencies: { '@baloise/ds-core': '19.10.2' } }),
    )
    write(root, 'src/styles.scss', "@import '@baloise/ds-styles/css/all';\n")

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result).toMatchObject({ packageManager: 'pnpm', installCommand: 'pnpm install' })
  })

  it('reads packageManager from a workspace root above the scanned app', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ packageManager: 'yarn@4.1.0' }))
    const app = join(root, 'apps', 'web')
    write(app, 'package.json', JSON.stringify({ dependencies: { '@baloise/ds-core': '19.10.2' } }))
    write(app, 'src/styles.scss', "@import '@baloise/ds-styles/css/all';\n")

    const result = await detectBaloise(app, { readDistTags: distTags('20.0.1') })

    expect(result).toMatchObject({ packageManager: 'yarn', installCommand: 'yarn install' })
  })

  it.each([
    ['bun.lock', 'bun', 'bun install'],
    ['npm-shrinkwrap.json', 'npm', 'npm install'],
  ])('detects the package manager from %s', async (lockfile, packageManager, command) => {
    const root = createScratchDir()
    write(root, lockfile, '{}')
    write(root, 'package.json', JSON.stringify({ dependencies: { '@baloise/ds-core': '19.10.2' } }))
    write(root, 'src/styles.scss', "@import '@baloise/ds-styles/css/all';\n")

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result).toMatchObject({ packageManager, installCommand: command })
  })

  it('classifies the split utilities bundle (css/utilities/all) as bootstrap', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies: { '@baloise/ds-styles': '19.11.0' } }))
    write(root, 'src/styles.scss', "@use '@baloise/ds-styles/css/utilities/all';\n")

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.0') })

    expect(result.status).toBe('ready')
    expect(result.imports).toContainEqual({
      file: 'src/styles.scss',
      line: 1,
      snippet: "@use '@baloise/ds-styles/css/utilities/all';",
      kind: 'bootstrap',
    })
  })

  it('detects the icon packages as dependencies and their imports as references', async () => {
    const root = createScratchDir()
    write(
      root,
      'package.json',
      JSON.stringify({
        dependencies: {
          '@baloise/ds-react': '19.11.0',
          '@baloise/ds-icons': '19.11.0',
          '@baloise/ds-brand-icons': '19.11.0',
        },
      }),
    )
    write(
      root,
      'src/App.tsx',
      [
        "import * as balIcons from '@baloise/ds-icons'",
        "import { balBrandIconLiabilityPurple } from '@baloise/ds-brand-icons'",
        '',
      ].join('\n'),
    )

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.0') })

    expect(result).toMatchObject({
      status: 'ready',
      dependencies: ['@baloise/ds-brand-icons', '@baloise/ds-icons', '@baloise/ds-react'],
      imports: [
        { file: 'src/App.tsx', line: 1, snippet: "import * as balIcons from '@baloise/ds-icons'", kind: 'reference' },
        {
          file: 'src/App.tsx',
          line: 2,
          snippet: "import { balBrandIconLiabilityPurple } from '@baloise/ds-brand-icons'",
          kind: 'reference',
        },
      ],
    })
  })

  it('prefers the app manifest over a shallower manifest that declares only icon packages', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ devDependencies: { '@baloise/ds-icons': '19.11.0' } }))
    write(
      root,
      'apps/web/package.json',
      JSON.stringify({ dependencies: { '@baloise/ds-angular': '19.11.0', '@angular/core': '22.0.0' } }),
    )
    write(root, 'apps/web/src/main.ts', "import { BaloiseDesignSystemModule } from '@baloise/ds-angular'\n")

    const result = await detectBaloise(root, {
      readDistTags: distTags('20.0.0'),
      readAngularPeers: angularPeers(),
    })

    expect(result).toMatchObject({
      status: 'ready',
      framework: 'angular',
      packageJsonPath: 'apps/web/package.json',
      dependencies: ['@baloise/ds-angular'],
    })
  })

  it('classifies the all-in-one bundle (css/all) as bootstrap', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies: { '@baloise/ds-styles': '19.11.0' } }))
    write(root, 'src/styles.scss', "@import '@baloise/ds-styles/css/all';\n")

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.0') })

    expect(result.status).toBe('ready')
    expect(result.imports).toContainEqual({
      file: 'src/styles.scss',
      line: 1,
      snippet: "@import '@baloise/ds-styles/css/all';",
      kind: 'bootstrap',
    })
  })

  it('stops with an error when the latest dist-tag is missing', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies: { '@baloise/ds-core': '19.10.2' } }))
    write(
      root,
      'index.html',
      '<link rel="stylesheet" href="node_modules/@baloise/ds-styles/dist/css/design-system.css" />\n',
    )

    const result = await detectBaloise(root, { readDistTags: async () => ({ snapshot: '0.0.5-snapshot.1-abc1234' }) })

    expect(result).toEqual({
      status: 'error',
      message: 'npm view @helvetia-design/core dist-tags did not include a latest tag',
    })
  })

  it('prints the detection JSON and exits 0 for a clean stop', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ name: 'app' }))
    let text = ''

    const code = await run(root, {
      write(chunk: string) {
        text += chunk
      },
    })

    expect(code).toBe(0)
    expect(JSON.parse(text)).toEqual({ status: 'nothing-to-migrate', message: NOTHING })
  })
})

function baloiseApp(root: string, files: Record<string, string>) {
  write(root, 'package.json', JSON.stringify({ dependencies: { '@baloise/ds-core': '19.10.2' } }))
  for (const [rel, contents] of Object.entries(files)) write(root, rel, contents)
}

describe('detectBaloise import classification', () => {
  it('classifies a bare angular.json styles entry as bootstrap', async () => {
    const root = createScratchDir()
    baloiseApp(root, {
      'angular.json': '{ "styles": ["@baloise/ds-styles/css/all.css", "src/styles.scss"] }\n',
    })

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result.imports).toEqual([
      {
        file: 'angular.json',
        line: 1,
        snippet: '{ "styles": ["@baloise/ds-styles/css/all.css", "src/styles.scss"] }',
        kind: 'bootstrap',
      },
    ])
  })

  it('classifies a bare project.json entry as bootstrap', async () => {
    const root = createScratchDir()
    baloiseApp(root, { 'project.json': '{ "styles": ["@baloise/ds-styles/css/all.css"] }\n' })

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result.imports).toMatchObject([{ file: 'project.json', kind: 'bootstrap' }])
  })

  it('keeps a bare styles string in tsconfig.json as reference', async () => {
    const root = createScratchDir()
    baloiseApp(root, { 'tsconfig.json': '{ "paths": ["@baloise/ds-styles/css/all.css"] }\n' })

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result.imports).toMatchObject([{ file: 'tsconfig.json', kind: 'reference' }])
  })

  it('classifies a sass entry in angular.json as reference with a note', async () => {
    const root = createScratchDir()
    baloiseApp(root, { 'angular.json': '{ "stylePreprocessorOptions": ["@baloise/ds-styles/sass/mixins"] }\n' })

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result.imports).toMatchObject([
      { file: 'angular.json', kind: 'reference', note: expect.stringContaining('Migrate it by hand') },
    ])
  })

  it('classifies a Sass entry as reference with a note', async () => {
    const root = createScratchDir()
    baloiseApp(root, { 'src/a.scss': "@use '@baloise/ds-styles/sass/mixins' as bal;\n" })

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result.imports).toHaveLength(1)
    expect(result.imports[0]).toMatchObject({ kind: 'reference', note: expect.stringContaining('Migrate it by hand') })
  })

  it('does not report text inside a multi-line block comment without leading asterisks', async () => {
    const root = createScratchDir()
    baloiseApp(root, {
      'src/a.ts': [
        '/*',
        '  uses @baloise/ds-icons for symbols',
        '*/',
        "import '@baloise/ds-styles/css/all.css'",
        '',
      ].join('\n'),
    })

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result.imports.map((entry: { line: number }) => entry.line)).toEqual([4])
  })

  it('does not report text inside a multi-line HTML comment', async () => {
    const root = createScratchDir()
    baloiseApp(root, {
      'index.html': [
        '<!--',
        '  <link href="node_modules/@baloise/ds-styles/css/all.css">',
        '-->',
        '<script src="node_modules/@baloise/ds-core/dist/core.js"></script>',
        '',
      ].join('\n'),
    })

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result.imports.map((entry: { line: number }) => entry.line)).toEqual([4])
  })

  it('still reports code after the end of a block comment on the same line', async () => {
    const root = createScratchDir()
    baloiseApp(root, { 'src/a.ts': "/* legacy */ import '@baloise/ds-styles/css/all.css'\n" })

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result.imports).toHaveLength(1)
  })

  it('does not let a glob string hide the following import', async () => {
    const root = createScratchDir()
    baloiseApp(root, {
      'src/a.ts': ["const accept = 'image/*'", "import '@baloise/ds-styles/css/all.css'", ''].join('\n'),
    })

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result.imports.map((entry: { line: number }) => entry.line)).toEqual([2])
  })
})

describe('parseArgs', () => {
  it.each([
    [['--version=1.2.3'], { root: undefined, version: '1.2.3' }],
    [['/p', '--version', '1.2.3'], { root: '/p', version: '1.2.3' }],
    [['--version', '1.2.3', '/p'], { root: '/p', version: '1.2.3' }],
    [['--version'], { error: expect.stringContaining('--version needs a value') }],
  ])('parses %j', (argv, expected) => {
    expect(parseArgs(argv)).toEqual(expected)
  })
})

describe('detectBaloise npm failures', () => {
  it('rejects a latest dist-tag that is not a plain version', async () => {
    const root = createScratchDir()
    baloiseApp(root, { 'src/a.ts': "import '@baloise/ds-styles/css/all.css'\n" })

    const result = await detectBaloise(root, { readDistTags: async () => ({ latest: '1.0.0 & calc' }) })

    expect(result.status).toBe('error')
    expect(result.message).toContain('1.0.0 & calc')
  })

  function appWithImport() {
    const root = createScratchDir()
    baloiseApp(root, { 'src/a.ts': "import '@baloise/ds-styles/css/all.css'\n" })
    return root
  }

  it('returns an error that suggests --version when npm is missing', async () => {
    const root = appWithImport()

    const result = await detectBaloise(root, {
      readDistTags: async () => {
        throw Object.assign(new Error('spawn npm ENOENT'), { code: 'ENOENT' })
      },
    })

    expect(result.status).toBe('error')
    expect(result.message).toContain('npm view @helvetia-design/core dist-tags')
    expect(result.message).toContain('spawn npm ENOENT')
    expect(result.message).toContain('--version')
  })

  it('prefers the trimmed stderr text', async () => {
    const root = appWithImport()

    const result = await detectBaloise(root, {
      readDistTags: async () => {
        throw Object.assign(new Error('Command failed'), { stderr: 'npm error code ENOTFOUND\n' })
      },
    })

    expect(result.message).toContain('npm error code ENOTFOUND')
    expect(result.message).not.toContain('Command failed')
  })

  it('reports a timeout', async () => {
    const root = appWithImport()

    const result = await detectBaloise(root, {
      readDistTags: async () => {
        throw Object.assign(new Error('Command failed'), { killed: true, signal: 'SIGTERM' })
      },
    })

    expect(result.status).toBe('error')
    expect(result.message).toContain('timed out after 30 s')
  })

  it('skips the lookup when --version is given', async () => {
    const root = appWithImport()

    const result = await detectBaloise(root, {
      version: '20.1.0',
      readDistTags: async () => {
        throw new Error('npm view should not run with an explicit version')
      },
    })

    expect(result).toMatchObject({ status: 'ready', version: '20.1.0' })
  })

  it('rejects an invalid --version', async () => {
    const root = appWithImport()

    const result = await detectBaloise(root, { version: '1.0.0 && calc' })

    expect(result.status).toBe('error')
    expect(result.message).toContain('--version')
  })

  it('prints JSON and exits 1 for an error', async () => {
    const root = appWithImport()
    let output = ''

    const code = await run(root, { write: (chunk: string) => (output += chunk) } as never, { version: 'latest' })

    expect(code).toBe(1)
    expect(JSON.parse(output).status).toBe('error')
  })

  it('prints error JSON on stdout and exits 1 when npm is not on PATH', () => {
    const root = appWithImport()
    const script = fileURLToPath(
      new URL('../skills/ds-migrate-from-baloise/scripts/detect-baloise.mjs', import.meta.url),
    )

    const result = spawnSync(process.execPath, [script, root], { env: { PATH: '/nonexistent' }, encoding: 'utf8' })

    expect(result.status).toBe(1)
    expect(JSON.parse(result.stdout)).toMatchObject({ status: 'error', message: expect.stringContaining('--version') })
  })

  it('exits 1 with error JSON when --version has no value', () => {
    const script = fileURLToPath(
      new URL('../skills/ds-migrate-from-baloise/scripts/detect-baloise.mjs', import.meta.url),
    )

    const result = spawnSync(process.execPath, [script, createScratchDir(), '--version'], { encoding: 'utf8' })

    expect(result.status).toBe(1)
    expect(JSON.parse(result.stdout).status).toBe('error')
  })
})

describe('npm spawn options', () => {
  it('uses a shell and a 30 s timeout on Windows', async () => {
    const exec = vi.fn(async () => ({ stdout: '{"latest":"1.0.0"}' }))

    await readNpmDistTags(exec, 'win32')
    await readNpmAngularPeers('1.0.0', exec, 'win32')

    for (const call of exec.mock.calls) {
      expect(call[2]).toEqual({ encoding: 'utf8', timeout: 30000, shell: true })
    }
  })

  it('uses no shell elsewhere', async () => {
    const exec = vi.fn(async () => ({ stdout: '{"latest":"1.0.0"}' }))

    await readNpmDistTags(exec, 'linux')

    expect(exec.mock.calls[0][2]).toEqual({ encoding: 'utf8', timeout: 30000, shell: false })
  })
})

describe('readNpmDistTags', () => {
  it('asks npm view for the @helvetia-design/core dist-tags', async () => {
    const calls: unknown[][] = []
    const distTags = await readNpmDistTags(async (command: string, args: string[]) => {
      calls.push([command, args])
      return { stdout: JSON.stringify({ latest: '19.10.2', snapshot: '0.0.5-snapshot.1-abc1234' }) }
    })

    expect(calls).toEqual([['npm', ['view', '@helvetia-design/core', 'dist-tags', '--json']]])
    expect(distTags).toEqual({ latest: '19.10.2', snapshot: '0.0.5-snapshot.1-abc1234' })
  })
})

describe('readNpmAngularPeers', () => {
  it('asks npm view for the peerDependencies of the resolved @helvetia-design/angular version', async () => {
    const calls: unknown[][] = []
    const peers = await readNpmAngularPeers('0.0.6', async (command: string, args: string[]) => {
      calls.push([command, args])
      return { stdout: JSON.stringify({ '@angular/core': '>=22.0.0' }) }
    })

    expect(calls).toEqual([['npm', ['view', '@helvetia-design/angular@0.0.6', 'peerDependencies', '--json']]])
    expect(peers).toEqual({ '@angular/core': '>=22.0.0' })
  })

  it('parses a double-encoded npm view result', async () => {
    const peers = await readNpmAngularPeers('0.0.6', async () => ({
      stdout: JSON.stringify(JSON.stringify({ '@angular/core': '>=22.0.0' })),
    }))
    expect(peers).toEqual({ '@angular/core': '>=22.0.0' })
  })

  it('reads an empty npm view result as no peers', async () => {
    const peers = await readNpmAngularPeers('0.0.6', async () => ({ stdout: '\n' }))
    expect(peers).toEqual({})
  })
})

describe('lowestMajor', () => {
  it.each([
    ['^19.2.0', 19],
    ['~19.2.0', 19],
    ['19.2.0', 19],
    ['>=19.2.0', 19],
    ['>=22.0.0', 22],
    ['19.x', 19],
    ['19.X', 19],
    ['>= 22.0.0', 22],
    ['>=19 <20', 19],
    ['>=22.0.0 <=24.0.0', 22],
    ['*', null],
    ['latest', null],
    ['^18 || ^19', null],
    ['>22', null],
    ['19 - 22', null],
    ['>=19 >20', null],
    ['workspace:*', null],
    ['catalog:', null],
    ['git+https://x', null],
  ])('reads %s as %s', (spec, expected) => {
    expect(lowestMajor(spec)).toBe(expected)
  })

  it('returns null for a non-string', () => {
    expect(lowestMajor(undefined)).toBeNull()
  })
})

describe('Angular peer check', () => {
  function angularApp(lockfile?: string, spec = '^19.2.0') {
    const root = createScratchDir()
    if (lockfile) write(root, lockfile, '')
    write(
      root,
      'package.json',
      JSON.stringify({ dependencies: { '@angular/core': spec, '@baloise/ds-angular': '19.10.2' } }),
    )
    write(root, 'src/main.ts', "import { BaloiseDesignSystemModule } from '@baloise/ds-angular'\n")
    return root
  }

  const detectAngular = (root: string, readAngularPeers: (version: string) => Promise<unknown>) =>
    detectBaloise(root, { readDistTags: distTags('0.0.6'), readAngularPeers })

  it('reports the peer lookup stderr without suggesting --version', async () => {
    const result = (await detectBaloise(angularApp(), {
      version: '1.2.3',
      readAngularPeers: async () => {
        throw Object.assign(new Error('Command failed'), { stderr: 'npm error code E404' })
      },
    })) as { status: string; message: string }

    expect(result.status).toBe('error')
    expect(result.message).toContain('npm error code E404')
    expect(result.message).not.toContain('--version')
  })

  it('stops on Angular ^19.2.0 against >=22.0.0 and names both values', async () => {
    const result = (await detectAngular(angularApp(), angularPeers())) as {
      status: string
      message: string
      angular: unknown
    }

    expect(result.status).toBe('error')
    expect(result.message).toContain('^19.2.0')
    expect(result.message).toContain('>=22.0.0')
    expect(result.message).toContain('Upgrade the app to Angular 22')
    expect(result.angular).toEqual({ installed: '^19.2.0', required: '>=22.0.0', compatible: false })
  })

  it.each(['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json'])(
    'stops with the Angular error under %s',
    async lockfile => {
      const result = await detectAngular(angularApp(lockfile), angularPeers())
      expect(result).toMatchObject({
        status: 'error',
        message: expect.stringContaining('Upgrade the app to Angular 22'),
        angular: { installed: '^19.2.0', required: '>=22.0.0', compatible: false },
      })
    },
  )

  it('reads @angular/core from devDependencies', async () => {
    const root = createScratchDir()
    write(
      root,
      'package.json',
      JSON.stringify({
        dependencies: { '@baloise/ds-angular': '19.10.2' },
        devDependencies: { '@angular/core': '^19.2.0' },
      }),
    )
    write(root, 'src/main.ts', "import { BaloiseDesignSystemModule } from '@baloise/ds-angular'\n")

    const result = await detectAngular(root, angularPeers())
    expect(result).toMatchObject({ status: 'error', angular: { installed: '^19.2.0', compatible: false } })
  })

  it('proceeds when the peer range has an upper bound', async () => {
    const result = await detectAngular(angularApp(undefined, '^22.0.0'), angularPeers('>=22.0.0 <24.0.0'))
    expect(result).toMatchObject({
      status: 'ready',
      angular: { installed: '^22.0.0', required: '>=22.0.0 <24.0.0', compatible: true },
    })
  })

  it('proceeds on Angular ^22.0.0', async () => {
    const result = await detectAngular(angularApp(undefined, '^22.0.0'), angularPeers())
    expect(result).toMatchObject({
      status: 'ready',
      angular: { installed: '^22.0.0', required: '>=22.0.0', compatible: true },
    })
  })

  it('passes the resolved version to the reader', async () => {
    const versions: string[] = []
    await detectAngular(angularApp(undefined, '^22.0.0'), async version => {
      versions.push(version)
      return { '@angular/core': '>=22.0.0' }
    })
    expect(versions).toEqual(['0.0.6'])
  })

  it('returns error when the peer lookup fails', async () => {
    const result = await detectAngular(angularApp(), async () => {
      throw new Error('npm view failed')
    })
    expect(result).toMatchObject({ status: 'error' })
    expect((result as { message: string }).message).toContain('@helvetia-design/angular@0.0.6')
    expect(result).not.toHaveProperty('angular')
  })

  it('returns error when the peers have no @angular/core range', async () => {
    const result = await detectAngular(angularApp(), async () => ({ '@angular/common': '>=22.0.0' }))
    expect(result).toMatchObject({ status: 'error' })
  })

  it.each(['*', 'latest', '^18 || ^19', 'workspace:*', 'catalog:', 'git+https://example.com/x.git'])(
    'returns error naming the unparseable spec %s',
    async spec => {
      const result = await detectAngular(angularApp(undefined, spec), angularPeers())
      expect(result).toMatchObject({ status: 'error' })
      expect((result as { message: string }).message).toContain(spec)
    },
  )

  it('returns error for an unparseable peer range', async () => {
    const result = await detectAngular(angularApp(undefined, '^22.0.0'), angularPeers('^21 || ^22'))
    expect(result).toMatchObject({ status: 'error' })
    expect((result as { message: string }).message).toContain('^21 || ^22')
  })

  it.each([
    [
      'React',
      { 'react': '19.0.0', '@baloise/ds-react': '19.0.0' },
      'src/a.tsx',
      "import { BalButton } from '@baloise/ds-react'\n",
    ],
    [
      'plain HTML',
      { '@baloise/ds-core': '19.0.0' },
      'index.html',
      '<script src="node_modules/@baloise/ds-core/dist/ds-core.js"></script>\n',
    ],
  ])('does not read peers or add angular for a %s project', async (_name, dependencies, file, contents) => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies }))
    write(root, file, contents)
    const readAngularPeers = vi.fn()

    const result = await detectAngular(root, readAngularPeers)
    expect(readAngularPeers).not.toHaveBeenCalled()
    expect(result).toMatchObject({ status: 'ready' })
    expect(result).not.toHaveProperty('angular')
  })
})

describe('aliasesFor declares every package the migration makes the consumer import', () => {
  async function aliasesForDeps(dependencies: Record<string, string>) {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies }))
    write(root, 'src/entry.ts', "import '@baloise/ds-styles/css/normalize.css'\n")
    const result = await detectBaloise(root, {
      readDistTags: distTags('20.0.0'),
      readAngularPeers: angularPeers(),
    })
    return Object.keys((result as { aliases: Record<string, string> }).aliases).sort()
  }

  // Init writes an `@helvetia-design/tokens/css/base` import into the consumer's entry file, and
  // the controller and option types (`AlertController`, `Alert`, `ModalController`, `ModalOptions`)
  // are imported from `@helvetia-design/core` even in a React or Angular app. Both resolve
  // transitively under npm's flat node_modules but not under pnpm's strict layout, so Init has to
  // declare them.
  it('declares tokens and core for a React app', async () => {
    expect(await aliasesForDeps({ '@baloise/ds-react': '19.0.0', 'react': '19.0.0' })).toEqual([
      '@helvetia-design/core',
      '@helvetia-design/react',
      '@helvetia-design/styles',
      '@helvetia-design/tokens',
    ])
  })

  it('declares tokens and core for an Angular app', async () => {
    expect(await aliasesForDeps({ '@baloise/ds-angular': '19.0.0', '@angular/core': '22.0.0' })).toEqual([
      '@helvetia-design/angular',
      '@helvetia-design/core',
      '@helvetia-design/styles',
      '@helvetia-design/tokens',
    ])
  })

  it('declares tokens for a plain HTML app, which already had core', async () => {
    expect(await aliasesForDeps({ '@baloise/ds-core': '19.0.0' })).toEqual([
      '@helvetia-design/core',
      '@helvetia-design/styles',
      '@helvetia-design/tokens',
    ])
  })

  it.each([
    '@baloise/ds-icons',
    '@baloise/ds-brand-icons',
    '@baloise/ds-styles',
    '@baloise/ds-fonts',
    '@baloise/ds-favicons',
  ])('declares assets when %s is a direct dependency', async name => {
    expect(await aliasesForDeps({ '@baloise/ds-core': '19.0.0', [name]: '19.0.0' })).toEqual([
      '@helvetia-design/assets',
      '@helvetia-design/core',
      '@helvetia-design/styles',
      '@helvetia-design/tokens',
    ])
  })

  it('lists @baloise/ds-fonts and @baloise/ds-favicons in dependencies and declares assets', async () => {
    const root = createScratchDir()
    write(
      root,
      'package.json',
      JSON.stringify({
        dependencies: {
          'react': '19.0.0',
          '@baloise/ds-react': '19.0.0',
          '@baloise/ds-fonts': '19.0.0',
          '@baloise/ds-favicons': '19.0.0',
        },
      }),
    )
    write(root, 'src/entry.ts', "import '@baloise/ds-styles/css/normalize.css'\n")

    const result = (await detectBaloise(root, { readDistTags: distTags('20.0.0') })) as {
      dependencies: string[]
      aliases: Record<string, string>
    }

    expect(result.dependencies).toEqual(['@baloise/ds-favicons', '@baloise/ds-fonts', '@baloise/ds-react'])
    expect(result.aliases['@helvetia-design/assets']).toBe('20.0.0')
  })

  it('does not pick a manifest that declares only @baloise/ds-fonts', async () => {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies: { '@baloise/ds-fonts': '19.0.0' } }))
    write(root, 'src/entry.ts', "import '@baloise/ds-styles/css/normalize.css'\n")

    expect(await detectBaloise(root, { readDistTags: distTags('20.0.0') })).toEqual({
      status: 'nothing-to-migrate',
      message: NOTHING,
    })
  })
})
