# Desenvolvimento

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Comandos

```bash
npm ci
npm run dev
```

Gates locais:

```bash
npm test
npm run lint
npm run build
git diff --check
```

Auditoria complementar, com o preview num terminal e a auditoria em outro:

```bash
npm run preview -- --host 127.0.0.1 --port 5182
npm run perf:audit
```

## Testes

Os testes ficam em `tests/unit/` e usam o test runner nativo do Node. `npm test` roda todos os arquivos `tests/unit/*.test.mjs`, e o CI executa o mesmo comando. Eles se dividem em três categorias:

| Categoria | Arquivos | O que verificam |
|---|---|---|
| Lógica pura (Node, sem Vite) | `dialog-navigation`, `project-registry` | Regras de navegação entre dialogs e invariantes do registro de projetos |
| Render estático | `project-dialogs-render`, `project-gallery`, `project-gallery-preview`, `info-dialogs-render`, `demo-dialogs-render` | HTML renderizado dos dialogs: textos, links, alt, atributos de acessibilidade, foco inicial e handlers dos botões |
| Contratos estáticos | `app-dialog-state`, `app-shell-contract`, `project-dialogs-contract`, `project-journey-contract`, `scene-contract` | Regras verificadas no código-fonte e no CSS, onde o render estático não alcança: fiação do `App`, scroll, animação, layout e comportamentos que dependem de estado |

Os testes de render carregam os componentes JSX pelo Vite por meio de `tests/unit/vite-ssr.mjs`. A origem de cada regra e o histórico das mudanças dos testes estão em [`tests/unit/RASTREABILIDADE.md`](../tests/unit/RASTREABILIDADE.md).

A auditoria de performance usa Chrome local e deve ser executada contra a rota real, preferencialmente servida por `vite preview` depois de uma build bem-sucedida. Sem URL, `scripts/perf-audit.mjs` usa `http://127.0.0.1:5182/`, enquanto `npm run preview` sem `--port` sobe na porta 4173, padrão do Vite. Com o preview em outra porta, passe a URL exibida pelo terminal: `node scripts/perf-audit.mjs <url> --duration-ms=5000`.

### Ferramentas de validação local

Criadas na Spec 0001 para validar mudanças contra uma baseline; rodam localmente, fora do CI, e os artefatos que geram ficam fora do repositório ([Spec 0001 §7](specs/0001-registro-projetos-dialogs-galeria.md#7-protocolos-de-validação-compartilhados)).

- `scripts/dialog-golden.mjs`: renderiza os 13 dialogs e compara o HTML com um golden.
- `scripts/dialog-smoke.mjs`: smoke de acessibilidade e navegação dos dialogs no Chrome.
- `scripts/visual-capture.mjs`, `scripts/visual-calibrate.mjs` e `scripts/visual-compare.mjs`: captura, calibração do ruído e comparação visual com tolerância por pixel.
- `scripts/perf-baseline.mjs` e `scripts/build-sizes.mjs`: medianas da auditoria de performance e tamanhos da build.

## Alterações visuais

1. Confirme o seletor e a camada visual antes de editar.
2. Preserve o comportamento desktop e mobile.
3. Verifique a página aberta no navegador, não apenas a build.
4. Rode os gates completos antes de concluir.

## Deploy

O deploy é feito pela integração nativa da Vercel conectada ao repositório. Configure no painel da Vercel a branch de produção, o comando `npm run build` e o diretório de saída `dist`. Não há workflow customizado de deploy nem secrets da Vercel necessários no GitHub Actions.
