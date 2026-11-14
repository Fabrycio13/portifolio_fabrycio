import {
  FaBox,
  FaBrain,
  FaCar,
  FaChartBar,
  FaCode,
  FaCog,
  FaColumns,
  FaComments,
  FaDatabase,
  FaFileAlt,
  FaGlobe,
  FaShieldAlt,
  FaTachometerAlt,
  FaUsers,
  FaVoteYea,
} from 'react-icons/fa'
import { projects } from '@/data/projects.js'

// Text icon keys used by the registry (D1.6) mapped to their components.
const featureIcons = {
  box: FaBox,
  brain: FaBrain,
  car: FaCar,
  'chart-bar': FaChartBar,
  code: FaCode,
  columns: FaColumns,
  comments: FaComments,
  database: FaDatabase,
  'file-alt': FaFileAlt,
  globe: FaGlobe,
  'shield-alt': FaShieldAlt,
  'tachometer-alt': FaTachometerAlt,
  users: FaUsers,
  'vote-yea': FaVoteYea,
}

export default function ProjectDetailsPanel({ slug, onClose, onOpenDemo, onOpenGallery }) {
  const project = projects.find(item => item.slug === slug)

  if (!project) return null

  const { numero, card, detalhes, galeria, demo } = project

  return (
    <aside
      id={`projeto-${numero}`}
      className="info-panel is-open"
      role="dialog"
      aria-modal="true"
      aria-hidden="false"
      aria-labelledby={`project-title-${numero}`}
    >
      <button
        type="button"
        className="info-panel__backdrop"
        onClick={onClose}
        aria-label={`Fechar ${card.title}`}
      />
      <div className="info-panel__content" data-lenis-prevent>
        <button
          type="button"
          className="info-panel__close"
          onClick={onClose}
          data-dialog-initial-focus
          autoFocus
        >
          Fechar
        </button>
        <p className="info-panel__label">{card.detail}</p>
        <h2 id={`project-title-${numero}`}>{card.title}</h2>
        {Array.isArray(detalhes.description)
          ? detalhes.description.map((paragraph, index) => (
            <p className="project-description" key={`${numero}-description-${index}`}>
              {paragraph}
            </p>
          ))
          : <p className="project-description">{detalhes.description}</p>}
        {galeria && (
          <button
            type="button"
            className={galeria.tema ? `project-gallery-preview project-gallery-preview--${galeria.tema}` : 'project-gallery-preview'}
            onClick={() => onOpenGallery(slug)}
          >
            <img src={galeria.preview.image} alt={galeria.preview.alt} />
            <span className="project-gallery-preview__veil">
              {/* A single text node keeps the markup identical to the previous static label (D1.8). */}
              <span>{`${galeria.screens.length} ${galeria.preview.countLabel}`}</span>
              <strong>VER TELAS DO PROJETO</strong>
            </span>
          </button>
        )}
        <ul className="project-features">
          {detalhes.features.map((feature, index) => {
            const Icon = featureIcons[feature.icon]
            return (
              <li key={index} className="project-features__item">
                <Icon className="project-features__icon" />
                <span>{feature.text}</span>
              </li>
            )
          })}
        </ul>
        <div className="project-tech">
          <h3 className="project-tech__title">
            <FaCode />
            Tecnologias
          </h3>
          {detalhes.technologies.map((technology, index) => (
            <div key={index} className="project-tech__item">
              <span className="project-tech__label">{technology.label}</span>
              <span className="project-tech__stack">{technology.stack}</span>
            </div>
          ))}
        </div>
        {demo && (
          <button type="button" className="about-contact-cta project-demo-cta" onClick={() => onOpenDemo(numero)}>
            <FaCog className="about-contact-cta__icon" aria-hidden="true" />
            <span>{demo.buttonLabel}</span>
          </button>
        )}
      </div>
    </aside>
  )
}
