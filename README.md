# Vanderlei Costa · Protótipo V4

Versão para apresentação: mesma direção visual da V3, com correções de formulário e refinamentos de UX. React + TypeScript + Vite; dados fictícios persistidos apenas no navegador.

## Executar

Com Node.js 22 e pnpm 10:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

## Versões e publicação

A única branch é `main`. O histórico contém um commit para cada versão: V1, V2, V3 e V4. Para consultar uma versão anterior, use o respectivo commit em modo detached (`git switch --detach <commit>`).

Cada push na `main` executa a build e publica `dist` no GitHub Pages:
https://joaovitorsl.github.io/vanderlei-costa/

A demonstração usa a data fixa de 08/10/2026. Não há backend, autenticação real, cobranças ou integrações. A V4 mantém o armazenamento local da V3.
