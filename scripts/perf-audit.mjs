#!/usr/bin/env node

import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { setTimeout as wait } from 'node:timers/promises'

const cliArguments = process.argv.slice(2)
const targetUrl = cliArguments.find(argument => !argument.startsWith('--')) ?? 'http://127.0.0.1:5182/'
const footerScenario = cliArguments.includes('--footer')
const projectsScenario = cliArguments.includes('--projects')
const headed = cliArguments.includes('--headed')
const durationArgument = cliArguments.find(argument => argument.startsWith('--duration-ms='))
const durationMs = Math.max(1000, Number(durationArgument?.split('=')[1]) || 5000)
const debugPort = footerScenario ? 9231 : projectsScenario ? 9233 : headed ? 9232 : 9229

const chromeCandidates = [
  process.env.CHROME_PATH,
  process.env.PROGRAMFILES ? join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe') : null,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].filter(Boolean)

const chromePath = chromeCandidates.find(candidate => candidate && existsSync(candidate))

if (!chromePath) {
  throw new Error('Chrome não encontrado. Defina CHROME_PATH com o caminho do executável.')
}

const getJson = async url => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status} em ${url}`)
  return response.json()
}

const waitForJson = async (url, timeoutMs = 10_000) => {
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

const evaluateExpression = String.raw`(async () => {
  const readCanvas = canvas => ({
    width: canvas.width,
    height: canvas.height,
    clientWidth: canvas.clientWidth,
    clientHeight: canvas.clientHeight,
  })

  const readImage = image => ({
    src: image.currentSrc,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    complete: image.complete,
  })

  const readRect = selector => {
    const element = document.querySelector(selector)
    if (!element) return null
    const rect = element.getBoundingClientRect()
    return {
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height,
      isInViewport: rect.bottom > 0 && rect.top < window.innerHeight,
    }
  }

  const readSection = selector => {
    const element = document.querySelector(selector)
    if (!element) return null
    return {
      className: element.className,
      loading: element.classList.contains(selector.slice(1) + '--loading'),
      rect: readRect(selector),
    }
  }

  const readResources = () => performance.getEntriesByType('resource')
    .filter(entry => /\\.(?:js|css|webp|png)(?:\\?|$)/.test(entry.name))
    .map(entry => ({
      name: entry.name.split('/').pop(),
      transferSize: entry.transferSize,
      decodedBodySize: entry.decodedBodySize,
      duration: entry.duration,
    }))

  const readState = () => ({
    title: document.title,
    scrollY: window.scrollY,
    viewport: {
      innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    },
    sections: {
      services: readSection('.services'),
      projects: readSection('.projects'),
      footer: readSection('.wave-footer'),
    },
    images: [...document.querySelectorAll('img')].map(readImage),
    canvases: [...document.querySelectorAll('canvas')].map(readCanvas),
    projectCards: [...document.querySelectorAll('.project-stack-card')].map(card => ({
      role: card.getAttribute('role'),
      tabIndex: card.tabIndex,
      ariaLabel: card.getAttribute('aria-label'),
    })),
    resources: readResources(),
  })

  const initial = readState()
  await new Promise(resolve => setTimeout(resolve, 500))

  const start = performance.now()
  let frames = 0
  let lastFrame = start
  let rafId = 0
  const longTasks = []
  const observer = typeof PerformanceObserver !== 'undefined'
    ? new PerformanceObserver(list => {
        longTasks.push(...list.getEntries().map(entry => ({
          duration: entry.duration,
          startTime: entry.startTime,
        })))
      })
    : null

  try {
    observer?.observe({ type: 'longtask', buffered: false })
  } catch {}

  const tick = now => {
    frames += 1
    lastFrame = now
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  await new Promise(resolve => setTimeout(resolve, __DURATION_MS__))
  cancelAnimationFrame(rafId)
  observer?.disconnect()

  const end = performance.now()
  return {
    mode: __MODE__,
    elapsedMs: end - start,
    rafFrames: frames,
    rafFps: frames / ((end - start) / 1000),
    longTasks,
    state: readState(),
    initial,
    lastFrame,
  }
})()`

const run = async () => {
  const profileDirectory = mkdtempSync(join(tmpdir(), 'portfolio-cdp-profile-'))
  const chromeArguments = [
    ...(headed ? [] : ['--headless=new']),
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDirectory}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-timer-throttling',
    ...(headed ? [
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=CalculateNativeWinOcclusion',
    ] : []),
    '--window-size=1280,900',
    ...(headed ? ['--window-position=10,10'] : []),
    targetUrl,
  ]
  const chrome = spawn(chromePath, chromeArguments, { stdio: 'ignore' })

  let socket
  let nextId = 0
  const pending = new Map()
  const runtimeIssues = []

  try {
    const version = await waitForJson(`http://127.0.0.1:${debugPort}/json/version`)
    const tabs = await getJson(`http://127.0.0.1:${debugPort}/json/list`)
    const page = tabs.find(tab => tab.type === 'page')
    if (!page) throw new Error('Nenhuma página CDP disponível.')

    socket = new WebSocket(page.webSocketDebuggerUrl)
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true })
      socket.addEventListener('error', reject, { once: true })
    })

    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data)
      if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
        runtimeIssues.push({
          type: message.params.type,
          text: message.params.args?.map(argument => argument.description ?? argument.value ?? '').join(' '),
        })
      }
      if (message.method === 'Runtime.exceptionThrown') {
        runtimeIssues.push({
          type: 'exception',
          text: message.params.exceptionDetails?.exception?.description ?? message.params.exceptionDetails?.text,
        })
      }
      if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message)
        pending.delete(message.id)
      }
    })

    const command = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++nextId
      pending.set(id, message => message.error
        ? reject(new Error(JSON.stringify(message.error)))
        : resolve(message))
      socket.send(JSON.stringify({ id, method, params }))
    })

    await command('Runtime.enable')
    await command('Page.enable')
    await command('Performance.enable')
    await command('Network.enable')
    await command('Page.navigate', { url: targetUrl })
    await wait(1800)

    const scrollSteps = footerScenario ? 24 : projectsScenario ? 8 : 0
    for (let step = 0; step < scrollSteps; step += 1) {
      await command('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        x: 640,
        y: 450,
        deltaY: 700,
        deltaX: 0,
      })
      await wait(90)
    }

    await wait(1200)
    const mode = footerScenario ? 'footer' : projectsScenario ? 'projects' : 'hero'
    const expression = evaluateExpression
      .replace('__MODE__', JSON.stringify(mode))
      .replace('__DURATION_MS__', String(durationMs))
    const result = await command('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })

    const runtimeResult = result.result?.result
    if (result.result?.exceptionDetails) {
      throw new Error(result.result.exceptionDetails.text ?? 'Falha ao executar a auditoria na página.')
    }
    if (!runtimeResult?.value || typeof runtimeResult.value !== 'object' || !runtimeResult.value.mode) {
      throw new Error('A auditoria retornou um resultado incompleto.')
    }
    console.log(JSON.stringify({
      browser: version.Browser,
      url: targetUrl,
      runtimeIssues,
      ...runtimeResult.value,
    }, null, 2))
  } finally {
    socket?.close()
    chrome.kill()
    try {
      rmSync(profileDirectory, { recursive: true, force: true })
    } catch {}
  }
}

run().catch(error => {
  console.error(error.stack ?? error.message)
  process.exitCode = 1
})
