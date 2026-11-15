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

test('cards de projetos mantêm contrato de teclado', async () => {
  const source = await read('src/sections/StickyProjects.jsx')

  assert.match(source, /role="button"/)
  assert.match(source, /tabIndex=\{0\}/)
  assert.match(source, /event\.key !== 'Enter'/)
  assert.match(source, /event\.key !== ' '/)
  assert.match(source, /onOpenProject\(slug\)/)
  assert.match(source, /role="button"[\s\S]*tabIndex=\{0\}/)
})

test('Projetos seguem um percurso contínuo, em fluxo normal e adaptado para mobile', async () => {
  const source = await read('src/sections/StickyProjects.jsx')
  const css = await read('src/sections/StickyProjects.css')

  assert.match(source, /className="project-journey__intro"[\s\S]*<h2 id="projects-title">PROJETOS<\/h2>/)
  assert.match(source, /<h2 id="projects-title">PROJETOS<\/h2>[\s\S]*className="section-header__divider"[\s\S]*<FaCog \/>/)
  assert.match(source, /projects\.map\(\(\{ slug, numero, card \}, index\) =>/)
  assert.equal((source.match(/<svg /g) ?? []).length, 1)
  assert.equal((source.match(/<motion\.path /g) ?? []).length, 1)
  assert.match(source, /useMotionValue\(0\)/)
  assert.match(source, /style=\{\{ pathLength \}\}/)
  assert.match(source, /getPointAtLength/)
  assert.match(source, /pathLength\.set\(reduced \? 1/)
  assert.match(source, /card\.dataset\.reached/)
  assert.match(source, /route\.width \* \(index % 2 \? 0\.25 : 0\.75\)/)
  assert.match(source, /const divider = section\.querySelector\('\.project-journey__intro \.section-header__divider'\)\.getBoundingClientRect\(\)/)
  assert.match(source, /y: divider\.bottom - bounds\.top \+ 52/)
  assert.match(source, /path\.ownerSVGElement\.setAttribute\('viewBox'/)
  assert.doesNotMatch(css, /vector-effect: non-scaling-stroke/)
  assert.match(source, /ScrollTrigger\.create\(\{/)
  assert.match(source, /self\.progress/)
  assert.doesNotMatch(source, /invalidateOnRefresh/)
  assert.match(source, /ResizeObserver/)
  assert.match(source, /prefers-reduced-motion: reduce/)
  assert.doesNotMatch(source, /clipPath/)
  assert.match(css, /\.project-journey__intro\s*\{[^}]*min-height: 90svh;[^}]*align-content: start;/)
  assert.match(css, /\.project-journey__intro h2\s*\{[^}]*font-size: clamp\(2\.8rem, 7vw, 6rem\);/)
  assert.match(css, /\.project-journey__copy\s*\{[^}]*background: #efe5d6;[^}]*color: #071f2a;/)
  assert.match(css, /\.project-journey__summary\s*\{[^}]*font-weight: 700;/)
  assert.match(css, /\.project-journey__copy::before\s*\{[^}]*animation: project-card-wave-primary 8s ease-in-out infinite alternate;/)
  assert.match(css, /\.project-journey__copy::after\s*\{[^}]*animation: project-card-wave-secondary 11s ease-in-out infinite alternate;/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.project-journey__copy::before,[\s\S]*\.project-journey__copy::after\s*\{[^}]*animation: none;/)
  assert.match(css, /\.project-journey__line \.project-journey__line-progress\s*\{[^}]*stroke: #c2f84f;[^}]*stroke-width: 18;/)
  assert.match(css, /\.project-journey__step:nth-of-type\(even\)\s*\{[^}]*justify-content: flex-end;/)
  assert.match(source, /mobile: '\(max-width: 900px\)'/)
  assert.match(source, /const x = index % 2 \? leftRail : rightRail/)
  assert.match(source, /mobile \? mobileStops : stops\.map/)
  assert.doesNotMatch(css, /\.project-journey__step,\s*\.project-journey__step:nth-of-type\(even\)/)
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.project-journey__card\s*\{[^}]*width: calc\(100% - 4\.5rem\);/)
  assert.match(css, /\.project-journey__art img\s*\{[^}]*object-fit: contain;/)
})

test('entrada lateral dos cards acontece uma vez e respeita movimento reduzido', async () => {
  const source = await read('src/sections/StickyProjects.jsx')
  const css = await read('src/sections/StickyProjects.css')
  assert.match(source, /new IntersectionObserver/)
  assert.match(source, /if \(entry.isIntersecting\) reveal\(entry.target\)/)
  assert.match(source, /entranceObserver.unobserve\(card\)/)
  assert.match(source, /card.addEventListener\('focus', revealFocusedCard\)/)
  assert.match(source, /entranceObserver.disconnect\(\)/)
  assert.match(css, /--entry-offset: -40px/)
  assert.match(css, /nth-of-type\(even\) \.project-journey__card\s*\{\s*--entry-offset: 40px/)
  assert.match(css, /animation: project-card-enter 650ms/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.project-journey__card\[data-entrance\]\s*\{\s*animation: none;\s*opacity: 1;\s*translate: none;/)
})

test('cabeçalho rolado não desenha uma linha horizontal no mobile', async () => {
  const css = await read('src/App.css')

  assert.match(css, /\.site-header\.is-scrolled\s*\{[\s\S]*border-bottom-color:\s*transparent;/)
})

test('fallback de Projetos reserva as mesmas etapas em telas baixas', async () => {
  const css = await read('src/App.css')
  const journeyCss = await read('src/sections/StickyProjects.css')
  for (const [viewport, minimum] of [[80, 46], [82, 42]]) {
    assert.ok(css.includes(`height: calc(90svh + 4 * max(${viewport}svh, ${minimum}rem));`))
    assert.ok(journeyCss.includes(`min-height: max(${viewport}svh, ${minimum}rem);`))
  }
})

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

test('Serviços têm uma faixa visual de transição abaixo dos cards', async () => {
  const source = await read('src/sections/StickyServices.jsx')
  const css = await read('src/sections/StickyServices.css')

  assert.match(source, /className="services-transition"/)
  assert.match(source, /src="\/images\/services-transition\.png"/)
  assert.match(css, /\.services-transition\s*\{[\s\S]*height: clamp\(9rem, 20svh, 18rem\)/)
  assert.match(css, /\.services-transition img\s*\{[\s\S]*object-fit: cover;/)
})

// The project details are checked here; Sobre and Contato are checked on the rendered HTML in
// info-dialogs-render.test.mjs.
test('detalhes do projeto definem um foco inicial nativo', async () => {
  const projectDetails = await read('src/components/panels/ProjectDetailsPanel.jsx')

  assert.match(projectDetails, /data-dialog-initial-focus/)
  assert.match(projectDetails, /autoFocus/)
})

test('Footer mantém o link público do LinkedIn', async () => {
  const footer = await read('src/sections/WaveFooter.jsx')

  assert.match(footer, /https:\/\/www\.linkedin\.com\/in\/fabrycio-bermudes-b79a01216\//)
})

// The gallery wiring, themes, rendered thumbnails and copy of the project dialogs are checked in the
// layer-1 and layer-2 tests; only the active-thumbnail rule below stays here.
test('Projeto Cindy oferece demo local e galeria que marca a tela ativa', async () => {
  const app = await read('src/App.jsx')
  const gallery = await read('src/components/panels/ProjectGalleryPanel.jsx')
  const demoHtml = await read('public/nova-cindy-mockup-v2.html')

  assert.match(app, /import CindyDemoPanel from '@\/components\/panels\/CindyDemoPanel\.jsx'/)
  assert.match(app, /cindy: CindyDemoPanel/)
  // The static render only sees the first screen, where a value fixed to the first thumbnail looks
  // identical; following the active screen needs state, so this source guard stays.
  assert.match(gallery, /aria-pressed=\{index === activeIndex\}/)
  assert.match(demoHtml, /<title>Nova Cindy · Protótipo visual<\/title>/)
})

test('Projeto Nexus AI oferece uma demo interativa a partir do painel de detalhes', async () => {
  const app = await read('src/App.jsx')
  const details = await read('src/components/panels/ProjectDetailsPanel.jsx')

  assert.match(details, /onOpenDemo/)
  assert.match(app, /import NexusDemoPanel from '@\/components\/panels\/NexusDemoPanel\.jsx'/)
  assert.match(app, /nexus: NexusDemoPanel/)
})

test('Projeto PHX oferece a demo local do gerador de laudo', async () => {
  const app = await read('src/App.jsx')
  const projects = await read('src/data/projects.js')

  assert.match(app, /import PhxDemoPanel from '@\/components\/panels\/PhxDemoPanel\.jsx'/)
  assert.match(app, /phx: PhxDemoPanel/)
  assert.match(projects, /project-03\.webp/)
  assert.match(projects, /title: 'LAUDO DE CRÉDITO IMOBILIÁRIO'/)
})

test('trap de foco localiza a galeria aberta pela classe people-gallery', async () => {
  const app = await read('src/App.jsx')

  assert.match(app, /\.people-gallery\.is-open/)
})

test('previews de projetos destacam a galeria e preservam o corte das capturas', async () => {
  const css = await read('src/App.css')
  const journeyCss = await read('src/sections/StickyProjects.css')
  const galleryCss = await read('src/components/panels/ProjectGalleryPanel.css')
  const projectsData = await read('src/data/projects.js')
  const projectsComponent = await read('src/sections/StickyProjects.jsx')

  assert.match(css, /\.project-gallery-preview img\s*\{[\s\S]*aspect-ratio: 4 \/ 3;[\s\S]*object-fit: contain;/)
  assert.match(css, /\.project-gallery-preview__veil strong\s*\{[\s\S]*border-radius: 999px;[\s\S]*background: #78aebc;/)
  assert.match(journeyCss, /\.project-journey__action\s*\{[^}]*border-color: #071f2a;/)
  assert.match(journeyCss, /\.project-journey__action\s*\{[^}]*width: fit-content;[^}]*justify-self: start;/)
  assert.match(journeyCss, /\.project-journey__action \.hero__cta-key\s*\{\s*display: none;/)
  assert.match(journeyCss, /@media \(hover: hover\) and \(pointer: fine\) and \(min-width: 901px\)[\s\S]*\.project-journey__card:hover\s*\{[^}]*box-shadow:[\s\S]*transform: translateY\(-0\.65rem\);/)
  assert.match(projectsComponent, /className="hero__cta project-journey__action"[\s\S]*className="hero__cta-line"[\s\S]*className="hero__cta-text">VER PROJETO<\/span>[\s\S]*hero__cta-key--bottom-one/)
  assert.match(projectsData, /summary: 'Plataforma de recrutamento/)
  assert.match(galleryCss, /\.people-gallery__thumbnail img\s*\{[\s\S]*object-fit: contain;/)
})

test('quatro logos ocupam as etapas, sem substituir as telas dos painéis', async () => {
  const css = await read('src/sections/StickyProjects.css')
  const projectsComponent = await read('src/sections/StickyProjects.jsx')
  const projectsData = await read('src/data/projects.js')

  assert.match(css, /\.project-journey__card\s*\{[^}]*width: 43%;/)
  assert.match(projectsComponent, /src=\{card\.logo\}/)
  assert.match(projectsComponent, /alt=\{card\.logoAlt\}/)
  for (const logo of ['people', 'condominio', 'credito-imobiliario', 'nexus-ai']) {
    assert.match(projectsData, new RegExp(`logo: '/images/projects/logos/${logo}\\.webp'`))
    assert.equal((await readFile(resolve(root, `public/images/projects/logos/${logo}.webp`))).toString('ascii', 0, 4), 'RIFF')
  }
  assert.match(projectsData, /image: '\/images\/projects\/project-01\.webp'/)
  assert.match(projectsData, /image: '\/images\/projects\/project-02\.webp'/)
  assert.match(projectsComponent, /card\.summary/)
})

test('navegação lateral da demo Nexus troca a seção ativa', async () => {
  const demo = await read('src/components/panels/NexusDemoPanel.jsx')

  // The items, labels and badges are covered on the rendered HTML in demo-dialogs-render.test.mjs;
  // switching sections needs component state, so these source guards stay.
  assert.match(demo, /setActiveSection\(item\.id\)/)
  assert.match(demo, /activeSection === item\.id/)
})

test('demo Nexus mantém retorno ao projeto', async () => {
  const demo = await read('src/components/panels/NexusDemoPanel.jsx')

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
