# 💰 Financeiro App

Controle de gastos com parcelas automáticas. Deploy no Vercel + banco no Supabase.

---

## 🚀 Deploy rápido

### 1. Supabase (banco de dados) — faça isso primeiro

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Crie um novo projeto
3. Vá em **SQL Editor** e cole o conteúdo de `supabase-migration.sql` — isso cria a tabela e importa seus dados atuais
4. Vá em **Settings → API** e copie:
   - `Project URL`
   - `anon public` key

### 2. Vercel — um clique

Clique no botão abaixo. O Vercel já importa este repositório, detecta o Next.js sozinho e só vai te pedir para colar as duas chaves do Supabase que você copiou acima:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/leticia-csantos/financeiro-app/tree/claude/vercel-deployment-y3uI9&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Chaves%20do%20seu%20projeto%20Supabase%20(Settings%20%E2%86%92%20API)&envLink=https://supabase.com/dashboard/project/_/settings/api&project-name=financeiro-app&repository-name=financeiro-app)

Cole as duas variáveis quando solicitado e clique em **Deploy**. Pronto — sem precisar configurar nada manualmente. ✅

---

## 💡 Como usar

### Navegação por mês
Use as setas `‹ ›` para navegar entre meses. O app mostra **automaticamente** os gastos que se aplicam àquele mês — parcelas já finalizadas não aparecem, novas aparecem sozinhas.

### Adicionar gasto
Clique em **+ Novo gasto** e preencha:
- **Parcelado**: nome, valor da parcela, dia de vencimento, total de parcelas, mês de início
- **Recorrente**: nome, valor, dia de vencimento (fica ativo até você desativar)

### Gerenciar recorrentes
Na aba **Todos os gastos**, use o toggle para ativar/desativar recorrentes como Vivo, Dentista, etc.

---

## 🗂 Estrutura

```
app/
  page.tsx          # Dashboard principal
  layout.tsx        # Layout raiz
  globals.css       # Design system
  api/gastos/       # API REST (CRUD)
components/
  GastoModal.tsx    # Formulário de novo/editar gasto
lib/
  supabase.ts       # Cliente Supabase + tipos
  financeiro.ts     # Lógica de filtragem por mês
supabase-migration.sql  # SQL para criar tabela + dados iniciais
```
