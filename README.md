# Vanderlei Costa · Protótipo V2

Uma exploração mais simples da V1: mobile-first, com a mesma identidade escura e verde. Frontend React + TypeScript + Vite, sem backend ou integrações.

## Executar

Com Node.js 20.19+ ou 22.12+ e npm:

```sh
npm install
npm run dev
```

Abra o endereço exibido pelo Vite. Para validar:

```sh
npm run build
```

## V1 preservada

Antes da primeira alteração desta rodada, o projeto foi versionado em Git:

- Commit da V1: `3c4505c` — `prototype-v1-complete-dashboard`
- Tag: `prototype-v1-complete-dashboard`
- Referência estável da V1: tag `prototype-v1-complete-dashboard`
- Branch atual da V2: `v2` (a exploração começou como `prototype-v2-simple-mobile`)

A pasta `outputs` também contém `vanderlei-costa-v1-preservada.zip`, com o código e a compilação da V1. Para recuperar o código da V1 pelo Git, use a tag `prototype-v1-complete-dashboard`; a branch `main` já recebeu alterações posteriores. O ZIP da V2 não inclui o diretório `.git`; o histórico fica no projeto local.

Os dados da V1 no navegador (`vc-students-v1` e `vc-schedule-v1`) não foram alterados. A V2 usa chaves próprias: `vc-students-v2` e `vc-schedule-v2`. Dados de versões diferentes não são migrados nem misturados.

## Decisões de simplificação

- **Início:** uma ação principal para planejar, uma contagem discreta de alunos e quatro linhas em Hoje / Próximos. Sem grandes KPIs, ilustração de prova ou slogans.
- **Alunos:** lista com busca e vencimento; filtros aparecem somente ao tocar em Filtros. Não há tabelas.
- **Perfil:** prescrição, próximo treino, próxima prova, pace e restrição relevante. Cadastro, avaliações e plano ficam em telas de detalhe, acessadas por linhas.
- **Treinos:** escolher aluno → semana → terça, quinta e domingo. Lista vertical no celular; três colunas no desktop largo.
- **Modelos:** aparecem em Adicionar treino → Usar modelo. Deixaram de ser um destino principal.
- **Ações secundárias:** duplicar semana e duplicar sessão ficam nos menus de três pontos.
- **Editor:** campos mudam conforme o tipo; prévia simples, sem cálculos extras. Tiros usam tempo alvo por repetição.
- **Cadastro:** mesmos campos, três etapas. Uma coluna no celular, duas quando há espaço.
- **Plano:** modalidade, valor mensal, vencimento, status do aluno e edição. Sem histórico de pagamentos.
- **Mais:** vencimentos, aniversários e provas já existentes no escopo, além da saída do login fictício.

## Dados de demonstração

- 12 alunos fictícios; 11 ativos e 1 pausado.
- Mensalidades de R$ 60 ou R$ 80; modalidades Corrida, Musculação e Outros.
- Data fixa: **08/10/2026, quinta-feira**. A Home mostra 4 atletas com treino, 1 aniversário e 3 vencimentos entre 8 e 15 de outubro.
- Semanas de 28/09–04/10, 05–11/10 e 12–18/10/2026. Os índices da agenda correspondem aos dias reais: terça, quinta e domingo.
- A semana seguinte contém dias vazios, para demonstrar a criação de treinos.
- Avaliações ilustrativas de 1600 m, 2400 m e Cooper; a interface também informa a possibilidade de outro teste. Não há teste oficial assumido ou fórmula de VO₂.
- Provas fictícias em 25/10 e 08/11, posteriores à data da demonstração.

Edições persistem apenas no armazenamento do navegador, por origem. Não use dados reais. Não há sincronização, cobrança ou autenticação. Duplicar a semana anterior **adiciona** as sessões, sem substituir as existentes.

## Estrutura

- `src/main.tsx`: navegação, telas e estado local.
- `src/data.ts`: tipos, dados, modelos e datas de referência.
- `src/StudentForm.tsx`: cadastro em três etapas.
- `src/WorkoutEditor.tsx`: formulário dinâmico e prévia.
- `src/Modal.tsx`: janela/painel móvel com Escape, retorno de foco e navegação por teclado.
- `src/style.css`: estilos mobile-first e variáveis de tema (`--primary`, `--secondary`, `--bg`, `--panel`, `--logo-text`). A marca tipográfica VC pode ser substituída sem alterar os fluxos.

## Verificação desta rodada

Compilação TypeScript e Vite concluída. Conferidos no navegador: busca de alunos, perfil, edição do plano, editor de rodagem/tiros, mudança para intervalado por tempo, uso de modelo, duplicação de sessão e de semana. Layout conferido no desktop e no celular (375–390 px), incluindo cadastro em uma coluna. Dados e datas dos exemplos foram validados.

A configuração de publicação adicionada durante a revisão foi preservada. A build usa o caminho-base `/vanderlei-costa/`; não foi feita nova publicação nesta rodada.
