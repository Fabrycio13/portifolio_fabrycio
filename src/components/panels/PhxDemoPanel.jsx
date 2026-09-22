import { FaArrowLeft, FaExternalLinkAlt, FaTimes } from 'react-icons/fa'
import './PhxDemoPanel.css'

export default function PhxDemoPanel({ onBack, onClose }) {
  return (
    <aside
      id="phx-demo"
      className="info-panel is-open phx-demo-panel"
      role="dialog"
      aria-modal="true"
      aria-hidden="false"
      aria-labelledby="phx-demo-title"
    >
      <header className="phx-demo-panel__topbar">
        <div>
          <span className="phx-demo-panel__label">DEMO INTERATIVA</span>
          <h2 id="phx-demo-title">Gerador de laudo PHX / MDS</h2>
        </div>

        <div className="phx-demo-panel__actions">
          <button type="button" className="phx-demo-panel__back" onClick={onBack}>
            <FaArrowLeft aria-hidden="true" />
            Voltar ao projeto
          </button>
          <a className="phx-demo-panel__open" href="/phx-demo.html" target="_blank" rel="noreferrer">
            <FaExternalLinkAlt aria-hidden="true" />
            Abrir em nova aba
          </a>
          <button
            type="button"
            className="phx-demo-panel__close"
            onClick={onClose}
            data-dialog-initial-focus
            autoFocus
          >
            <FaTimes aria-hidden="true" />
            Fechar
          </button>
        </div>
      </header>

      <iframe
        className="phx-demo-panel__frame"
        src="/phx-demo.html"
        title="Demo interativa do gerador de laudo PHX e MDS Crédito Imobiliário"
      />
    </aside>
  )
}
