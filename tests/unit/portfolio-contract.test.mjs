import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { test } from 'node:test'

const root = resolve(import.meta.dirname, '../..')

const read = relativePath => readFile(resolve(root, relativePath), 'utf8')

test('cards de projetos mantêm contrato de teclado', async () => {
  const source = await read('src/sections/StickyProjects.jsx')

  assert.match(source, /role="button"/)
  assert.match(source, /tabIndex=\{0\}/)
  assert.match(source, /event\.key !== 'Enter'/)
  assert.match(source, /event\.key !== ' '/)
  assert.match(source, /onOpenProject\(project\.number\)/)
})

test('PortfolioContent mantém gerenciamento de foco e Escape nos dialogs', async () => {
  const source = await read('src/App.jsx')

  assert.match(source, /lastTriggerRef/)
  assert.match(source, /event\.key === 'Escape'/)
  assert.match(source, /event\.key !== 'Tab'/)
  assert.match(source, /const firstElement = focusableElements\[0\]/)
  assert.match(source, /firstElement\.focus\(\)/)
  assert.match(source, /lastTriggerRef\.current\?\.focus\(\)/)
  assert.match(source, /import InfoPanels from '@\/components\/panels\/InfoPanels\.jsx'/)
  assert.match(source, /import ProjectDetailsPanel from '@\/components\/panels\/ProjectDetailsPanel\.jsx'/)
  assert.match(source, /className="hero__cta" href="#servicos"/)
  assert.match(source, /className="hero__cta hero__cta--contact"/)
  assert.match(source, /onClick=\{\(\) => openPanel\('contato'\)\}/)
})

test('dialogs definem um foco inicial nativo', async () => {
  const infoPanels = await read('src/components/panels/InfoPanels.jsx')
  const projectDetails = await read('src/components/panels/ProjectDetailsPanel.jsx')

  assert.equal((infoPanels.match(/data-dialog-initial-focus/g) ?? []).length, 2)
  assert.match(projectDetails, /data-dialog-initial-focus/)
  assert.match(infoPanels, /autoFocus/)
  assert.match(projectDetails, /autoFocus/)
})

