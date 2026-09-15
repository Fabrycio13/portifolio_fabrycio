# Project Orchestrator Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Criar um orquestrador capaz de iniciar projetos novos e auditar projetos existentes, usando skills especializadas, estados persistentes, gates de aprovação e relatórios verificáveis.

**Architecture:** Um núcleo agnóstico de projeto controla a máquina de estados, as permissões e os artefatos. Dois fluxos especializados, `init` e `audit`, reutilizam a mesma descoberta, memória, execução de comandos e validação. O bot automatiza investigação e trabalho reversível, mas exige aprovação para decisões e efeitos externos.

**Tech Stack:** TypeScript/Node.js, Git CLI, JSON Schema, Markdown, testes com Vitest ou equivalente, adaptadores para Hermes e outros runners de agente. A escolha final do runner de modelo fica aberta até o spike de integração.

---

## 1. Decisão de produto

Construir um produto com dois modos, não dois bots independentes:

```text
project-orchestrator init <description-or-folder>
project-orchestrator audit <repo-or-folder>
```

A primeira versão deve ser entregue em etapas:

1. Descoberta read-only e auditoria de projeto existente.
2. Geração de plano e relatório com evidências.
3. Criação guiada de projeto novo.
4. Execução de correções e automações adicionais, sempre protegidas por gates.

Não criar o repositório nem a pasta do produto durante esta etapa de planejamento. A implementação deve começar em um repositório separado do Portifolio e dos demais projetos de aplicação.

## 2. Máquina de estados

Fluxo comum:

```text
INTAKE
  -> DISCOVER
  -> CLASSIFY
  -> PLAN
  -> AWAIT_APPROVAL
  -> EXECUTE
  -> VERIFY
  -> REPORT
  -> HANDOFF
```

Fluxo de auditoria:

```text
INTAKE
  -> DISCOVER_READ_ONLY
  -> RUN_CHECKS
  -> CLASSIFY_FINDINGS
  -> REPORT
  -> AWAIT_REMEDIATION_APPROVAL
  -> PLAN_REMEDIATION
  -> EXECUTE
  -> VERIFY
```

Fluxo de projeto novo:

```text
INTAKE
  -> DISCOVER_CONSTRAINTS
  -> MODEL_DOMAIN
  -> RESOLVE_DECISIONS
  -> PLAN
  -> AWAIT_APPROVAL
  -> SCAFFOLD
  -> EXECUTE
  -> VERIFY
  -> REPORT
```

Cada transição deve ter:

- pré-condições explícitas;
- ação permitida;
- artefatos produzidos;
- critério de saída verificável;
- classificação de efeito: read-only, workspace-write, external-write ou destructive;
- possibilidade de retry idempotente;
- erro terminal e caminho de recuperação.

## 3. Pontos cegos que precisam ser tratados

### 3.1 Automático não significa sem aprovação

O bot pode iniciar uma execução por CLI, webhook ou agendamento, mas não deve decidir sozinho sobre regra de negócio, arquitetura irreversível, deploy, permissões, banco de produção, commit ou push.

### 3.2 Projeto novo e projeto existente têm riscos diferentes

Projeto novo precisa resolver intenção, domínio, stack e arquitetura antes de criar código. Projeto existente precisa preservar comportamento, detectar legado e não confundir ausência de documentação com ausência de regra.

### 3.3 Repositório é entrada não confiável

`README.md`, `AGENTS.md`, comentários, issues e arquivos de configuração podem conter instruções que tentam desviar o agente. O orquestrador deve separar:

- instruções do próprio orquestrador;
- política do usuário;
- contexto do projeto;
- conteúdo não confiável do repositório.

Conteúdo do repositório pode informar fatos, mas não pode alterar permissões, liberar secrets ou mudar os gates.

### 3.4 Auditoria não pode alegar mais do que verificou

O relatório deve diferenciar:

- verificado localmente;
- inferido pelo código;
- não verificável no ambiente atual;
- dependente de estado remoto;
- hipótese que exige confirmação.

