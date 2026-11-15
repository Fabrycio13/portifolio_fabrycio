// Ticket D1 (Spec 0001, D1.9, D1.10): the single project gallery must reproduce each of the four
// existing galleries byte for byte, and its stylesheet must be the existing rules, unchanged, in
// the current bundle order (base, then themes). The old galleries are removed in D2; this
// equivalence check is then replaced by the golden comparison (see RASTREABILIDADE.md).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { loadModule, render } from './vite-ssr.mjs'

const panels = resolve(import.meta.dirname, '../../src/components/panels')
const { default: ProjectGalleryPanel } = await loadModule('/src/components/panels/ProjectGalleryPanel.jsx')
const oldGalleries = {
  people: (await loadModule('/src/components/panels/PeopleGalleryPanel.jsx')).default,
  cindy: (await loadModule('/src/components/panels/CindyGalleryPanel.jsx')).default,
  phx: (await loadModule('/src/components/panels/PhxGalleryPanel.jsx')).default,
  nexus: (await loadModule('/src/components/panels/NexusGalleryPanel.jsx')).default,
}
const noop = () => {}

for (const [slug, OldGallery] of Object.entries(oldGalleries)) {
  test(`galeria única reproduz byte a byte a galeria de ${slug}`, () => {
    assert.equal(render(ProjectGalleryPanel, { slug, onBack: noop, onClose: noop }), render(OldGallery, { onBack: noop, onClose: noop }))
  })
}

test('galeria de projeto inexistente não renderiza e é diagnosticada em desenvolvimento', () => {
  const original = console.error
  const calls = []
  console.error = (...args) => calls.push(args)
  try {
    assert.equal(render(ProjectGalleryPanel, { slug: 'inexistente', onBack: noop, onClose: noop }), '')
  } finally {
    console.error = original
  }
  assert.equal(calls.length, 1)
  assert.ok(calls[0].includes('inexistente'))
})

test('CSS reunido contém as regras atuais, inalteradas, na ordem base → cindy → nexus → phx', async () => {
  // Comments and line endings are ignored; every rule must match the original files exactly.
  const rules = async file => (await readFile(resolve(panels, file), 'utf8'))
    .replaceAll('\r\n', '\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim()
  const expected = (await Promise.all([
    'PeopleGalleryPanel.css', 'CindyGalleryPanel.css', 'NexusGalleryPanel.css', 'PhxGalleryPanel.css',
  ].map(rules))).join('\n\n')
  const merged = (await rules('ProjectGalleryPanel.css')).replace(/\n{3,}/g, '\n\n')
  assert.equal(merged, expected)
})
