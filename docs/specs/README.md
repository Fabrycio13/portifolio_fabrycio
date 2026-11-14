# Especificações

Especificações de evolução do portfólio. Cada uma descreve um conjunto de mudanças aprovado antes da implementação: decisões, etapas, critérios de aceite, riscos e validações.

## Origem

As três specs nasceram da [revisão arquitetural de 14/11/2026](../reviews/2026-11-14-revisao-arquitetural.md), das investigações de [performance](../reviews/2026-11-14-investigacao-performance.md) e de [organização](../reviews/2026-11-14-investigacao-organizacao.md), e das [decisões arquiteturais](../reviews/2026-11-14-decisoes-arquiteturais.md) tomadas a partir delas. O vocabulário segue o [`GLOSSARY.md`](../../GLOSSARY.md). Índice geral da documentação: [`docs/README.md`](../README.md).

## Convenção

- **Arquivo:** `NNNN-slug.md`, numerado em sequência, como em `docs/decisions/`.
- **Cabeçalho:** data, status, branch e dependências.
- **Status possíveis:** `Aprovada — não iniciada`, `Em andamento`, `Concluída`, `Substituída`.
- **Spec × ADR:** a spec descreve *o que será feito e como validar*. Decisões arquiteturais permanentes ficam em `docs/decisions/`. A ADR 0002 será criada na etapa 9 da Spec 0001 e não faz parte destes documentos.
- Uma spec não autoriza commit, push, PR, merge ou deploy (`AGENTS.md` §4 e §8).

## Índice

| Spec | Título | Status | Depende de | Branch |
|---|---|---|---|---|
| [0001](0001-registro-projetos-dialogs-galeria.md) | Registro de projetos, navegação de dialogs e galeria única | Aprovada — não iniciada | — | `refactor/registro-projetos-dialogs` |
| [0002](0002-dados-estaticos.md) | Centralização e organização dos dados estáticos | Aprovada — não iniciada | 0001 (merge na `main`) | `refactor/dados-estaticos` |
| [0003](0003-performance-baseada-em-evidencias.md) | Performance baseada em evidências | Aprovada — não iniciada | 0001 (merge na `main`) | `perf/evidencias` |

```text
0001 Registro de projetos, dialogs e galeria
 ├──► 0002 Dados estáticos
 └──► 0003 Performance baseada em evidências   (não depende da 0002)
```

**Ordem preferencial:** 0001 → 0002 → 0003. A 0003 pode começar logo depois do merge da 0001, mesmo com a 0002 em aberto: a dependência técnica dela é só a 0001, que entrega o smoke de browser, o golden e a reorganização dos testes.

