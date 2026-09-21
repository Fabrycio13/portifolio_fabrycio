# AGENTS.md

## 1. Projeto

- **Produto:** portfólio imersivo público de Fabrycio Bermudes.
- **Objetivo verificável:** apresentar serviços, projetos de software, experiências digitais e canais de contato em uma aplicação visual, responsiva e orientada a movimento.
- **Arquitetura:** aplicação React/Vite de página única. O repositório atual não declara backend, banco de dados ou autenticação.
- **Stack:** JavaScript/JSX, React `19.2.0`, Vite `8.2.2`, GSAP `3.15.0`, `@gsap/react`, Lenis, Motion, OGL, React Icons e Oxlint `1.79.0`.
- **Gerenciador de pacotes:** npm, com `package-lock.json` versionado.
- **Deploy:** há workflow para Vercel em `.github/workflows/deploy.yml`; os secrets são externos e não devem aparecer no repositório.
- **Documentação relevante:** `README.md`, `docs/architecture.md`, `docs/development.md`, `docs/decisions/` e `docs/performance-baseline.md`.

### Áreas principais

- `src/App.jsx`: shell da aplicação, navegação, composição da página e gerenciamento dos dialogs.
- `src/components/effects/`: `BlurText`, `DecryptedText` e `WarpText`.
- `src/components/panels/`: painéis Sobre, Contato e detalhes dos projetos.
- `src/sections/`: Serviços, Projetos e Footer, incluindo animações de scroll e canvas.
- `src/layouts/`: boundaries de carregamento estrutural, como `DeferredSection`.
- `src/data/`: dados estáticos apresentados pela interface.
- `src/utils/`: utilitários puros, atualmente relacionados à acessibilidade.
- `public/images/`: hero, footer e imagens dos projetos servidos diretamente pelo Vite.
- `public/icons/`: logos e favicons.
- `tests/unit/`: contratos de regressão executados pelo Node test runner.
- `scripts/`: auditorias e ferramentas de manutenção.

### Informações ainda não formalizadas

- O público comercial exato e os requisitos de negócio não estão definidos em um contrato separado; não invente personas, métricas ou regras de negócio a partir da interface.
- Não existem atualmente scripts de TypeScript, testes de integração ou testes E2E versionados.
- Não existe `.husky/` instalado; não crie hooks apenas para preencher a árvore do repositório.

## 2. Comandos

### Instalação e desenvolvimento

```bash
npm ci
npm run dev
npm run preview
```

### Verificação do projeto

```bash
npm test
npm run lint
npm run build
git diff --check
```

### Auditoria de performance

```bash
npm run perf:audit
node scripts/perf-audit.mjs <url-do-preview> --duration-ms=5000
node scripts/perf-audit.mjs <url-do-preview> --projects --duration-ms=5000
node scripts/perf-audit.mjs <url-do-preview> --footer --duration-ms=5000
```

A auditoria exige Chrome local e uma build servida por `vite preview`. O script sem URL usa `http://127.0.0.1:5182/`; se o preview estiver em outra porta, informe a URL explicitamente. Nunca simule um resultado quando Chrome, servidor ou outra dependência da auditoria não estiver disponível.

Use apenas comandos existentes em `package.json` e configurações verificadas. Não apresente uma verificação como aprovada sem executá-la.

## 3. Regras que não podem ser quebradas

- `EXPLORAR MEU TRABALHO` deve continuar apontando para `#servicos`.
- `ENTRAR EM CONTATO` deve abrir o painel Contato sem desmontar a cena principal.
- Sobre, Contato e detalhes dos projetos devem continuar como dialogs preservando o contexto visual.
- Cards de projetos devem continuar operáveis por mouse, toque, `Enter` e `Space`.
- Dialogs devem preservar foco inicial, focus trap, `Escape` e retorno do foco ao gatilho.
- Serviços, Projetos e Footer usam carregamento por proximidade do viewport com fallback estrutural; o fallback não pode colapsar a geometria da página.
- Os efeitos existentes — GSAP, ScrollTrigger, Lenis, OGL, canvas e tipografia animada — são parte do produto. Não os remova ou substitua por placeholders sem solicitação explícita.
- Ao mover ou renomear asset, atualize todas as referências de runtime, documentação e testes relacionados.
- Não crie `src/services/`, `src/types/`, `tests/e2e/` ou outras pastas vazias sem responsabilidade real.
- Preserve os links públicos de contato e redes sociais existentes, salvo solicitação explícita para alterá-los.

## 4. Como trabalhar

- Leia o código relacionado, a documentação da área e este arquivo antes de editar.
- Confira `git status` e preserve alterações existentes do usuário.
- Pesquise imports, caminhos, seletores e usos antes de mover, renomear ou remover arquivos.
- Em tarefas simples e reversíveis, implemente diretamente.
- Em tarefas complexas, defina um plano curto, etapas verificáveis e critérios de conclusão.
- Avance autonomamente em decisões rotineiras dentro do escopo.
- Pergunte somente quando uma dúvida afetar comportamento, segurança, compatibilidade ou uma decisão difícil de reverter.
- Faça a menor mudança que resolva o problema por completo.
- Não inclua refatorações, dependências ou funcionalidades sem relação com a tarefa.
- Use o alias `@/` configurado no Vite e no `jsconfig.json` quando ele tornar os imports mais claros.
- Não faça commit, push, criação de branch ou publicação sem autorização explícita do usuário.

## 5. Engenharia

