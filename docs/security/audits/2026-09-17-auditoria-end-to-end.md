# Auditoria End-to-End do Portfólio Fabrycio Bermudes

> **Data:** 2026-09-17  
> **Escopo:** Auditoria compatível com o projeto atual: frontend React/Vite, acessibilidade, superfície client-side, dependências, assets, lazy loading, documentação, copy, build e smoke de produção.  
> **Origem:** Pipeline adaptado da skill `audit-project`; as fases específicas de IA RH/Supabase não se aplicam a este repositório.  
> **Snapshot inicial:** branch `feat/adaptive-video-performance`, HEAD `01ac424 docs: improve project README`, alterações pré-existentes em `src/App.jsx` e `src/App.css`.  
> **Status:** Aprovado com ressalvas

## Resumo

| Severidade | Quantidade | Resultado |
|---|---:|---|
| 🔴 Alta | 0 | Nenhum risco crítico confirmado |
| 🟡 Média | 3 | Acessibilidade de cards/modais, documentação de performance desatualizada, sonda de performance fora do contrato atual |
| 🟢 Baixa | 2 | CSS legado e semântica incompleta em componente reutilizável |
| ⚪ Informativo | 3 | Sem testes automatizados declarados, `node_modules` com extraneous local e limitações de smoke |

## Validação mecânica

- ✅ `npm run lint` — sucesso, sem saída de erro.
- ✅ `npm run build` — sucesso; 515 módulos transformados.
- ✅ `git diff --check` — sucesso; apenas aviso de conversão LF/CRLF do Git em `src/App.jsx`.
- ✅ `npm audit --omit=dev --audit-level=high` — `found 0 vulnerabilities`.
- ⚪ `npm test` — não executado: `package.json` não declara script `test`.
- ✅ Varredura de padrões de secrets — 0 matches para formatos de API key/private key testados; nenhum arquivo `.env*`, secret, credential ou token está versionado.
- ✅ Busca de superfície perigosa — nenhum `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `fetch` de entrada do usuário, `axios`, `VITE_*_KEY` ou service key no frontend. O único `fetch` está no script local de auditoria para consultar o endpoint informado.
- ✅ `npm ls --depth=0` — build funcional, mas com pacotes `extraneous` presentes somente no `node_modules` local; eles não aparecem em `package.json` nem no `package-lock.json`.

## Evidência de runtime

Preview de produção: `http://127.0.0.1:5187/`

- ✅ Rota principal respondeu `200 text/html`.
- ✅ `/novo%20portifolio.webp` respondeu `200 image/webp`, 85.004 bytes.
- ✅ `/footer.webp` respondeu `200 image/webp`, 187.362 bytes.
- ✅ Título real: `Fabrycio Bermudes — Software Engineer`.
- ✅ Cenário inicial medido com Chrome headless: `59,51 FPS`, 0 long tasks, 0 runtime issues, 2 canvases e `scrollHeight=5775px`.
- ✅ Cenário de projetos medido: `59,76 FPS`, 0 long tasks e 0 runtime issues.
- ✅ Cenário de footer medido: `59,99 FPS`, 0 long tasks e 0 runtime issues.
- ⚠️ A sonda atual não conseguiu levar o `scrollY` até o Footer porque o Lenis intercepta o `window.scrollTo`: o cenário `projects` terminou em `scrollY=1610` e o cenário `footer` em `scrollY=65`. Portanto, os números de FPS são válidos para a página carregada, mas a montagem final do Footer não foi confirmada por essa sonda nesta rodada.
- ⚠️ O driver de browser interativo utilizado para o smoke de cliques expirou por timeout; isso não gerou exceção da aplicação, mas impede declarar confirmação adicional por clique real nesta rodada. A verificação anterior do fluxo lazy permanece registrada no histórico da sessão, não como evidência nova deste relatório.

## 🛡️ Segurança client-side

### Resultado

Nenhum achado 🔴 confirmado.

O projeto é um frontend estático sem backend, Edge Functions, migrations, autenticação ou armazenamento próprio neste repositório. Não há dados de usuário processados pelo app nem input textual renderizado como HTML. Os links externos são constantes e usam `target="_blank"` com `rel="noreferrer"` nos painéis e no footer. O número de WhatsApp e o endereço de e-mail são informações de contato públicas do portfólio, não secrets.

### Investigado e descartado

- `dangerouslySetInnerHTML`, `innerHTML`, `eval` e `new Function`: não encontrados.
- Chaves `sk-*`, `AIza*`, `ghp_*`/familiares e blocos de private key: não encontrados.
- `fetch`/axios no código de produção: não encontrados.
- Dependências `three` e `@react-three/fiber`: não declaradas no manifesto nem no lockfile; os itens reportados por `npm ls` são resíduos locais do `node_modules`.
- `.env*`, tokens, credenciais e arquivos de chave: nenhum arquivo sensível versionado.

