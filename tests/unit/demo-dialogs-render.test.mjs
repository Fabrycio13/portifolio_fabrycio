// Layer 2 (Spec 0001 §3): the Cindy, PHX and Nexus demo dialogs, asserted on the rendered HTML.
// Each demo has its own structure, so each one is checked on its own terms. Cindy and PHX have no
// hooks, so their back and close handlers are also exercised on the element tree; Nexus keeps
// state, so its handlers and section switching stay with the static guards and the browser smoke
// (see tests/unit/RASTREABILIDADE.md, T6.2).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule, render } from './vite-ssr.mjs'

const { default: CindyDemoPanel } = await loadModule('/src/components/panels/CindyDemoPanel.jsx')
const { default: PhxDemoPanel } = await loadModule('/src/components/panels/PhxDemoPanel.jsx')
const { default: NexusDemoPanel } = await loadModule('/src/components/panels/NexusDemoPanel.jsx')
const noop = () => {}
// Icons are decorative SVG markup from react-icons; the rules here are about text and attributes.
const withoutIcons = html => html.replace(/<svg[\s\S]*?<\/svg>/g, '')
const demo = Component => withoutIcons(render(Component, { onBack: noop, onClose: noop }))
const count = (html, fragment) => html.split(fragment).length - 1
const includesAll = (html, fragments) => { for (const fragment of fragments) assert.ok(html.includes(fragment), `ausente: ${fragment}`) }

const findAll = (node, predicate, found = []) => {
  if (Array.isArray(node)) node.forEach(child => findAll(child, predicate, found))
  else if (node && typeof node === 'object' && node.props) {
    if (predicate(node)) found.push(node)
    findAll(node.props.children, predicate, found)
  }
  return found
}
const textOf = node => (Array.isArray(node) ? node.map(textOf).join('') : typeof node === 'string' ? node : node?.props ? textOf(node.props.children) : '')
const clickButton = (root, label) => {
  const [button] = findAll(root, element => element.type === 'button' && textOf(element.props.children).trim() === label)
  assert.ok(button, `botão ausente: ${label}`)
  button.props.onClick({ type: 'click' })
}

test('demo Cindy: dialog modal, título, rótulo e iframe da demo', () => {
  const html = demo(CindyDemoPanel)
  assert.ok(html.startsWith('<aside id="cindy-demo" class="info-panel is-open cindy-demo-panel" role="dialog" aria-modal="true" aria-hidden="false" aria-labelledby="cindy-demo-title">'))
  assert.equal(count(html, 'id="cindy-demo-title"'), 1)
  includesAll(html, [
    '<span class="cindy-demo-panel__label">DEMO INTERATIVA · DADOS FICTÍCIOS</span>',
    '<h2 id="cindy-demo-title">Gestão condominial com IA</h2>',
    '<iframe class="cindy-demo-panel__frame" src="/nova-cindy-mockup-v2.html" title="Demo interativa da plataforma de gestão condominial com IA"></iframe>',
    '<a href="/nova-cindy-mockup-v2.html" target="_blank" rel="noreferrer">Abrir em nova aba</a>',
  ])
})

test('demo Cindy: foco inicial em Fechar; Voltar e Fechar chamam seus handlers', () => {
  const html = demo(CindyDemoPanel)
  assert.equal(count(html, 'data-dialog-initial-focus'), 1)
  includesAll(html, [
    '<button type="button">Voltar ao projeto</button>',
    '<button type="button" class="cindy-demo-panel__close" data-dialog-initial-focus="true" autofocus="">Fechar</button>',
  ])
  const calls = []
  const root = CindyDemoPanel({ onBack: () => calls.push('voltar'), onClose: () => calls.push('fechar') })
  clickButton(root, 'Voltar ao projeto')
  clickButton(root, 'Fechar')
  assert.deepEqual(calls, ['voltar', 'fechar'])
})

