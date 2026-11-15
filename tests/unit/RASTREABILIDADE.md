# Rastreabilidade dos testes — Spec 0001

Registro obrigatório da [Spec 0001 §3](../../docs/specs/0001-registro-projetos-dialogs-galeria.md#3-testes): toda asserção antiga removida ou alterada aponta para a regra que protegia e para o teste que passou a protegê-la. Nenhuma regra fica sem cobertura.

Arquivo de origem das asserções antigas: `tests/unit/portfolio-contract.test.mjs` (abreviado como **contrato**).

## Etapa 6 / T6.4 — remoção de duplicações e sobreposições

Removidas do contrato **23 regras** que já tinham um teste igual ou mais forte rodando no CI. Continuam intactas as regras parciais e permanentes do T6.2, as da Etapa 7 (CT-17-05, CT-21-06, CT-21-07), o CT-17-06 (coberto pelo render dos detalhes, mas mantido por ser permanente no T6.2), o CT-19-06 (seletor do trap de foco) e os regex de CSS.

**Teste novo antes da remoção (grupo C):** em `project-registry.test.mjs`, o teste `galerias têm tema explícito, rótulos e telas válidas e não vazias` ganhou uma asserção que fixa o tema de cada projeto (`people → null`, `cindy → 'cindy'`, `phx → 'phx'`, `nexus → 'nexus'`). Antes dela, trocar o tema da Cindy para `'phx'` passava no `project-registry` (o valor é permitido) e na camada 2 de `project-gallery` (a classe esperada vem do próprio registro); só o contrato detectava. Com ela, o teste falha.

**Prova de equivalência, feita antes de cada remoção:** 16 mutações, cobrindo os 23 IDs, aplicadas no código e testadas contra o contrato antigo e contra o teste substituto, e depois revertidas. O substituto detectou 16/16; o contrato antigo, 15/16. A que ele não detectava é do CT-07-01: remover a captura do gatilho, que o contrato não percebia porque só procurava o nome `lastTriggerRef`.

**Conferência mecânica:** o diff do contrato desde `1c5aec3`, mapeado pela evidência `arquivo:linha` do inventário T6.0, tem 53 asserções removidas: as 30 do T6.3 e exatamente os 23 IDs desta tabela.

| ID | Regra | Teste substituto | Mutação que demonstra a equivalência |
|---|---|---|---|
| CT-07-01 | App guarda o gatilho | `app-dialog-state` `gatilho só é capturado quando o módulo indica abertura a partir de null` | Renomear a ref (os dois falham) e remover a captura do gatilho (só o substituto falha) |
| CT-07-02 | App trata `Escape` | `app-dialog-state` `Escape fecha pelo módulo de navegação` | `event.key === 'Escape'` trocado por `'Esc'` |
| CT-12-01 | Subtítulo do People | `project-dialogs-render` `detalhes do People: subtítulo, prévia com 7 telas e sem demo` | Subtítulo alterado no registro |
| CT-13-01 | Título da Gestão Condominial | `project-dialogs-render` `detalhes da Gestão Condominial: copy confidencial aprovada…` | Título alterado no registro |
| CT-13-02 | Subtítulo da Gestão Condominial | `project-dialogs-render` `detalhes da Gestão Condominial: copy confidencial aprovada…` | Subtítulo alterado no registro |
| CT-14-03 | App importa a galeria única | `app-dialog-state` `App renderiza a galeria única para o slug do estado…` | Import da galeria fora do alias `@/` |
| CT-14-04 | App renderiza a galeria pelo slug, com `key` | `app-dialog-state` `App renderiza a galeria única para o slug do estado…` | `key={dialog.slug}` removida |
| CT-14-05 | Tema da Cindy | `project-registry` `galerias têm tema explícito…` (asserção nova) | Tema da Cindy trocado para `'phx'` |
| CT-14-08 | Miniaturas indicam a tela ativa | `project-gallery` `galeria de <slug>: dialog, tema, rótulos e primeira tela…` | `aria-pressed` invertido |
| CT-16-01 | A prévia abre a galeria pelo slug | `project-gallery-preview` `prévia da galeria do projeto <slug> abre a galeria "<slug>" pelo identificador` | A prévia envia sempre `'people'` |
| CT-16-02 | App importa a galeria única | Como CT-14-03 | Como CT-14-03 |
| CT-16-03 | App renderiza a galeria pelo slug, com `key` | Como CT-14-04 | Como CT-14-04 |
| CT-16-04 | Tema da Nexus | `project-registry` (asserção nova) | Tema da Nexus trocado para `'cindy'` |
| CT-18-01 | A prévia abre a galeria pelo slug | Como CT-16-01 | Como CT-16-01 |
| CT-18-02 | App importa a galeria única | Como CT-14-03 | Como CT-14-03 |
| CT-18-03 | App renderiza a galeria pelo slug, com `key` | Como CT-14-04 | Como CT-14-04 |
| CT-18-04 | Tema da PHX | `project-registry` (asserção nova) | Tema da PHX trocado para `'nexus'` |
| CT-19-01 | Prévia com `VER TELAS DO PROJETO` | `project-dialogs-render` `detalhes do People…` | Rótulo da prévia alterado |
| CT-19-02 | Detalhes oferecem a ação de galeria | `project-gallery-preview` (o handler da prévia é chamado) | `onOpenGallery` removido dos detalhes |
| CT-19-03 | App importa a galeria única | Como CT-14-03 | Como CT-14-03 |
| CT-19-04 | App renderiza a galeria pelo slug, com `key` | Como CT-14-04 | Como CT-14-04 |
| CT-19-05 | Tema do People | `project-registry` (asserção nova) | Tema do People trocado para `'cindy'` |
| CT-19-07 | Miniaturas indicam a tela ativa | Como CT-14-08 | Como CT-14-08 |

**Testes do contrato afetados:**
- CT-12 (`Projeto People usa GERENCIADOR…`), CT-13 (`Projeto 02 mantém a copy confidencial…`), CT-16 (`Projeto Nexus AI abre uma galeria…`) e CT-18 (`Projeto PHX abre uma galeria…`) ficaram sem asserções e saíram.
- CT-07: renomeado de `PortfolioContent mantém gerenciamento de foco e Escape nos dialogs` para `PortfolioContent mantém gerenciamento de foco nos dialogs`.
- CT-14: renomeado de `Projeto Cindy oferece demo local e galeria com capturas da própria demo` para `Projeto Cindy oferece demo local` (restam CT-14-01, CT-14-02 e CT-14-09).
- CT-19: renomeado de `Projeto People abre uma galeria de telas sanitizadas a partir dos detalhes` para `trap de foco localiza a galeria aberta pela classe people-gallery` (resta CT-19-06).

**Contagem depois do T6.4:** contrato com 19 testes e 108 chamadas de asserção (antes 23 e 131). Regras do inventário ainda no contrato: 108 CT + 15 AS = 123. Suíte: 85 testes (antes 89; nenhum teste novo, a asserção do tema entrou num teste existente).

## Etapa 6 / T6.3 — remoção das asserções substituídas

Removidas do contrato exatamente as **30 regras** classificadas como **substituíveis** no T6.2, e só elas. As regras parciais (CT-22-03) e permanentes (as 17 da tabela do T6.2, incluindo a da Etapa 7, CT-17-05) continuam no contrato sem alteração, assim como as demais regras da Etapa 7 (CT-21-06 e CT-21-07) e todas as que não estão relacionadas a estes dialogs.

**Prova de equivalência, feita antes da remoção:** para cada ID, uma mutação no componente que quebra o comportamento protegido foi aplicada e testada contra o contrato antigo e contra o teste novo, e depois revertida. Resultado: o teste novo detectou **32/32** mutações de comportamento e o contrato antigo, 29/32. As três que o contrato não detectava são do CT-22-01 (item removido da navegação) e do CT-22-04/05 (troca só do rótulo da navegação). Além disso, o CT-22-01 acusava uma refatoração sem efeito na página (renomear a constante `navigationItems`), que o teste novo corretamente não acusa.

**Conferência mecânica:** as 30 linhas removidas do contrato correspondem, pela evidência `arquivo:linha` do inventário T6.0, exatamente aos 30 IDs substituíveis. As linhas do inventário se referem ao contrato como estava em `1c5aec3` (inalterado até `13fa0e0`); no arquivo atual elas não coincidem mais.

O roteiro das mutações e o log ficaram fora do repositório, como os demais artefatos de validação (§7.3). Cada mutação quebrava o comportamento de uma regra no componente: troca de texto, de `href` ou de `src`, remoção de canal, de foco inicial ou de `autoFocus`, troca de handler, de classe ou de rótulo, remoção de item da navegação.

| ID | Regra protegida | Destino (teste que passa a protegê-la) |
|---|---|---|
| CT-09-01 | Sobre e Contato têm, cada um, um foco inicial | INFO `Sobre: foco inicial no botão Fechar e fundo com rótulo` · `Contato: foco inicial no botão Fechar; fundo e Fechar fecham` |
| CT-09-03 | `InfoPanels` usa `autoFocus` | Os mesmos dois testes (`autofocus=""` no botão Fechar) |
| CT-10-01 | Contato: título aprovado | INFO `Contato: dialog modal nomeado pelo título, com a copy aprovada` |
| CT-10-02 | Contato: introdução aprovada | INFO `Contato: dialog modal nomeado pelo título, com a copy aprovada` |
| CT-10-03 | Contato: convite aprovado | INFO `Contato: dialog modal nomeado pelo título, com a copy aprovada` |
| CT-10-04 | Contato tem exatamente cinco canais | INFO `Contato: exatamente os cinco canais públicos, com destino, rótulo e nova aba` |
| CT-10-05 | Contato mantém o link público do LinkedIn | INFO `Contato: exatamente os cinco canais públicos, com destino, rótulo e nova aba` |
| CT-11-01 | Sobre: saudação aprovada | INFO `Sobre: dialog modal nomeado pelo título` |
| CT-11-02 | Sobre: apresentação aprovada | INFO `Sobre: copy aprovada, stack e CTA para Contato` |
| CT-11-03 | Sobre: frase sobre engenharia | INFO `Sobre: copy aprovada, stack e CTA para Contato` |
| CT-11-04 | Sobre: seção "Minha stack" | INFO `Sobre: copy aprovada, stack e CTA para Contato` |
| CT-11-05 | Sobre: trecho sobre prompts e fluxos inteligentes | INFO `Sobre: copy aprovada, stack e CTA para Contato` |
| CT-11-06 | Sobre: CTA `CONVERSAR SOBRE UM PROJETO` | INFO `Sobre: copy aprovada, stack e CTA para Contato` |
| CT-11-07 | CTA do Sobre abre o Contato | INFO `Sobre: fundo e Fechar fecham, CTA abre o Contato` |
| CT-14-06 | Demo Cindy carrega `/nova-cindy-mockup-v2.html` | DEMO `demo Cindy: dialog modal, título, rótulo e iframe da demo` |
| CT-14-07 | Demo Cindy tem foco inicial | DEMO `demo Cindy: foco inicial em Fechar; Voltar e Fechar chamam seus handlers` |
| CT-15-04 | Demo Nexus: selo `DEMO LOCAL · DADOS FICTÍCIOS` | DEMO `demo Nexus: selos e navegação lateral com os seis itens, Fluxos ativo` |
| CT-15-05 | Demo Nexus: "Análise documental inteligente" | DEMO `demo Nexus: dialog modal nomeado pelo título do fluxo, com a copy do estado inicial` |
| CT-15-06 | Demo Nexus: "Executar fluxo" | DEMO `demo Nexus: dialog modal nomeado pelo título do fluxo, com a copy do estado inicial` |
| CT-15-07 | Demo Nexus: "Eventos da execução" | DEMO `demo Nexus: dialog modal nomeado pelo título do fluxo, com a copy do estado inicial` |
| CT-15-08 | Demo Nexus: "Execução atual" | DEMO `demo Nexus: dialog modal nomeado pelo título do fluxo, com a copy do estado inicial` |
| CT-15-09 | Demo Nexus tem foco inicial | DEMO `demo Nexus: foco inicial em Fechar demo e dois botões de voltar ao projeto` |
| CT-17-03 | Demo PHX carrega `/phx-demo.html` | DEMO `demo PHX: dialog modal, título, rótulo e iframe da demo` |
| CT-17-04 | Demo PHX: selo `DEMO INTERATIVA` | DEMO `demo PHX: dialog modal, título, rótulo e iframe da demo` |
| CT-22-01 | Demo Nexus define os itens de navegação | DEMO `demo Nexus: selos e navegação lateral com os seis itens, Fluxos ativo` |
| CT-22-04 | Demo Nexus: item "Base de conhecimento" | DEMO `demo Nexus: selos e navegação lateral com os seis itens, Fluxos ativo` |
| CT-22-05 | Demo Nexus: item "Documentação" | DEMO `demo Nexus: selos e navegação lateral com os seis itens, Fluxos ativo` |
| CT-23-01 | Demo Nexus tem botão de voltar no topo | DEMO `demo Nexus: foco inicial em Fechar demo e dois botões de voltar ao projeto` |
| CT-23-02 | Demo Nexus tem selo no topo | DEMO `demo Nexus: selos e navegação lateral com os seis itens, Fluxos ativo` |
| CT-23-03 | Demo Nexus: selo `DEMO INTERATIVA` | DEMO `demo Nexus: selos e navegação lateral com os seis itens, Fluxos ativo` |

**Testes do contrato afetados:**
- CT-11 (`Sobre mantém a copy aprovada e CTA para Contato`): todas as 7 regras eram substituíveis, e o teste saiu.
- CT-10: renomeado de `Contato mantém a copy aprovada e os cinco canais` para `Footer mantém o link público do LinkedIn`, porque só resta o CT-10-06.
- CT-23: renomeado de `demo Nexus mantém retorno ao projeto e identificação no topo` para `demo Nexus mantém retorno ao projeto`, porque só resta o CT-23-04.
- CT-09: renomeado de `dialogs definem um foco inicial nativo` para `detalhes do projeto definem um foco inicial nativo`, porque só restam CT-09-02 e CT-09-04.
- CT-14, CT-15, CT-17 e CT-22 mantêm o nome e perdem só as asserções substituídas.

**Documentação geral:** `README.md` e `AGENTS.md` §7 ainda dizem que `portfolio-contract.test.mjs` cobre a copy pública, os cinco canais de contato e o foco inicial dos dialogs. Pela decisão da Opção A da Etapa 6, essa descrição só é atualizada na Etapa 9.

**Contagem depois do T6.3:** contrato com 23 testes e 131 chamadas de asserção (antes 24 e 161). Regras do inventário ainda no contrato: 131 CT + 15 AS = 146. As 30 removidas têm destino na tabela acima. Suíte: 89 testes (antes 90).

## Etapa 6 / T6.2 — camada 2 de Sobre, Contato e demos

Testes novos: `info-dialogs-render.test.mjs` (**INFO**, 7 testes) e `demo-dialogs-render.test.mjs` (**DEMO**, 7 testes). **Nenhuma asserção antiga foi removida ou alterada no T6.2.** A coluna "Cobertura nova" diz se o teste novo é equivalente ou superior à regra antiga. A remoção das regras substituíveis fica para o T6.3/T6.4.

Observações: (1) a mudança restaura o título "Etapa 6 / T6.0", apagado por engano no `13fa0e0` (T6.1); o conteúdo daquela seção não mudou e continua idêntico ao do `fbf7d13`. (2) Os testes do foco inicial das demos seguem o código e a baseline (botão **Fechar**); o texto da Spec que dizia "Voltar" foi corrigido (ver a seção abaixo).

Situação: **substituível** = a regra antiga pode sair, porque o teste novo cobre a mesma regra no HTML renderizado ou no handler, com força igual ou maior; **parcial** = o teste novo cobre só parte, e a regra antiga fica; **permanece** = regra relacionada a estes dialogs que o teste novo não cobre.

| ID | Regra protegida | Cobertura nova | Situação |
|---|---|---|---|
| CT-07-07 | `InfoPanels` importado diretamente (sem lazy) | — (fiação do App) | Permanece |
| CT-07-10 | CTA de contato do hero existe | — (fiação do App) | Permanece |
| CT-07-11 | CTA de contato do hero abre o dialog Contato | — (fiação do App; em runtime, smoke `B-hero-contato-…`) | Permanece |
| CT-09-01 | Sobre e Contato têm, cada um, um foco inicial | INFO `Sobre: foco inicial no botão Fechar…` e `Contato: foco inicial no botão Fechar…`: exatamente um marcador por dialog, no botão Fechar | Substituível (superior: identifica o elemento) |
| CT-09-03 | `InfoPanels` usa `autoFocus` | Mesmos testes: `autofocus=""` no botão Fechar de cada dialog | Substituível (superior) |
| CT-10-01 | Contato: título aprovado | INFO `Contato: dialog modal nomeado pelo título, com a copy aprovada` (`<h2 id="contact-title">`) | Substituível (superior) |
| CT-10-02 | Contato: introdução aprovada | Mesmo teste, parágrafo completo renderizado | Substituível (superior) |
| CT-10-03 | Contato: convite aprovado | Mesmo teste | Substituível (superior) |
| CT-10-04 | Contato tem exatamente cinco canais | INFO `Contato: exatamente os cinco canais públicos…`: cinco links renderizados, na ordem, sem canal desativado | Substituível (superior: o contrato não detectou um canal sem link, mutação M3) |
| CT-10-05 | Contato mantém o link público do LinkedIn | Mesmo teste (`href` exato dos cinco canais) | Substituível (superior) |
| CT-10-06 | Footer mantém o link público do LinkedIn | — (Footer fora destes dialogs) | Permanece |
| CT-11-01 | Sobre: saudação aprovada | INFO `Sobre: dialog modal nomeado pelo título` (`<h2 id="about-title">Muito prazer!</h2>`) | Substituível (superior) |
| CT-11-02 | Sobre: apresentação aprovada | INFO `Sobre: copy aprovada, stack e CTA para Contato` (parágrafo completo) | Substituível (superior) |
| CT-11-03 | Sobre: frase sobre engenharia | Mesmo teste | Substituível (superior) |
| CT-11-04 | Sobre: seção "Minha stack" | Mesmo teste (seção com `aria-labelledby` e `h3`) | Substituível (superior) |
| CT-11-05 | Sobre: trecho sobre prompts e fluxos inteligentes | Mesmo teste (os três itens da stack) | Substituível (superior) |
| CT-11-06 | Sobre: CTA `CONVERSAR SOBRE UM PROJETO` | Mesmo teste (botão renderizado) | Substituível (superior) |
| CT-11-07 | CTA do Sobre abre o Contato | INFO `Sobre: fundo e Fechar fecham, CTA abre o Contato` (handler chamado na árvore) | Substituível (superior: comportamento) |
| CT-14-01 | App importa a demo Cindy | — (fiação do App) | Permanece |
| CT-14-02 | Mapa de demos: `cindy → CindyDemoPanel` | — (fiação do App) | Permanece |
| CT-14-06 | Demo Cindy carrega `/nova-cindy-mockup-v2.html` | DEMO `demo Cindy: dialog modal, título, rótulo e iframe da demo` (iframe com `src` e `title`) | Substituível (superior) |
| CT-14-07 | Demo Cindy tem foco inicial | DEMO `demo Cindy: foco inicial em Fechar…` | Substituível (superior) |
| CT-14-09 | Mockup da Cindy mantém o título da página | — (arquivo público, fora do render) | Permanece |
| CT-15-01 | Detalhes oferecem a ação de demo | — (dialog de detalhes) | Permanece |
| CT-15-02 | App importa a demo Nexus | — (fiação do App) | Permanece |
| CT-15-03 | Mapa de demos: `nexus → NexusDemoPanel` | — (fiação do App) | Permanece |
| CT-15-04 | Demo Nexus: selo `DEMO LOCAL · DADOS FICTÍCIOS` | DEMO `demo Nexus: selos e navegação lateral…` | Substituível (superior) |
| CT-15-05 | Demo Nexus: "Análise documental inteligente" | DEMO `demo Nexus: dialog modal nomeado pelo título do fluxo…` (`h2` com o id do dialog, único) | Substituível (superior) |
| CT-15-06 | Demo Nexus: "Executar fluxo" | Mesmo teste (botão de execução) | Substituível (superior) |
| CT-15-07 | Demo Nexus: "Eventos da execução" | Mesmo teste | Substituível (superior) |
| CT-15-08 | Demo Nexus: "Execução atual" | Mesmo teste (com o estado `CONCLUÍDA`) | Substituível (superior) |
| CT-15-09 | Demo Nexus tem foco inicial | DEMO `demo Nexus: foco inicial em Fechar demo…` | Substituível (superior) |
| CT-17-01 | App importa a demo PHX | — (fiação do App) | Permanece |
| CT-17-02 | Mapa de demos: `phx → PhxDemoPanel` | — (fiação do App) | Permanece |
| CT-17-03 | Demo PHX carrega `/phx-demo.html` | DEMO `demo PHX: dialog modal, título, rótulo e iframe da demo` | Substituível (superior) |
| CT-17-04 | Demo PHX: selo `DEMO INTERATIVA` | Mesmo teste (rótulo `phx-demo-panel__label`) | Substituível (superior) |
| CT-17-05 | Registro referencia `project-03.webp` | — | Permanece (**Etapa 7**) |
| CT-17-06 | Título `LAUDO DE CRÉDITO IMOBILIÁRIO` no registro | — (dialog de detalhes) | Permanece |
| CT-22-01 | Demo Nexus define os itens de navegação | DEMO `demo Nexus: selos e navegação lateral com os seis itens…` (seis itens renderizados, em grupos e na ordem) | Substituível (superior) |
| CT-22-02 | Item de navegação troca a seção ativa | — (exige estado; coberto em runtime pelo smoke `B-nexus-navegacao-troca-secao`, fora do CI) | Permanece |
| CT-22-03 | Item ativo é indicado pela seção atual | Mesmo teste: no estado inicial, só Fluxos tem `is-active` e `aria-current="page"`. A troca não é observável no render estático | Parcial: permanece |
| CT-22-04 | Demo Nexus: item "Base de conhecimento" | Mesmo teste (rótulo do botão de navegação) | Substituível (superior) |
| CT-22-05 | Demo Nexus: item "Documentação" | Mesmo teste (rótulo do botão de navegação; o contrato não detectou a troca do rótulo, mutação M11) | Substituível (superior) |
| CT-23-01 | Demo Nexus tem botão de voltar no topo | DEMO `demo Nexus: foco inicial em Fechar demo e dois botões de voltar ao projeto` | Substituível (superior) |
| CT-23-02 | Demo Nexus tem selo no topo | DEMO `demo Nexus: selos e navegação lateral…` | Substituível (superior) |
| CT-23-03 | Demo Nexus: selo `DEMO INTERATIVA` | Mesmo teste | Substituível (superior) |
| CT-23-04 | Voltar da demo Nexus chama `onBack` | — (a demo Nexus usa hooks, então o componente não pode ser chamado diretamente para exercitar o handler sem um renderer) | Permanece |
| AS-01-01 | Mapa de demos cobre exatamente os projetos com demo no registro | — (fiação do App) | Permanece |

Resumo: 48 regras relacionadas a estes dialogs. **30 substituíveis**, 1 parcial (CT-22-03) e 17 que permanecem (fiação do App, Footer, arquivo público, detalhes, Etapa 7 e comportamento com estado da demo Nexus).

**Cobertura nova, sem regra antiga correspondente:** `role`, `aria-modal`, `aria-hidden` e `aria-labelledby` dos 5 dialogs, com o id referenciado único; rótulos dos fundos (`Fechar Sobre`, `Fechar Contato`); rótulo do grupo de canais; `title`, `target` e `rel` dos canais; `title` dos iframes; links "Abrir em nova aba" da Cindy e da PHX; handlers de fundo e Fechar do Sobre e do Contato; handlers de Voltar e Fechar da Cindy e da PHX; `tablist` da demo Nexus.

## Correção da Spec 0001 — foco inicial das demos (§7.3 e §7.4 C1)

**Decisão do mantenedor:** manter o foco inicial no botão Fechar nas três demos (Cindy, PHX e Nexus). Só o texto descritivo da Spec foi corrigido; código, comportamento, testes e baseline não mudaram.

| Trecho | Texto anterior | Texto corrigido |
|---|---|---|
| §7.3, exceção de `data-dialog-initial-focus` | "o botão 'Voltar' nas galerias e demos, e o equivalente nos demais" | "o botão 'Voltar ao projeto' nas galerias e o botão de fechar nos demais dialogs: Sobre, Contato, detalhes e as três demos, conforme medido na baseline" |
| §7.4 C, linha C1 | "o botão 'Voltar', foco inicial, ou o botão de fechar" | "o botão de fechar, que é o foco inicial, ou o botão 'Voltar ao projeto'" |

**A regra normativa não mudou:** o atributo continua no mesmo elemento da baseline, e o foco inicial precisa ter a mesma identidade registrada no `7f53175` (§7.3 e §7.4 A).

**Origem do erro:** os dois trechos foram escritos na versão 4 da Spec (antes de ela entrar no repositório, no `661ac52`). A verificação feita naquela etapa só contou a presença do atributo em cada arquivo, sem conferir em qual elemento ele estava, e o parêntese descreveu o estado atual de forma errada. O código nunca mudou: as demos focam Fechar desde a criação (`652a7a4` para PHX e Nexus, `fb86aa9` para Cindy), e as galerias focam "Voltar ao projeto" desde o `652a7a4`. O smoke da baseline mediu o mesmo: `cindy-demo-panel__close` e `phx-demo-panel__close` (3/3) e "Fechar demo" na Nexus (desktop 8/17, mobile 2/10).

## Etapa 6 / T6.1 — correções pontuais

**IDs do inventário T6.0 afetados: nenhum.** As 176 regras CT/AS continuam no lugar e inalteradas. O T6.1 corrige um auxiliar da camada 2 e acrescenta cobertura.

| Mudança | Regra protegida | Teste | Situação |
|---|---|---|---|
| Auxiliar `escape()` de `project-gallery.test.mjs` substituído por `asRendered()` | Os fragmentos esperados usam a mesma codificação do `render()`: o React codifica `& < > " '` e o `render()` de `vite-ssr.mjs` decodifica `&amp; &quot; &#x27;`, então só `<` e `>` continuam codificados | `fragmentos esperados usam a mesma codificação do render, em texto e em atributo` (novo, `project-gallery.test.mjs`) | **Corrigida.** O auxiliar antigo codificava os cinco caracteres e um texto do registro com `&`, aspas ou apóstrofo fazia o teste falhar sem regressão. Comprovado: falhava antes da correção, e com um título de teste `Dashboard & <b> "x" 'y'` o auxiliar antigo falhava em 2 testes e o novo passa |
| Contagem da prévia (D1.8) | A contagem é `galeria.screens.length`, e o `countLabel` do registro não contém número | `contagem da prévia é derivada do número de telas da galeria (D1.8)` (novo, `project-dialogs-render.test.mjs`) | **Nova cobertura.** Os literais `7 TELAS DO PRODUTO`, `6 TELAS DA DEMO` etc. continuam nos testes de detalhes. Sozinhos, eles não detectavam um número escrito no rótulo do registro (a página mostraria `6 6 TELAS DA DEMO`, que contém o literal) |
| D1.11 — dados da demo Nexus independentes do registro | — | Nenhum | **Verificado, sem teste novo.** A Spec registra a decisão (D1.11), mas não a inclui entre os testes do §3 nem nos critérios do §6. Situação em `fbf7d13`: `NexusDemoPanel.jsx` importa só `react-icons/fa`, `react` e o próprio CSS; no registro, `demo` da Nexus tem apenas `buttonLabel` |

## Etapa 6 / T6.0 — inventário de regras (antes da reorganização)

Situação registrada no commit `1c5aec3` (fim da Etapa 5), antes de qualquer mudança da Etapa 6. Cada asserção de `portfolio-contract.test.mjs` (**CT**) e de `app-dialog-state.test.mjs` (**AS**) recebe um ID estável no formato `<arquivo>-<teste>-<asserção>`, numerado pela ordem no arquivo nesse commit. Os IDs não mudam quando as asserções forem movidas ou removidas nos tickets T6.1–T6.5: o destino de cada uma será registrado contra estes IDs.

### Linha de base da suíte

Contagem de testes pelo runner (`node --test`) e de chamadas de asserção no fonte (ocorrências de `assert(` ou `assert.<método>(`; cada chamada conta uma vez, mesmo dentro de laço ou de função auxiliar).

| Arquivo | Testes | Chamadas de asserção |
|---|---|---|
| `portfolio-contract.test.mjs` | 24 | 161 |
| `dialog-navigation.test.mjs` | 18 | 13 |
| `project-registry.test.mjs` | 8 | 28 |
| `project-dialogs-render.test.mjs` | 7 | 6 |
| `app-dialog-state.test.mjs` | 6 | 15 |
| `project-gallery.test.mjs` | 6 | 15 |
| `project-gallery-preview.test.mjs` | 5 | 4 |
| **Total** | **74** | **242** |

Regras inventariadas aqui: **176** (161 CT + 15 AS). Os outros 66 pontos de asserção ficam nos arquivos de camada 1 e 2, que a Etapa 6 não reorganiza.

Notas sobre a contagem:
- `AS-01-00` é a asserção do auxiliar `mapKeys` (fora de um `test`), executada a cada uso.
- `CT-06-01`, `CT-06-02`, `CT-21-04` e `CT-21-05` estão dentro de laços: uma chamada no fonte, várias execuções.
- `CT-17-05`, `CT-21-06` e `CT-21-07` dependem da Etapa 7 (D1.12/D1.13) e não podem ser alteradas na Etapa 6.

### Testes de origem

| Teste | Arquivo:linha | Nome do teste | Regras |
|---|---|---|---|
| CT-01 | `portfolio-contract.test.mjs:10` | fallback do footer mantém a altura mobile quando a seção é carregada | 1 |
| CT-02 | `portfolio-contract.test.mjs:16` | cards de projetos mantêm contrato de teclado | 6 |
| CT-03 | `portfolio-contract.test.mjs:27` | Projetos seguem um percurso contínuo, em fluxo normal e adaptado para mobile | 36 |
| CT-04 | `portfolio-contract.test.mjs:69` | entrada lateral dos cards acontece uma vez e respeita movimento reduzido | 9 |
| CT-05 | `portfolio-contract.test.mjs:83` | cabeçalho rolado não desenha uma linha horizontal no mobile | 1 |
| CT-06 | `portfolio-contract.test.mjs:89` | fallback de Projetos reserva as mesmas etapas em telas baixas | 2 |
| CT-07 | `portfolio-contract.test.mjs:98` | PortfolioContent mantém gerenciamento de foco e Escape nos dialogs | 11 |
| CT-08 | `portfolio-contract.test.mjs:114` | Serviços têm uma faixa visual de transição abaixo dos cards | 4 |
| CT-09 | `portfolio-contract.test.mjs:124` | dialogs definem um foco inicial nativo | 4 |
| CT-10 | `portfolio-contract.test.mjs:134` | Contato mantém a copy aprovada e os cinco canais | 6 |
| CT-11 | `portfolio-contract.test.mjs:146` | Sobre mantém a copy aprovada e CTA para Contato | 7 |
| CT-12 | `portfolio-contract.test.mjs:158` | Projeto People usa GERENCIADOR DE RECURSOS HUMANOS como subtítulo | 1 |
| CT-13 | `portfolio-contract.test.mjs:164` | Projeto 02 mantém a copy confidencial de Gestão Condominial com IA | 2 |
| CT-14 | `portfolio-contract.test.mjs:171` | Projeto Cindy oferece demo local e galeria com capturas da própria demo | 9 |
| CT-15 | `portfolio-contract.test.mjs:189` | Projeto Nexus AI oferece uma demo interativa a partir do painel de detalhes | 9 |
| CT-16 | `portfolio-contract.test.mjs:205` | Projeto Nexus AI abre uma galeria coerente com a demo interativa | 4 |
| CT-17 | `portfolio-contract.test.mjs:216` | Projeto PHX oferece a demo local do gerador de laudo | 6 |
| CT-18 | `portfolio-contract.test.mjs:229` | Projeto PHX abre uma galeria com as telas do laudo | 4 |
| CT-19 | `portfolio-contract.test.mjs:240` | Projeto People abre uma galeria de telas sanitizadas a partir dos detalhes | 7 |
| CT-20 | `portfolio-contract.test.mjs:255` | previews de projetos destacam a galeria e preservam o corte das capturas | 9 |
| CT-21 | `portfolio-contract.test.mjs:273` | quatro logos ocupam as etapas, sem substituir as telas dos painéis | 8 |
| CT-22 | `portfolio-contract.test.mjs:290` | navegação lateral da demo Nexus troca a seção ativa | 5 |
| CT-23 | `portfolio-contract.test.mjs:300` | demo Nexus mantém retorno ao projeto e identificação no topo | 4 |
| CT-24 | `portfolio-contract.test.mjs:309` | CSS e sonda não reintroduzem o fluxo legado de vídeo | 6 |
| AS-01 | `app-dialog-state.test.mjs:19` | mapa de demos cobre exatamente os projetos com demo no registro | 1 |
| AS-02 | `app-dialog-state.test.mjs:26` | App renderiza a galeria única para o slug do estado, sem mapa nem galerias por projeto | 3 |
| AS-03 | `app-dialog-state.test.mjs:32` | transições passam pelo módulo de navegação, sem preserveTrigger nem estado misto | 5 |
| AS-04 | `app-dialog-state.test.mjs:40` | gatilho só é capturado quando o módulo indica abertura a partir de null | 2 |
| AS-05 | `app-dialog-state.test.mjs:45` | transição rejeitada mantém o estado e só avisa em desenvolvimento | 2 |
| AS-06 | `app-dialog-state.test.mjs:50` | Escape fecha pelo módulo de navegação | 1 |

### Regras

Evidência = arquivo e linha da asserção no commit `1c5aec3`, com o tipo de asserção.

| ID | Evidência | Regra protegida | Observação |
|---|---|---|---|
| CT-01-01 | `portfolio-contract.test.mjs:13` (match) | Fallback do footer mantém 100svh no mobile (≤640px) enquanto carrega |  |
| CT-02-01 | `portfolio-contract.test.mjs:19` (match) | Card de projeto tem `role="button"` |  |
| CT-02-02 | `portfolio-contract.test.mjs:20` (match) | Card de projeto é focável (`tabIndex={0}`) |  |
| CT-02-03 | `portfolio-contract.test.mjs:21` (match) | Card trata a tecla `Enter` |  |
| CT-02-04 | `portfolio-contract.test.mjs:22` (match) | Card trata a tecla `Space` |  |
| CT-02-05 | `portfolio-contract.test.mjs:23` (match) | Card abre o projeto pelo slug |  |
| CT-02-06 | `portfolio-contract.test.mjs:24` (match) | `role="button"` precede `tabIndex={0}` no fonte (mesmo elemento, por ordem) | Ambígua: regex pela ordem no arquivo inteiro, não prova o mesmo elemento |
| CT-03-01 | `portfolio-contract.test.mjs:31` (match) | Introdução de Projetos contém o título `PROJETOS` (`#projects-title`) |  |
| CT-03-02 | `portfolio-contract.test.mjs:32` (match) | Divisor com ícone de engrenagem após o título de Projetos |  |
| CT-03-03 | `portfolio-contract.test.mjs:33` (match) | Cards vêm do registro, com índice para alternar os lados |  |
| CT-03-04 | `portfolio-contract.test.mjs:34` (equal) | Percurso tem um único `<svg>` | Contagem literal no fonte |
| CT-03-05 | `portfolio-contract.test.mjs:35` (equal) | Percurso tem um único `motion.path` | Contagem literal no fonte |
| CT-03-06 | `portfolio-contract.test.mjs:36` (match) | Progresso do traço começa em 0 (`useMotionValue(0)`) |  |
| CT-03-07 | `portfolio-contract.test.mjs:37` (match) | Traço usa `pathLength` como estilo |  |
| CT-03-08 | `portfolio-contract.test.mjs:38` (match) | Posição dos cards calculada sobre o traço (`getPointAtLength`) |  |
| CT-03-09 | `portfolio-contract.test.mjs:39` (match) | Com movimento reduzido, o traço aparece completo |  |
| CT-03-10 | `portfolio-contract.test.mjs:40` (match) | Card marcado como alcançado (`dataset.reached`) |  |
| CT-03-11 | `portfolio-contract.test.mjs:41` (match) | Pontos do traço alternam entre 25% e 75% da largura |  |
| CT-03-12 | `portfolio-contract.test.mjs:42` (match) | Início do traço medido a partir do divisor da introdução |  |
| CT-03-13 | `portfolio-contract.test.mjs:43` (match) | Traço começa 52px abaixo do divisor |  |
| CT-03-14 | `portfolio-contract.test.mjs:44` (match) | `viewBox` do SVG ajustado em runtime |  |
| CT-03-15 | `portfolio-contract.test.mjs:45` (doesNotMatch) | CSS não usa `vector-effect: non-scaling-stroke` |  |
| CT-03-16 | `portfolio-contract.test.mjs:46` (match) | Progresso ligado a um `ScrollTrigger` |  |
| CT-03-17 | `portfolio-contract.test.mjs:47` (match) | Progresso lido de `self.progress` |  |
| CT-03-18 | `portfolio-contract.test.mjs:48` (doesNotMatch) | Sem `invalidateOnRefresh` |  |
| CT-03-19 | `portfolio-contract.test.mjs:49` (match) | Recalcula com `ResizeObserver` |  |
| CT-03-20 | `portfolio-contract.test.mjs:50` (match) | Consulta `prefers-reduced-motion: reduce` |  |
| CT-03-21 | `portfolio-contract.test.mjs:51` (doesNotMatch) | Percurso não usa `clipPath` |  |
| CT-03-22 | `portfolio-contract.test.mjs:52` (match) | Introdução com `min-height: 90svh` e alinhada ao topo |  |
| CT-03-23 | `portfolio-contract.test.mjs:53` (match) | Título da introdução com `font-size: clamp(2.8rem, 7vw, 6rem)` |  |
| CT-03-24 | `portfolio-contract.test.mjs:54` (match) | Cópia do card com fundo `#efe5d6` e texto `#071f2a` |  |
| CT-03-25 | `portfolio-contract.test.mjs:55` (match) | Resumo do card em negrito (700) |  |
| CT-03-26 | `portfolio-contract.test.mjs:56` (match) | Onda primária do card (`::before`, 8s) |  |
| CT-03-27 | `portfolio-contract.test.mjs:57` (match) | Onda secundária do card (`::after`, 11s) |  |
| CT-03-28 | `portfolio-contract.test.mjs:58` (match) | Movimento reduzido desliga as ondas |  |
| CT-03-29 | `portfolio-contract.test.mjs:59` (match) | Traço de progresso `#c2f84f`, espessura 18 |  |
| CT-03-30 | `portfolio-contract.test.mjs:60` (match) | Etapas pares alinhadas à direita |  |
| CT-03-31 | `portfolio-contract.test.mjs:61` (match) | Breakpoint mobile do percurso em 900px |  |
| CT-03-32 | `portfolio-contract.test.mjs:62` (match) | No mobile, cards alternam entre trilho esquerdo e direito |  |
| CT-03-33 | `portfolio-contract.test.mjs:63` (match) | No mobile, o traço usa paradas próprias |  |
| CT-03-34 | `portfolio-contract.test.mjs:64` (doesNotMatch) | CSS não unifica etapas pares e ímpares |  |
| CT-03-35 | `portfolio-contract.test.mjs:65` (match) | No mobile (≤900px), card com `width: calc(100% - 4.5rem)` |  |
| CT-03-36 | `portfolio-contract.test.mjs:66` (match) | Arte do card com `object-fit: contain` |  |
| CT-04-01 | `portfolio-contract.test.mjs:72` (match) | Entrada lateral observada por `IntersectionObserver` |  |
| CT-04-02 | `portfolio-contract.test.mjs:73` (match) | Card revelado ao entrar na viewport |  |
| CT-04-03 | `portfolio-contract.test.mjs:74` (match) | Entrada acontece uma vez (`unobserve`) |  |
| CT-04-04 | `portfolio-contract.test.mjs:75` (match) | Card revelado também ao receber foco |  |
| CT-04-05 | `portfolio-contract.test.mjs:76` (match) | Observador desconectado na limpeza |  |
| CT-04-06 | `portfolio-contract.test.mjs:77` (match) | Deslocamento de entrada −40px |  |
| CT-04-07 | `portfolio-contract.test.mjs:78` (match) | Etapas pares entram de +40px |  |
| CT-04-08 | `portfolio-contract.test.mjs:79` (match) | Animação de entrada de 650ms |  |
| CT-04-09 | `portfolio-contract.test.mjs:80` (match) | Movimento reduzido: sem animação, card visível e sem deslocamento |  |
| CT-05-01 | `portfolio-contract.test.mjs:86` (match) | Cabeçalho rolado sem linha inferior (borda transparente) |  |
| CT-06-01 | `portfolio-contract.test.mjs:93` (ok) | Fallback de Projetos reserva `90svh + 4 × max(Nsvh, Mrem)` (laço: 80/46 e 82/42) | Laço: 1 chamada, 2 execuções |
| CT-06-02 | `portfolio-contract.test.mjs:94` (ok) | Etapa do percurso com `min-height: max(Nsvh, Mrem)` (laço: 80/46 e 82/42) | Laço: 1 chamada, 2 execuções |
| CT-07-01 | `portfolio-contract.test.mjs:101` (match) | App guarda o gatilho (`lastTriggerRef`) |  |
| CT-07-02 | `portfolio-contract.test.mjs:102` (match) | App trata `Escape` | Sobreposta por AS-06-01 (mais forte) |
| CT-07-03 | `portfolio-contract.test.mjs:103` (match) | App trata `Tab` (trap) |  |
| CT-07-04 | `portfolio-contract.test.mjs:104` (match) | Trap identifica o primeiro elemento focável |  |
| CT-07-05 | `portfolio-contract.test.mjs:105` (match) | Trap foca o primeiro elemento |  |
| CT-07-06 | `portfolio-contract.test.mjs:106` (match) | Ao fechar, o foco volta ao gatilho |  |
| CT-07-07 | `portfolio-contract.test.mjs:107` (match) | `InfoPanels` importado diretamente (sem lazy) |  |
| CT-07-08 | `portfolio-contract.test.mjs:108` (match) | `ProjectDetailsPanel` importado diretamente (sem lazy) |  |
| CT-07-09 | `portfolio-contract.test.mjs:109` (match) | `EXPLORAR MEU TRABALHO` aponta para `#servicos` |  |
| CT-07-10 | `portfolio-contract.test.mjs:110` (match) | CTA de contato do hero existe |  |
| CT-07-11 | `portfolio-contract.test.mjs:111` (match) | CTA de contato do hero abre o dialog Contato |  |
| CT-08-01 | `portfolio-contract.test.mjs:118` (match) | Serviços têm a faixa de transição |  |
| CT-08-02 | `portfolio-contract.test.mjs:119` (match) | Faixa usa `/images/services-transition.png` |  |
| CT-08-03 | `portfolio-contract.test.mjs:120` (match) | Faixa com altura `clamp(9rem, 20svh, 18rem)` |  |
| CT-08-04 | `portfolio-contract.test.mjs:121` (match) | Imagem da faixa com `object-fit: cover` |  |
| CT-09-01 | `portfolio-contract.test.mjs:128` (equal) | Sobre e Contato têm, cada um, um foco inicial (2 marcadores em `InfoPanels`) |  |
| CT-09-02 | `portfolio-contract.test.mjs:129` (match) | Detalhes do projeto têm foco inicial |  |
| CT-09-03 | `portfolio-contract.test.mjs:130` (match) | `InfoPanels` usa `autoFocus` |  |
| CT-09-04 | `portfolio-contract.test.mjs:131` (match) | Detalhes do projeto usam `autoFocus` |  |
| CT-10-01 | `portfolio-contract.test.mjs:138` (match) | Contato: título aprovado |  |
| CT-10-02 | `portfolio-contract.test.mjs:139` (match) | Contato: introdução aprovada |  |
| CT-10-03 | `portfolio-contract.test.mjs:140` (match) | Contato: convite aprovado |  |
| CT-10-04 | `portfolio-contract.test.mjs:141` (equal) | Contato tem exatamente cinco canais (5 `label:` em `InfoPanels`) | Ambígua: conta `label: '` no fonte, não canais renderizados |
| CT-10-05 | `portfolio-contract.test.mjs:142` (match) | Contato mantém o link público do LinkedIn |  |
| CT-10-06 | `portfolio-contract.test.mjs:143` (match) | Footer mantém o link público do LinkedIn |  |
| CT-11-01 | `portfolio-contract.test.mjs:149` (match) | Sobre: saudação aprovada |  |
| CT-11-02 | `portfolio-contract.test.mjs:150` (match) | Sobre: apresentação aprovada |  |
| CT-11-03 | `portfolio-contract.test.mjs:151` (match) | Sobre: frase sobre engenharia |  |
| CT-11-04 | `portfolio-contract.test.mjs:152` (match) | Sobre: seção "Minha stack" |  |
| CT-11-05 | `portfolio-contract.test.mjs:153` (match) | Sobre: trecho sobre prompts e fluxos inteligentes |  |
| CT-11-06 | `portfolio-contract.test.mjs:154` (match) | Sobre: CTA `CONVERSAR SOBRE UM PROJETO` |  |
| CT-11-07 | `portfolio-contract.test.mjs:155` (match) | CTA do Sobre abre o Contato (`onOpenContact`) |  |
| CT-12-01 | `portfolio-contract.test.mjs:161` (match) | Subtítulo do People no registro: `GERENCIADOR DE RECURSOS HUMANOS` | Sobreposta pelo render dos detalhes (`project-dialogs-render`) |
| CT-13-01 | `portfolio-contract.test.mjs:167` (match) | Título `GESTÃO CONDOMINIAL COM IA` no registro | Sobreposta pelo render dos detalhes |
| CT-13-02 | `portfolio-contract.test.mjs:168` (match) | Subtítulo `ADMINISTRAÇÃO DE CONDOMÍNIOS` no registro | Sobreposta pelo render dos detalhes |
| CT-14-01 | `portfolio-contract.test.mjs:178` (match) | App importa a demo Cindy |  |
| CT-14-02 | `portfolio-contract.test.mjs:179` (match) | Mapa de demos: `cindy → CindyDemoPanel` |  |
| CT-14-03 | `portfolio-contract.test.mjs:180` (match) | App importa a galeria única | Duplicada: = CT-16-02 = CT-18-02 = CT-19-03 = AS-02-01 |
| CT-14-04 | `portfolio-contract.test.mjs:181` (match) | App renderiza a galeria única pelo slug, com `key` | Duplicada: = CT-16-03 = CT-18-03 = CT-19-04; contida em AS-02-02 |
| CT-14-05 | `portfolio-contract.test.mjs:182` (match) | Galeria da Cindy tem `tema: 'cindy'` no registro | Sobreposta por `project-registry` e camada 2 de `project-gallery` |
| CT-14-06 | `portfolio-contract.test.mjs:183` (match) | Demo Cindy carrega `/nova-cindy-mockup-v2.html` |  |
| CT-14-07 | `portfolio-contract.test.mjs:184` (match) | Demo Cindy tem foco inicial |  |
| CT-14-08 | `portfolio-contract.test.mjs:185` (match) | Miniaturas da galeria indicam a tela ativa (`aria-pressed`) | Duplicada: = CT-19-07; sobreposta pela camada 2 |
| CT-14-09 | `portfolio-contract.test.mjs:186` (match) | Mockup da Cindy mantém o título da página |  |
| CT-15-01 | `portfolio-contract.test.mjs:194` (match) | Detalhes oferecem a ação de demo (`onOpenDemo`) |  |
| CT-15-02 | `portfolio-contract.test.mjs:195` (match) | App importa a demo Nexus |  |
| CT-15-03 | `portfolio-contract.test.mjs:196` (match) | Mapa de demos: `nexus → NexusDemoPanel` |  |
| CT-15-04 | `portfolio-contract.test.mjs:197` (match) | Demo Nexus: selo `DEMO LOCAL · DADOS FICTÍCIOS` |  |
| CT-15-05 | `portfolio-contract.test.mjs:198` (match) | Demo Nexus: "Análise documental inteligente" |  |
| CT-15-06 | `portfolio-contract.test.mjs:199` (match) | Demo Nexus: "Executar fluxo" |  |
| CT-15-07 | `portfolio-contract.test.mjs:200` (match) | Demo Nexus: "Eventos da execução" |  |
| CT-15-08 | `portfolio-contract.test.mjs:201` (match) | Demo Nexus: "Execução atual" |  |
| CT-15-09 | `portfolio-contract.test.mjs:202` (match) | Demo Nexus tem foco inicial |  |
| CT-16-01 | `portfolio-contract.test.mjs:210` (match) | Prévia abre a galeria pelo slug (`onOpenGallery(slug)`) | Duplicada: = CT-18-01; comportamento em `project-gallery-preview` |
| CT-16-02 | `portfolio-contract.test.mjs:211` (match) | App importa a galeria única | Duplicada (ver CT-14-03) |
| CT-16-03 | `portfolio-contract.test.mjs:212` (match) | App renderiza a galeria única pelo slug, com `key` | Duplicada (ver CT-14-04) |
| CT-16-04 | `portfolio-contract.test.mjs:213` (match) | Galeria Nexus tem `tema: 'nexus'` no registro | Sobreposta (ver CT-14-05) |
| CT-17-01 | `portfolio-contract.test.mjs:221` (match) | App importa a demo PHX |  |
| CT-17-02 | `portfolio-contract.test.mjs:222` (match) | Mapa de demos: `phx → PhxDemoPanel` |  |
| CT-17-03 | `portfolio-contract.test.mjs:223` (match) | Demo PHX carrega `/phx-demo.html` |  |
| CT-17-04 | `portfolio-contract.test.mjs:224` (match) | Demo PHX: selo `DEMO INTERATIVA` |  |
| CT-17-05 | `portfolio-contract.test.mjs:225` (match) | Registro referencia `project-03.webp` | **Etapa 7** (D1.13): não mexer na Etapa 6 |
| CT-17-06 | `portfolio-contract.test.mjs:226` (match) | Título `LAUDO DE CRÉDITO IMOBILIÁRIO` no registro |  |
| CT-18-01 | `portfolio-contract.test.mjs:234` (match) | Prévia abre a galeria pelo slug (`onOpenGallery(slug)`) | Duplicada (ver CT-16-01) |
| CT-18-02 | `portfolio-contract.test.mjs:235` (match) | App importa a galeria única | Duplicada (ver CT-14-03) |
| CT-18-03 | `portfolio-contract.test.mjs:236` (match) | App renderiza a galeria única pelo slug, com `key` | Duplicada (ver CT-14-04) |
| CT-18-04 | `portfolio-contract.test.mjs:237` (match) | Galeria PHX tem `tema: 'phx'` no registro | Sobreposta (ver CT-14-05) |
| CT-19-01 | `portfolio-contract.test.mjs:246` (match) | Prévia mostra `VER TELAS DO PROJETO` |  |
| CT-19-02 | `portfolio-contract.test.mjs:247` (match) | Detalhes oferecem a ação de galeria (`onOpenGallery`) | Mais fraca que CT-16-01 |
| CT-19-03 | `portfolio-contract.test.mjs:248` (match) | App importa a galeria única | Duplicada (ver CT-14-03) |
| CT-19-04 | `portfolio-contract.test.mjs:249` (match) | App renderiza a galeria única pelo slug, com `key` | Duplicada (ver CT-14-04) |
| CT-19-05 | `portfolio-contract.test.mjs:250` (match) | Galeria People tem `tema: null` no registro | Sobreposta (ver CT-14-05) |
| CT-19-06 | `portfolio-contract.test.mjs:251` (match) | Trap de foco localiza o dialog aberto por `.people-gallery.is-open` | Ambígua: nome do teste fala do People, mas protege o seletor do trap de todas as galerias |
| CT-19-07 | `portfolio-contract.test.mjs:252` (match) | Miniaturas da galeria indicam a tela ativa (`aria-pressed`) | Duplicada (ver CT-14-08) |
| CT-20-01 | `portfolio-contract.test.mjs:262` (match) | Imagem da prévia 4/3 com `object-fit: contain` |  |
| CT-20-02 | `portfolio-contract.test.mjs:263` (match) | Selo da prévia arredondado, fundo `#78aebc` |  |
| CT-20-03 | `portfolio-contract.test.mjs:264` (match) | Ação do card com borda `#071f2a` |  |
| CT-20-04 | `portfolio-contract.test.mjs:265` (match) | Ação do card com largura do conteúdo, alinhada ao início |  |
| CT-20-05 | `portfolio-contract.test.mjs:266` (match) | Ação do card esconde a tecla decorativa |  |
| CT-20-06 | `portfolio-contract.test.mjs:267` (match) | No desktop com hover fino, card sobe 0,65rem com sombra |  |
| CT-20-07 | `portfolio-contract.test.mjs:268` (match) | Card tem o CTA `VER PROJETO` com a estrutura de linha, texto e tecla |  |
| CT-20-08 | `portfolio-contract.test.mjs:269` (match) | Resumo do People no registro: "Plataforma de recrutamento…" |  |
| CT-20-09 | `portfolio-contract.test.mjs:270` (match) | Miniaturas da galeria com `object-fit: contain` |  |
| CT-21-01 | `portfolio-contract.test.mjs:278` (match) | Card com `width: 43%` |  |
| CT-21-02 | `portfolio-contract.test.mjs:279` (match) | Card mostra o logo do registro |  |
| CT-21-03 | `portfolio-contract.test.mjs:280` (match) | Logo com alt do registro |  |
| CT-21-04 | `portfolio-contract.test.mjs:282` (match) | Registro aponta os quatro logos em `/images/projects/logos/` (laço ×4) | Laço: 1 chamada, 4 execuções |
| CT-21-05 | `portfolio-contract.test.mjs:283` (equal) | Cada logo é um WebP válido (cabeçalho `RIFF`, laço ×4) | Laço: 1 chamada, 4 execuções |
| CT-21-06 | `portfolio-contract.test.mjs:285` (match) | Registro referencia `project-01.webp` | **Etapa 7** (D1.12/D1.13): não mexer na Etapa 6 |
| CT-21-07 | `portfolio-contract.test.mjs:286` (match) | Registro referencia `project-02.webp` | **Etapa 7** (D1.12/D1.13): não mexer na Etapa 6 |
| CT-21-08 | `portfolio-contract.test.mjs:287` (match) | Card mostra o resumo do registro |  |
| CT-22-01 | `portfolio-contract.test.mjs:293` (match) | Demo Nexus define os itens de navegação |  |
| CT-22-02 | `portfolio-contract.test.mjs:294` (match) | Item de navegação troca a seção ativa |  |
| CT-22-03 | `portfolio-contract.test.mjs:295` (match) | Item ativo é indicado pela seção atual |  |
| CT-22-04 | `portfolio-contract.test.mjs:296` (match) | Demo Nexus: item "Base de conhecimento" |  |
| CT-22-05 | `portfolio-contract.test.mjs:297` (match) | Demo Nexus: item "Documentação" |  |
| CT-23-01 | `portfolio-contract.test.mjs:303` (match) | Demo Nexus tem botão de voltar no topo |  |
| CT-23-02 | `portfolio-contract.test.mjs:304` (match) | Demo Nexus tem selo no topo |  |
| CT-23-03 | `portfolio-contract.test.mjs:305` (match) | Demo Nexus: selo `DEMO INTERATIVA` |  |
| CT-23-04 | `portfolio-contract.test.mjs:306` (match) | Voltar da demo Nexus chama `onBack` |  |
| CT-24-01 | `portfolio-contract.test.mjs:313` (doesNotMatch) | CSS sem `shader-video` (fluxo legado de vídeo) |  |
| CT-24-02 | `portfolio-contract.test.mjs:314` (match) | Elementos interativos sem tap highlight nativo |  |
| CT-24-03 | `portfolio-contract.test.mjs:315` (doesNotMatch) | `perf-audit` sem resquícios do vídeo legado |  |
| CT-24-04 | `portfolio-contract.test.mjs:316` (match) | `perf-audit` usa mouse real via CDP |  |
| CT-24-05 | `portfolio-contract.test.mjs:317` (match) | `perf-audit` oferece `--footer` |  |
| CT-24-06 | `portfolio-contract.test.mjs:318` (match) | `perf-audit` oferece `--projects` |  |
| AS-01-00 | `app-dialog-state.test.mjs:15` (ok) | Auxiliar `mapKeys`: o mapa procurado existe no `App.jsx` (executa no teste AS-01) | Chamada no auxiliar, não num teste; executa uma vez por uso de `mapKeys` |
| AS-01-01 | `app-dialog-state.test.mjs:20` (deepEqual) | Mapa de demos cobre exatamente os projetos com demo no registro (D1.7) |  |
| AS-02-01 | `app-dialog-state.test.mjs:27` (match) | App importa a galeria única | Duplicada (ver CT-14-03) |
| AS-02-02 | `app-dialog-state.test.mjs:28` (match) | App renderiza a galeria única para `galeria`, pelo slug, com `key`, `goBack` e `closeDialog` |  |
| AS-02-03 | `app-dialog-state.test.mjs:29` (doesNotMatch) | Sem mapa de galerias nem galerias por projeto |  |
| AS-03-01 | `app-dialog-state.test.mjs:33` (match) | App importa `fechar`, `navegar` e `voltar` do módulo de navegação |  |
| AS-03-02 | `app-dialog-state.test.mjs:34` (match) | Abrir passa por `navegar(dialog, destination, projects)` |  |
| AS-03-03 | `app-dialog-state.test.mjs:35` (match) | Voltar passa por `voltar(dialog, projects)` |  |
| AS-03-04 | `app-dialog-state.test.mjs:36` (match) | Fechar passa por `fechar()` |  |
| AS-03-05 | `app-dialog-state.test.mjs:37` (doesNotMatch) | Sem `preserveTrigger` nem estado legado (`activePanel`, `openPanel`) |  |
| AS-04-01 | `app-dialog-state.test.mjs:41` (match) | Gatilho capturado só quando o módulo indica `capturarGatilho` |  |
| AS-04-02 | `app-dialog-state.test.mjs:42` (equal) | Um único ponto de captura do gatilho |  |
| AS-05-01 | `app-dialog-state.test.mjs:46` (match) | Transição rejeitada mantém o estado e só faz `console.error` em DEV |  |
| AS-05-02 | `app-dialog-state.test.mjs:47` (equal) | Um único `console.error` no App |  |
| AS-06-01 | `app-dialog-state.test.mjs:51` (match) | `Escape` fecha pelo `closeDialog` do módulo |  |

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