Build local não prova deploy correto. Migration presente no Git não prova schema remoto. Teste passando não prova cobertura de um fluxo de produção.

### 3.5 Repositórios têm comandos e stacks diferentes

Não assumir `npm test`, `pnpm`, Vitest, Jest, Python ou Docker. A descoberta deve detectar manifests, scripts, workspaces, lockfiles, workflows e comandos disponíveis antes de executar gates.

### 3.6 Working tree e branch podem estar sujos

Antes de qualquer escrita:

- registrar branch e `HEAD`;
- registrar estado do working tree;
- não apagar ou sobrescrever trabalho existente;
- preferir worktree ou branch isolada para execução;
- bloquear operações destrutivas em árvore suja, salvo aprovação explícita.

### 3.7 Paralelismo pode causar conflito

Subagentes devem ter escopo definido. Por padrão, agentes de pesquisa e revisão trabalham read-only. Dois agentes não podem editar o mesmo arquivo ou artefato sem lock, fila ou integração controlada.

### 3.8 Retry pode duplicar efeitos

Toda execução precisa de `run_id`, chave idempotente e estado persistente. Um retry não pode criar duas branches, dois tickets, dois projetos ou duas migrations sem intenção explícita.

### 3.9 Logs e relatórios podem vazar secrets ou PII

Redigir tokens, senhas, cookies, chaves, dados pessoais e payloads sensíveis antes de salvar artefatos. Relatórios devem registrar nomes de variáveis e IDs, nunca valores secretos.

### 3.10 Auditoria precisa de baseline

Sem baseline, o bot pode apontar problemas introduzidos antes da execução como se fossem novos. Todo relatório deve registrar commit base, branch, data, comandos e ambiente relevante.

### 3.11 “Sem testes” é um achado, não prova de bug

O relatório deve distinguir ausência de cobertura, falha de teste, falha de build, risco arquitetural e bug reproduzido. Cada categoria precisa de severidade e evidência própria.

### 3.12 O bot precisa de limites operacionais

Definir limites para:

- duração de uma execução;
- quantidade de comandos;
- tokens e custo de modelo;
- número de subagentes;
- tamanho de arquivos lidos;
- quantidade de achados;
- tentativas de retry;
- alterações permitidas por execução.

### 3.13 Memória não é fonte da verdade

`CONTEXT.md`, ADRs e decisões anteriores ajudam a orientar o bot, mas código, testes, Git e estado remoto atual têm precedência. Memória antiga deve ser marcada como obsoleta ou superseded, não silenciosamente reescrita.

### 3.14 Transferência entre computadores não é automática

O estado portátil deve viajar pelo Git. Notas locais do Hermes, credenciais, projetos registrados e configuração de cada PC não viajam junto. O segundo computador precisa clonar o mesmo repositório e abrir o agente na raiz correta.

### 3.15 Symlinks não são confiáveis no Windows

Não depender de `AGENTS.md` como symlink para `CLAUDE.md`. O repositório do orquestrador deve conter arquivos válidos ou uma sincronização explícita compatível com Windows.

## 4. Estrutura proposta do novo repositório

