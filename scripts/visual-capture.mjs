#!/usr/bin/env node
// Captures the Spec 0001 visual matrix (17 scenes × 3 viewports) with prefers-reduced-motion emulated.
// Usage: node scripts/visual-capture.mjs <preview-url> --out=<dir outside the repo> [--port=9241]
// Artifacts (PNGs + manifest.json) must stay outside the repository (Spec 0001 §7.3).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
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

// Scenes whose only time-varying content is the WarpText idle lens (it keeps moving even with
// reduced motion) are captured with a frozen page clock: performance.now() and rAF timestamps
// return a fixed instant, so the lens converges to the same position on every capture. Only these
// scenes use it: a global freeze stops the `motion` animations (e.g. BlurText) used elsewhere.
const FROZEN_CLOCK_MS = 1000
// Frames keep running while the clock is frozen; 12 s lets the lens damping converge completely.
const FROZEN_CLOCK_SETTLE_MS = 12000
const DEFAULT_SETTLE_MS = 1500
const frozenClockSource = `(() => {
  const FIXED = ${FROZEN_CLOCK_MS}
  const realRaf = window.requestAnimationFrame.bind(window)
  Object.defineProperty(performance, 'now', { value: () => FIXED, configurable: true })
  window.requestAnimationFrame = callback => realRaf(() => callback(FIXED))
})()`

// Each step runs inside the page. Card order on the page is people, cindy, phx, nexus.
const scenes = [
  { id: '01-hero', clock: 'frozen', steps: [] },
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
  { id: '13-sobre', clock: 'frozen', steps: [{ menu: 'Sobre' }] },
  { id: '14-contato', clock: 'frozen', steps: [{ menu: 'Contato' }] },
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
  // Wait for finite running animations (e.g. BlurText letter reveals, which ignore reduced motion)
  // to finish; otherwise a cold load can capture glyphs mid-animation. Infinite ones never block.
  const finite = () => document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.getTiming().iterations !== Infinity)
  const animationDeadline = Date.now() + 10000
  while (finite().length && Date.now() < animationDeadline) {
    await Promise.race([Promise.all(finite().map(a => a.finished.catch(() => {}))), new Promise(r => setTimeout(r, 1000))])
  }
  if (finite().length) pending.push('animacoes:' + finite().length)
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
// Rendering flags that make repeated captures of the same build deterministic (Spec 0001 §7.1
// calibration): CPU rasterization on a single thread without partial raster (parallel tiles made
// the gallery thumbnails vary), fixed sRGB colour profile and grayscale text antialiasing (LCD
// antialiasing alternated between runs). They apply equally to baseline and candidate.
const DETERMINISTIC_FLAGS = [
  '--disable-gpu-rasterization',
  '--force-color-profile=srgb',
  '--disable-lcd-text',
  '--num-raster-threads=1',
  '--disable-partial-raster',
]
const extraFlags = option('chrome-flags')?.split(',').filter(Boolean) ?? []
const chromeFlags = [...new Set([...DETERMINISTIC_FLAGS, ...extraFlags])]
// Sensitivity testing only: inject a stylesheet with a deliberate, subtle change after each page
// load, to prove the comparison still detects real regressions. Never used for baseline captures.
const injectCssFile = option('inject-css')
const injectCss = injectCssFile ? readFileSync(injectCssFile, 'utf8') : null

const run = async () => {
  const absoluteOut = resolve(outDir)
  const page = await launchChrome({ port: Number(option('port') ?? 9241), extraArgs: chromeFlags })
  const captures = []
  let servedAssets = null
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
        const frozenClock = scene.clock === 'frozen'
        const clockScript = frozenClock
          ? await page.send('Page.addScriptToEvaluateOnNewDocument', { source: frozenClockSource })
          : null
        const loaded = page.waitForEvent('Page.loadEventFired')
        await page.send('Page.navigate', { url: baseUrl })
        await loaded
        // The clock script only applies to documents created while it is registered.
        if (clockScript) await page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: clockScript.identifier })
        if (injectCss) {
          await page.evaluate(`(() => { const s = document.createElement('style'); s.dataset.sensitivity = ''; s.textContent = ${JSON.stringify(injectCss)}; document.head.append(s); return true })()`)
        }
        await page.evaluate(settle(2500))
        for (const step of scene.steps) await runStep(page, step)
        // Identity of the build actually served (hashed asset names), independent of the Git
        // checkout this script runs from: the captured app can be a different commit.
        servedAssets ??= await page.evaluate(`[...document.querySelectorAll('script[src], link[rel="stylesheet"][href]')].map(el => new URL(el.src || el.href).pathname)`)
        const settleMs = frozenClock ? FROZEN_CLOCK_SETTLE_MS : DEFAULT_SETTLE_MS
        const state = await page.evaluate(settle(settleMs))
        const shot = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
        const file = join(viewport.id, `${scene.id}.png`)
        writeFileSync(join(absoluteOut, file), Buffer.from(shot.data, 'base64'))
        captures.push({
          viewport: viewport.id,
          scene: scene.id,
          file,
          clock: frozenClock ? 'frozen' : 'real',
          settleMs,
          ...state,
          runtimeIssues: page.runtimeIssues.slice(issuesBefore),
        })
        console.log(`${viewport.id} ${scene.id} scrollY=${state.scrollY} dialogs=${state.dialogs}${state.settleTimedOut.length ? ` TIMEOUT:${state.settleTimedOut.join(',')}` : ''}`)
      }
    }
  } finally {
    page.close()
  }

  const manifest = {
    kind: 'visual-capture',
    ...describeEnvironment({ browser: page.browser, url: baseUrl, command: `node scripts/visual-capture.mjs ${args.join(' ')}` }),
    // `commit`/`appSourceTrees` describe the checkout running this script; the captured app is
    // identified by `servedAssets` and, when declared, by `--source-commit`.
    sourceCommit: option('source-commit') ?? null,
    servedAssets,
    reducedMotion: 'reduce',
    chromeFlags,
    deterministicFlags: DETERMINISTIC_FLAGS,
    clockPolicy: {
      frozenScenes: scenes.filter(scene => scene.clock === 'frozen').map(scene => scene.id),
      frozenClockMs: FROZEN_CLOCK_MS,
      frozenSettleMs: FROZEN_CLOCK_SETTLE_MS,
      defaultSettleMs: DEFAULT_SETTLE_MS,
      frozenSources: ['performance.now()', 'requestAnimationFrame timestamp'],
    },
    injectedCss: injectCss ? { file: injectCssFile, content: injectCss } : null,
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
