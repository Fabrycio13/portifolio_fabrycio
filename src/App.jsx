import './App.css'
import 'lenis/dist/lenis.css'
import { ReactLenis, useLenis } from 'lenis/react'
import { StickyProjects } from './components/StickyProjects.jsx'
import { WaveFooter } from './components/WaveFooter.jsx'
import WarpText from './components/WarpText.jsx'
import DecryptedText from './components/DecryptedText.jsx'
import { useEffect, useState } from 'react'
import { FaBrain, FaColumns, FaGlobe, FaDatabase, FaChartBar, FaShieldAlt, FaCode, FaFileAlt, FaTachometerAlt, FaUsers, FaCar, FaBox, FaComments, FaVoteYea } from 'react-icons/fa'

const menuItems = [
  { label: 'Sobre', panel: 'sobre' },
  { label: 'Serviços', panel: 'servicos' },
  { label: 'Projetos', href: '#projetos' },
  { label: 'Contato', panel: 'contato' },
]

const placeholderProjects = [
  {
    number: '01',
    title: 'RH COM INTELIGÊNCIA ARTIFICIAL',
    detail: 'USABIT PEOPLE',
    description: 'O Usabit People é uma plataforma web que ajuda equipes de RH a organizar o recrutamento, desde a publicação de uma vaga até o acompanhamento dos candidatos.',
    features: [
      { icon: FaBrain, text: 'Análise de currículos com IA' },
      { icon: FaColumns, text: 'Pipeline Kanban' },
      { icon: FaGlobe, text: 'Portal de carreiras público' },
      { icon: FaDatabase, text: 'Banco de talentos' },
      { icon: FaChartBar, text: 'Dashboards de indicadores' },
      { icon: FaShieldAlt, text: 'Controle de acesso (RBAC)' },
    ],
    technologies: [
      { label: 'Front-end', stack: 'React, TypeScript, Vite, Tailwind CSS' },
      { label: 'Back-end', stack: 'Supabase (Auth, PostgreSQL, Storage)' },
      { label: 'Infraestrutura', stack: 'Supabase Edge Functions' },
      { label: 'IA', stack: 'Engenharia de prompt customizada' },
    ],
    image: '/projects/project-01.webp',
    alt: 'Screenshot da plataforma de recrutamento e seleção com IA da Usabit People',
  },
  {
    number: '02',
    title: 'CINDY - GESTÃO CONDOMINIAL',
    detail: 'PLATAFORMA WEB',
    description: 'A Cindy é uma plataforma completa para administração de condomínios, centralizando em um único sistema a gestão de moradores, unidades, veículos, vagas de garagem, encomendas, ocorrências e espaços compartilhados. Utiliza IA para automatizar o cadastro de veículos e registro de encomendas.',
    features: [
      { icon: FaTachometerAlt, text: 'Dashboard com indicadores' },
      { icon: FaUsers, text: 'Gestão de moradores' },
      { icon: FaCar, text: 'Controle de veículos e vagas' },
      { icon: FaBox, text: 'Registro de encomendas' },
      { icon: FaComments, text: 'Chat e comunicados' },
      { icon: FaVoteYea, text: 'Assembleias digitais' },
    ],
    technologies: [
      { label: 'Front-end', stack: 'React, TypeScript, Vite, Tailwind CSS' },
      { label: 'Back-end', stack: 'Supabase (Auth, PostgreSQL, Storage)' },
      { label: 'Infraestrutura', stack: 'Supabase Edge Functions' },
      { label: 'Integrações', stack: 'Webhooks, n8n, WhatsApp, APIs externas' },
    ],
    image: '/projects/project-02.webp',
    alt: 'Screenshot da plataforma de gestão condominial Cindy',
  },
  {
    number: '03',
    title: 'PROJETO CONCEITO 03',
    detail: 'WEBGL · INTERAÇÃO',
    image: '/projects/project-03.webp',
    alt: 'Imagem temporária do projeto conceito 03',
  },
  {
    number: '04',
    title: 'PROJETO CONCEITO 04',
    detail: 'ESTRATÉGIA · TECNOLOGIA',
    image: '/projects/project-04.webp',
    alt: 'Imagem temporária do projeto conceito 04',
  },
  {
    number: '05',
    title: 'PROJETO CONCEITO 05',
    detail: 'DIREÇÃO · ENGENHARIA',
    image: '/projects/project-05.webp',
    alt: 'Imagem temporária do projeto conceito 05',
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
  const lenis = useLenis()
  const [activePanel, setActivePanel] = useState(null)
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)

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

    if (isModalOpen) {
      lenis?.stop()
    } else {
      lenis?.start()
    }

    return () => {
      document.documentElement.classList.remove('modal-open')
      document.body.classList.remove('modal-open')
      lenis?.start()
    }
  }, [activePanel, lenis])

  return (
    <main id="top" className="app">
      <div className="hero-media" aria-hidden="true">
        <img
          src="/novo portifolio.png"
          alt=""
          decoding="async"
          fetchPriority="high"
        />
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

      <StickyProjects projects={placeholderProjects} onOpenProject={setActivePanel} />

      <WaveFooter />

      <aside
        id="sobre"
        className={`info-panel ${activePanel === 'sobre' ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={activePanel !== 'sobre'}
        aria-labelledby="about-title"
      >
        <button
          type="button"
          className="info-panel__backdrop"
          onClick={() => setActivePanel(null)}
          aria-label="Fechar Sobre"
        />
        <div className="info-panel__content">
          <button
            type="button"
            className="info-panel__close"
            onClick={() => setActivePanel(null)}
          >
            Fechar
          </button>
          <p className="info-panel__label">Sobre</p>
          <h2 id="about-title">FABRYCIO BERMUDES</h2>
          <p>
            Transformo ideias ambiciosas em produtos digitais inteligentes,
            visualmente marcantes e tecnicamente sólidos feitos para funcionar
            no mundo real.
          </p>
        </div>
      </aside>

      <aside
        id="servicos"
        className={`info-panel ${activePanel === 'servicos' ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={activePanel !== 'servicos'}
        aria-labelledby="services-title"
      >
        <button
          type="button"
          className="info-panel__backdrop"
          onClick={() => setActivePanel(null)}
          aria-label="Fechar Serviços"
        />
        <div className="info-panel__content">
          <button
            type="button"
            className="info-panel__close"
            onClick={() => setActivePanel(null)}
          >
            Fechar
          </button>
          <p className="info-panel__label">Serviços</p>
          <h2 id="services-title">PRODUTOS DIGITAIS QUE FUNCIONAM</h2>
          <p>
            Estratégia, design e engenharia para transformar ideias ambiciosas
            em experiências digitais inteligentes e consistentes.
          </p>
        </div>
      </aside>

      {placeholderProjects.map(project => (
        <aside
          key={project.number}
          id={`projeto-${project.number}`}
          className={`info-panel ${activePanel === project.number ? 'is-open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-hidden={activePanel !== project.number}
          aria-labelledby={`project-title-${project.number}`}
        >
          <button
            type="button"
            className="info-panel__backdrop"
            onClick={() => setActivePanel(null)}
            aria-label={`Fechar ${project.title}`}
          />
          <div className="info-panel__content">
            <button
              type="button"
              className="info-panel__close"
              onClick={() => setActivePanel(null)}
            >
              Fechar
            </button>
            <p className="info-panel__label">{project.detail}</p>
            <h2 id={`project-title-${project.number}`}>{project.title}</h2>
            {project.description && <p>{project.description}</p>}
            {project.features && (
              <ul className="project-features">
                {project.features.map((feature, i) => (
                  <li key={i} className="project-features__item">
                    <feature.icon className="project-features__icon" />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            )}
            {project.technologies && (
              <div className="project-tech">
                <h3 className="project-tech__title">
                  <FaCode />
                  Tecnologias
                </h3>
                {project.technologies.map((tech, i) => (
                  <div key={i} className="project-tech__item">
                    <span className="project-tech__label">{tech.label}</span>
                    <span className="project-tech__stack">{tech.stack}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      ))}

      <aside
        id="contato"
        className={`info-panel ${activePanel === 'contato' ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={activePanel !== 'contato'}
        aria-labelledby="contact-title"
      >
        <button
          type="button"
          className="info-panel__backdrop"
          onClick={() => setActivePanel(null)}
          aria-label="Fechar Contato"
        />
        <div className="info-panel__content">
          <button
            type="button"
            className="info-panel__close"
            onClick={() => setActivePanel(null)}
          >
            Fechar
          </button>
          <p className="info-panel__label">Contato</p>
          <h2 id="contact-title">VAMOS CONVERSAR.</h2>
          <p>
            Os canais de contato entram aqui na próxima etapa. Por enquanto, este
            painel mantém a estrutura visual pronta para receber o conteúdo.
          </p>
        </div>
      </aside>
    </main>
  )
}

function App() {
  return (
    <ReactLenis root options={{ anchors: true, autoRaf: true, lerp: 0.08 }}>
      <PortfolioContent />
    </ReactLenis>
  )
}

export default App
