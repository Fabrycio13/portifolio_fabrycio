import './App.css'
import 'lenis/dist/lenis.css'
import { ReactLenis } from 'lenis/react'
import WarpText from './components/WarpText.jsx'
import DecryptedText from './components/DecryptedText.jsx'
import { lazy, Suspense, useEffect, useState } from 'react'

const ProjectDetailsPanel = lazy(() => import('./components/ProjectDetailsPanel.jsx'))
const InfoPanels = lazy(() => import('./components/InfoPanels.jsx'))
const StickyServices = lazy(() => import('./components/StickyServices.jsx').then(module => ({
  default: module.StickyServices,
})))
const StickyProjects = lazy(() => import('./components/StickyProjects.jsx').then(module => ({
  default: module.StickyProjects,
})))
const WaveFooter = lazy(() => import('./components/WaveFooter.jsx').then(module => ({
  default: module.WaveFooter,
})))

const menuItems = [
  { label: 'Sobre', panel: 'sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Projetos', href: '#projetos' },
  { label: 'Contato', panel: 'contato' },
]

const projectCards = [
  {
    number: '01',
    title: 'RH COM INTELIGÊNCIA ARTIFICIAL',
    detail: 'USABIT PEOPLE',
    image: '/projects/project-01.webp',
    alt: 'Screenshot da plataforma de recrutamento e seleção com IA da Usabit People',
  },
  {
    number: '02',
    title: 'CINDY - GESTÃO CONDOMINIAL',
    detail: 'PLATAFORMA WEB',
    image: '/projects/project-02.webp',
    alt: 'Screenshot da plataforma de gestão condominial Cindy',
  },
  {
    number: '03',
    title: 'PHX / MDS CRÉDITO IMOBILIÁRIO',
    detail: 'GERADOR DE LAUDOS · ANÁLISE DE CRÉDITO',
    image: '/projects/project-03.webp',
    alt: 'Screenshot do gerador de laudos de análise de crédito imobiliário PHX e MDS',
  },
  {
    number: '04',
    title: 'NEXUS AI - ORQUESTRAÇÃO DE IA',
    detail: 'EMBEDDINGS · RAG · AGENTES DE IA',
    image: '/projects/project-04.webp',
    alt: 'Imagem conceitual do laboratório Nexus AI de embeddings e orquestração de agentes',
  },
]

function AnimatedMenuLink({ label, href = '#', onClick }) {
  const letters = [...label]
  const handleClick = event => {
    if (!onClick) return
    event.preventDefault()
    onClick()
  }

  return (
    <a className="menu-link" href={href} onClick={handleClick}>
      <span className="span-mother" aria-hidden="true">
        {letters.map((letter, index) => (
          <span key={`${letter}-${index}`} style={{ '--letter-index': index }}>
            {letter}
          </span>
        ))}
      </span>

      <span className="span-mother2" aria-hidden="true">
        {letters.map((letter, index) => (
          <span key={`${letter}-${index}`} style={{ '--letter-index': index }}>
            {letter}
          </span>
        ))}
      </span>

      <span className="visually-hidden">{label}</span>
    </a>
  )
}

