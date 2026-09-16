# Otimização profissional de fluidez preservando o vídeo — Plano de Implementação

> **Para o Hermes:** executar este plano por etapas, com medição antes/depois e revisão visual após cada mudança. Não remover o vídeo nem alterar sua direção visual sem aprovação explícita.

**Objetivo:** reduzir download, decodificação, custo de WebGL e trabalho fora da viewport para tornar o portfólio fluido em máquinas fortes, intermediárias e com GPU integrada, mantendo o vídeo e sua aparência original.

**Arquitetura:** manter o vídeo atual como master intacto e introduzir uma política de qualidade adaptativa. A aplicação deverá ter uma única fonte de verdade para mídia e qualidade, renderizar somente quando necessário e evitar duas pipelines completas de vídeo/WebGL ativas ao mesmo tempo. Mudanças visuais só entram após comparação com a versão atual.

**Stack:** React 19, Vite 8, Three.js/React Three Fiber, OGL, GSAP/ScrollTrigger, Lenis, WebGL, vídeo H.264 e canvas 2D.

---

## 1. Contexto verificado

A auditoria atual encontrou:

- `public/video.mp4` com 3840×2160, H.264, aproximadamente 29,97 FPS, 24,65 Mbps e 98,08 MB.
- Dois usos de `<ShaderVideo />`: `src/App.jsx:111` e `src/components/WaveFooter.jsx:264`.
- Cada uso cria um elemento de vídeo, `THREE.VideoTexture`, `EffectComposer`, `TexturePass`, `ShaderPass` e um loop `useFrame`: `src/components/ShaderVideo.jsx:15-113`.
- O Canvas do vídeo aceita `dpr={[1, 2]}`: `src/components/ShaderVideo.jsx:153-156`.
- O footer mantém um canvas 2D em `requestAnimationFrame` desde a montagem, sem pausa por visibilidade: `src/components/WaveFooter.jsx:151-201`.
- O footer também monta uma segunda pipeline de vídeo antes de o footer entrar na viewport.
- O título usa dois renderers OGL com DPR até 2 e antialias habilitado: `src/components/WarpText.jsx:324-330`.
- O bundle inicial é um único arquivo de aproximadamente 1,44 MB minificado e 415,54 KB gzip. O Vite emite warning de chunk acima de 500 KB.
- As cinco imagens dos projetos estão em WebP, 1600×1200, aproximadamente 330–412 KB cada, com carregamento lazy a partir da segunda imagem.
- As fontes compiladas usam `font-display: swap`.
- `public/FOTO.png` tem aproximadamente 2,22 MB, mas não é referenciado pelo código atual; não é um gargalo de rede se continuar não utilizado.

### Restrições obrigatórias

1. Não apagar nem substituir o vídeo atual.
2. Não alterar crop, cores, loop, velocidade, composição ou direção visual do vídeo na máquina de alta qualidade.
3. Qualquer variante derivada deve vir do mesmo master e preservar o mesmo enquadramento, duração, FPS e tratamento visual.
4. Não aplicar `chunkSizeWarningLimit`, `will-change`, bloqueio de eventos ou redução fixa como maquiagem para esconder o problema.
5. Não declarar ganho de performance sem medição antes/depois.

---

## 2. Critérios de aceitação

### Qualidade visual

- Em perfil de alta capacidade, o vídeo atual de maior qualidade continua sendo usado.
- A comparação lado a lado deve manter enquadramento, cores, contraste, loop e transição da borda.
- O poster deve ser extraído do próprio vídeo, sem imagem genérica ou tela vazia durante o carregamento.
- Redução de resolução só pode ocorrer em perfil intermediário/baixo ou quando a medição de frames justificar.
- O efeito de pontilhado, granulação, scanline, máscara e onda deve permanecer visualmente equivalente dentro de uma tolerância revisada visualmente.

### Fluidez

Usar como metas iniciais, sujeitas à medição do hardware real:

- perfil alto: interface próxima de 60 FPS e vídeo sem frames perdidos perceptíveis;
- perfil baixo: interface estável próxima de 30 FPS, sem travamentos longos;
- nenhum processamento do footer enquanto ele estiver fora da viewport;
- nenhuma segunda pipeline completa ativa simultaneamente sem necessidade;
- nenhuma animação contínua enquanto a aba estiver oculta;
- ausência de long tasks recorrentes acima de 50 ms durante rolagem normal.

