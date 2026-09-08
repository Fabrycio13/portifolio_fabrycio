# Portfólio Fabrycio — Especificação do Universo Visual

## Referência analisada — princípios adotados, sem reprodução

A referência demonstra uma experiência de exploração que funciona porque o **mundo ocupa a tela**, a interface é discreta, a navegação tem dois caminhos (exploração e menu) e os pontos interativos criam curiosidade. O portfólio será autoral: sem textos, assets, composição específica, marca, paleta, imagens, modelos, ilustrações ou animações do site de referência.

A tradução para este projeto é um **atlas de sistemas vivos**: uma pequena topografia abstrata formada por placas de circuito, arquivos, fluxos de dados e um núcleo criativo. Não é uma montanha, ilha ou jogo de aventura. É uma paisagem de software que responde ao visitante.

---

## 1. Conceito completo: Atlas de Sistemas Vivos

Fabrycio é apresentado como alguém que transforma problemas em sistemas claros e úteis. O cenário é uma área compacta, vista em perspectiva elevada, onde cinco ilhas-plataforma se conectam a um núcleo luminoso. Cada ilha representa uma parte real da atuação profissional.

A atmosfera é de **noite azul-petróleo, neblina de dados e luz aqua**, com um único acento violeta para diferenciar projetos. A textura vem de geometria, linhas de circuito e luz; não de partículas excessivas, glassmorphism ou cards decorativos.

### Linguagem visual

- **Câmera:** perspectiva elevada, levemente lateral; nunca visão de primeira pessoa.
- **Cenário:** volumes geométricos originais, placas hexagonais/lenticulares, cabos de luz, antenas e módulos abstratos.
- **Profundidade:** gradiente atmosférico no fundo, planos arquitetônicos no meio e projetos/markers em primeiro plano.
- **Tipografia:** serif editorial somente nos títulos; sans limpa para corpo; mono compacta para sinalização do universo.
- **Som:** desligado por padrão. Se adicionado, somente controle explícito e sem depender dele.
- **Avatar:** opcional na fase de acabamento. Um personagem estilizado só entra se tiver função (ex.: operador do núcleo); ele não será um boneco decorativo.

## 2. Mapa do cenário

| Zona | Posição visual | Símbolo/objeto original | Conteúdo | Ação ao ativar |
|---|---|---|---|---|
| Núcleo | centro, plano médio | reator de decisões com anéis de dados | quem é Fabrycio, atuação, proposta de valor | aproximação curta + painel “Sobre” |
| Doca de Projetos | primeiro plano direito | docas modulares onde cada projeto ancora | estudos de caso e links | foco na doca + seletor de projeto |
| Torre de Sistemas | fundo direito | torre de módulos conectados por sinais | habilidades ligadas a evidências | painel de capacidades por contexto |
| Arquivo de Percurso | primeiro plano esquerdo | monólito-arquivo com trilhas de luz | trajetória e processo | timeline curta em painel |
| Canal Aberto | extremidade inferior direita | baliza/comunicador de luz pulsante | GitHub, LinkedIn, e-mail e CV | painel de contato com CTAs |

A cena cabe numa única área inicial. Não haverá mapa gigante, personagem controlável, inventário, missões bloqueadas nem navegação escondida.

## 3. Objetos e conteúdo associado

### Núcleo de decisões
- Headline: uma frase de atuação real, curta e humana.
- Corpo: que tipo de produto Fabrycio desenvolve e para quem.
- Evidência: especialidades e princípios de trabalho, sem adjetivos vazios.

### Docas de projetos
Cada projeto contém obrigatoriamente:
1. problema que resolve;
2. contribuição de Fabrycio;
3. funcionamento e decisões técnicas relevantes;
4. tecnologias de fato utilizadas;
5. resultado verificável ou estágio atual;
6. imagem/demonstração e URL de projeto/repositório, quando pública.

### Torre de sistemas
Agrupa capacidades por resultado, não por barras de proficiência:
- Interface: experiências web responsivas, acessíveis e claras.
- Sistemas: APIs, dados, regras de negócio e integrações.
- IA aplicada: automação, análise e fluxos úteis para produto.

Cada grupo aponta para um ou mais projetos como evidência.

### Arquivo de percurso
Uma trajetória de no máximo quatro marcos e um fluxo de trabalho de quatro passos: entender → prototipar → construir → validar. Só inclui experiências e datas aprovadas pelo autor.

### Canal aberto
Links diretos de GitHub, LinkedIn, e-mail e currículo. Todos disponíveis também no cabeçalho/menu convencional. No MVP, não haverá formulário que armazene dados.

## 4. Fluxo de navegação

