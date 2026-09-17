import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { useRef } from 'react'
import BlurText from './BlurText.jsx'
import './StickyServices.css'
import { FaCog } from 'react-icons/fa'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const services = [
  {
    number: '01',
    title: 'AUTOMAÇÕES',
    description:
      'Menos tarefas repetitivas. Mais tempo para decisões importantes. Conecto processos, dados e ferramentas para sua operação trabalhar com mais velocidade, clareza e consistência.',
    detail: 'PROCESSOS · INTEGRAÇÕES · IA',
  },
  {
    number: '02',
    title: 'SAAS',
    description:
      'Transformo uma ideia em um produto digital pronto para crescer: da experiência do usuário à arquitetura que sustenta clientes, dados e novas oportunidades.',
    detail: 'PRODUTO · ESCALA · ENGENHARIA',
  },
  {
    number: '03',
    title: 'LANDING PAGE',
    description:
      'Uma landing page não precisa apenas parecer boa. Ela precisa explicar seu valor em segundos, criar confiança e conduzir cada visita para o próximo passo.',
    detail: 'ESTRATÉGIA · CONVERSÃO · PERFORMANCE',
  },
  {
    number: '04',
    title: 'SITES',
    description:
      'Sites com personalidade, estrutura e performance para representar sua marca e funcionar bem em qualquer tela.',
    detail: 'IDENTIDADE · EXPERIÊNCIA · WEB',
  },
]

export function StickyServices() {
  const container = useRef(null)
  const stage = useRef(null)
  const cardRefs = useRef([])

  useLenis(() => ScrollTrigger.update())

  useGSAP(
    () => {
      const cards = cardRefs.current.filter(Boolean)

      if (!stage.current || !cards.length) return

      const isDesktop = window.matchMedia('(min-width: 901px)').matches

      gsap.set(cards, {
        yPercent: index => (isDesktop ? 0 : index === 0 ? 0 : 100),
        scale: 1,
        rotation: 0,
        autoAlpha: 1,
      })

      if (
        isDesktop ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        return

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
            rotation: index % 2 === 0 ? 4 : -4,
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
    { scope: container, dependencies: [services.length] },
  )

  return (
    <section
      id="servicos"
      className="services"
      aria-labelledby="services-title"
      ref={container}
    >
      <div className="sticky-services__stage" ref={stage}>
        <header className="services__header">
          <p>O que eu faço</p>
          <h2 id="services-title">SERVIÇOS</h2>
          <span className="section-header__divider" aria-hidden="true">
            <span className="section-header__ornament">
              <FaCog />
            </span>
          </span>
        </header>

        <div className="sticky-services__deck">
          {services.map((service, index) => (
            <article
              className="services-card"
              key={service.number}
              ref={element => {
                cardRefs.current[index] = element
              }}
            >
              <div className="services-card__copy">
                <BlurText
                  className="services-card__title"
                  text={service.title}
                  animateBy="letters"
                  direction="bottom"
                  delay={45}
                  stepDuration={0.3}
                  threshold={0.2}
                />
                <p className="services-card__detail">{service.detail}</p>
                <p className="services-card__description">{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
