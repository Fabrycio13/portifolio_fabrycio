# ADR 0002 — Registro de projetos, navegação de dialogs e galeria única

- **Data:** 15 de novembro de 2026
- **Status:** Aceita
- **Origem:** [Spec 0001](../specs/0001-registro-projetos-dialogs-galeria.md), com as alternativas e os motivos registrados nas [decisões arquiteturais de 14/11/2026](../reviews/2026-11-14-decisoes-arquiteturais.md)

## Contexto

A [revisão arquitetural de 14/11/2026](../reviews/2026-11-14-revisao-arquitetural.md) encontrou os dados de cada projeto espalhados por vários arquivos, com o número de exibição usado como identidade. O dialog aberto era uma string que misturava `'sobre'`, números de projeto e valores compostos como `'cindy-gallery'`, o que exigia ternários com fallback e um "voltar" fixo. A flag `preserveTrigger` controlava o retorno do foco, e quatro componentes de galeria quase iguais diferiam só em textos e cores.

## Decisão

1. **Registro único de projetos** em `src/data/projects.js`. O `slug` (`people`, `cindy`, `phx`, `nexus`) é a identidade; o `numero` é só a posição de exibição. Cada projeto tem `card`, `detalhes`, `galeria` (ou `null`) e `demo` (ou `null`).
2. **Dados separados de componentes React.** `src/data/` não importa React nem bibliotecas visuais; o registro é dado puro e serializável, verificado por teste.
3. **Ícones por chave de texto.** Os recursos dos detalhes guardam uma chave como `'brain'`; o mapa de chave para componente fica no `ProjectDetailsDialog` (`featureIcons`), e um teste garante que toda chave do registro tem ícone.
4. **Navegação pura** em `src/utils/dialogNavigation.js`, sem React nem DOM. O estado é `EstadoDialog = null | { tipo, slug? }`, e `null` é o único valor de "nenhum dialog aberto". `navegar`, `voltar` e `fechar` devolvem `{ ok: true, estado }` ou `{ ok: false, motivo }`, com os motivos em `MOTIVOS`. O gatilho só é capturado quando a navegação parte de `null`. Uma combinação inválida é rejeitada, sem fallback.
5. **O que cabe ao `App`:** guardar o `EstadoDialog` e a referência do gatilho, executar o efeito de foco, contenção de `Tab` e `Escape`, renderizar o dialog correspondente ao estado e manter o mapa `slug → dialog de demo` (`demoDialogs`). As transições são decididas pelo módulo de navegação; uma rejeição mantém o estado e só registra um erro no console em desenvolvimento.
6. **Galeria única com tema explícito.** O `ProjectGalleryDialog` atende todos os projetos a partir de `galeria`, com textos, alt e rótulos finais escritos no registro. O campo `tema` (`'cindy'`, `'phx'`, `'nexus'` ou `null`) escolhe a variação visual, sem inferir pelo slug. A galeria reabre sempre na primeira tela. Base e temas ficam num só arquivo CSS, com as regras e as classes que já existiam.
7. **Nomenclatura `dialogs/` e `*Dialog`.** Os dialogs ficam em `src/components/dialogs/`, com o sufixo `Dialog` (`ProjectDetailsDialog`, `ProjectGalleryDialog`, `CindyDemoDialog`, `PhxDemoDialog`, `NexusDemoDialog`, `InfoDialogs`), de acordo com o termo **Dialog** do [glossário](../../GLOSSARY.md). A renomeação foi feita num commit dedicado, só com mudanças de caminhos e nomes.

## Relação com a ADR 0001

Esta ADR atualiza dois pontos da [ADR 0001](0001-estrutura-do-portfolio.md), que segue como registro histórico: os dialogs passaram de `src/components/panels/` para `src/components/dialogs/` (item 7 desta ADR), e `src/utils/` passou a incluir, além dos utilitários de acessibilidade, a navegação pura de dialogs (item 4 desta ADR). As demais decisões da ADR 0001 não são alteradas por esta ADR.

## Alternativas descartadas

- **String com prefixos e um estado por dialog.** A string com prefixos manteria os valores compostos e as combinações inválidas que precisavam de ternários com fallback. Um estado por dialog permitiria dois dialogs abertos ao mesmo tempo.
- **Resolver genérico de dialogs.** Com detalhes e galeria compartilhados, só a demo varia por projeto; um mapa explícito de demos basta e é mais simples de ler.
- **Lançar erro ou criar um dialog de "não encontrado" ao rejeitar.** Um erro pode derrubar a página; um dialog de "não encontrado" atenderia um caso que a navegação já impede (YAGNI). A rejeição mantém o estado atual e só registra um erro no console em desenvolvimento.
- **Componentes React no registro.** A decisão foi manter `src/data/` sem React e sem bibliotecas visuais (D1.5); componentes do `react-icons` no registro acoplariam os dados à biblioteca visual. Com chaves de texto, o registro é dado puro, e a cobertura das chaves é verificada por teste.
- **Gramática de alt gerada em código.** A decisão foi preservar exatamente os textos aprovados, inclusive alt e rótulos de acessibilidade, comparando-os com a versão anterior; por isso os textos finais ficam explícitos no registro, em vez de montados a partir de partes.
- **Golden permanente.** O golden prova equivalência de conteúdo e markup, nunca de comportamento, e serviu à refatoração: foi mantido fora do repositório e usado como comparação temporária. As regras que precisam durar ficaram em testes que verificam o HTML renderizado.
- **Renomeação mista (só os arquivos novos com "Dialog").** Deixaria nomes inconsistentes na mesma pasta; a renomeação foi feita de uma vez.

## Consequências

- Uma regra de navegação ou um campo de projeto muda num lugar só, e a navegação é testada sem navegador.
- Os comportamentos que dependem de estado do componente (a miniatura que acompanha a tela ativa, a troca de seção da demo Nexus, foco e contenção de `Tab`) continuam protegidos por verificações sobre o código-fonte, além do smoke de navegador da Spec 0001, que roda localmente, fora do CI.
- Nomes antigos foram mantidos onde mudar alteraria o markup ou a interface: as classes CSS `people-gallery*`, `info-panel*` e `*-demo-panel*`, o seletor do trap de foco e a prop `activePanel` do `InfoDialogs`.
- Os campos `image`/`alt` sem uso foram removidos só dos **cards** do registro; as telas e prévias das galerias mantêm os seus. Com isso, o registro deixou de referenciar `project-01.webp`, `project-02.webp` e `project-03.webp`. Os arquivos continuam em `public/images/projects/` até a pendência P1 da Spec 0001 decidir a exclusão; `project-04.webp` segue em uso na prévia da Nexus.
- Os dados da demo Nexus continuam no próprio componente, independentes do registro.
