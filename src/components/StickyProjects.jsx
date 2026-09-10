import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { useRef } from 'react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function StickyProjects({ projects }) {
  const container = useRef(null)
  const stage = useRef(null)
  const cardRefs = useRef([])

  useLenis(() => ScrollTrigger.update())

  useGSAP(
    () => {
      const cards = cardRefs.current.filter(Boolean)

      if (!stage.current || !cards.length) return

      gsap.set(cards, {
        yPercent: index => (index === 0 ? 0 : 100),
        scale: 1,
        rotation: 0,
        autoAlpha: 1,
      })

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * (cards.length - 1)}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      })

      cards.slice(0, -1).forEach((currentCard, index) => {
        const nextCard = cards[index + 1]

        timeline.to(
          currentCard,
          {
            scale: 0.72,
            rotation: index % 2 === 0 ? 5 : -5,
            duration: 1,
            ease: 'none',
          },
          index,
        )

        timeline.to(
          nextCard,
          {
            yPercent: 0,
            duration: 1,
            ease: 'none',
          },
          index,
        )
      })

      const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh())
      resizeObserver.observe(container.current)

      return () => {
        resizeObserver.disconnect()
        timeline.scrollTrigger?.kill()
        timeline.kill()
      }
    },
    { scope: container, dependencies: [projects.length] },
  )

  return (
    <section
      id="projetos"
      className="projects"
      aria-labelledby="projects-title"
      ref={container}
    >
      <div className="sticky-projects__stage" ref={stage}>
        <header className="projects__header">
          <p>Seleção inicial</p>
          <h2 id="projects-title">PROJETOS</h2>
        </header>

        <div className="sticky-projects__deck">
          {projects.map((project, index) => (
            <article
              className="project-stack-card"
              key={project.number}
              ref={element => {
                cardRefs.current[index] = element
              }}
            >
              <img
                src={project.image}
                alt={project.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                draggable="false"
              />
              <div className="project-stack-card__veil" />
              <span className="project-stack-card__number">{project.number}</span>
              <div className="project-stack-card__copy">
                <p>{project.detail}</p>
                <h3>{project.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