Os protocolos de validação compartilhados (validação visual, performance, golden e manifesto, smoke de acessibilidade) são definidos na [Spec 0001 §7](0001-registro-projetos-dialogs-galeria.md#7-protocolos-de-validação-compartilhados), porque é ela que cria os scripts. As Specs 0002 e 0003 os reutilizam.

## Contexto verificado (14/11/2026)

| Item | Fato |
|---|---|
| Branch local | `feat/adaptive-video-performance` @ `7f53175`, sem alterações, sincronizada com a origin |
| Produção | `main` @ `814cb2a` (merge do PR 20). A Vercel publica em produção a partir da `main`; as outras branches geram Preview |
| Divergência | `7f53175` está todo contido na `main`; a única diferença de conteúdo é o `LICENSE` |
| Clone local | O refspec busca só `feat/adaptive-video-performance`. `origin/main` não existe localmente |
| Node | Local: v26.13.0 (única instalação encontrada). CI: Node 22 (`.github/workflows/ci.yml`) |
| Testes | 24/24 ✔ (todos por regex sobre o código-fonte) · lint 0 avisos · build ✔ · `git diff --check` ✔ |
| Performance (Chrome 157, 1280×801 e 390×844 @3x, execução única por cenário) | FCP/LCP de cerca de 0,5 s · CLS 0,003 · cerca de 60 FPS · long task de 218–270 ms na inicialização (três execuções), atribuída ao WebGL do `WarpText` · 736 kB no load inicial do desktop. **Números exploratórios, que não servem de baseline:** poucas execuções e nenhum registro de dispersão |
| Render estático | Prova de viabilidade OK nos 13 dialogs, incluindo a demo Nexus, **só no Node 26**: Vite `ssrLoadModule` + `react-dom/server`, React carregado por `createRequire`, 0,58 s |
| ADRs | `docs/decisions/` contém apenas `0001-estrutura-do-portfolio.md`. O `AGENTS.md` define `docs/decisions/` como local dos ADRs |
| `motion` | Três consumidores: `DecryptedText` (chunk principal, via `App.jsx`), `BlurText` (chunk lazy de `StickyServices`) e `StickyProjects` (chunk lazy; usa `motion.path` + `useMotionValue`) |
| Reduced-motion | Comportamento real de cada componente mapeado na Spec 0003, Etapa 1 (lido no código; não executado) |
| Semântica dos dialogs (`7f53175`) | Os 13 dialogs já têm `role="dialog"`, `aria-modal`, `aria-labelledby` e `data-dialog-initial-focus` |
| Iframes das demos | Cindy (`/nova-cindy-mockup-v2.html`) e Phx (`/phx-demo.html`) são servidos pela **mesma origem** do portfólio. Nenhum dos dois HTML tem handler de `keydown`, de `Escape` ou `postMessage`. O `<iframe>` é o último elemento do dialog |

## Invariantes (valem para todas as specs)

1. **Preservação por padrão:** o comportamento normal e a identidade visual (textos, ordem, rótulos, imagens, alt texts, interações e animações) são preservados. Nenhuma mudança estética.
   - Uma alteração de comportamento só é permitida quando está **expressamente prevista** numa spec e tem **validação própria**. As previstas são estas:

     | Spec | Alteração prevista | Validação própria |
     |---|---|---|
     | 0001 | O clique na prévia da galeria People passa a enviar o identificador correto, em vez do evento. O resultado visível é o mesmo | Camada 1 + smoke da galeria People |
     | 0001 | Transições inválidas são rejeitadas, com `console.error` só em desenvolvimento, em vez de cair num dialog de fallback | Camada 1 (todas as combinações) |
     | 0001 | `preserveTrigger` é substituído pela regra de capturar o gatilho só a partir de `null`. O comportamento observável é o mesmo | Smoke de acessibilidade (0001 §7.4) |
     | 0003 | Loops de rAF de `WarpText` e `WaveFooter` deixam de rodar continuamente com reduced-motion, e o `WaveFooter` passa a reagir à troca da preferência durante a execução. O quadro estático é o mesmo | 0003, Etapa 1 (reduced-motion) |
     | 0003 | Experimentos da Etapa 2, somente se aprovados | 0001 §7.2 + diff visual + roteiro manual |

   - Qualquer outra diferença de comportamento encontrada durante a implementação é tratada como regressão.
2. Regras do `AGENTS.md` §3: `EXPLORAR MEU TRABALHO` → `#servicos`; `ENTRAR EM CONTATO` abre o Contato sem desmontar a cena; dialogs preservam o contexto; cards operáveis por mouse, toque, `Enter` e `Space`; foco inicial, focus trap, `Escape` e retorno de foco; `DeferredSection` com fallback que não colapsa a geometria; efeitos (GSAP, ScrollTrigger, Lenis, OGL, canvas, tipografia) intactos; links públicos preservados.
3. Imports diretos dos dialogs pequenos (sem lazy).
4. Nenhuma dependência nova sem justificativa técnica demonstrada.
5. Nenhum teste removido sem um sucessor ou um motivo registrado.
6. Nenhuma exclusão sem segurança comprovada.
7. Nenhuma meta de FPS ou de ganho é declarada sem medição. Ganho só é afirmado conforme 0001 §7.2.

## Fluxo Git (todas as specs)

- **Atualização do fetch (pré-requisito da Spec 0001):**
  - adicionar o refspec `+refs/heads/main:refs/remotes/origin/main` no `.git/config` **deste repositório**;
  - executar o fetch;
  - **confirmar** que `refs/remotes/origin/main` existe (`git rev-parse --verify origin/main`) e que aponta para o mesmo SHA de `git ls-remote origin refs/heads/main`. Atualizar só o `FETCH_HEAD` não basta.
- **Branches:**
  - a 0001 parte de `origin/main` atualizada;
  - **as Specs 0002 e 0003 partem de `origin/main` atualizada contendo o merge da 0001.** Antes de criar a branch, confirma-se que o merge da 0001 é ancestral de `origin/main`.
- `safe.directory` passado por comando; a configuração global não é alterada.
- Commits locais autorizados uma vez por spec. Push, PR e merge autorizados um a um. O merge na `main` é sempre feito pelo mantenedor, sem auto-merge.
- Verificações proporcionais por etapa e validação completa antes da PR.
- **Limites vigentes:** commits locais só depois da autorização da spec. Push e PR, cada um só com autorização individual. Nenhum merge e nenhum deploy em produção são feitos pelo agente.

## Adiados (fora destas specs)

| Candidato | Motivo |
|---|---|
| Contrato explícito dos dialogs (seletor `.info-panel.is-open, .people-gallery.is-open`) | Avaliação posterior; vai mexer no mesmo seletor que a reorganização do CSS |
| Demo iframe única (Cindy/Phx) | Etapa futura; Nexus permanece independente |
| CSS: estilos de dialog fora do `App.css`, cerca de 400 linhas de CSS morto, renomeação `people-gallery` → `project-gallery` | Etapa independente com comparação visual |

## Pendências comuns

- **P2** — Confirmar no painel da Vercel que a branch de produção é a `main`. Os deployments registrados no GitHub indicam que sim.
- As pendências específicas (P1, P3, P4) estão na [Spec 0001 §9](0001-registro-projetos-dialogs-galeria.md#9-pendências).
