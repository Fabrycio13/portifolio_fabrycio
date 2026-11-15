import './App.css'
import 'lenis/dist/lenis.css'
import { ReactLenis } from 'lenis/react'
import CindyDemoPanel from '@/components/panels/CindyDemoPanel.jsx'
import WarpText from '@/components/effects/WarpText.jsx'
import DecryptedText from '@/components/effects/DecryptedText.jsx'
import InfoPanels from '@/components/panels/InfoPanels.jsx'
import NexusDemoPanel from '@/components/panels/NexusDemoPanel.jsx'
import PhxDemoPanel from '@/components/panels/PhxDemoPanel.jsx'
import ProjectDetailsPanel from '@/components/panels/ProjectDetailsPanel.jsx'
import ProjectGalleryPanel from '@/components/panels/ProjectGalleryPanel.jsx'
import { projects } from '@/data/projects.js'
import { DeferredSection } from '@/layouts/DeferredSection.jsx'
import { fechar, navegar, voltar } from '@/utils/dialogNavigation.js'
import { getFocusableElements } from '@/utils/focus.js'
import { lazy, useEffect, useRef, useState } from 'react'

const StickyServices = lazy(() => import('@/sections/StickyServices.jsx').then(module => ({
  default: module.StickyServices,
})))
const StickyProjects = lazy(() => import('@/sections/StickyProjects.jsx').then(module => ({
  default: module.StickyProjects,
})))
const WaveFooter = lazy(() => import('@/sections/WaveFooter.jsx').then(module => ({
  default: module.WaveFooter,
})))

const menuItems = [
  { label: 'Sobre', dialog: 'sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Projetos', href: '#projetos' },
  { label: 'Contato', dialog: 'contato' },
]

