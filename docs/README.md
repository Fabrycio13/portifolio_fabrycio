# Documentação

Índice da documentação do portfólio. Comece pelo `AGENTS.md` (regras de trabalho) e pelo README da raiz (visão geral).

## Mapa

| Local | Papel | Natureza |
|---|---|---|
| [`../GLOSSARY.md`](../GLOSSARY.md) | Linguagem do domínio: cena, dialogs, projetos, slug, gatilho | Vigente; atualizado quando um termo muda |
| [`architecture.md`](architecture.md) | Arquitetura vigente: estrutura, carregamento, interações e limites de responsabilidade | Vigente; acompanha o código |
| [`development.md`](development.md) | Requisitos, comandos, gates locais e deploy | Vigente |
| [`performance-baseline.md`](performance-baseline.md) | Método e baseline da auditoria de performance | Vigente; substituída na Etapa 0 da Spec 0003 |
| [`decisions/`](decisions/) | ADRs: decisões arquiteturais permanentes (`NNNN-slug.md`) | Permanente |
| [`specs/`](specs/README.md) | Especificações aprovadas, com índice, dependências, invariantes e fluxo Git | Ciclo de vida: aprovada → em andamento → concluída |
| [`reviews/`](reviews/) | Análises datadas que originaram decisões e specs | Histórico; não é editado depois de publicado, salvo errata |
| [`security/audits/`](security/audits/) | Auditorias de segurança datadas | Histórico |

## Convenções

- **ADRs ficam em `docs/decisions/`,** não em `docs/adr/`. Ferramentas e skills que procuram `docs/adr/` devem usar `docs/decisions/` neste repositório.
- **O glossário fica na raiz** (`GLOSSARY.md`), onde as skills de arquitetura e modelagem de domínio o procuram.
- **Specs** seguem `NNNN-slug.md` com cabeçalho de data, status, branch e dependências ([convenção](specs/README.md#convenção)).
- **Relatórios históricos** (`reviews/`, `security/audits/`) usam o prefixo `AAAA-MM-DD-` e registram o snapshot analisado. Correções posteriores entram como errata no próprio relatório.
- **Artefatos de validação** (golden HTML, screenshots, diffs e saídas brutas do `perf-audit`) não são versionados ([Spec 0001 §7.3](specs/0001-registro-projetos-dialogs-galeria.md#73-golden-capturas-e-manifesto)).

## Rastro da evolução de 14/11/2026

1. [Revisão arquitetural](reviews/2026-11-14-revisao-arquitetural.md) ([HTML original](reviews/2026-11-14-revisao-arquitetural.html)): seis candidatos de aprofundamento.
2. Investigações de [performance](reviews/2026-11-14-investigacao-performance.md) e de [organização do repositório](reviews/2026-11-14-investigacao-organizacao.md).
3. [Decisões arquiteturais](reviews/2026-11-14-decisoes-arquiteturais.md): rodadas de decisão e histórico das revisões das specs.
4. [Specs 0001–0003](specs/README.md): trabalho aprovado.
5. ADR 0002: será criada na etapa 9 da Spec 0001.
