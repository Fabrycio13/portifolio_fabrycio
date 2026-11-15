# Retrospectiva — Spec 0001

- **Data:** 15 de novembro de 2026
- **Spec:** [0001 — Registro de projetos, navegação de dialogs e galeria única](../specs/0001-registro-projetos-dialogs-galeria.md)
- **PRs:** [#22](https://github.com/Fabrycio13/portifolio_fabrycio/pull/22) (implementação) e [#23](https://github.com/Fabrycio13/portifolio_fabrycio/pull/23) (encerramento documental)

## Resultado

- **PR #22:** 25 commits e 57 arquivos (+3920/−1256), mesclada em `2fc2221`, cuja árvore é idêntica à do `1096c7a` validado. A produção serve os assets dessa build.
- **PR #23:** encerramento formal (status "Concluída", com PR e merge registrados), mesclada em `8e5953d`.
- Nenhuma regressão funcional demonstrada. As ressalvas estão na seção 10 da Spec: variação visual local, resolução limitada da medição do Hero, seta "Voltar ao topo" no mobile e foco nos iframes das demos.

## O que funcionou

- **Baseline servida ao lado da build nova:** recapturas intercaladas, o diagnóstico da seta mobile e as séries de performance responderam com dados se cada anomalia era regressão ou preexistente.
- **Golden temporário e smoke com baseline gravada:** conteúdo, markup, foco e semântica comparados com a baseline em cada etapa.
- **Conferências mecânicas:** rastreabilidade dos 176 IDs, links e caminhos da documentação, e `merge-tree` antes da PR.
- **Commits por etapa com autorização explícita**, incluindo a renomeação isolada.

## Problemas e causas

| Problema | Causa |
|---|---|
| `desktop-1x/02-servicos` reprovou localmente; a própria baseline reprovava contra a sua referência em 4 de 5 recapturas | A calibração com 6 execuções não revelou os estados discretos de renderização dos glifos, e a regra de aceitação foi decidida depois do fato |
| O adaptador de acesso ao Preview marcou como inválidas execuções que exigiam o portfólio autenticado | A regra implementada (a regex casava com o próprio host do Preview) diferia do critério declarado e não foi testada contra um caso bom e um ruim antes do uso |
| O item "porta" da Etapa 9 só apareceu na revisão | O critério de conclusão da etapa (`git diff --check`) não verificava cada item listado |
| A medição de performance do Hero não teve resolução para concluir | A dispersão alta da baseline só foi descoberta depois de duas séries |
| Custo alto: Etapa 6 em seis subetapas, validação local e remota, muitas rodadas de autorização | Escopo amplo de reorganização de testes e protocolo de performance completo numa refatoração que não tocou animação |

## Evidências

- Seção 10 da Spec 0001: matriz dos 12 critérios, exceção visual, performance, ressalva do critério 9 e encerramento.
- [`tests/unit/RASTREABILIDADE.md`](../../tests/unit/RASTREABILIDADE.md): destino de cada regra de teste.
- [ADR 0002](../decisions/0002-registro-de-projetos-e-dialogs.md): decisões arquiteturais.
- Artefatos de validação (golden, smoke, capturas, séries de performance, diagnóstico mobile e validação do Preview): fora do repositório, guardados pelo mantenedor, conforme o §7.3 da Spec 0001.

## Melhorias aprovadas

1. **Verificadores com controles:** todo verificador que decide se uma execução vale passa, antes do uso, por um controle positivo (um caso que deve aprovar) e um negativo (um caso que deve reprovar), com o resultado anexado às evidências.
2. **Critérios visuais definidos antes:** calibração suficiente para revelar a variabilidade de cada cena e regra de aceitação escrita antes da comparação. Um estado observado na baseline não é aceito automaticamente.
3. **Rastreabilidade proporcional:** cada critério de aceite aponta a evidência que o demonstra, registrada na própria spec, sem documentos extras.

Prática mantida: toda anomalia é comparada com a baseline antes de ser classificada como regressão.

## Recomendações para as Specs 0002 e 0003

- **0002:** aplicar as três melhorias desde a revisão da spec: controles para o teste do DOM do Footer e para o teste de pureza de `src/data/`, critérios visuais e calibração definidos antes, e a tabela critério → evidência. Performance proporcional ao risco, com gatilhos explícitos para a medição completa.
- **0003:** corrigir as lacunas do `perf-audit` (recursos e long tasks da inicialização) antes de medir, e declarar de antemão quando a medição não tem resolução. Se houver validação no Preview, a autenticação deve vir com controles e com o registro da primeira resposta de documento.
- **Pendências herdadas:** remoção da pasta do Node 22 portátil (P4), P1, frase desatualizada em `docs/specs/README.md:14`, melhoria da rolagem por âncoras e foco nos iframes das demos.
