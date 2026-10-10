# Vanderlei Costa · Pré-demo

Protótipo para apresentação, com o visual aprovado da V5.1 e ajustes pontuais de domínio e UX. React + TypeScript + Vite; dados fictícios persistidos apenas no navegador. A demonstração mantém a data fixa de 08/10/2026.

## Executar

Com Node.js 22 e pnpm 10:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
node --experimental-strip-types --test tests/*.test.ts
```

## Histórico e publicação

A única branch é `main`. Versões e refinamentos são commits do mesmo histórico. Cada push executa a build e publica `dist` no GitHub Pages:
https://joaovitorsl.github.io/vanderlei-costa/

## Ajustes pré-demo

- Desktop: Início, Alunos e Treinos continuam principais; Agenda coletiva, Próximas provas, Vencimentos e Aniversariantes aparecem diretamente como acessos secundários, sem Mais no desktop. No mobile permanecem Início / Alunos / Treinos / Mais.
- Avaliações: criar, consultar, editar e excluir registros de cada aluno. Data, tipo (1600 m, 2400 m ou Outro), tempo em min:seg, FC máxima e observações opcionais. Outro revela Nome da avaliação. Não há cálculo de VO₂: os valores antigos são somente exemplos do seed e desaparecem ao editar aquele registro.
- Aluno: labels CPF, Telefone e E-mail; objetivo Outro revela texto livre; Início na corrida registra somente o ano. Matrícula oculta no novo cadastro; gerada ao salvar, visível somente depois, somente leitura e preservada na edição.
- Agenda: Treino coletivo, Longão coletivo, Evento / confraternização e Dia livre. Título é opcional e não substitui o tipo. Dia livre não pede horário/local e informa que não há encontro coletivo; não pode coexistir com encontros na mesma data. Pode ocorrer em qualquer dia da semana, sem recorrência automática.
- Provas: uma prova tem várias distâncias (informadas por vírgula), e cada participante escolhe uma delas. Ao remover uma distância, é necessário corrigir os participantes afetados antes de salvar. O perfil deriva a próxima prova e a distância daquele atleta.
- Nenhum dashboard, métrica, pagamento, integração, área do atleta ou novo módulo foi acrescentado.

## Modelo de dados e migração

- `Student.runningSince`: ano estável, substitui `experience`. Durações legadas em anos/meses são convertidas uma vez usando a data fixa da demonstração; textos não interpretáveis deixam o ano sem informação.
- `Student.goal` + `customGoal`: objetivo predefinido e texto quando Outro. Objetivos personalizados antigos são preservados.
- `Student.enrollment`: geração `AAAA-NNN` com a próxima sequência livre, calculada a partir das matrículas existentes no momento do salvamento; novas matrículas não dependem da quantidade de alunos. As existentes não são alteradas.
- `AssessmentBook`: registros por ID do aluno, com ID próprio, data, tipo, nome opcional, tempo, FC e notas. Persistência em `vc-assessments-v1`; novos alunos começam sem avaliações.
- `Race.distances[]` e `Race.participants[{studentId,distance}]`: substituem a distância única e a lista simples de IDs. Provas antigas com o mesmo nome/data são reunidas, preservando as distâncias dos participantes. O perfil não armazena uma segunda cópia da prova.
- `AgendaEntry`: encontros preservam `kind: meeting` com `type` independente (`training`, `long-run`, `event`); `free-day` possui somente ID e data. O antigo `free-sunday` é migrado; os títulos e notas existentes permanecem.
- Alunos, agenda, provas, prescrições e histórico de cópias já salvos continuam sendo carregados. Prescrições individuais continuam independentes da agenda.

O seed atualizado exemplifica Circuito Parque Verde com 3, 5 e 10 km: Marina em 5 km, Rafael em 10 km e Beatriz em 3 km. Dados já salvos são preservados; o novo exemplo completo aparece em um navegador sem dados ou após o reset.

## Restaurar a demonstração

Abra `?resetDemo=1` na URL. Somente as chaves locais desta demonstração (alunos, treinos, cópias, agenda, provas e avaliações) são removidas. O seed volta e o parâmetro é retirado da URL, preservando outros parâmetros e a âncora. Isso apaga as alterações de demonstração feitas naquele navegador.

## Validação pré-demo

25 testes de dados/operações e build TypeScript/Vite aprovados. O roteiro `tests/pre-demo.browser.mjs` foi executado pelas APIs CUA em desktop 1440 × 900 e mobile 390 × 844:

- navegação e acesso às áreas secundárias;
- cadastro/edição, matrícula somente leitura, objetivo condicional e ano de início;
- criar, editar e excluir avaliação, validação, campos opcionais e isolamento entre alunos;
- tipos da agenda, título independente, dia livre e conflito com encontro;
- prova com várias distâncias, vincular/remover participantes, correção de distância removida e perfil derivado;
- persistência após recarregar e conferência dos treinos existentes;
- nenhuma mensagem de erro no console ou rolagem horizontal nas telas verificadas.

## Decisões posteriores com o cliente

Confirmar a convenção definitiva da matrícula (o protótipo usa ano + sequência), o calendário real e os dados de exemplo. A relação entre prescrição e encontro, regras comerciais/Plano Família, cobranças, uniformes, musculação, integrações, área do atleta, WhatsApp e disponibilidade avançada seguem fora desta rodada.
