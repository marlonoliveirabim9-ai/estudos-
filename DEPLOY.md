# Publicando a plataforma com link público e login

Este guia te leva do código no seu computador até um link `https://...`
funcionando, com login, acessível de qualquer dispositivo — usando apenas
serviços com plano gratuito (Vercel para hospedar o site + Neon para o
banco de dados Postgres). Leva uns 15–20 minutos na primeira vez.

## 1. Crie um banco Postgres gratuito (Neon)

1. Acesse **neon.com** (ou **supabase.com**, qualquer um dos dois serve) e
   crie uma conta gratuita.
2. Crie um novo projeto/banco de dados Postgres.
3. Copie a **connection string** (algo como
   `postgresql://usuario:senha@ep-xxxx.aws.neon.tech/neondb?sslmode=require`).
   Guarde essa string — é o valor de `DATABASE_URL`.

## 2. Coloque o código no GitHub

1. Crie uma conta no **github.com** se ainda não tiver.
2. Crie um repositório novo (pode ser privado).
3. No seu computador, dentro da pasta do projeto:

   ```bash
   git init
   git add .
   git commit -m "Plataforma de estudos PRF"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```

## 3. Publique no Vercel

1. Acesse **vercel.com** e crie uma conta (dá para entrar direto com o
   GitHub).
2. Clique em **New Project** e importe o repositório que você acabou de
   criar.
3. Antes de clicar em "Deploy", abra a seção **Environment Variables** e
   adicione:
   - `DATABASE_URL` → a connection string do Neon (passo 1).
   - `AUTH_SECRET` → gere um valor aleatório (rode `openssl rand -base64 33`
     no terminal, ou use `npx auth secret`) e cole o resultado.
4. Clique em **Deploy**. Em 1–2 minutos o Vercel te dá uma URL pública,
   por exemplo `https://seu-projeto.vercel.app`.

## 4. Crie as tabelas e popule o edital no banco de produção

Isso só precisa ser feito uma vez. No seu computador, aponte temporariamente
o `DATABASE_URL` local para o banco do Neon e rode:

```bash
# no arquivo .env (não .env.local), coloque a DATABASE_URL do Neon
npx drizzle-kit push
npx tsx src/db/seed.ts
```

Isso cria as tabelas e insere os 241 tópicos do edital verticalizado da PRF
(mais o usuário de demonstração — você pode ignorá-lo ou removê-lo depois).

## 5. Pronto

Acesse a URL do Vercel, clique em **Cadastre-se**, crie sua conta com seu
e-mail e senha, e comece a marcar seu progresso. Como o login funciona por
conta (não por navegador), você acessa a mesma conta do computador e do
celular.

## Domínio próprio (opcional)

No painel do Vercel, em **Settings → Domains**, você pode apontar um domínio
próprio (ex.: `estudosprf.com.br`) para o projeto, se quiser.

## Atualizando a plataforma no futuro

Sempre que quiser adicionar uma funcionalidade nova, peça para eu (Claude)
alterar o código aqui na sessão, te envio os arquivos atualizados, você
substitui no seu repositório local e roda:

```bash
git add .
git commit -m "descrição da mudança"
git push
```

O Vercel publica a nova versão automaticamente a cada `git push` na branch
`main`. Se a mudança alterar o schema do banco (novas tabelas/colunas), rode
`npx drizzle-kit push` apontando para o `DATABASE_URL` de produção antes de
usar a funcionalidade nova.

## Backup dos dados

O Neon e o Supabase fazem backup automático nos planos gratuitos, mas vale
export manual de vez em quando: `pg_dump "sua-connection-string" > backup.sql`.
