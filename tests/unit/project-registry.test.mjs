// Invariants of the project registry (Spec 0001, D1.5, D1.6, D1.8, D1.9).
// The registry is imported directly by Node, without Vite or React: it must stay plain data.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import * as registry from '../../src/data/projects.js'

const { projects } = registry

const root = resolve(import.meta.dirname, '../..')
const publicAsset = path => existsSync(resolve(root, 'public', path.replace(/^\//, '')))
const nonEmpty = value => typeof value === 'string' && value.trim().length > 0

test('registro é dado puro: sem imports, React ou DOM', async () => {
  // Line comments are stripped so the rule applies to code, not to the documentation of the rule.
  const source = (await readFile(resolve(root, 'src/data/projects.js'), 'utf8')).replace(/^\s*\/\/.*$/gm, '')
  assert.doesNotMatch(source, /^\s*import\s|\bimport\(|\brequire\(/m, 'o registro não importa módulos')
  assert.doesNotMatch(source, /<[A-Z][A-Za-z]*[\s/>]/, 'o registro não contém JSX')
  assert.doesNotMatch(source, /\bdocument\.|\bwindow\./, 'o registro não acessa o DOM')
  // structuredClone throws on functions, so React components (e.g. icon components) cannot hide here.
  assert.doesNotThrow(() => structuredClone(projects), 'o registro deve conter só dados serializáveis')
})

test('slugs são únicos, estáveis e válidos', () => {
  const slugs = projects.map(project => project.slug)
  assert.deepEqual(slugs, ['people', 'cindy', 'phx', 'nexus'])
  assert.equal(new Set(slugs).size, slugs.length)
  for (const slug of slugs) assert.match(slug, /^[a-z][a-z0-9-]*$/)
})

test('número é só posição de exibição: único, em sequência e diferente da identidade', () => {
  projects.forEach((project, index) => {
    assert.equal(project.numero, String(index + 1).padStart(2, '0'))
    assert.notEqual(project.numero, project.slug)
  })
})

test('cada projeto tem card e detalhes completos', () => {
  for (const { slug, card, detalhes } of projects) {
    for (const field of ['title', 'detail', 'summary', 'logo', 'logoAlt']) assert.ok(nonEmpty(card[field]), `${slug}: card.${field}`)
    assert.ok(publicAsset(card.logo), `${slug}: logo inexistente ${card.logo}`)
    const description = Array.isArray(detalhes.description) ? detalhes.description : [detalhes.description]
    assert.ok(description.length > 0 && description.every(nonEmpty), `${slug}: descrição`)
    assert.ok(detalhes.features.length > 0, `${slug}: recursos`)
    assert.ok(detalhes.technologies.length > 0 && detalhes.technologies.every(t => nonEmpty(t.label) && nonEmpty(t.stack)), `${slug}: tecnologias`)
  }
})

// D1.12 and D1.13: the card had an `image`/`alt` pair that nothing rendered, pointing at the legacy
// project-01..03 screenshots. Only the unused references are removed here; what happens to the files
// is pending item P1 of Spec 0001. Gallery screens and previews keep their own image/alt.
test('cards não têm image nem alt sem consumidor (D1.12)', () => {
  for (const { slug, card } of projects) {
    assert.ok(!Object.hasOwn(card, 'image'), `${slug}: card.image sem consumidor`)
    assert.ok(!Object.hasOwn(card, 'alt'), `${slug}: card.alt sem consumidor`)
  }
})

test('código da aplicação não referencia as imagens legadas project-01..03 (D1.13)', async () => {
  // Every file under src/, so a reference coming back through a component is caught too. Comment
  // lines are ignored: they document the rule, they do not load the image.
  const files = (await readdir(resolve(root, 'src'), { recursive: true })).filter(file => /\.(jsx?|css|html)$/.test(file))
  for (const file of files) {
    const code = (await readFile(resolve(root, 'src', file), 'utf8')).replace(/^\s*(\/\/|\/?\*).*$/gm, '')
    assert.doesNotMatch(code, /project-0[1-3]\.webp/, `src/${file.replaceAll('\\', '/')}`)
  }
})

test('chaves de ícone são texto e existem na biblioteca de ícones', () => {
  // The component map lives in the details dialog (D1.6) and has its own coverage test in
  // project-gallery-preview.test.mjs. Here, independently of React, every key must name a real icon.
  const icons = createRequire(import.meta.url)('react-icons/fa')
  const componentName = key => `Fa${key.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('')}`
  for (const { slug, detalhes } of projects) {
    for (const feature of detalhes.features) {
      assert.match(feature.icon, /^[a-z][a-z-]*$/, `${slug}: chave de ícone inválida`)
      assert.equal(typeof icons[componentName(feature.icon)], 'function', `${slug}: ícone inexistente ${feature.icon}`)
      assert.ok(nonEmpty(feature.text), `${slug}: texto do recurso`)
    }
  }
})

test('galerias têm tema explícito, rótulos e telas válidas e não vazias', () => {
  // Each project keeps its own theme. Allowed values alone would accept a swapped theme, and the
  // layer-2 gallery test derives the expected class from the registry, so the binding is fixed here.
  assert.deepEqual(
    Object.fromEntries(projects.filter(project => project.galeria).map(({ slug, galeria }) => [slug, galeria.tema])),
    { people: null, cindy: 'cindy', phx: 'phx', nexus: 'nexus' },
  )
  const themes = new Set([null, 'cindy', 'phx', 'nexus'])
  for (const { slug, galeria } of projects) {
    if (galeria === null) continue
    assert.ok(themes.has(galeria.tema), `${slug}: tema ${galeria.tema}`)
    for (const field of ['eyebrow', 'badge', 'closeLabel', 'navigationLabel', 'previousLabel', 'nextLabel']) {
      assert.ok(nonEmpty(galeria[field]), `${slug}: galeria.${field}`)
    }
    assert.ok(nonEmpty(galeria.preview.alt) && nonEmpty(galeria.preview.countLabel), `${slug}: prévia`)
    assert.ok(publicAsset(galeria.preview.image), `${slug}: imagem da prévia inexistente`)
    assert.ok(galeria.screens.length > 0, `${slug}: galeria sem telas`)
    assert.equal(new Set(galeria.screens.map(screen => screen.image)).size, galeria.screens.length, `${slug}: telas repetidas`)
    for (const screen of galeria.screens) {
      for (const field of ['title', 'description', 'alt']) assert.ok(nonEmpty(screen[field]), `${slug}: tela.${field}`)
      assert.ok(publicAsset(screen.image), `${slug}: tela inexistente ${screen.image}`)
    }
  }
})

test('demo é ausente ou tem rótulo do botão', () => {
  for (const { slug, demo } of projects) {
    if (demo !== null) assert.ok(nonEmpty(demo.buttonLabel), `${slug}: demo.buttonLabel`)
  }
  assert.deepEqual(projects.filter(project => project.demo).map(project => project.slug), ['cindy', 'phx', 'nexus'])
})

test('o registro é a única fonte: não exporta formatos paralelos dos dados', () => {
  // projectCards existed only while consumers migrated (A1 → A2); it must not come back.
  assert.deepEqual(Object.keys(registry), ['projects'])
})
