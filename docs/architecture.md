# Arquitetura

## Visão geral

O portfólio é uma aplicação React/Vite de página única. A experiência mantém uma cena visual contínua e compõe conteúdo em camadas: mídia do hero, navegação, seções orientadas a scroll, dialogs preservando a cena e footer com canvas.

```text
src/
├── App.jsx                         # shell, navegação e composição
├── App.css                         # layout global e estados visuais
├── index.css                       # reset, fontes e regras de documento
├── components/
│   ├── effects/                    # BlurText, DecryptedText, WarpText
│   └── dialogs/                    # Sobre, Contato e dialogs dos projetos
├── sections/                       # Serviços, Projetos e Footer
├── layouts/                        # carregamento estrutural de seções
├── data/                           # registro de projetos e serviços
└── utils/                          # navegação de dialogs e acessibilidade
```

## Fluxo de carregamento

- `App.jsx` carrega efeitos e dialogs pequenos diretamente para evitar flashes de fallback na primeira abertura.
- Serviços, Projetos e Footer são carregados por proximidade do viewport por meio de `DeferredSection`.
- Os fallbacks preservam a geometria da página enquanto o chunk é baixado.
- Assets servidos pelo Vite ficam em `public/images/` e `public/icons/`.

## Interações principais

- Navegação e CTA principal usam âncoras reais para `#servicos` e `#projetos`.
- Contato, Sobre e os dialogs dos projetos (detalhes, galeria e demos) preservam a cena.
- Cards de projetos mantêm operação por mouse, toque, `Enter` e `Space`.
- A entrada dos cards usa `IntersectionObserver`: deslocamento lateral conforme o lado do card e fade-in de 650 ms, somente na primeira entrada no viewport. O observer deixa de observar cada card revelado; foco por teclado também revela o card. Movimento reduzido mostra os cards sem essa animação.
- O gerenciamento de foco implementa foco inicial, contenção de `Tab`, `Escape` e retorno ao gatilho.
- GSAP/ScrollTrigger controla a sequência sticky de Serviços e mede o avanço local de Projetos. Um único `motion.path` desenha a serpentina de Projetos; a geometria é recalculada com `ResizeObserver` a partir das etapas em fluxo normal. Cards e percurso alternam os lados tanto no desktop quanto no celular; no celular, as curvas atravessam somente os espaços entre os cards para preservar a leitura. A ponta acompanha a altura da rolagem, inclusive no retorno; os cards ganham destaque quando ela se aproxima. Com movimento reduzido, o percurso fica completo. Lenis mantém a navegação suave; OGL renderiza a tipografia deformável.

## Dialogs e registro de projetos

Os motivos e as alternativas descartadas estão na [ADR 0002](decisions/0002-registro-de-projetos-e-dialogs.md).

- `src/data/projects.js` é o registro único dos projetos, identificados pelo `slug`.
- `src/utils/dialogNavigation.js` decide as transições entre dialogs (`navegar`, `voltar`, `fechar`) sobre o estado `null | { tipo, slug? }`, e rejeita com motivo uma combinação inválida.
- `App.jsx` guarda esse estado e o gatilho, aplica foco inicial, contenção de `Tab` e `Escape`, renderiza o dialog do estado e mantém o mapa `slug → dialog de demo`.
- `ProjectGalleryDialog` atende a galeria de todos os projetos; o campo `tema` do registro escolhe a variação visual.
- Os nomes `people-gallery`, `info-panel` e `*-demo-panel` das classes CSS vêm de antes da padronização em `dialogs/` e foram mantidos para não alterar o markup.

## Limites de responsabilidade

- `src/data/` não deve conter efeitos ou acesso ao DOM.
- `src/utils/` deve permanecer independente de componentes visuais.
- `src/sections/` pode usar animação e hooks, mas não deve duplicar dados estáticos.
- `public/` contém apenas recursos que precisam ser servidos diretamente pelo navegador.
