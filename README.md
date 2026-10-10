# Vanderlei Costa · Protótipo V5.1

Versão para apresentação: visual e navegação aprovados da V5.1, com agenda coletiva e provas independentes das prescrições individuais. React + TypeScript + Vite; dados fictícios persistidos apenas no navegador.

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

A demonstração usa a data fixa de 08/10/2026. Não há backend, autenticação real, cobranças ou integrações. A versão atual mantém os alunos, prescrições e histórico de cópias locais. Na primeira abertura, migra as antigas provas dos alunos para eventos com participantes e remove a antiga associação de Local aos treinos. Agenda e provas também são salvas somente no navegador.

## Restaurar a demonstração

Abra `?resetDemo=1` na URL da aplicação. Apenas as chaves locais de alunos, treinos, histórico de cópias, agenda e provas desta demo são removidas. O seed é restaurado e o parâmetro desaparece da URL; outros parâmetros e a âncora são preservados. Não há botão de reset na interface do cliente.

## Testes

`node --experimental-strip-types --test tests/*.test.ts` (Node.js 22.6+).

Cobrem cópia aditiva/imutável, identificação de repetição por origem e aluno/semana, ações individuais, limpeza de campos por tipo, preservação de modelos e reset seletivo.

## Correção de modelagem: agenda e provas

- Prescrição: Local removido dos modelos, criação, edição, preview, perfil e cards. A estrutura individual e as orientações continuam preservadas.
- Mais → Agenda coletiva: semana anterior/seguinte, criar, editar e excluir registros. Encontro tem data, horário, local, título opcional e referência opcional. Domingo livre é um registro manual sem horário/local; não coexiste com encontro na mesma data e não gera recorrência.
- Home: mostra os horários e locais dos encontros de hoje na seção Hoje, abrindo a agenda ao tocar. Sem encontro no dia, essa linha desaparece.
- Mais → Próximas provas: eventos independentes com nome, data, distância, local opcional e IDs de alunos participantes. Criar, editar, excluir e alterar participantes. Provas passadas permanecem acessíveis para edição na seção Provas anteriores.
- Aluno: campos de prova removidos da etapa Corrida e dos dados cadastrais. O perfil deriva a próxima prova futura pela data e pelos vínculos; não armazena outra cópia.
- Mocks: Meia da Primavera (08/11/2026, 21 km) mantém Rafael, Lucas, Pedro e André. Circuito Parque Verde (25/10/2026, 10 km) mantém Marina, Beatriz, Camila, Juliana, Fernanda e Letícia. A agenda contém os cinco encontros de 06–11/10 e um exemplo manual de domingo livre em 18/10.
- Migração: nomes, notas e prescrições personalizados são mantidos. O exemplo exato de Treino livre introduzido no seed anterior volta a ser Rodagem longa; versões editadas pelo usuário são preservadas. Não são criados vínculos entre treinos e encontros a partir dos antigos locais.

### Validação desta rodada

19 testes de dados/operações aprovados. Build TypeScript/Vite aprovada. `tests/collective.browser.mjs` executado pelas APIs CUA em 390 × 844 e 1440 × 1000: CRUD de agenda/provas, validação obrigatória, domingo livre/conflitos, participantes, perfil derivado, Home condicional, cadastro sem prova, treino sem local e persistência. Sem erros de console ou overflow horizontal nas telas verificadas. Também passaram os roteiros `tests/business-alignment.browser.mjs` (360, 390, 430, 1280, 1440 e 1920 px) e `tests/v5-patch.browser.mjs`: planos, cadastro, prescrições, modelos, nomes automáticos e personalizados, duplicação e avisos.

### Validação com o cliente

A eventual relação entre prescrição individual e encontro coletivo permanece em aberto e não foi implementada. A data de 18/10 para o domingo livre é apenas ilustrativa, a ser confirmada para a apresentação. A agenda exibida é manual; não há regra de um domingo livre por mês.