test('demo PHX: dialog modal, título, rótulo e iframe da demo', () => {
  const html = demo(PhxDemoPanel)
  assert.ok(html.startsWith('<aside id="phx-demo" class="info-panel is-open phx-demo-panel" role="dialog" aria-modal="true" aria-hidden="false" aria-labelledby="phx-demo-title">'))
  assert.equal(count(html, 'id="phx-demo-title"'), 1)
  includesAll(html, [
    '<span class="phx-demo-panel__label">DEMO INTERATIVA</span>',
    '<h2 id="phx-demo-title">Gerador de laudo PHX / MDS</h2>',
    '<iframe class="phx-demo-panel__frame" src="/phx-demo.html" title="Demo interativa do gerador de laudo PHX e MDS Crédito Imobiliário"></iframe>',
    '<a class="phx-demo-panel__open" href="/phx-demo.html" target="_blank" rel="noreferrer">Abrir em nova aba</a>',
  ])
})

test('demo PHX: foco inicial em Fechar; Voltar e Fechar chamam seus handlers', () => {
  const html = demo(PhxDemoPanel)
  assert.equal(count(html, 'data-dialog-initial-focus'), 1)
  includesAll(html, [
    '<button type="button" class="phx-demo-panel__back">Voltar ao projeto</button>',
    '<button type="button" class="phx-demo-panel__close" data-dialog-initial-focus="true" autofocus="">Fechar</button>',
  ])
  const calls = []
  const root = PhxDemoPanel({ onBack: () => calls.push('voltar'), onClose: () => calls.push('fechar') })
  clickButton(root, 'Voltar ao projeto')
  clickButton(root, 'Fechar')
  assert.deepEqual(calls, ['voltar', 'fechar'])
})

test('demo Nexus: dialog modal nomeado pelo título do fluxo, com a copy do estado inicial', () => {
  const html = demo(NexusDemoPanel)
  assert.ok(html.startsWith('<aside id="nexus-demo" class="info-panel is-open nexus-demo-panel" role="dialog" aria-modal="true" aria-hidden="false" aria-labelledby="nexus-demo-title">'))
  // The section views reuse this id; only one may be rendered at a time.
  assert.equal(count(html, 'id="nexus-demo-title"'), 1)
  includesAll(html, [
    '<h2 id="nexus-demo-title">Análise documental inteligente</h2>',
    '<button type="button" class="nexus-demo-execute"> Executar fluxo</button>',
    '<strong>Eventos da execução</strong>',
    '<header><strong>Execução atual</strong><span>CONCLUÍDA</span></header>',
    '<div role="tablist" aria-label="Visualização do fluxo"><button type="button" role="tab" aria-selected="true" class="is-active">Pipeline</button>',
  ])
})

test('demo Nexus: selos e navegação lateral com os seis itens, Fluxos ativo', () => {
  const html = demo(NexusDemoPanel)
  includesAll(html, [
    '<span class="nexus-demo-local-badge">DEMO LOCAL · DADOS FICTÍCIOS</span>',
    '<span class="nexus-demo-topbar__badge">DEMO INTERATIVA</span>',
  ])
  const nav = html.match(/<nav class="nexus-demo-nav" aria-label="Navegação da plataforma Nexus AI">([\s\S]*?)<\/nav>/)
  assert.ok(nav, 'navegação com rótulo ausente')
  const groups = [...nav[1].matchAll(/<div class="nexus-demo-nav__group"><span>([A-Z]+)<\/span>([\s\S]*?)<\/div>/g)]
    .map(([, group, buttons]) => [group, [...buttons.matchAll(/<button type="button" class="(is-active)?"( aria-current="page")?> ([^<]+)<\/button>/g)].map(([, active, current, label]) => `${label}${active && current ? ' (ativo)' : ''}`)])
  assert.deepEqual(groups, [
    ['PRODUTO', ['Fluxos (ativo)', 'Base de conhecimento', 'Agentes', 'Observabilidade']],
    ['SISTEMA', ['Configurações', 'Documentação']],
  ])
  assert.equal(count(nav[1], 'aria-current="page"'), 1)
})

test('demo Nexus: foco inicial em Fechar demo e dois botões de voltar ao projeto', () => {
  const html = demo(NexusDemoPanel)
  assert.equal(count(html, 'data-dialog-initial-focus'), 1)
  includesAll(html, [
    '<button type="button" data-dialog-initial-focus="true" autofocus=""> Fechar demo</button>',
    '<button type="button"> Voltar ao projeto</button>',
    '<button type="button" class="nexus-demo-topbar__back"> Voltar ao projeto</button>',
  ])
})
