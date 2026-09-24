import {
  FaBrain,
  FaColumns,
  FaCog,
  FaGlobe,
  FaDatabase,
  FaChartBar,
  FaShieldAlt,
  FaCode,
  FaFileAlt,
  FaTachometerAlt,
  FaUsers,
  FaCar,
  FaBox,
  FaComments,
  FaVoteYea,
} from 'react-icons/fa'

const projectDetails = {
  '01': {
    title: 'RH COM INTELIGÊNCIA ARTIFICIAL',
    detail: 'GERENCIADOR DE RECURSOS HUMANOS',
    description: 'O People é uma plataforma web que ajuda equipes de RH a organizar o recrutamento, desde a publicação de uma vaga até o acompanhamento dos candidatos.',
    features: [
      { icon: FaBrain, text: 'Análise de currículos com IA' },
      { icon: FaColumns, text: 'Pipeline Kanban' },
      { icon: FaGlobe, text: 'Portal de carreiras público' },
      { icon: FaDatabase, text: 'Banco de talentos' },
      { icon: FaChartBar, text: 'Dashboards de indicadores' },
      { icon: FaShieldAlt, text: 'Controle de acesso (RBAC)' },
    ],
    technologies: [
      { label: 'Front-end', stack: 'React, TypeScript, Vite, Tailwind CSS' },
      { label: 'Back-end', stack: 'Supabase (Auth, PostgreSQL, Storage)' },
      { label: 'Infraestrutura', stack: 'Supabase Edge Functions' },
      { label: 'IA', stack: 'Prompts estruturados para análise inteligente de currículos' },
    ],
  },
  '02': {
    title: 'GESTÃO CONDOMINIAL COM IA',
    detail: 'ADMINISTRAÇÃO DE CONDOMÍNIOS',
    description: [
      'Uma plataforma web criada para centralizar a administração de condomínios em um único ambiente, reunindo moradores, unidades, veículos, vagas, encomendas, ocorrências e espaços compartilhados.',
      'A solução também utiliza IA e integrações automatizadas para agilizar o cadastro de veículos e o registro de encomendas.',
    ],
    features: [
      { icon: FaTachometerAlt, text: 'Dashboard com indicadores' },
      { icon: FaUsers, text: 'Gestão de moradores e unidades' },
      { icon: FaCar, text: 'Controle de veículos e vagas' },
      { icon: FaBox, text: 'Registro de encomendas' },
      { icon: FaComments, text: 'Ocorrências, chat e comunicados' },
      { icon: FaGlobe, text: 'Gestão de espaços compartilhados' },
      { icon: FaVoteYea, text: 'Assembleias digitais' },
    ],
    technologies: [
      { label: 'Front-end', stack: 'React, TypeScript, Vite, Tailwind CSS' },
      { label: 'Back-end & Dados', stack: 'Supabase, Auth, PostgreSQL e Storage' },
      { label: 'Infraestrutura', stack: 'Supabase Edge Functions' },
      { label: 'IA & Integrações', stack: 'Automação do cadastro de veículos, registro de encomendas, Webhooks, n8n, WhatsApp e APIs externas' },
    ],
  },
  '03': {
    title: 'LAUDO DE CRÉDITO IMOBILIÁRIO',
    detail: 'GERADOR DE LAUDOS · ANÁLISE DE CRÉDITO',
    description: 'O Projeto PHX / MDS Crédito Imobiliário é uma aplicação frontend para gerar laudos de análise de crédito imobiliário. Enquanto os dados são preenchidos, o sistema atualiza um preview visual do documento, permitindo gerar e baixar o laudo em PDF.',
    features: [
      { icon: FaFileAlt, text: 'Dados do imóvel e empreendimento' },
      { icon: FaUsers, text: 'Proponentes, renda e documentos' },
      { icon: FaChartBar, text: 'Financiamento, subsídio e FGTS' },
      { icon: FaDatabase, text: 'PRICE/SAC, juros, prazo e cotas' },
      { icon: FaGlobe, text: 'Preview do laudo em tempo real' },
      { icon: FaCode, text: 'Geração de PDF' },
    ],
    technologies: [
      { label: 'Front-end', stack: 'HTML, CSS e JavaScript puro' },
      { label: 'Build', stack: 'Vite para desenvolvimento e produção' },
      { label: 'PDF', stack: 'jsPDF e html2canvas' },
      { label: 'Formulários', stack: 'Flatpickr para campos de data' },
      { label: 'Arquitetura', stack: 'Aplicação frontend estática, sem backend próprio' },
    ],
  },
  '04': {
    title: 'NEXUS AI - ORQUESTRAÇÃO DE IA',
    detail: 'EMBEDDINGS · RAG · AGENTES DE IA',
    description: 'O Nexus AI é um laboratório de processos inteligentes que conecta dados, modelos de linguagem e automações em um único fluxo. O sistema transforma documentos em embeddings, busca o contexto mais relevante e orquestra diferentes agentes para classificar, responder, validar e executar tarefas.',
    features: [
      { icon: FaFileAlt, text: 'Processamento e fragmentação de documentos' },
      { icon: FaDatabase, text: 'Embeddings e busca semântica' },
      { icon: FaBrain, text: 'Fluxos de RAG com contexto' },
      { icon: FaComments, text: 'Roteamento entre modelos e agentes' },
      { icon: FaCode, text: 'Integração com APIs e webhooks' },
      { icon: FaShieldAlt, text: 'Validação, fallback e monitoramento' },
    ],
    technologies: [
      { label: 'Backend', stack: 'Python e FastAPI' },
      { label: 'Modelos', stack: 'OpenAI API para embeddings e LLMs' },
      { label: 'Banco vetorial', stack: 'Supabase, PostgreSQL e pgvector' },
      { label: 'Orquestração', stack: 'LangChain e LangGraph' },
      { label: 'Automações', stack: 'n8n, webhooks e APIs externas' },
      { label: 'Infraestrutura', stack: 'Docker para execução dos serviços' },
    ],
  },
}