### Robustez

- `play()` rejeitado, erro de mídia, WebGL indisponível e perda de contexto devem ter fallback visual funcional.
- `prefers-reduced-motion`, `Save-Data`, viewport pequena e ausência de `requestVideoFrameCallback` devem ter comportamento definido.
- Ao abrir Sobre/Contato, o bloqueio de scroll já corrigido não pode regredir.
- A aplicação deve continuar passando lint e build.

---

## 3. Plano por etapas

### Etapa 0 — Criar baseline reproduzível

**Objetivo:** medir o custo atual antes de alterar qualquer código.

**Arquivos:**
- Consultar: `src/components/ShaderVideo.jsx`
- Consultar: `src/components/WarpText.jsx`
- Consultar: `src/components/WaveFooter.jsx`
- Consultar: `src/components/StickyProjects.jsx`
- Consultar: `package.json`
- Opcional, criar apenas se necessário: `scripts/perf-audit.mjs`

**Passos:**

1. Registrar tamanho dos assets, bundle minificado/gzip e resultado do build.
2. Executar o portfólio em pelo menos três perfis: máquina forte, máquina intermediária e GPU integrada equivalente à Intel HD 4600.
3. Medir no Chrome DevTools Performance:
   - FPS e frames perdidos;
   - tempo de CPU durante o hero, projetos e footer;
   - long tasks;
   - memória e número de contextos WebGL;
   - tempo até o primeiro frame visual do vídeo;
   - rede e bytes transferidos.
4. Registrar separadamente o cenário com vídeo permitido e o cenário com vídeo bloqueado. O segundo serve apenas para isolar o custo da interface.
5. Salvar os resultados em `docs/performance-baseline.md`, sem incluir credenciais, dados pessoais ou arquivos de vídeo duplicados.

**Saída esperada:** uma tabela antes/depois. Sem essa baseline, nenhuma redução de qualidade ou mudança de arquitetura será aprovada.

---

### Etapa 1 — Centralizar política de qualidade

**Objetivo:** impedir que DPR, resolução e FPS sejam escolhidos de forma espalhada pelos componentes.

**Arquivos:**
- Criar: `src/performance/qualityProfile.js`
- Modificar: `src/components/ShaderVideo.jsx`
- Modificar: `src/components/WarpText.jsx`
- Modificar: `src/components/WaveFooter.jsx`
- Modificar: `src/App.jsx` apenas para fornecer o perfil, se necessário

**Passos:**

1. Definir perfis explícitos, por exemplo `high`, `balanced` e `low`, com:
   - limite de DPR;
   - resolução de mídia;
   - intensidade do shader;
   - frequência máxima de renderização;
   - quantidade de efeitos de texto;
   - política de pausa fora da viewport.
2. Derivar o perfil usando combinação de viewport, `devicePixelRatio`, `navigator.connection?.saveData`, suporte WebGL e capacidade observada em runtime.
3. Não usar `hardwareConcurrency` ou nome da GPU como decisão única; esses dados são incompletos e podem errar.
4. Aplicar histerese para que o perfil não fique alternando durante a navegação.
5. Expor o perfil em modo de desenvolvimento para a medição, sem mostrar diagnóstico técnico para visitantes.

**Validação:** o mesmo componente deve receber um perfil explícito nos testes; o comportamento não pode depender de valores implícitos do navegador.

---

### Etapa 2 — Preservar o master e criar entrega adaptativa

**Objetivo:** manter o vídeo atual e reduzir o custo de entrega somente quando o dispositivo não consegue aproveitar 4K com fluidez.

**Arquivos:**
- Preservar: `public/video.mp4`
- Criar, após aprovação da política: variantes derivadas em `public/video-2160.mp4`, `public/video-1440.mp4` e/ou `public/video-1080.mp4`
- Criar: poster derivado em `public/video-poster.webp` ou nome equivalente
- Modificar: `src/components/ShaderVideo.jsx`
- Modificar: `README.md` para documentar a origem e a finalidade das variantes

**Passos:**

