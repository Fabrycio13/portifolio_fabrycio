// Layer 2 (Spec 0001 §3): the Sobre and Contato dialogs, asserted on the rendered HTML (copy,
// links, ARIA, initial focus) and on the handlers of their buttons. Replaces source-text checks
// of InfoDialogs.jsx (see tests/unit/RASTREABILIDADE.md, T6.2).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule, render } from './vite-ssr.mjs'

const { default: InfoDialogs } = await loadModule('/src/components/dialogs/InfoDialogs.jsx')
const noop = () => {}
// Icons are decorative SVG markup from react-icons; the rules here are about text and attributes.
const withoutIcons = html => html.replace(/<svg[\s\S]*?<\/svg>/g, '')
const dialog = activePanel => withoutIcons(render(InfoDialogs, { activePanel, onClose: noop, onOpenContact: noop }))
const count = (html, fragment) => html.split(fragment).length - 1

// The rendered element tree, to call the handlers React would call on click. Calling the function
// components directly only works because Sobre and Contato use no hooks; if one gains a hook, this
// helper must move to a real renderer instead of being worked around.
const tree = props => {
  const element = InfoDialogs(props)
  return element.type(element.props)
}
const findAll = (node, predicate, found = []) => {
  if (Array.isArray(node)) node.forEach(child => findAll(child, predicate, found))
  else if (node && typeof node === 'object' && node.props) {
    if (predicate(node)) found.push(node)
    findAll(node.props.children, predicate, found)
  }
  return found
}
const clickByClass = (root, className) => {
  const [button] = findAll(root, element => String(element.props.className ?? '').split(' ').includes(className))
  assert.ok(button, `botão ausente: .${className}`)
  button.props.onClick({ type: 'click' })
}
const includesAll = (html, fragments) => { for (const fragment of fragments) assert.ok(html.includes(fragment), `ausente: ${fragment}`) }

test('Sobre: dialog modal nomeado pelo título', () => {
  const html = dialog('sobre')
  assert.ok(html.startsWith('<aside id="sobre" class="info-panel is-open" role="dialog" aria-modal="true" aria-hidden="false" aria-labelledby="about-title">'))
  assert.equal(count(html, 'id="about-title"'), 1)
  assert.ok(html.includes('<h2 id="about-title">Muito prazer!</h2>'))
})

test('Sobre: copy aprovada, stack e CTA para Contato', () => {
  includesAll(dialog('sobre'), [
    '<p class="info-panel__label">Sobre</p>',
    '<p class="about-copy">Sou Fabrycio, engenheiro de software especializado em transformar ideias em produtos digitais, sistemas web e automações inteligentes.</p>',
    '<p class="about-copy">Acredito que a boa engenharia aparece quando a tecnologia resolve um problema real e torna a experiência do usuário mais simples.</p>',
    '<p class="about-copy">Construo desde landing pages e experiências digitais até plataformas SaaS completas, conectando interfaces, dados, APIs e infraestrutura. Mais recentemente, tenho concentrado minha atuação em IA e automações para criar soluções mais inteligentes, eficientes e preparadas para crescer.</p>',
    '<section class="about-toolkit" aria-labelledby="about-toolkit-title"><h3 id="about-toolkit-title">Minha stack</h3>',
    '<strong>Front-end</strong><p>React, Next.js, TypeScript, JavaScript, Vite e Tailwind CSS.</p>',
    '<strong>Back-end & Dados</strong><p>Supabase, PostgreSQL, Auth, Storage e Edge Functions.</p>',
    '<strong>Automação & IA</strong><p>n8n, integrações via APIs, prompts estruturados e fluxos inteligentes.</p>',
    '<button type="button" class="about-contact-cta"><span>CONVERSAR SOBRE UM PROJETO</span></button>',
  ])
})

test('Sobre: foco inicial no botão Fechar e fundo com rótulo', () => {
  const html = dialog('sobre')
  assert.equal(count(html, 'data-dialog-initial-focus'), 1)
  assert.ok(html.includes('<button type="button" class="info-panel__close" data-dialog-initial-focus="true" autofocus="">Fechar</button>'))
  assert.ok(html.includes('<button type="button" class="info-panel__backdrop" aria-label="Fechar Sobre"></button>'))
})

test('Sobre: fundo e Fechar fecham, CTA abre o Contato', () => {
  const calls = []
  const root = tree({ activePanel: 'sobre', onClose: () => calls.push('fechar'), onOpenContact: () => calls.push('contato') })
  for (const className of ['info-panel__backdrop', 'info-panel__close', 'about-contact-cta']) clickByClass(root, className)
  assert.deepEqual(calls, ['fechar', 'fechar', 'contato'])
})

test('Contato: dialog modal nomeado pelo título, com a copy aprovada', () => {
  const html = dialog('contato')
  assert.ok(html.startsWith('<aside id="contato" class="info-panel is-open" role="dialog" aria-modal="true" aria-hidden="false" aria-labelledby="contact-title">'))
  assert.equal(count(html, 'id="contact-title"'), 1)
  includesAll(html, [
    '<p class="info-panel__label">Contato</p>',
    '<h2 id="contact-title">VAMOS CONSTRUIR ALGO QUE FUNCIONE.</h2>',
    '<p class="contact-message">Tem uma ideia para tirar do papel, um processo para automatizar ou um produto que precisa evoluir? Me conte o contexto. Eu transformo problemas reais em produtos digitais, sistemas e automações inteligentes com clareza, engenharia e atenção aos detalhes.</p>',
    '<p class="contact-message">Escolha um canal abaixo e vamos conversar.</p>',
  ])
})

test('Contato: exatamente os cinco canais públicos, com destino, rótulo e nova aba', () => {
  const html = dialog('contato')
  const group = html.match(/<div class="contact-links" aria-label="Canais de contato">([\s\S]*?)<\/div>/)
  assert.ok(group, 'grupo de canais com rótulo ausente')
  const links = [...group[1].matchAll(/<a [^>]*>/g)].map(match => match[0])
  assert.deepEqual(links, [
    ['linkedin', 'https://www.linkedin.com/in/fabrycio-bermudes-b79a01216/', 'LinkedIn'],
    ['github', 'https://github.com/Fabrycio13', 'GitHub'],
    ['whatsapp', 'https://wa.me/5521986866460', 'WhatsApp'],
    ['instagram', 'https://www.instagram.com/fabrycio.bermudes', 'Instagram'],
    ['gmail', 'https://mail.google.com/mail/?view=cm&fs=1&to=fabrycio.bermudes%40gmail.com', 'Gmail'],
  ].map(([key, href, label]) => `<a class="contact-link contact-link--${key}" href="${href}" aria-label="${label}" title="${label}" target="_blank" rel="noreferrer">`))
  assert.equal(count(group[1], 'contact-link--disabled'), 0)
})

test('Contato: foco inicial no botão Fechar; fundo e Fechar fecham', () => {
  const html = dialog('contato')
  assert.equal(count(html, 'data-dialog-initial-focus'), 1)
  assert.ok(html.includes('<button type="button" class="info-panel__close" data-dialog-initial-focus="true" autofocus="">Fechar</button>'))
  assert.ok(html.includes('<button type="button" class="info-panel__backdrop" aria-label="Fechar Contato"></button>'))
  const calls = []
  const root = tree({ activePanel: 'contato', onClose: () => calls.push('fechar'), onOpenContact: noop })
  for (const className of ['info-panel__backdrop', 'info-panel__close']) clickByClass(root, className)
  assert.deepEqual(calls, ['fechar', 'fechar'])
})
