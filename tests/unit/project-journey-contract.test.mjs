// Static contract of the Projetos section (src/sections/StickyProjects.* and its fallback). Source and
// CSS guards, because scroll, motion and layout are not observable in a static render.
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

test('fallback de Projetos reserva as mesmas etapas em telas baixas', async () => {
  const css = await read('src/App.css')
  const journeyCss = await read('src/sections/StickyProjects.css')
  for (const [viewport, minimum] of [[80, 46], [82, 42]]) {
    assert.ok(css.includes(`height: calc(90svh + 4 * max(${viewport}svh, ${minimum}rem));`))
    assert.ok(journeyCss.includes(`min-height: max(${viewport}svh, ${minimum}rem);`))
  }
})

test('card de projeto mantém a ação VER PROJETO, o destaque no hover e o resumo do People no registro', async () => {
  const journeyCss = await read('src/sections/StickyProjects.css')
  const projectsData = await read('src/data/projects.js')
  const projectsComponent = await read('src/sections/StickyProjects.jsx')

  assert.match(journeyCss, /\.project-journey__action\s*\{[^}]*border-color: #071f2a;/)
  assert.match(journeyCss, /\.project-journey__action\s*\{[^}]*width: fit-content;[^}]*justify-self: start;/)
  assert.match(journeyCss, /\.project-journey__action \.hero__cta-key\s*\{\s*display: none;/)
  assert.match(journeyCss, /@media \(hover: hover\) and \(pointer: fine\) and \(min-width: 901px\)[\s\S]*\.project-journey__card:hover\s*\{[^}]*box-shadow:[\s\S]*transform: translateY\(-0\.65rem\);/)
  assert.match(projectsComponent, /className="hero__cta project-journey__action"[\s\S]*className="hero__cta-line"[\s\S]*className="hero__cta-text">VER PROJETO<\/span>[\s\S]*hero__cta-key--bottom-one/)
  assert.match(projectsData, /summary: 'Plataforma de recrutamento/)
})

test('quatro logos ocupam as etapas e o card usa logo, alt e resumo do registro', async () => {
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
  assert.match(projectsComponent, /card\.summary/)
})
