import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa'
import { useState } from 'react'
import './PeopleGalleryPanel.css'
import './PhxGalleryPanel.css'

const screens = [
  {
    image: '/images/projects/phx/phx-login.webp',
    title: 'Acesso seguro',
    description: 'Tela de login da plataforma MDS Crédito Imobiliário.',
  },
  {
    image: '/images/projects/phx/phx-form-preview.webp',
    title: 'Preenchimento e preview',
    description: 'Dados da análise preenchidos lado a lado com a prévia do laudo.',
  },
  {
    image: '/images/projects/phx/phx-laudo-completo.webp',
    title: 'Laudo de análise',
    description: 'Visualização consolidada das condições aprovadas e parecer técnico.',
  },
]

export default function PhxGalleryPanel({ onBack, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeScreen = screens[activeIndex]
  const previousIndex = activeIndex === 0 ? screens.length - 1 : activeIndex - 1
  const nextIndex = activeIndex === screens.length - 1 ? 0 : activeIndex + 1

  return (
    <aside
      className="people-gallery phx-gallery is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phx-gallery-title"
    >
      <button
        type="button"
        className="people-gallery__backdrop"
        onClick={onClose}
        aria-label="Fechar galeria do projeto PHX e MDS"
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
            <p className="people-gallery__eyebrow">PHX / MDS · GALERIA DE TELAS</p>
            <h2 id="phx-gallery-title">{activeScreen.title}</h2>
          </div>
          <div className="people-gallery__topbar-actions">
            <span className="people-gallery__badge">TELAS DO PROJETO</span>
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
            <img src={activeScreen.image} alt={`${activeScreen.title} da plataforma PHX e MDS Crédito Imobiliário`} />
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

        <nav className="people-gallery__thumbnails" aria-label="Telas do projeto PHX e MDS">
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
