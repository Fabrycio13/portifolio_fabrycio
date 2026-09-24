import './StickyProjects.css'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { motion, useMotionValue } from 'motion/react'
import { useRef } from 'react'
import { FaCog } from 'react-icons/fa'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function StickyProjects({ projects, onOpenProject }) {
  const sectionRef = useRef(null)
  const progressRef = useRef(null)
  const pathLength = useMotionValue(0)

  useLenis(() => ScrollTrigger.update())

  useGSAP(() => {
    if (!('IntersectionObserver' in window)) return
    const cards = [...sectionRef.current.querySelectorAll('.project-journey__card')]
    const reveal = card => {
      card.dataset.entrance = 'entered'
      entranceObserver.unobserve(card)
    }
    const entranceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) reveal(entry.target)
      })
    }, { threshold: 0.05 })
    const revealFocusedCard = event => reveal(event.currentTarget)

    cards.forEach(card => {
      card.dataset.entrance = 'pending'
      entranceObserver.observe(card)
      // Keyboard navigation must never leave the focused card invisible.
      card.addEventListener('focus', revealFocusedCard)
    })
    return () => {
      entranceObserver.disconnect()
      cards.forEach(card => {
        card.removeEventListener('focus', revealFocusedCard)
        delete card.dataset.entrance
      })
    }
  }, { scope: sectionRef, dependencies: [projects.length] })

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add({
      mobile: '(max-width: 900px)',
      desktop: '(min-width: 901px)',
      reduced: '(prefers-reduced-motion: reduce)',
    }, context => {
      const { mobile, reduced } = context.conditions
      const section = sectionRef.current
      const path = progressRef.current
      const cards = [...section.querySelectorAll('.project-journey__card')]
      let samples = []
      let stops = []
      let height = 0
      let frame = 0

      const paint = progress => {
        const frontier = progress * height
        // Match the tip's vertical position, not a linear fraction of a curved path.
        let low = 0
        let high = samples.length - 1
        while (low < high) {
          const middle = Math.floor((low + high) / 2)
          if (samples[middle] < frontier) low = middle + 1
          else high = middle
        }
        const previous = samples[Math.max(0, low - 1)]
        const fraction = low === 0 ? 0 : Math.min(1, Math.max(0,
          (frontier - previous) / (samples[low] - previous || 1),
        ))
        pathLength.set(reduced ? 1 : Math.max(0, low - 1 + fraction) / (samples.length - 1))
        cards.forEach((card, index) => {
          card.dataset.reached = String(reduced || frontier >= stops[index] - 80)
        })
      }

      const measure = () => {
        const bounds = section.getBoundingClientRect()
        const route = section.querySelector('.project-journey__route').getBoundingClientRect()
        height = bounds.height
        const width = bounds.width
        const divider = section.querySelector('.project-journey__intro .section-header__divider').getBoundingClientRect()
        stops = cards.map(card => {
          const rect = card.parentElement.getBoundingClientRect()
          return rect.top - bounds.top + rect.height / 2
        })
        const leftRail = route.left - bounds.left + 24
        const rightRail = route.right - bounds.left - 24
        // Cross the page only in the gaps, keeping each card's full width readable.
        const mobileStops = mobile ? cards.flatMap((card, index) => {
          const rect = card.getBoundingClientRect()
          const x = index % 2 ? leftRail : rightRail
          return [
            { x, y: rect.top - bounds.top - 24 },
            { x, y: rect.bottom - bounds.top + 24 },
          ]
        }) : []
        const points = [
          { x: width / 2, y: divider.bottom - bounds.top + 52 },
          ...(mobile ? mobileStops : stops.map((y, index) => ({
            x: route.left - bounds.left + route.width * (index % 2 ? 0.25 : 0.75),
            y,
          }))),
          { x: width / 2, y: height - (mobile ? 12 : 40) },
        ]
        let d = `M ${points[0].x} ${points[0].y}`
        points.slice(1).forEach((point, index) => {
          const previous = points[index]
          const middleY = (previous.y + point.y) / 2
          d += ` C ${previous.x} ${middleY} ${point.x} ${middleY} ${point.x} ${point.y}`
        })
        // Use CSS-pixel coordinates: no stretched SVG / non-scaling dash mismatch.
        path.ownerSVGElement.setAttribute('viewBox', `0 0 ${width} ${height}`)
        path.setAttribute('d', d)
        const length = path.getTotalLength()
        samples = Array.from({ length: 601 }, (_, index) => path.getPointAtLength(length * index / 600).y)
      }

      measure()
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 70%',
        end: 'bottom 70%',
        onUpdate: self => paint(self.progress),
        onRefresh: self => paint(self.progress),
      })
      paint(trigger.progress)
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => {
          measure()
          trigger.refresh()
          paint(trigger.progress)
        })
      })
      observer.observe(section)
      cards.forEach(card => observer.observe(card))

      return () => {
        cancelAnimationFrame(frame)
        observer.disconnect()
        trigger.kill()
      }
    })
    return () => media.revert()
  }, { scope: sectionRef, dependencies: [projects.length] })

  return (
    <section id="projetos" className="projects projects--journey" aria-labelledby="projects-title" ref={sectionRef}>
      <svg className="project-journey__line" aria-hidden="true" focusable="false">
        <motion.path className="project-journey__line-progress" ref={progressRef} style={{ pathLength }} />
      </svg>
      <header className="project-journey__intro">
        <h2 id="projects-title">PROJETOS</h2>
        <span className="section-header__divider" aria-hidden="true">
          <span className="section-header__ornament">
            <FaCog />
          </span>
        </span>
      </header>

      <div className="project-journey__route">
        {projects.map((project, index) => (
          <div className="project-journey__step" key={project.number}>
            <article
              className="project-journey__card"
              role="button"
              tabIndex={0}
              aria-label={`Abrir detalhes do projeto ${project.title}`}
              onClick={() => onOpenProject(project.number)}
              onKeyDown={event => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                onOpenProject(project.number)
              }}
            >
              <div className="project-journey__art">
                <img
                  src={project.logo}
                  alt={project.logoAlt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  draggable="false"
                />
              </div>
              <div className="project-journey__copy">
                <div className="project-journey__meta">
                  <span>{project.detail}</span>
                  <span>{project.number}</span>
                </div>
                <h3>{project.title}</h3>
                <p className="project-journey__summary">{project.summary}</p>
                <span className="hero__cta project-journey__action" aria-hidden="true">
                  <span className="hero__cta-key hero__cta-key--top" />
                  <span className="hero__cta-line" />
                  <span className="hero__cta-text">VER PROJETO</span>
                  <span className="hero__cta-key hero__cta-key--bottom-one" />
                  <span className="hero__cta-key hero__cta-key--bottom-two" />
                </span>
              </div>
            </article>
          </div>
        ))}

      </div>
    </section>
  )
}
