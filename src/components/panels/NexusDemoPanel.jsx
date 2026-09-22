import {
  FaArrowLeft,
  FaBookOpen,
  FaCheck,
  FaClock,
  FaCog,
  FaDatabase,
  FaFileAlt,
  FaLayerGroup,
  FaPlay,
  FaProjectDiagram,
  FaRobot,
  FaSave,
  FaSearch,
  FaShieldAlt,
  FaTimes,
} from 'react-icons/fa'
import { useEffect, useRef, useState } from 'react'
import './NexusDemoPanel.css'

const flowNodes = [
  {
    key: 'input',
    code: 'IN',
    title: 'Entrada de documentos',
    subtitle: 'PROCESSAR · PDF/DOCX',
    metric: '34 páginas',
    status: 'Recebido',
    tone: 'blue',
    Icon: FaFileAlt,
  },
  {
    key: 'chunks',
    code: 'TX',
    title: 'Extração e chunking',
    subtitle: 'SPLITTER RECURSIVO',
    metric: '128 trechos',
    status: 'Concluído',
    tone: 'neutral',
    Icon: FaLayerGroup,
  },
  {
    key: 'embeddings',
    code: 'EM',
    title: 'Gerar embeddings',
    subtitle: 'EMBED · 1536 DIM',
    metric: '128 / 128',
    status: 'Concluído',
    tone: 'neutral',
    Icon: FaDatabase,
  },
  {
    key: 'rag',
    code: 'DB',
    title: 'Recuperação RAG',
    subtitle: 'PINECONE · HÍBRIDA',
    metric: 'Top 8',
    status: '94% relevância',
    tone: 'blue',
    Icon: FaSearch,
  },
  {
    key: 'agents',
    code: 'AI',
    title: 'Orquestrar agentes',
    subtitle: 'LANGGRAPH · 3 ROTAS',
    metric: '3 agentes · 4 ciclos',
    status: 'Aprovado',
    tone: 'orange',
    Icon: FaRobot,
  },
  {
    key: 'answer',
    code: 'OUT',
    title: 'Resposta estruturada',
    subtitle: 'JSON SCHEMA',
    metric: 'Confiança 94,2%',
    status: 'Entregue',
    tone: 'neutral',
    Icon: FaCheck,
  },
]

const executionEvents = [
  ['00:00.103', 'document.ingested', '34 documentos recebidos e validados', '102 ms'],
  ['00:00.406', 'retrieval.complete', 'Contexto recuperado na base vetorial', '1,2 s'],
  ['00:02.941', 'agent.validated', 'Saída verificada pelo agente crítico', '2,4 s'],
  ['00:04.127', 'response.delivered', 'Payload enviado ao webhook de destino', '265 ms'],
]

const traceSteps = [
  ['Ingestão concluída', '620 ms'],
  ['Contexto recuperado', '1,2 s'],
  ['Roteamento definido', '740 ms'],
  ['Resposta gerada', '2,4 s'],
  ['Validação aprovada', '165 ms'],
]

const navigationItems = [
  { id: 'flows', label: 'Fluxos', group: 'PRODUTO', Icon: FaProjectDiagram },
  { id: 'knowledge', label: 'Base de conhecimento', group: 'PRODUTO', Icon: FaDatabase },
  { id: 'agents', label: 'Agentes', group: 'PRODUTO', Icon: FaRobot },
  { id: 'observability', label: 'Observabilidade', group: 'PRODUTO', Icon: FaClock },
  { id: 'settings', label: 'Configurações', group: 'SISTEMA', Icon: FaCog },
  { id: 'docs', label: 'Documentação', group: 'SISTEMA', Icon: FaBookOpen },
]

