# Portfólio Imersivo 3D — Plano de Implementação

> **Para Hermes:** use a skill de desenvolvimento orientado por subagentes para executar este plano tarefa a tarefa.

**Objetivo:** Criar um portfólio de desenvolvedor que funcione como uma experiência interativa curta — com um avatar 3D estilizado, exploração guiada e desafios leves — sem sacrificar clareza para recrutadores nem desempenho na Vercel.

**Arquitetura:** Uma aplicação Next.js estática/híbrida terá uma página-experiência principal. A interface 2D apresenta conteúdo profissional legível; uma cena 3D em React Three Fiber dá personalidade, reação ao cursor/scroll e transições entre “estações” do percurso. O conteúdo será uma fonte tipada local, não ficará escondido dentro dos modelos 3D.

**Stack:** Next.js (App Router), TypeScript strict, Tailwind CSS, React Three Fiber + Drei + Three.js, Framer Motion, Zod (validação do conteúdo), Vercel Analytics/Speed Insights e Playwright.

---

## Direção criativa

### Conceito definido: “Laboratório interativo de software e IA”

A página não será uma sequência de cartões. A pessoa entra em um laboratório 3D compacto e estilizado: uma representação do espaço onde Fabrycio cria software e produtos de IA. A câmera é isométrica ou levemente inclinada; não há personagem controlável no MVP. O visitante clica em objetos iluminados, a câmera se aproxima suavemente e um painel 2D legível abre o conteúdo correspondente. Fechar o painel devolve a visão anterior.

| Elemento do laboratório | Conteúdo revelado |
| --- | --- |
| Computador principal | Apresentação, atuação e especialidades |
| Bancada com dispositivos | Projetos desenvolvidos |
| Painel de sistemas | Habilidades organizadas por área e ligadas a evidências |
| Arquivo de experiências | Trajetória e modo de trabalho |
| Comunicador | Contato, GitHub, LinkedIn e currículo |

Cada projeto terá um objeto próprio e uma reação visual curta que faça sentido para ele. Exemplo: para um sistema de recrutamento, um terminal organiza cartões de candidatos. A animação ilustra o produto; não substitui a explicação.

A chegada deve entregar imediatamente, antes de qualquer exploração: nome, atuação, frase de valor, CTAs **“Explorar laboratório”** e **“Ver projetos”**, contato acessível e a dica curta **“Clique nos elementos iluminados”**.

O menu fixo — **Sobre**, **Projetos**, **Habilidades** e **Contato** — abre o mesmo conteúdo sem depender da cena. O visitante pode compreender todo o portfólio em cerca de dois minutos, mas ganha detalhes ao explorar.

### Regras contra um portfólio chato — e contra um portfólio confuso

- A interação deve revelar conteúdo, não escondê-lo. Cada seção terá versão textual e CTA visível.
- Não usar scroll-jacking, tela de carregamento longa, som automático, controles misteriosos, `click to enter` obrigatório ou menus apenas dentro do canvas.
- A primeira informação útil e os CTAs devem aparecer antes de qualquer asset 3D grande terminar de carregar.
- O 3D é linguagem visual: modelo leve, sombras suaves, poucas animações significativas e câmera limitada.
- Acessibilidade e versão reduzida não são “modo inferior”: em `prefers-reduced-motion`, mobile fraco ou erro de WebGL, trocar por ilustrações/CSS e preservar todo o conteúdo.
- O efeito “parece que sou eu” virá de elementos fornecidos por Fabrycio: avatar/traços visuais, frase curta, escolhas de projetos, rotina de trabalho e tom de voz — não de um personagem genérico de tecnologia.

## Premissas de escopo

- O diretório atual não contém aplicação; apenas `IDEA.md`, que descreve um jogo separado. A aplicação do portfólio deve nascer em uma pasta própria e **não** reaproveitar a ideia do jogo como funcionalidade obrigatória.
- MVP tem uma única rota pública em PT-BR, sem CMS, login, banco de dados ou formulário que armazene dados.
- Projetos, URLs, foto/traços de avatar e dados de contato ainda serão fornecidos antes de preencher conteúdo final. Nunca inventar métricas, clientes, depoimentos ou projetos.
- Publicação será feita na Vercel após repositório Git configurado e informações reais inseridas.

---

## Tarefas de implementação

### Tarefa 1: Definir matéria-prima e roteiro do personagem

**Objetivo:** Converter identidade profissional real em conteúdo curto, verificável e pronto para a experiência.

**Arquivos:**
- Criar: `portfolio-fabrycio/content/site.ts`
- Criar: `portfolio-fabrycio/content/projects.ts`
- Criar: `portfolio-fabrycio/content/schema.ts`

