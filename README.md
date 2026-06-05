# 💰 Financeiro App

Controle de gastos com parcelas automáticas. Deploy no Vercel + banco no Supabase.

---

## 🚀 Deploy em 5 passos

### 1. Supabase (banco de dados)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Crie um novo projeto
3. Vá em **SQL Editor** e cole o conteúdo de `supabase-migration.sql` — isso cria a tabela e importa seus dados atuais
4. Vá em **Settings → API** e copie:
   - `Project URL`
   - `anon public` key

### 2. Vercel (deploy)

1. Acesse [vercel.com](https://vercel.com) e conecte com sua conta GitHub
2. Faça upload deste projeto no GitHub (ou arraste na interface do Vercel)
3. Durante o deploy, em **Environment Variables**, adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://SEU_PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sua_anon_key_aqui
   ```
4. Clique em **Deploy** ✅

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
