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
│   └── panels/                     # Sobre, Contato e detalhes de projetos
├── sections/                       # Serviços, Projetos e Footer
├── layouts/                        # carregamento estrutural de seções
├── data/                           # cards de projetos e serviços
└── utils/                          # utilitários puros de acessibilidade
```

## Fluxo de carregamento

- `App.jsx` carrega efeitos e dialogs pequenos diretamente para evitar flashes de fallback na primeira abertura.
- Serviços, Projetos e Footer são carregados por proximidade do viewport por meio de `DeferredSection`.
- Os fallbacks preservam a geometria da página enquanto o chunk é baixado.
- Assets servidos pelo Vite ficam em `public/images/` e `public/icons/`.

## Interações principais

- Navegação e CTA principal usam âncoras reais para `#servicos` e `#projetos`.
- Contato, Sobre e detalhes de projetos são dialogs que preservam a cena.
- Cards de projetos mantêm operação por mouse, toque, `Enter` e `Space`.
- O gerenciamento de foco implementa foco inicial, contenção de `Tab`, `Escape` e retorno ao gatilho.
- GSAP/ScrollTrigger controla as sequências sticky; Lenis mantém a navegação suave; OGL renderiza a tipografia deformável.

## Limites de responsabilidade

- `src/data/` não deve conter efeitos ou acesso ao DOM.
- `src/utils/` deve permanecer independente de componentes visuais.
- `src/sections/` pode usar animação e hooks, mas não deve duplicar dados estáticos.
- `public/` contém apenas recursos que precisam ser servidos diretamente pelo navegador.
