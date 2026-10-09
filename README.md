# Vanderlei Costa · Protótipo V5

Versão para apresentação: visual aprovado da V4, com proteção contra cópias repetidas, ajustes de formulário e QA. React + TypeScript + Vite; dados fictícios persistidos apenas no navegador.

## Executar

Com Node.js 22 e pnpm 10:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

## Versões e publicação

A única branch é `main`. O histórico contém um commit para cada versão: V1, V2, V3, V4 e V5. Para consultar uma versão anterior, use o respectivo commit em modo detached (`git switch --detach <commit>`).

Cada push na `main` executa a build e publica `dist` no GitHub Pages:
https://joaovitorsl.github.io/vanderlei-costa/

A demonstração usa a data fixa de 08/10/2026. Não há backend, autenticação real, cobranças ou integrações. A V5 mantém os alunos e treinos locais da V3/V4 e adiciona o histórico de cópias por aluno/semana.

## Restaurar a demonstração

Abra `?resetDemo=1` na URL da aplicação. Apenas as chaves locais de alunos, treinos e histórico de cópias desta demo são removidas. O seed é restaurado e o parâmetro desaparece da URL; outros parâmetros e a âncora são preservados. Não há botão de reset na interface do cliente.

## Testes

`node --experimental-strip-types --test tests/v5.test.ts` (Node.js 22.6+).

Cobrem cópia aditiva/imutável, identificação de repetição por origem e aluno/semana, ações individuais, limpeza de campos por tipo, preservação de modelos e reset seletivo.
