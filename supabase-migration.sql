-- Execute este SQL no Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql

create table if not exists gastos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('parcelado', 'recorrente')),
  valor numeric(10,2) not null,
  vencimento_dia integer not null,
  -- apenas para parcelados
  parcelas_total integer,
  mes_inicio text, -- formato 'YYYY-MM'
  -- apenas para recorrentes
  ativo boolean not null default true,
  -- tags transversais (ex: 'Estudo', 'Saúde'), independentes do tipo (parcelado/recorrente)
  tags text[] not null default '{}',
  created_at timestamptz default now()
);

-- Caso a tabela "gastos" já exista de uma versão anterior, garante a coluna de tags
alter table gastos add column if not exists tags text[] not null default '{}';

-- Habilitar RLS (Row Level Security) - acesso público para este app pessoal
alter table gastos enable row level security;

create policy "acesso_publico" on gastos
  for all using (true) with check (true);

-- Dados iniciais dos seus CSVs
insert into gastos (nome, tipo, valor, vencimento_dia, parcelas_total, mes_inicio) values
  ('Renner', 'parcelado', 118.40, 15, 7, '2026-01'),
  ('Renner', 'parcelado', 112.64, 15, 7, '2026-01'),
  ('Renner', 'parcelado', 167.26, 15, 5, '2026-06'),
  ('Amazon', 'parcelado', 67.81, 15, 5, '2026-03'),
  ('Amazon', 'parcelado', 53.14, 15, 5, '2026-03'),
  ('Dafiti', 'parcelado', 102.22, 15, 7, '2026-05'),
  ('Shopee', 'parcelado', 77.29, 25, 6, '2026-02'),
  ('Notebook', 'parcelado', 275.40, 25, 10, '2025-08'),
  ('Dafiti', 'parcelado', 76.83, 25, 10, '2025-10'),
  ('Dafiti', 'parcelado', 94.73, 25, 5, '2026-03'),
  ('Dafiti', 'parcelado', 84.53, 25, 10, '2025-11'),
  ('Thiago Damasio', 'parcelado', 58.10, 25, 10, '2025-10'),
  ('Personal', 'parcelado', 214.00, 15, 3, '2026-06');

insert into gastos (nome, tipo, valor, vencimento_dia, ativo) values
  ('Dentista', 'recorrente', 47.26, 25, true),
  ('Vivo', 'recorrente', 102.00, 25, true),
  ('Total Pass', 'recorrente', 0, 15, true);

-- Ganhos (renda fixa ou pontual)
create table if not exists ganhos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  valor numeric(10,2) not null,
  recorrente boolean not null default false,
  mes_referencia text, -- 'YYYY-MM', usado quando não é recorrente
  created_at timestamptz default now()
);

alter table ganhos enable row level security;

create policy "acesso_publico" on ganhos
  for all using (true) with check (true);

-- Gastos variáveis (lançamentos pontuais por categoria)
create table if not exists variaveis (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  valor numeric(10,2) not null,
  categoria text not null,
  mes_referencia text not null, -- 'YYYY-MM'
  created_at timestamptz default now()
);

alter table variaveis enable row level security;

create policy "acesso_publico" on variaveis
  for all using (true) with check (true);

-- Status de pagamento por gasto (fixo/parcela) + mês
create table if not exists pagamentos (
  gasto_id uuid not null references gastos(id) on delete cascade,
  mes_referencia text not null, -- 'YYYY-MM'
  pago boolean not null default false,
  updated_at timestamptz default now(),
  primary key (gasto_id, mes_referencia)
);

alter table pagamentos enable row level security;

create policy "acesso_publico" on pagamentos
  for all using (true) with check (true);

-- RLS por si só não basta: também é preciso conceder os privilégios na tabela
grant select, insert, update, delete on table pagamentos to anon, authenticated;

-- Gastos variáveis já são por mês, basta uma coluna direta
alter table variaveis add column if not exists pago boolean not null default false;
