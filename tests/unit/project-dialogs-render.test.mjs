// Layer 2 (Spec 0001 §3): approved public copy of the project dialogs, asserted on the rendered
// HTML instead of on where the text is stored. Replaces source-text assertions that broke when
// the data moved to the registry (see tests/unit/RASTREABILIDADE.md).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadModule, render } from './vite-ssr.mjs'

const { default: ProjectDetailsPanel } = await loadModule('/src/components/panels/ProjectDetailsPanel.jsx')
const galleries = {
  people: (await loadModule('/src/components/panels/PeopleGalleryPanel.jsx')).default,
  cindy: (await loadModule('/src/components/panels/CindyGalleryPanel.jsx')).default,
}
const noop = () => {}
const details = slug => render(ProjectDetailsPanel, { slug, onClose: noop, onOpenDemo: noop, onOpenGallery: noop })
const gallery = slug => render(galleries[slug], { onBack: noop, onClose: noop })
const includesAll = (html, texts) => { for (const text of texts) assert.ok(html.includes(text), `ausente: ${text}`) }

test('detalhes do People: subtítulo, prévia com 7 telas e sem demo', () => {
  const html = details('people')
  includesAll(html, ['GERENCIADOR DE RECURSOS HUMANOS', '7 TELAS DO PRODUTO', 'VER TELAS DO PROJETO', 'src="/images/projects/people/people-dashboard.webp"'])
  assert.ok(!html.includes('project-demo-cta'))
})

test('detalhes da Gestão Condominial: copy confidencial aprovada, 6 telas da demo e demo da Cindy', () => {
  includesAll(details('cindy'), [
    'GESTÃO CONDOMINIAL COM IA',
    'ADMINISTRAÇÃO DE CONDOMÍNIOS',
    'Uma plataforma web criada para centralizar a administração de condomínios',
    'A solução também utiliza IA e integrações automatizadas',
    'Gestão de moradores e unidades',
    'Gestão de espaços compartilhados',
    'IA & Integrações',
    '6 TELAS DA DEMO',
    'ABRIR DEMO DA CINDY',
    'src="/images/projects/cindy/dashboard.webp"',
  ])
})

test('detalhes do PHX: título, 3 telas e demo do laudo', () => {
  includesAll(details('phx'), ['LAUDO DE CRÉDITO IMOBILIÁRIO', '3 TELAS DO PRODUTO', 'ABRIR DEMO DO LAUDO'])
})

test('detalhes do Nexus AI: 4 telas e demo interativa', () => {
  includesAll(details('nexus'), ['4 TELAS DO PRODUTO', 'TESTAR DEMO INTERATIVA'])
})

test('galeria do People mostra as telas sanitizadas e o selo de dados fictícios', () => {
  includesAll(gallery('people'), ['people-dashboard.webp', 'people-configuracoes.webp', 'DADOS FICTÍCIOS'])
})

test('projeto inexistente não renderiza e é diagnosticado em desenvolvimento (D1.3)', () => {
  // The Vite dev server used here sets import.meta.env.DEV; production keeps only the null guard.
  const original = console.error
  const calls = []
  console.error = (...args) => calls.push(args)
  try {
    assert.equal(render(ProjectDetailsPanel, { slug: 'inexistente', onClose: noop, onOpenDemo: noop, onOpenGallery: noop }), '')
  } finally {
    console.error = original
  }
  assert.equal(calls.length, 1)
  assert.match(String(calls[0][0]), /projeto inexistente/i)
  assert.ok(calls[0].includes('inexistente'))
})

test('galeria da Cindy mostra as capturas da própria demo', () => {
  includesAll(gallery('cindy'), ['dashboard.webp', 'residents.webp', 'packages.webp', 'occurrences.webp'])
})
