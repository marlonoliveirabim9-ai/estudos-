# Estudos PRF — Plataforma de preparação para o concurso da Polícia Rodoviária Federal

Plataforma pessoal (multiusuário, com login) para organizar o estudo do edital
verticalizado da PRF: acompanhamento de progresso por tópico com revisão
espaçada, ciclo de estudos ponderado, registro de sessões de estudo e
simulados com evolução de aproveitamento.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **PostgreSQL** + **Drizzle ORM** (não Prisma — veja "Por que Drizzle" abaixo)
- **Auth.js (NextAuth v5)** com login por e-mail/senha (multi-dispositivo)
- **Tailwind CSS 4**
- **Recharts** para o gráfico de evolução nos simulados

## Funcionalidades

- **Edital verticalizado interativo**: os 241 tópicos do edital PRF 2021
  (Blocos I, II e III), com checkboxes de Revisão 1/2/3 e campo de
  questões feitas/acertos por tópico — igual à lógica do e-book, só que
  vivo e com estatísticas automáticas.
- **Revisão espaçada automática**: ao marcar a Revisão 1, o sistema agenda
  sozinho a Revisão 2 para 7 dias depois; ao concluir a Revisão 2, agenda a
  Revisão 3 para mais 30 dias. O painel mostra as revisões vencidas do dia.
- **Ciclo de estudos ponderado**: você define um peso (1–5) por matéria; a
  plataforma recalcula, a cada sessão registrada, qual matéria está mais
  "atrasada" em relação ao peso e sugere o que estudar agora (rodízio
  ponderado clássico de cursinho de concurso).
- **Sessões de estudo**: registro rápido de tempo estudado por matéria/tópico,
  que alimenta o ciclo de estudos e o total semanal no painel.
- **Simulados**: registro de resultado geral e por matéria, com gráfico de
  evolução do aproveitamento ao longo do tempo.
- **Login multi-dispositivo**: cada usuário tem conta própria (e-mail/senha);
  os dados ficam no banco, não no navegador — acesse do computador ou do
  celular com a mesma conta.

## Por que Drizzle em vez de Prisma

A arquitetura original (documento "Estudos" do Claude) previa Prisma. Durante
a construção, descobri que o ambiente onde desenvolvi não conseguia baixar os
binários nativos do Prisma (bloqueio de rede do sandbox), o que teria me
impedido de testar a aplicação de verdade antes de te entregar. Troquei para
o Drizzle ORM, que é 100% TypeScript (sem binário nativo), funciona muito bem
com Postgres + serverless (Vercel) e me permitiu testar a aplicação
inteira localmente antes de te enviar. É uma troca tecnicamente sólida e não
uma limitação — mas te aviso porque a arquitetura anterior mencionava Prisma.

## Como rodar localmente

Pré-requisitos: Node.js 20+, um Postgres (local ou na nuvem).

```bash
npm install
cp .env.example .env.local   # edite DATABASE_URL e AUTH_SECRET
npx drizzle-kit push         # cria as tabelas
npx tsx src/db/seed.ts       # popula o edital da PRF + cria usuário demo
npm run dev
```

Acesse http://localhost:3000. Login de demonstração:
`demo@prfestudos.local` / `demo1234`.

## Como publicar com link público e login (produção)

Veja o arquivo `DEPLOY.md` — passo a passo completo para publicar de graça
no Vercel + Neon (ou Supabase), com domínio público e login funcionando de
qualquer dispositivo.

## Estrutura do projeto

```
src/
  app/
    login/, cadastro/        páginas públicas de autenticação
    (app)/                   área logada (dashboard, edital, ciclo, sessões, simulados)
    actions/                 server actions (mutações no banco)
    api/auth/[...nextauth]/  rota do Auth.js
  auth.ts                    configuração do Auth.js
  proxy.ts                   proteção de rotas (equivalente ao middleware)
  db/
    schema.ts                schema Drizzle (tabelas)
    edital-prf.ts             conteúdo do edital verticalizado da PRF (seed)
    seed.ts                   script de seed
  lib/
    spaced-repetition.ts      regras da revisão espaçada
    study-cycle.ts             algoritmo do ciclo de estudos ponderado
    queries.ts                 consultas agregadas usadas nas páginas
  components/                 componentes de UI (client components)
```

## Próximos passos sugeridos (v2)

- Tutor com IA (explicações, geração de questões, análise de erros) via
  backend proxy — já estava no plano original e continua fazendo sentido
  como próxima etapa.
- Caderno de erros dedicado (hoje o campo questões/acertos é agregado por
  tópico; um "log" de questões individuais erradas, com anotação do motivo
  do erro, é o próximo nível).
- Exportação/backup dos dados.
- Notificações (e-mail/push) quando uma revisão vence.
