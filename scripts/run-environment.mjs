// Reproducibility metadata for the Spec 0001 manifests (§7.3).
import { execFileSync } from 'node:child_process'
import { arch, cpus, hostname, release, type } from 'node:os'

// The repository may be owned by another OS user; pass safe.directory per command instead of
// changing the global Git configuration.
const git = (...gitArgs) => {
  try {
    return execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...gitArgs], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return null
  }
}

// Tree hashes of everything that affects the built site; equal hashes mean an identical app.
const appSourcePaths = ['src', 'public', 'index.html', 'package.json', 'package-lock.json', 'vite.config.js']

export const describeEnvironment = ({ browser = null, url = null, command }) => {
  const parsed = url ? new URL(url) : null
  return {
    commit: git('rev-parse', 'HEAD'),
    workingTreeClean: git('status', '--porcelain') === '',
    appSourceTrees: Object.fromEntries(appSourcePaths.map(path => [path, git('rev-parse', `HEAD:${path}`)])),
    capturedAt: new Date().toISOString(),
    node: process.version,
    browser,
    os: `${type()} ${release()} ${arch()}`,
    machine: { hostname: hostname(), cpu: cpus()[0]?.model ?? null, cores: cpus().length },
    url,
    port: parsed?.port ?? null,
    command,
  }
}
