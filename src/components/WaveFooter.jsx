import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaArrowUp, FaFacebookF, FaGithub, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import { SiGmail } from 'react-icons/si'
import { useEffect, useRef, useState } from 'react'
import { ShaderVideo } from './ShaderVideo.jsx'
import './WaveFooter.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const socialIcons = [
  {
    label: 'Instagram',
    Icon: FaInstagram,
    href: 'https://www.instagram.com/fabrycio.bermudes',
    className: 'wave-footer__social--instagram',
  },
  {
    label: 'GitHub',
    Icon: FaGithub,
    href: 'https://github.com/Fabrycio13',
    className: 'wave-footer__social--github',
  },
  {
    label: 'LinkedIn',
    Icon: FaLinkedinIn,
    href: null,
    className: 'wave-footer__social--linkedin',
  },
  {
    label: 'Facebook',
    Icon: FaFacebookF,
    href: 'https://www.facebook.com/fabrycio.bermudes',
    className: 'wave-footer__social--facebook',
  },
  {
    label: 'Gmail',
    Icon: SiGmail,
    href: 'https://mail.google.com/mail/?view=cm&fs=1&to=fabrycio.bermudes%40gmail.com',
    className: 'wave-footer__social--gmail',
  },
]

function drawWave(context, width, height, options) {
  const { base, amplitude, frequency, phase, fill, stroke } = options
  const waveY = x => base + Math.sin(x * frequency + phase) * amplitude

  context.beginPath()
  context.moveTo(0, height)
  context.lineTo(0, waveY(0))

  for (let x = 0; x <= width; x += 4) {
    context.lineTo(x, waveY(x))
  }

  context.lineTo(width, height)
  context.closePath()
  context.fillStyle = fill
  context.fill()

  context.beginPath()
  context.moveTo(0, waveY(0))

  for (let x = 0; x <= width; x += 4) {
    context.lineTo(x, waveY(x))
  }

  context.strokeStyle = stroke
  context.lineWidth = 1.5
  context.stroke()
}

function drawTopWave(context, width, height, options) {
  const { base, amplitude, frequency, phase, fill, stroke } = options
  const waveY = x => base + Math.sin(x * frequency + phase) * amplitude
  const edgePadding = 4
  const left = -edgePadding
  const right = width + edgePadding

  context.beginPath()
  context.moveTo(left, 0)
  context.lineTo(right, 0)
  context.lineTo(right, waveY(right))

  for (let x = right; x >= left; x -= 4) {
    context.lineTo(x, waveY(x))
  }

  context.lineTo(left, waveY(left))
  context.lineTo(left, 0)
  context.closePath()
  context.fillStyle = fill
  context.fill()

  // Reforça apenas o topo das laterais para impedir uma coluna transparente.
  context.fillRect(0, 0, edgePadding, Math.max(0, waveY(0) + 1))
  context.fillRect(
    Math.max(0, width - edgePadding),
    0,
    edgePadding,
    Math.max(0, waveY(width) + 1),
  )

  context.beginPath()
  context.moveTo(left, waveY(left))

  for (let x = left + 4; x <= right; x += 4) {
    context.lineTo(x, waveY(x))
  }

  context.lineTo(right, waveY(right))
  context.strokeStyle = stroke
  context.lineWidth = 1.5
  context.stroke()
}