**Passos:**
1. Reunir: nome de exibição, título, cidade/fuso se desejado, bio de uma frase, GitHub, LinkedIn, e-mail, CV e foto/referências visuais.
2. Escolher de 3 a 5 projetos com URL funcional; para cada um registrar problema, participação, stack, decisão difícil, resultado comprovável e link.
3. Definir 3 traços que o avatar/ambiente deve comunicar (ex.: pragmático, curioso, cuidadoso com produto) e 3 objetos que representem esses traços.
4. Criar schemas Zod para `Profile`, `Project`, `SkillGroup` e `SocialLink`; validar os dados no build.
5. Usar placeholders explicitamente rotulados apenas até as informações reais existirem; não publicar com eles.

**Verificação:**
```bash
cd portfolio-fabrycio && npm run typecheck
```
Esperado: nenhum erro TypeScript ou de validação do conteúdo.

---

### Tarefa 2: Criar a base Next.js pronta para Vercel

**Objetivo:** Inicializar uma aplicação mínima, tipada e reproduzível.

**Arquivos:**
- Criar: `portfolio-fabrycio/package.json`
- Criar: `portfolio-fabrycio/next.config.ts`
- Criar: `portfolio-fabrycio/tsconfig.json`
- Criar: `portfolio-fabrycio/app/layout.tsx`
- Criar: `portfolio-fabrycio/app/page.tsx`
- Criar: `portfolio-fabrycio/app/globals.css`
- Criar: `portfolio-fabrycio/vercel.json` somente se houver configuração necessária além dos defaults.

**Passos:**
1. Inicializar com `create-next-app` usando App Router, TypeScript strict, ESLint e Tailwind.
2. Instalar versões compatíveis de `three`, `@react-three/fiber`, `@react-three/drei`, `framer-motion`, `zod`, `@vercel/analytics`, `@vercel/speed-insights` e Playwright.
3. Incluir scripts `dev`, `build`, `lint`, `typecheck`, `test:e2e` e `test:e2e:ui`.
4. Configurar metadata base, idioma `pt-BR`, favicon/manifest temporários e a fonte local/remota com `next/font`.
5. Garantir que a página principal renderize sem JavaScript como conteúdo básico (heading, resumo e links).

**Verificação:**
```bash
cd portfolio-fabrycio && npm run lint && npm run typecheck && npm run build
```
Esperado: os três comandos finalizam com código 0.

---

### Tarefa 3: Construir o sistema visual 2D antes do canvas

**Objetivo:** Definir uma interface memorável e legível que sustente a experiência se o 3D falhar.

**Arquivos:**
- Criar: `portfolio-fabrycio/components/ui/Section.tsx`
- Criar: `portfolio-fabrycio/components/ui/ButtonLink.tsx`
- Criar: `portfolio-fabrycio/components/ui/ProjectSheet.tsx`
- Criar: `portfolio-fabrycio/components/navigation/ProgressNav.tsx`
- Criar: `portfolio-fabrycio/components/sections/HeroContent.tsx`
- Criar: `portfolio-fabrycio/components/sections/ProjectsContent.tsx`
- Criar: `portfolio-fabrycio/components/sections/ProcessContent.tsx`
- Criar: `portfolio-fabrycio/components/sections/ContactContent.tsx`
- Modificar: `portfolio-fabrycio/app/page.tsx`
- Modificar: `portfolio-fabrycio/app/globals.css`

**Passos:**
1. Criar tokens semânticos de cor, espaçamento, tipografia, profundidade e foco; evitar cores e tamanhos soltos nos componentes.
2. Implementar a composição vertical das cinco estações, com IDs de âncora e navegação de progresso fixa.
3. Montar os cards de projeto como folhas/painéis expansíveis: imagem, papel de Fabrycio, desafio, decisão, stack, resultado e links.
4. Aplicar motion de entrada discreto, acionado uma vez e respeitando `prefers-reduced-motion`.
5. Implementar estados de foco, navegação por teclado e contraste AA; manter links e botões com nomes acessíveis.

**Teste de aceitação:**
- Sem carregar o canvas, o visitante lê proposta, projetos, processo e contato em ordem sem bloqueios.
- Em 320 px, 768 px e desktop, não há corte horizontal, texto sobreposto nem alvo clicável pequeno.

---

### Tarefa 4: Criar o avatar e ambiente 3D com orçamento de performance

**Objetivo:** Materializar personalidade visual sem transformar a home em demo pesada.

