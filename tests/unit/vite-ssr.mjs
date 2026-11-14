// Shared loader for layer-2 tests (Spec 0001 §3): Vite transpiles the JSX modules for Node and
// React stays external, so components and react-dom/server share the same React instance.
import { after } from 'node:test'
import { createRequire } from 'node:module'
import { createServer } from 'vite'

const require = createRequire(import.meta.url)
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

const server = await createServer({
  root: process.cwd(),
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
})
after(() => server.close())

export const loadModule = path => server.ssrLoadModule(path)

// Static HTML of a component, with the entities React escapes decoded for plain-text assertions.
export const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props))
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#x27;', "'")
