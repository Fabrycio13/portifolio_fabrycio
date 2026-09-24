# Baseline de performance

## Escopo

Esta baseline descreve a arquitetura atual do portfólio após a remoção do fluxo legado de vídeos e a adoção de carregamento por proximidade do viewport.

- O Hero usa a imagem estática otimizada `public/images/hero/hero.webp`.
- O Footer usa `public/images/footer/footer.webp` e o canvas visual do `WaveFooter`.
- `WarpText` continua usando OGL para o efeito de texto; os canvases ativos não são vídeos.
- Serviços, Projetos e Footer são carregados sob demanda com `IntersectionObserver` e mantêm placeholders estruturais para evitar layout shift.
- Lenis, GSAP/ScrollTrigger, Motion, OGL e os canvases atuais permanecem preservados.

Não há dependência ou referência ativa a `ShaderVideo`, `video.mp4`, `video-1080.mp4` ou `qualityProfile`.

## Método

A sonda usa Chrome via CDP em uma prévia de produção. Ela mede RAF, long tasks, exceções JavaScript, canvases, imagens, recursos carregados, estado dos placeholders e posição de rolagem.

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 5187

node scripts/perf-audit.mjs http://127.0.0.1:5187/ --duration-ms=2000
node scripts/perf-audit.mjs http://127.0.0.1:5187/ --projects --duration-ms=2000
node scripts/perf-audit.mjs http://127.0.0.1:5187/ --footer --duration-ms=2000
node scripts/perf-audit.mjs http://127.0.0.1:5187/ --headed --duration-ms=5000
```

- `hero` mede a página no topo.
- `projects` envia eventos de roda até a seção Projetos.
- `footer` envia eventos de roda até o Footer; esse caminho é compatível com o Lenis ativo.
- `--duration-ms=N` altera a janela de amostragem, com mínimo de 1000 ms.
- `--headed` usa uma janela Chrome isolada para inspeção manual.

## Resultados verificados

A execução local mais recente, em build de produção, usou viewport de `1280×900` e janela de amostragem de 2 segundos:

| Cenário | RAF | Long tasks | Exceções | Scroll final | Canvas | Footer lazy |
|---|---:|---:|---:|---:|---:|---|
| Hero | 59,54 FPS | 0 | 0 | 0 px | 2 | placeholder |
| Projetos | 59,99 FPS | 0 | 0 | 4974 px | 3 | montado |
| Footer | 60,46 FPS | 0 | 0 | 4974 px | 3 | montado |

No cenário de Projetos da execução registrada, a sonda encontrou quatro cards com `role="button"` e `tabIndex=0`, confirmando o contrato de teclado no DOM produzido. O seletor da sonda foi atualizado para os cards do percurso; os números acima são anteriores à refatoração visual.

Esses números são uma amostra local de regressão, não uma garantia para todos os dispositivos. O resultado deve ser repetido em hardware de menor capacidade antes de tomar decisões de design ou trocar efeitos visuais.

## Critérios de regressão

Uma execução deve ser investigada quando ocorrer qualquer um destes sinais:

- `runtimeIssues` maior que zero;
- build ou lint falhar;
- long task inesperada durante o cenário;
- o Footer continuar em placeholder depois do cenário `footer`;
- o número de canvases diminuir sem decisão explícita;
- imagens principais não reportarem `complete=true` e dimensões naturais válidas;
- cards de Projetos perderem `role="button"` ou `tabIndex=0`.

A sonda não transforma esses sinais em uma conclusão automática de qualidade: eles indicam o ponto que precisa ser reproduzido e investigado.

## Limitações

- Chrome headless não representa necessariamente o driver, compositor e carga de GPU da máquina física.
- O Lenis intercepta rolagem; por isso a sonda usa eventos de roda CDP em vez de depender apenas de `window.scrollTo`.
- FPS medido por `requestAnimationFrame` representa o ritmo de pintura observado, não uma medição completa de energia ou memória.
- A medição atual não substitui uma gravação manual no Chrome DevTools Performance em um dispositivo de baixo desempenho.
