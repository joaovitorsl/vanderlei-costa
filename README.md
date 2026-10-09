# Vanderlei Costa · Treinador

Protótipo navegável de uma assessoria de corrida. React + TypeScript + Vite, sem backend ou serviços externos.

## Executar

Com Node.js 20.19+ ou 22.12+ e npm instalados:

```sh
npm install
npm run dev
```

Abra o endereço exibido pelo Vite. Para validar a compilação:

```sh
npm run build
```

## Roteiro de demonstração

1. A visão geral abre diretamente. O botão de saída no rodapé da navegação leva ao login fictício; “Entrar como treinador” retorna ao dashboard.
2. Em Alunos, pesquise e filtre. Abra um perfil e explore Cadastro, Avaliações, Treinos e Financeiro / Plano.
3. Em Planilha semanal, selecione um aluno e edite os treinos de terça, quinta e domingo. Os controles permitem adicionar, duplicar uma sessão, adicionar as sessões da semana anterior e usar modelos.
4. O editor gera uma prévia conforme os campos são preenchidos. Os modelos abrem o editor para revisão antes de salvar.
5. “Novo aluno” oferece um cadastro em três etapas. O perfil permite editar cadastro e plano.

## Dados e limites

- 12 alunos fictícios e semanas de 28/09–04/10, 05–11/10 e 12–18/10/2026. A última semana inclui alunos ainda sem prescrição.
- Data de referência da demonstração: 08/10/2026. Datas e indicadores não acompanham o relógio real.
- Dados administrativos, avaliações, provas e pagamentos são fictícios. As avaliações e o histórico financeiro são demonstrativos e não representam cálculos ou transações.
- Edições de alunos e treinos persistem somente no localStorage deste navegador. Não use dados pessoais reais. Não há sincronização entre dispositivos.
- A duplicação da semana anterior **adiciona** sessões à semana atual, preservando sessões já existentes.
- Não existem autenticação, cobrança, banco, API ou integração externa. O acesso inicial direto facilita a apresentação.

## Estrutura

- `src/data.ts`: tipos, alunos, modelos, agenda e funções de apresentação.
- `src/main.tsx`: telas, componentes e interações locais.
- `src/style.css`: layout responsivo e variáveis de tema (`--primary`, `--secondary`, `--bg`, `--panel`, `--logo-text`). O logotipo é uma marca tipográfica provisória “VC”, substituível no componente de marca.

A direção visual aproveita a densidade de informação, o fundo escuro e as divisórias discretas observadas em seuimposto.com, adaptadas à identidade da assessoria.