1. Manter `public/video.mp4` como master e não reencodá-lo por cima.
2. Gerar variantes com o mesmo corte, duração, FPS, orientação, loop e colorimetria. Registrar o comando de geração e os metadados em documentação.
3. Usar 2160p no perfil alto quando a tela e a capacidade permitirem.
4. Usar 1440p/1080p no perfil balanceado e 1080p ou 720p somente no perfil baixo, conforme a medição mostrar melhor resultado.
5. Usar poster do próprio primeiro frame para reduzir a percepção de espera sem fingir que o vídeo já está pronto.
6. Trocar `preload="auto"` por uma política controlada: metadados/poster primeiro, carregamento da mídia quando o hero estiver pronto e quando autoplay puder ser executado.
7. Tratar `loadedmetadata`, `canplay`, `error` e rejeição de `play()` explicitamente.
8. Não usar HLS, DASH ou streaming adaptativo nesta primeira etapa; só considerar isso se a entrega dos MP4 derivados continuar sendo um gargalo medido.

**Ponto de decisão:** usar uma variante menor em máquina fraca reduz resolução, mas preserva o vídeo e sua direção visual. A recomendação é aceitar essa degradação adaptativa apenas onde a alternativa seria uma experiência travada.

---

### Etapa 3 — Eliminar trabalho duplicado de vídeo/WebGL

**Objetivo:** evitar duas pipelines completas processando o mesmo vídeo ao mesmo tempo.

**Arquivos prováveis:**
- Modificar: `src/components/ShaderVideo.jsx`
- Modificar: `src/App.jsx`
- Modificar: `src/components/WaveFooter.jsx`
- Possivelmente criar: `src/components/BackgroundMedia.jsx` ou `src/performance/mediaController.js`

**Abordagem recomendada:**

1. Criar um controlador único para o elemento de mídia, qualidade, poster, play/pause e estado de visibilidade.
2. Avaliar uma única superfície WebGL de fundo para hero e footer, alterando uniforms conforme a seção ativa.
3. Preservar os parâmetros visuais diferentes do footer como estado de seção, em vez de montar outro `ShaderVideo` completo.
4. Se a unificação de superfície alterar o resultado visual, usar duas instâncias apenas como fallback, mas garantir que somente a pipeline próxima da viewport esteja ativa.
5. Garantir que o mesmo vídeo não seja decodificado e renderizado em dois locais simultaneamente sem necessidade.
6. Manter o conteúdo textual e o footer acessíveis mesmo quando a pipeline estiver pausada.

**Validação visual:** comparar hero, transição para projetos, início do footer e retorno ao topo. Essa etapa não deve ser aprovada apenas por FPS; a composição precisa continuar reconhecível.

---

### Etapa 4 — Reduzir custo do render loop sem remover o efeito

**Objetivo:** renderizar na frequência necessária, e não continuamente por hábito.

**Arquivos:**
- Modificar: `src/components/ShaderVideo.jsx`
- Modificar: `src/components/WarpText.jsx`
- Modificar: `src/components/WaveFooter.jsx`

**Passos:**

1. Usar `IntersectionObserver` e `document.visibilityState` para pausar vídeo, WebGL e canvas 2D fora da viewport ou com a aba oculta.
2. Usar `requestVideoFrameCallback` quando disponível para sincronizar a atualização da textura com frames novos do vídeo.
3. Criar fallback com `requestAnimationFrame` limitado para navegadores sem essa API.
4. No perfil baixo, limitar o processamento a uma cadência compatível com vídeo de aproximadamente 30 FPS e desligar apenas detalhes secundários do shader, não o vídeo.
5. Renderizar um frame único quando o efeito não estiver mudando, em vez de manter loop ativo.
6. Fazer o canvas do footer iniciar apenas quando estiver próximo da viewport e interromper quando sair dela.
7. Manter o `WarpText` pausado fora da área visível e limitar seu DPR/antialias por perfil, validando a aparência do título.
8. Não alterar a integração Lenis/ScrollTrigger sem medir; primeiro verificar se há trabalho duplicado real durante a rolagem.

**Validação:** ao rolar do hero até o footer, o número de loops ativos deve cair quando os elementos deixam a viewport. A rolagem e os modais devem continuar funcionando.

---

