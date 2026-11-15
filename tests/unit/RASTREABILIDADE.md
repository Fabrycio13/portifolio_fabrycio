# Rastreabilidade dos testes — Spec 0001

Registro obrigatório da [Spec 0001 §3](../../docs/specs/0001-registro-projetos-dialogs-galeria.md#3-testes): toda asserção antiga removida ou alterada aponta para a regra que protegia e para o teste que passou a protegê-la. Nenhuma regra fica sem cobertura.

Arquivo de origem das asserções antigas: `tests/unit/portfolio-contract.test.mjs` (abreviado como **contrato**).

## Etapa 2 — correção da galeria People (`c30a130`)

| Teste antigo | Asserção | Regra protegida | Situação |
|---|---|---|---|
| — | — | A prévia da People abre a galeria pelo identificador | **Nova cobertura:** `project-gallery-preview.test.mjs` (falhava antes da correção) |

## Etapa 5 / D2 — galeria única integrada, galerias antigas removidas

| Teste antigo | Asserção antiga | Regra protegida | Situação / novo local |
|---|---|---|---|
| `project-gallery.test.mjs` (D1): galeria única reproduz byte a byte a galeria de people, cindy, phx e nexus | HTML da galeria única = HTML da galeria antiga | Markup, textos, alt, rótulos e tema idênticos aos atuais | **Substituída** pelo golden temporário da baseline (§7.3, ids `galeria-*` agora renderizados pela galeria única) e pelo teste de camada 2 `galeria de <slug>: dialog, tema, rótulos e primeira tela vindos do registro` (um por projeto com galeria) |
| `project-gallery.test.mjs` (D1): CSS reunido = arquivos antigos, na ordem base → cindy → nexus → phx | Regras idênticas às de `People/Cindy/Nexus/PhxGalleryPanel.css` | CSS sem alteração e na ordem do bundle | **Substituída:** os arquivos de origem deixaram de existir. A igualdade foi provada no D1 (`f817047`) e o efeito visual é coberto pelo diff visual das 51 capturas; o teste `CSS da galeria: base antes dos temas…` mantém a ordem, as mesmas regras por tema e o Nexus sem `color` nos botões |
| `app-dialog-state.test.mjs` (C): mapa de galerias cobre exatamente os projetos com galeria | chaves de `galleryDialogs` = slugs com `galeria` | O App renderiza a galeria de cada projeto que tem galeria | **Substituída** por `App renderiza a galeria única para o slug do estado…` (sem mapa nem galerias por projeto, com `key={dialog.slug}`); quais projetos têm galeria continua em `dialog-navigation.test.mjs`, e a renderização por slug em `project-gallery.test.mjs` |
| contrato: Projeto Cindy, Nexus, PHX e People abrem a galeria | `cindy/nexus/phx/people: <Projeto>GalleryPanel` e import da galeria de cada projeto | O App renderiza a galeria de cada projeto | **Alteradas** para o import de `ProjectGalleryPanel`, a renderização `<ProjectGalleryPanel key={dialog.slug} slug={dialog.slug}` e o `tema` do projeto no registro |
| contrato: Cindy e People | `aria-pressed={index === activeIndex}` em `CindyGalleryPanel.jsx` / `PeopleGalleryPanel.jsx` | Miniaturas indicam a tela ativa | **Alteradas** para `ProjectGalleryPanel.jsx`; valor renderizado também verificado na camada 2 |
| contrato: previews preservam o corte das capturas | `.people-gallery__thumbnail img { object-fit: contain }` em `PeopleGalleryPanel.css` | Miniaturas sem corte | **Alterada** para `ProjectGalleryPanel.css` |
| `project-dialogs-render.test.mjs`: galerias do People e da Cindy | renderização de `PeopleGalleryPanel` / `CindyGalleryPanel` | Telas sanitizadas, selo e capturas da demo | **Alterada** para `ProjectGalleryPanel` com `slug` |

O reinício na primeira tela a cada abertura (D1.9) segue coberto em runtime pelo smoke (§7.4) e, estaticamente, pela `key={dialog.slug}` e pelo `aria-pressed` da primeira miniatura na camada 2.

## Etapa 5 / D1 — galeria única (ainda não integrada)

| Teste antigo | Asserção | Regra protegida | Situação |
|---|---|---|---|
| — | — | A galeria única reproduz byte a byte cada uma das quatro galerias; o CSS reunido tem as regras atuais, inalteradas, na ordem base → cindy → nexus → phx; projeto sem galeria não renderiza e é diagnosticado em desenvolvimento | **Nova cobertura:** `project-gallery.test.mjs`. A equivalência com as galerias antigas é temporária: no D2, quando elas forem removidas, passa a valer a comparação com o golden da baseline |

## Etapa 4 / C — App com `EstadoDialog` e módulo de navegação

| Teste antigo (contrato) | Asserção antiga | Regra protegida | Situação / novo local |
|---|---|---|---|
| cards de projetos mantêm contrato de teclado | `onOpenProject(numero)` | O card abre o projeto ao ser acionado | **Alterada** para `onOpenProject(slug)`: o slug passa a ser a identidade (D1.5); runtime coberto pelo smoke (§7.4 B) |
| PortfolioContent mantém gerenciamento de foco e Escape | `onClick={() => openPanel('contato')}` | O CTA do hero abre o Contato | **Alterada** para `onClick={() => openDialog({ tipo: 'contato' })}`; runtime coberto pelo smoke (`B-hero-contato-…`) |
| Projeto Cindy oferece demo local e galeria… | `activePanel === 'cindy-demo'`, `activePanel === 'cindy-gallery'` | O App renderiza a demo e a galeria da Cindy | **Alteradas** para as entradas `cindy: CindyDemoPanel` e `cindy: CindyGalleryPanel` dos mapas por slug (D1.7); cobertura dos mapas em `app-dialog-state.test.mjs` |
| Projeto Nexus AI oferece uma demo interativa… | `activePanel === 'nexus-demo'` | O App renderiza a demo Nexus | **Alterada** para `nexus: NexusDemoPanel` |
| Projeto Nexus AI abre uma galeria coerente… | `activePanel === 'nexus-gallery'` | O App renderiza a galeria Nexus | **Alterada** para `nexus: NexusGalleryPanel` |
| Projeto PHX oferece a demo local… | `activePanel === 'phx-demo'` | O App renderiza a demo PHX | **Alterada** para `phx: PhxDemoPanel` |
| Projeto PHX abre uma galeria com as telas do laudo | `activePanel === 'phx-gallery'` | O App renderiza a galeria PHX | **Alterada** para `phx: PhxGalleryPanel` |
| Projeto People abre uma galeria de telas sanitizadas… | `activePanel === 'people-gallery'` | O App renderiza a galeria People | **Alterada** para `people: PeopleGalleryPanel` |

**Cobertura nova no C:**
- `app-dialog-state.test.mjs`: os mapas de galeria e de demo cobrem exatamente os projetos do registro; transições só pelo módulo, sem `preserveTrigger` nem estado misto; gatilho capturado só quando o módulo indica abertura a partir de `null`; rejeição mantém o estado e só avisa em desenvolvimento; `Escape` fecha pelo módulo.
- As regras de navegação em si (combinações, motivos, voltar, fechar) seguem cobertas por `dialog-navigation.test.mjs` (ticket B).

## Etapa 3 / A2 — consumidores migrados para o registro

| Teste antigo (contrato) | Asserção antiga | Regra protegida | Situação / novo local |
|---|---|---|---|
| cards de projetos mantêm contrato de teclado | `onOpenProject(project.number)` | O card abre o projeto ao ser acionado | **Alterada** para `onOpenProject(numero)`; comportamento por `Enter`/`Space` também coberto pelo smoke (§7.4 B) |
| Projetos seguem um percurso contínuo… | `projects.map((project, index) =>` | Os cards vêm da lista de projetos, com índice para alternar os lados | **Alterada** para `projects.map(({ slug, numero, card }, index) =>` |
| Projeto People usa GERENCIADOR… como subtítulo | `details` contém `detail: 'GERENCIADOR…'` | Subtítulo do People nos detalhes | **Movida:** `project-dialogs-render.test.mjs` (detalhes do People); o texto no registro continua no contrato |
| Projeto 02 mantém a copy confidencial… | `details` contém detalhe, dois trechos da descrição, dois recursos e `IA & Integrações` | Copy aprovada da Gestão Condominial nos detalhes | **Movida:** `project-dialogs-render.test.mjs` (detalhes da Gestão Condominial); título e subtítulo no registro continuam no contrato |
| Projeto Cindy oferece demo local e galeria… | `details`: `projectNumber === '02'`, `6 TELAS DA DEMO`, `ABRIR DEMO DA CINDY` | Detalhes da Cindy oferecem galeria (6 telas) e demo | **Movida:** `project-dialogs-render.test.mjs`; o ramo por número deixou de existir (dados no registro) |
| Projeto Cindy oferece demo local e galeria… | `gallery` contém `dashboard`, `residents`, `packages`, `occurrences` `.webp` | Galeria da Cindy mostra as capturas da demo | **Movida:** `project-dialogs-render.test.mjs` (HTML renderizado da galeria) |
| Projeto Nexus AI oferece uma demo interativa… | `details`: `projectNumber === '04'`, `TESTAR DEMO INTERATIVA` | Detalhes do Nexus oferecem a demo interativa | **Movida:** `project-dialogs-render.test.mjs`; `onOpenDemo` continua no contrato |
| Projeto Nexus AI abre uma galeria coerente… | `details`: `4 TELAS DO PRODUTO`, `onOpenGallery('nexus')` | Prévia do Nexus com 4 telas abre a galeria Nexus | **Movida** (contagem) para `project-dialogs-render.test.mjs`; **alterada** para `onOpenGallery(slug)`, com o identificador verificado em `project-gallery-preview.test.mjs` |
| Projeto PHX oferece a demo local… | `details`: `projectNumber === '03'`, `ABRIR DEMO DO LAUDO`, `title: 'LAUDO…'` (2×) | Detalhes do PHX: título e demo do laudo | **Movida:** `project-dialogs-render.test.mjs`; o título no registro continua no contrato |
| Projeto PHX abre uma galeria com as telas do laudo | `details`: `3 TELAS DO PRODUTO`, `onOpenGallery('phx')` | Prévia do PHX com 3 telas abre a galeria PHX | Como no Nexus: contagem **movida**, chamada **alterada** para `onOpenGallery(slug)` |
| Projeto People abre uma galeria de telas sanitizadas… | `details`: `projectNumber === '01'` | Detalhes do People oferecem a galeria | **Movida:** `project-dialogs-render.test.mjs` (prévia com 7 telas); `VER TELAS DO PROJETO` e `onOpenGallery` continuam no contrato |
| Projeto People abre uma galeria de telas sanitizadas… | `gallery` contém `people-dashboard`, `people-configuracoes` `.webp` e `DADOS FICTÍCIOS` | Galeria do People com telas sanitizadas e selo | **Movida:** `project-dialogs-render.test.mjs` (HTML renderizado da galeria) |
| quatro logos ocupam as etapas… | `src={project.logo}`, `alt={project.logoAlt}`, `project.summary` | Cards mostram logo, alt e resumo | **Alteradas** para `card.logo`, `card.logoAlt`, `card.summary` |
| quatro logos ocupam as etapas… | `details` contém `src` da prévia do People e da Cindy | Prévias usam as capturas corretas | **Movida:** `project-dialogs-render.test.mjs` (detalhes do People e da Gestão Condominial) |

**Cobertura nova no A2:** o mapa de ícones cobre todas as chaves do registro (`project-gallery-preview.test.mjs`; verificado por mutação: remover uma chave faz o teste falhar).

## Etapa 3 / A1 — registro

| Teste antigo | Asserção | Regra protegida | Situação |
|---|---|---|---|
| — | — | Invariantes do registro (pureza, slugs, números, galerias, ícones, demos, fonte única) | **Nova cobertura:** `project-registry.test.mjs`. O teste temporário de `projectCards` derivado foi substituído no A2 por "o registro só exporta `projects`" |
