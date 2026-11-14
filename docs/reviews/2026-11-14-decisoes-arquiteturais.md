# Decisões arquiteturais — 14/11/2026

> **Registro histórico.** Este documento reúne as decisões tomadas a partir da [revisão arquitetural](2026-11-14-revisao-arquitetural.md), em rodadas de questionamento (`grill-with-docs`). Para cada decisão, registra a pergunta, as alternativas, a recomendação, o que foi decidido e os critérios acrescentados pelo mantenedor. **Não é transcrição da conversa** (`AGENTS.md` §10).
> As specs em [`docs/specs/`](../specs/README.md) são o documento canônico do trabalho aprovado. Este registro preserva *por que* cada decisão foi tomada. As decisões permanentes de arquitetura serão formalizadas na ADR 0002, na etapa 9 da Spec 0001.

## Rodada preliminar — escopo

| # | Pergunta | Recomendação | Decisão |
|---|---|---|---|
| R0.1 | Quais candidatos da revisão entram? | Candidatos 1 e 2 | **Entram 1, 2 e 5** (testes). Ficam para depois o 3 (contrato de dialog), o 4 (demo em iframe única) e o 6 (CSS e código morto) |
| R0.2 | Corrigir o defeito `onClick={onOpenGallery}` antes do refactor? | Sim, numa mudança mínima e separada, com teste de regressão | **Sim** |
| R0.3 | Identidade do projeto | Slug estável, com o número só para exibição | **Slugs `people`, `cindy`, `phx`, `nexus`**; números só como apresentação |
| R0.4 | Vocabulário | "Dialog" como termo genérico | **Padronizar com Dialog** |
| R0.5 | Dependências de teste | Nenhuma; manter `node:test` | **Nenhuma dependência de teste sem justificativa técnica** |

O mantenedor também acrescentou como requisitos as investigações de [performance](2026-11-14-investigacao-performance.md) e de [organização](2026-11-14-investigacao-organizacao.md), feitas antes das rodadas seguintes.

## Rodadas de decisão

### Q1 — Modelo do estado de dialog

- **Contexto:** `activePanel` era uma string que misturava `'sobre'`/`'contato'`, números de projeto e strings compostas como `'cindy-gallery'`, que era a causa dos ternários com fallback e dos "voltar" fixos.
- **Alternativas:**
  - (a) string com prefixos;
  - (b) objeto `{ tipo, slug }`;
  - (c) um estado por dialog, descartado por permitir dois dialogs abertos.
- **Contraponto aceito:** em vez de um "resolver" genérico, usar detalhes e galeria compartilhados mais um mapa explícito `slug → demo`, porque com a galeria única só a demo varia por projeto.
- **Decisão:** **(b)**, com o mapa explícito de demos.
- **Critérios acrescentados:**
  - combinações inválidas rejeitadas;
  - slug desconhecido sem fallback;
  - "voltar" recupera o projeto correto;
  - o gatilho original é preservado entre detalhes, galeria e demo;
  - o retorno de foco funciona.
- **Registrado em:** Spec 0001 D1.1, D1.7.

### Q2 — Onde ficam as regras de navegação e o que é "rejeitar"

- **Fato verificado:** toda abertura vinda da cena captura o gatilho; toda transição de dialog para dialog usa `preserveTrigger`. A regra real é "capturar só a partir do estado fechado".
- **Alternativas de rejeição:**
  - (a) lançar erro, que pode derrubar a página;
  - (b) a transição não acontece e há um aviso em desenvolvimento;
  - (c) um dialog de "não encontrado", descartado como YAGNI.
- **Decisão:**
  - módulo puro em `src/utils/`, sem React nem DOM;
  - **resultados explícitos de sucesso ou rejeição, com motivo**;
  - o `console.error` condicionado a `import.meta.env.DEV` fica **no `App`**, não no módulo;
  - `preserveTrigger` removido em favor da regra "capturar só quando a navegação começa com todos os dialogs fechados".
- **Critérios acrescentados:** gatilho preservado em toda a cadeia; foco restaurado corretamente ao fechar com `Escape`.
- **Registrado em:** Spec 0001 D1.2–D1.4.

### Q3 — Formato e local do registro de projetos

- **Contexto:** os dados de um projeto estavam espalhados por seis lugares.
- **Alternativas para os ícones:**
  - (a) componentes do react-icons no registro;
  - (b) chaves em texto, com o mapa junto do dialog de detalhes.
- **Fato verificado:** as contagens fixas das prévias (7, 6, 3, 4) batem com as telas reais.
- **Decisão:**
  - registro ordenado em `src/data/projects.js` com `slug`, `numero`, `card`, `detalhes`, `galeria | null` e `demo | null`;
  - ícones como chave em texto, com teste de cobertura;
  - contagem derivada das telas;
  - campos `image`/`alt` mortos removidos;
  - dados da demo Nexus fora do registro.
