#!/usr/bin/env node
// Runs scripts/perf-audit.mjs repeatedly per scenario and records median, min–max and IQR (Spec 0001 §7.2).
// Usage: node scripts/perf-baseline.mjs <preview-url> --out=<file.json outside the repo> [--runs=5]
// No targets are applied here: the output is a baseline to compare against, not a pass/fail gate.
import { execFile } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { promisify } from 'node:util'
import { describeEnvironment } from './run-environment.mjs'

const run = promisify(execFile)
const args = process.argv.slice(2)
const option = name => args.find(arg => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
const url = args.find(arg => !arg.startsWith('--'))
const outFile = option('out')
const runs = Number(option('runs') ?? 5)
const durationMs = 5000
if (!url || !outFile) {
  console.error('Uso: node scripts/perf-baseline.mjs <preview-url> --out=<arquivo.json> [--runs=5]')
  process.exit(1)
}

const scenarios = [
  { id: 'hero', flags: [] },
  { id: 'projects', flags: ['--projects'] },
  { id: 'footer', flags: ['--footer'] },
]

// Metrics the current perf-audit collects correctly. Resources and startup long tasks are known
// blind spots of the script (fixed in Spec 0003, Etapa 0) and are reported as such, not measured.
const extract = result => ({
  rafFps: result.rafFps,
  longTaskCount: result.longTasks.length,
  longTaskMaxMs: result.longTasks.reduce((max, task) => Math.max(max, task.duration), 0),
  runtimeIssues: result.runtimeIssues.length,
  canvases: result.state.canvases.length,
  footerMounted: Boolean(result.state.sections.footer && !result.state.sections.footer.loading),
  cardsWithRoleButton: result.state.projectCards.filter(card => card.role === 'button').length,
  scrollY: result.state.scrollY,
})

const quantile = (sorted, q) => {
  const position = (sorted.length - 1) * q
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower)
}

const summarize = values => {
  const numeric = values.map(Number)
  const sorted = [...numeric].sort((a, b) => a - b)
  const q1 = quantile(sorted, 0.25)
  const q3 = quantile(sorted, 0.75)
  return { values: numeric, median: quantile(sorted, 0.5), min: sorted[0], max: sorted.at(-1), q1, q3, iqr: q3 - q1 }
}

const results = {}
const technicalFailures = []
let browser = null
for (const scenario of scenarios) {
  const samples = []
  let attempts = 0
  while (samples.length < runs && attempts < runs * 2) {
    attempts++
    try {
      const { stdout } = await run(process.execPath, ['scripts/perf-audit.mjs', url, ...scenario.flags, `--duration-ms=${durationMs}`], { maxBuffer: 64 * 1024 * 1024 })
      const parsed = JSON.parse(stdout)
      browser = parsed.browser
      samples.push(extract(parsed))
      console.log(`${scenario.id} #${samples.length}: ${parsed.rafFps.toFixed(2)} fps, ${parsed.longTasks.length} long tasks, ${parsed.runtimeIssues.length} issues`)
    } catch (error) {
      // Only technical failures (Chrome did not start, timeout, unparsable output) are discarded, never results.
      technicalFailures.push({ scenario: scenario.id, attempt: attempts, error: String(error.message).split('\n')[0] })
      console.log(`${scenario.id} falha técnica na tentativa ${attempts}: ${String(error.message).split('\n')[0]}`)
    }
  }
  results[scenario.id] = {
    samples: samples.length,
    metrics: Object.fromEntries(Object.keys(samples[0] ?? {}).map(key => [key, summarize(samples.map(sample => sample[key]))])),
  }
}

const manifest = {
  kind: 'perf-baseline',
  ...describeEnvironment({ browser, url, command: `node scripts/perf-baseline.mjs ${args.join(' ')}` }),
  protocol: { runsPerScenario: runs, durationMs, viewport: '1280x900 (janela padrão do perf-audit)', scenarios: scenarios.map(s => ({ id: s.id, flags: s.flags })) },
  knownLimitations: [
    'perf-audit.mjs retorna resources: [] (regex com escape incorreto) — recursos não medidos.',
    'perf-audit.mjs só observa long tasks ~2,3 s após a navegação — long tasks da inicialização não medidas.',
  ],
  technicalFailures,
  results,
}
mkdirSync(dirname(resolve(outFile)), { recursive: true })
writeFileSync(resolve(outFile), JSON.stringify(manifest, null, 2))
console.log(`Baseline gravada em ${resolve(outFile)}`)
