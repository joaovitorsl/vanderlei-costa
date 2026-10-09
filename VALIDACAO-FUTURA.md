# Hipóteses para conversar com Vanderlei — não implementadas

A V3 encerra esta rodada de protótipo. Nenhum item abaixo deve ser desenvolvido antes do feedback e da autorização do cliente.

## Copiar treino para…

Possíveis destinos: outro dia ou outro aluno. A V3 permite somente duplicar no mesmo dia. O menu de ações fica em `WorkoutActions.tsx` e as operações locais ficam em `scheduleOperations.ts`; a interface não pressupõe novos destinos.

## Compartilhamento de treino

Hipótese: montar a sessão → gerar card/imagem/PDF → enviar manualmente pelo WhatsApp. Validar primeiro formato, frequência de uso e necessidade real. Não foram criados botão, exportação, PDF, imagem ou integração WhatsApp.

## Portal pequeno do aluno

Hipótese: acesso individual por link com token aleatório, como `/a/<token-aleatorio>`, confirmação de nascimento e sessão no dispositivo. O desenho do acesso ainda precisa ser validado; não existe autenticação, rota, token ou sessão implementada.

A eventual visão do aluno seria limitada a treino de hoje, semana, histórico prescrito e próxima prova. Não deveria receber CPF, endereço, dados administrativos ou informações de outros alunos.

Os tipos de treino, a agenda e as operações estão separados dos formulários administrativos. Isso permite reaproveitar a representação das sessões em uma futura visão limitada, sem introduzir essa área ou qualquer backend agora.

## Fora do protótipo

RPE, marcação de conclusão pelo aluno, Strava, Garmin, GPS, mapas, laps, smartwatch, conquistas, gamificação, notificações, pagamentos, multi-assessoria e integrações externas permanecem fora do escopo.