## ⚠️ Acessibilidade e qualidade de interação

### 🟡 1. Cards de projetos não são operáveis pelo teclado

| Arquivo | Linha | Severidade | Descrição |
|---|---:|---|---|
| `src/components/StickyProjects.jsx` | 100–105 | 🟡 | O card é um `<article>` com `onClick`, mas não possui `role="button"`, `tabIndex` nem tratamento de `Enter`/`Space`. Usuários que navegam por teclado não conseguem abrir os detalhes dos projetos. |

**Risco prático:** o conteúdo existe e abre para mouse/toque, mas fica inacessível para teclado e pode falhar em auditorias WCAG de operação por teclado.

**Correção recomendada:** transformar o alvo em botão semântico ou adicionar semântica e handlers equivalentes de teclado, preservando o visual atual.

### 🟡 2. Dialogs não gerenciam foco nem tecla Escape

| Arquivo | Linha | Severidade | Descrição |
|---|---:|---|---|
| `src/App.jsx` | 145–168, 323–350 | 🟡 | O estado abre dialogs e bloqueia o scroll, mas não move o foco para o conteúdo/fechamento, não devolve o foco ao gatilho e não trata `Escape`. |
| `src/components/InfoPanels.jsx` | 55–66, 106–117 | 🟡 | Sobre e Contato declaram `role="dialog"`/`aria-modal`, porém não há foco inicial ou contenção de Tab. |
| `src/components/ProjectDetailsPanel.jsx` | 106–121 | 🟡 | O mesmo gap existe nos detalhes dos projetos. |

**Risco prático:** um usuário de teclado ou leitor de tela pode continuar posicionado no elemento atrás do overlay, sair do dialog com Tab ou não conseguir fechá-lo com Escape. O atributo ARIA sozinho não implementa o comportamento de dialog.

**Correção recomendada:** usar refs para foco inicial e retorno, handler global de Escape enquanto o painel estiver aberto e um focus trap pequeno e testado.

### 🟢 3. Lista de detalhes usa índice como key

| Arquivo | Linha | Severidade | Descrição |
|---|---:|---|---|
| `src/components/ProjectDetailsPanel.jsx` | 128–145 | 🟢 | `features` e `technologies` usam `key={index}`. Os dados atuais são estáticos, então não há falha observada; a key por índice pode causar identidade incorreta se os arrays forem reordenados ou filtrados futuramente. |

## 🧹 Clean Engineering e manutenção

### 🟡 4. Baseline de performance descreve uma arquitetura removida

| Arquivo | Linha | Severidade | Descrição |
|---|---:|---|---|
| `docs/performance-baseline.md` | 7, 20, 63–83 | 🟡 | O documento afirma que `public/video.mp4`, `video-1080.mp4`, `ShaderVideo.jsx` e `qualityProfile.js` continuam ativos, mas esses arquivos não existem mais nem são referenciados pelo código atual. |

**Risco prático:** uma decisão de performance futura pode ser tomada com base em medições e componentes que não pertencem mais à aplicação. Também pode levar uma auditoria posterior a procurar uma pipeline de vídeo inexistente.

**Correção recomendada:** reescrever a baseline para a arquitetura atual de imagem WebP + OGL/WarpText + canvas do footer, marcando a baseline de vídeo como histórica.

### 🟡 5. `perf-audit.mjs` não audita a superfície atual

| Arquivo | Linha | Severidade | Descrição |
|---|---:|---|---|
| `scripts/perf-audit.mjs` | 53–115, 203–213, 250 | 🟡 | A sonda procura vídeos MP4, `.shader-video` e bloqueio de URLs de vídeo. A aplicação atual usa imagens, OGL e canvas, portanto a ferramenta não mede corretamente a mídia real nem confirma a montagem do Footer quando o Lenis intercepta o scroll. |

**Risco prático:** o script pode retornar FPS e `0` runtime issues mesmo sem validar a seção que deveria ser auditada; isso cria falsa confiança sobre lazy loading, canvas e offset do Footer.

**Correção recomendada:** substituir a coleta de `<video>` por metadados das imagens/canvas atuais, detectar `.wave-footer`, `.projects` e número de canvases, e usar uma estratégia de scroll compatível com Lenis antes de publicar a próxima baseline.

### 🟢 6. CSS legado de ShaderVideo permanece no bundle inicial

| Arquivo | Linha | Severidade | Descrição |
|---|---:|---|---|
| `src/App.css` | 72–113 | 🟢 | As regras `.shader-video`, `.shader-video__canvas`, `.shader-video__source`, `.shader-video--static` e `.shader-video__loading` não têm consumidor no código atual. |

