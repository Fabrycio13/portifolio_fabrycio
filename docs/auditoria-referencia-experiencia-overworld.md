# Auditoria de experiência pública — referência Overworld Audio

> **Escopo:** análise da página e dos recursos que o navegador carregou publicamente em 8 de setembro de 2026. Não houve download de arquivos para reaproveitamento, leitura de código-fonte, quebra de ofuscação, acesso autenticado ou tentativa de contornar controles. “Provável” identifica inferência técnica, não fato confirmado.

## Resumo executivo

A experiência observada é uma aplicação de página única com navegação de rotas, uma cena em `canvas` que ocupa todo o viewport e uma camada HTML para tipografia, menu, CTAs, acessibilidade e controles. O ganho não vem de uma mecânica de jogo: vem de uma cena panorâmica com poucos pontos de decisão, feedback visual e caminhos de navegação convencionais. A página inicial carregou um `canvas` no tamanho do viewport; em 1264 × 625 CSS px, o canvas reportou 1264 × 625. Em emulação móvel de 390 × 844 CSS px, reportou 585 × 1266 pixels de backing store, compatível com renderização em resolução proporcional ao device pixel ratio.[1]

A implementação autoral recomendada é um **Atlas de Sistemas Vivos** pequeno: cinco zonas de software/IA, conteúdo textual fora da cena, marcadores HTML acessíveis e uma cena 2.5D inicialmente. O resultado preserva a categoria de interação — explorar, arrastar, rolar, clicar e focar — sem reproduzir o universo visual ou os assets de referência.

---

## 1. Estrutura da página

### Observado publicamente

- A raiz de aplicação é `#__nuxt`, com dados de hidratação em `#__NUXT_DATA__`; isso é evidência de uma aplicação **Nuxt/Vue** ou de uma build compatível com esse runtime.[1]
- Há um `canvas` de tela cheia, 10 SVGs no DOM na carga observada e nenhuma tag `<video>` ou `<img>` visível no DOM da rota inicial. Isso aponta para cena renderizada no canvas e SVGs usados sobretudo em interface/controles, não para uma composição de imagens HTML tradicional.[1]
- A interface visível é HTML sobre a cena: marca, navegação, CTA, instrução de uso, controle de som e loader. As rotas públicas observadas incluem início, estúdio e contato; o menu persiste entre elas.[1]
- No desktop, os links são horizontais no topo. No mobile, os links de desktop ficam fora da área visível e surge um botão de menu com `aria-expanded` e `aria-controls="mobile-menu"`, uma adaptação apropriada de navegação.[1]

### Leitura de arquitetura

| Camada | Papel na referência | Implementação autoral recomendada |
|---|---|---|
| Roteamento | muda conteúdo/estado sem abandonar a experiência | Next.js App Router ou Vue/Nuxt; rotas `/`, `/projetos`, `/estudio`, `/contato` |
| Cena | canvas renderiza paisagem e profundidade | React Three Fiber/WebGL para a versão final; SVG/CSS 2.5D no protótipo |
| Interface | menu, textos, CTA, som, instruções | HTML semântico em camada independente do canvas |
| Conteúdo | dados de projetos e páginas | arquivos TypeScript/Zod ou CMS, nunca texto embutido em mesh/modelo |
| Fallback | não ficou explícito na superfície observada | imagem/ilustração 2D + mesmos painéis HTML quando WebGL indisponível |

### O que recriar / o que não recriar

**Recriar como princípio:** cena ocupando o viewport, interface mínima e persistente, exploração opcional, navegação direta, estado de foco ao abrir conteúdo.

**Não reproduzir:** layout exato, marca, paleta, tipografia, textos, tipos de paisagem, mapa, posição de objetos, sons, botões, assets, modelos ou movimentos específicos.

---

## 2. Assets e ordem de carregamento

### Inventário observado na rede pública