const sectionPages = {
  knowledge: {
    eyebrow: 'CONHECIMENTO CONECTADO',
    title: 'Base de conhecimento',
    description: 'Documentos indexados e prontos para recuperação semântica pelos fluxos ativos.',
    stats: [['Documentos', '248'], ['Chunks', '3.842'], ['Sincronização', 'Saudável']],
    items: [
      ['Políticas operacionais', '84 documentos', 'Sincronizada há 4 min'],
      ['Contratos de fornecedores', '61 documentos', 'Sincronizada há 12 min'],
      ['Manuais técnicos', '103 documentos', 'Sincronizada há 18 min'],
    ],
  },
  agents: {
    eyebrow: 'ORQUESTRAÇÃO MULTIAGENTE',
    title: 'Agentes',
    description: 'Agentes especializados que analisam, validam e estruturam cada resposta.',
    stats: [['Ativos', '3'], ['Execuções hoje', '184'], ['Taxa de aprovação', '96,8%']],
    items: [
      ['Agente pesquisador', 'Recuperação e síntese', 'Ativo'],
      ['Agente crítico', 'Validação de evidências', 'Ativo'],
      ['Agente estruturador', 'Schema e resposta final', 'Ativo'],
    ],
  },
  observability: {
    eyebrow: 'RASTREAMENTO DE EXECUÇÕES',
    title: 'Observabilidade',
    description: 'Métricas, custos e rastreamento completo das execuções realizadas na plataforma.',
    stats: [['Disponibilidade', '99,98%'], ['Latência média', '3,9 s'], ['Tokens hoje', '482k']],
    items: [
      ['run_8a7b42', 'Análise documental', 'Concluída · 4,13 s'],
      ['run_8a7a91', 'Triagem de contratos', 'Concluída · 3,82 s'],
      ['run_8a79ef', 'Consulta de políticas', 'Concluída · 2,94 s'],
    ],
  },
  settings: {
    eyebrow: 'CONFIGURAÇÃO DO WORKSPACE',
    title: 'Configurações',
    description: 'Parâmetros da execução, modelos homologados e políticas de segurança.',
    stats: [['Modelo', 'GPT-4.1 mini'], ['Região', 'Brasil'], ['Fallback', 'Ativo']],
    items: [
      ['Modelos de linguagem', 'Principal e fallback', 'Configurado'],
      ['Banco vetorial', 'Pinecone · namespace produção', 'Conectado'],
      ['Políticas de segurança', 'Auditoria e revisão humana', 'Ativas'],
    ],
  },
  docs: {
    eyebrow: 'GUIAS DA PLATAFORMA',
    title: 'Documentação',
    description: 'Referências para configurar fontes, agentes, fluxos e integrações do Nexus AI.',
    stats: [['Guias', '18'], ['Referências', '42'], ['Versão', 'v2.8.4']],
    items: [
      ['Primeiros passos', 'Crie e execute seu primeiro fluxo', '6 min'],
      ['Recuperação RAG', 'Configure busca híbrida e evidências', '12 min'],
      ['Orquestração de agentes', 'Rotas, validação e fallback', '15 min'],
    ],
  },
}

