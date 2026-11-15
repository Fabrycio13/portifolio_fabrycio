// Static contract of the scene outside the dialogs (header, sections, footer) and of the removed
// legacy video flow. Source and CSS guards, because these rules are about layout and files.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { test } from 'node:test'

const root = resolve(import.meta.dirname, '../..')

const read = relativePath => readFile(resolve(root, relativePath), 'utf8')

test('fallback do footer mantém a altura mobile quando a seção é carregada', async () => {
  const css = await read('src/App.css')

  assert.match(css, /@media \(max-width: 640px\)[\s\S]*\.wave-footer--loading\s*\{\s*height: 100svh;/)
})

test('cabeçalho rolado não desenha uma linha horizontal no mobile', async () => {
  const css = await read('src/App.css')

  assert.match(css, /\.site-header\.is-scrolled\s*\{[\s\S]*border-bottom-color:\s*transparent;/)
})

test('Serviços têm uma faixa visual de transição abaixo dos cards', async () => {
  const source = await read('src/sections/StickyServices.jsx')
  const css = await read('src/sections/StickyServices.css')

  assert.match(source, /className="services-transition"/)
  assert.match(source, /src="\/images\/services-transition\.png"/)
  assert.match(css, /\.services-transition\s*\{[\s\S]*height: clamp\(9rem, 20svh, 18rem\)/)
  assert.match(css, /\.services-transition img\s*\{[\s\S]*object-fit: cover;/)
})

test('Footer mantém o link público do LinkedIn', async () => {
  const footer = await read('src/sections/WaveFooter.jsx')

  assert.match(footer, /https:\/\/www\.linkedin\.com\/in\/fabrycio-bermudes-b79a01216\//)
})

test('CSS e sonda não reintroduzem o fluxo legado de vídeo', async () => {
  const css = await read('src/App.css')
  const auditScript = await read('scripts/perf-audit.mjs')

  assert.doesNotMatch(css, /shader-video/i)
  assert.match(css, /a,\s*button,\s*\[role='button'\][\s\S]*-webkit-tap-highlight-color:\s*transparent/)
  assert.doesNotMatch(auditScript, /video\.mp4|ShaderVideo|qualityProfile/i)
  assert.match(auditScript, /Input\.dispatchMouseEvent/)
  assert.match(auditScript, /--footer/)
  assert.match(auditScript, /--projects/)
})