// Which dialog renders each project's demo (Spec 0001, D1.7). The navigation module decides
// whether a demo exists; this map only chooses the component to render. Galleries need no map:
// a single dialog renders any project's gallery from the registry (D1.9).
const demoDialogs = {
  cindy: CindyDemoPanel,
  phx: PhxDemoPanel,
  nexus: NexusDemoPanel,
}

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
  // EstadoDialog = null | { tipo, slug? } (Spec 0001, D1.1); null means no dialog is open.
  const [dialog, setDialog] = useState(null)
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)
  const lastTriggerRef = useRef(null)

  // Every transition is decided by the pure navigation module (D1.2). A rejected transition keeps
  // the current state and is reported only in development (D1.3); there is no fallback dialog.
  const applyTransition = (result, attempted) => {
    if (!result.ok) {
      if (import.meta.env.DEV) console.error(`Transição de dialog rejeitada (${result.motivo}):`, attempted)
      return
    }
    // The trigger is captured only when a chain of dialogs starts from no dialog (D1.4).
    if (result.capturarGatilho) {
      lastTriggerRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    }
    setDialog(result.estado)
  }

  const openDialog = destination => applyTransition(navegar(dialog, destination, projects), destination)
  const goBack = () => applyTransition(voltar(dialog, projects), { voltar: dialog })
  const closeDialog = () => applyTransition(fechar(), null)

  const DemoDialog = dialog?.tipo === 'demo' ? demoDialogs[dialog.slug] : null

  useEffect(() => {
    const updateHeader = () => setIsHeaderScrolled(window.scrollY > 24)

    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })

    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  useEffect(() => {
    const isModalOpen = dialog !== null
    document.documentElement.classList.toggle('modal-open', isModalOpen)
    document.body.classList.toggle('modal-open', isModalOpen)

    if (!isModalOpen) {
      lastTriggerRef.current?.focus()
      lastTriggerRef.current = null
      return undefined
    }

    const focusInitialElement = () => {
      const dialog = document.querySelector('.info-panel.is-open, .people-gallery.is-open')
      const initialFocus = dialog?.querySelector('[data-dialog-initial-focus]')
      initialFocus?.focus()
    }
    const frameId = requestAnimationFrame(focusInitialElement)
    const handleDialogKeyDown = event => {
      const dialog = document.querySelector('.info-panel.is-open, .people-gallery.is-open')
      if (!dialog) return

      if (event.key === 'Escape') {
        event.preventDefault()
        closeDialog()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements(dialog)
      if (!focusableElements.length) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!dialog.contains(document.activeElement)) {
        event.preventDefault()
        firstElement.focus()
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleDialogKeyDown)

    return () => {
      cancelAnimationFrame(frameId)
      document.removeEventListener('keydown', handleDialogKeyDown)
      document.documentElement.classList.remove('modal-open')
      document.body.classList.remove('modal-open')
    }
  }, [dialog])

  return (
    <main id="top" className="app">
      <div className="hero-media" aria-hidden="true">
        <picture>
          <source type="image/webp" srcSet="/images/hero/hero.webp" />
          <img
            src="/images/hero/hero.png"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      </div>

      <header className={`site-header ${isHeaderScrolled ? 'is-scrolled' : ''}`}>
        <a className="site-header__brand" href="#top" aria-label="Voltar ao início">
          <picture>
            <source media="(max-width: 900px)" srcSet="/icons/logo-mark.png" />
            <img src="/icons/logo-header.png" alt="Fabrycio Bermudes" />
          </picture>
        </a>

        <nav className="top-menu" aria-label="Navegação principal">
          {menuItems.map(item => (
            <AnimatedMenuLink
              key={item.label}
              {...item}
              onClick={item.dialog ? () => openDialog({ tipo: item.dialog }) : undefined}
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
              openDialog({ tipo: 'sobre' })
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

        <div className="hero__actions">
          <a className="hero__cta" href="#servicos">
            <span className="hero__cta-key hero__cta-key--top" />
            <span className="hero__cta-line" />
            <span className="hero__cta-text">EXPLORAR MEU TRABALHO</span>
            <span className="hero__cta-key hero__cta-key--bottom-one" />
            <span className="hero__cta-key hero__cta-key--bottom-two" />
          </a>
          <button
            className="hero__cta hero__cta--contact"
            type="button"
            onClick={() => openDialog({ tipo: 'contato' })}
          >
            <span className="hero__cta-key hero__cta-key--top" />
            <span className="hero__cta-line" />
            <span className="hero__cta-text">ENTRAR EM CONTATO</span>
            <span className="hero__cta-key hero__cta-key--bottom-one" />
            <span className="hero__cta-key hero__cta-key--bottom-two" />
          </button>
        </div>
      </section>

      <DeferredSection
        fallback={(
          <section
            id="servicos"
            className="services services--loading"
            aria-hidden="true"
          />
        )}
      >
        <StickyServices />
      </DeferredSection>

      <DeferredSection
        fallback={(
          <section
            id="projetos"
            className="projects projects--loading"
            aria-hidden="true"
          />
        )}
      >
        <StickyProjects projects={projects} onOpenProject={slug => openDialog({ tipo: 'projeto', slug })} />
      </DeferredSection>

      <DeferredSection
        fallback={(
          <footer
            id="footer"
            className="wave-footer wave-footer--loading"
            aria-hidden="true"
          />
        )}
      >
        <WaveFooter />
      </DeferredSection>

      {/* Exactly one dialog renders at a time: the state names a single dialog or none. */}
      {dialog?.tipo === 'projeto' && (
        <ProjectDetailsPanel
          slug={dialog.slug}
          onClose={closeDialog}
          onOpenDemo={slug => openDialog({ tipo: 'demo', slug })}
          onOpenGallery={slug => openDialog({ tipo: 'galeria', slug })}
        />
      )}

      {/* Keyed by slug so a gallery always mounts fresh, on its first screen, for each project,
          as the old per-project components did (D1.9). */}
      {dialog?.tipo === 'galeria' && (
        <ProjectGalleryPanel key={dialog.slug} slug={dialog.slug} onBack={goBack} onClose={closeDialog} />
      )}

      {DemoDialog && <DemoDialog onBack={goBack} onClose={closeDialog} />}

      {(dialog?.tipo === 'sobre' || dialog?.tipo === 'contato') && (
        <InfoPanels
          activePanel={dialog.tipo}
          onClose={closeDialog}
          onOpenContact={() => openDialog({ tipo: 'contato' })}
        />
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