| Ordem aproximada | Tipo/função provável | Evidência pública | Papel de performance |
|---:|---|---|---|
| 1 | CSS de entrada + payload de rota | CSS inicial e `_payload.json` iniciaram no começo | entrega estrutura e estado mínimo |
| 2 | Fontes WOFF2 | duas fontes carregadas cedo; cerca de 33 KB e 47 KB transferidos | tipografia da camada HTML |
| 3 | JavaScript do runtime | maior chunk observado: cerca de 436 KB transferidos; chunks menores em seguida | hidratação, roteamento e motor de experiência |
| 4 | Texturas de grão | WebP de cerca de 108 KB e 369 KB | ruído/atmosfera, provavelmente fundo ou pós-processamento |
| 5 | Sprite/interface | spritesheet WebP, cerca de 62 KB; SVGs estão no DOM | botões, ornamentos e sinalização |
| 6 | Dados gráficos | arquivo de correção de cor binário e texturas de ruído, deslocamento, água e fundo | material, pós-processamento e variação visual da cena |
| 7 | Modelo | um GLTF de árvores, cerca de 3,8 KB, e BIN associado de cerca de 28,6 KB | geometria compacta de um objeto/instância da cena |
| 8 | Texturas do modelo | WebP de base color de árvore, cerca de 87 KB | material do modelo |
| 9 | Imagens de CMS | múltiplos WebP de larguras indicadas no nome (`w480` a `w1024`) | conteúdo de projetos ou rotas posteriores |
| 10 | Áudio sob demanda | um Opus de efeito foi requisitado somente após a interação de entrada com som | evita transferir áudio antes de consentimento/ação |

Os itens acima são recursos e tamanhos de transferência observados no navegador; o conteúdo interno e as dimensões decodificadas de texturas não foram inspecionados. A presença de GLTF/BIN, texturas de normal/displacement/noise e detecção de GPU é consistente com uma cena WebGL; a biblioteca 3D específica não é demonstrável apenas pela superfície pública.[1]

### Classificação funcional

- **Decorativos:** grão, blue noise, perlin/simplex noise, correção de cor e imagens de fundo parecem compor atmosfera/material; não devem carregar significado essencial.
- **Interativos:** canvas e marcadores; os controles visíveis são HTML, o que permite foco e rótulos sem expor a mecânica 3D ao leitor de tela.
- **Animados/renderizados:** água, displacement e terreno são indícios de shader/animação de material; isso é inferência pelo nome e pelo tipo de recurso, não confirmação de implementação.[1]
- **Conteúdo:** imagens WebP de CMS em tamanhos responsivos são adequadas para cases; no portfólio novo, devem carregar apenas quando o case for aberto ou estiver próximo da viewport.

### Estratégia original de assets

```text
public/
  fallback/atlas-2d.webp          # imagem leve, sempre disponível
  scene/models/                   # 1 GLB por zona, Meshopt/Draco
  scene/textures/                 # KTX2/WebP; atlas quando possível
  projects/                       # imagens WebP/AVIF responsivas reais
content/
  projects.ts                     # problema, papel, stack, resultado, links
  scene-zones.ts                  # marker, posição, legenda e ação
```

**Orçamento inicial:** 1,5–3 MB para a cena inicial comprimida; imagens e modelos de projetos sob demanda. Evitar vídeo na primeira dobra. Não adicionar uma textura para cada objeto quando materiais sólidos, vertex colors ou um atlas resolvem o mesmo problema.

---

## 3. Movimento

### O que foi percebido / provável técnica / alternativa

