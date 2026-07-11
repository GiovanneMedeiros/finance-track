# SQL para criar as tabelas do FinanceTrack SaaS

## ⚠️ COPIE APENAS O SQL ABAIXO (sem o # acima)

Selecione TUDO aqui entre as barras e cole no SQL Editor:

---

---

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  amount decimal(12, 2) not null,
  date date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  foreign key (user_id) references auth.users on delete cascade
);
alter table transactions enable row level security;
create policy "Users can read their transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can manage their transactions" on transactions for insert, update, delete with check (auth.uid() = user_id);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text default '#34d399',
  icon text default '💳',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  foreign key (user_id) references auth.users on delete cascade
);
alter table categories enable row level security;
create policy "Users can read their categories" on categories for select using (auth.uid() = user_id);
create policy "Users can manage their categories" on categories for insert, update, delete with check (auth.uid() = user_id);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  bank text,
  network text not null check (network in ('credit', 'debit')),
  limit_amount decimal(12, 2),
  closing_day integer,
  payment_day integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  foreign key (user_id) references auth.users on delete cascade
);
alter table cards enable row level security;
create policy "Users can read their cards" on cards for select using (auth.uid() = user_id);
create policy "Users can manage their cards" on cards for insert, update, delete with check (auth.uid() = user_id);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  target_amount decimal(12, 2) not null,
  current_amount decimal(12, 2) default 0,
  target_date date,
  priority integer default 1,
  status text default 'active' check (status in ('active', 'completed', 'abandoned')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  foreign key (user_id) references auth.users on delete cascade
);
alter table goals enable row level security;
create policy "Users can read their goals" on goals for select using (auth.uid() = user_id);
create policy "Users can manage their goals" on goals for insert, update, delete with check (auth.uid() = user_id);

create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_transactions_date on transactions(date);
create index if not exists idx_categories_user_id on categories(user_id);
create index if not exists idx_cards_user_id on cards(user_id);
create index if not exists idx_goals_user_id on goals(user_id);

