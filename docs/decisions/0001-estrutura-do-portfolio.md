# ADR 0001 — Estrutura do portfólio

- **Data:** 21 de setembro de 2026
- **Status:** Aceita

## Contexto

O projeto funcionava, mas misturava dados, efeitos, seções e dialogs em uma única pasta de componentes. Assets públicos também estavam na raiz de `public/`, e o único teste de contrato ficava junto dos scripts de auditoria.

## Decisão

Organizar o código por responsabilidade:

- efeitos em `src/components/effects/`;
- dialogs em `src/components/panels/`;
- seções de página em `src/sections/`;
- dados estáticos em `src/data/`;
- boundaries de carregamento em `src/layouts/`;
- utilitários de acessibilidade em `src/utils/`;
- imagens e ícones públicos em pastas próprias;
- contratos de regressão em `tests/unit/`.

## Consequências

A estrutura fica mais previsível para manutenção sem alterar a composição visual ou o comportamento da aplicação. Os imports usam o alias `@/` configurado no Vite e no `jsconfig.json`. A organização não cria `services/` ou `types/` artificiais: essas pastas só serão adicionadas quando houver responsabilidades reais para elas.