| Efeito | O que o visitante percebe | Técnica provável | Alternativa simples | Alternativa avançada | Riscos | Resposta e acessibilidade |
|---|---|---|---|---|---|---|
| Cena panorâmica | mundo contínuo por trás da interface | câmera ortográfica/perspectiva em WebGL + render loop | SVG com 3–5 planos CSS transformados | R3F/Three com camera rig | GPU, motion sickness, custo mobile | limitar deslocamento; fallback estático |
| Arrastar e rolar | sensação de navegar no espaço, não apenas trocar de seção | eventos pointer/wheel alimentam posição-alvo de câmera | `scroll-snap` entre zonas com CSS | spring/inércia em camera rig e gestos unificados | conflito com scroll, perda de foco | não bloquear scroll dentro dos painéis; toque horizontal só no canvas |
| Parallax | planos próximos parecem mover mais que o fundo | profundidade real da câmera ou camadas com fatores distintos | CSS `translate3d` com 0,15×/0,5×/1× | depth buffer, fog, instancing e câmera com damping | jank se atualizar layout em cada evento | usar `requestAnimationFrame`; reduzir/pausar em `prefers-reduced-motion` |
| Superfície viva | água/névoa/grão parecem sutis e contínuos | shader com noise/time uniform; as texturas públicas sugerem esse tipo de material | gradiente + ruído CSS/SVG sem loop | shader GLSL com normal/displacement e pós-processamento leve | consumo contínuo de GPU | pausar quando aba oculta, canvas fora da viewport ou movimento desligado |
| Foco em um ponto | clique parece aproximar/selecionar uma área | interpolação da câmera para alvo e abertura retardada do painel | painel abre sem mover câmera | tween de posição/look-at com damping e cancelamento | transição longa, desorientação, cliques repetidos | 300–550 ms; Escape fecha; foco vai ao heading do painel |

A página informa publicamente que aceita arrastar ou rolar para navegar e clicar em marcadores para explorar. Ela também apresenta versões de instrução para desktop/toque, portanto a intenção de múltiplos métodos de entrada é explícita.[1]

### Estratégia de câmera autoral

- **Cena base:** cinco zonas num retângulo virtual de 1,0 × 0,65; não criar mundo infinito.
- **Pan:** guardar `targetX/targetY`; cada frame aproximar posição atual de target com `lerp(current, target, 0.08)`.
- **Scroll:** converter delta somente quando ponteiro está sobre a cena; nunca sequestrar scroll do conteúdo do painel.
- **Foco:** `focusZone(id)` fixa alvo, reduz intensidade de parallax e abre painel depois de 350 ms.
- **Redução de movimento:** substitui interpolação por troca imediata e corta loops decorativos.
- **Mobile:** zones em carrossel horizontal ou lista 2D; toque no marker abre conteúdo; não exigir drag de precisão.

---

## 4. Interações

### Marcadores e painéis

A superfície pública declara o padrão “clicar em marcadores para explorar”, mas o canvas não expõe marcadores como botões HTML no DOM observado. Isso sugere picking interno no canvas ou elementos sobrepostos; não é possível confirmar sem analisar código, o que ficou fora do escopo.[1]

**Especificação autoral segura:**

1. Use `<button>` HTML para cada marker, sobreposto à cena e sincronizado com coordenadas de projeção 3D.
2. Cada botão tem `aria-label` como “Abrir projeto: Nome”, foco visível e área de 44 px no toque.
3. Hover/focus aumenta halo e exibe legenda curta; nunca apenas muda cor sem texto.
4. Clique chama foco da zona, define `aria-current`/estado visual e abre `<dialog>` ou `<aside role="dialog">`.
5. O painel inclui título, problema, contribuição, decisões, tecnologias, resultado, mídia real e links.
6. Fechar via botão, Escape, clique em backdrop e retorno de foco ao marker de origem.
7. Menu convencional chama a mesma função de foco. Assim, o usuário não precisa “jogar” para navegar.

### Navegação e estados

A navegação pública observada é de rotas: início, estúdio e contato possuem URL própria, canvas persistente e conteúdo HTML diferente. Em mobile, o menu se recolhe em botão com estado expandido, enquanto o contato mantém um caminho direto de e-mail.[1]

Para o portfólio novo:
- `/` — atlas + apresentação;
- `/projetos` — lista/cases, ainda com mini-cena;
- `/estudio` — modo de trabalho, processo, capacidades;
- `/contato` — e-mail, GitHub, LinkedIn e CV.

Manter deep links e renderizar uma versão sem WebGL em cada rota melhora SEO, compartilhamento e acessibilidade.

### Som

A referência oferece entrada com ou sem som e um botão com rótulo acessível de habilitar sons; o efeito Opus observado foi requisitado após a interação de entrada com som.[1]

