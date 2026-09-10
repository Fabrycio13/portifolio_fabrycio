# Portfólio imersivo — Fabrycio Bermudes

Portfólio experimental de **Fabrycio Bermudes — Software Engineer**, construído com React, Vite, Three.js, React Three Fiber, GLSL e GSAP.

A experiência combina vídeo processado em tempo real, tipografia animada, projetos em cards sticky e um footer progressivo com vídeo pixelado e ondas desenhadas em canvas.

## Recursos

- Vídeo em `/public/video.mp4` processado por `THREE.VideoTexture`.
- Pipeline de pós-processamento com `EffectComposer`, `TexturePass` e `ShaderPass`.
- Pixelização, halftone, dithering, contraste e textura digital em GLSL.
- Texto principal em Caacupe One, identidade com `DecryptedText` e linhas com `WarpText`.
- Seção de projetos com cards sticky, GSAP e ScrollTrigger.
- Footer revelado progressivamente após os projetos.
- Ondas em canvas animadas por tempo e scroll, com máscara fechada nas bordas.
- Layout responsivo e scrollbar visualmente oculta sem bloquear o scroll.

## Executar localmente

```bash
npm install
npm run dev
```

Comandos de verificação:

```bash
npm run lint
npm run build
```

## Estrutura principal

- `src/App.jsx` — composição da página.
- `src/components/ShaderVideo.jsx` — vídeo e pipeline WebGL.
- `src/shaders/videoShader.js` — shader GLSL do vídeo.
- `src/components/StickyProjects.jsx` — sequência sticky de projetos.
- `src/components/WaveFooter.jsx` — footer, ondas, links sociais e retorno ao topo.
- `public/video.mp4` — vídeo usado como fonte da textura.
- `public/projects/` — imagens temporárias dos projetos.
