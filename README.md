# Vanderlei Costa · Protótipo V3

Refinamento final da direção aprovada na V2: mobile-first, com a mesma identidade escura e verde e os mesmos quatro destinos principais. Frontend React + TypeScript + Vite, sem backend ou integrações.

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

## Versões preservadas

Antes das alterações, as versões anteriores foram preservadas:

- **V1:** commit `3c4505c`, tag `prototype-v1-complete-dashboard`, arquivo `vanderlei-costa-v1-preservada.zip` em `outputs`.
- **V2 aprovada:** commit `e58b30b`, tag `prototype-v2-approved`, arquivo `vanderlei-costa-v2-preservada.zip` em `outputs`.
- **V3:** branch `prototype-v3-final-refinement`.

Use as tags para recuperar exatamente as versões aprovadas; branches podem receber alterações posteriores. Os ZIPs não incluem `.git`; o histórico fica no projeto local.

A V3 usa `vc-students-v3` e `vc-schedule-v3`. Os dados locais das versões anteriores permanecem intactos. Cada versão começa com seus próprios exemplos; não há migração ou mistura de cadastros.

## Refinamentos finais da V3

- Formulários de aluno e treino ocupam a tela inteira no celular, com uma única superfície de rolagem, cabeçalho de retorno e ações no rodapé. Menus curtos permanecem compactos.
- Ações de treino reunidas em componente próprio: editar, duplicar no mesmo dia e excluir com confirmação explícita.
- Modelos abrem um editor independente; mudar a sessão não altera o modelo.
- Prévia separa esforço, alvo, pausa, aquecimento e desaquecimento.
- Duplicar semana informa que todas as sessões anteriores serão adicionadas e as existentes serão mantidas, inclusive nos dias já preenchidos.
- Avaliações priorizam 2400 m, 1600 m e Outro; Cooper é apenas uma possibilidade secundária.
- Telas administrativas com largura contida no desktop, sem novos dados ou métricas.
- Mensagens distinguem cadastro criado/atualizado e treino salvo/atualizado/excluído/duplicado. Foco, Escape e áreas de toque revisados.

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
- Avaliações ilustrativas de 1600 m, 2400 m e Outro; Cooper é citado apenas como possibilidade secundária. Não há teste oficial assumido ou fórmula de VO₂.
- Provas fictícias em 25/10 e 08/11, posteriores à data da demonstração.

Edições persistem apenas no armazenamento do navegador, por origem. Não use dados reais. Não há sincronização, cobrança ou autenticação. Duplicar a semana anterior **adiciona** as sessões, sem substituir as existentes.

## Estrutura

- `src/main.tsx`: navegação, telas e estado local.
- `src/data.ts`: tipos, dados, modelos e datas de referência.
- `src/StudentForm.tsx`: cadastro em três etapas.
- `src/WorkoutEditor.tsx`: formulário dinâmico e prévia.
- `src/Modal.tsx`: superfície de formulário ou menu compacto, com Escape, retorno de foco e navegação por teclado.
- `src/WorkoutActions.tsx`: menu de ações do treino.
- `src/scheduleOperations.ts`: operações locais isoladas da navegação e dos modelos.
- `src/style.css`: estilos mobile-first e variáveis de tema (`--primary`, `--secondary`, `--bg`, `--panel`, `--logo-text`). A marca tipográfica VC pode ser substituída sem alterar os fluxos.

## Verificação desta rodada

Veja `QA-V3.md` para os fluxos, resultados e limites da conferência em 390 px e desktop. A compilação TypeScript/Vite e as verificações de integridade da agenda passaram.

Veja `VALIDACAO-FUTURA.md` para as hipóteses apenas documentadas: copiar para outro destino, compartilhamento de treino e portal do aluno. Nenhuma delas foi implementada.

A configuração de publicação existente foi preservada. A build usa o caminho-base `/vanderlei-costa/`; não foi feita nova publicação nesta rodada.