### Etapa 5 — Simplificar o caminho de renderização do shader

**Objetivo:** testar se a composição atual pode ser preservada com menos cópias intermediárias.

**Arquivos:**
- Modificar experimentalmente: `src/components/ShaderVideo.jsx`
- Modificar: `src/shaders/videoShader.js`

**Passos:**

1. Criar uma implementação experimental atrás de uma flag de desenvolvimento que desenhe o vídeo diretamente em uma superfície fullscreen.
2. Comparar a implementação direta com `TexturePass + ShaderPass` quanto a:
   - crop;
   - brilho/contraste;
   - pontilhado;
   - grain/scanline;
   - máscara de borda;
   - cor e transparência.
3. Medir GPU time, frames perdidos e memória de render target.
4. Só substituir o `EffectComposer` se a diferença visual for aceitável e a medição comprovar ganho.
5. Manter a implementação anterior disponível até a revisão visual final; não fazer uma refatoração irreversível junto com a mudança de qualidade.

**Observação:** reduzir passes sem preservar o resultado não é otimização profissional; é alteração visual.

---

### Etapa 6 — Dividir o bundle inicial sem esconder warning

**Objetivo:** reduzir parse/compilação inicial de bibliotecas usadas apenas abaixo da primeira tela.

**Arquivos prováveis:**
- Modificar: `src/App.jsx`
- Modificar: `src/components/StickyProjects.jsx`
- Modificar: `src/components/WaveFooter.jsx`
- Modificar: `vite.config.js` apenas depois da análise do bundle
- Possivelmente modificar: `package.json` somente se uma ferramenta de análise for aprovada

**Passos:**

1. Gerar relatório do bundle atual e identificar quais módulos compõem o chunk de 1,44 MB.
2. Avaliar carregamento sob demanda de projetos/footer e das bibliotecas que não são necessárias para o primeiro hero.
3. Garantir que a seção abaixo da primeira tela mantenha placeholder acessível enquanto o chunk chega.
4. Não atrasar o vídeo principal nem o conteúdo textual essencial apenas para melhorar a pontuação de bundle.
5. Usar `manualChunks` somente se o relatório mostrar uma divisão estável e benéfica.
6. Rebuildar e confirmar que o warning diminuiu por redução real, não apenas por aumento artificial do limite.

**Validação:** comparar tempo de carregamento do hero, tamanho dos chunks, navegação até Projetos/Footer e console do navegador.

---

### Etapa 7 — Revisar assets e detalhes de composição

**Objetivo:** eliminar custo secundário sem mexer no vídeo.

**Arquivos:**
- Consultar: `public/projects/*.webp`
- Consultar: `public/FOTO.png`
- Consultar: `src/components/StickyProjects.jsx`
- Consultar: `src/main.jsx`
- Consultar: `src/App.css`

**Passos:**

1. Manter WebP lazy para imagens abaixo da primeira carta.
2. Se a medição em mobile mostrar imagens maiores que o necessário, gerar versões responsivas com `srcset`; preservar os WebP atuais como origem.
3. Confirmar se `FOTO.png` continuará fora do fluxo; não remover como parte da otimização do vídeo.
4. Avaliar `will-change` somente nos elementos realmente animados no momento, pois aplicá-lo às cinco cartas pode reservar camadas desnecessárias.
5. Manter `backdrop-filter` do modal, mas medir seu custo em GPU integrada; se necessário, usar fallback visual equivalente apenas no perfil baixo.
6. Não trocar fontes ou remover caracteres antes de confirmar impacto de rede e aparência em PT-BR.

---

### Etapa 8 — Testes e gates finais

**Objetivo:** comprovar funcionalidade, aparência e performance após cada etapa.

**Comandos obrigatórios:**

```bash
npm ci
npm run lint
npm run build
npm audit --audit-level=high
git diff --check
```

**Validação funcional:**

- carregar o hero em desktop e mobile;
- confirmar poster, início do vídeo, loop e áudio mudo;
- rolar até Projetos e verificar todas as cartas;
- rolar até o footer e confirmar transição das ondas;
- abrir Sobre e Contato com ponteiro fora do painel;
- confirmar que somente o painel rola enquanto estiver aberto;
- fechar o painel e confirmar retorno do scroll normal;
- alternar aba visível/oculta e voltar;
- testar `prefers-reduced-motion`;
- simular falha de WebGL e falha de `play()`;
- verificar ausência de console errors e warnings novos.

