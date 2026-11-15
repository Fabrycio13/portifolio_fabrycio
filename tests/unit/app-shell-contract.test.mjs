// Static contract of the App shell (src/App.jsx) beyond the dialog-state wiring checked in
// app-dialog-state.test.mjs. Runtime behaviour is covered by the browser smoke (Spec 0001 §7.4),
// which runs outside CI, so these guards keep the rules in CI.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { test } from 'node:test'

const root = resolve(import.meta.dirname, '../..')

const read = relativePath => readFile(resolve(root, relativePath), 'utf8')

// Capturing the trigger and closing with Escape are checked in app-dialog-state.test.mjs.
test('PortfolioContent mantém gerenciamento de foco nos dialogs', async () => {
  const source = await read('src/App.jsx')

  assert.match(source, /event\.key !== 'Tab'/)
  assert.match(source, /const firstElement = focusableElements\[0\]/)
  assert.match(source, /firstElement\.focus\(\)/)
  assert.match(source, /lastTriggerRef\.current\?\.focus\(\)/)
  assert.match(source, /import InfoPanels from '@\/components\/panels\/InfoPanels\.jsx'/)
  assert.match(source, /import ProjectDetailsPanel from '@\/components\/panels\/ProjectDetailsPanel\.jsx'/)
  assert.match(source, /className="hero__cta" href="#servicos"/)
  assert.match(source, /className="hero__cta hero__cta--contact"/)
  assert.match(source, /onClick=\{\(\) => openDialog\(\{ tipo: 'contato' \}\)\}/)
})

// app-dialog-state checks that the demo map covers the registry; here, which component each slug uses.
test('mapa de demos aponta cada projeto para o seu componente', async () => {
  const app = await read('src/App.jsx')

  assert.match(app, /import CindyDemoPanel from '@\/components\/panels\/CindyDemoPanel\.jsx'/)
  assert.match(app, /cindy: CindyDemoPanel/)
  assert.match(app, /import NexusDemoPanel from '@\/components\/panels\/NexusDemoPanel\.jsx'/)
  assert.match(app, /nexus: NexusDemoPanel/)
  assert.match(app, /import PhxDemoPanel from '@\/components\/panels\/PhxDemoPanel\.jsx'/)
  assert.match(app, /phx: PhxDemoPanel/)
})

test('trap de foco localiza a galeria aberta pela classe people-gallery', async () => {
  const app = await read('src/App.jsx')

  assert.match(app, /\.people-gallery\.is-open/)
})