**Risco prático:** baixo; aumenta ruído e pode confundir alterações futuras, mas não representa uma vulnerabilidade nem impacto mensurado relevante.

**Correção recomendada:** remover o bloco somente após confirmar novamente a ausência de consumidores e atualizar qualquer documentação que o cite.

### ⚪ 7. Não há script de testes automatizados

`package.json:6–11` declara `dev`, `build`, `lint`, `preview` e `perf:audit`, mas não `test`. A aplicação tem smoke/performance scripts, porém não há regressão automatizada para teclado, dialogs, lazy chunks ou responsividade.

**Risco prático:** mudanças no comportamento de Lenis, GSAP ou `React.lazy` podem quebrar interação sem falhar no build.

## ✍️ Copy e estrutura

- ✅ `html lang="pt-BR"` está definido em `index.html:2`.
- ✅ Título da página está presente em `index.html:9`.
- ✅ Imagens de conteúdo têm `alt`; imagens decorativas usam `alt=""` ou `aria-hidden`.
- ⚪ Há copy com possível revisão editorial futura em `InfoPanels.jsx:71–84` (`Muito prazer !`, `hardness`, `loop enginner`), mas isso não é risco técnico nem foi classificado como bloqueador.
- ✅ Não foram encontrados textos culpando o usuário, `!!!` ou mensagens genéricas de erro na superfície auditada.

## 📦 Performance e bundle

Build atual:

```text
Bundle principal: 405,36 KB
Gzip:             127,48 KB
Chunk ScrollTrigger: 113,62 KB / 44,70 KB gzip
```

A divisão por chunks está ativa para Serviços, Projetos, Footer, painéis e detalhes de projeto. O primeiro viewport medido carregou 2 canvases de `WarpText`; o Footer não estava montado no estado inicial. Os testes de FPS executados no preview ficaram próximos de 60 FPS, com 0 long tasks e 0 runtime issues nos estados alcançados.

## 🚦 Ações recomendadas

### P1 — acessibilidade funcional

1. Tornar os cards de Projetos acionáveis por teclado.
2. Implementar foco inicial, retorno de foco, Escape e contenção de Tab nos três tipos de dialog.
3. Adicionar smoke automatizado para essas interações.

**Critério de aceite:** todos os cards abrem com mouse, Enter e Space; todos os dialogs recebem foco, fecham por botão/backdrop/Escape e devolvem o foco ao gatilho; nenhum foco escapa do overlay enquanto aberto.

### P1 — confiabilidade da auditoria

1. Atualizar `docs/performance-baseline.md` para a arquitetura atual.
2. Reescrever `scripts/perf-audit.mjs` para medir imagens, canvas, lazy sections e scroll Lenis sem declarar sucesso antes de alcançar o alvo.

**Critério de aceite:** a sonda registra estado inicial, Projetos e Footer com seletores existentes; confirma mudança de placeholder para componente real, document height, canvas dimensions, FPS, long tasks e runtime issues.

### P2 — limpeza e manutenção

1. Remover o CSS `.shader-video` após nova busca de referências.
2. Trocar keys por identificadores semânticos nos arrays de detalhes.
3. Rodar `npm prune`/reinstalação limpa fora de uma alteração funcional para eliminar os pacotes extraneous do `node_modules` local.
4. Adicionar um script de smoke mínimo, sem substituir o teste visual real.

## Remediação posterior

Os cinco pontos pendentes desta auditoria foram corrigidos:

- cards de Projetos agora têm `role="button"`, foco por teclado e ativação por Enter/Space;
- dialogs têm foco inicial, Escape, focus trap e retorno ao elemento que abriu o painel;
- `docs/performance-baseline.md` e `scripts/perf-audit.mjs` foram atualizados para a arquitetura atual, sem vídeos ou `ShaderVideo`;
- seletores CSS legados de `ShaderVideo` foram removidos após confirmação de ausência de consumidores;
- `npm test` foi adicionado com testes de contrato para acessibilidade e prevenção de regressões do legado.

Verificações posteriores:

- `npm test`: 4/4 testes aprovados;
- `npm run lint`: aprovado;
- `npm run build`: aprovado;
- `node --check scripts/perf-audit.mjs`: aprovado;
- smoke CDP real: card abriu com Enter, recebeu foco inicial no botão Fechar, fechou com Escape e devolveu foco; o mesmo fluxo foi validado para o painel Sobre;
- performance após as correções: Hero `59,54 FPS`, Projetos `59,99 FPS`, Footer `60,46 FPS`, zero long tasks e zero exceções na amostra local.

## Conclusão

O projeto permanece sem risco crítico confirmado. Os pontos pendentes registrados nesta auditoria foram remediados e passaram pelos gates de teste, lint, build, smoke CDP e performance descritos acima. A próxima auditoria deve tratar esses gates como regressão contínua, não como pendências abertas.