**Arquivos:**
- Criar: `portfolio-fabrycio/components/scene/PortfolioScene.tsx`
- Criar: `portfolio-fabrycio/components/scene/SceneCanvas.tsx`
- Criar: `portfolio-fabrycio/components/scene/Avatar.tsx`
- Criar: `portfolio-fabrycio/components/scene/DeskWorld.tsx`
- Criar: `portfolio-fabrycio/components/scene/InteractiveObject.tsx`
- Criar: `portfolio-fabrycio/components/scene/SceneFallback.tsx`
- Criar: `portfolio-fabrycio/hooks/useReducedExperience.ts`
- Criar: `portfolio-fabrycio/public/models/avatar.glb`
- Criar: `portfolio-fabrycio/public/models/desk-world.glb`
- Criar: `portfolio-fabrycio/public/textures/` (somente texturas efetivamente usadas)

**Passos:**
1. Criar ou licenciar explicitamente um avatar low-poly estilizado; obter permissão/licença dos assets e registrar origem em `public/models/README.md`.
2. Preferir um único ambiente GLB com geometria instanciada e materiais simples; comprimir com Draco/Meshopt e otimizar texturas WebP/KTX2 quando a pipeline suportar.
3. Carregar `SceneCanvas` por `next/dynamic` com `ssr: false`, placeholder estático e limite de DPR.
4. Colocar luz ambiente, uma luz principal e sombras suaves ou falsas; não usar pós-processamento no MVP.
5. Adicionar reações pequenas: o avatar acompanha o cursor dentro de limites, objetos relevantes mudam de estado no hover/focus e a câmera acompanha a estação ativa sem giro livre.
6. Integrar o estado de estação com o conteúdo 2D, para que interagir no 3D e clicar na navegação leve ao mesmo lugar.
7. Detectar `prefers-reduced-motion`, touch/viewport pequeno e falha de WebGL; renderizar `SceneFallback` e nunca deixar conteúdo depender do canvas.

**Orçamento inicial:**
- JS adicional inicial do 3D: medir e reduzir; carregar depois do hero textual.
- Modelos e texturas da rota inicial: meta de até 3 MB transferidos após compressão; justificar qualquer aumento.
- Sem vídeo autoplay na primeira dobra.
- Canvas pausado quando não estiver visível ou quando a aba perder foco.

**Verificação:**
- Navegação completa via teclado sem precisar clicar no canvas.
- A página continua navegável quando WebGL é desabilitado no navegador.
- DevTools Network confirma que o modelo não bloqueia o primeiro conteúdo textual.

---

### Tarefa 5: Transformar projetos em missões navegáveis

**Objetivo:** Usar gamificação para criar ritmo e descoberta, sem parecer infantil ou esconder evidência profissional.

**Arquivos:**
- Criar: `portfolio-fabrycio/components/game/MissionMap.tsx`
- Criar: `portfolio-fabrycio/components/game/MissionMarker.tsx`
- Criar: `portfolio-fabrycio/components/game/MissionDrawer.tsx`
- Criar: `portfolio-fabrycio/lib/mission-state.ts`
- Criar: `portfolio-fabrycio/lib/projects.test.ts`
- Modificar: `portfolio-fabrycio/components/sections/ProjectsContent.tsx`
- Modificar: `portfolio-fabrycio/components/scene/PortfolioScene.tsx`

**Passos:**
1. Modelar cada projeto como missão com status visual (`concluída`, `em exploração`, `em construção`) e campos de conteúdo reais.
2. Criar mapa/progresso com clique e teclado; cada marcador abre a mesma ficha de projeto acessível da interface 2D.
3. Usar micro-feedback somente em ações explícitas (ex.: conclusão visual de missão aberta), sem pontuação falsa, ranking ou coleta de dados.
4. Testar que todo projeto tem título, problema, contribuição, resultado e pelo menos um link válido.

**Teste inicial:**
```ts
it('rejeita projeto sem evidência de resultado ou link', () => {
  expect(() => ProjectSchema.parse(incompleteProject)).toThrow();
});
```

**Verificação:**
```bash
cd portfolio-fabrycio && npm run test:unit
```
Esperado: schema rejeita dados incompletos e aceita o conjunto de projetos publicado.

---

### Tarefa 6: Tornar a experiência confiável, indexável e acessível

**Objetivo:** Preparar o projeto para usuários reais, leitores de tela e mecanismos de busca.

**Arquivos:**
- Criar: `portfolio-fabrycio/app/robots.ts`
- Criar: `portfolio-fabrycio/app/sitemap.ts`
- Criar: `portfolio-fabrycio/components/seo/JsonLd.tsx`
- Criar: `portfolio-fabrycio/public/og/portfolio-cover.png`
- Criar: `portfolio-fabrycio/tests/e2e/home.spec.ts`
- Modificar: `portfolio-fabrycio/app/layout.tsx`
- Modificar: `portfolio-fabrycio/app/page.tsx`

