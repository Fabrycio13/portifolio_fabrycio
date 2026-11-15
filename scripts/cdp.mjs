// Minimal Chrome DevTools Protocol helper shared by the Spec 0001 validation scripts.
// Uses only Node built-ins (fetch, WebSocket) so no browser-automation dependency is needed.
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { setTimeout as wait } from 'node:timers/promises'

export { wait }

export const findChrome = () => {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PROGRAMFILES ? join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe') : null,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean)
  const found = candidates.find(candidate => existsSync(candidate))
  if (!found) throw new Error('Chrome não encontrado. Defina CHROME_PATH com o caminho do executável.')
  return found
}

const getJson = async url => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status} em ${url}`)
  return response.json()
}

const waitForJson = async (url, timeoutMs = 15_000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      return await getJson(url)
    } catch {
      await wait(100)
    }
  }
  throw new Error(`Timeout aguardando ${url}`)
}

export const launchChrome = async ({ port, extraArgs = [] } = {}) => {
  const profile = mkdtempSync(join(tmpdir(), 'portfolio-cdp-'))
  const chrome = spawn(findChrome(), [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-timer-throttling',
    '--hide-scrollbars',
    '--window-size=1280,900',
    ...extraArgs,
    'about:blank',
  ], { stdio: 'ignore' })

  const version = await waitForJson(`http://127.0.0.1:${port}/json/version`)
  const tabs = await getJson(`http://127.0.0.1:${port}/json/list`)
  const page = tabs.find(tab => tab.type === 'page')
  if (!page) throw new Error('Nenhuma página CDP disponível.')

  const socket = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  let nextId = 0
  const pending = new Map()
  const listeners = new Set()
  const runtimeIssues = []

  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message)
      pending.delete(message.id)
      return
    }
    if (message.method === 'Runtime.exceptionThrown') {
      runtimeIssues.push(message.params.exceptionDetails?.exception?.description ?? message.params.exceptionDetails?.text)
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      runtimeIssues.push(message.params.args?.map(arg => arg.description ?? arg.value ?? '').join(' '))
    }
    for (const listener of listeners) listener(message)
  })

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, message => (message.error ? reject(new Error(`${method}: ${JSON.stringify(message.error)}`)) : resolve(message.result)))
    socket.send(JSON.stringify({ id, method, params }))
  })

  const waitForEvent = (method, timeoutMs = 20_000) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      listeners.delete(listener)
      reject(new Error(`Timeout aguardando ${method}`))
    }, timeoutMs)
    const listener = message => {
      if (message.method !== method) return
      clearTimeout(timer)
      listeners.delete(listener)
      resolve(message.params)
    }
    listeners.add(listener)
  })

  // Evaluates an expression in the page and returns its JSON value; throws on page exceptions.
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text)
    }
    return result.result?.value
  }

  const close = () => {
    socket.close()
    chrome.kill()
    try {
      rmSync(profile, { recursive: true, force: true })
    } catch {
      // The profile directory can stay locked briefly on Windows; it lives in the OS temp dir.
    }
  }

  await send('Page.enable')
  await send('Runtime.enable')

  return { browser: version.Browser, send, evaluate, waitForEvent, runtimeIssues, close }
}