- **Critérios acrescentados:**
  - preservar textos, ordem, rótulos, tecnologias, imagens e alt;
  - nenhum fallback para galerias ou demos inexistentes;
  - Nexus independente;
  - `projects.js` sem React e sem bibliotecas visuais;
  - nenhuma alteração de conteúdo ou identidade visual.
- **Registrado em:** Spec 0001 D1.5, D1.6, D1.8, D1.11.

### Q4 — Forma da galeria unificada

- **Fato verificado:** as quatro galerias diferem só em eyebrow, badge, substantivo ("tela"/"imagem"), sufixo do alt e classe de tema. O tema Nexus não define `color` nos botões e nas setas.
- **Alternativas:**
  - 4.1 textos: (a) montados a partir de partes, ou (b) finais e explícitos no registro;
  - 4.2 renomear `people-gallery*` agora ou depois;
  - 4.3 temas: (a) reunidos sem reescrever, ou (b) convertidos em variáveis CSS;
  - 4.4 tema escolhido por um campo do registro.
- **Decisão:**
  - uma implementação única de galeria;
  - textos finais explícitos, incluindo alt e aria-labels;
  - **todas as classes CSS atuais preservadas**;
  - base e temas num único arquivo, com as regras inalteradas e a base antes dos temas;
  - tema escolhido pelo campo `tema`, **sem inferir pelo slug**;
  - a diferença do Nexus preservada;
  - a galeria reinicia na primeira tela.
- **Critérios acrescentados:** comparar textos, atributos de acessibilidade e prévias com a versão atual; nenhuma padronização visual adicional.
- **Registrado em:** Spec 0001 D1.9, D1.10.

### Q5 — Estratégia de testes

- **Fatos verificados:** Node 26 local e Node 22 no CI; o Vite carrega JSX no Node; `react-dom/server` já está instalado.
- **Alternativas para o golden:** (a) permanente; (b) temporário.
- **Decisão:**
  - três camadas: lógica pura em `node:test`, render estático e smoke de browser local;
  - golden temporário;
  - rastreabilidade obrigatória "teste antigo → regra → teste novo";
  - `npm test` rodando a pasta, com testes divididos por regra.
- **Critérios acrescentados:**
  1. o smoke testa explicitamente a galeria People aberta pelos detalhes, com o identificador correto;
  2. o golden prova conteúdo e markup, nunca comportamento;
  3. a viabilidade do render estático é provada com os componentes reais, incluindo a demo Nexus.
- **Prova de viabilidade:** os 13 dialogs renderizaram em 0,58 s. Limitação: o React tem de ser carregado pelo Node (`createRequire`), e da demo Nexus só o estado inicial é capturado.
- **Registrado em:** Spec 0001 §3.

### Q6 — Nome e pasta dos dialogs

- **Alternativas:**
  - (a) renomear agora, como passo mecânico final;
  - (b) renomear depois, junto com o CSS;
  - (c) misto, descartado por inconsistência.
- **Decisão:** **(a)**, `components/panels/` → `components/dialogs/` e `*Panel` → `*Dialog`, depois do golden aprovado. As classes CSS (`info-panel`, `people-gallery`) são preservadas.
- **Critérios acrescentados:**
  - etapa mecânica isolada;
  - sem misturar com implementação;
  - imports e referências atualizados;
  - README, `docs/architecture.md`, `AGENTS.md` e glossário atualizados;
  - build, lint e testes validados;
  - rastreabilidade do histórico Git preservada;
  - nenhuma subpasta adicional.
- **Registrado em:** Spec 0001 D1.14 e etapa 8.

### Q7 — Código morto e duplicações

- **Decisão:**
  - **Spec 0001:** remove os campos `image`/`alt` e os assets do template Vite; remove as **referências** a `project-01..03.webp`, mantendo os arquivos até verificar o uso externo das URLs; mantém `project-04.webp` e `docs/logo/logos.png`; remove `.hermes/plans/` (inspecionado: plano obsoleto do fluxo de vídeo).
  - **Spec 0002:** centraliza os links de contato, preservando a ordem de cada consumidor, e leva `menuItems`, `aboutToolkit`, `footerServices` e os dados da Nexus para `src/data/`.
  - **Adiado:** a limpeza de CSS, numa etapa independente com comparação visual.
- **Critérios acrescentados:** não ampliar a Spec 0001 para o Footer; nenhuma exclusão sem segurança comprovada.
- **Registrado em:** Spec 0001 D1.12, D1.13; Spec 0002.

### Q8 — Performance

