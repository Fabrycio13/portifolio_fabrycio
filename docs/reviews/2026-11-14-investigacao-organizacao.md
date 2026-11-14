# Investigação de organização do repositório — 14/11/2026

> **Relatório histórico.** Resumo fiel do levantamento somente leitura feito durante a revisão arquitetural, no snapshot `7f53175`. Os caminhos e números de linha valem para aquele commit.

## Errata

O levantamento original afirmou que **não existia a branch `main`**, nem local nem remota. **Isso estava errado.** O clone local busca só `feat/adaptive-video-performance`, e por isso a `main` não aparecia. No GitHub, `main` existe, é a branch padrão e é a origem dos deploys de produção na Vercel (último: `814cb2a`, merge do PR 20). Ver o [contexto verificado](../specs/README.md#contexto-verificado-14112026).

## 1. Arquivos sem referência em runtime

Cada um foi confirmado por grep no repositório inteiro, excluindo `node_modules`, `dist` e `.git`.

| Arquivo | Situação |
|---|---|
| `src/assets/hero.png`, `react.svg`, `vite.svg` | Nenhuma referência. O hero real vem de `/images/hero/` |
| `docs/logo/logos.png` (2,3 MB) | Nenhuma referência. **Mantido** por decisão do mantenedor (material de marca) |
| `public/images/projects/project-01.webp`, `-02`, `-03` | Referenciados só pelos campos `image`/`alt` de `src/data/projects.js` (linhas 9, 19, 29) e pelos testes. Nada lê `project.image` nem `project.alt`. `project-04.webp` **é usado** como prévia da galeria Nexus |
| `public/readme-banner.webp` | Usado só pelo `README.md` |
| `.hermes/plans/2026-09-10_…md` | Versionado e não citado. Inspecionado depois: plano obsoleto do fluxo de vídeo removido |
| CSS morto em `src/App.css` | `.sticky-projects__stage`, `.projects__header`, `.sticky-projects__deck` e `.project-stack-card*` (cerca das linhas 414-737, 1322-1421 e 1483) não têm JSX correspondente |

## 2. CSS e seus consumidores

- `App.jsx` importa `App.css`; `main.jsx` importa `index.css`; `WarpText.jsx` importa `WarpText.css`. Cada seção (`Sticky*`, `WaveFooter`) importa o próprio par.
- `CindyGalleryPanel`, `PhxGalleryPanel` e `NexusGalleryPanel` importam `./PeopleGalleryPanel.css` mais um arquivo próprio de tema (cerca de 35 linhas). As quatro galerias usam as classes `people-gallery__*` como base.
- `CindyDemoPanel.css` e `PhxDemoPanel.css` (103 linhas cada) diferem só nas cores.
- `InfoPanels.jsx` e `ProjectDetailsPanel.jsx` não importam CSS próprio: os estilos `.info-panel*`, `.project-gallery-preview*`, `.about-*`, `.contact-link*`, `.project-features*` e `.project-tech*` vivem em `App.css`, entre as linhas 739 e 1210 mais blocos de media query.
- Os dialogs de demo reutilizam a classe `info-panel is-open` de `App.css`.

## 3. Dados fora de `src/data/`

| Onde | O quê |
|---|---|
| `App.jsx` | `menuItems` (30-35); mapeamento de ids de dialog por ternários (323-330); cópia do hero (197-279) |
| `ProjectDetailsPanel.jsx` | `projectDetails` (19-103), repetindo `title`/`detail` de `projects.js`; imagens, alt e contagens fixas das prévias (144-191); rótulos dos botões de demo (215-232) |
| Galerias | Arrays `screens`: People 5-41, Cindy 6-37, Phx 6-22, Nexus 6-27 |
| `NexusDemoPanel.jsx` | `flowNodes`, `executionEvents`, `traceSteps`, `navigationItems`, `sectionPages` (21-164) |
| `InfoPanels.jsx` | `aboutToolkit` (4-20), `contactLinks` (22-53) |
| `WaveFooter.jsx` | `socialIcons` (11-42), com as mesmas 5 URLs de `contactLinks` em outra ordem; `footerServices` (44) |
| Demos | URL de cada demo escrita duas vezes em cada dialog |

## 4. Lógica realmente repetida (critério estrito)

- Estado do carrossel da galeria (`useState(0)` + anterior/próximo circular): People 44-47, Phx 25-28, Cindy 40-43, Nexus 30-33. Os quatro arquivos são quase idênticos, exceto pelos dados e rótulos.
- `useLenis(() => ScrollTrigger.update())` em `StickyProjects:17` e `StickyServices:18`; `gsap.registerPlugin(useGSAP, ScrollTrigger)` nas três seções.
- `matchMedia('(prefers-reduced-motion: reduce)').matches` em `StickyServices:37`, `WaveFooter:100` e `WarpText:318` e `468`.
- `IntersectionObserver` aparece em 6 arquivos, cada um com semântica diferente; não conta como padrão repetido.

## 5. Nomenclatura

- Componentes em PascalCase `.jsx`, com `.css` pareado quando existe. `InfoPanels.jsx` (no plural) contém `AboutPanel` e `ContactPanel`. A classe-base `people-gallery` é usada por todas as galerias.
- **"Panel" × "Dialog":** o código sempre diz Panel (`info-panel`, pasta `panels/`); a documentação diz "dialogs" (`AGENTS.md`, README, `docs/architecture.md`, ADR 0001); os testes misturam os dois.
- **Idioma:** ids em português (`'sobre'`, `'contato'`, `#servicos`, `#projetos`, `projeto-${n}`), identificadores em inglês no resto. Os nomes de assets também misturam. Um mesmo projeto tem três nomes: Cindy (código, pasta, HTML), "Gestão condominial" (cópia) e `condominio` (logo).
- **Ids numéricos `'01'`–`'04'`:** `projects.js`, `services.js`, `ProjectDetailsPanel`, `App.jsx`, `StickyProjects` e testes.
- **Ids por nome** (`cindy-demo`, `phx-gallery`, `'phx'`, `'cindy'`, `'nexus'`): `App.jsx`, `ProjectDetailsPanel` e testes.
- Inconsistência em `ProjectDetailsPanel:145`: o botão da People usa `onClick={onOpenGallery}`, passa o evento de clique e só chega a `'people-gallery'` pelo fallback do ternário em `App.jsx:328`.

## 6. Testes

Os 24 testes leem arquivos estáticos e aplicam regex; nenhum renderiza ou executa comportamento.

- **Agrupados pelo que fixam:** cópia de texto; regex de CSS; strings de implementação (por exemplo, `const x = index % 2 ? leftRail : rightRail` e exatamente um `<svg`); ligações (linhas de import exatas, ids de `activePanel`); dados e assets (incluindo os bytes do cabeçalho RIFF dos logos).
- **Quebrariam num refactor puro, sem mudança de comportamento:**
  - mover dados para fora dos componentes (por exemplo, a contagem de `label: '` == 5 em `InfoPanels`);
  - dividir `InfoPanels`;
  - renomear ou mover arquivos (todo teste lê um caminho fixo);
  - mover CSS (regex sobre `App.css` e `PeopleGalleryPanel.css`);
  - renomear ids.

## 7. Divergências na documentação

- `AGENTS.md`, README e `docs/architecture.md` listam os dialogs como Sobre/Contato/detalhes; os 3 dialogs de demo e os 4 de galeria não aparecem. O `AGENTS.md` também omite `public/*.html`, `readme-banner.webp` e `services-transition.png`.
- `AGENTS.md`, README e `docs/development.md` dizem que os testes cobrem "foco inicial, Tab, Escape e retorno de foco", mas eles só procuram strings no código. A maioria dos 24 testes não está listada.
- `AGENTS.md` e `CONTRIBUTING.md` dizem que cópia e dados estáticos ficam em `src/data/`, o que contradiz o código.
- A linha do `AGENTS.md` §10 "Nesta tarefa, não crie arquivos auxiliares…" é sobra de uma tarefa anterior.
- As afirmações sobre `.husky` são corretas: não existe `.husky`.
- Não há `vercel.json`. O CI (`.github/workflows/ci.yml`) roda test, lint e build em todas as branches.
- A porta do preview diverge: 5182 (padrão do script e `AGENTS.md`), 4173 (README e `docs/development.md`) e 5187 (`docs/performance-baseline.md`).
- `docs/architecture.md` diz que `public/` contém só recursos servidos ao navegador, mas `readme-banner.webp` é usado apenas pelo README.

## 8. Arquivos com mais de 300 linhas

| Arquivo | Linhas | Responsabilidades misturadas |
|---|---:|---|
| `src/App.css` | 1498 | Global, hero, header, navegação, fallbacks, estilos de Info/ProjectDetails e CSS morto do deck |
| `src/components/panels/NexusDemoPanel.css` | 1146 | Uma UI de demo inteira |
| `src/components/effects/WarpText.jsx` | 559 | Shaders GLSL, layout de texto em canvas, renderer OGL e observers |
| `src/components/panels/NexusDemoPanel.jsx` | 474 | Dados mock, subcomponente `NexusSection`, simulação temporizada e UI |
| `src/App.jsx` | 406 | Dados de navegação, `AnimatedMenuLink`, scroll do header, focus trap e `Escape`, roteamento de dialogs, markup do hero |
| `src/components/effects/DecryptedText.jsx` | 387 | Efeito no estilo de terceiros |
| `src/sections/StickyProjects.css` | 383 | |
| `src/sections/WaveFooter.jsx` | 357 | Dados sociais, desenho da onda em canvas, GSAP e markup |
| `tests/unit/portfolio-contract.test.mjs` | 344 | |
| `src/sections/StickyServices.css` | 341 | |
| `public/nova-cindy-mockup-v2.html` / `public/phx-demo.html` | 924 / 452 | Demos autocontidas |

## Destino

Os itens 1, 3 (projetos e galerias), 4 (galeria), 5 e 6 alimentaram a [Spec 0001](../specs/0001-registro-projetos-dialogs-galeria.md). O item 3 (contato, menu, toolkit, footer e Nexus) alimentou a [Spec 0002](../specs/0002-dados-estaticos.md). O CSS (itens 1 e 2) foi adiado. As divergências do item 7 são corrigidas na etapa 9 da Spec 0001 e na Etapa 0 da Spec 0003.
