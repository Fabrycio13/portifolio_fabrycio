import {
  FaBrain,
  FaColumns,
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
    detail: 'USABIT PEOPLE',
    description: 'O Usabit People é uma plataforma web que ajuda equipes de RH a organizar o recrutamento, desde a publicação de uma vaga até o acompanhamento dos candidatos.',
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
      { label: 'IA', stack: 'Engenharia de prompt customizada' },
    ],
  },
  '02': {
    title: 'CINDY - GESTÃO CONDOMINIAL',
    detail: 'PLATAFORMA WEB',
    description: 'A Cindy é uma plataforma completa para administração de condomínios, centralizando em um único sistema a gestão de moradores, unidades, veículos, vagas de garagem, encomendas, ocorrências e espaços compartilhados. Utiliza IA para automatizar o cadastro de veículos e registro de encomendas.',
    features: [
      { icon: FaTachometerAlt, text: 'Dashboard com indicadores' },
      { icon: FaUsers, text: 'Gestão de moradores' },
      { icon: FaCar, text: 'Controle de veículos e vagas' },
      { icon: FaBox, text: 'Registro de encomendas' },
      { icon: FaComments, text: 'Chat e comunicados' },
      { icon: FaVoteYea, text: 'Assembleias digitais' },
    ],
    technologies: [
      { label: 'Front-end', stack: 'React, TypeScript, Vite, Tailwind CSS' },
      { label: 'Back-end', stack: 'Supabase (Auth, PostgreSQL, Storage)' },
      { label: 'Infraestrutura', stack: 'Supabase Edge Functions' },
      { label: 'Integrações', stack: 'Webhooks, n8n, WhatsApp, APIs externas' },
    ],
  },
  '03': {
    title: 'PHX / MDS CRÉDITO IMOBILIÁRIO',
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

export default function ProjectDetailsPanel({ projectNumber, onClose }) {
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
        <button type="button" className="info-panel__close" onClick={onClose}>
          Fechar
        </button>
        <p className="info-panel__label">{project.detail}</p>
        <h2 id={`project-title-${projectNumber}`}>{project.title}</h2>
        <p>{project.description}</p>
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
      </div>
    </aside>
  )
}
