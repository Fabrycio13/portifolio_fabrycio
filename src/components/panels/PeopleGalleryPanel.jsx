import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa'
import { useState } from 'react'
import './PeopleGalleryPanel.css'

const screens = [
  {
    image: '/images/projects/people/people-dashboard.webp',
    title: 'Dashboard',
    description: 'Indicadores de vagas, candidatos e volume do recrutamento.',
  },
  {
    image: '/images/projects/people/people-vagas.webp',
    title: 'Gestão de vagas',
    description: 'Busca, filtros, status e ações operacionais por vaga.',
  },
  {
    image: '/images/projects/people/people-pre-analise.webp',
    title: 'Pré-análise',
    description: 'Resumo, pontos fortes e classificação inicial com IA.',
  },
  {
    image: '/images/projects/people/people-candidato.webp',
    title: 'Candidato e análise de IA',
    description: 'Perfil, habilidades, score e avaliação detalhada.',
  },
  {
    image: '/images/projects/people/people-pipeline.webp',
    title: 'Pipeline',
    description: 'Etapas do processo seletivo organizadas em Kanban.',
  },
  {
    image: '/images/projects/people/people-administracao.webp',
    title: 'Painel administrador',
    description: 'Atividades, consumo, organizações, convites e logs.',
  },
  {
    image: '/images/projects/people/people-configuracoes.webp',
    title: 'Configurações',
    description: 'Perfil, organização, segurança, aparência e consumo.',
  },
]

export default function PeopleGalleryPanel({ onBack, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeScreen = screens[activeIndex]
  const previousIndex = activeIndex === 0 ? screens.length - 1 : activeIndex - 1
  const nextIndex = activeIndex === screens.length - 1 ? 0 : activeIndex + 1

  return (
    <aside
      className="people-gallery is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="people-gallery-title"
    >
      <button
        type="button"
        className="people-gallery__backdrop"
        onClick={onClose}
        aria-label="Fechar galeria do projeto People"
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
            <p className="people-gallery__eyebrow">PEOPLE · GALERIA DE TELAS</p>
            <h2 id="people-gallery-title">{activeScreen.title}</h2>
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
            <img src={activeScreen.image} alt={`${activeScreen.title} da plataforma People`} />
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

        <nav className="people-gallery__thumbnails" aria-label="Telas do projeto People">
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
