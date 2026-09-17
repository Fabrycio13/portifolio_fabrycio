import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { test } from 'node:test'

const root = resolve(import.meta.dirname, '..')

const read = relativePath => readFile(resolve(root, relativePath), 'utf8')

test('cards de projetos mantêm contrato de teclado', async () => {
  const source = await read('src/components/StickyProjects.jsx')

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
  assert.match(source, /import InfoPanels from '\.\/components\/InfoPanels\.jsx'/)
  assert.match(source, /import ProjectDetailsPanel from '\.\/components\/ProjectDetailsPanel\.jsx'/)
  assert.match(source, /className="hero__cta" href="#servicos"/)
  assert.match(source, /className="hero__cta hero__cta--contact"/)
  assert.match(source, /onClick=\{\(\) => openPanel\('contato'\)\}/)
})

test('dialogs definem um foco inicial nativo', async () => {
  const infoPanels = await read('src/components/InfoPanels.jsx')
  const projectDetails = await read('src/components/ProjectDetailsPanel.jsx')

  assert.equal((infoPanels.match(/data-dialog-initial-focus/g) ?? []).length, 2)
  assert.match(projectDetails, /data-dialog-initial-focus/)
  assert.match(infoPanels, /autoFocus/)
  assert.match(projectDetails, /autoFocus/)
})

test('Contato mantém a copy aprovada e os cinco canais', async () => {
  const source = await read('src/components/InfoPanels.jsx')

  assert.match(source, /VAMOS CONSTRUIR ALGO QUE FUNCIONE\./)
  assert.match(source, /Tem uma ideia para tirar do papel/)
  assert.match(source, /Escolha um canal abaixo e vamos conversar\./)
  assert.equal((source.match(/label: '/g) ?? []).length, 5)
})

test('Sobre mantém a copy aprovada e CTA para Contato', async () => {
  const source = await read('src/components/InfoPanels.jsx')

  assert.match(source, /Muito prazer!/)
  assert.match(source, /produtos digitais, sistemas web e automações inteligentes/)
  assert.match(source, /Acredito que a boa engenharia aparece/)
  assert.match(source, /Minha stack/)
  assert.match(source, /prompts estruturados e fluxos inteligentes/)
  assert.match(source, /CONVERSAR SOBRE UM PROJETO/)
  assert.match(source, /onClick=\{onOpenContact\}/)
})

test('Projeto 02 mantém a copy confidencial de Gestão Condominial com IA', async () => {
  const app = await read('src/App.jsx')
  const details = await read('src/components/ProjectDetailsPanel.jsx')

  assert.match(app, /GESTÃO CONDOMINIAL COM IA/)
  assert.match(app, /PROJETO CONFIDENCIAL · PLATAFORMA WEB/)
  assert.match(details, /Uma plataforma web criada para centralizar a administração de condomínios/)
  assert.match(details, /A solução também utiliza IA e integrações automatizadas/)
  assert.match(details, /Gestão de moradores e unidades/)
  assert.match(details, /Gestão de espaços compartilhados/)
  assert.match(details, /IA & Integrações/)
})

test('CSS e sonda não reintroduzem o fluxo legado de vídeo', async () => {
  const css = await read('src/App.css')
  const auditScript = await read('scripts/perf-audit.mjs')

  assert.doesNotMatch(css, /shader-video/i)
  assert.match(css, /-webkit-tap-highlight-color:\s*transparent/)
  assert.doesNotMatch(auditScript, /video\.mp4|ShaderVideo|qualityProfile/i)
  assert.match(auditScript, /Input\.dispatchMouseEvent/)
  assert.match(auditScript, /--footer/)
  assert.match(auditScript, /--projects/)
})