function NexusSection({ section }) {
  return (
    <div className="nexus-demo-section-view">
      <header className="nexus-demo-page-heading nexus-demo-page-heading--section">
        <div>
          <span>{section.eyebrow}</span>
          <h2 id="nexus-demo-title">{section.title}</h2>
          <p>{section.description}</p>
        </div>
      </header>

      <div className="nexus-demo-section-content">
        <div className="nexus-demo-section-stats">
          {section.stats.map(([label, value]) => (
            <article key={label}><span>{label}</span><strong>{value}</strong></article>
          ))}
        </div>

        <section className="nexus-demo-section-list">
          <header><strong>{section.title}</strong><span>WORKSPACE · OPERAÇÕES INTERNAS</span></header>
          {section.items.map(([title, description, status]) => (
            <article key={title}>
              <span className="nexus-demo-section-list__icon"><FaCheck aria-hidden="true" /></span>
              <div><strong>{title}</strong><p>{description}</p></div>
              <small>{status}</small>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default function NexusDemoPanel({ onBack, onClose }) {
  const [activeStep, setActiveStep] = useState(flowNodes.length)
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState('Pipeline')
  const [activeSection, setActiveSection] = useState('flows')
  const timersRef = useRef([])

  const clearTimers = () => {
    timersRef.current.forEach(timer => window.clearTimeout(timer))
    timersRef.current = []
  }

  const runFlow = () => {
    clearTimers()
    setIsRunning(true)
    setActiveStep(0)

    flowNodes.slice(1).forEach((_, index) => {
      timersRef.current.push(window.setTimeout(() => {
        setActiveStep(index + 1)
      }, (index + 1) * 520))
    })

    timersRef.current.push(window.setTimeout(() => {
      setActiveStep(flowNodes.length)
      setIsRunning(false)
    }, flowNodes.length * 520))
  }

  useEffect(() => () => clearTimers(), [])

  const completedCount = isRunning ? activeStep : flowNodes.length
  const statusLabel = isRunning ? 'EXECUTANDO' : 'CONCLUÍDA'
  const activeNavigation = navigationItems.find(item => item.id === activeSection) ?? navigationItems[0]

  return (
    <aside
      id="nexus-demo"
      className="info-panel is-open nexus-demo-panel"
      role="dialog"
      aria-modal="true"
      aria-hidden="false"
      aria-labelledby="nexus-demo-title"
    >
      <div className="nexus-demo-app" data-lenis-prevent>
        <nav className="nexus-demo-nav" aria-label="Navegação da plataforma Nexus AI">
          <div className="nexus-demo-logo">
            <span className="nexus-demo-logo__mark" aria-hidden="true" />
            <span>
              <strong>NEXUS</strong>
              <small>AI ORCHESTRATION</small>
            </span>
          </div>

          <div className="nexus-demo-workspace-card">
            <span>WORKSPACE ATIVO</span>
            <strong><i /> Operações internas</strong>
          </div>

          <div className="nexus-demo-nav__group">
            <span>PRODUTO</span>
            {navigationItems.filter(item => item.group === 'PRODUTO').map(item => {
              const Icon = item.Icon
              return (
                <button
                  type="button"
                  className={activeSection === item.id ? 'is-active' : ''}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon /> {item.label}
                </button>
              )
            })}
          </div>

          <div className="nexus-demo-nav__group">
            <span>SISTEMA</span>
            {navigationItems.filter(item => item.group === 'SISTEMA').map(item => {
              const Icon = item.Icon
              return (
                <button
                  type="button"
                  className={activeSection === item.id ? 'is-active' : ''}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon /> {item.label}
                </button>
              )
            })}
          </div>

          <div className="nexus-demo-nav__footer">
            <span className="nexus-demo-local-badge">DEMO LOCAL · DADOS FICTÍCIOS</span>
            <button type="button" onClick={onBack}><FaArrowLeft /> Voltar ao projeto</button>
            <button type="button" onClick={onClose} data-dialog-initial-focus autoFocus>
              <FaTimes /> Fechar demo
            </button>
          </div>
        </nav>

        <div className="nexus-demo-product">
          <header className="nexus-demo-topbar">
            <div className="nexus-demo-breadcrumb">
              <span>{activeNavigation.label}</span>
              <span>/</span>
              <strong>{activeSection === 'flows' ? 'Análise documental' : 'Operações internas'}</strong>
            </div>
            <div className="nexus-demo-topbar__actions">
              <span className="nexus-demo-topbar__badge">DEMO INTERATIVA</span>
              <button type="button" className="nexus-demo-topbar__back" onClick={onBack}>
                <FaArrowLeft /> Voltar ao projeto
              </button>
              <span className="nexus-demo-service"><i /> Serviços operacionais</span>
              {activeSection === 'flows' && (
                <>
                  <button type="button"><FaSave /> Salvar versão</button>
                  <button type="button" className="nexus-demo-execute" onClick={runFlow} disabled={isRunning}>
                    <FaPlay /> {isRunning ? 'Executando' : 'Executar fluxo'}
                  </button>
                </>
              )}
            </div>
          </header>

          <main className="nexus-demo-main">
            {activeSection === 'flows' ? (
              <>
            <header className="nexus-demo-page-heading">
              <div>
                <span>ORQUESTRAÇÃO DE AGENTES</span>
                <h2 id="nexus-demo-title">Análise documental inteligente</h2>
                <p>Ingestão, recuperação semântica, validação e resposta em um fluxo rastreável.</p>
              </div>
              <dl>
                <div><dt>VERSÃO</dt><dd>v2.8.4</dd></div>
                <div><dt>ÚLTIMA EXECUÇÃO</dt><dd>há 2 min</dd></div>
                <div><dt>ESTADO</dt><dd className={isRunning ? 'is-running' : ''}>{isRunning ? 'Executando' : 'Saudável'}</dd></div>
              </dl>
            </header>

            <section className="nexus-demo-board">
              <div className="nexus-demo-canvas-column">
                <div className="nexus-demo-canvas-toolbar">
                  <div role="tablist" aria-label="Visualização do fluxo">
                    {['Pipeline', 'Execuções', 'Avaliações'].map(tab => (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab}
                        className={activeTab === tab ? 'is-active' : ''}
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="nexus-demo-zoom" aria-hidden="true"><button>−</button><button>+</button><button>⌗</button></div>
                </div>

                <div className="nexus-demo-canvas">
                  <span className="nexus-demo-canvas__label">FLUXO PRINCIPAL</span>
                  <div className="nexus-demo-flow" aria-label="Pipeline de análise documental">
                    {flowNodes.map((node, index) => {
                      const isDone = index < activeStep || !isRunning
                      const isActive = isRunning && index === activeStep
                      const Icon = node.Icon

                      return (
                        <div className="nexus-demo-node-wrap" key={node.key}>
                          <article className={`nexus-demo-node nexus-demo-node--${node.tone} ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}>
                            <header>
                              <span><Icon aria-hidden="true" /> {node.code}</span>
                              <div>
                                <strong>{node.title}</strong>
                                <small>{node.subtitle}</small>
                              </div>
                            </header>
                            <footer>
                              <span>{node.metric}</span>
                              <strong>{isActive ? 'Processando' : isDone ? node.status : 'Aguardando'}</strong>
                            </footer>
                          </article>
                          {index < flowNodes.length - 1 && (
                            <span className={`nexus-demo-link ${index < completedCount - 1 ? 'is-complete' : ''}`} aria-hidden="true">
                              <i />
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <aside className="nexus-demo-policy">
                    <FaShieldAlt aria-hidden="true" />
                    <span><strong>Política de validação ativa.</strong> Respostas sem evidência suficiente são interrompidas para revisão antes da entrega.</span>
                  </aside>
                </div>

                <div className="nexus-demo-events">
                  <header>
                    <strong>Eventos da execução</strong>
                    <span>run_8a7b42 · {Math.min(completedCount, flowNodes.length)} etapas concluídas</span>
                  </header>
                  <div className="nexus-demo-events__table">
                    {executionEvents.map((event, index) => (
                      <div className={index + 1 <= completedCount ? 'is-visible' : ''} key={event[1]}>
                        <code>{event[0]}</code>
                        <strong>{event[1]}</strong>
                        <span>{event[2]}</span>
                        <small>{event[3]}</small>
                        <b>{index + 1 <= completedCount ? 'OK' : '—'}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="nexus-demo-inspector">
                <section className="nexus-demo-inspector__status">
                  <header><strong>Execução atual</strong><span>{statusLabel}</span></header>
                  <p>{isRunning ? 'Os agentes estão processando a execução passo a passo.' : 'Configuração, desempenho e rastreabilidade da última passagem pelo fluxo.'}</p>
                </section>

                <section>
                  <h3>CONFIGURAÇÃO</h3>
                  <dl className="nexus-demo-config">
                    <div><dt>Modelo principal</dt><dd>GPT-4.1 mini</dd></div>
                    <div><dt>Estratégia RAG</dt><dd>Busca híbrida</dd></div>
                    <div><dt>Banco vetorial</dt><dd>Pinecone · namespace</dd></div>
                    <div><dt>Fallback</dt><dd>Agente crítico</dd></div>
                  </dl>
                </section>

                <section>
                  <h3>DESEMPENHO</h3>
                  <div className="nexus-demo-metrics">
                    <article><span>Latência total</span><strong>{isRunning ? '—' : '4.13 s'}</strong></article>
                    <article><span>Confiança</span><strong>{isRunning ? '—' : '94.2%'}</strong></article>
                    <article><span>Contextos</span><strong>8 chunks</strong></article>
                    <article><span>Tokens</span><strong>3.8k</strong></article>
                  </div>
                </section>

                <section>
                  <h3>RASTREAMENTO</h3>
                  <ol className="nexus-demo-trace">
                    {traceSteps.map((step, index) => (
                      <li className={index < completedCount ? 'is-complete' : ''} key={step[0]}>
                        <i />
                        <span>{step[0]}</span>
                        <small>{index < completedCount ? step[1] : '—'}</small>
                      </li>
                    ))}
                  </ol>
                </section>

                <aside className="nexus-demo-review-note">
                  <strong>Revisão segura.</strong> O sistema preserva evidências, logs e fallback para auditoria humana.
                </aside>
              </aside>
            </section>
              </>
            ) : (
              <NexusSection section={sectionPages[activeSection]} />
            )}
          </main>
        </div>
      </div>
    </aside>
  )
}