- Prefira nomes claros, responsabilidades coesas e soluções simples.
- Reutilize componentes, hooks, dados e mecanismos existentes antes de criar novos.
- Mantenha dados estáticos em `src/data/`; eles não devem acessar DOM, navegador ou efeitos de animação.
- Mantenha utilitários de `src/utils/` independentes de componentes visuais.
- Não duplique dados estáticos dentro de `src/sections/` quando eles já pertencem a `src/data/`.
- Não crie abstrações, camadas, interfaces ou dependências para necessidades hipotéticas.
- Comente motivos e restrições pouco óbvias, não o funcionamento autoexplicativo.
- Preserve contratos públicos e sinalize mudanças incompatíveis.
- Atualize README e documentação quando alterar arquitetura, caminhos de assets, comandos ou comportamento documentado.
- Preserve imports diretos dos dialogs pequenos: lazy loading nesses painéis pode reintroduzir flash visual na primeira abertura.
- Preserve `DeferredSection` e seus fallbacks estruturais: mudanças podem causar layout shift, alterar âncoras ou quebrar o scroll sticky.

## 6. Correção de bugs

- Reproduza o problema na rota real quando viável.
- Confirme se o comportamento é defeito ou decisão intencional antes de editar.
- Investigue a causa antes de alterar CSS, imports, handlers ou animações.
- Para bugs visuais, identifique a camada correta: hero, seção sticky, painel, canvas ou footer.
- Para problemas mobile, verifique `:active`, `:focus`, `:focus-visible`, tap highlight nativo e viewport real antes de mudar o layout.
- Teste hipóteses com evidências; não aplique mudanças aleatórias.
- Corrija a causa raiz dentro do escopo.
- Verifique caminhos relacionados que possam apresentar a mesma falha.
- Não silencie erros, remova proteções ou enfraqueça testes para concluir a tarefa.
- Se uma solução temporária for necessária, registre sua limitação na entrega e na documentação adequada quando ela for durável.

## 7. Testes e validação

- Teste comportamentos observáveis e regras relevantes, não apenas detalhes internos.
- Use a infraestrutura existente em `tests/unit/` e `scripts/perf-audit.mjs`.
- Para bugs de interação, adicione ou ajuste um teste de regressão quando viável.
- Não altere testes apenas para esconder uma regressão introduzida pela mudança.
- Não exija integração ou E2E enquanto essas suítes não existirem; sinalize a lacuna se ela for relevante para o risco.

### Contrato atual

`tests/unit/portfolio-contract.test.mjs` cobre:

- teclado dos cards de projetos;
- foco inicial, `Tab`, `Escape` e retorno de foco dos dialogs;
- copy pública e cinco canais de contato;
- copy do projeto Gestão Condominial com IA;
- ausência do fluxo legado de vídeo;
- tap highlight transparente nos elementos interativos.

### Validação de navegador

- Rode `npm run build` antes de testar a experiência na prévia de produção.
- Use `vite preview` e a URL realmente informada pelo terminal.
- Para mudanças em carregamento, scroll, canvas ou performance, valide Hero, Projetos e Footer separadamente.
- Confirme título, seções, imagens, canvases, placeholders, cards e erros de runtime.
- Uma inspeção manual no navegador complementa, mas não substitui, um teste de regressão versionado quando o comportamento for regressível.

### Proporcionalidade

- Copy, documentação e mudanças simples de caminho normalmente exigem testes, lint, build e `git diff --check`.
- Animações, lazy loading, assets, scroll e acessibilidade exigem smoke na build de produção e, quando pertinente, `perf:audit`.
- Não invente `typecheck`: não há script `typecheck` ou `tsc` configurado.

## 8. Segurança e limites

- Não exponha secrets, credenciais, tokens, chaves de API ou dados pessoais em código, logs, testes, documentação, issues ou commits.
- Se um valor sensível aparecer, substitua por `[REDACTED]` e não o replique.
- `.env` e `.env.*` são ignorados pelo Git; somente `.env.example` pode ser versionado.
- `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` pertencem exclusivamente à configuração protegida do CI.
- Não use dados reais de clientes ou projetos confidenciais em testes, screenshots ou documentação.
- Este repositório é um frontend estático; não adicione banco, autenticação ou integração externa sem escopo explícito e documentação correspondente.
- Não execute testes que alterem produção.
- Não descarte trabalho existente nem execute operações destrutivas sem autorização.
- Deploy, publicação, merge e alterações em produção exigem autorização explícita, salvo quando já autorizados na tarefa atual.

## 9. Checkpoints

- Não crie `CHECKPOINT.md` para pequenas alterações concluídas na mesma sessão.
- Em tarefas longas ou que atravessem sessões, crie checkpoint somente quando necessário.
- Um checkpoint deve registrar objetivo, critérios de conclusão, etapas concluídas, arquivos relevantes, decisões, validações, bloqueios e próximo passo.
- Ao retomar, leia o checkpoint e confira o código e o Git antes de continuar.
- Checkpoint registra andamento; Git preserva versões do código.
- Checkpoint não autoriza commit, push ou publicação.

## 10. Memória de decisões

- Use `docs/decisions/` para decisões arquiteturais ou de organização que devam sobreviver à tarefa.
- Reutilize documentação existente antes de criar um novo registro.
- Registre somente decisões confirmadas, motivos, armadilhas recorrentes e partes do código afetadas.
- Não copie conversas, não duplique documentação e não armazene secrets.
- Corrija documentação obsoleta quando ela deixar de corresponder ao código.
- Nesta tarefa, não crie arquivos auxiliares ou registros de decisão porque a mudança está limitada ao `AGENTS.md`.

## 11. Entrega

- Responda em português, com clareza e objetividade.
- Informe o que mudou, por quê e quais arquivos foram afetados.
- Informe os comandos executados e seus resultados reais.
- Aponte limitações, validações não executadas e pendências.
- Diferencie falhas introduzidas de falhas preexistentes.
- Não declare a tarefa concluída se faltar requisito essencial.
- Não declare deploy, commit, push ou merge sem verificar o efeito correspondente.
