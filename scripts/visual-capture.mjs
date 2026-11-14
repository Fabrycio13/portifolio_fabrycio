#!/usr/bin/env node
// Captures the Spec 0001 visual matrix (17 scenes × 3 viewports) with prefers-reduced-motion emulated.
// Usage: node scripts/visual-capture.mjs <preview-url> --out=<dir outside the repo> [--port=9241]
// Artifacts (PNGs + manifest.json) must stay outside the repository (Spec 0001 §7.3).
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { launchChrome, wait } from './cdp.mjs'
import { describeEnvironment } from './run-environment.mjs'

const args = process.argv.slice(2)
const option = name => args.find(arg => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
const baseUrl = args.find(arg => !arg.startsWith('--'))
const outDir = option('out')
if (!baseUrl || !outDir) {
  console.error('Uso: node scripts/visual-capture.mjs <preview-url> --out=<dir> [--port=9241]')
  process.exit(1)
}

const viewports = [
  { id: 'desktop-1x', width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
  { id: 'desktop-2x', width: 1280, height: 800, deviceScaleFactor: 2, mobile: false },
  { id: 'mobile-3x', width: 390, height: 844, deviceScaleFactor: 3, mobile: true },
]

const projects = ['people', 'cindy', 'phx', 'nexus']
const projectsWithDemo = ['cindy', 'phx', 'nexus']

// Each step runs inside the page. Card order on the page is people, cindy, phx, nexus.
const scenes = [
  { id: '01-hero', steps: [] },
  { id: '02-servicos', steps: [{ scrollTo: '#servicos', mounted: '.services:not(.services--loading)' }] },
  { id: '03-projetos', steps: [{ scrollTo: '#projetos', mounted: '.projects:not(.projects--loading)' }] },
  { id: '04-footer', steps: [{ scrollTo: 'bottom', mounted: '.wave-footer:not(.wave-footer--loading)' }] },
  ...projects.map((project, index) => ({
    id: `${String(5 + index).padStart(2, '0')}-detalhes-${project}`,
    steps: [{ scrollTo: '#projetos', mounted: '.projects:not(.projects--loading)' }, { clickCard: index }],
  })),
  ...projects.map((project, index) => ({
    id: `${String(9 + index).padStart(2, '0')}-galeria-${project}`,
    steps: [
      { scrollTo: '#projetos', mounted: '.projects:not(.projects--loading)' },
      { clickCard: index },
      { click: '[role="dialog"] .project-gallery-preview' },
    ],
  })),
  { id: '13-sobre', steps: [{ menu: 'Sobre' }] },
  { id: '14-contato', steps: [{ menu: 'Contato' }] },
  ...projectsWithDemo.map((project, index) => ({
    id: `${15 + index}-demo-${project}`,
    steps: [
      { scrollTo: '#projetos', mounted: '.projects:not(.projects--loading)' },
      { clickCard: projects.indexOf(project) },
      { click: '[role="dialog"] .project-demo-cta' },
    ],
  })),
]

// Runs in the page: waits for fonts, images, same-origin iframes and two frames, then a fixed settle delay.
const settle = settleMs => `(async () => {
  const frame = () => new Promise(r => requestAnimationFrame(() => r()))
  const deadline = Date.now() + 15000
  // Only images intersecting the viewport matter for the screenshot; lazy images below the fold never load.
  const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth }
  let pending = []
  await document.fonts.ready
  while (Date.now() < deadline) {
    const images = [...document.images].filter(visible).filter(img => !img.complete)
    const frames = [...document.querySelectorAll('iframe')].filter(f => { try { return f.contentDocument?.readyState !== 'complete' } catch { return false } })
    pending = [...images.map(img => img.currentSrc || img.src), ...frames.map(f => 'iframe:' + f.src)]
    if (!pending.length) break
    await new Promise(r => setTimeout(r, 100))
  }
  for (const f of document.querySelectorAll('iframe')) { try { await f.contentDocument.fonts.ready } catch {} }
  // Force a full decode of visible images so the screenshot never catches a partially scaled decode.
  await Promise.all([...document.images].filter(visible).map(img => img.decode().catch(() => {})))
  await frame(); await frame()
  await new Promise(r => setTimeout(r, ${settleMs}))
  return { scrollY: window.scrollY, dialogs: document.querySelectorAll('[role="dialog"]').length, settleTimedOut: pending }
})()`

const waitFor = (selector, timeoutMs = 15000) => `(async () => {
  const deadline = Date.now() + ${timeoutMs}
  while (Date.now() < deadline) {
    if (document.querySelector(${JSON.stringify(selector)})) return true
    await new Promise(r => setTimeout(r, 100))
  }
  throw new Error('Timeout aguardando ' + ${JSON.stringify(selector)})
})()`

const scrollExpression = target => `(() => {
  const top = ${JSON.stringify(target)} === 'bottom'
    ? document.documentElement.scrollHeight
    : document.querySelector(${JSON.stringify(target)}).getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top, behavior: 'instant' })
  return window.scrollY
})()`

const runStep = async (page, step) => {
  if (step.scrollTo) {
    // Scroll once to trigger the proximity loading, wait for the section, then scroll again
    // because the mounted section (and ScrollTrigger pin spacers) can change the document height.
    await page.evaluate(scrollExpression(step.scrollTo))
    await page.evaluate(waitFor(step.mounted))
    await page.evaluate(settle(600))
    await page.evaluate(scrollExpression(step.scrollTo))
    await page.evaluate(settle(600))
    await page.evaluate(scrollExpression(step.scrollTo))
  }
  if (step.clickCard !== undefined) {
    await page.evaluate(`document.querySelectorAll('.project-journey__card')[${step.clickCard}].click()`)
    await page.evaluate(waitFor('[role="dialog"]'))
  } else if (step.click) {
    await page.evaluate(waitFor(step.click))
    await page.evaluate(`document.querySelector(${JSON.stringify(step.click)}).click()`)
    await wait(150)
    await page.evaluate(waitFor('[role="dialog"]'))
  }
  if (step.menu) {
    await page.evaluate(`[...document.querySelectorAll('a.menu-link')].find(a => a.textContent.includes(${JSON.stringify(step.menu)})).click()`)
    await page.evaluate(waitFor('[role="dialog"]'))
  }
}

// Optional filters for targeted re-captures, e.g. --scenes=01-hero,13-sobre --viewports=desktop-2x
const sceneFilter = option('scenes')?.split(',')
const viewportFilter = option('viewports')?.split(',')
// Rendering flags chosen to make repeated captures of the same build deterministic; they apply
// equally to baseline and candidate, so they do not bias the comparison.
const chromeFlags = option('chrome-flags')?.split(',').filter(Boolean) ?? []

const run = async () => {
  const absoluteOut = resolve(outDir)
  const page = await launchChrome({ port: Number(option('port') ?? 9241), extraArgs: chromeFlags })
  const captures = []
  try {
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
    for (const viewport of viewports.filter(v => !viewportFilter || viewportFilter.includes(v.id))) {
      mkdirSync(join(absoluteOut, viewport.id), { recursive: true })
      await page.send('Emulation.setDeviceMetricsOverride', {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: viewport.deviceScaleFactor,
        mobile: viewport.mobile,
      })
      await page.send('Emulation.setTouchEmulationEnabled', viewport.mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false })
      for (const scene of scenes.filter(s => !sceneFilter || sceneFilter.includes(s.id))) {
        const issuesBefore = page.runtimeIssues.length
        const loaded = page.waitForEvent('Page.loadEventFired')
        await page.send('Page.navigate', { url: baseUrl })
        await loaded
        await page.evaluate(settle(2500))
        for (const step of scene.steps) await runStep(page, step)
        const state = await page.evaluate(settle(1500))
        const shot = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
        const file = join(viewport.id, `${scene.id}.png`)
        writeFileSync(join(absoluteOut, file), Buffer.from(shot.data, 'base64'))
        captures.push({ viewport: viewport.id, scene: scene.id, file, ...state, runtimeIssues: page.runtimeIssues.slice(issuesBefore) })
        console.log(`${viewport.id} ${scene.id} scrollY=${state.scrollY} dialogs=${state.dialogs}${state.settleTimedOut.length ? ` TIMEOUT:${state.settleTimedOut.join(',')}` : ''}`)
      }
    }
  } finally {
    page.close()
  }

  const manifest = {
    kind: 'visual-capture',
    ...describeEnvironment({ browser: page.browser, url: baseUrl, command: `node scripts/visual-capture.mjs ${args.join(' ')}` }),
    reducedMotion: 'reduce',
    chromeFlags,
    viewports,
    scenes: scenes.map(scene => scene.id),
    captures,
  }
  writeFileSync(join(absoluteOut, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`${captures.length} capturas em ${absoluteOut}`)
}

run().catch(error => {
  console.error(error.stack ?? error.message)
  process.exitCode = 1
})
