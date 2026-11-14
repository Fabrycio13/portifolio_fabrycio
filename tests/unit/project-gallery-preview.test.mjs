// Regression: the gallery preview in the project details must open its gallery by identifier.
// The People preview used to pass the click event itself (`onClick={onOpenGallery}`) and only
// reached its gallery through the App's fallback branch.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule, render } from './vite-ssr.mjs'

const { default: ProjectDetailsPanel } = await loadModule('/src/components/panels/ProjectDetailsPanel.jsx')
const { projects } = await loadModule('/src/data/projects.js')

// The icon map is private to the details dialog (D1.6). A key missing from it makes React fail to
// render, and a rendered feature without its icon would drop the SVG, so both cases fail here.
test('mapa de ícones cobre todas as chaves usadas no registro', () => {
  for (const { slug, detalhes } of projects) {
    const html = render(ProjectDetailsPanel, { slug, onClose() {}, onOpenDemo() {}, onOpenGallery() {} })
    const items = html.match(/<li class="project-features__item">[\s\S]*?<\/li>/g) ?? []
    assert.equal(items.length, detalhes.features.length, `${slug}: recursos renderizados`)
    items.forEach((item, index) => {
      assert.match(item, /<svg[^>]*class="project-features__icon"/, `${slug}: recurso ${index + 1} sem ícone`)
    })
  }
})

const findElements = (node, predicate, found = []) => {
  if (Array.isArray(node)) node.forEach(child => findElements(child, predicate, found))
  else if (node && typeof node === 'object' && node.props) {
    if (predicate(node)) found.push(node)
    findElements(node.props.children, predicate, found)
  }
  return found
}

for (const gallery of ['people', 'cindy', 'phx', 'nexus']) {
  test(`prévia da galeria do projeto ${gallery} abre a galeria "${gallery}" pelo identificador`, () => {
    const calls = []
    const tree = ProjectDetailsPanel({
      slug: gallery,
      onClose: () => {},
      onOpenDemo: () => {},
      onOpenGallery: (...args) => calls.push(args),
    })
    const previews = findElements(tree, element => String(element.props.className ?? '').split(' ').includes('project-gallery-preview'))
    assert.equal(previews.length, 1)

    // React calls onClick with the click event; the handler must ignore it and send the identifier.
    previews[0].props.onClick({ type: 'click', target: {}, preventDefault() {} })

    assert.deepEqual(calls, [[gallery]])
  })
}
