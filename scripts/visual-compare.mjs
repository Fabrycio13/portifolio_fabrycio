#!/usr/bin/env node
// Compares two visual-capture runs pixel by pixel inside Chrome (canvas + getImageData), without image libraries.
// Validation:  node scripts/visual-compare.mjs <baseline> <candidate> --out=<diff dir> --tolerance=<tolerance.json>
// Tolerance v2 (scripts/visual-calibrate.mjs, Spec 0001 §7.1): a per-pixel limit map measured
// across independent captures of the same build (grey value = largest variation seen at that
// pixel, 0 = no noise). A candidate passes only if every differing pixel stays within its own limit.
// Tolerance v1 (two-capture count + bounding box, --write-tolerance) is kept for traceability.
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

// The second run may be a targeted re-capture (--scenes/--viewports): compare only what it contains.
const manifestB = JSON.parse(readFileSync(join(dirB, 'manifest.json'), 'utf8'))
const toleranceFile = option('tolerance') && resolve(option('tolerance'))
const toleranceDoc = toleranceFile ? JSON.parse(readFileSync(toleranceFile, 'utf8')) : null
const tolerance = toleranceDoc?.captures ?? null
const maskMode = toleranceDoc?.version === 2

const server = createServer((request, response) => {
  const [, side, ...rest] = decodeURIComponent(request.url).split('/')
  if (!side) {
    response.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><title>compare</title>')
    return
  }
  const roots = { a: dirA, b: dirB, m: toleranceFile && dirname(toleranceFile) }
  let body
  try {
    if (!roots[side]) throw new Error('rota desconhecida')
    body = readFileSync(join(roots[side], ...rest))
  } catch {
    response.writeHead(404).end()
    return
  }
  response.writeHead(200, { 'content-type': 'image/png' }).end(body)
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const origin = `http://127.0.0.1:${server.address().port}`

// Runs in the page: diff statistics, the split inside/outside the noise mask (v2) and, when
// pixels differ, a PNG highlighting them (red outside the mask, yellow inside it).
const compareExpression = (file, maskFile) => `(async () => {
  const load = src => new Promise((ok, fail) => { const img = new Image(); img.onload = () => ok(img); img.onerror = () => fail(new Error('falha ao carregar ' + src)); img.src = src })
  const [a, b, m] = await Promise.all([load('/a/${file}'), load('/b/${file}'), ${maskFile ? `load('/m/${maskFile}')` : 'null'}])
  if (a.width !== b.width || a.height !== b.height) return { sizeMismatch: true, a: [a.width, a.height], b: [b.width, b.height] }
  const pixels = img => { const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height) }
  const pa = pixels(a).data, pb = pixels(b).data, pm = m ? pixels(m).data : null
  const out = new ImageData(a.width, a.height)
  let diffPixels = 0, maxDelta = 0, outsideMask = 0, maxDeltaInsideMask = 0, minX = Infinity, minY = Infinity, maxX = -1, maxY = -1
  for (let i = 0; i < pa.length; i += 4) {
    const delta = Math.max(Math.abs(pa[i] - pb[i]), Math.abs(pa[i + 1] - pb[i + 1]), Math.abs(pa[i + 2] - pb[i + 2]), Math.abs(pa[i + 3] - pb[i + 3]))
    const grey = (pa[i] + pa[i + 1] + pa[i + 2]) / 12
    if (delta > 0) {
      diffPixels++; if (delta > maxDelta) maxDelta = delta
      const p = i / 4, x = p % a.width, y = (p - x) / a.width
      if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y
      // Within tolerance only if this pixel was noisy in calibration AND the change stays within
      // the variation measured at this very pixel.
      const noise = pm !== null && pm[i] > 0 && delta <= pm[i]
      if (noise) { if (delta > maxDeltaInsideMask) maxDeltaInsideMask = delta } else outsideMask++
      out.data.set(noise ? [255, 210, 0, 255] : [255, 0, 0, 255], i)
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
  return { width: a.width, height: a.height, diffPixels, ratio: diffPixels / (a.width * a.height), maxDelta, outsideMask, maxDeltaInsideMask,
    bbox: diffPixels ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null, diffPng }
})()`

// v1 rule: pixel count, intensity and bounding box of the two-capture noise.
const passV1 = (stats, allowed) => {
  const inside = (inner, outer) => !inner || (outer && inner.x >= outer.x && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height)
  return !stats.sizeMismatch
    && stats.diffPixels <= (allowed?.diffPixels ?? 0)
    && stats.maxDelta <= (allowed?.maxDelta ?? 0)
    && inside(stats.bbox, allowed?.bbox)
}

// v2 rule: no differing pixel outside the measured noise mask, and noise within its intensity.
const passV2 = (stats, allowed) => !stats.sizeMismatch
  && stats.outsideMask === 0
  && stats.maxDeltaInsideMask <= (allowed?.maxDelta ?? 0)

const page = await launchChrome({ port: Number(option('port') ?? 9251) })
const results = []
try {
  const loaded = page.waitForEvent('Page.loadEventFired')
  await page.send('Page.navigate', { url: `${origin}/` })
  await loaded
  for (const capture of manifestB.captures) {
    const file = capture.file.replaceAll('\\', '/')
    const key = `${capture.viewport}/${capture.scene}`
    const allowed = tolerance?.[key]
    const maskFile = maskMode && allowed?.mask ? allowed.mask.replaceAll('\\', '/') : null
    const { diffPng, ...stats } = await page.evaluate(compareExpression(file, maskFile))
    if (diffPng) {
      const target = join(resolve(outDir), file.replace(/\.png$/, '.diff.png'))
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, Buffer.from(diffPng, 'base64'))
    }
    const pass = tolerance ? (maskMode ? passV2 : passV1)(stats, allowed) : undefined
    results.push({ key, ...stats, ...(tolerance ? { toleranceVersion: maskMode ? 2 : 1, allowedMaxDelta: allowed?.maxDelta ?? 0, pass } : {}) })
    const detail = maskMode ? ` foraDaMascara=${stats.outsideMask} maxDeltaNaMascara=${stats.maxDeltaInsideMask}/${allowed?.maxDelta ?? 0}` : ''
    console.log(`${pass === undefined ? '' : pass ? 'PASS ' : 'FAIL '}${key} diff=${stats.diffPixels ?? 'tamanho diferente'} maxDelta=${stats.maxDelta ?? '-'}${detail}`)
  }
} finally {
  page.close()
  server.close()
}

mkdirSync(resolve(outDir), { recursive: true })
const report = { kind: 'visual-compare', runA: dirA, runB: dirB, tolerance: toleranceFile ?? null, comparedAt: new Date().toISOString(), browser: page.browser, results }
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
