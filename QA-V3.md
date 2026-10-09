# Verificação final — V3

Data de referência dos mocks: **08/10/2026**. A demonstração mantém essa data fixa, independentemente do relógio do aparelho.

## Resultado

Fluxos conferidos no navegador em **390 × 844** e **1280 × 900**, sem erros de console observados. Compilação TypeScript e Vite validada.

| Fluxo | Resultado |
| --- | --- |
| Início → Planejar treinos → escolher Rafael | Funcionou; semana e aluno corretos. |
| Alunos → busca Rafael → perfil → Dados cadastrais | Funcionou; CPF inicialmente mascarado. |
| Editar aluno → Pessoal → Corrida → Plano e saúde → salvar | Funcionou; retorno ao cadastro e mensagem “Cadastro atualizado.” |
| Novo aluno → continuar sem nome/nascimento | Campos obrigatórios impediram avançar; cadastro de teste cancelado. |
| Perfil → Prescrever treino → próxima semana | Mostrou terça 13, quinta 15 e domingo 18 de outubro. |
| Adicionar → Criar treino → rodagem → salvar → editar | Prévia e resumo refletiram distância de 6 km e depois 7 km. |
| Adicionar → Usar modelo → Tiros 200 m | Abriu editor antes de inserir uma sessão na semana. |
| Modelo 50 s → treino personalizado 55 s → salvar | Sessão salva com 55 s; modelo original continuou com 50 s. |
| Trocar tipo para Intervalado por tempo | Campos de distância/alvo desapareceram; esforço/pausa apareceram; prévia respondeu a 8 × 3 min. |
| Duplicar treino | Criou nova sessão no mesmo dia; manteve original. |
| Excluir → cancelar | Manteve todas as sessões. |
| Excluir → confirmar | Removeu somente a sessão selecionada. |
| Duplicar semana anterior | Duas sessões existentes + três cópias = cinco sessões. Nenhuma substituição. |
| Mais → Vencimentos / Aniversariantes / Próximas provas | Listas coerentes com os mocks: 3 vencimentos, 4 aniversários próximos no mês, 2 provas. |
| Perfil → Avaliações | Exemplos de 2400 m, 1600 m e Outro, sem cálculos científicos. |
| Perfil → Plano → Editar plano | Abriu etapa 3 diretamente; valor e vencimento preservados ao salvar. |
| Teclado no formulário desktop | Tab circulou dentro do diálogo; Escape fechou o editor. |

## Mobile

- Sidebar oculta; quatro destinos na navegação inferior.
- Formulários longos ocupam a tela inteira; navegação do aplicativo fica atrás da superfície do formulário.
- Rolagem única da superfície; o painel interno usa `overflow: visible`.
- Cabeçalho com retorno e ações no rodapé; campos em uma coluna.
- Largura medida: viewport 390 px e documento 390 px, sem transbordamento horizontal.
- Menus curtos e confirmações continuam em painéis compactos.

## Desktop

- Semana com três colunas de 313 px no viewport conferido.
- Formulários em diálogo de 620 px, com duas colunas de campos.
- Conteúdo administrativo limitado a 740 px; plano a 530 px.
- Telas simples mantêm espaço livre, sem novos indicadores.

## Verificação das operações de agenda

Asserções executadas para: isolamento dos modelos, IDs distintos nas cópias, salvar/editar, remoção apenas do ID selecionado, manutenção de outras sessões/alunos, adição da semana anterior sem substituir existentes, datas de terça/quinta/domingo e mensalidades fictícias de até R$ 80.

Os treinos criados e duplicados durante a conferência visual foram removidos pela própria interface após os testes. Os dados fictícios de Rafael foram mantidos.

## Limites

Validação visual em navegador desktop com viewport móvel, não em aparelho físico. Teclado virtual e particularidades de Safari/Chrome em um telefone real não foram exercitados. Não houve publicação ou integração externa nesta rodada.
