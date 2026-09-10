import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { TexturePass } from 'three/addons/postprocessing/TexturePass.js'
import { VideoShader } from '../shaders/videoShader.js'

function VideoPostProcessing({ video, settings }) {
  const { gl, size, viewport } = useThree()
  const composerRef = useRef(null)
  const shaderPassRef = useRef(null)
  const scrollProgressRef = useRef(0)

  const videoTexture = useMemo(() => {
    const texture = new THREE.VideoTexture(video)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [video])

  useEffect(() => {
    const composer = new EffectComposer(gl)
    const texturePass = new TexturePass(videoTexture)
    const shaderPass = new ShaderPass(VideoShader)

    shaderPass.uniforms.uGridSize.value = settings.gridSize
    shaderPass.uniforms.uDotSize.value = settings.dotSize
    shaderPass.uniforms.uContrast.value = settings.contrast
    shaderPass.uniforms.uBrightness.value = settings.brightness
    shaderPass.uniforms.uEffectStrength.value = settings.effectStrength
    shaderPass.uniforms.uColor.value = new THREE.Color(settings.color)
    shaderPass.uniforms.uEdgeHeight.value = settings.edgeHeight
    shaderPass.uniforms.uEdgeWave.value = settings.edgeWave
    shaderPass.uniforms.uEdgeSoftness.value = settings.edgeSoftness
    shaderPass.uniforms.uResolution.value = new THREE.Vector2(1, 1)
    shaderPass.uniforms.uVideoResolution.value = new THREE.Vector2(1, 1)

    composer.addPass(texturePass)
    composer.addPass(shaderPass)

    composerRef.current = composer
    shaderPassRef.current = shaderPass

    const updateVideoResolution = () => {
      shaderPass.uniforms.uVideoResolution.value.set(
        video.videoWidth || 1,
        video.videoHeight || 1,
      )
    }

    updateVideoResolution()
    video.addEventListener('loadedmetadata', updateVideoResolution)

    return () => {
      video.removeEventListener('loadedmetadata', updateVideoResolution)
      texturePass.dispose()
      shaderPass.dispose()
      composer.dispose()
      composerRef.current = null
      shaderPassRef.current = null
    }
  }, [
    gl,
    settings.brightness,
    settings.color,
    settings.contrast,
    settings.dotSize,
    settings.effectStrength,
    settings.gridSize,
    settings.edgeHeight,
    settings.edgeSoftness,
    settings.edgeWave,
    video,
    videoTexture,
  ])

  useEffect(() => {
    const composer = composerRef.current
    const shaderPass = shaderPassRef.current

    if (!composer || !shaderPass) return

    composer.setPixelRatio(viewport.dpr)
    composer.setSize(size.width, size.height)
    shaderPass.uniforms.uResolution.value.set(
      size.width * viewport.dpr,
      size.height * viewport.dpr,
    )
  }, [size.height, size.width, viewport.dpr])

  useEffect(() => () => videoTexture.dispose(), [videoTexture])

  useFrame(({ clock }, delta) => {
    const composer = composerRef.current
    const shaderPass = shaderPassRef.current

    if (!composer || !shaderPass) return

    const targetScroll = window.scrollY / Math.max(window.innerHeight, 1)
    scrollProgressRef.current = THREE.MathUtils.damp(
      scrollProgressRef.current,
      targetScroll,
      8,
      delta,
    )

    shaderPass.uniforms.uTime.value = clock.getElapsedTime()
    shaderPass.uniforms.uScrollProgress.value = scrollProgressRef.current
    composer.render(delta)
  }, 1)

  return null
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

export function ShaderVideo({ className = '', settings: settingsOverrides = {} }) {
  // Altere estes valores durante a aula para personalizar o efeito.
  const settings = { ...defaultSettings, ...settingsOverrides }

  const videoRef = useRef(null)
  const [videoElement, setVideoElement] = useState(null)

  return (
    <div className={`shader-video ${className}`.trim()}>
      <video
        ref={videoRef}
        className="shader-video__source"
        src="/video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onLoadedMetadata={() => setVideoElement(videoRef.current)}
      />

      {videoElement ? (
        <Canvas
          className="shader-video__canvas"
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        >
          {/* Os passes desenham direto na tela; não há mesh ou geometria da aplicação. */}
          <VideoPostProcessing video={videoElement} settings={settings} />
        </Canvas>
      ) : (
        <p className="shader-video__loading">Carregando vídeo…</p>
      )}
    </div>
  )
}
