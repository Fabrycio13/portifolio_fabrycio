#!/usr/bin/env node
// Compares two visual-capture runs pixel by pixel inside Chrome (canvas + getImageData), without image libraries.
// Calibration: node scripts/visual-compare.mjs <runA> <runB> --out=<diff dir> --write-tolerance=<file.json>
// Validation:  node scripts/visual-compare.mjs <baseline> <candidate> --out=<diff dir> --tolerance=<file.json>
// The tolerance is the noise measured between two captures of the same code (Spec 0001 §7.1); no fixed percentage.
import { createServer } from 'node:http'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { launchChrome } from './cdp.mjs'

const args = process.argv.slice(2)
const option = name => args.find(arg => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
const [dirA, dirB] = args.filter(arg => !arg.startsWith('--')).map(dir => resolve(dir))
const outDir = option('out')
if (!dirA || !dirB || !outDir) {
  console.error('Uso: node scripts/visual-compare.mjs <runA> <runB> --out=<dir> [--write-tolerance=<json> | --tolerance=<json>]')
  process.exit(1)
}

const manifestA = JSON.parse(readFileSync(join(dirA, 'manifest.json'), 'utf8'))
const toleranceFile = option('tolerance')
const tolerance = toleranceFile ? JSON.parse(readFileSync(toleranceFile, 'utf8')).captures : null

const server = createServer((request, response) => {
  const [, side, ...rest] = decodeURIComponent(request.url).split('/')
  if (!side) {
    response.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><title>compare</title>')
    return
  }
  let body
  try {
    if (side !== 'a' && side !== 'b') throw new Error('rota desconhecida')
    body = readFileSync(join(side === 'a' ? dirA : dirB, ...rest))
  } catch {
    response.writeHead(404).end()
    return
  }
  response.writeHead(200, { 'content-type': 'image/png' }).end(body)
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const origin = `http://127.0.0.1:${server.address().port}`

// Runs in the page: returns diff statistics and, when pixels differ, a PNG highlighting them in red.
const compareExpression = file => `(async () => {
  const load = src => new Promise((ok, fail) => { const img = new Image(); img.onload = () => ok(img); img.onerror = () => fail(new Error('falha ao carregar ' + src)); img.src = src })
  const [a, b] = await Promise.all([load('/a/${file}'), load('/b/${file}')])
  if (a.width !== b.width || a.height !== b.height) return { sizeMismatch: true, a: [a.width, a.height], b: [b.width, b.height] }
  const pixels = img => { const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height) }
  const pa = pixels(a).data, pb = pixels(b).data
  const out = new ImageData(a.width, a.height)
  let diffPixels = 0, maxDelta = 0, minX = Infinity, minY = Infinity, maxX = -1, maxY = -1
  for (let i = 0; i < pa.length; i += 4) {
    const delta = Math.max(Math.abs(pa[i] - pb[i]), Math.abs(pa[i + 1] - pb[i + 1]), Math.abs(pa[i + 2] - pb[i + 2]), Math.abs(pa[i + 3] - pb[i + 3]))
    const grey = (pa[i] + pa[i + 1] + pa[i + 2]) / 12
    if (delta > 0) {
      diffPixels++; if (delta > maxDelta) maxDelta = delta
      const p = i / 4, x = p % a.width, y = (p - x) / a.width
      if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y
      out.data.set([255, 0, 0, 255], i)
    } else out.data.set([grey, grey, grey, 255], i)
  }
  let diffPng = null
  if (diffPixels) {
    const c = new OffscreenCanvas(a.width, a.height); c.getContext('2d').putImageData(out, 0, 0)
    const blob = await c.convertToBlob({ type: 'image/png' })
    const bytes = new Uint8Array(await blob.arrayBuffer()); let s = ''
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    diffPng = btoa(s)
  }
  return { width: a.width, height: a.height, diffPixels, ratio: diffPixels / (a.width * a.height), maxDelta,
    bbox: diffPixels ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null, diffPng }
})()`

const page = await launchChrome({ port: Number(option('port') ?? 9251) })
const results = []
try {
  const loaded = page.waitForEvent('Page.loadEventFired')
  await page.send('Page.navigate', { url: `${origin}/` })
  await loaded
  for (const capture of manifestA.captures) {
    const file = capture.file.replaceAll('\\', '/')
    const { diffPng, ...stats } = await page.evaluate(compareExpression(file))
    if (diffPng) {
      const target = join(resolve(outDir), file.replace(/\.png$/, '.diff.png'))
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, Buffer.from(diffPng, 'base64'))
    }
    const key = `${capture.viewport}/${capture.scene}`
    const allowed = tolerance?.[key]
    // A candidate passes only if it differs no more than the calibrated noise in pixel count AND in
    // intensity (maxDelta), AND only inside the region where that noise was observed. A real change
    // (swapped image, moved text) produces larger deltas or differences elsewhere and fails.
    const inside = (inner, outer) => !inner || (outer && inner.x >= outer.x && inner.y >= outer.y
      && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height)
    const pass = tolerance
      ? !stats.sizeMismatch
        && stats.diffPixels <= (allowed?.diffPixels ?? 0)
        && stats.maxDelta <= (allowed?.maxDelta ?? 0)
        && inside(stats.bbox, allowed?.bbox)
      : undefined
    results.push({ key, ...stats, ...(tolerance ? { allowedDiffPixels: allowed?.diffPixels ?? 0, pass } : {}) })
    console.log(`${pass === undefined ? '' : pass ? 'PASS ' : 'FAIL '}${key} diff=${stats.diffPixels ?? 'tamanho diferente'} maxDelta=${stats.maxDelta ?? '-'}`)
  }
} finally {
  page.close()
  server.close()
}

mkdirSync(resolve(outDir), { recursive: true })
const report = { kind: 'visual-compare', runA: dirA, runB: dirB, comparedAt: new Date().toISOString(), browser: page.browser, results }
writeFileSync(join(resolve(outDir), 'report.json'), JSON.stringify(report, null, 2))

const writeTolerance = option('write-tolerance')
if (writeTolerance) {
  const captures = Object.fromEntries(results.map(({ key, diffPixels, maxDelta, bbox }) => [key, { diffPixels, maxDelta, bbox }]))
  writeFileSync(writeTolerance, JSON.stringify({
    kind: 'visual-tolerance',
    method: 'Ruído medido entre duas capturas do mesmo código no mesmo ambiente; candidato aprovado se diffPixels e maxDelta <= ruído da mesma captura e se a diferença estiver contida na bbox do ruído.',
    calibrationRuns: [dirA, dirB],
    captures,
  }, null, 2))
}
if (tolerance && results.some(result => !result.pass)) process.exitCode = 1
