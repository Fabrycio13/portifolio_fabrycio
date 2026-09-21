<div align="center">
  <img src="./public/readme-banner.webp" alt="Banner do portfólio de Fabrycio Bermudes" width="760" />

  <h1>Fabrycio Bermudes</h1>
  <p><strong>Software Engineer · Produtos web · Automação · Experiências digitais</strong></p>
  <p>
    <a href="https://fabrycio.vercel.app/">Ver portfólio ao vivo</a>
  </p>
</div>

## Sobre o projeto

Este repositório contém o portfólio imersivo de **Fabrycio Bermudes**. A experiência foi construída para apresentar projetos de software, serviços e formas de contato em uma interface visual, responsiva e orientada a movimento.

O projeto combina navegação suave, tipografia animada, seções sticky, cards de projetos e um footer com ondas renderizadas em canvas — mantendo o carregamento inicial enxuto por meio de divisão de código e carregamento sob demanda.

## Experiência

- Hero visual com imagem WebP e fallback em PNG.
- Navegação suave com Lenis.
- Serviços e Projetos com animações sincronizadas ao scroll.
- Cards sticky controlados por GSAP e ScrollTrigger.
- Painéis pequenos de Sobre, Contato e detalhes dos projetos importados diretamente para evitar flash visual na primeira abertura.
- Serviços, Projetos e Footer separados em chunks carregados por proximidade do viewport.
- Footer com ondas animadas em canvas e imagem otimizada.
- Tipografia interativa com `WarpText`, `DecryptedText` e `BlurText`.
- Layout responsivo para desktop e dispositivos móveis.

## Projetos apresentados

| Projeto | Área |
| --- | --- |
| **People** | Recrutamento e seleção com inteligência artificial |
| **Gestão condominial com IA** | Plataforma web confidencial |
| **PHX / MDS** | Laudos e análise de crédito imobiliário |
| **Nexus AI** | Embeddings, RAG e orquestração de agentes |

## Tecnologias

- React 19
- Vite 8
- GSAP e ScrollTrigger
- Lenis
- OGL/WebGL
- Motion
- React Icons
- Oxlint

## Executar localmente

### Requisitos

- Node.js 20.19+ ou 22.12+
- npm

### Instalação

```bash
npm install
npm run dev
```

O Vite exibirá a URL local no terminal, normalmente `http://localhost:5173`.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run lint` | Executa o Oxlint. |
| `npm test` | Executa os testes de contrato com o runner nativo do Node. |
| `npm run build` | Gera a build de produção em `dist/`. |
| `npm run preview` | Serve a build de produção localmente. |
| `npm run perf:audit` | Mede FPS, long tasks, canvases e erros de runtime no Chrome. |

Validação completa antes de publicar:

```bash
npm test
npm run lint
npm run build
npm run perf:audit
```

A auditoria de performance requer uma instalação local do Chrome. Para testar outra URL ou duração:

```bash
node scripts/perf-audit.mjs http://127.0.0.1:4173/ --duration-ms=5000
```

## Arquitetura

```text
src/
├── App.jsx                         # Shell, navegação e composição
├── App.css                         # Layout global e fallbacks estruturais
├── components/
│   ├── effects/                    # BlurText, DecryptedText e WarpText
│   └── panels/                     # Sobre, Contato e detalhes de projetos
├── sections/                       # Serviços, Projetos e Footer
├── layouts/                        # Carregamento estrutural de seções
├── data/                           # Cards de projetos e serviços
├── utils/                          # Utilitários de acessibilidade
├── index.css                       # Estilos base e fontes
└── main.jsx                        # Entrada do React

public/
├── icons/                         # Favicons e marcas
├── images/
│   ├── hero/                      # Imagem otimizada e fallback do hero
│   ├── footer/                    # Imagem otimizada e fallback do footer
│   └── projects/                  # Imagens dos projetos
└── readme-banner.webp             # Banner usado nesta documentação

tests/
└── unit/portfolio-contract.test.mjs

scripts/
└── perf-audit.mjs             # Auditoria automatizada no Chrome
```

## Estratégia de performance

O primeiro viewport não precisa carregar toda a experiência de uma vez:

- Serviços, Projetos e Footer usam `React.lazy` dentro de `DeferredSection`.
- Cards e detalhes dos projetos ficam separados entre `src/data/` e `src/components/panels/`.
- Sobre, Contato e detalhes dos projetos são importados diretamente para evitar flash na primeira abertura.
- Fallbacks preservam a altura das seções e evitam layout shift.
- Imagens prioritárias usam WebP com fallback compatível.
- Imagens fora do primeiro viewport usam carregamento lazy.

A build validada mantém o bundle JavaScript principal abaixo do limite de alerta do Vite:

```text
Bundle principal: 404,19 KB
Gzip:             127,15 KB
```

As auditorias recentes registraram aproximadamente 60 FPS nas áreas principais, sem long tasks ou runtime issues.

## Deploy

O projeto é compatível com plataformas que suportam Vite. Para validar uma build localmente:

```bash
npm run build
npm run preview
```

Na Vercel:

- **Build command:** `npm run build`
- **Output directory:** `dist`

## Autor

**Fabrycio Bermudes** — Software Engineer

- Portfólio: [fabrycio.vercel.app](https://fabrycio.vercel.app/)
- GitHub: [Fabrycio13](https://github.com/Fabrycio13)
