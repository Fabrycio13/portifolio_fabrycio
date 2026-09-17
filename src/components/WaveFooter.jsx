import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaArrowUp, FaCog, FaGithub, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa'
import { SiGmail } from 'react-icons/si'
import { useRef } from 'react'
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
    label: 'WhatsApp',
    Icon: FaWhatsapp,
    href: 'https://wa.me/5521986866460',
    className: 'wave-footer__social--whatsapp',
  },
  {
    label: 'Gmail',
    Icon: SiGmail,
    href: 'https://mail.google.com/mail/?view=cm&fs=1&to=fabrycio.bermudes%40gmail.com',
    className: 'wave-footer__social--gmail',
  },
]

const footerServices = ['Automações', 'SaaS', 'Landing Page', 'Sites']

function drawWaveLine(context, width, height, options) {
  const { base, amplitude, frequency, phase, stroke } = options
  const waveY = x => base + Math.sin(x * frequency + phase) * amplitude
  const edgePadding = 6
  const left = -edgePadding
  const right = width + edgePadding

  context.beginPath()
  context.moveTo(left, waveY(left))

  for (let x = left + 4; x <= right; x += 4) {
    context.lineTo(x, waveY(x))
  }

  context.strokeStyle = stroke
  context.lineWidth = 1.75
  context.stroke()
}

function drawTopWave(context, width, height, options) {
  const { base, amplitude, frequency, phase, fill, stroke } = options
  const waveY = x => base + Math.sin(x * frequency + phase) * amplitude
  const edgePadding = 6
  const left = -edgePadding
  const right = width + edgePadding

  context.beginPath()
  context.moveTo(left, 0)
  context.lineTo(right, 0)
  context.lineTo(right, waveY(right))

  for (let x = right; x >= left; x -= 4) {
    context.lineTo(x, waveY(x))
  }

  context.closePath()
  context.fillStyle = fill
  context.fill()

  drawWaveLine(context, width, height, { ...options, stroke })
}

export function WaveFooter() {
  const footer = useRef(null)
  const stage = useRef(null)
  const canvas = useRef(null)
  const name = useRef(null)
  const socials = useRef(null)
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
        const topBase = height * (0.12 + easedProgress * 0.025)
        const middleBase = height * (0.25 + easedProgress * 0.04)
        const lowerBase = height * (0.37 + easedProgress * 0.04)

        context.clearRect(0, 0, width, height)

        drawTopWave(context, width, height, {
          base: topBase,
          amplitude: height * 0.095,
          frequency: 0.009,
          phase: -movingPhase * 0.8 - scrollPhase,
          fill: '#071f2a',
          stroke: 'rgba(52, 112, 126, 0.9)',
        })

        drawWaveLine(context, width, height, {
          base: middleBase,
          amplitude: height * 0.075,
          frequency: 0.011,
          phase: movingPhase + scrollPhase + 1.1,
          stroke: 'rgba(82, 155, 172, 0.78)',
        })

        drawWaveLine(context, width, height, {
          base: lowerBase,
          amplitude: height * 0.085,
          frequency: 0.009,
          phase: -movingPhase * 1.15 + scrollPhase + 2.2,
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
        <picture>
          <source type="image/webp" srcSet="/footer.webp" />
          <img
            className="wave-footer__image"
            src="/footer.png"
            alt="Paisagem de montanhas ao entardecer"
            loading="lazy"
            decoding="async"
          />
        </picture>

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

        <div className="wave-footer__meta">
          <div className="wave-footer__services" aria-label="O que eu faço">
            {footerServices.map((service, index) => (
              <span className="wave-footer__service" key={service}>
                {index > 0 && (
                  <FaCog className="wave-footer__service-gear" aria-hidden="true" />
                )}
                <span>{service}</span>
              </span>
            ))}
          </div>
          <p className="wave-footer__copyright">© 2026 Fabrycio Bermudes</p>
        </div>
      </div>
    </footer>
  )
}
