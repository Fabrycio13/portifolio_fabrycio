// Regression: the gallery preview in the project details must open its gallery by identifier.
// The People preview used to pass the click event itself (`onClick={onOpenGallery}`) and only
// reached its gallery through the App's fallback branch.
import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

// Vite transpiles the JSX module for Node; React stays external to Vite, as in the static-render tooling.
const server = await createServer({
  root: process.cwd(),
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
})
after(() => server.close())

const { default: ProjectDetailsPanel } = await server.ssrLoadModule('/src/components/panels/ProjectDetailsPanel.jsx')

const findElements = (node, predicate, found = []) => {
  if (Array.isArray(node)) node.forEach(child => findElements(child, predicate, found))
  else if (node && typeof node === 'object' && node.props) {
    if (predicate(node)) found.push(node)
    findElements(node.props.children, predicate, found)
  }
  return found
}

const galleryPreviews = [
  { projectNumber: '01', gallery: 'people' },
  { projectNumber: '02', gallery: 'cindy' },
  { projectNumber: '03', gallery: 'phx' },
  { projectNumber: '04', gallery: 'nexus' },
]

for (const { projectNumber, gallery } of galleryPreviews) {
  test(`prévia da galeria do projeto ${projectNumber} abre a galeria "${gallery}" pelo identificador`, () => {
    const calls = []
    const tree = ProjectDetailsPanel({
      projectNumber,
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
