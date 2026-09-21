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

Auditoria complementar:

```bash
npm run perf:audit
node scripts/perf-audit.mjs http://127.0.0.1:4173/ --duration-ms=5000
```

## Testes

Os contratos de regressão ficam em `tests/unit/` e usam o test runner nativo do Node. Eles verificam as interações de teclado, dialogs, copy pública, links sociais e a ausência do fluxo legado de vídeo.

A auditoria de performance usa Chrome local e deve ser executada contra a rota real, preferencialmente servida por `vite preview` depois de uma build bem-sucedida.

## Alterações visuais

1. Confirme o seletor e a camada visual antes de editar.
2. Preserve o comportamento desktop e mobile.
3. Verifique a página aberta no navegador, não apenas a build.
4. Rode os gates completos antes de concluir.

## Deploy

O deploy recomendado é via integração da Vercel ou pelo workflow de deploy configurado em `.github/workflows/deploy.yml`. O workflow exige os secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`; nenhum deles deve ser salvo no repositório.
