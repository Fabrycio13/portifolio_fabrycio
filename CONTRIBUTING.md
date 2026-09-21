# Contribuindo

## Fluxo local

1. Instale as dependências com `npm ci`.
2. Execute `npm run dev` para abrir o portfólio localmente.
3. Faça uma alteração pequena e mantenha o escopo focado.
4. Rode os gates antes de abrir uma revisão:

```bash
npm test
npm run lint
npm run build
git diff --check
```

## Convenções

- Use componentes React com responsabilidade clara.
- Coloque copy e dados estáticos em `src/data/`.
- Coloque efeitos reutilizáveis em `src/components/effects/`.
- Coloque seções de página em `src/sections/`.
- Atualize testes de contrato quando mover um arquivo ou alterar uma interação pública.
- Não inclua segredos, tokens ou credenciais em arquivos, issues ou commits.

## Pull requests

Descreva o que mudou, como foi validado e qualquer limitação restante. Alterações visuais devem informar a viewport testada e incluir evidência visual quando disponível.