export function WaveFooter() {
  const footer = useRef(null)
  const stage = useRef(null)
  const canvas = useRef(null)
  const name = useRef(null)
  const socials = useRef(null)
  const [shouldPreloadVideo, setShouldPreloadVideo] = useState(false)

  useEffect(() => {
    const projects = document.querySelector('.projects')
    if (!projects || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setShouldPreloadVideo(entry.isIntersecting),
      { threshold: 0 },
    )

    observer.observe(projects)
    return () => observer.disconnect()
  }, [])

  useGSAP(
    () => {
      const context = canvas.current?.getContext('2d')

      if (!context || !footer.current || !stage.current) return

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let width = 0
      let height = 0
      let frame = 0
      let currentProgress = reducedMotion ? 1 : 0
      let targetProgress = reducedMotion ? 1 : 0
      let elementVisible = false
      let pageVisible = !document.hidden

      const resizeCanvas = () => {
        const bounds = stage.current.getBoundingClientRect()
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

        width = bounds.width
        height = bounds.height
        canvas.current.width = Math.round(width * pixelRatio)
        canvas.current.height = Math.round(height * pixelRatio)
        canvas.current.style.width = `${width}px`
        canvas.current.style.height = `${height}px`
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      }

      const stopRender = () => {
        if (!frame) return
        window.cancelAnimationFrame(frame)
        frame = 0
      }

      const render = time => {
        frame = 0
        if (!elementVisible || !pageVisible) return

        currentProgress += (targetProgress - currentProgress) * 0.075
        const easedProgress = 1 - (1 - currentProgress) ** 3
        const movingPhase = reducedMotion ? 0 : time * 0.00032
        const scrollPhase = currentProgress * 2.4
        const base = height * (1.1 - easedProgress * 0.62)
        const topBase = height * (0.1 + easedProgress * 0.025)

        context.clearRect(0, 0, width, height)

        drawTopWave(context, width, height, {
          base: topBase,
          amplitude: height * 0.045,
          frequency: 0.009,
          phase: -movingPhase * 0.8 - scrollPhase,
          fill: '#071f2a',
          stroke: 'rgba(52, 112, 126, 0.86)',
        })

        drawWave(context, width, height, {
          base: base - height * 0.08,
          amplitude: height * 0.045,
          frequency: 0.008,
          phase: movingPhase + scrollPhase,
          fill: 'rgba(92, 151, 164, 0.18)',
          stroke: 'rgba(170, 214, 220, 0.82)',
        })

        drawWave(context, width, height, {
          base: base - height * 0.035,
          amplitude: height * 0.055,
          frequency: 0.011,
          phase: -movingPhase * 1.3 + scrollPhase + 1.8,
          fill: 'rgba(18, 77, 92, 0.24)',
          stroke: 'rgba(99, 164, 176, 0.9)',
        })

        drawWave(context, width, height, {
          base: base + height * 0.025,
          amplitude: height * 0.04,
          frequency: 0.014,
          phase: movingPhase * 1.65 + scrollPhase + 3.2,
          fill: '#071f2a',
          stroke: 'rgba(52, 112, 126, 0.9)',
        })

        frame = window.requestAnimationFrame(render)
      }

      const scheduleRender = () => {
        if (elementVisible && pageVisible && !frame) {
          frame = window.requestAnimationFrame(render)
        }
      }

      resizeCanvas()

      const visibilityObserver = typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              elementVisible = entry.isIntersecting
              if (elementVisible) {
                resizeCanvas()
                scheduleRender()
              } else {
                stopRender()
              }
            },
            { rootMargin: '10% 0px', threshold: 0 },
          )

      if (visibilityObserver) {
        visibilityObserver.observe(footer.current)
      } else {
        elementVisible = true
        scheduleRender()
      }

      const handlePageVisibility = () => {
        pageVisible = !document.hidden
        if (pageVisible) {
          scheduleRender()
        } else {
          stopRender()
        }
      }

      document.addEventListener('visibilitychange', handlePageVisibility)

      const waveTrigger = ScrollTrigger.create({
        trigger: footer.current,
        start: 'top bottom',
        end: 'top top',
        onUpdate: self => {
          targetProgress = self.progress
        },
      })

      let revealTimeline

      if (reducedMotion) {
        gsap.set(name.current, { clipPath: 'inset(0 0% 0 0)', autoAlpha: 1 })
        gsap.set(socials.current, { y: 0, autoAlpha: 1 })
      } else {
        revealTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: footer.current,
            start: 'top 70%',
            end: 'top top',
            scrub: 0.6,
          },
        })

        revealTimeline.fromTo(
          name.current,
          { clipPath: 'inset(0 100% 0 0)', autoAlpha: 0.25 },
          { clipPath: 'inset(0 0% 0 0)', autoAlpha: 1, duration: 1, ease: 'none' },
        )

        revealTimeline.fromTo(
          socials.current,
          { y: 36, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, ease: 'none' },
          0.55,
        )
      }

      const handleResize = () => {
        resizeCanvas()
        ScrollTrigger.refresh()
        scheduleRender()
      }

      window.addEventListener('resize', handleResize)
      const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())

      return () => {
        window.removeEventListener('resize', handleResize)
        document.removeEventListener('visibilitychange', handlePageVisibility)
        visibilityObserver?.disconnect()
        stopRender()
        window.cancelAnimationFrame(refreshFrame)
        revealTimeline?.scrollTrigger?.kill()
        revealTimeline?.kill()
        waveTrigger.kill()
      }
    },
    { scope: footer },
  )

  return (
    <footer id="footer" className="wave-footer" ref={footer}>
      <div className="wave-footer__stage" ref={stage}>
        <ShaderVideo
          className="wave-footer__video"
          preloadRequested={shouldPreloadVideo}
          settings={{
            edgeHeight: -1,
            edgeWave: 0,
            edgeSoftness: 0.01,
          }}
        />

        <canvas className="wave-footer__canvas" ref={canvas} aria-hidden="true" />

        <div className="wave-footer__content">
          <p className="wave-footer__name" ref={name}>
            FABRYCIO BERMUDES
          </p>

          <div className="wave-footer__actions">
            <div className="wave-footer__socials" ref={socials} aria-label="Redes sociais">
              {socialIcons.map(({ label, Icon, href, className }) => {
              const socialClassName = `wave-footer__social ${className}`

              if (!href) {
                return (
                  <span
                    className={`${socialClassName} wave-footer__social--disabled`}
                    key={label}
                    aria-label={`${label}: link será adicionado`}
                    title={`${label}: link será adicionado`}
                  >
                    <Icon aria-hidden="true" />
                  </span>
                )
              }

              const externalProps = href.startsWith('http')
                ? { target: '_blank', rel: 'noreferrer' }
                : {}

              return (
                <a
                  className={socialClassName}
                  href={href}
                  key={label}
                  aria-label={label}
                  title={label}
                  {...externalProps}
                >
                  <Icon aria-hidden="true" />
                </a>
              )
              })}
            </div>

            <a
              className="wave-footer__top-link"
              href="#top"
              aria-label="Voltar ao topo"
              title="Voltar ao topo"
            >
              <FaArrowUp aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
