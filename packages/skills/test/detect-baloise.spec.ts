import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { detectBaloise, readNpmDistTags, run } from '../skills/ds-migrate-from-baloise/scripts/detect-baloise.mjs'

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

    const result = await detectBaloise(root, {
      readDistTags: async () => {
        throw new Error('imports under dist and coverage are not an install')
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

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result).toMatchObject({
      framework: 'angular',
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

  it('uses the shallowest package.json that depends on Baloise', async () => {
    const root = createScratchDir()
    write(root, 'pnpm-lock.yaml', 'lockfileVersion: 9\n')
    write(root, 'package.json', JSON.stringify({ name: 'workspace', dependencies: { react: '19.0.0' } }))
    write(
      root,
      'apps/web/package.json',
      JSON.stringify({
        dependencies: { '@angular/core': '22.0.0', '@baloise/ds-angular': '19.10.2' },
      }),
    )
    write(
      root,
      'apps/web/legacy/package.json',
      JSON.stringify({ dependencies: { 'react': '18.0.0', '@baloise/ds-react': '19.10.2' } }),
    )
    write(root, 'apps/web/src/styles.scss', "@import '@baloise/ds-styles/css/design-system';\n")

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.1') })

    expect(result).toMatchObject({
      packageManager: 'pnpm',
      framework: 'angular',
      packageJsonPath: 'apps/web/package.json',
      dependencies: ['@baloise/ds-angular'],
    })
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
      JSON.stringify({ dependencies: { '@baloise/ds-angular': '19.11.0', '@angular/core': '18.0.0' } }),
    )
    write(root, 'apps/web/src/main.ts', "import { BaloiseDesignSystemModule } from '@baloise/ds-angular'\n")

    const result = await detectBaloise(root, { readDistTags: distTags('20.0.0') })

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

describe('aliasesFor declares every package the migration makes the consumer import', () => {
  async function aliasesForDeps(dependencies: Record<string, string>) {
    const root = createScratchDir()
    write(root, 'package.json', JSON.stringify({ dependencies }))
    write(root, 'src/entry.ts', "import '@baloise/ds-styles/css/normalize.css'\n")
    const result = await detectBaloise(root, { readDistTags: distTags('20.0.0') })
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
    expect(await aliasesForDeps({ '@baloise/ds-angular': '19.0.0', '@angular/core': '18.0.0' })).toEqual([
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

  it.each(['@baloise/ds-icons', '@baloise/ds-brand-icons'])(
    'declares assets when %s is a direct dependency',
    async name => {
      expect(await aliasesForDeps({ '@baloise/ds-core': '19.0.0', [name]: '19.0.0' })).toEqual([
        '@helvetia-design/assets',
        '@helvetia-design/core',
        '@helvetia-design/styles',
        '@helvetia-design/tokens',
      ])
    },
  )
})
