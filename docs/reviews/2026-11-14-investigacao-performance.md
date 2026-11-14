# Investigação de performance — 14/11/2026

> **Relatório histórico e exploratório.** Resumo fiel da investigação feita durante a revisão arquitetural, no snapshot `7f53175`. Os números **não são baseline**: há poucas execuções e nenhum registro de dispersão. A baseline válida será registrada na Etapa 0 da [Spec 0003](../specs/0003-performance-baseada-em-evidencias.md), pelo protocolo da [Spec 0001 §7.2](../specs/0001-registro-projetos-dialogs-galeria.md#72-protocolo-de-performance).
> Os dados brutos e os scripts de medição exploratória ficaram fora do repositório, conforme a Spec 0001 §7.3.

## Ambiente

- Chrome 157 headless em ANGLE, com GPU GTX 1660 Ti.
- Viewport desktop 1280×801. Mobile emulado em 390×844 @3x.
- Build de produção servida por `vite preview` em `127.0.0.1:5182`.
- Nenhum arquivo versionado foi alterado durante a investigação.

## Fatos medidos

| Item | Medida |
|---|---|
| Chunk `index` JS (473,5 kB / 147,5 kB gz), atribuído por sourcemap (kB brutos) | react-dom 174 · motion-dom + framer-motion 117 (cerca de 38 gz) · ogl 48 · lenis 20 · react-icons/fa 20 (32 ícones de um índice de 1,36 MB; há tree-shaking) · NexusDemoPanel 13,6 · ProjectDetails 7,8 · App 7,4 · WarpText 6,9 · InfoPanels 4,9 · DecryptedText 4,0 · quatro galerias cerca de 12,6 · demos Phx/Cindy 2,4 |
| Chunk ScrollTrigger (113,6 kB / 44,7 kB gz) | 100% gsap. Baixado já no load inicial, porque Serviços fica dentro do `rootMargin` de 800 px (desktop e mobile) |
| CSS `index` (60 kB) | Regras `.nexus-demo*`: 17,0 kB · galerias e demos: 11,2 kB · `@font-face`: 9,8 kB (18 blocos) |
| Load inicial, desktop | 14 requisições, 736 kB transferidos. Os maiores: `logo-header.png` (192 kB) e `services-transition.png` (181 kB) |
| Load inicial, mobile | 13 requisições, 443 kB. Inclui `logo-mark.png` (79,5 kB); `services-transition` não apareceu na janela de 15 s |
| Fontes efetivamente baixadas | Só 3 woff2 latin (67,8 kB). Os subsets cyrillic, greek, vietnamese e latin-ext e os `.woff` são emitidos no build, mas nunca baixados |
| FCP / LCP sem throttle | 500–552 ms. O elemento de LCP é o texto `P.hero__description`, não a imagem do hero |
| FCP / LCP com CPU 4× e rede de 1,6 Mbps | 1736 ms (desktop) e 1788 ms (mobile) |
| CLS | 0,003 (0,008 com throttle), vindo de cerca de 38 micro-shifts dos glyphs do `DecryptedText` |
| Long task na inicialização | 218–270 ms sem throttle (três execuções). No profiler: construtor do Renderer do OGL 138 ms e `setShaders` 83 ms, ou seja, dois contextos WebGL2 com antialias do `WarpText` |
| Mesmo cenário com `--disable-webgl` | FCP de 376–440 ms e nenhuma long task, cerca de 100 ms antes. É diagnóstico, não correção |
| Custo de main thread em repouso no hero (a cada 5 s) | Normal: 221 ms de tarefas e 300 recálculos de estilo · com o dialog Contato aberto: 273 ms · com reduced-motion: 126 ms e 0 recálculos · sem WebGL: 134 ms |
| Animações CSS rodando com o hero no topo | 8 animações `services-wave-*` em `.services-card` e a engrenagem `section-header-gear-spin`, com Serviços fora da tela |
| `npm run perf:audit` com 5000 ms (Hero / Projetos / Footer) | 59,85 / 59,96 / 59,93 FPS · 0 long tasks · 0 runtimeIssues · canvases 2 / 3 / 3 · Footer montado · 4 cards com `role="button"`. Em linha com a baseline anterior (59,54 / 59,99 / 60,46). Scroll final de 5600 px, contra 4974 px na baseline |
| Iframes de demo | Montados só quando o dialog abre. `phx-demo.html` tem 9,8 kB gz e foi baixado só ao abrir; `nova-cindy-mockup-v2.html` tem 21,5 kB gz. Ambos autocontidos, sem requisições externas. Não há `<video>` |
| Galeria Cindy aberta | 5 imagens, 227 kB, baixadas ao abrir |

## Oportunidades identificadas

1. **Logos do header em PNG muito maiores que o tamanho exibido.**
   - Evidência: `logo-header.png` tem 1843×516 e 192 kB, exibido com no máximo 12rem; `logo-mark.png` tem 560×516 e 79 kB, para no máximo 3,8rem. Ambos acima da dobra.
   - Re-encode exploratório no Chrome: logo em WebP q0.82 com 768 px ficou com 35 kB; a marca com 256 px, 16 kB.
   - Risco baixo, desde que a nitidez seja conferida em telas 2×/3×.
2. **`services-transition.png` (3421×376, 181 kB) no load inicial do desktop.** O WebP q0.82 ficou com 8,7 kB, um número suspeitamente baixo, que **exige verificação de fidelidade**.
3. **Inicialização WebGL do `WarpText` bloqueando a primeira pintura.** Long task de 218–270 ms; sem WebGL o FCP chega cerca de 100 ms antes. Opções: adiar a inicialização ou compartilhar um contexto. Ganho especulativo em hardware fraco; risco médio, por uma possível troca visível entre texto estático e deformado.
4. **`motion` no chunk principal só por causa do `DecryptedText`,** que usa `<motion.span>` sem nenhuma prop de animação. Trocar por `<span>` tira o motion do chunk principal (ele continua nos chunks lazy de `BlurText` e `StickyProjects`). O total baixado não muda; o efeito esperado é menos JS antes da primeira pintura, **ainda não medido**.
5. **Reduced-motion mantendo loops de rAF:** o loop do `WarpText` continua com `uTime=0`, e o do `WaveFooter` continua redesenhando o mesmo quadro.
6. **Animações CSS infinitas fora da tela e efeitos atrás de dialogs:** 60 recálculos de estilo por segundo com o hero no topo, e custo maior com um dialog aberto, porque nada é pausado. Cerca de 1–2% da main thread nesta máquina; especulativo em celular.
7. **NexusDemoPanel e galerias no bundle principal** (cerca de 13 kB gz de JS e 28 kB brutos de CSS). Ganho pequeno e risco de flash na primeira abertura.

## Parece grande, mas não é problema

- `hero.png` (1,5 MB) e `footer.png` (2 MB) são fallback do `<picture>` e não são requisitados; só o WebP é baixado.
- Dos mais de 50 arquivos de fonte, só 3 são baixados, graças ao `unicode-range`.
- O react-icons tem 1,36 MB no índice, mas o tree-shaking deixa 20 kB.
- `project-01..03.webp` só são referenciados em `src/data/projects.js` e nos testes; não são renderizados nem baixados.
- Não há re-render do App a cada scroll: `setIsHeaderScrolled` só muda quando o booleano inverte.
- O intervalo do `DecryptedText` roda cerca de 1,4 s e para; o CLS que ele causa é desprezível.
- Iframes e demos são montados sob demanda e são autocontidos.
- A imagem do hero não é o elemento de LCP, então um preload não mudaria o LCP medido.
- `WarpText` e `WaveFooter` já pausam fora do viewport e com a aba oculta.

## Defeitos preexistentes no `scripts/perf-audit.mjs`

- Sempre devolve `resources: []`: dentro de `String.raw`, o `\\.` vira uma barra invertida literal no regex, que nunca casa.
- O observer de long tasks só começa cerca de 2,3 s depois da navegação, por isso a auditoria reporta "0 long tasks" e não registra a long task da inicialização.

Ambos são corrigidos na Etapa 0 da Spec 0003.

## Não medido

- GPU e energia.
- Hardware real de baixo desempenho.
- Qualidade visual das imagens re-encodadas.
- Abertura das demos Nexus e Cindy pelo probe: o seletor usado acabou abrindo a galeria Cindy no lugar da demo.

## Destino

As oportunidades 1, 2, 4 e 5 entraram na Etapa 1 da Spec 0003; a 3 e a 6, na Etapa 2 como experimentos condicionais; a 7 foi **rejeitada** (lazy loading da demo Nexus e das galerias).
