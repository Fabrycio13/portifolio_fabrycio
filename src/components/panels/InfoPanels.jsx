import { FaBrain, FaCode, FaCog, FaDatabase, FaGithub, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa'
import { SiGmail } from 'react-icons/si'

const aboutToolkit = [
  {
    icon: FaCode,
    title: 'Front-end',
    description: 'React, Next.js, TypeScript, JavaScript, Vite e Tailwind CSS.',
  },
  {
    icon: FaDatabase,
    title: 'Back-end & Dados',
    description: 'Supabase, PostgreSQL, Auth, Storage e Edge Functions.',
  },
  {
    icon: FaBrain,
    title: 'Automação & IA',
    description: 'n8n, integrações via APIs, prompts estruturados e fluxos inteligentes.',
  },
]

const contactLinks = [
  {
    label: 'LinkedIn',
    Icon: FaLinkedinIn,
    href: 'https://www.linkedin.com/in/fabrycio-bermudes-b79a01216/',
    className: 'contact-link--linkedin',
  },
  {
    label: 'GitHub',
    Icon: FaGithub,
    href: 'https://github.com/Fabrycio13',
    className: 'contact-link--github',
  },
  {
    label: 'WhatsApp',
    Icon: FaWhatsapp,
    href: 'https://wa.me/5521986866460',
    className: 'contact-link--whatsapp',
  },
  {
    label: 'Instagram',
    Icon: FaInstagram,
    href: 'https://www.instagram.com/fabrycio.bermudes',
    className: 'contact-link--instagram',
  },
  {
    label: 'Gmail',
    Icon: SiGmail,
    href: 'https://mail.google.com/mail/?view=cm&fs=1&to=fabrycio.bermudes%40gmail.com',
    className: 'contact-link--gmail',
  },
]

function AboutPanel({ onClose, onOpenContact }) {
  return (
    <aside
      id="sobre"
      className="info-panel is-open"
      role="dialog"
      aria-modal="true"
      aria-hidden="false"
      aria-labelledby="about-title"
    >
      <button type="button" className="info-panel__backdrop" onClick={onClose} aria-label="Fechar Sobre" />
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
        <p className="info-panel__label">Sobre</p>
        <h2 id="about-title">Muito prazer!</h2>
        <p className="about-copy">
          Sou Fabrycio, engenheiro de software especializado em transformar ideias
          em produtos digitais, sistemas web e automações inteligentes.
        </p>
        <p className="about-copy">
          Acredito que a boa engenharia aparece quando a tecnologia resolve um
          problema real e torna a experiência do usuário mais simples.
        </p>
        <p className="about-copy">
          Construo desde landing pages e experiências digitais até plataformas SaaS
          completas, conectando interfaces, dados, APIs e infraestrutura. Mais
          recentemente, tenho concentrado minha atuação em IA e automações para
          criar soluções mais inteligentes, eficientes e preparadas para crescer.
        </p>
        <section className="about-toolkit" aria-labelledby="about-toolkit-title">
          <h3 id="about-toolkit-title">Minha stack</h3>
          <ul className="about-toolkit__list">
            {aboutToolkit.map(({ icon: Icon, title, description }) => (
              <li className="about-toolkit__item" key={title}>
                <Icon className="about-toolkit__icon" aria-hidden="true" />
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <button type="button" className="about-contact-cta" onClick={onOpenContact}>
          <FaCog className="about-contact-cta__icon" aria-hidden="true" />
          <span>CONVERSAR SOBRE UM PROJETO</span>
        </button>
      </div>
    </aside>
  )
}

function ContactPanel({ onClose }) {
  return (
    <aside
      id="contato"
      className="info-panel is-open"
      role="dialog"
      aria-modal="true"
      aria-hidden="false"
      aria-labelledby="contact-title"
    >
      <button type="button" className="info-panel__backdrop" onClick={onClose} aria-label="Fechar Contato" />
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
        <p className="info-panel__label">Contato</p>
        <h2 id="contact-title">VAMOS CONSTRUIR ALGO QUE FUNCIONE.</h2>
        <p className="contact-message">
          Tem uma ideia para tirar do papel, um processo para automatizar ou um
          produto que precisa evoluir? Me conte o contexto. Eu transformo
          problemas reais em produtos digitais, sistemas e automações inteligentes
          com clareza, engenharia e atenção aos detalhes.
        </p>
        <p className="contact-message">
          Escolha um canal abaixo e vamos conversar.
        </p>
        <div className="contact-links" aria-label="Canais de contato">
          {contactLinks.map(({ label, Icon, href, className }) => {
            if (!href) {
              return (
                <span
                  className={`contact-link ${className} contact-link--disabled`}
                  key={label}
                  aria-label={`${label}: link será adicionado`}
                  title={`${label}: link será adicionado`}
                  aria-disabled="true"
                >
                  <span className="contact-link__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="contact-link__label">- {label}</span>
                </span>
              )
            }
            return (
              <a
                className={`contact-link ${className}`}
                href={href}
                key={label}
                aria-label={label}
                title={label}
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-link__icon">
                  <Icon aria-hidden="true" />
                </span>
                <span className="contact-link__label">- {label}</span>
              </a>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default function InfoPanels({ activePanel, onClose, onOpenContact }) {
  if (activePanel === 'sobre') return <AboutPanel onClose={onClose} onOpenContact={onOpenContact} />
  if (activePanel === 'contato') return <ContactPanel onClose={onClose} />
  return null
}
