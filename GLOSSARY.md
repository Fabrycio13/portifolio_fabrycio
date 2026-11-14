# Portfólio Fabrycio Bermudes

Linguagem do domínio do portfólio imersivo: a cena visual contínua, os projetos apresentados e os dialogs que se abrem sobre a cena sem desmontá-la.

## Cena e dialogs

**Cena**:
A página principal visível por trás de qualquer dialog: hero, navegação, seções e footer.
_Avoid_: tela principal, página de fundo

**Dialog**:
Sobreposição modal que se abre sobre a cena e preserva o contexto visual dela.
_Avoid_: painel, panel, modal (como substantivo genérico)

**Nenhum dialog aberto**:
O estado em que só a cena está visível.
_Avoid_: estado vazio, painel fechado

**Sobre**:
Dialog do site que apresenta o autor.

**Contato**:
Dialog do site que reúne os canais públicos de contato.

**Gatilho**:
Elemento da cena que abriu o primeiro dialog de uma cadeia de navegação e recebe o foco de volta quando ela se fecha.
_Avoid_: botão de origem, trigger

## Projetos

**Projeto**:
Trabalho de software apresentado no portfólio, com card na cena e dialogs próprios.

**Slug**:
Identidade estável de um projeto (`people`, `cindy`, `phx`, `nexus`).
_Avoid_: id numérico, número do projeto (como identidade)

**Número**:
Posição de exibição de um projeto (`01`–`04`); não identifica o projeto.
_Avoid_: id, chave

**Detalhes do projeto**:
Dialog que apresenta descrição, recursos e tecnologias de um projeto.
_Avoid_: painel do projeto, project panel

**Galeria**:
Dialog que mostra as telas de um projeto, uma por vez, com navegação circular.
_Avoid_: carrossel, gallery panel

**Tela**:
Imagem de uma galeria que mostra uma parte do produto.
_Avoid_: screenshot, slide

**Prévia da galeria**:
Imagem nos detalhes do projeto que abre a galeria e informa quantas telas ela tem.

**Demo**:
Dialog com uma versão interativa de um projeto.
_Avoid_: demo panel, protótipo

**Tema**:
Variação visual de uma galeria, escolhida explicitamente para cada projeto.
_Avoid_: skin, cor do projeto
