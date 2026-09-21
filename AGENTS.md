# AGENTS.md

## Contexto

Este repositório contém o portfólio imersivo de Fabrycio Bermudes, construído com React, Vite, GSAP, Lenis, OGL e React Icons.

## Organização

- `src/App.jsx`: shell da aplicação, navegação e composição da página.
- `src/components/effects/`: efeitos visuais reutilizáveis de texto e canvas.
- `src/components/panels/`: painéis de Sobre, Contato e detalhes de projetos.
- `src/sections/`: seções carregadas pela página e animações de scroll.
- `src/layouts/`: boundaries de layout e carregamento estrutural.
- `src/data/`: copy e dados estáticos apresentados pela interface.
- `src/utils/`: utilitários puros sem dependência de renderização.
- `public/images/`: imagens servidas diretamente pelo Vite.
- `public/icons/`: favicon e marcas usadas no shell.
- `tests/unit/`: contratos de regressão executados pelo Node test runner.
- `scripts/`: auditorias e ferramentas de manutenção.

## Regras de mudança

1. Preserve GSAP, ScrollTrigger, Lenis, OGL, fallbacks estruturais e o comportamento responsivo existentes.
2. Antes de mover ou remover um arquivo, pesquise referências estáticas e dinâmicas.
3. Não substitua efeitos visuais por placeholders sem uma solicitação explícita.
4. Mantenha foco de teclado, `Escape`, focus trap e retorno de foco nos dialogs.
5. Não introduza credenciais, tokens, chaves ou valores sensíveis no código, documentação, commits ou testes.
6. Faça mudanças pequenas e verificáveis; evite refatorações não relacionadas.

## Gates obrigatórios

```bash
npm test
npm run lint
npm run build
git diff --check
```

A auditoria de performance é complementar:

```bash
npm run perf:audit
```
