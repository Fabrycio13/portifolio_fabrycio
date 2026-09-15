import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  getVideoSource,
  reportVideoPerformance,
  shaderSettingsByProfile,
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

export function ShaderVideo({
  className = '',
  preloadRequested = false,
  settings: settingsOverrides = {},
}) {
  // base → profile → overrides (overrides sempre vencem)
  const qualityProfile = useQualityProfile()
  const profileSettings = shaderSettingsByProfile[qualityProfile]
  const settings = { ...profileSettings, ...settingsOverrides }

  const videoSource = getVideoSource(qualityProfile)
  const useVideo = settings.useVideo
  const dpr = qualityProfile === 'high' ? [1, 2] : [1, 1]

  const videoRef = useRef(null)
  const [videoElement, setVideoElement] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [capturedPoster, setCapturedPoster] = useState(null)

  // Captura um frame real quando o profile muda para low.
  // Evita o "poster genérico" do atributo — usa o frame atual do vídeo.
  useEffect(() => {
    if (qualityProfile !== 'low') return

    const video = videoRef.current
    if (!video || video.readyState < 2) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1
    canvas.height = video.videoHeight || 1
    canvas.getContext('2d').drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      setCapturedPoster((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
    })
  }, [qualityProfile, videoElement])

  // IntersectionObserver: só mostra conteúdo quando visível na tela.
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

  const shouldRenderCanvas = isVisible || typeof IntersectionObserver === 'undefined'
  const shouldPlay = useVideo && (shouldRenderCanvas || preloadRequested)

  // Recria o elemento quando a fonte muda.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setVideoElement(null)
    video.load()
    return undefined
  }, [videoSource])

  // Controla play/pause reativo ao profile e visibilidade.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const syncPlayback = () => {
      if (shouldPlay && !document.hidden) {
        video.play().catch(() => undefined)
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

  const effectivePoster = capturedPoster || undefined

  return (
    <div className={`shader-video${useVideo ? '' : ' shader-video--static'} ${className}`.trim()}>
      <video
        ref={videoRef}
        className="shader-video__source"
        src={videoSource}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        poster={effectivePoster}
        onLoadedMetadata={() => {
          const video = videoRef.current
          if (!video) return

          setVideoElement(video)

          if (qualityProfile === 'low') {
            // Em modo estático, vai para o primeiro frame.
            video.currentTime = 0
          } else if (shouldPlay && !document.hidden) {
            video.play().catch(() => undefined)
          }
        }}
      />

      {useVideo && shouldRenderCanvas && videoElement ? (
        <Canvas
          className="shader-video__canvas"
          orthographic
          camera={{ position: [0, 0, 1], left: -1, right: 1, top: 1, bottom: -1, near: 0, far: 2 }}
          dpr={dpr}
          gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        >
          <VideoPostProcessing video={videoElement} settings={settings} />
        </Canvas>
      ) : null}
    </div>
  )
}
