#!/usr/bin/env node
// Calibrates the visual tolerance from N independent captures of the SAME build (Spec 0001 §7.1).
// Usage: node scripts/visual-calibrate.mjs <run1> <run2> ... --out=<dir outside the repo>
//
// For every capture, all runs are compared pixel by pixel. A pixel is noise when its colour varies
// across runs; its limit is the largest channel difference observed AT THAT PIXEL. The output is a
// version-2 tolerance: a per-capture limit map (PNG, grey value = limit, 0 = no noise) plus summary
// statistics. visual-compare then accepts a candidate only if every differing pixel stays within its
// own measured limit. Nothing is masked by hand: the map is exactly the measured noise.
import { createServer } from 'node:http'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { launchChrome } from './cdp.mjs'
import { describeEnvironment } from './run-environment.mjs'

const args = process.argv.slice(2)
const option = name => args.find(arg => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
const runs = args.filter(arg => !arg.startsWith('--')).map(dir => resolve(dir))
const outDir = option('out') && resolve(option('out'))
if (runs.length < 2 || !outDir) {
  console.error('Uso: node scripts/visual-calibrate.mjs <run1> <run2> [...] --out=<dir>')
  process.exit(1)
}

const manifests = runs.map(dir => JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')))
const keyOf = capture => `${capture.viewport}/${capture.scene}`
const captures = manifests[0].captures.filter(capture => manifests.every(m => m.captures.some(c => keyOf(c) === keyOf(capture))))

const server = createServer((request, response) => {
  const [, index, ...rest] = decodeURIComponent(request.url).split('/')
  if (!index) {
    response.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><title>calibrate</title>')
    return
  }
  let body
  try {
    body = readFileSync(join(runs[Number(index)], ...rest))
  } catch {
    response.writeHead(404).end()
    return
  }
  response.writeHead(200, { 'content-type': 'image/png' }).end(body)
})
await new Promise(done => server.listen(0, '127.0.0.1', done))

// Runs in the page: per-pixel range across all runs, pairwise statistics and the noise mask PNG.
const calibrateExpression = (file, count) => `(async () => {
  const load = src => new Promise((ok, fail) => { const img = new Image(); img.onload = () => ok(img); img.onerror = () => fail(new Error('falha ao carregar ' + src)); img.src = src })
  const images = await Promise.all(Array.from({ length: ${count} }, (_, i) => load('/' + i + '/${file}')))
  const { width, height } = images[0]
  if (images.some(img => img.width !== width || img.height !== height)) return { sizeMismatch: true }
  const data = images.map(img => { const c = new OffscreenCanvas(width, height); const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, width, height).data })
  const mask = new ImageData(width, height)
  let noisePixels = 0, maxDelta = 0, minX = Infinity, minY = Infinity, maxX = -1, maxY = -1
  const pairs = []
  for (let a = 0; a < ${count}; a++) for (let b = a + 1; b < ${count}; b++) pairs.push({ a, b, diffPixels: 0, maxDelta: 0 })
  for (let i = 0; i < data[0].length; i += 4) {
    let pixelDelta = 0
    for (let ch = 0; ch < 4; ch++) {
      let lo = 255, hi = 0
      for (const d of data) { const v = d[i + ch]; if (v < lo) lo = v; if (v > hi) hi = v }
      if (hi - lo > pixelDelta) pixelDelta = hi - lo
    }
    if (pixelDelta > 0) {
      noisePixels++
      if (pixelDelta > maxDelta) maxDelta = pixelDelta
      const p = i / 4, x = p % width, y = (p - x) / width
      if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y
      // The mask stores the per-pixel limit: the largest variation observed at that pixel.
      mask.data.set([pixelDelta, pixelDelta, pixelDelta, 255], i)
      for (const pair of pairs) {
        const da = data[pair.a], db = data[pair.b]
        const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]), Math.abs(da[i + 3] - db[i + 3]))
        if (d > 0) { pair.diffPixels++; if (d > pair.maxDelta) pair.maxDelta = d }
      }
    } else mask.data.set([0, 0, 0, 255], i)
  }
  let maskPng = null
  if (noisePixels) {
    const c = new OffscreenCanvas(width, height); c.getContext('2d').putImageData(mask, 0, 0)
    const bytes = new Uint8Array(await (await c.convertToBlob({ type: 'image/png' })).arrayBuffer()); let s = ''
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    maskPng = btoa(s)
  }
  return { width, height, noisePixels, noiseRatio: noisePixels / (width * height), maxDelta, pairs,
    bbox: noisePixels ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null, maskPng }
})()`

const page = await launchChrome({ port: Number(option('port') ?? 9271) })
const result = {}
try {
  const loaded = page.waitForEvent('Page.loadEventFired')
  await page.send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/` })
  await loaded
  for (const capture of captures) {
    const file = capture.file.replaceAll('\\', '/')
    const { maskPng, ...stats } = await page.evaluate(calibrateExpression(file, runs.length))
    let mask = null
    if (maskPng) {
      mask = `masks/${file}`
      mkdirSync(dirname(join(outDir, mask)), { recursive: true })
      writeFileSync(join(outDir, mask), Buffer.from(maskPng, 'base64'))
    }
    result[keyOf(capture)] = { ...stats, mask }
    const worstPair = Math.max(...stats.pairs.map(pair => pair.diffPixels))
    console.log(`${keyOf(capture)} ruído=${stats.noisePixels}px maxDelta=${stats.maxDelta} piorPar=${worstPair}px`)
  }
} finally {
  page.close()
  server.close()
}

mkdirSync(outDir, { recursive: true })
const tolerance = {
  kind: 'visual-tolerance',
  version: 2,
  method: 'Mapa de limites por pixel: maior variação observada em cada pixel entre todas as capturas independentes da mesma build (0 = sem ruído). Candidato aprovado só se cada pixel diferente ficar dentro do limite medido naquele pixel.',
  reference: runs[0],
  calibrationRuns: runs,
  runManifests: manifests.map(m => ({ commit: m.commit, appSourceTrees: m.appSourceTrees, capturedAt: m.capturedAt, browser: m.browser, chromeFlags: m.chromeFlags, url: m.url })),
  ...describeEnvironment({ browser: page.browser, command: `node scripts/visual-calibrate.mjs ${args.join(' ')}` }),
  captures: result,
}
writeFileSync(join(outDir, 'tolerance.json'), JSON.stringify(tolerance, null, 2))
console.log(`Tolerância v2 com ${captures.length} capturas e ${runs.length} rodadas gravada em ${outDir}`)
