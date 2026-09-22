import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa'
import { useState } from 'react'
import './PeopleGalleryPanel.css'
import './CindyGalleryPanel.css'

const screens = [
  {
    image: '/images/projects/cindy/dashboard.webp',
    title: 'Dashboard',
    description: 'Visão geral com indicadores, ações pendentes e atividade recente do condomínio.',
  },
  {
    image: '/images/projects/cindy/residents.webp',
    title: 'Moradores',
    description: 'Lista de moradores com busca, filtros, unidades e status de acesso.',
  },
  {
    image: '/images/projects/cindy/packages.webp',
    title: 'Encomendas',
    description: 'Acompanhamento das encomendas recebidas e das notificações aos moradores.',
  },
  {
    image: '/images/projects/cindy/spaces.webp',
    title: 'Espaços',
    description: 'Gestão de espaços compartilhados, reservas e próximas utilizações.',
  },
  {
    image: '/images/projects/cindy/meetings.webp',
    title: 'Assembleias e reuniões',
    description: 'Acompanhamento de assembleias, pautas, participação e status das reuniões.',
  },
  {
    image: '/images/projects/cindy/occurrences.webp',
    title: 'Ocorrências',
    description: 'Painel de ocorrências com prioridade, situação e ações de acompanhamento.',
  },
]

export default function CindyGalleryPanel({ onBack, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeScreen = screens[activeIndex]
  const previousIndex = activeIndex === 0 ? screens.length - 1 : activeIndex - 1
  const nextIndex = activeIndex === screens.length - 1 ? 0 : activeIndex + 1

  return (
    <aside
      className="people-gallery cindy-gallery is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cindy-gallery-title"
    >
      <button type="button" className="people-gallery__backdrop" onClick={onClose} aria-label="Fechar galeria do projeto Cindy" />
      <div className="people-gallery__content" data-lenis-prevent>
        <header className="people-gallery__topbar">
          <button type="button" className="people-gallery__back" onClick={onBack} data-dialog-initial-focus autoFocus>
            <FaArrowLeft aria-hidden="true" />
            Voltar ao projeto
          </button>
          <div>
            <p className="people-gallery__eyebrow">CINDY · GALERIA DE IMAGENS</p>
            <h2 id="cindy-gallery-title">{activeScreen.title}</h2>
          </div>
          <div className="people-gallery__topbar-actions">
            <span className="people-gallery__badge">ASSETS REAIS</span>
            <button type="button" className="people-gallery__close" onClick={onClose} aria-label="Fechar galeria">
              <FaTimes aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="people-gallery__main">
          <button type="button" className="people-gallery__arrow people-gallery__arrow--previous" onClick={() => setActiveIndex(previousIndex)} aria-label={`Ver imagem anterior: ${screens[previousIndex].title}`}>
            <FaArrowLeft aria-hidden="true" />
          </button>
          <figure className="people-gallery__figure">
            <img src={activeScreen.image} alt={`${activeScreen.title} do projeto Cindy`} />
            <figcaption>
              <span>{`${String(activeIndex + 1).padStart(2, '0')} / ${String(screens.length).padStart(2, '0')}`}</span>
              <p>{activeScreen.description}</p>
            </figcaption>
          </figure>
          <button type="button" className="people-gallery__arrow people-gallery__arrow--next" onClick={() => setActiveIndex(nextIndex)} aria-label={`Ver próxima imagem: ${screens[nextIndex].title}`}>
            <FaArrowRight aria-hidden="true" />
          </button>
        </main>

        <nav className="people-gallery__thumbnails" aria-label="Imagens do projeto Cindy">
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