function PortfolioContent() {
  const [activePanel, setActivePanel] = useState(null)
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const activeProject = projectCards.find(project => project.number === activePanel)

  useEffect(() => {
    const updateHeader = () => setIsHeaderScrolled(window.scrollY > 24)

    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })

    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  useEffect(() => {
    const isModalOpen = activePanel !== null
    document.documentElement.classList.toggle('modal-open', isModalOpen)
    document.body.classList.toggle('modal-open', isModalOpen)

    return () => {
      document.documentElement.classList.remove('modal-open')
      document.body.classList.remove('modal-open')
    }
  }, [activePanel])

  return (
    <main id="top" className="app">
      <div className="hero-media" aria-hidden="true">
        <picture>
          <source type="image/webp" srcSet="/novo%20portifolio.webp" />
          <img
            src="/novo portifolio.png"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      </div>

      <header className={`site-header ${isHeaderScrolled ? 'is-scrolled' : ''}`}>
        <a className="site-header__brand" href="#top" aria-label="Voltar ao início">
          <picture>
            <source media="(max-width: 900px)" srcSet="/logo-mark.png" />
            <img src="/logo-header.png" alt="Fabrycio Bermudes" />
          </picture>
        </a>

        <nav className="top-menu" aria-label="Navegação principal">
          {menuItems.map(item => (
            <AnimatedMenuLink
              key={item.label}
              {...item}
              onClick={item.panel ? () => setActivePanel(item.panel) : undefined}
            />
          ))}
        </nav>

      </header>

      <section className="hero" aria-label="Apresentação">
        <p className="hero__identity">
          <a
            href="#sobre"
            onClick={event => {
              event.preventDefault()
              setActivePanel('sobre')
            }}
            aria-label="Fabrycio Bermudes - Software Engineer"
          >
            <DecryptedText
              text="[ Fabrycio Bermudes - Software Engineer ]"
              animateOn="view"
              sequential
              speed={34}
              revealDirection="start"
              useOriginalCharsOnly
              parentClassName="hero__identity-decrypted"
              className="hero__identity-glyph"
              encryptedClassName="hero__identity-glyph hero__identity-glyph--encrypted"
            />
          </a>
        </p>

        <div
          className="hero__headline"
          role="heading"
          aria-level="1"
          aria-label="Imaginar é o começo. Fazer funcionar é engenharia."
        >
          <WarpText
            className="hero__warp-line hero__warp-line--short"
            text="IMAGINAR É O COMEÇO."
            color="#f3f8f8"
            warpStrength={0.1}
            warpScale={1.5}
            speed={0.45}
            pointerInfluence={0.48}
            pointerStrength={0.48}
            refraction={0.01}
            ripple
            fontSize="clamp(2.6rem, 7.4vw, 6.6rem)"
            fontWeight={400}
            fontFamily="Caacupe One"
            letterSpacing="-0.045em"
            lineHeight={0.9}
            textAlign="left"
          />
          <WarpText
            className="hero__warp-line hero__warp-line--long"
            text="FAZER FUNCIONAR É ENGENHARIA."
            color="#f3f8f8"
            warpStrength={0.085}
            warpScale={1.65}
            speed={0.4}
            pointerInfluence={0.45}
            pointerStrength={0.42}
            refraction={0.008}
            ripple
            fontSize="clamp(1.9rem, 5.2vw, 4.5rem)"
            fontWeight={400}
            fontFamily="Caacupe One"
            letterSpacing="-0.035em"
            lineHeight={0.9}
            textAlign="left"
          />
        </div>

        <p className="hero__description">
          Transformo ideias ambiciosas em produtos digitais inteligentes,
          visualmente marcantes e tecnicamente sólidos feitos para funcionar no
          mundo real.
        </p>

        <a className="hero__cta" href="#projetos">
          <span className="hero__cta-key hero__cta-key--top" />
          <span className="hero__cta-line" />
          <span className="hero__cta-text">EXPLORAR MEU TRABALHO</span>
          <span className="hero__cta-key hero__cta-key--bottom-one" />
          <span className="hero__cta-key hero__cta-key--bottom-two" />
        </a>
      </section>

      <Suspense
        fallback={(
          <section
            id="servicos"
            className="services services--loading"
            aria-hidden="true"
          />
        )}
      >
        <StickyServices />
      </Suspense>

      <Suspense
        fallback={(
          <section
            id="projetos"
            className="projects projects--loading"
            aria-hidden="true"
          />
        )}
      >
        <StickyProjects projects={projectCards} onOpenProject={setActivePanel} />
      </Suspense>

      <Suspense
        fallback={(
          <footer
            id="footer"
            className="wave-footer wave-footer--loading"
            aria-hidden="true"
          />
        )}
      >
        <WaveFooter />
      </Suspense>

      {activeProject && (
        <Suspense fallback={null}>
          <ProjectDetailsPanel
            projectNumber={activeProject.number}
            onClose={() => setActivePanel(null)}
          />
        </Suspense>
      )}

      {(activePanel === 'sobre' || activePanel === 'contato') && (
        <Suspense fallback={null}>
          <InfoPanels activePanel={activePanel} onClose={() => setActivePanel(null)} />
        </Suspense>
      )}

    </main>
  )
}

function App() {
  return (
    <ReactLenis
      root
      options={{ anchors: true, autoRaf: true, lerp: 0.08, allowNestedScroll: true }}
    >
      <PortfolioContent />
    </ReactLenis>
  )
}

export default App
