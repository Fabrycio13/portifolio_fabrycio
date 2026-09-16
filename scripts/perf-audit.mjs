#!/usr/bin/env node

import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { setTimeout as wait } from 'node:timers/promises'

const cliArguments = process.argv.slice(2)
const targetUrl = cliArguments.find((argument) => !argument.startsWith('--')) ?? 'http://127.0.0.1:5182/'
const blockedVideo = cliArguments.includes('--blocked')
const footerScenario = cliArguments.includes('--footer')
const projectsScenario = cliArguments.includes('--projects')
const headed = cliArguments.includes('--headed')
const forcedLowProfile = cliArguments.includes('--force-low')
const durationArgument = cliArguments.find((argument) => argument.startsWith('--duration-ms='))
const durationMs = Math.max(1000, Number(durationArgument?.split('=')[1]) || 5000)
const debugPort = blockedVideo ? 9230 : footerScenario ? 9231 : projectsScenario ? 9233 : headed ? 9232 : 9229

const chromeCandidates = [
  process.env.CHROME_PATH,
  process.env.PROGRAMFILES ? join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe') : null,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].filter(Boolean)

const chromePath = chromeCandidates.find((candidate) => {
  return candidate && existsSync(candidate)
})

if (!chromePath) {
  throw new Error('Chrome não encontrado. Defina CHROME_PATH com o caminho do executável.')
}

const getJson = async (url) => {
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
  const readVideo = (video) => {
    const quality = video.getVideoPlaybackQuality?.()
    return {
      readyState: video.readyState,
      networkState: video.networkState,
      paused: video.paused,
      currentTime: video.currentTime,
      width: video.videoWidth,
      height: video.videoHeight,
      src: video.currentSrc,
      quality: quality ? {
        totalVideoFrames: quality.totalVideoFrames,
        droppedVideoFrames: quality.droppedVideoFrames,
        corruptedVideoFrames: quality.corruptedVideoFrames,
      } : null,
    }
  }

  const readCanvas = (canvas) => ({
    width: canvas.width,
    height: canvas.height,
    clientWidth: canvas.clientWidth,
    clientHeight: canvas.clientHeight,
  })

  const readResources = () => performance.getEntriesByType('resource')
    .filter((entry) => /video|mp4|\\.js$|\\.css$/.test(entry.name))
    .map((entry) => ({
      name: entry.name.split('/').pop(),
      transferSize: entry.transferSize,
      decodedBodySize: entry.decodedBodySize,
      duration: entry.duration,
    }))

  const readRect = (selector) => {
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

  const readState = () => ({
    title: document.title,
    scrollY: window.scrollY,
    viewport: {
      innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    },
    rects: {
      heroVideo: readRect('.app > .shader-video'),
      footer: readRect('.wave-footer'),
      footerVideo: readRect('.wave-footer .shader-video'),
    },
    videos: [...document.querySelectorAll('video')].map(readVideo),
    canvases: [...document.querySelectorAll('canvas')].map(readCanvas),
    resources: readResources(),
  })

  const initial = readState()
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const start = performance.now()
  let frames = 0
  let lastFrame = start
  let rafId = 0
  const longTasks = []
  const observer = typeof PerformanceObserver !== 'undefined'
    ? new PerformanceObserver((list) => {
        longTasks.push(...list.getEntries().map((entry) => ({
          duration: entry.duration,
          startTime: entry.startTime,
        })))
      })
    : null

  try {
    observer?.observe({ type: 'longtask', buffered: false })
  } catch {}

  const tick = (now) => {
    frames += 1
    lastFrame = now
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  await new Promise((resolve) => setTimeout(resolve, __DURATION_MS__))
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
    '--autoplay-policy=no-user-gesture-required',
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
  const networkVideoRequests = new Map()
  const runtimeIssues = []

  try {
    const version = await waitForJson(`http://127.0.0.1:${debugPort}/json/version`)
    const tabs = await getJson(`http://127.0.0.1:${debugPort}/json/list`)
    const page = tabs.find((tab) => tab.type === 'page')
    if (!page) throw new Error('Nenhuma página CDP disponível.')

    socket = new WebSocket(page.webSocketDebuggerUrl)
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true })
      socket.addEventListener('error', reject, { once: true })
    })

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.method === 'Network.responseReceived' && /\/video(?:-1080)?\.mp4$/.test(message.params.response.url)) {
        networkVideoRequests.set(message.params.requestId, {
          url: message.params.response.url,
          status: message.params.response.status,
          mimeType: message.params.response.mimeType,
          encodedDataLength: message.params.response.encodedDataLength ?? 0,
        })
      }
      if (message.method === 'Network.loadingFinished' && networkVideoRequests.has(message.params.requestId)) {
        networkVideoRequests.get(message.params.requestId).encodedDataLength = message.params.encodedDataLength
      }
      if (message.method === 'Network.loadingFailed' && networkVideoRequests.has(message.params.requestId)) {
        networkVideoRequests.get(message.params.requestId).errorText = message.params.errorText
      }
      if (message.method === 'Runtime.consoleAPICalled') {
        runtimeIssues.push({
          type: message.params.type,
          text: message.params.args?.map((argument) => argument.description ?? argument.value ?? '').join(' '),
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
      pending.set(id, (message) => message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message))
      socket.send(JSON.stringify({ id, method, params }))
    })

    await command('Runtime.enable')
    await command('Page.enable')
    await command('Performance.enable')
    await command('Network.enable')
    if (forcedLowProfile) {
      await command('Page.addScriptToEvaluateOnNewDocument', {
        source: "Object.defineProperty(Navigator.prototype, 'connection', { configurable: true, get: () => ({ saveData: true }) })",
      })
    }
    if (blockedVideo) await command('Network.setBlockedURLs', { urls: ['*video*.mp4*'] })
    if (footerScenario) {
      await command('Page.navigate', { url: targetUrl })
      await wait(2000)
      await command('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight)' })
    } else if (projectsScenario) {
      await command('Page.navigate', { url: targetUrl })
      await wait(1000)
      await command('Runtime.evaluate', { expression: "window.scrollTo(0, document.querySelector('.projects')?.offsetTop ?? 0)" })
    } else {
      await command('Page.navigate', { url: targetUrl })
    }

    await wait(2000)
    const mode = blockedVideo ? 'blocked' : footerScenario ? 'footer' : projectsScenario ? 'projects' : 'hero'
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
      networkVideoRequests: [...networkVideoRequests.values()],
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

run().catch((error) => {
  console.error(error.stack ?? error.message)
  process.exitCode = 1
})