**Passos:**
1. Definir metadata por rota: title, description, canonical, Open Graph, Twitter Card e imagem social criada para a marca pessoal.
2. Adicionar JSON-LD `Person` apenas com dados que Fabrycio deseja tornar públicos.
3. Criar `robots.ts` e `sitemap.ts` apontando para o domínio de produção depois de definido em variável pública `NEXT_PUBLIC_SITE_URL`.
4. Escrever testes E2E para hero, navegação de projetos, links externos, fallback 3D e teclado.
5. Rodar auditoria Lighthouse em produção preview e corrigir problemas concretos de performance, acessibilidade, SEO e boas práticas.

**Verificação:**
```bash
cd portfolio-fabrycio && npm run test:e2e
```
Esperado: cenários críticos passam em Chromium.

---

### Tarefa 7: Preparar e publicar na Vercel

**Objetivo:** Publicar a aplicação com previews confiáveis e domínio pronto para compartilhamento.

**Arquivos:**
- Criar: `portfolio-fabrycio/.env.example`
- Criar: `portfolio-fabrycio/README.md`
- Criar: `portfolio-fabrycio/.github/workflows/ci.yml` (opcional, se o repositório usar GitHub Actions)
- Modificar: `portfolio-fabrycio/next.config.ts` somente conforme exigido por assets remotos reais.

**Passos:**
1. Criar repositório Git, revisar `.gitignore` e confirmar que não há `.env*` com segredos, assets sem licença ou dados pessoais indevidos.
2. Documentar setup local, comandos, variáveis e processo para substituir conteúdo/projetos.
3. Conectar o repositório à Vercel; definir framework Next.js, root directory `portfolio-fabrycio` se o repositório raiz contiver outros arquivos, e configurar `NEXT_PUBLIC_SITE_URL` para previews/produção conforme necessário.
4. Criar preview deployment para validar responsividade, fallback WebGL, metadados e links em URL pública.
5. Conectar domínio personalizado, configurar DNS, definir URL canônica e fazer novo deploy de produção.
6. Adicionar Vercel Analytics e Speed Insights somente após confirmar que consentimento/privacidade desejados estão claros.

**Gates de publicação:**
```bash
cd portfolio-fabrycio && npm run lint && npm run typecheck && npm run test:unit && npm run test:e2e && npm run build
```

- Checar manualmente desktop, mobile e modo de redução de movimento no preview da Vercel.
- Abrir o link compartilhado em janela anônima e confirmar que não exige login.
- Confirmar que OG image, title, favicon, sitemap, links de contato e links dos projetos funcionam.
- Só promover a produção após todos os gates passarem.

---

## Arquivos finais esperados

```text
portfolio-fabrycio/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── game/
│   ├── navigation/
│   ├── scene/
│   ├── sections/
│   ├── seo/
│   └── ui/
├── content/
│   ├── projects.ts
│   ├── schema.ts
│   └── site.ts
├── hooks/
├── lib/
├── public/
│   ├── models/
│   └── og/
├── tests/e2e/
├── .env.example
├── README.md
└── package.json
```

## Riscos e decisões a validar antes de construir

1. **Avatar:** usar uma foto/rosto estilizado, um personagem abstrato inspirado em Fabrycio ou modelagem manual? A opção abstrata/low-poly é mais rápida, mais leve e evita o “uncanny valley”.
2. **Assets 3D:** assets baixados exigem licença comercial e atribuição quando aplicável. Não usar modelos de origem desconhecida.
3. **3D e conversão:** o diferencial precisa permanecer rápido. Se a cena prejudicar a leitura/contato, simplificar a cena antes de mexer no texto ou SEO.
4. **Conteúdo verdadeiro:** sem casos de estudo concretos, o visual vira embalagem. A prioridade é reunir projetos e decisões técnicas com evidência.
5. **Formulário:** no MVP, links diretos de contato evitam captar/armazenar dados. Um formulário deve ser uma decisão posterior, com proteção contra spam e política de privacidade.

## Critérios de aceite

- A página explica quem é Fabrycio, o que ele entrega e como contatá-lo em menos de 30 segundos, sem interagir com o 3D.
- Três a cinco projetos reais são exploráveis e cada um tem problema, contribuição, stack, resultado e link funcional.
- Há um avatar/ambiente com identidade própria e interações ligadas ao conteúdo.
- Não há bloqueio de conteúdo sem WebGL, mouse, motion ou JavaScript avançado.
- Build, lint, typecheck e testes E2E passam localmente e no deploy preview.
- O preview e a produção são servidos pela Vercel com metadata social, URL canônica e domínio configurado.
