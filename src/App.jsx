import './App.css'
import 'lenis/dist/lenis.css'
import { ReactLenis } from 'lenis/react'
import { ShaderVideo } from './components/ShaderVideo.jsx'
import { StickyProjects } from './components/StickyProjects.jsx'
import { ThemeSwitch } from './components/ThemeSwitch.jsx'
import { WaveFooter } from './components/WaveFooter.jsx'
import WarpText from './components/WarpText.jsx'
import DecryptedText from './components/DecryptedText.jsx'
import { useEffect, useRef } from 'react'

const menuItems = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Projetos', href: '#projetos' },
  { label: 'Contato', href: '#contato' },
]

const placeholderProjects = [
  {
    number: '01',
    title: 'PROJETO CONCEITO 01',
    detail: 'DESIGN · DESENVOLVIMENTO',
    image: '/projects/project-01.webp',
    alt: 'Imagem temporária do projeto conceito 01',
  },
  {
    number: '02',
    title: 'PROJETO CONCEITO 02',
    detail: 'PRODUTO · EXPERIÊNCIA',
    image: '/projects/project-02.webp',
    alt: 'Imagem temporária do projeto conceito 02',
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

function AnimatedMenuLink({ label, href }) {
  const letters = [...label]

  return (
    <a className="menu-link" href={href}>
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

function App() {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = lenisRef.current?.lenis

    const syncModalScroll = () => {
      const isModalOpen = window.location.hash === '#sobre' || window.location.hash === '#contato'
      document.documentElement.classList.toggle('modal-open', isModalOpen)
      document.body.classList.toggle('modal-open', isModalOpen)

      if (isModalOpen) {
        lenis?.stop()
      } else {
        lenis?.start()
      }
    }

    const blockBackgroundScroll = event => {
      const target = event.target instanceof Element ? event.target : null
      const isInsidePanel = target?.closest('.info-panel__content')
      const isModalOpen = window.location.hash === '#sobre' || window.location.hash === '#contato'

      if (isModalOpen && !isInsidePanel) event.preventDefault()
    }

    syncModalScroll()
    window.addEventListener('hashchange', syncModalScroll)
    document.addEventListener('wheel', blockBackgroundScroll, { passive: false })
    document.addEventListener('touchmove', blockBackgroundScroll, { passive: false })

    return () => {
      window.removeEventListener('hashchange', syncModalScroll)
      document.removeEventListener('wheel', blockBackgroundScroll)
      document.removeEventListener('touchmove', blockBackgroundScroll)
      document.documentElement.classList.remove('modal-open')
      document.body.classList.remove('modal-open')
      lenis?.start()
    }
  }, [])

  return (
    <ReactLenis root options={{ anchors: true, autoRaf: true, lerp: 0.08 }}>
      <main id="top" className="app">
      <ShaderVideo />

      <nav className="top-menu" aria-label="Navegação principal">
        {menuItems.map(item => (
          <AnimatedMenuLink key={item.label} {...item} />
        ))}
      </nav>

      <ThemeSwitch />

      <section className="hero" aria-label="Apresentação">
        <p className="hero__identity">
          <a
            href="#sobre"
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
            color="#000000"
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
            color="#000000"
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

      <StickyProjects projects={placeholderProjects} />

      <WaveFooter />

      <aside id="sobre" className="info-panel" aria-labelledby="about-title">
        <a className="info-panel__backdrop" href="#top" aria-label="Fechar Sobre" />
        <div className="info-panel__content">
          <a className="info-panel__close" href="#top">
            Fechar
          </a>
          <p className="info-panel__label">Sobre</p>
          <h2 id="about-title">FABRYCIO BERMUDES</h2>
          <p>
            Transformo ideias ambiciosas em produtos digitais inteligentes,
            visualmente marcantes e tecnicamente sólidos feitos para funcionar
            no mundo real.
          </p>
        </div>
      </aside>

      <aside id="contato" className="info-panel" aria-labelledby="contact-title">
        <a className="info-panel__backdrop" href="#top" aria-label="Fechar Contato" />
        <div className="info-panel__content">
          <a className="info-panel__close" href="#top">
            Fechar
          </a>
          <p className="info-panel__label">Contato</p>
          <h2 id="contact-title">VAMOS CONVERSAR.</h2>
          <p>
            Os canais de contato entram aqui na próxima etapa. Por enquanto, este
            painel mantém a estrutura visual pronta para receber o conteúdo.
          </p>
        </div>
      </aside>
      </main>
    </ReactLenis>
  )
}

export default App
