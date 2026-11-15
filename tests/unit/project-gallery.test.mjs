// Single project gallery (Spec 0001, D1.9, D1.10), integrated in D2. Until D2 this file proved
// byte-for-byte equivalence with the four old galleries; with those removed, markup equivalence is
// proven by the temporary golden against the baseline (§7.3) and this layer-2 test keeps the rules:
// labels, alt text, theme class, initial focus and first screen for every project in the registry.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { projects } from '../../src/data/projects.js'
import { loadModule, render } from './vite-ssr.mjs'

const { default: ProjectGalleryDialog } = await loadModule('/src/components/dialogs/ProjectGalleryDialog.jsx')
const noop = () => {}
// A registry text as it appears in render() output: react-dom/server escapes & < > " ' and the
// shared render() (vite-ssr.mjs) decodes &amp; &quot; &#x27; back, so only < and > stay encoded.
const asRendered = text => text.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const pad = number => String(number).padStart(2, '0')
const { createElement } = createRequire(import.meta.url)('react')

// The expected fragments below must be encoded exactly as render() returns them, in text and in
// attribute positions, for every character React escapes; otherwise a registry text with one of
// them would fail the test without any regression in the page.
test('fragmentos esperados usam a mesma codificação do render, em texto e em atributo', () => {
  const sample = `A & B <c> "d" 'e'`
  assert.equal(render(() => sample, {}), asRendered(sample))
  assert.equal(render(({ value }) => createElement('i', { title: value }), { value: sample }), `<i title="${asRendered(sample)}"></i>`)
})

for (const { slug, galeria } of projects.filter(project => project.galeria)) {
  test(`galeria de ${slug}: dialog, tema, rótulos e primeira tela vindos do registro`, () => {
    const html = render(ProjectGalleryDialog, { slug, onBack: noop, onClose: noop })
    const { screens } = galeria
    const titleId = `${slug}-gallery-title`
    const themeClass = galeria.tema ? `people-gallery ${galeria.tema}-gallery is-open` : 'people-gallery is-open'
    const expected = [
      `<aside class="${themeClass}" role="dialog" aria-modal="true" aria-labelledby="${titleId}">`,
      `aria-label="${asRendered(galeria.closeLabel)}"`,
      'data-dialog-initial-focus="true"',
      `<p class="people-gallery__eyebrow">${asRendered(galeria.eyebrow)}</p>`,
      `<h2 id="${titleId}">${asRendered(screens[0].title)}</h2>`,
      `<span class="people-gallery__badge">${asRendered(galeria.badge)}</span>`,
      'aria-label="Fechar galeria"',
      `aria-label="${asRendered(`${galeria.previousLabel}: ${screens.at(-1).title}`)}"`,
      `<img src="${asRendered(screens[0].image)}" alt="${asRendered(screens[0].alt)}"/>`,
      `<figcaption><span>01 / ${pad(screens.length)}</span><p>${asRendered(screens[0].description)}</p></figcaption>`,
      `aria-label="${asRendered(`${galeria.nextLabel}: ${screens[1].title}`)}"`,
      `aria-label="${asRendered(galeria.navigationLabel)}"`,
    ]
    let position = 0
    for (const fragment of expected) {
      const index = html.indexOf(fragment, position)
      assert.ok(index >= 0, `ausente ou fora de ordem: ${fragment}`)
      position = index + fragment.length
    }
    // The initial focus belongs to the "Voltar ao projeto" button, as in the baseline.
    assert.match(html, /<button type="button" class="people-gallery__back" data-dialog-initial-focus="true" autofocus="">.*?Voltar ao projeto<\/button>/)
    // One thumbnail per screen, in order, with a decorative image; the gallery opens on the first
    // one (D1.9). The trailing space of inactive thumbnails is existing markup, kept by the golden.
    const thumbnails = [...html.matchAll(/<button type="button" class="people-gallery__thumbnail[\s\S]*?<\/button>/g)].map(match => match[0])
    assert.deepEqual(thumbnails, screens.map((screen, index) => (
      `<button type="button" class="people-gallery__thumbnail ${index === 0 ? 'is-active' : ''}" aria-label="${asRendered(`Abrir ${screen.title}`)}" aria-pressed="${index === 0}">`
      + `<img src="${asRendered(screen.image)}" alt=""/><span>${asRendered(screen.title)}</span></button>`
    )))
  })
}

test('galeria de projeto inexistente não renderiza e é diagnosticada em desenvolvimento', () => {
  const original = console.error
  const calls = []
  console.error = (...args) => calls.push(args)
  try {
    assert.equal(render(ProjectGalleryDialog, { slug: 'inexistente', onBack: noop, onClose: noop }), '')
  } finally {
    console.error = original
  }
  assert.equal(calls.length, 1)
  assert.ok(calls[0].includes('inexistente'))
})

test('CSS da galeria: base antes dos temas cindy → nexus → phx, mesmas regras por tema e Nexus sem color nos botões', async () => {
  const css = (await readFile(resolve(import.meta.dirname, '../../src/components/dialogs/ProjectGalleryDialog.css'), 'utf8'))
    .replaceAll('\r\n', '\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({ selector: selector.trim(), body }))
  const themeOf = rule => rule.selector.match(/^\.(cindy|nexus|phx)-gallery /)?.[1] ?? null
  const themes = rules.map(themeOf)
  const firstTheme = themes.findIndex(Boolean)
  assert.ok(firstTheme > 0 && themes.slice(0, firstTheme).every(theme => theme === null), 'regras base vêm antes dos temas')
  assert.deepEqual([...new Set(themes.slice(firstTheme))], ['cindy', 'nexus', 'phx'])
  const selectorsOf = theme => rules.filter(rule => themeOf(rule) === theme).map(rule => rule.selector.replaceAll(`.${theme}-gallery`, '.T'))
  assert.ok(selectorsOf('cindy').length > 0)
  assert.deepEqual(selectorsOf('nexus'), selectorsOf('cindy'))
  assert.deepEqual(selectorsOf('phx'), selectorsOf('cindy'))
  const buttons = theme => {
    const rule = rules.find(candidate => candidate.selector.startsWith(`.${theme}-gallery .people-gallery__back,`) && !candidate.selector.includes(':'))
    assert.ok(rule, `regra de botões do tema ${theme} ausente`)
    return rule.body
  }
  assert.doesNotMatch(buttons('nexus'), /(^|[^-])color:/)
  assert.match(buttons('cindy'), /(^|[^-])color:/)
  assert.match(buttons('phx'), /(^|[^-])color:/)
})