1. **Chegada (0–10 segundos):** nome, atuação, uma frase, botão “Explorar projetos”, menu e indicador “arraste, role ou clique nos sinais”.
2. **Exploração (10–120 segundos):** visitante arrasta/rola para deslocar suavemente o atlas e toca/clica em um sinal.
3. **Foco:** câmera aproxima o objeto por 400–550 ms; o marcador muda de estado; painel HTML legível abre sem remover o menu.
4. **Leitura/ação:** painel oferece conteúdo e links reais.
5. **Retorno:** fechar restaura a posição anterior da câmera; o objeto recebe estado de “visitado”.
6. **Atalho:** Sobre, Projetos, Habilidades e Contato no menu movem a câmera para a zona correspondente e abrem o mesmo painel.

O visitante nunca precisa explorar para localizar currículo, contato ou projetos.

## 5. Estratégia de câmera e movimento

### Desktop
- A cena usa uma posição base e limites de deslocamento pequenos, no máximo 8–12% em cada eixo.
- Arrastar atua como pan amortecido; a câmera não gira livremente nem causa desorientação.
- Scroll vertical é convertido em deslocamento horizontal curto entre zonas, com snap suave quando o gesto termina.
- Clique em marcador chama `focusZone(zoneId)`: interpolação de posição/zoom, redução de movimento do fundo e abertura do painel quando a transição termina.

### Toque e mobile
- Um gesto horizontal navega entre zonas; o scroll vertical permanece natural para conteúdo do painel.
- Os marcadores têm alvo mínimo de 44 × 44 px.
- O fallback de mobile é uma sequência de seções com ilustração estática do atlas e os mesmos botões/painéis.

### Redução de movimento
- Controle visível “Movimento: ligado/desligado”, persistido em `localStorage`.
- `prefers-reduced-motion: reduce` inicia desligado.
- Sem movimento: sem parallax contínuo, transições instantâneas/curtas e plano 2D do cenário.

## 6. Parallax e animações

| Camada | Movimento com câmera | Animação contínua | Regra |
|---|---:|---|---|
| Fundo atmosférico | 0,15× | névoa CSS lenta / gradiente | imperceptível durante leitura |
| Arquitetura distante | 0,35× | brilho leve nos contornos | nunca pisca |
| Plataformas e objetos | 0,70× | oscilação vertical de 2–4 px | pausar fora de foco |
| Marcadores | 1× | halo respirando a cada 2,5–3 s | foco/hover prevalece |
| Painel HTML | 0× | nenhuma contínua | texto estável |

Não usar partículas sem significado, transições longas, autoplay de vídeo nem som automático.

## 7. Organização dos assets

```text
portfolio-fabrycio/
├── content/
│   ├── profile.ts
│   ├── projects.ts
│   └── scene-zones.ts
├── public/
│   ├── scene/
│   │   ├── fallback-atlas.webp
│   │   ├── models/              # GLB autorais, comprimidos
│   │   ├── textures/            # WebP/KTX2, só as necessárias
│   │   └── media/               # imagens dos projetos em WebP
│   └── og/
├── components/
│   ├── scene/                   # render WebGL/2.5D, câmera, layers
│   ├── interaction/             # drag, gesture, marker, preference
│   └── content/                 # painel, menu, dados de projetos
└── app/
```

- O conteúdo textual e os links vivem em arquivos tipados, nunca dentro de GLB/mesh.
- Carregar primeiro a interface HTML, depois a imagem fallback; carregar GLB e texturas por zona sob demanda.
- GLB: geometria simplificada e compressão Draco/Meshopt. Texturas: WebP/KTX2. Vídeos: somente se comprovadamente úteis, sem autoplay e com poster.
- Meta inicial: todo o caminho inicial funcional antes de carregar assets de projeto fora da zona ativa.

## 8. Fases de desenvolvimento

### Fase 0 — protótipo geométrico (agora)
Usar CSS/SVG/Canvas e formas abstratas: profundidade, zones, markers, painel, drag, scroll controlado, preferências de movimento e fallback. Validar entendimento, não beleza final.

### Fase 1 — conteúdo real
Inserir bio, 3 projetos, links, imagens reais e metadados. Validar navegação por teclado, toque, contraste e SEO.

### Fase 2 — acabamento visual
Substituir apenas formas aprovadas por objetos/GLB autorais, mantendo o mesmo mapa e os mesmos contratos de interação. Revisar licença e orçamento de performance de cada asset.

### Fase 3 — produção
Otimização, fallback WebGL, testes E2E, preview Vercel e publicação.

## Critérios para avançar do protótipo para o 3D final

- Uma pessoa entende quem é Fabrycio e encontra projetos em 30 segundos.
- Menu e marcadores abrem o mesmo conteúdo.
- A cena continua legível com movimento reduzido, teclado, touch e WebGL desligado.
- Não há promessa inventada, URL falsa ou métrica fictícia no conteúdo final.
- A direção visual foi aprovada antes de produzir/contratar/criar assets finais.
