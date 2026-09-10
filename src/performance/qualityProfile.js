import { useEffect, useSyncExternalStore } from 'react'

const HIGH_PROFILE = 'high'
const LOW_PROFILE = 'low'

export const videoSources = {
  high: '/video.mp4',
  low: '/video-1080.mp4',
}

const listeners = new Set()
let currentProfile = getInitialProfile()
let detectionPromise
let poorPerformanceSamples = 0

function getInitialProfile() {
  if (typeof navigator === 'undefined') return HIGH_PROFILE
  return navigator.connection?.saveData ? LOW_PROFILE : HIGH_PROFILE
}

function notifyProfileChange() {
  listeners.forEach(listener => listener())
}

function setLowProfile() {
  if (currentProfile === LOW_PROFILE) return
  currentProfile = LOW_PROFILE
  notifyProfileChange()
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return currentProfile
}

function getServerSnapshot() {
  return HIGH_PROFILE
}

async function detect4KCapability() {
  if (typeof navigator === 'undefined' || currentProfile === LOW_PROFILE) return

  const mediaCapabilities = navigator.mediaCapabilities
  if (!mediaCapabilities?.decodingInfo) return

  const result = await mediaCapabilities.decodingInfo({
    type: 'file',
    video: {
      contentType: 'video/mp4; codecs="avc1.640034"',
      width: 3840,
      height: 2160,
      bitrate: 24649306,
      framerate: 30000 / 1001,
    },
  })

  if (result.supported === false || result.smooth === false) {
    setLowProfile()
  }
}

function ensureCapabilityDetection() {
  if (!detectionPromise) {
    detectionPromise = detect4KCapability().catch(() => undefined)
  }

  return detectionPromise
}

export function useQualityProfile() {
  const profile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    void ensureCapabilityDetection()
  }, [])

  return profile
}

export function getVideoSource(profile) {
  return videoSources[profile] ?? videoSources.high
}

export function reportVideoPerformance({ renderFps, droppedFrames, totalVideoFrames }) {
  if (currentProfile === LOW_PROFILE) return
  if (!Number.isFinite(renderFps) || !Number.isFinite(droppedFrames)) return

  const droppedRate = totalVideoFrames > 0
    ? droppedFrames / (totalVideoFrames + droppedFrames)
    : 0
  const poorSample = renderFps < 55 || droppedRate >= 0.05

  poorPerformanceSamples = poorSample
    ? poorPerformanceSamples + 1
    : Math.max(0, poorPerformanceSamples - 1)

  if (poorPerformanceSamples >= 2) {
    setLowProfile()
  }
}