test('Contato mantém a copy aprovada e os cinco canais', async () => {
  const source = await read('src/components/panels/InfoPanels.jsx')
  const footer = await read('src/sections/WaveFooter.jsx')

  assert.match(source, /VAMOS CONSTRUIR ALGO QUE FUNCIONE\./)
  assert.match(source, /Tem uma ideia para tirar do papel/)
  assert.match(source, /Escolha um canal abaixo e vamos conversar\./)
  assert.equal((source.match(/label: '/g) ?? []).length, 5)
  assert.match(source, /https:\/\/www\.linkedin\.com\/in\/fabrycio-bermudes-b79a01216\//)
  assert.match(footer, /https:\/\/www\.linkedin\.com\/in\/fabrycio-bermudes-b79a01216\//)
})

test('Sobre mantém a copy aprovada e CTA para Contato', async () => {
  const source = await read('src/components/panels/InfoPanels.jsx')

  assert.match(source, /Muito prazer!/)
  assert.match(source, /produtos digitais, sistemas web e automações inteligentes/)
  assert.match(source, /Acredito que a boa engenharia aparece/)
  assert.match(source, /Minha stack/)
  assert.match(source, /prompts estruturados e fluxos inteligentes/)
  assert.match(source, /CONVERSAR SOBRE UM PROJETO/)
  assert.match(source, /onClick=\{onOpenContact\}/)
})

test('Projeto 02 mantém a copy confidencial de Gestão Condominial com IA', async () => {
  const projects = await read('src/data/projects.js')
  const details = await read('src/components/panels/ProjectDetailsPanel.jsx')

  assert.match(projects, /GESTÃO CONDOMINIAL COM IA/)
  assert.match(projects, /PROJETO CONFIDENCIAL · PLATAFORMA WEB/)
  assert.match(details, /Uma plataforma web criada para centralizar a administração de condomínios/)
  assert.match(details, /A solução também utiliza IA e integrações automatizadas/)
  assert.match(details, /Gestão de moradores e unidades/)
  assert.match(details, /Gestão de espaços compartilhados/)
  assert.match(details, /IA & Integrações/)
})

test('Projeto Nexus AI oferece uma demo interativa a partir do painel de detalhes', async () => {
  const app = await read('src/App.jsx')
  const details = await read('src/components/panels/ProjectDetailsPanel.jsx')
  const demo = await read('src/components/panels/NexusDemoPanel.jsx')

  assert.match(details, /projectNumber === '04'/)
  assert.match(details, /TESTAR DEMO INTERATIVA/)
  assert.match(details, /onOpenDemo/)
  assert.match(app, /import NexusDemoPanel from '@\/components\/panels\/NexusDemoPanel\.jsx'/)
  assert.match(app, /activePanel === 'nexus-demo'/)
  assert.match(demo, /DEMO LOCAL · DADOS FICTÍCIOS/)
  assert.match(demo, /Análise documental inteligente/)
  assert.match(demo, /Executar fluxo/)
  assert.match(demo, /Eventos da execução/)
  assert.match(demo, /Execução atual/)
  assert.match(demo, /data-dialog-initial-focus/)
})

test('Projeto Nexus AI abre uma galeria coerente com a demo interativa', async () => {
  const app = await read('src/App.jsx')
  const details = await read('src/components/panels/ProjectDetailsPanel.jsx')

  assert.match(details, /4 TELAS DO PRODUTO/)
  assert.match(details, /onOpenGallery\('nexus'\)/)
  assert.match(app, /import NexusGalleryPanel from '@\/components\/panels\/NexusGalleryPanel\.jsx'/)
  assert.match(app, /activePanel === 'nexus-gallery'/)
})

test('Projeto PHX oferece a demo local do gerador de laudo', async () => {
  const app = await read('src/App.jsx')
  const details = await read('src/components/panels/ProjectDetailsPanel.jsx')
  const demo = await read('src/components/panels/PhxDemoPanel.jsx')
  const projects = await read('src/data/projects.js')

  assert.match(details, /projectNumber === '03'/)
  assert.match(details, /ABRIR DEMO DO LAUDO/)
  assert.match(app, /import PhxDemoPanel from '@\/components\/panels\/PhxDemoPanel\.jsx'/)
  assert.match(app, /activePanel === 'phx-demo'/)
  assert.match(demo, /src="\/phx-demo\.html"/)
  assert.match(demo, /DEMO INTERATIVA/)
  assert.match(projects, /project-03\.webp/)
})

test('Projeto PHX abre uma galeria com as telas do laudo', async () => {
  const app = await read('src/App.jsx')
  const details = await read('src/components/panels/ProjectDetailsPanel.jsx')

  assert.match(details, /3 TELAS DO PRODUTO/)
  assert.match(details, /onOpenGallery\('phx'\)/)
  assert.match(app, /import PhxGalleryPanel from '@\/components\/panels\/PhxGalleryPanel\.jsx'/)
  assert.match(app, /activePanel === 'phx-gallery'/)
})

test('Projeto People abre uma galeria de telas sanitizadas a partir dos detalhes', async () => {
  const app = await read('src/App.jsx')
  const details = await read('src/components/panels/ProjectDetailsPanel.jsx')
  const gallery = await read('src/components/panels/PeopleGalleryPanel.jsx')

  assert.match(details, /projectNumber === '01'/)
  assert.match(details, /VER TELAS DO PROJETO/)
  assert.match(details, /onOpenGallery/)
  assert.match(app, /import PeopleGalleryPanel from '@\/components\/panels\/PeopleGalleryPanel\.jsx'/)
  assert.match(app, /activePanel === 'people-gallery'/)
  assert.match(app, /\.people-gallery\.is-open/)
  assert.match(gallery, /people-dashboard\.webp/)
  assert.match(gallery, /people-configuracoes\.webp/)
  assert.match(gallery, /DADOS FICTÍCIOS/)
  assert.match(gallery, /aria-pressed=\{index === activeIndex\}/)
})

test('navegação lateral da demo Nexus troca a seção ativa', async () => {
  const demo = await read('src/components/panels/NexusDemoPanel.jsx')

  assert.match(demo, /const navigationItems =/)
  assert.match(demo, /setActiveSection\(item\.id\)/)
  assert.match(demo, /activeSection === item\.id/)
  assert.match(demo, /Base de conhecimento/)
  assert.match(demo, /Documentação/)
})

test('demo Nexus mantém retorno ao projeto e identificação no topo', async () => {
  const demo = await read('src/components/panels/NexusDemoPanel.jsx')

  assert.match(demo, /nexus-demo-topbar__back/)
  assert.match(demo, /nexus-demo-topbar__badge/)
  assert.match(demo, /DEMO INTERATIVA/)
  assert.match(demo, /onClick=\{onBack\}/)
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