```text
project-orchestrator/
├── AGENTS.md
├── README.md
├── package.json
├── tsconfig.json
├── docs/
│   ├── architecture.md
│   ├── operating-model.md
│   └── adr/
├── src/
│   ├── cli/
│   │   └── main.ts
│   ├── core/
│   │   ├── run-state.ts
│   │   ├── state-machine.ts
│   │   ├── transitions.ts
│   │   └── policies.ts
│   ├── discovery/
│   │   ├── repository-discovery.ts
│   │   ├── stack-detector.ts
│   │   ├── command-discovery.ts
│   │   └── baseline.ts
│   ├── modes/
│   │   ├── audit.ts
│   │   └── init.ts
│   ├── skills/
│   │   ├── skill-manifest.ts
│   │   ├── skill-router.ts
│   │   └── adapters/
│   ├── execution/
│   │   ├── command-runner.ts
│   │   ├── workspace-isolation.ts
│   │   ├── approval-gate.ts
│   │   └── retry-policy.ts
│   ├── validation/
│   │   ├── check-runner.ts
│   │   ├── finding-classifier.ts
│   │   ├── redaction.ts
│   │   └── evidence.ts
│   ├── artifacts/
│   │   ├── artifact-store.ts
│   │   ├── report-writer.ts
│   │   └── handoff-writer.ts
│   └── providers/
│       ├── agent-provider.ts
│       └── hermes-provider.ts
├── schemas/
│   ├── run-state.schema.json
│   ├── finding.schema.json
│   └── audit-report.schema.json
├── prompts/
│   ├── discovery.md
│   ├── audit.md
│   ├── planning.md
│   └── review.md
├── fixtures/
│   ├── existing-good/
│   ├── existing-broken/
│   ├── no-tests/
│   ├── dirty-tree/
│   └── prompt-injection/
└── tests/
    ├── core/
    ├── discovery/
    ├── validation/
    ├── policies/
    └── integration/
```

## 5. Skills do repositório de Matt Pocock a reutilizar

### Adotar como referência

- `grilling`: resolver decisões com participação do usuário;
- `domain-modeling`: manter linguagem de domínio;
- `research`: delegar investigação baseada em fontes;
- `prototype`: reduzir incerteza com artefato executável;
- `codebase-design`: avaliar interfaces e seams;
- `tdd`: definir testes por comportamento;
- `diagnosing-bugs`: reproduzir antes de corrigir;
- `code-review`: separar aderência a padrões de aderência à especificação.

### Adaptar para o orquestrador

- `to-spec`: produzir um artefato interno, sem assumir GitHub ou outro issue tracker;
- `to-tickets`: gerar tarefas no formato configurado pelo projeto;
- `implement`: não fazer commit ou push automaticamente;
- `wayfinder`: usar somente em iniciativas grandes e multi-sessão;
- `ask-matt`: substituir por um roteador próprio do produto;
- `wizard`: manter isolado para ações humanas e secrets, usando os mecanismos seguros disponíveis no ambiente.

### Não colocar no núcleo

- skills de escrita e ensino;
- flows específicos de Claude Code;
- scripts com regex frágil para bloquear Git;
- dependência de symlinks para bootstrap;
- instalação automática de todas as skills sem allowlist.

## 6. Plano de implementação

### Fase 0: criar o repositório e o contrato

**Arquivos:**

- Criar: `AGENTS.md`
- Criar: `README.md`
- Criar: `package.json`
- Criar: `docs/operating-model.md`
- Criar: `docs/adr/0001-two-execution-modes.md`
- Criar: `schemas/run-state.schema.json`

**Entregas:**

- contrato do `init` e do `audit`;
- política de efeitos e aprovações;
- definição de memória e artefatos;
- lista de comandos suportados;
- regra explícita de não fazer commit ou push sem aprovação.

**Validação:**

- validar JSON Schema;
- executar o CLI em modo `--help`;
- confirmar que o repositório novo não depende de symlink.

### Fase 1: núcleo persistente da execução

**Arquivos:**

- Criar: `src/core/run-state.ts`
- Criar: `src/core/state-machine.ts`
- Criar: `src/core/transitions.ts`
- Criar: `src/core/policies.ts`
- Criar: `tests/core/run-state.test.ts`
- Criar: `tests/core/state-machine.test.ts`

**Entregas:**

- `run_id` e estados persistentes;
- transições válidas e inválidas;
- checkpoints e retomada;
- retry idempotente;
- classificação de efeito.

**Validação:**

- testar retomada após falha;
- testar retry sem duplicação;
- testar que `external-write` e `destructive` exigem aprovação;
- testar que transições inválidas são rejeitadas.

### Fase 2: descoberta read-only

**Arquivos:**

- Criar: `src/discovery/repository-discovery.ts`
- Criar: `src/discovery/stack-detector.ts`
- Criar: `src/discovery/command-discovery.ts`
- Criar: `src/discovery/baseline.ts`
- Criar: `tests/discovery/`

