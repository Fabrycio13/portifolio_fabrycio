import { FaBrain, FaCode, FaDatabase, FaGithub, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa'
import { SiGmail } from 'react-icons/si'

const aboutToolkit = [
  {
    icon: FaCode,
    title: 'Front-end Ágil',
    description: 'Next.js, React, JavaScript, TypeScript, Tailwind CSS e Vite.',
  },
  {
    icon: FaDatabase,
    title: 'Back-end & Dados',
    description: 'Supabase (Auth, PostgreSQL) para escalar rápido.',
  },
  {
    icon: FaBrain,
    title: 'Automação & IA',
    description: 'Fluxos no n8n e Engenharia de Prompt para Chatbots e integrações.',
  },
]

const contactLinks = [
  {
    label: 'LinkedIn',
    Icon: FaLinkedinIn,
    href: null,
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

function AboutPanel({ onClose }) {
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
        <button type="button" className="info-panel__close" onClick={onClose}>
          Fechar
        </button>
        <p className="info-panel__label">Sobre</p>
        <h2 id="about-title">Muito prazer !</h2>
        <p className="about-copy">
          Sou Fabrycio, engenheiro de Software especializado em construir
          ecossistemas web e automatizar rotinas através de IA. Acredito que o
          código bom é aquele que resolve o problema rápido e funciona bem na
          mão do usuário.
        </p>
        <p className="about-copy">
          Tenho foco total em produtividade. Utilizo uma stack moderna para
          desenvolver desde landing pages de alta conversão até sistemas SaaS
          completos, cuidando de toda a interface e integração de banco de
          dados. No último ano, dediquei minha atuação a implementar IA e
          automações (n8n, engenharia de prompts, hardness, graph e loop enginner)
          para criar negócios mais inteligentes e autônomos.
        </p>
        <section className="about-toolkit" aria-labelledby="about-toolkit-title">
          <h3 id="about-toolkit-title">Meu cinto de utilidades:</h3>
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
        <p className="about-closing">Vamos construir algo novo hoje?</p>
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
        <button type="button" className="info-panel__close" onClick={onClose}>
          Fechar
        </button>
        <p className="info-panel__label">Contato</p>
        <h2 id="contact-title">VAMOS CONVERSAR.</h2>
        <p className="contact-message">
          Vamos construir algo incrível. Do código à conversão. Se você precisa
          tirar uma ideia do papel ou escalar um projeto existente, me mande uma
          mensagem. Escolha um canal abaixo e vamos conversar.
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

export default function InfoPanels({ activePanel, onClose }) {
  if (activePanel === 'sobre') return <AboutPanel onClose={onClose} />
  if (activePanel === 'contato') return <ContactPanel onClose={onClose} />
  return null
}
