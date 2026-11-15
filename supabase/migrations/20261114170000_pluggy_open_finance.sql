begin;

alter table public.open_finance_connections
  add column if not exists institution_name text,
  add column if not exists sync_started_at timestamptz;

alter table public.open_finance_connections
  drop constraint if exists open_finance_connections_status_check;
alter table public.open_finance_connections
  add constraint open_finance_connections_status_check
  check (status in (
    'disconnected',
    'pending_authorization',
    'syncing',
    'connected',
    'expired',
    'error'
  ));

create unique index if not exists idx_open_finance_item_unique
  on public.open_finance_connections(provider, provider_connection_id)
  where provider_connection_id is not null;

alter table public.open_finance_connections
  add constraint open_finance_connections_id_user_unique unique (id, user_id);

create table if not exists public.open_finance_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null,
  external_account_id text not null,
  account_type text not null,
  account_subtype text,
  name text not null,
  marketing_name text,
  brand text,
  last_four_digits text,
  currency text,
  balance numeric(16, 2),
  credit_limit numeric(16, 2),
  available_limit numeric(16, 2),
  balance_due_date date,
  balance_close_date date,
  provider_status text,
  is_active boolean not null default true,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (connection_id, external_account_id),
  unique (id, user_id),
  foreign key (connection_id, user_id)
    references public.open_finance_connections(id, user_id) on delete cascade,
  check (last_four_digits is null or last_four_digits ~ '^[0-9]{4}$')
);

create table if not exists public.open_finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null,
  account_id uuid not null,
  external_transaction_id text not null,
  description text not null,
  amount numeric(16, 2) not null,
  currency text,
  category text,
  transaction_date timestamptz not null,
  status text not null,
  transaction_type text,
  credit_card_metadata jsonb,
  provider_updated_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (connection_id, external_transaction_id),
  foreign key (connection_id, user_id)
    references public.open_finance_connections(id, user_id) on delete cascade,
  foreign key (account_id, user_id)
    references public.open_finance_accounts(id, user_id) on delete cascade
);

create table if not exists public.open_finance_bill_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null,
  account_id uuid not null unique,
  amount numeric(16, 2),
  currency text,
  due_date date,
  closing_date date,
  source text not null default 'credit_account_balance',
  status text not null default 'current_balance',
  reported_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (connection_id, user_id)
    references public.open_finance_connections(id, user_id) on delete cascade,
  foreign key (account_id, user_id)
    references public.open_finance_accounts(id, user_id) on delete cascade
);

alter table public.open_finance_webhook_events
  add column if not exists payload jsonb;

create index if not exists idx_open_finance_accounts_user
  on public.open_finance_accounts(user_id, connection_id);
create index if not exists idx_open_finance_transactions_user_date
  on public.open_finance_transactions(user_id, transaction_date desc);
create index if not exists idx_open_finance_transactions_account_date
  on public.open_finance_transactions(account_id, transaction_date desc);
create index if not exists idx_open_finance_bill_snapshots_user
  on public.open_finance_bill_snapshots(user_id, due_date);

alter table public.open_finance_accounts enable row level security;
alter table public.open_finance_transactions enable row level security;
alter table public.open_finance_bill_snapshots enable row level security;
alter table public.open_finance_webhook_events enable row level security;

drop policy if exists "Users read their Open Finance accounts"
  on public.open_finance_accounts;
create policy "Users read their Open Finance accounts"
  on public.open_finance_accounts for select
  using (auth.uid() = user_id);

drop policy if exists "Users read their Open Finance transactions"
  on public.open_finance_transactions;
create policy "Users read their Open Finance transactions"
  on public.open_finance_transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Users read their Open Finance bill snapshots"
  on public.open_finance_bill_snapshots;
create policy "Users read their Open Finance bill snapshots"
  on public.open_finance_bill_snapshots for select
  using (auth.uid() = user_id);

revoke all on public.open_finance_accounts,
  public.open_finance_transactions,
  public.open_finance_bill_snapshots,
  public.open_finance_webhook_events
  from public, anon, authenticated;

grant select on public.open_finance_accounts,
  public.open_finance_transactions,
  public.open_finance_bill_snapshots
  to authenticated;

commit;