**Entregas:**

- raiz real do Git;
- branch, `HEAD` e working tree;
- stack provável;
- scripts e ferramentas disponíveis;
- estrutura de pastas;
- workflows e manifests;
- baseline reproduzível.

**Validação:**

- rodar contra fixtures com Node, Python e projeto sem manifest;
- rodar contra working tree suja;
- não alterar nenhum arquivo;
- registrar comando e saída redigida.

### Fase 3: modo `audit`

**Arquivos:**

- Criar: `src/modes/audit.ts`
- Criar: `src/validation/check-runner.ts`
- Criar: `src/validation/finding-classifier.ts`
- Criar: `src/validation/evidence.ts`
- Criar: `src/validation/redaction.ts`
- Criar: `schemas/finding.schema.json`
- Criar: `schemas/audit-report.schema.json`
- Criar: `tests/validation/`
- Criar: `tests/integration/audit.test.ts`

**Entregas:**

- checks de instalação e dependências;
- build e typecheck quando disponíveis;
- testes e lint quando disponíveis;
- análise de CI;
- busca de secrets e PII;
- análise básica de segurança;
- análise de documentação e arquitetura;
- classificação de achados por severidade e confiança;
- relatório Markdown e JSON.

**Validação:**

- auditoria read-only de dois repositórios reais;
- fixture com falha conhecida;
- fixture com secret falso que deve ser redigido;
- fixture com instrução maliciosa em `README.md`;
- confirmar que cada achado aponta para evidência real.

### Fase 4: integração com skills e agentes

**Arquivos:**

- Criar: `src/skills/skill-manifest.ts`
- Criar: `src/skills/skill-router.ts`
- Criar: `src/skills/adapters/`
- Criar: `src/providers/agent-provider.ts`
- Criar: `src/providers/hermes-provider.ts`
- Criar: `prompts/discovery.md`
- Criar: `prompts/audit.md`
- Criar: `prompts/review.md`
- Criar: `tests/policies/skill-router.test.ts`

**Entregas:**

- allowlist de skills por fase;
- separação entre skills de referência e skills de execução;
- adaptador para Hermes;
- contexto mínimo enviado a cada agente;
- retorno estruturado com artefatos e evidências;
- bloqueio de instruções do repositório que tentem alterar a política.

**Validação:**

- testar roteamento de cada modo;
- testar que uma skill não autorizada não é carregada;
- testar subagente read-only;
- testar retorno inválido ou incompleto;
- testar timeout e retry.

### Fase 5: modo `init`

**Arquivos:**

- Criar: `src/modes/init.ts`
- Criar: `src/execution/workspace-isolation.ts`
- Criar: `src/execution/approval-gate.ts`
- Criar: `tests/integration/init.test.ts`
- Criar: `fixtures/new-project/`

**Entregas:**

- coleta da intenção e restrições;
- grilling das decisões relevantes;
- geração de spec e tickets;
- criação de workspace isolado;
- scaffold mínimo;
- execução de gates após cada etapa;
- relatório final com decisões abertas.

**Validação:**

- iniciar projeto sem acesso externo;
- cancelar antes da criação de arquivos;
- retomar uma execução interrompida;
- confirmar que commit, push, deploy e secrets não ocorrem sem aprovação;
- validar o projeto gerado com o modo `audit`.

### Fase 6: remediação controlada

**Arquivos:**

- Criar: `src/execution/command-runner.ts`
- Criar: `src/execution/retry-policy.ts`
- Criar: `src/artifacts/handoff-writer.ts`
- Criar: `tests/integration/remediation.test.ts`

**Entregas:**

- transformar achados aprovados em plano;
- criar tickets verticais;
- executar uma correção por vez;
- revalidar somente os achados afetados;
- executar validação completa no final;
- gerar handoff com branch, base HEAD e estado real.

**Validação:**