- **Decisão:** Spec 0003 separada, em três etapas:
  - Etapa 0: instrumentação (`perf-audit`, porta, nova baseline);
  - Etapa 1: imagens, `motion.span` e reduced-motion;
  - Etapa 2: experimentos condicionais (WebGL do `WarpText`, pausa fora da viewport, pausa da cena com dialog aberto).

  Lazy loading da demo Nexus e das galerias **rejeitado**.
- **Critérios acrescentados:**
  - comparação visual das imagens em várias densidades;
  - não sacrificar qualidade por compressão;
  - preservar reduced-motion;
  - várias execuções comparáveis;
  - ambiente registrado;
  - experimentos só com benefício demonstrável.
- **Ordem:** 0001 → 0002 → 0003, sendo que a 0003 depende só da 0001.
- **Registrado em:** Spec 0003.

### Q9 — Validação visual

- **Alternativas:**
  - (a) manual;
  - (b) capturas automatizadas com diff de pixels, sem dependências;
  - (c) ferramenta de regressão visual, descartada por ser dependência nova.
- **Decisão:** **(b)** mais um roteiro manual com movimento:
  - viewports 1280×800 @1x, @2x e 390×844 @3x;
  - reduced-motion emulado;
  - artefatos fora do repositório;
  - baseline no `7f53175`.
- **Critérios acrescentados:** calibração do ruído antes da tolerância; máscaras só com justificativa; critérios próprios para imagens re-encodadas.
- **Registrado em:** Spec 0001 §7.1; Spec 0003 §5.

### Q10 — Fluxo Git

- **Fato verificado:** a `main` existe no GitHub e é a origem dos deploys de produção (corrigindo uma afirmação anterior). `7f53175` está contido na `main`.
- **Decisão:**
  - uma branch por spec, a partir da `main` atualizada;
  - fetch do clone ajustado só no `.git/config` local;
  - `safe.directory` passado por comando;
  - commits pequenos por etapa;
  - renomeação em commit dedicado;
  - commits locais autorizados uma vez por spec;
  - push, PR e merge autorizados um a um;
  - validação local e no Preview da Vercel;
  - merge sempre feito pelo mantenedor;
  - sem auto-merge.
- **Critério acrescentado:** verificações proporcionais por etapa e validação completa antes da PR.
- **Registrado em:** [índice das specs, Fluxo Git](../specs/README.md#fluxo-git-todas-as-specs).

## Histórico das revisões do documento de especificações

O documento consolidado passou por cinco versões antes de ser dividido em `docs/specs/`. As versões 1 a 4 foram sobrescritas no mesmo arquivo temporário e **não existem mais como arquivos**. Esta seção registra o que cada versão mudou.

| Versão | Mudanças |
|---|---|
| v1 | Consolidação das decisões R0 e Q1–Q10 em três specs, mais os protocolos de validação, o fluxo Git, os adiados, as pendências e o rascunho do glossário |
| v2 | `null` como único estado sem dialog aberto (D1.1, D1.2, testes) · prova do render estático exigida também no Node 22 · protocolo de performance com ≥5 execuções, mediana e dispersão, três cenários explícitos e critérios objetivos de regressão, sem metas inventadas · golden, screenshots e diffs fora do repositório, scripts versionados, manifesto com commit e condições · Specs 0002/0003 a partir da `main` com o merge da 0001 e confirmação de `origin/main` além do `FETCH_HEAD` · conteúdo obrigatório da ADR 0002 · reduced-motion validado também quando a preferência muda durante a execução · consumidores do `motion` verificados antes de qualquer estimativa |
| v3 | Renomeação em commit dedicado, com atualizações mecânicas de imports permitidas e lógica proibida · matriz visual explícita (17 cenas × 3 viewports) · smoke de acessibilidade explícito (foco inicial, `Tab` no último, `Shift+Tab` no primeiro, `Escape`, retorno ao gatilho) · invariantes: alterações de comportamento só quando previstas e com validação própria · IQR na interpretação das variações · reduced-motion separado por componente, conforme o comportamento real |
| v4 | Exceção técnica de `data-dialog-initial-focus` no golden (o fato verificado é que o atributo já existe nos 13 dialogs) · verificação semântica dos dialogs (papel, `aria-modal`, nome acessível) · `Escape` e foco nas demos com iframe, testes C1–C4 e limitação registrada |
| v5 (final) | Identidade do elemento focado registrada na baseline e exigida depois da mudança · P4 decidido: Node 22 portátil oficial, fora do repositório |
| Depois da v5 | Divisão em `docs/specs/` (índice + 0001–0003), com cobertura verificada termo a termo · `docs/specs/` referenciado no `AGENTS.md` e no README · materialização deste registro, da revisão arquitetural, das investigações, do glossário e do índice `docs/README.md` |
