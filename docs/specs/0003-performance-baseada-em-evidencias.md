# Spec 0003 — Performance baseada em evidências

- **Data:** 14 de novembro de 2026
- **Status:** Aprovada — não iniciada
- **Branch:** `perf/evidencias`, a partir de `origin/main` atualizada **contendo o merge da Spec 0001** ([Fluxo Git](README.md#fluxo-git-todas-as-specs))
- **Depende de:** [0001](0001-registro-projetos-dialogs-galeria.md). **Não depende da [0002](0002-dados-estaticos.md).**
- **Invariantes:** os do [índice](README.md#invariantes-valem-para-todas-as-specs) valem integralmente, em especial o 7 (nenhuma meta ou ganho sem medição)

## 1. Objetivo

Melhorar o desempenho só onde houver evidência medida, sem sacrificar a qualidade visual nem os efeitos do produto. Os números exploratórios do [índice](README.md#contexto-verificado-14112026) não servem de baseline: a baseline válida é a registrada na Etapa 0.

Todas as medições seguem o protocolo da [Spec 0001 §7.2](0001-registro-projetos-dialogs-galeria.md#72-protocolo-de-performance), e as capturas seguem o §7.1 e o §7.3.

## 2. Etapa 0 — Instrumentação

- Corrigir o regex de recursos do `perf-audit.mjs` (escape dentro de `String.raw`).
- Observar long tasks desde o início da navegação.
- Padronizar a porta (hoje aparecem 5182, 4173 e 5187).
- Registrar uma **nova baseline** pelo protocolo da 0001 §7.2. Ela substitui a do `docs/performance-baseline.md` e a da Spec 0001, porque a régua mudou.
- Registrar ambiente, navegador, viewport e condições de medição no manifesto (0001 §7.3).

## 3. Etapa 1 — Otimizações

### 3.1 Imagens
- `logo-header.png` (192 kB) e `logo-mark.png` (79 kB) → WebP dimensionado pelo maior tamanho exibido vezes 3.
- `services-transition.png` (181 kB) → WebP.
- Aprovação conforme o §5. Ao mudar o caminho de um asset, atualizar todas as referências de runtime, a documentação e os testes (`AGENTS.md` §3).

### 3.2 `motion` no `DecryptedText`
A verificação já foi feita:
- O `<motion.span>` recebe só `className`, `ref`, `style`, os handlers do próprio componente e `...props`.
- O único chamador (`App.jsx:197`) passa apenas props declaradas pelo `DecryptedText`, então nenhuma prop do motion chega ao span.
- Trocar por `<span>` tira o `motion` do **chunk principal**, mas **não do bundle**: `BlurText` e `StickyProjects` continuam usando, em chunks lazy. Como Serviços carrega logo em seguida, por estar dentro do `rootMargin` de 800 px, o total baixado no load não deve cair.
- O efeito esperado é só menos JS executado antes da primeira pintura, e **isso só é declarado se medido** (0001 §7.2). Nenhuma estimativa de ganho entra no plano.

### 3.3 Reduced-motion
Corrigir só os loops contínuos de rAF que continuam rodando com reduced-motion. Isso vale apenas para `WarpText` e `WaveFooter`, os dois que têm loop próprio.

- Para todos os componentes, a validação acontece **na inicialização** (página carregada com reduce emulado) e **durante a execução** (emulação alternada com a página aberta, nos dois sentidos: sem preferência → reduce → sem preferência).
- Em todos, conferir também que não há erro de runtime e que nada fica travado num estado intermediário.
- Antes de qualquer correção, o comportamento atual de cada componente é registrado na baseline.
- O comportamento estático e a acessibilidade do reduced-motion são preservados.

| Componente | Comportamento real (lido no código) | O que se valida | Muda nesta spec? |
|---|---|---|---|
| `WarpText` | Loop rAF contínuo (`:461-520`). Escuta a troca da preferência (`:468-515`). Com reduce, zera `uTime` e `uMotion`, mas **o loop continua** | Início: quadro estático correto, sem rAF contínuo. Troca: o loop para ao entrar em reduce e retoma ao sair, com o quadro estático idêntico ao de hoje | Sim: interromper o loop com reduce |
| `WaveFooter` | Loop rAF de desenho (`:167-172`), pausado fora do viewport. Lê `.matches` **uma vez** no setup (`:100`), sem escutar a troca. Com reduce, a fase fica fixa e o progresso vai a 1, mas **o loop continua** redesenhando | Início: onda estática correta, sem rAF contínuo. Troca: hoje **não reage** (a baseline confirma); depois da correção, passa a reagir nos dois sentidos | Sim: interromper o loop e reagir à troca |
| `StickyServices` | **Sem loop próprio**: timeline GSAP guiada pelo scroll. Lê `.matches` uma vez (`:37`). Animações CSS infinitas (`services-wave-*`, engrenagem) com bloco `prefers-reduced-motion` em `StickyServices.css` | Início: estado estático conforme a regra atual. Troca: as animações CSS param e retomam pelo próprio navegador (verificado em `getAnimations()`); o comportamento da timeline JS é só registrado | Não: nenhuma interrupção de loop exigida |
| `StickyProjects` | **Sem loop contínuo**: rAF pontual por evento de scroll (`:137`). Usa `gsap.matchMedia` com a condição `reduced` (`:49-80`), que reage à troca automaticamente | Início e troca: linha da jornada completa e cards marcados como alcançados com reduce, revertendo ao sair | Não |
| `DecryptedText` | **Sem loop contínuo**: `setInterval` finito (cerca de 1,4 s) ao entrar no viewport. Não consulta a preferência | Só registrar o comportamento atual. Não se exige parada, porque não há loop | Não (mudaria comportamento sem previsão) |
| `BlurText` | **Sem loop**: animação única do motion ao entrar no viewport. Não consulta a preferência | Só registrar o comportamento atual | Não |
| CSS de `App.css`, `WaveFooter.css` e `StickyProjects.css` | Blocos `prefers-reduced-motion` próprios, aplicados pelo navegador | Troca: as animações CSS afetadas param e retomam (`getAnimations()`) | Não |

## 4. Etapa 2 — Experimentos condicionais

Cada experimento só segue se houver benefício demonstrado pela 0001 §7.2 e nenhuma regressão perceptível (diff visual + roteiro manual):
- inicialização WebGL do `WarpText`;
- pausa de animações fora da viewport;
- pausa da cena com um dialog aberto.

**Rejeitado nesta spec:** lazy loading da demo Nexus e das galerias (ganho pequeno, risco de flash na primeira abertura e a regra de imports diretos dos dialogs do `AGENTS.md` §5).

## 5. Critérios das imagens re-encodadas

- Comparação com o original em 1×, 2× e 3×, avaliando nitidez, transparência (canal alfa e franjas), bordas e artefatos de compressão.
- Não se exige igualdade de pixels entre formatos diferentes. A aprovação é por revisão humana com o diff como apoio.
- Nenhuma perda de qualidade é aceita em troca de compressão. Se o WebP perder qualidade, ajusta-se a qualidade ou o tamanho, ou mantém-se o PNG.

## 6. Critérios de aceite

1. `perf-audit.mjs` registra recursos e long tasks desde a navegação, numa porta padronizada, e a nova baseline está registrada com mediana, mínimo–máximo e IQR por métrica e cenário.
2. Toda otimização mantida tem ganho demonstrado (0001 §7.2) ou é registrada como "sem diferença demonstrável", sem ganho alegado.
3. Imagens aprovadas pelos critérios do §5.
4. Reduced-motion validado na inicialização e durante a execução, componente a componente (§3.3).
5. Nenhuma regressão binária ou contínua (0001 §7.2), e diff visual dentro da tolerância calibrada (0001 §7.1).
6. Experimentos da Etapa 2 só incorporados com benefício demonstrado e sem regressão perceptível.