export default function ProjectDetailsPanel({ projectNumber, onClose, onOpenDemo, onOpenGallery }) {
  const project = projectDetails[projectNumber]

  if (!project) return null

  return (
    <aside
      id={`projeto-${projectNumber}`}
      className="info-panel is-open"
      role="dialog"
      aria-modal="true"
      aria-hidden="false"
      aria-labelledby={`project-title-${projectNumber}`}
    >
      <button
        type="button"
        className="info-panel__backdrop"
        onClick={onClose}
        aria-label={`Fechar ${project.title}`}
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
        <p className="info-panel__label">{project.detail}</p>
        <h2 id={`project-title-${projectNumber}`}>{project.title}</h2>
        {Array.isArray(project.description)
          ? project.description.map((paragraph, index) => (
            <p className="project-description" key={`${projectNumber}-description-${index}`}>
              {paragraph}
            </p>
          ))
          : <p className="project-description">{project.description}</p>}
        {projectNumber === '01' && (
          <button type="button" className="project-gallery-preview" onClick={onOpenGallery}>
            <img
              src="/images/projects/people/people-dashboard.webp"
              alt="Dashboard da plataforma People com indicadores de recrutamento"
            />
            <span className="project-gallery-preview__veil">
              <span>7 TELAS DO PRODUTO</span>
              <strong>VER TELAS DO PROJETO</strong>
            </span>
          </button>
        )}
        {projectNumber === '03' && (
          <button type="button" className="project-gallery-preview project-gallery-preview--phx" onClick={() => onOpenGallery('phx')}>
            <img
              src="/images/projects/phx/phx-form-preview.webp"
              alt="Tela de preenchimento e preview do laudo PHX e MDS Crédito Imobiliário"
            />
            <span className="project-gallery-preview__veil">
              <span>3 TELAS DO PRODUTO</span>
              <strong>VER TELAS DO PROJETO</strong>
            </span>
          </button>
        )}
        {projectNumber === '02' && (
          <button type="button" className="project-gallery-preview project-gallery-preview--cindy" onClick={() => onOpenGallery('cindy')}>
            <img
              src="/images/projects/cindy/dashboard.webp"
              alt="Dashboard da plataforma Cindy com indicadores de gestão condominial"
            />
            <span className="project-gallery-preview__veil">
              <span>6 TELAS DA DEMO</span>
              <strong>VER TELAS DO PROJETO</strong>
            </span>
          </button>
        )}
        {projectNumber === '04' && (
          <button type="button" className="project-gallery-preview project-gallery-preview--nexus" onClick={() => onOpenGallery('nexus')}>
            <img
              src="/images/projects/project-04.webp"
              alt="Fluxo de orquestração da plataforma Nexus AI"
            />
            <span className="project-gallery-preview__veil">
              <span>4 TELAS DO PRODUTO</span>
              <strong>VER TELAS DO PROJETO</strong>
            </span>
          </button>
        )}
        <ul className="project-features">
          {project.features.map((feature, index) => {
            const Icon = feature.icon
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
          {project.technologies.map((technology, index) => (
            <div key={index} className="project-tech__item">
              <span className="project-tech__label">{technology.label}</span>
              <span className="project-tech__stack">{technology.stack}</span>
            </div>
          ))}
        </div>
        {projectNumber === '03' && (
          <button type="button" className="about-contact-cta project-demo-cta" onClick={() => onOpenDemo(projectNumber)}>
            <FaCog className="about-contact-cta__icon" aria-hidden="true" />
            <span>ABRIR DEMO DO LAUDO</span>
          </button>
        )}
        {projectNumber === '02' && (
          <button type="button" className="about-contact-cta project-demo-cta" onClick={() => onOpenDemo(projectNumber)}>
            <FaCog className="about-contact-cta__icon" aria-hidden="true" />
            <span>ABRIR DEMO DA CINDY</span>
          </button>
        )}
        {projectNumber === '04' && (
          <button type="button" className="about-contact-cta project-demo-cta" onClick={() => onOpenDemo(projectNumber)}>
            <FaCog className="about-contact-cta__icon" aria-hidden="true" />
            <span>TESTAR DEMO INTERATIVA</span>
          </button>
        )}
      </div>
    </aside>
  )
}
