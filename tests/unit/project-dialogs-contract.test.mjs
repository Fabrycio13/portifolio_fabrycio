// Static guards kept for the project dialogs (details, gallery, demos). Most cover what the layer-2
// render tests cannot observe (CSS, behaviour that needs state, public demo files); the demo action
// and the PHX title were classified as kept in Stage 6 and stay as they were. The rendered markup of
// these dialogs is covered by the *-render.test.mjs files.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { test } from 'node:test'

const root = resolve(import.meta.dirname, '../..')

const read = relativePath => readFile(resolve(root, relativePath), 'utf8')

// The project details are checked here; Sobre and Contato are checked on the rendered HTML in
// info-dialogs-render.test.mjs.
test('detalhes do projeto definem um foco inicial nativo', async () => {
  const projectDetails = await read('src/components/panels/ProjectDetailsPanel.jsx')

  assert.match(projectDetails, /data-dialog-initial-focus/)
  assert.match(projectDetails, /autoFocus/)
})

test('detalhes do projeto oferecem a ação de demo', async () => {
  const details = await read('src/components/panels/ProjectDetailsPanel.jsx')

  assert.match(details, /onOpenDemo/)
})

test('título do laudo PHX está no registro', async () => {
  const projects = await read('src/data/projects.js')

  assert.match(projects, /title: 'LAUDO DE CRÉDITO IMOBILIÁRIO'/)
})

test('prévia da galeria e miniaturas preservam o corte das capturas', async () => {
  const css = await read('src/App.css')
  const galleryCss = await read('src/components/panels/ProjectGalleryPanel.css')

  assert.match(css, /\.project-gallery-preview img\s*\{[\s\S]*aspect-ratio: 4 \/ 3;[\s\S]*object-fit: contain;/)
  assert.match(css, /\.project-gallery-preview__veil strong\s*\{[\s\S]*border-radius: 999px;[\s\S]*background: #78aebc;/)
  assert.match(galleryCss, /\.people-gallery__thumbnail img\s*\{[\s\S]*object-fit: contain;/)
})

test('galeria marca a miniatura da tela ativa', async () => {
  const gallery = await read('src/components/panels/ProjectGalleryPanel.jsx')

  // The static render only sees the first screen, where a value fixed to the first thumbnail looks
  // identical; following the active screen needs state, so this source guard stays.
  assert.match(gallery, /aria-pressed=\{index === activeIndex\}/)
})

test('mockup da demo Cindy mantém o título da página', async () => {
  const demoHtml = await read('public/nova-cindy-mockup-v2.html')

  assert.match(demoHtml, /<title>Nova Cindy · Protótipo visual<\/title>/)
})

test('navegação lateral da demo Nexus troca a seção ativa', async () => {
  const demo = await read('src/components/panels/NexusDemoPanel.jsx')

  // The items, labels and badges are covered on the rendered HTML in demo-dialogs-render.test.mjs;
  // switching sections needs component state, so these source guards stay.
  assert.match(demo, /setActiveSection\(item\.id\)/)
  assert.match(demo, /activeSection === item\.id/)
})

test('demo Nexus mantém retorno ao projeto', async () => {
  const demo = await read('src/components/panels/NexusDemoPanel.jsx')

  assert.match(demo, /onClick=\{onBack\}/)
})
