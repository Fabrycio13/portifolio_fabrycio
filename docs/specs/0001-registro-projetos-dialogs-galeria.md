# Spec 0001 — Registro de projetos, navegação de dialogs e galeria única

- **Data:** 14 de novembro de 2026
- **Status:** Em andamento
- **Branch:** `refactor/registro-projetos-dialogs`, a partir de `origin/main` atualizada ([Fluxo Git](README.md#fluxo-git-todas-as-specs))
- **Depende de:** —
- **Habilita:** [0002](0002-dados-estaticos.md) e [0003](0003-performance-baseada-em-evidencias.md)
- **Invariantes:** os do [índice](README.md#invariantes-valem-para-todas-as-specs) valem integralmente
- **Origem:** [revisão arquitetural](../reviews/2026-11-14-revisao-arquitetural.md) (candidatos 1, 2, 5 e parte do 6) e [decisões arquiteturais](../reviews/2026-11-14-decisoes-arquiteturais.md)

## 1. Objetivo e escopo

Unificar os dados de cada projeto num registro único, tornar a navegação entre dialogs explícita e testável, e substituir as quatro galerias por uma implementação única. A experiência visual e o comportamento observável não mudam.

**Fora do escopo:** Footer, reorganização geral dos dados, CSS fora da galeria, performance.

## 2. Decisões

- **D1.1 Estado de dialog:** `EstadoDialog = null | { tipo, slug? }`.
  - **`null` é o único valor que representa "nenhum dialog aberto".** Não existem valores como `{}`, `undefined` ou `{ tipo: null }` para isso.
  - `tipo ∈ sobre | contato | projeto | galeria | demo`.
  - O slug é obrigatório para `projeto`, `galeria` e `demo`, e proibido para `sobre` e `contato`.
- **D1.2 Módulo puro de navegação** em `src/utils/`, sem React nem DOM, recebendo o registro como argumento:
  - **validar destino:** devolve `{ ok: true, estado }` ou `{ ok: false, motivo }`. O destino `null` (fechar) é sempre válido;
  - **voltar:** galeria ou demo → `{ tipo: 'projeto', slug }`. Projeto, Sobre e Contato não têm voltar (rejeição com motivo). Voltar a partir de `null` é rejeitado com motivo;
  - **capturar gatilho:** verdadeiro **somente** quando o estado anterior é `null` e o destino é um dialog válido. Falso em qualquer transição de dialog para dialog e no fechamento;
  - **fechar:** qualquer estado → `null`. `Escape` usa essa transição.
- **D1.3 Rejeição:** a transição não acontece e o estado atual é mantido, seja `null` ou um dialog. O `App` faz `console.error` só quando `import.meta.env.DEV`. Nenhum fallback silencioso.
- **D1.4** `preserveTrigger` sai.
- **D1.5 Registro ordenado em `src/data/projects.js`** com `slug` (`people`, `cindy`, `phx`, `nexus`), `numero` (só exibição), `card`, `detalhes`, `galeria | null` e `demo | null`. Sem React e sem bibliotecas visuais.
- **D1.6 Ícones** como chave em texto. O mapa `chave → componente` fica no dialog de detalhes.
- **D1.7 Responsabilidade de renderização do `App`:**
  - guarda o `EstadoDialog`;
  - guarda o `ref` do gatilho e executa o efeito de foco, trap e `Escape`;
  - renderiza o dialog correspondente ao estado;
  - mantém o mapa `slug → dialog de demo` (`cindy`, `phx`, `nexus`; People não tem demo).

  As decisões sobre transições são todas do módulo de navegação.
- **D1.8 Contagem da prévia** derivada do número de telas (hoje 7, 6, 3 e 4, com o mesmo texto).
- **D1.9 Galeria única** alimentada por `galeria`:
  - alt e aria-labels finais explícitos no registro;
  - o campo `tema` (`'cindy' | 'phx' | 'nexus' | null`) seleciona a classe, sem inferir pelo slug;
  - reinicia na primeira tela a cada abertura.
- **D1.10 CSS da galeria:** base e temas num único arquivo, com as regras inalteradas, base antes dos temas. Classes `people-gallery*`, `*-gallery` e `info-panel` intactas. A diferença do Nexus (sem `color` nos botões e nas setas) é preservada.
- **D1.11 Dados da demo Nexus** independentes do registro.
- **D1.12 Removidos:**
  - campos `image`/`alt` de `projects.js`;
  - `src/assets/hero.png`, `react.svg` e `vite.svg`;
  - `.hermes/plans/2026-09-10_145643-otimizacao-video-e-fluidez.md`. Foi inspecionado: é um plano obsoleto do fluxo de vídeo removido. **Já removido** no commit `661ac525a195dbd73b26f9b743cc4a8a706d430b`, com aceite do mantenedor como antecipação deste item; na etapa 7 resta só confirmar, por grep, que não sobrou referência.
- **D1.13 Referências a `project-01..03.webp` removidas, arquivos mantidos** até a pendência P1. `project-04.webp` fica.
- **D1.14 Renomeação** de `components/panels/` para `components/dialogs/` e `*Panel` para `*Dialog`:
  - `ProjectDetailsDialog`, `ProjectGalleryDialog`, `CindyDemoDialog`, `PhxDemoDialog`, `NexusDemoDialog`, `InfoDialogs`;
  - feita num **commit dedicado à renomeação**, depois do golden aprovado. O commit permite atualizações **mecânicas** de imports, caminhos e referências (código, testes, scripts e docs que citam caminhos), e proíbe qualquer alteração de lógica, comportamento ou implementação;
  - nenhuma subpasta nova.

## 3. Testes

- **Camada 1, `node:test`.** Navegação:
  - abrir cada tipo a partir de `null`: aceito com estado correto e captura de gatilho = verdadeiro;
  - combinações inválidas, cada uma rejeitada com motivo:
    - tipo desconhecido;
    - slug desconhecido;
    - slug ausente em `projeto`, `galeria` ou `demo`;
    - slug presente em `sobre` ou `contato`;
    - `galeria` ou `demo` de um projeto sem esse recurso;
    - estados malformados (`{}`, `{ tipo: null }`, `undefined`);
  - transições dialog → dialog: detalhes → galeria, detalhes → demo, Sobre → Contato, com captura de gatilho = falso;
  - voltar: galeria ou demo → detalhes do mesmo slug; voltar de `null`, de detalhes, de Sobre ou de Contato rejeitado com motivo;
  - fechar a partir de cada tipo resulta em `null`.

  Invariantes do registro: slugs únicos, galerias com telas, cobertura das chaves de ícone, toda demo do registro presente no mapa.
- **Camada 2, render estático:** textos, alt, `aria-label`/`aria-labelledby`, contagem da prévia, presença ou ausência do botão de demo e classe de tema por projeto.
  - **Pré-requisito obrigatório:** a prova de viabilidade (13 dialogs) precisa passar **no Node 26 local e no Node 22 do CI** antes de a camada 2 ser adotada. O Node 22 é obtido conforme P4.
  - Se falhar no Node 22, a limitação é documentada e uma alternativa sem dependência nova é apresentada antes de seguir.
- **Camada 3, smoke de browser** (script versionado em `scripts/`, local, fora do CI): matriz de acessibilidade e interação no §7.4.
- **Golden temporário:** ver §7.3. Prova equivalência de **conteúdo e markup**, nunca de comportamento.
- **Rastreabilidade:** tabela "teste antigo → regra protegida → teste novo" para cada um dos 24 testes atuais.
- `npm test` passa a rodar `tests/unit/` inteiro, com os testes divididos por regra.

## 4. Etapas

Cada etapa vira um commit local, depois de passar nas verificações proporcionais e só com a autorização da spec.

| # | Etapa | Verificação mínima |
|---|---|---|
| 1 | Baseline no `7f53175`: scripts de captura (versionados), prova de viabilidade no Node 26 **e no Node 22**, calibração do ruído visual, golden HTML, baseline de performance (§7.2), tamanhos do build | Manifesto da baseline registrado; Node 22 aprovado ou limitação documentada |
| 2 | Corrigir o `onClick={onOpenGallery}` + teste de regressão (camada 1/3) | test, lint, build, smoke da galeria People |
| 3 | Registro em `src/data/projects.js` + mapa de ícones | test, golden, lint, build |
| 4 | Módulo de navegação + `App` com `EstadoDialog`, sem `preserveTrigger` | test, golden, smoke completo de foco |
| 5 | Galeria única + CSS reunido | test, golden, diff visual das galerias e prévias |
| 6 | Reorganização dos testes (camadas 1–2) + tabela de rastreabilidade | Contagem de regras cobertas ≥ antes |
| 7 | Remoções D1.12 e D1.13 | test, lint, build, grep sem referências |
| 8 | Renomeação `panels/` → `dialogs/` e `*Panel` → `*Dialog` num commit dedicado, com só atualizações mecânicas de imports e referências e nenhuma mudança de lógica, comportamento ou implementação | test, lint, build e golden passando; `git diff --staged -M --stat` mostrando os arquivos como renomeados (`R`); revisão do diff confirmando que só mudam caminhos e nomes |
| 9 | Documentação: README, `docs/architecture.md`, `AGENTS.md` (o que os testes cobrem, linha obsoleta do §10, porta), revisão do `GLOSSARY.md` (já criado; conferir contra o código final) e **ADR permanente** (§5) | `git diff --check` |
| 10 | Validação completa: test, lint, build, diff visual da matriz completa (§7.1, 51 capturas), smoke de acessibilidade (§7.4), roteiro manual com movimento, performance (§7.2) | Antes da PR |

## 5. ADR da etapa 9

A ADR é um documento separado desta spec, criado em `docs/decisions/` na etapa 9.

**Numeração:** conferir `docs/decisions/` no momento da escrita. Hoje só existe a `0001`, então o número previsto é **0002**, salvo se outro registro surgir antes. O formato segue o da ADR 0001: data, status, contexto, decisão e consequências.

O conteúdo obrigatório:
1. **Registro único de projetos** em `src/data/projects.js`, com slug como identidade e número como exibição.
2. **Separação entre dados e componentes React:** `src/data/` sem React e sem bibliotecas visuais.
3. **Ícones por chaves textuais**, com o mapa no dialog de detalhes e o teste de cobertura.
4. **Navegação pura** em `src/utils/`: `EstadoDialog = null | { tipo, slug? }`, resultados com motivo de rejeição, regra de captura do gatilho, sem fallback.
5. **Responsabilidade de renderização do `App`:** estado, gatilho, efeito de foco, renderização e mapa de demos.
6. **Alternativas descartadas e trade-offs:**
   - string com prefixos e um estado por dialog;
   - resolver genérico de dialogs;
   - lançar erro ou criar um dialog de "não encontrado" ao rejeitar;
   - componentes React no registro;
   - gramática de alt gerada em código;
   - golden permanente;
   - renomeação mista (só os arquivos novos com "Dialog").

## 6. Critérios de aceite

1. `null` é o único estado de "nenhum dialog aberto"; fechar, inclusive com `Escape`, sempre resulta em `null`.
2. Combinações inválidas de tipo e slug, incluindo estados malformados, são rejeitadas com motivo; slug desconhecido não gera fallback.
3. "Voltar" recupera o projeto correto.
4. O gatilho é capturado só a partir de `null` e se mantém durante toda a cadeia de navegação.
5. Toda a matriz de acessibilidade do §7.4 é aprovada:
   - semântica (papel, `aria-modal`, nome acessível);
   - foco inicial, `Tab` no último elemento, `Shift+Tab` no primeiro, `Escape` e retorno do foco ao gatilho original depois da cadeia;
   - nas demos com iframe, C1 e C4 obrigatórios, e C2 e C3 iguais à baseline.
6. Textos, ordem, rótulos, tecnologias, imagens, alt e atributos de acessibilidade idênticos (golden + camada 2).
7. Prévias idênticas, com a contagem derivada.
8. Diff visual com reduced-motion dentro da tolerância calibrada, nas 51 capturas da matriz do §7.1 (17 cenas × 3 viewports).
9. Roteiro manual com movimento conferido em desktop e mobile.
10. Performance sem regressão pelo critério do §7.2.
11. Camada 2 aprovada no Node 22 e no Node 26.
12. Nenhuma regra antiga sem cobertura.

## 7. Protocolos de validação (compartilhados)

Definidos aqui porque esta spec cria os scripts. As Specs 0002 e 0003 os reutilizam.

### 7.1 Validação visual

- Script versionado em `scripts/`, com a infraestrutura de Chrome existente:
  - `prefers-reduced-motion: reduce` emulado;
  - diff de pixels no próprio Chrome, com imagens de diferença.
- **Matriz de capturas: 17 cenas × 3 viewports = 51 capturas por execução.** Toda cena é capturada em todos os viewports.

| # | Cena | Como chegar ao estado | Desktop 1280×800 @1x | Desktop 1280×800 @2x | Mobile 390×844 @3x |
|---|---|---|---|---|---|
| 1 | Hero | Topo da página, depois da estabilização | ✔ | ✔ | ✔ |
| 2 | Serviços | Âncora `#servicos`, com a seção montada | ✔ | ✔ | ✔ |
| 3 | Projetos | Âncora `#projetos`, com a seção montada e os 4 cards | ✔ | ✔ | ✔ |
| 4 | Footer | Fim da página, com o Footer montado | ✔ | ✔ | ✔ |
| 5–8 | Detalhes: People, Cindy, Phx, Nexus (com a prévia da galeria) | Clique no card correspondente | ✔ | ✔ | ✔ |
| 9–12 | Galerias: People, Cindy, Phx, Nexus (primeira tela) | Detalhes → prévia da galeria | ✔ | ✔ | ✔ |
| 13 | Sobre | Menu → Sobre | ✔ | ✔ | ✔ |
| 14 | Contato | Menu → Contato | ✔ | ✔ | ✔ |
| 15 | Demo Cindy (estado inicial) | Detalhes Cindy → botão de demo | ✔ | ✔ | ✔ |
| 16 | Demo Phx (estado inicial) | Detalhes Phx → botão de demo | ✔ | ✔ | ✔ |
| 17 | Demo Nexus (estado inicial) | Detalhes Nexus → botão de demo, capturada antes de qualquer interação | ✔ | ✔ | ✔ |

- As posições de scroll e os passos de navegação ficam fixos no script, para que antes e depois capturem exatamente o mesmo estado.
- O conteúdo dos iframes das demos Cindy e Phx entra na captura como é renderizado.
- A calibração do ruído é feita sobre a matriz completa, e a tolerância pode ser definida por cena se o ruído medido diferir entre cenas.
- **Tolerância calibrada:** duas capturas do mesmo código, no mesmo ambiente, antes de definir o limite. Nenhum percentual arbitrário.
- Máscaras só com justificativa registrada, nunca sobre layout, conteúdo ou identidade.
- O diff automatizado aprova os estados estáticos; o roteiro manual verifica o movimento.
- Também roda no Preview da Vercel depois de cada push autorizado.

### 7.2 Protocolo de performance

- **Cenários:** o comando é sempre `node scripts/perf-audit.mjs <url> --duration-ms=5000`, com estas variações:
  1. **Hero:** sem flag;
  2. **Projetos:** `--projects`;
  3. **Footer:** `--footer`.
- **Execuções:** no mínimo **5 por cenário**, antes e depois, com:
  - a mesma build servida por `vite preview` na mesma porta;
  - a mesma máquina, a mesma versão do Chrome e o mesmo viewport;
  - nenhuma outra carga relevante na máquina;
  - ordem intercalada entre as builds antes e depois quando possível;
  - descarte só de execuções com falha técnica registrada (Chrome não abriu, timeout), nunca por resultado.
- **Registro por métrica** (FPS, long tasks e duração, FCP/LCP e recursos quando a Etapa 0 da Spec 0003 os disponibilizar): **mediana**, **mínimo–máximo** e **intervalo interquartil**. O conjunto vai num manifesto (§7.3).
- **Uso do intervalo interquartil:** o IQR é a medida principal de dispersão típica, porque é robusto a execuções atípicas. O mínimo–máximo é a medida de amplitude total. Os dois entram na interpretação, e nenhum percentual fixo é usado.
- **Critérios objetivos de regressão:**
  - **Binários,** em que qualquer ocorrência é regressão:
    - `runtimeIssues` > 0 onde a baseline tinha 0;
    - quantidade de canvases diferente da baseline;
    - Footer não montado;
    - quantidade de cards com `role="button"` diferente de 4;
    - long task nova acima de 50 ms em cenário que não tinha;
    - erro de console novo.
  - **Contínuos:** é **regressão demonstrada** quando as três condições valem juntas:
    1. a mediana "depois" fica fora do intervalo mínimo–máximo da baseline, no sentido desfavorável;
    2. o IQR "depois" **não se sobrepõe** ao IQR da baseline;
    3. as condições 1 e 2 **se repetem numa segunda série** de 5 execuções.
  - **Resultado inconclusivo:** quando só uma das condições 1 e 2 vale, dispara a segunda série. Se continuar inconclusivo, o resultado é registrado como "indício, não demonstrado" e revisado com o mantenedor antes de seguir. Não é tratado como aprovado nem como reprovado em silêncio.
  - **Dispersão alta:** se o IQR da baseline for largo demais para distinguir a variação em análise, o relatório diz explicitamente que a medição não tem resolução para concluir. Não se compensa isso com uma meta arbitrária.
- **Critério de ganho:** espelha o de regressão. As mesmas três condições, no sentido favorável e nas duas séries. Fora disso, o resultado é "sem diferença demonstrável", e é registrado assim.
- **Metas:** nenhuma meta de FPS, tempo ou porcentagem é fixada. A referência é sempre a baseline medida.
- **Nesta spec,** o `perf-audit` ainda tem os defeitos que a Spec 0003 corrige: não registra recursos e não enxerga as long tasks da inicialização. A comparação usa só as métricas que ele já coleta corretamente, e essa limitação vai declarada na entrega.

### 7.3 Golden, capturas e manifesto

- **Ficam fora do repositório:** HTML golden, screenshots, imagens de diferença e saídas brutas do `perf-audit`. Ficam numa pasta temporária fora do repositório (da sessão ou do sistema), nunca versionados e nunca em `tests/`.
- **Ficam versionados:** os scripts de captura e de comparação, em `scripts/`.
- **Manifesto** (`manifest.json` ao lado dos artefatos), para cada captura:
  - commit de origem (SHA completo; baseline: `7f53175`);
  - data e hora;
  - versões do Node e do Chrome;
  - sistema operacional e máquina;
  - viewport e DPR;
  - estado do reduced-motion;
  - URL e porta servidas;
  - comando executado.
- O **resumo** dos resultados (pass/fail, tolerância calibrada, medianas) vai na descrição da PR e na entrega. Os artefatos não vão.
- O golden prova equivalência de conteúdo e markup. Foco, teclado, `Escape`, animações e interações têm validações próprias.
- **Exceção técnica aprovada: `data-dialog-initial-focus`.**
  - **Fato verificado:** o atributo já existe nos 13 dialogs no `7f53175`, portanto já faz parte do golden. A expectativa é que a exceção **não precise ser usada**: a galeria única e os dialogs renomeados mantêm o atributo no mesmo elemento de hoje (o botão "Voltar ao projeto" nas galerias e o botão de fechar nos demais dialogs: Sobre, Contato, detalhes e as três demos, conforme medido na baseline).
  - **Identidade do elemento focado, registrada na baseline:** para cada um dos 13 dialogs, o smoke grava no manifesto a identidade do elemento que recebe o foco inicial no `7f53175`:
    - tag;
    - papel e nome acessível computados (CDP `Accessibility`);
    - texto visível;
    - lista de classes;
    - posição na ordem de elementos focáveis do dialog (por exemplo, "1º de N").
  - **Escopo da exceção:** se a implementação precisar mudar a presença, o valor serializado ou o elemento portador desse atributo, a diferença é aceita **somente** para esse atributo e **somente** se o elemento que efetivamente recebe o foco ao abrir (`document.activeElement`) tiver a **mesma identidade** registrada na baseline: mesma tag, papel, nome acessível, texto, classes e posição na ordem de foco.
  - **Não basta** verificar que o elemento atual tem o atributo. O critério é o elemento focado, não o portador do atributo.
  - A comparação do golden ignora apenas esse atributo, e toda diferença ignorada é listada nominalmente no relatório da etapa.
  - **Todas as demais comparações** de conteúdo e markup (texto, demais atributos, `aria-*`, classes, estrutura, ordem) permanecem exigidas sem exceção.

### 7.4 Smoke de acessibilidade e interação (camada 3)

Script versionado em `scripts/`, rodado contra o `vite preview` local e, depois de push autorizado, contra o Preview da Vercel. Em desktop e mobile, sem reduced-motion.

**A0. Semântica, por dialog,** aplicada aos 13 com o dialog aberto, usando a árvore de acessibilidade do Chrome (CDP `Accessibility`), não só os atributos.

| Verificação | Critério de aprovação |
|---|---|
| Papel | O elemento raiz do dialog tem papel `dialog` |
| `aria-modal` | `aria-modal="true"`. Aplicável aos 13, porque todos são modais. Se algum deixar de ser modal, isso é alteração de comportamento não prevista e, portanto, regressão |
| Nome acessível | O nome computado não é vazio. Com `aria-labelledby`, o `id` referenciado existe, é único no documento e aponta para um elemento com texto. Com `aria-label`, o valor não é vazio |
| Unicidade | Exatamente um dialog aberto na árvore em cada momento, inclusive durante as cadeias da parte B |
| Equivalência | Papel, `aria-modal` e nome acessível iguais aos da baseline `7f53175`, para cada dialog. Nas galerias, o nome acompanha o título da tela ativa, como hoje |

**A. Por dialog,** aplicado aos 13: 4 detalhes, 4 galerias, Sobre, Contato e 3 demos. Nas demos Cindy e Phx, vale a ressalva da parte C para o foco dentro do iframe.

| Verificação | Critério de aprovação |
|---|---|
| Foco inicial | Ao abrir, `document.activeElement` está dentro do dialog aberto e tem a **mesma identidade** do elemento focado na baseline (tag, papel, nome acessível, texto, classes e posição na ordem de foco, conforme o §7.3). Ter o atributo `data-dialog-initial-focus` não é suficiente para aprovar |
| `Tab` no último elemento | Com o foco no último elemento focável do dialog, `Tab` leva o foco ao **primeiro** elemento focável do mesmo dialog |
| `Shift+Tab` no primeiro elemento | Com o foco no primeiro elemento focável, `Shift+Tab` leva o foco ao **último** elemento focável do mesmo dialog |
| Foco nunca escapa | Em nenhum passo o foco vai para fora do dialog aberto |
| `Escape` | Fecha o dialog: o estado volta a `null`, nenhum dialog fica no DOM e a cena continua montada |

**B. Cadeias de navegação e retorno ao gatilho original.**

| Cadeia | Critério |
|---|---|
| Card de projeto (`Enter`) → detalhes → galeria → "Voltar" → detalhes → demo → "Voltar" → `Escape` | Depois do `Escape`, o foco volta ao **card de origem**. Cada "Voltar" reabre os detalhes do **mesmo** projeto |
| Card de projeto (`Space`) → detalhes → `Escape` | O foco volta ao card |
| Card (clique) → detalhes → botão de fechar | O foco volta ao card |
| Detalhes People → prévia da galeria | Abre a **galeria People**, não a de outro projeto: o identificador enviado é `people` |
| Menu "Sobre" → CTA para Contato → `Escape` | Abre o Contato e, ao fechar, o foco volta ao **link "Sobre" do menu**, o gatilho original |
| Hero `ENTRAR EM CONTATO` → `Escape` | O Contato abre sem desmontar a cena, e o foco volta ao CTA |
| Hero `EXPLORAR MEU TRABALHO` | Navega para `#servicos` |
| Galeria: setas e miniaturas | Navegação circular (última → primeira, primeira → última). Ao fechar e reabrir, volta à primeira tela |
| Demo Nexus | Navegação lateral troca a seção ativa, e a simulação roda sem erro de runtime |

**C. `Escape` e foco nas demos com iframe (Cindy e Phx).**

Premissa técnica, que não é presumida e é verificada na baseline: eventos de teclado disparados com o foco **dentro** de um iframe são entregues ao documento do iframe, não ao documento pai. Isso vale mesmo na mesma origem. O handler de `Escape` e de `Tab` do `App` escuta o `document` pai. Como os HTML das demos não têm handler próprio nem `postMessage`, a expectativa é que, com o foco dentro do iframe, `Escape` não feche o dialog e o trap de `Tab` não atue. **Essa expectativa só vira fato depois da medição na baseline.**

| # | Teste | Critério |
|---|---|---|
| C1 | Foco no "chrome" do dialog (o botão de fechar, que é o foco inicial, ou o botão "Voltar ao projeto") → `Escape` | **Obrigatório:** fecha, o estado vai a `null` e o foco volta ao gatilho original |
| C2 | Foco colocado **dentro** do iframe: clique num elemento focável do conteúdo e, como alternativa, `Tab` a partir do último elemento do chrome → `Escape` | **Registrar** na baseline se fecha ou não. Depois da mudança, o comportamento tem que ser **igual ao da baseline** |
| C3 | Com o foco dentro do iframe, `Tab` e `Shift+Tab` até sair do conteúdo do iframe | **Registrar** para onde o foco vai, se volta ao chrome do dialog ou se escapa para fora do dialog. Depois da mudança, igual à baseline |
| C4 | Depois de C2/C3, voltar o foco ao chrome e pressionar `Escape` | **Obrigatório:** fecha e devolve o foco ao gatilho original |

- **Como o foco é colocado no iframe:** por clique real via CDP, ou por `Tab`. Por ser mesma origem, o script pode ler `iframe.contentDocument.activeElement` para confirmar onde está o foco. Se no Preview da Vercel o iframe passar a ser de outra origem, o script registra que não consegue inspecionar o foco interno e se limita aos efeitos observáveis no documento pai (o dialog fechou ou não, `document.activeElement`).
- **Limitação registrada:** se a baseline confirmar que `Escape` não fecha e/ou que o foco escapa do dialog a partir do iframe, isso é um **defeito preexistente de acessibilidade**, não uma regressão destas specs. Corrigir exigiria mudar o comportamento (por exemplo, handlers nos HTML das demos ou `postMessage`), o que **não está previsto** nas Specs 0001–0003. O achado é registrado na entrega e como insumo do candidato adiado "contrato explícito dos dialogs" ([índice](README.md#adiados-fora-destas-specs)), sem ampliar o escopo agora.
- **Fora destes testes:** a demo Nexus não usa iframe e segue integralmente as partes A0, A e B.

## 8. Glossário (`GLOSSARY.md`, revisado na etapa 9)

O [`GLOSSARY.md`](../../GLOSSARY.md) já foi criado com estes termos, mais Cena, Projeto, Tela e Prévia da galeria. Por regra do glossário, ele não registra detalhes de implementação: a observação abaixo sobre os nomes legados no CSS fica só nesta spec.

- **Dialog** — sobreposição modal que preserva a cena principal. Nome legado no CSS: `info-panel`, `people-gallery`.
- **Detalhes do projeto**, **Galeria**, **Demo** — os três dialogs de um projeto.
- **Sobre**, **Contato** — dialogs do site.
- **Nenhum dialog aberto** — o estado em que só a cena está visível.
- **Slug** — identidade estável de um projeto (`people`, `cindy`, `phx`, `nexus`).
- **Número** — posição de exibição de um projeto (`01`–`04`); não é identidade.
- **Gatilho** — elemento da cena que abriu o primeiro dialog de uma cadeia e recebe o foco de volta ao fechar.
- **Tema** — variação visual de uma galeria, escolhida explicitamente.

## 9. Pendências

- **P1** — Conferir no analytics ou nos logs da Vercel se `/images/projects/project-01.webp`, `-02` e `-03` recebem acessos. Só então decidir a exclusão física (D1.13).
- **P2** — Comum a todas as specs; ver o [índice](README.md#pendências-comuns).
- **P3** — Autorização explícita do mantenedor para iniciar esta spec e fazer os commits locais por etapa.
- **P4 — Decidido: opção A.**
  - Usar o Node 22 portátil oficial (zip do nodejs.org, versão 22 LTS exata registrada no manifesto), baixado e extraído numa pasta própria **fora do repositório** (pasta temporária da sessão).
  - Ele é executado pelo caminho completo do binário, sem alterar o PATH, a instalação atual (v26.13.0) nem a configuração global.
  - Antes de usar, a integridade do zip é conferida pelo `SHASUMS256.txt` oficial.
  - O uso se limita a rodar a prova de viabilidade e os testes da camada 2 no repositório.
  - A pasta é removida ao fim desta spec.

## 10. Resultado da Etapa 10

Validação executada em 15 de novembro de 2026 sobre o `fc2cf31`, contra a baseline `7f53175`, com Node 26.13.0 e 22.23.5 e Chrome 157.0.8103.39. Os artefatos ficam fora do repositório (§7.3).

| # | Critério | Resultado |
|---|---|---|
| 1–4 | Estado `null`, rejeições com motivo, "Voltar" e gatilho | Aprovados: testes de navegação e cadeias da parte B do smoke ([§7.4](#74-smoke-de-acessibilidade-e-interação-camada-3)) |
| 5 | Matriz de acessibilidade do §7.4 | Aprovado: smoke com 318/318 verificações em desktop e mobile; C1 e C4 aprovados; C2, C3 e as 60 observações iguais à baseline |
| 6–7 | Textos, atributos e prévias | Aprovados: golden 13/13 igual no Node 22 e no Node 26, sem usar a exceção do §7.3 |
| 8 | Diff visual | Aprovado com uma exceção aceita pelo mantenedor (abaixo) |
| 9 | Roteiro manual com movimento | **Aprovado com ressalva:** conferência manual em desktop e mobile confirmada pelo mantenedor em 15 de novembro de 2026; ressalva registrada abaixo |
| 10 | Performance | Aprovado pelo critério formal do §7.2, com a limitação do Hero (abaixo) |
| 11 | Camada 2 no Node 22 e no Node 26 | Aprovado: 90/90 testes nos dois |
| 12 | Regras antigas cobertas | Aprovado: os 176 IDs do inventário T6.0 têm destino; restam 121 regras e 3 foram aposentadas por decisão ([rastreabilidade](../../tests/unit/RASTREABILIDADE.md)) |

**Exceção visual.** 50 das 51 capturas passaram na tolerância calibrada, sem mudar máscaras, tolerâncias ou referências. A `desktop-1x/02-servicos` reprovou só na primeira letra dos quatro títulos dos cards de Serviços. Em 5 recapturas intercaladas por build, a própria baseline reprovou contra a sua referência em 4; o estado mais frequente saiu idêntico byte a byte nas duas builds, e o `fc2cf31` reproduziu a referência exata duas vezes. O código de Serviços não mudou nesta spec. A divergência foi aceita como variabilidade preexistente da captura, que as 6 execuções da calibração não cobriram. Isso não demonstra equivalência absoluta, nem nessa cena nem nas regiões mascaradas.

**Performance.** Duas séries intercaladas, com ordens opostas, na mesma porta, com 5 amostras por build e cenário e nenhuma falha técnica. Os critérios binários passaram nos três cenários, e nenhuma métrica contínua atendeu às condições de regressão em nenhuma série: ausência de regressão demonstrada, não equivalência. No Hero, a dispersão da baseline (de 53,99 a 59,94 fps na primeira série) não dá resolução para excluir diferenças pequenas; a mediana do `fc2cf31` ficou abaixo nas duas séries, sempre dentro da faixa da baseline e com os intervalos interquartis sobrepostos. Recursos e long tasks da inicialização não foram medidos (Etapa 0 da Spec 0003).

**Ressalva do critério 9: seta "Voltar ao topo" no mobile.** Na conferência manual, a imagem do Hero pareceu travar durante a subida automática pela seta do Footer, e não na rolagem manual. A seta é uma âncora animada pelo Lenis (`anchors: true`, `lerp: 0.08`). Em emulação mobile, o `7f53175` e o `11724c7` tiveram o mesmo perfil: 60 fps, nenhuma long task e uma desaceleração em degraus de 1 px nos últimos pixels antes do topo, com o Hero na tela. A desaceleração em degraus foi reproduzida nas duas versões e é preexistente. Não foi demonstrada regressão da Spec 0001 nesse mecanismo. A causa exata do travamento visual percebido no aparelho real permanece inconclusiva, porque a emulação não reproduz a GPU, a rasterização nem o navegador de um celular real. Lenis, GSAP, CSS e animações não mudam nesta spec; uma melhoria da rolagem por âncoras fica para uma tarefa separada, com avaliação e testes próprios.

**Encerramento da validação local.** Com a conferência manual confirmada, a validação local da Etapa 10 está encerrada. A CI remota e o Preview da Vercel ainda não foram validados nesta etapa; o status da spec segue "Em andamento" até o merge.