**Portfólio original:** começar silencioso. Se som existir, usar apenas feedback curto opcional, com botão persistente `aria-pressed`, sem autoplay, sem dependência funcional e sem tocar ao navegar pelo teclado.

---

## 5. Performance

### Sinais positivos observados

- Tipografia e CSS chegam antes de boa parte dos recursos pesados.
- Texturas, GLTF, imagens de CMS e checagem de GPU iniciaram após o runtime/entrada inicial, o que é compatível com carregamento em estágios.[1]
- As imagens de CMS usam WebP e nomes com larguras diferentes, sugerindo variantes responsivas.[1]
- O áudio de entrada foi atrasado até uma ação explícita.[1]

### Possíveis gargalos

- Um chunk JavaScript inicial observado com ~436 KB, antes de contabilizar outros chunks e dados, é relevante para redes móveis.[1]
- Texturas simultâneas, displacement/normal maps, grão e render contínuo podem elevar VRAM, bandwidth e bateria.
- Um canvas no backing store proporcional a alta densidade de pixels aumenta custo de fragment shader; em mobile observado, a resolução interna foi maior que o CSS viewport.[1]
- Imagens de CMS iniciando em grupo podem competir com texturas do canvas se não forem priorizadas/lazy-loaded.

### Estratégia de produção para o novo portfólio

1. Renderizar conteúdo e menu HTML antes do WebGL.
2. Carregar o renderer por `dynamic import` após a primeira pintura; mostrar `atlas-2d.webp` de imediato.
3. Detectar capacidade por feature detection e limitar `dpr` a `Math.min(devicePixelRatio, 1.5)`; oferecer “modo leve”.
4. Uma luz direcional + ambient/hemisphere; sem SSR, bloom pesado ou pós-processamento no MVP.
5. Instancing para objetos repetidos; geometria simplificada; `frustumCulled`; pausar render loop em `visibilitychange` e ao abrir painel, se a cena não precisar reagir.
6. GLB comprimido com Meshopt/Draco e texturas KTX2/WebP; uma textura por atlas sempre que possível.
7. Imagens dos projetos com `sizes`, `srcset`, AVIF/WebP e `loading="lazy"`; vídeo somente sob clique, com poster.
8. Medir preview Vercel em desktop e Android real: LCP, INP, uso de memória, FPS e temperatura/bateria.

---

## Blueprint autoral de implementação

### Fase 0 — protótipo de interação

- HTML + SVG/CSS 2.5D, cinco zonas, markers acessíveis, menu e painel.
- Validar que um visitante encontra projetos e contato em até 30 segundos.
- Nenhum asset 3D final antes da aprovação do mapa e da navegação.

### Fase 1 — conteúdo verdadeiro

- Inserir três projetos reais e links verdadeiros.
- Cada case deve conter problema, papel, decisão, stack, resultado/estágio e mídia própria.
- Implementar metadados, rotas, fallback e testes de teclado/toque.

### Fase 2 — cena final original

- Criar GLBs próprios: Núcleo de Decisões, Docas de Projetos, Torre de Sistemas, Arquivo de Percurso e Canal Aberto.
- Manter os contratos da fase 0: mesma posição semântica, mesmo menu, mesmo conteúdo e mesmos markers.
- Licenças e autoria de cada asset registradas antes de publicar.

### Fase 3 — gates de publicação

- WebGL desligado: conteúdo completo ainda funciona.
- `prefers-reduced-motion`: sem movimento contínuo e sem transições longas.
- Mobile: controles de 44 px, menu acessível, touch sem arrastar obrigatoriamente.
- Lighthouse e teste manual em dispositivos reais.
- Preview Vercel com assets comprimidos e sem segredos no cliente.

## Conclusão

A categoria de experiência a aproveitar é: **um panorama interativo que orienta curiosidade, com navegação normal sempre disponível**. A implementação original deve usar um universo de sistemas e produto, não uma paisagem de áudio/jogos; textos profissionais próprios, tipografia e paleta próprias; objetos com função semântica; e uma versão 2D completa para todos os contextos onde o WebGL não é a melhor escolha.

## Sources

[1] https://overworldaudio.com — Overworld Audio — página pública e recursos observados
