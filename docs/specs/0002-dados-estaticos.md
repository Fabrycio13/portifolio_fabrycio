# Spec 0002 — Centralização e organização dos dados estáticos

- **Data:** 14 de novembro de 2026
- **Status:** Aprovada — não iniciada
- **Branch:** `refactor/dados-estaticos`, a partir de `origin/main` atualizada **contendo o merge da Spec 0001** ([Fluxo Git](README.md#fluxo-git-todas-as-specs))
- **Depende de:** [0001](0001-registro-projetos-dialogs-galeria.md)
- **Não bloqueia:** [0003](0003-performance-baseada-em-evidencias.md)
- **Invariantes:** os do [índice](README.md#invariantes-valem-para-todas-as-specs) valem integralmente

## 1. Objetivo

Levar para `src/data/` os dados estáticos que ainda vivem dentro de componentes e eliminar a duplicação dos links de contato, conforme o `AGENTS.md` §5 ("Mantenha dados estáticos em `src/data/`"). Nenhuma alteração de conteúdo, ordem, comportamento ou identidade visual.

## 2. Escopo

- Os 5 links de contato centralizados num módulo de dados, preservando a ordem de cada consumidor (Contato e Footer). Hoje eles aparecem duplicados em `InfoPanels.jsx` (`contactLinks`) e `WaveFooter.jsx` (`socialIcons`), em ordens diferentes.
- `menuItems`, `aboutToolkit`, `footerServices` e os dados internos da demo Nexus (`flowNodes`, `executionEvents`, `traceSteps`, `navigationItems`, `sectionPages`) movidos para `src/data/`.
- A lógica e o comportamento da demo Nexus permanecem intactos. Os dados dela continuam independentes do registro de projetos (decisão D1.11 da Spec 0001).
- Os links públicos de contato e redes sociais são preservados (`AGENTS.md` §3).

**Fora do escopo:** limpeza e redistribuição do CSS, que é etapa adiada e independente ([índice](README.md#adiados-fora-destas-specs)), e qualquer alteração de texto ou de ordem.

## 3. Validação

Usa os protocolos da [Spec 0001 §7](0001-registro-projetos-dialogs-galeria.md#7-protocolos-de-validação-compartilhados):

- render estático (camada 2) dos dialogs afetados (Sobre, Contato, demo Nexus);
- diff visual da matriz completa (0001 §7.1), com atenção especial ao Footer;
- smoke de acessibilidade e interação (0001 §7.4) nos dialogs afetados e na navegação lateral da demo Nexus;
- roteiro manual com movimento;
- performance pelo protocolo da 0001 §7.2.

## 4. Critérios de aceite

1. Os 5 links de contato existem numa única fonte de dados, e cada consumidor mantém exatamente a ordem atual.
2. Textos, URLs, ordem, rótulos e atributos de acessibilidade idênticos aos da baseline.
3. Diff visual dentro da tolerância calibrada; roteiro manual conferido.
4. Demo Nexus com comportamento idêntico (smoke 0001 §7.4 B).
5. Nenhuma regra de teste sem cobertura; performance sem regressão (0001 §7.2).
