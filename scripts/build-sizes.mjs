#!/usr/bin/env node
// Records raw and gzip sizes of the production build (dist/) for the Spec 0001 baseline.
// Usage: npm run build && node scripts/build-sizes.mjs --out=<file.json outside the repo>
import { gzipSync } from 'node:zlib'
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describeEnvironment } from './run-environment.mjs'

const outFile = process.argv.slice(2).find(arg => arg.startsWith('--out='))?.slice('--out='.length)
if (!outFile) {
  console.error('Uso: node scripts/build-sizes.mjs --out=<arquivo.json>')
  process.exit(1)
}

const walk = dir => readdirSync(dir).flatMap(name => {
  const path = join(dir, name)
  return statSync(path).isDirectory() ? walk(path) : [path]
})

const assets = walk('dist/assets')
  .filter(path => /\.(js|css)$/.test(path))
  .map(path => {
    const content = readFileSync(path)
    return { file: relative('dist', path).replaceAll('\\', '/'), bytes: content.length, gzipBytes: gzipSync(content).length }
  })
  .sort((a, b) => b.bytes - a.bytes)

const sum = (list, key) => list.reduce((total, item) => total + item[key], 0)
const report = {
  kind: 'build-sizes',
  ...describeEnvironment({ command: `node scripts/build-sizes.mjs ${process.argv.slice(2).join(' ')}` }),
  totals: {
    js: { bytes: sum(assets.filter(a => a.file.endsWith('.js')), 'bytes'), gzipBytes: sum(assets.filter(a => a.file.endsWith('.js')), 'gzipBytes') },
    css: { bytes: sum(assets.filter(a => a.file.endsWith('.css')), 'bytes'), gzipBytes: sum(assets.filter(a => a.file.endsWith('.css')), 'gzipBytes') },
    distBytes: sum(walk('dist').map(path => ({ bytes: statSync(path).size })), 'bytes'),
  },
  assets,
}
mkdirSync(dirname(resolve(outFile)), { recursive: true })
writeFileSync(resolve(outFile), JSON.stringify(report, null, 2))
for (const asset of assets) console.log(`${asset.file}  ${asset.bytes} B  (gzip ${asset.gzipBytes} B)`)
console.log(`JS ${report.totals.js.bytes} B / gzip ${report.totals.js.gzipBytes} B · CSS ${report.totals.css.bytes} B / gzip ${report.totals.css.gzipBytes} B`)
