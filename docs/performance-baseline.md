# Baseline de performance

## Escopo

Esta baseline registra o comportamento da implementação atual após as otimizações estruturais de carregamento, visibilidade e renderização direta do shader.

O vídeo master não foi alterado: `public/video.mp4` continua sendo a fonte 4K usada pela aplicação.

## Método

- Servidor principal da baseline inicial: prévia de produção em `http://127.0.0.1:5184/`, criada após `npm run build`.
- Referência adicional: Vite dev em `http://127.0.0.1:5182/`.
- Navegador da baseline inicial: Chrome headless `152.0.7977.83`.
- Viewport reportado pela página: `innerHeight=805px`.
- Janela: 5 segundos de amostra após aquecimento da página.
- Cenários:
  - `hero`: topo da página, vídeo principal permitido;
  - `projects`: início da seção de projetos, usado para validar o pré-aquecimento do footer;
  - `footer`: rolagem para o footer, vídeo principal permitido;
  - `blocked`: requisições a `video.mp4` bloqueadas para isolar a interface.
- Comando:

```bash
node scripts/perf-audit.mjs http://127.0.0.1:5184/
node scripts/perf-audit.mjs http://127.0.0.1:5184/ --projects
node scripts/perf-audit.mjs http://127.0.0.1:5184/ --footer
node scripts/perf-audit.mjs http://127.0.0.1:5184/ --blocked
node scripts/perf-audit.mjs http://127.0.0.1:5184/ --headed
```

A sonda mede RAF, estado dos elementos `<video>`, resolução, contadores de frames do vídeo, Canvas presentes, long tasks, requests de mídia e exceções de runtime. `--headed` usa uma janela Chrome isolada com o caminho normal de composição; `--duration-ms=N` altera a duração da amostra; `--force-low` é apenas um modo de teste para validar o perfil baixo.

## Resultados oficiais — build de produção

| Cenário | RAF | Vídeo ativo | Resolução | Frames do vídeo | Frames perdidos | Canvas | Long tasks | Exceções |
|---|---:|---|---|---:|---:|---:|---:|---:|
| Hero | 60,12 FPS | principal | 3840×2160 | 201 | 4 | 4 | 0 | 0 |
| Footer | 59,57 FPS | footer | 3840×2160 | 219 | 5 | 4 | 0 | 0 |
| Sem vídeo | 59,93 FPS | nenhum | — | 0 | 0 | 3 | 0 | 0 |

### Referência — servidor de desenvolvimento

O mesmo teste no Vite dev apresentou `53,62 FPS` no hero, com `8` frames perdidos e `2` long tasks. Esse resultado não é usado como baseline oficial porque HMR e o pipeline de desenvolvimento alteram o custo de inicialização.

### Estado validado no footer

- `scrollY=5675px`.
- Footer visível na viewport.
- Vídeo do hero pausado.
- Vídeo do footer reproduzindo.
- Os dois vídeos mantêm metadados 3840×2160, mas apenas a pipeline visível decodifica frames no momento final da amostra.

## Leitura dos dados

1. A política de visibilidade está funcionando: a segunda pipeline não permanece reproduzindo enquanto o footer está ativo.
2. O cenário sem vídeo mantém aproximadamente 60 FPS, isolando o custo principal no caminho de mídia/WebGL e não na estrutura básica da interface.
3. O hero 4K apresentou perda de frames mesmo na build de produção, embora o RAF tenha permanecido próximo de 60 FPS no Chrome headless. Isso justifica repetir a medição na Intel HD 4600 real antes de escolher uma política adaptativa.
4. Não houve exceção JavaScript durante as amostras; o Canvas do shader foi montado nos cenários com mídia ativa.
5. Os contadores de frames são acumulados desde o carregamento do elemento, não apenas durante os 5 segundos finais.

## Política adaptativa implementada

O arquivo `public/video.mp4` continua sendo o master 4K e é a escolha padrão. O arquivo `public/video-1080.mp4` é um derivado separado, com `1920×1080`, 29,97 FPS, 33,045 s, H.264 High e aproximadamente 63,55 MB; ele não substitui nem altera o master de aproximadamente 102,85 MB.

A aplicação usa `src/performance/qualityProfile.js` para tomar uma decisão única compartilhada pelo hero e pelo footer:

1. `Save-Data` inicia diretamente no perfil baixo.
2. `MediaCapabilities.decodingInfo()` testa o master com codec H.264 High nível 5.2 (`avc1.640034`). Se o navegador declarar o vídeo não suportado ou não fluido, o perfil baixo é selecionado.
3. Quando o perfil alto está ativo, cada pipeline visível mede janelas de 5 segundos. Duas amostras ruins consecutivas (`<55 FPS` ou `≥5%` de frames de vídeo perdidos) selecionam o perfil baixo.
4. A decisão não volta para 4K durante a sessão, evitando alternância de fonte e oscilação visual.
5. Ao entrar na seção `.projects`, o vídeo do footer começa a ser preparado. O Canvas/WebGL do footer só é montado quando o elemento está realmente visível, e o hero é pausado ao sair da viewport.

### Validação do perfil baixo

No Chrome headed isolado, com `--force-low --footer`, a aplicação:

- requisitou `video-1080.mp4` via `206 Partial Content`;
- apresentou ambos os vídeos em `1920×1080`;
- manteve o vídeo do hero pausado e o vídeo do footer reproduzindo;
- mediu `59,98 FPS` e `0` frames perdidos no vídeo ativo;
- não registrou exceções JavaScript.

Esse modo `--force-low` não é uma regra de produção; ele existe para validar deterministicamente a rota de fallback.

## Limitações

- Chrome headless não reproduz necessariamente o mesmo driver, compositor e carga de GPU da máquina física com Intel HD 4600.
- O Chrome faz requests `206 Partial Content` para o MP4; o `encodedDataLength` do CDP não representa sozinho o tamanho total baixado pelo pipeline de mídia. Por isso, bytes de rede do vídeo não são usados como conclusão nesta baseline.
- Esta medição não substitui uma gravação manual no Chrome DevTools Performance em uma máquina fraca real.

## Próxima validação

A política adaptativa já está implementada sem degradação fixa para todos os visitantes. Falta validar a decisão automática em uma máquina física com Intel HD 4600; o teste headed local confirmou o caminho real de composição, mas não substitui uma máquina com o hardware-alvo. O master 4K permanece preservado para o perfil alto.
