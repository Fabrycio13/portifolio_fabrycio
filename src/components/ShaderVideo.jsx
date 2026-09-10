import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  getVideoSource,
  reportVideoPerformance,
  useQualityProfile,
} from '../performance/qualityProfile.js'
import { VideoShader } from '../shaders/videoShader.js'

function VideoPostProcessing({ video, settings }) {
  const { camera, gl, scene, size, viewport } = useThree()
  const materialRef = useRef(null)
  const scrollProgressRef = useRef(0)
  const performanceSampleRef = useRef({
    frameCount: 0,
    startDroppedFrames: null,
    startTime: 0,
    startVideoFrames: null,
  })

  const videoTexture = useMemo(() => {
    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [video])

  const uniforms = useMemo(() => {
    const clonedUniforms = THREE.UniformsUtils.clone(VideoShader.uniforms)
    clonedUniforms.tDiffuse.value = videoTexture
    clonedUniforms.uColor.value = new THREE.Color()
    clonedUniforms.uResolution.value = new THREE.Vector2(1, 1)
    clonedUniforms.uVideoResolution.value = new THREE.Vector2(1, 1)
    return clonedUniforms
  }, [videoTexture])

  useEffect(() => {
    const material = materialRef.current
    if (!material) return

    material.uniforms.uGridSize.value = settings.gridSize
    material.uniforms.uDotSize.value = settings.dotSize
    material.uniforms.uContrast.value = settings.contrast
    material.uniforms.uBrightness.value = settings.brightness
    material.uniforms.uEffectStrength.value = settings.effectStrength
    material.uniforms.uColor.value.set(settings.color)
    material.uniforms.uEdgeHeight.value = settings.edgeHeight
    material.uniforms.uEdgeWave.value = settings.edgeWave
    material.uniforms.uEdgeSoftness.value = settings.edgeSoftness
  }, [
    settings.brightness,
    settings.color,
    settings.contrast,
    settings.dotSize,
    settings.effectStrength,
    settings.edgeHeight,
    settings.edgeSoftness,
    settings.edgeWave,
    settings.gridSize,
  ])

  useEffect(() => {
    const material = materialRef.current
    if (!material) return

    const updateVideoResolution = () => {
      material.uniforms.uVideoResolution.value.set(
        video.videoWidth || 1,
        video.videoHeight || 1,
      )
    }

    updateVideoResolution()
    video.addEventListener('loadedmetadata', updateVideoResolution)

    return () => {
      video.removeEventListener('loadedmetadata', updateVideoResolution)
      videoTexture.dispose()
    }
  }, [video, videoTexture])

  useEffect(() => {
    const material = materialRef.current

    if (!material) return

    const drawingBufferSize = new THREE.Vector2()
    gl.getDrawingBufferSize(drawingBufferSize)
    material.uniforms.uResolution.value.copy(drawingBufferSize)
  }, [gl, size.height, size.width, viewport.dpr])

  useFrame(({ clock }, delta) => {
    const material = materialRef.current

    if (!material) return

    const now = performance.now()
    const performanceSample = performanceSampleRef.current
    const videoQuality = video.getVideoPlaybackQuality?.()

    if (performanceSample.startTime === 0) {
      performanceSample.startTime = now
      performanceSample.startDroppedFrames = videoQuality?.droppedVideoFrames ?? 0
      performanceSample.startVideoFrames = videoQuality?.totalVideoFrames ?? 0
    }

    performanceSample.frameCount += 1

    if (now - performanceSample.startTime >= 5000) {
      const elapsedSeconds = (now - performanceSample.startTime) / 1000
      const totalVideoFrames = videoQuality?.totalVideoFrames ?? 0
      const droppedVideoFrames = videoQuality?.droppedVideoFrames ?? 0

      reportVideoPerformance({
        renderFps: performanceSample.frameCount / elapsedSeconds,
        droppedFrames: Math.max(
          0,
          droppedVideoFrames - (performanceSample.startDroppedFrames ?? 0),
        ),
        totalVideoFrames: Math.max(
          0,
          totalVideoFrames - (performanceSample.startVideoFrames ?? 0),
        ),
      })

      performanceSample.frameCount = 0
      performanceSample.startDroppedFrames = droppedVideoFrames
      performanceSample.startTime = now
      performanceSample.startVideoFrames = totalVideoFrames
    }

    const targetScroll = window.scrollY / Math.max(window.innerHeight, 1)
    scrollProgressRef.current = THREE.MathUtils.damp(
      scrollProgressRef.current,
      targetScroll,
      8,
      delta,
    )

    material.uniforms.uTime.value = clock.getElapsedTime()
    material.uniforms.uScrollProgress.value = scrollProgressRef.current
    gl.render(scene, camera)
  }, 1)

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VideoShader.vertexShader}
        fragmentShader={VideoShader.fragmentShader}
        depthTest={false}
        depthWrite={false}
        toneMapped
      />
    </mesh>
  )
}

const defaultSettings = {
  gridSize: 8,
  dotSize: 1.9,
  contrast: 1.05,
  brightness: 0.34,
  effectStrength: 0.6,
  color: '#6df6ff',
  edgeHeight: 0.1,
  edgeWave: 0.06,
  edgeSoftness: 0.12,
}

export function ShaderVideo({
  className = '',
  preloadRequested = false,
  settings: settingsOverrides = {},
}) {
  // Altere estes valores durante a aula para personalizar o efeito.
  const settings = { ...defaultSettings, ...settingsOverrides }
  const qualityProfile = useQualityProfile()
  const videoSource = getVideoSource(qualityProfile)

  const videoRef = useRef(null)
  const [videoElement, setVideoElement] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const container = video?.parentElement

    if (!container || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const shouldRender = isVisible || typeof IntersectionObserver === 'undefined'
  const shouldPlay = shouldRender || preloadRequested

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    setVideoElement(null)
    video.load()
    return undefined
  }, [videoSource])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const syncPlayback = () => {
      if (shouldPlay && !document.hidden) {
        const playPromise = video.play()
        playPromise?.catch(() => undefined)
      } else {
        video.pause()
      }
    }

    document.addEventListener('visibilitychange', syncPlayback)
    syncPlayback()

    return () => {
      document.removeEventListener('visibilitychange', syncPlayback)
      video.pause()
    }
  }, [shouldPlay, videoSource])

  return (
    <div className={`shader-video ${className}`.trim()}>
      <video
        ref={videoRef}
        className="shader-video__source"
        src={videoSource}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onLoadedMetadata={() => {
          const video = videoRef.current
          setVideoElement(video)
          if (shouldPlay && !document.hidden) {
            video?.play().catch(() => undefined)
          }
        }}
      />

      {shouldRender && videoElement ? (
        <Canvas
          className="shader-video__canvas"
          orthographic
          camera={{ position: [0, 0, 1], left: -1, right: 1, top: 1, bottom: -1, near: 0, far: 2 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        >
          {/* Um único quad fullscreen aplica o shader direto sobre a textura do vídeo. */}
          <VideoPostProcessing video={videoElement} settings={settings} />
        </Canvas>
      ) : shouldRender ? (
        <p className="shader-video__loading">Carregando vídeo…</p>
      ) : null}
    </div>
  )
}
