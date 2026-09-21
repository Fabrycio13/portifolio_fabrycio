<div align="center">
  <img src="./public/readme-banner.webp" alt="Banner do portfólio de Fabrycio Bermudes" width="760" />

  <h1>Fabrycio Bermudes</h1>
  <p><strong>Software Engineer · Produtos web · Automação · Experiências digitais</strong></p>
  <p>
    <a href="https://fabrycio.vercel.app/">Ver portfólio ao vivo</a>
  </p>
</div>

## Sobre o projeto

Este repositório contém o portfólio imersivo de **Fabrycio Bermudes**. A experiência apresenta serviços, projetos de software e canais de contato em uma aplicação visual, responsiva e orientada a movimento.

O projeto combina navegação suave, tipografia animada, seções sticky, cards de projetos, dialogs preservando a cena e um footer com ondas renderizadas em canvas. Serviços, Projetos e Footer são carregados por proximidade do viewport para manter o primeiro carregamento mais enxuto.

## Experiência

- Hero visual com imagem WebP e fallback em PNG.
- Navegação suave com Lenis.
- Serviços e Projetos com animações sincronizadas ao scroll.
- Cards sticky controlados por GSAP e ScrollTrigger.
- Painéis de Sobre, Contato e detalhes dos projetos importados diretamente para evitar flash visual na primeira abertura.
- Serviços, Projetos e Footer separados em chunks e carregados por `DeferredSection`.
- Footer com ondas animadas em canvas e imagem otimizada.
- Tipografia interativa com `WarpText`, `DecryptedText` e `BlurText`.
- Layout responsivo para desktop e dispositivos móveis.
- Interações acessíveis por teclado, incluindo foco inicial, `Tab`, `Escape` e retorno ao gatilho.

## Projetos apresentados

| Projeto | Área |
| --- | --- |
| **People** | Recrutamento e seleção com inteligência artificial |
| **Gestão condominial com IA** | Plataforma web confidencial |
| **PHX / MDS** | Laudos e análise de crédito imobiliário |
| **Nexus AI** | Embeddings, RAG e orquestração de agentes |

## Tecnologias

- React `19.2.0`
- Vite `8.2.2`
- JavaScript/JSX
- GSAP `3.15.0` e ScrollTrigger
- Lenis
- OGL/WebGL
- Motion
- React Icons
- Oxlint `1.79.0`

## Estrutura do repositório

```text
.github/
├── workflows/                    # CI
└── ISSUE_TEMPLATE/               # templates de issue

docs/
├── architecture.md               # limites e responsabilidades
├── development.md                # comandos e processo local
├── decisions/                    # decisões arquiteturais
├── performance-baseline.md       # baseline de performance
└── security/audits/              # auditorias históricas

public/
├── icons/                        # favicons e marcas
└── images/
    ├── hero/                     # imagem do primeiro viewport
    ├── footer/                   # imagem e fallback do footer
    └── projects/                 # imagens dos projetos

src/
├── App.jsx                       # shell, navegação e composição
├── App.css                       # layout global e fallbacks
├── index.css                     # reset, fontes e documento
├── components/
│   ├── effects/                  # efeitos visuais reutilizáveis
│   └── panels/                   # dialogs e detalhes de projetos
├── sections/                     # Serviços, Projetos e Footer
├── layouts/                      # boundaries de carregamento
├── data/                         # dados estáticos da interface
└── utils/                        # utilitários de acessibilidade

tests/unit/                      # contratos de regressão
scripts/                          # auditorias e ferramentas
```

## Executar localmente

### Requisitos

- Node.js `20.19+` ou `22.12+`
- npm
- Chrome local somente para a auditoria de performance

### Instalação e desenvolvimento

```bash
npm ci
npm run dev
```

O Vite exibirá a URL local no terminal. Não presuma a porta: use a URL informada pelo próprio processo.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run lint` | Executa o Oxlint. |
| `npm test` | Executa os contratos em `tests/unit/` com o runner nativo do Node. |
| `npm run build` | Gera a build de produção em `dist/`. |
| `npm run preview` | Serve a build de produção localmente. |
| `npm run perf:audit` | Executa a auditoria de performance usando Chrome e a URL padrão do script. |

### Validação local

Gates obrigatórios:

```bash
npm test
npm run lint
npm run build
git diff --check
```

Para validar a experiência na build real:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Em outro terminal, use a URL realmente exibida pelo preview:

```bash
node scripts/perf-audit.mjs http://127.0.0.1:4173/ --duration-ms=5000
node scripts/perf-audit.mjs http://127.0.0.1:4173/ --projects --duration-ms=5000
node scripts/perf-audit.mjs http://127.0.0.1:4173/ --footer --duration-ms=5000
```

A auditoria mede FPS, long tasks, erros de runtime, canvases, imagens, placeholders e os contratos observáveis dos cards de projetos.

## Testes e limites atuais

Os contratos em `tests/unit/portfolio-contract.test.mjs` verificam:

- operação de teclado dos cards de projetos;
- foco inicial, `Tab`, `Escape` e retorno de foco dos dialogs;
- copy pública e os cinco canais de contato;
- copy do projeto Gestão Condominial com IA;
- ausência do fluxo legado de vídeo;
- tap highlight transparente nos elementos interativos.

O repositório atualmente não possui:

- script de TypeScript ou `typecheck`;
- testes de integração;
- testes E2E versionados;
- backend, banco de dados ou autenticação;
- Husky ou hooks locais de commit.

Essas áreas não devem ser simuladas na documentação nem criadas apenas para completar a árvore do projeto.

## Estratégia de carregamento e performance

- Serviços, Projetos e Footer usam `React.lazy` dentro de `DeferredSection`.
- Fallbacks estruturais preservam a geometria das seções e reduzem layout shift.
- Sobre, Contato e detalhes dos projetos são imports diretos para evitar flash visual na primeira abertura.
- Cards e dados de projetos ficam separados entre `src/data/` e `src/components/panels/`.
- Imagens prioritárias usam WebP com fallback compatível.
- Imagens fora do primeiro viewport usam carregamento lazy.
- As métricas de performance devem ser repetidas após mudanças em animações, assets, scroll, canvas ou lazy loading; números antigos não são tratados como garantia permanente.

## Deploy

O projeto gera uma aplicação estática compatível com plataformas que suportam Vite.

Para validar localmente:

```bash
npm run build
npm run preview
```

Na Vercel:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Deploy:** use a integração nativa da Vercel conectada ao repositório e à branch de produção configurada no painel da Vercel.
- Não é necessário manter um workflow customizado de deploy ou secrets da Vercel no GitHub Actions.

## Documentação adicional

- `AGENTS.md`: regras de trabalho para agentes e colaboradores automatizados.
- `CONTRIBUTING.md`: fluxo local e convenções de contribuição.
- `docs/architecture.md`: responsabilidades e limites da arquitetura.
- `docs/development.md`: comandos e processo de desenvolvimento.
- `docs/decisions/`: decisões arquiteturais versionadas.
- `docs/performance-baseline.md`: método e critérios da auditoria de performance.

## Autor

**Fabrycio Bermudes** - Software Engineer

- Portfólio: [fabrycio.vercel.app](https://fabrycio.vercel.app/)
- GitHub: [Fabrycio13](https://github.com/Fabrycio13)