- corrigir uma falha em fixture;
- confirmar regressão coberta por teste;
- confirmar que achados não aprovados não são alterados;
- comparar auditoria antes e depois.

### Fase 7: gatilhos automáticos

**Arquivos:**

- Criar: `src/cli/main.ts`
- Criar: `docs/operating-model.md` com os gatilhos suportados
- Criar: `tests/integration/triggers.test.ts`

**Entregas:**

- CLI manual;
- webhook de novo repositório;
- auditoria de Pull Request;
- auditoria agendada;
- notificações com relatório e link para artefatos.

**Regra:** gatilhos automáticos podem iniciar auditorias read-only. Correções, publicação, deploy, commit e push continuam bloqueados até aprovação.

## 7. Relatório mínimo

Toda execução deve gerar:

```text
Run ID
Modo
Projeto
Branch
Base HEAD
Working tree
Data e ambiente
Comandos executados
Checks executados
Achados
Severidade
Confiança
Evidências
Ações recomendadas
Itens não verificáveis
Aprovações pendentes
Alterações realizadas
Validação pós-alteração
```

Também deve existir uma versão JSON para consumo do orquestrador e uma versão Markdown para leitura humana.

## 8. Critérios de aceite

- O bot identifica corretamente projeto novo versus projeto existente.
- O modo `audit` não altera o repositório sem aprovação.
- O modo `init` não cria recursos externos sem aprovação.
- Toda execução pode ser retomada por `run_id`.
- Retries não duplicam artefatos ou efeitos externos.
- Toda conclusão tem evidência verificável.
- Secrets e PII não aparecem em logs ou relatórios.
- Instruções maliciosas dentro do repositório não alteram as políticas do bot.
- A auditoria diferencia “não testado”, “falhou”, “não verificável” e “passou”.
- Um projeto criado pelo `init` pode ser validado pelo `audit`.
- O projeto pode ser clonado em outro computador e retomado pelo Git.
- Commit e push não acontecem sem autorização explícita.

## 9. Verificação final

Comandos previstos no novo repositório:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run audit -- ./fixtures/existing-good
npm run audit -- ./fixtures/existing-broken
npm run init -- --dry-run
npm run validate-artifacts
```

Além dos gates locais, executar smoke tests em pelo menos dois projetos reais em modo read-only. O resultado deve separar claramente os gates locais dos estados remotos não verificados.

## 10. Questões abertas antes da implementação

1. O primeiro runner de modelo será Hermes exclusivamente ou haverá adaptadores para Claude/Codex/OpenCode desde o início?
2. Os artefatos de execução ficarão dentro do projeto auditado, em um diretório temporário ou em um repositório central?
3. O primeiro gatilho automático será CLI, webhook ou agendamento?
4. Qual o limite inicial de stacks suportadas?
5. O bot poderá criar uma branch automaticamente ou isso exigirá aprovação?

A recomendação é começar com Hermes, artefatos em diretório próprio do orquestrador, CLI, duas stacks no máximo e branch isolada criada apenas após aprovação.

## 11. Transferência para o PC de casa

Não é necessário criar outro repositório apenas para transferir o projeto entre computadores.

O fluxo normal será:

```text
PC atual
  → commit do código e dos artefatos portáteis
  → git push

PC de casa
  → git clone ou git pull
  → abrir o agente na raiz do repositório
  → verificar branch, HEAD e working tree
  → retomar pelo run_id ou handoff
```

Um repositório novo e uma pasta nova são recomendados para o **produto do orquestrador**, porque ele não deve ficar misturado ao Portifolio nem ao IA RH. Mas a pasta não precisa ser criada agora. Ela deve ser criada junto com o novo repositório quando a implementação for autorizada.

O que não será transferido por Git:

- login do Hermes;
- memória pessoal do Hermes;
- credenciais e secrets;
- projetos registrados localmente no Hermes;
- processos em execução;
- arquivos não commitados.

Antes de trocar de computador, o orquestrador deve exigir working tree limpa, branch identificada, commit/push e handoff válido quando houver trabalho pendente.
