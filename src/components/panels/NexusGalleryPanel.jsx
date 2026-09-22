import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa'
import { useState } from 'react'
import './PeopleGalleryPanel.css'
import './NexusGalleryPanel.css'

const screens = [
  {
    image: '/images/projects/nexus/nexus-flow.webp',
    title: 'Fluxo principal',
    description: 'Pipeline visual com ingestão, RAG, agentes e resposta estruturada.',
  },
  {
    image: '/images/projects/nexus/nexus-knowledge.webp',
    title: 'Base de conhecimento',
    description: 'Documentos, chunks e fontes preparados para recuperação semântica.',
  },
  {
    image: '/images/projects/nexus/nexus-agents.webp',
    title: 'Agentes',
    description: 'Agentes especializados para pesquisa, validação e estruturação.',
  },
  {
    image: '/images/projects/nexus/nexus-observability.webp',
    title: 'Observabilidade',
    description: 'Rastreamento de execuções, métricas, latência e consumo.',
  },
]

export default function NexusGalleryPanel({ onBack, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeScreen = screens[activeIndex]
  const previousIndex = activeIndex === 0 ? screens.length - 1 : activeIndex - 1
  const nextIndex = activeIndex === screens.length - 1 ? 0 : activeIndex + 1

  return (
    <aside
      className="people-gallery nexus-gallery is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nexus-gallery-title"
    >
      <button
        type="button"
        className="people-gallery__backdrop"
        onClick={onClose}
        aria-label="Fechar galeria do projeto Nexus AI"
      />
      <div className="people-gallery__content" data-lenis-prevent>
        <header className="people-gallery__topbar">
          <button
            type="button"
            className="people-gallery__back"
            onClick={onBack}
            data-dialog-initial-focus
            autoFocus
          >
            <FaArrowLeft aria-hidden="true" />
            Voltar ao projeto
          </button>
          <div>
            <p className="people-gallery__eyebrow">NEXUS AI · GALERIA DE TELAS</p>
            <h2 id="nexus-gallery-title">{activeScreen.title}</h2>
          </div>
          <div className="people-gallery__topbar-actions">
            <span className="people-gallery__badge">DADOS FICTÍCIOS</span>
            <button type="button" className="people-gallery__close" onClick={onClose} aria-label="Fechar galeria">
              <FaTimes aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="people-gallery__main">
          <button
            type="button"
            className="people-gallery__arrow people-gallery__arrow--previous"
            onClick={() => setActiveIndex(previousIndex)}
            aria-label={`Ver tela anterior: ${screens[previousIndex].title}`}
          >
            <FaArrowLeft aria-hidden="true" />
          </button>
          <figure className="people-gallery__figure">
            <img src={activeScreen.image} alt={`${activeScreen.title} da plataforma Nexus AI`} />
            <figcaption>
              <span>{`${String(activeIndex + 1).padStart(2, '0')} / ${String(screens.length).padStart(2, '0')}`}</span>
              <p>{activeScreen.description}</p>
            </figcaption>
          </figure>
          <button
            type="button"
            className="people-gallery__arrow people-gallery__arrow--next"
            onClick={() => setActiveIndex(nextIndex)}
            aria-label={`Ver próxima tela: ${screens[nextIndex].title}`}
          >
            <FaArrowRight aria-hidden="true" />
          </button>
        </main>

        <nav className="people-gallery__thumbnails" aria-label="Telas do projeto Nexus AI">
          {screens.map((screen, index) => (
            <button
              type="button"
              key={screen.image}
              className={`people-gallery__thumbnail ${index === activeIndex ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Abrir ${screen.title}`}
              aria-pressed={index === activeIndex}
            >
              <img src={screen.image} alt="" />
              <span>{screen.title}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
