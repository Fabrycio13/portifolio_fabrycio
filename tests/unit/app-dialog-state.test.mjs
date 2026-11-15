// Static guards for how the App applies the dialog navigation (Spec 0001, D1.1–D1.4, D1.7).
// Runtime behaviour (focus, trap, Escape, chains) is covered by the browser smoke (§7.4); here we
// check the wiring rules that a refactor could silently break.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { projects } from '../../src/data/projects.js'

// Line endings are normalised: Windows checkouts with core.autocrlf have CRLF, CI has LF.
const app = (await readFile(resolve(import.meta.dirname, '../../src/App.jsx'), 'utf8')).replaceAll('\r\n', '\n')

const mapKeys = name => {
  const block = app.match(new RegExp(`const ${name} = \\{([\\s\\S]*?)\\n\\}`))
  assert.ok(block, `mapa ${name} não encontrado`)
  return [...block[1].matchAll(/^\s*([a-z][a-z0-9-]*):/gm)].map(match => match[1])
}

test('mapa de demos cobre exatamente os projetos com demo no registro', () => {
  assert.deepEqual(mapKeys('demoDialogs').sort(), projects.filter(project => project.demo).map(project => project.slug).sort())
})

// D2: one gallery component fed by the registry replaces the per-project map. Which projects have
// a gallery is decided by the navigation module (dialog-navigation.test.mjs) and rendered per slug
// in project-gallery.test.mjs.
test('App renderiza a galeria única para o slug do estado, sem mapa nem galerias por projeto', () => {
  assert.match(app, /import ProjectGalleryPanel from '@\/components\/panels\/ProjectGalleryPanel\.jsx'/)
  assert.match(app, /dialog\?\.tipo === 'galeria' && \(\s*<ProjectGalleryPanel key=\{dialog\.slug\} slug=\{dialog\.slug\} onBack=\{goBack\} onClose=\{closeDialog\} \/>\s*\)/)
  assert.doesNotMatch(app, /galleryDialogs|(People|Cindy|Phx|Nexus)GalleryPanel/)
})

test('transições passam pelo módulo de navegação, sem preserveTrigger nem estado misto', () => {
  assert.match(app, /import \{ fechar, navegar, voltar \} from '@\/utils\/dialogNavigation\.js'/)
  assert.match(app, /navegar\(dialog, destination, projects\)/)
  assert.match(app, /voltar\(dialog, projects\)/)
  assert.match(app, /fechar\(\)/)
  assert.doesNotMatch(app, /preserveTrigger|activePanel ===|setActivePanel|openPanel\(/)
})

test('gatilho só é capturado quando o módulo indica abertura a partir de null', () => {
  assert.match(app, /if \(result\.capturarGatilho\) \{\s*lastTriggerRef\.current = document\.activeElement/)
  assert.equal((app.match(/lastTriggerRef\.current = document\.activeElement/g) ?? []).length, 1)
})

test('transição rejeitada mantém o estado e só avisa em desenvolvimento', () => {
  assert.match(app, /if \(!result\.ok\) \{\s*if \(import\.meta\.env\.DEV\) console\.error\(.+\n\s*return\s*\}/)
  assert.equal((app.match(/console\.error/g) ?? []).length, 1)
})

test('Escape fecha pelo módulo de navegação', () => {
  assert.match(app, /event\.key === 'Escape'\) \{\s*event\.preventDefault\(\)\s*closeDialog\(\)/)
})
