#!/usr/bin/env node
// Static render of the 13 dialogs (layer 2 feasibility + temporary golden, Spec 0001 §3 and §7.3).
// Render:  node scripts/dialog-golden.mjs render --out=<dir outside the repo>
// Compare: node scripts/dialog-golden.mjs compare <goldenDir> <candidateDir> [--ignore-attr=data-dialog-initial-focus]
// The golden proves content and markup equivalence only, never behaviour.
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describeEnvironment } from './run-environment.mjs'

const args = process.argv.slice(2)
const mode = args[0]
const option = name => args.find(arg => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
const positional = args.slice(1).filter(arg => !arg.startsWith('--'))
const noop = () => {}

// Dialog cases keyed by a stable id. When the implementation changes (registry, rename), only
// `module` and `props` change here; the ids and therefore the golden file names stay the same.
const cases = [
  ...['people', 'cindy', 'phx', 'nexus'].map(slug => ({
    id: `detalhes-${slug}`,
    module: '/src/components/dialogs/ProjectDetailsDialog.jsx',
    props: { slug, onClose: noop, onOpenDemo: noop, onOpenGallery: noop },
  })),
  // D2: the four galleries are one component; the ids keep comparing against the baseline files.
  ...['people', 'cindy', 'phx', 'nexus'].map(slug => ({
    id: `galeria-${slug}`,
    module: '/src/components/dialogs/ProjectGalleryDialog.jsx',
    props: { slug, onBack: noop, onClose: noop },
  })),
  { id: 'sobre', module: '/src/components/dialogs/InfoDialogs.jsx', props: { activePanel: 'sobre', onClose: noop, onOpenContact: noop } },
  { id: 'contato', module: '/src/components/dialogs/InfoDialogs.jsx', props: { activePanel: 'contato', onClose: noop, onOpenContact: noop } },
  { id: 'demo-cindy', module: '/src/components/dialogs/CindyDemoDialog.jsx', props: { onBack: noop, onClose: noop } },
  { id: 'demo-phx', module: '/src/components/dialogs/PhxDemoDialog.jsx', props: { onBack: noop, onClose: noop } },
  { id: 'demo-nexus', module: '/src/components/dialogs/NexusDemoDialog.jsx', props: { onBack: noop, onClose: noop } },
]

const render = async () => {
  const outDir = option('out')
  if (!outDir) throw new Error('Informe --out=<dir>')
  const root = process.cwd()
  // React must come from Node's own resolution (it is CommonJS); Vite then externalizes it for the
  // SSR-loaded JSX, so components and renderer share the same React instance.
  const require = createRequire(join(root, 'package.json'))
  const React = require('react')
  const { renderToStaticMarkup } = require('react-dom/server')
  const { createServer } = await import('vite')
  const server = await createServer({
    root,
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false },
    optimizeDeps: { noDiscovery: true, include: [] },
  })
  const started = performance.now()
  const results = []
  try {
    mkdirSync(resolve(outDir), { recursive: true })
    for (const dialog of cases) {
      const { default: Component } = await server.ssrLoadModule(dialog.module)
      const html = renderToStaticMarkup(React.createElement(Component, dialog.props))
      writeFileSync(join(resolve(outDir), `${dialog.id}.html`), `${html}\n`)
      results.push({
        id: dialog.id,
        bytes: Buffer.byteLength(html),
        dialogRole: html.includes('role="dialog"'),
        images: (html.match(/<img /g) ?? []).length,
        iframe: html.includes('<iframe'),
      })
    }
  } finally {
    await server.close()
  }
  const manifest = {
    kind: 'dialog-golden',
    ...describeEnvironment({ command: `node scripts/dialog-golden.mjs ${args.join(' ')}` }),
    durationMs: Math.round(performance.now() - started),
    results,
  }
  writeFileSync(join(resolve(outDir), 'manifest.json'), JSON.stringify(manifest, null, 2))
  for (const result of results) console.log(`OK ${result.id} ${result.bytes} bytes dialog=${result.dialogRole} imgs=${result.images} iframe=${result.iframe}`)
  console.log(`${results.length} dialogs renderizados em ${manifest.durationMs} ms com Node ${process.version}`)
}

const compare = () => {
  const [goldenDir, candidateDir] = positional.map(dir => resolve(dir))
  if (!goldenDir || !candidateDir) throw new Error('Informe <goldenDir> <candidateDir>')
  const ignored = option('ignore-attr')
  const strip = html => (ignored ? html.replaceAll(new RegExp(`\\s${ignored}(="[^"]*")?`, 'g'), '') : html)
  const files = readdirSync(goldenDir).filter(file => file.endsWith('.html'))
  let failures = 0
  for (const file of files) {
    let candidate
    try {
      candidate = readFileSync(join(candidateDir, file), 'utf8')
    } catch {
      console.log(`FALTA ${file}`)
      failures++
      continue
    }
    const golden = readFileSync(join(goldenDir, file), 'utf8')
    if (golden === candidate) {
      console.log(`IGUAL ${file}`)
    } else if (ignored && strip(golden) === strip(candidate)) {
      // Spec 0001 §7.3: only this attribute may differ, and every such difference is listed by name.
      console.log(`IGUAL-EXCETO-${ignored} ${file}`)
    } else {
      const index = [...golden].findIndex((char, i) => char !== candidate[i])
      console.log(`DIFERENTE ${file} a partir do caractere ${index}: …${golden.slice(Math.max(0, index - 60), index + 60)}… ≠ …${candidate.slice(Math.max(0, index - 60), index + 60)}…`)
      failures++
    }
  }
  if (failures) process.exitCode = 1
}

try {
  if (mode === 'render') await render()
  else if (mode === 'compare') compare()
  else throw new Error('Modo: render | compare')
} catch (error) {
  console.error(error.stack ?? error.message)
  process.exitCode = 1
}
