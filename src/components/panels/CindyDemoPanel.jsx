import { FaArrowLeft, FaExternalLinkAlt, FaTimes } from 'react-icons/fa'
import './CindyDemoPanel.css'

export default function CindyDemoPanel({ onBack, onClose }) {
  return (
    <aside
      id="cindy-demo"
      className="info-panel is-open cindy-demo-panel"
      role="dialog"
      aria-modal="true"
      aria-hidden="false"
      aria-labelledby="cindy-demo-title"
    >
      <header className="cindy-demo-panel__topbar">
        <div>
          <span className="cindy-demo-panel__label">DEMO INTERATIVA · DADOS FICTÍCIOS</span>
          <h2 id="cindy-demo-title">Gestão condominial com IA</h2>
        </div>

        <div className="cindy-demo-panel__actions">
          <button type="button" onClick={onBack}>
            <FaArrowLeft aria-hidden="true" />
            Voltar ao projeto
          </button>
          <a href="/nova-cindy-mockup-v2.html" target="_blank" rel="noreferrer">
            <FaExternalLinkAlt aria-hidden="true" />
            Abrir em nova aba
          </a>
          <button type="button" className="cindy-demo-panel__close" onClick={onClose} data-dialog-initial-focus autoFocus>
            <FaTimes aria-hidden="true" />
            Fechar
          </button>
        </div>
      </header>

      <iframe
        className="cindy-demo-panel__frame"
        src="/nova-cindy-mockup-v2.html"
        title="Demo interativa da plataforma de gestão condominial com IA"
      />
    </aside>
  )
}