**Validação de performance:** repetir a mesma gravação do baseline e registrar:

- FPS/p95 de frame time por seção;
- long tasks;
- frames de vídeo perdidos;
- bytes transferidos;
- tempo até primeiro frame;
- número de vídeos ativos;
- número de pipelines/contextos WebGL ativos;
- memória aproximada;
- comportamento em GPU integrada.

**Critério de encerramento:** nenhuma regressão visual relevante, metas de fluidez atingidas nos três perfis e gates de lint/build/audit passando.

---

## 4. Arquivos que provavelmente mudarão

### Alta probabilidade

- `src/components/ShaderVideo.jsx`
- `src/components/WaveFooter.jsx`
- `src/components/WarpText.jsx`
- `src/App.jsx`
- `src/shaders/videoShader.js`
- `src/performance/qualityProfile.js` — novo
- `docs/performance-baseline.md` — novo

### Dependendo da medição

- `src/components/StickyProjects.jsx`
- `vite.config.js`
- `src/App.css`
- `src/index.css`
- `package.json`
- variantes derivadas em `public/`

### Fora do escopo inicial

- remover o vídeo;
- redesenhar a experiência;
- trocar o shader por imagem estática;
- introduzir streaming adaptativo complexo sem evidência;
- reescrever Lenis/ScrollTrigger;
- corrigir todos os apontamentos de `checkJs`, pois isso é uma frente de tipagem separada da fluidez.

---

## 5. Riscos e pontos cegos

- **Resolução versus fluidez:** manter 4K em toda máquina pode preservar pixels, mas não necessariamente a experiência visual; a política adaptativa precisa de decisão explícita.
- **Dois vídeos no mesmo URL:** cache de rede não elimina necessariamente o custo de duas decodificações e duas pipelines WebGL.
- **Detecção de hardware:** nome da GPU, memória e número de núcleos são sinais imperfeitos; o runtime deve medir e usar fallback conservador.
- **Unificação de Canvas:** uma única pipeline reduz custo, mas pode alterar o timing visual do footer; exige comparação de frames.
- **Vídeo 30 FPS e shader 60 FPS:** renderizar duas vezes o mesmo frame pode desperdiçar GPU; reduzir a cadência pode afetar granulação e scanline, por isso deve ser comparado.
- **Autoplay móvel:** `muted`/`playsInline` ajudam, mas `play()` pode falhar; poster e estado de recuperação são obrigatórios.
- **Contexto WebGL:** múltiplos contextos podem atingir limites ou perder contexto em máquinas fracas; fallback precisa ser utilizável.
- **Custo do Vercel/CDN:** um MP4 de quase 100 MB pode gerar transferência elevada por visitante; variantes preservam o master e reduzem custo de entrega sem removê-lo.
- **Scroll/modal:** qualquer pausa de renderização precisa continuar independente do bloqueio de scroll, para não reintroduzir o bug já corrigido.

---

## 6. Ordem recomendada de execução

1. Baseline mensurado.
2. Política de qualidade única.
3. Poster e carregamento controlado.
4. Pausa por viewport/aba.
5. Evitar duas pipelines de vídeo ativas.
6. Variantes de entrega do mesmo master.
7. DPR/FPS adaptativos.
8. Teste de shader direto sem `EffectComposer`.
9. Code splitting baseado em relatório.
10. Validação visual, funcional e de performance final.

A recomendação é não começar pela compressão do vídeo isoladamente. O gargalo é combinado: arquivo 4K + duas pipelines de vídeo/WebGL + DPR elevado + render loops fora da viewport + bundle inicial grande.

---

## 7. Decisão necessária antes da execução

**Recomendação:** manter o vídeo 4K original para dispositivos capazes e permitir uma variante derivada de menor resolução somente em dispositivos fracos ou sob `Save-Data`, preservando integralmente enquadramento, duração, loop, cores e direção visual.

Essa é a única decisão de produto que altera a entrega de qualidade. Todo o restante pode ser implementado de forma transparente, com o vídeo preservado.
