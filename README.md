# Portfólio imersivo — Fabrycio

Experiência autoral 2.5D para apresentar projetos, habilidades, trajetória e contato em um pequeno universo digital explorável.

## Estado atual

Protótipo funcional em evolução. A versão publicada contém textos e links ainda marcados para substituição por informações profissionais reais.

## Recursos

- cenário panorâmico autoral;
- navegação por arraste e rolagem;
- fumaça/neblina em camadas;
- luzes e marcadores pulsantes;
- painéis acessíveis por clique e teclado;
- páginas editoriais de Projetos, Estúdio e Contato;
- controle para reduzir movimentos;
- adaptação para dispositivos móveis;
- fallback compatível com `prefers-reduced-motion`.

## Executar localmente

O projeto não exige build nem dependências.

```bash
python -m http.server 8765
```

Depois acesse `http://localhost:8765`.

## Publicar na Vercel

1. Importe este repositório na Vercel.
2. Selecione **Other** como framework.
3. Não informe comando de build.
4. Use `.` como diretório de saída.
5. Publique.

## Estrutura

- `index.html` — experiência principal;
- `assets/` — panorama e artes autorais;
- `prototypes/` — evolução visual preservada;
- `docs/` — plano, especificação e auditoria da referência.

## Observação sobre a referência

A experiência foi inspirada apenas em padrões gerais de navegação imersiva. Código, textos, identidade, imagens, modelos e demais assets de terceiros não foram reutilizados.
