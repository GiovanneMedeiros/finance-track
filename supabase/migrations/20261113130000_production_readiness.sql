begin;

alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists custom_balance numeric(12, 2),
  add column if not exists plan text not null default 'free',
  add column if not exists subscription_status text not null default 'inactive',
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.transactions
  add column if not exists date date;

update public.transactions
set date = coalesce(date, created_at::date, current_date)
where date is null;

alter table public.transactions
  alter column date set default current_date,
  alter column date set not null;

alter table public.cards
  add column if not exists last_digits text not null default '',
  add column if not exists current_usage numeric(12, 2) not null default 0,
  add column if not exists notes text not null default '',
  add column if not exists color text not null default '#34d399',
  add column if not exists is_active boolean not null default true;

create table if not exists public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  category text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month, category)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  reference_month date not null,
  due_date date not null,
  amount numeric(12, 2) not null check (amount >= 0),
  status text not null default 'open' check (status in ('open', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, card_id, reference_month)
);

create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  imported_count integer not null default 0 check (imported_count >= 0),
  created_at timestamptz not null default now()
);

do $$
begin
  if (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'monthly_budgets'
      and column_name in (
        'id', 'user_id', 'month', 'category', 'amount', 'created_at', 'updated_at'
      )
  ) <> 7 then
    raise exception 'public.monthly_budgets already exists with an incompatible schema; reconcile it before applying this migration';
  end if;

  if (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'invoices'
      and column_name in (
        'id', 'user_id', 'card_id', 'reference_month', 'due_date',
        'amount', 'status', 'created_at', 'updated_at'
      )
  ) <> 9 then
    raise exception 'public.invoices already exists with an incompatible schema; reconcile it before applying this migration';
  end if;

  if (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'import_batches'
      and column_name in ('id', 'user_id', 'file_name', 'imported_count', 'created_at')
  ) <> 5 then
    raise exception 'public.import_batches already exists with an incompatible schema; reconcile it before applying this migration';
  end if;
end;
$$;

create index if not exists idx_monthly_budgets_user_month
  on public.monthly_budgets(user_id, month);
create index if not exists idx_invoices_user_due_date
  on public.invoices(user_id, due_date);
create index if not exists idx_import_batches_user_created
  on public.import_batches(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.categories enable row level security;
alter table public.cards enable row level security;
alter table public.goals enable row level security;
alter table public.monthly_budgets enable row level security;
alter table public.invoices enable row level security;
alter table public.import_batches enable row level security;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles', 'transactions', 'categories', 'cards', 'goals',
        'monthly_budgets', 'invoices', 'import_batches'
      )
  loop
    execute format(
      'drop policy %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end;
$$;

drop policy if exists "Users can read their profile" on public.profiles;
drop policy if exists "Users can manage their profile" on public.profiles;
create policy "Users can read their profile"
  on public.profiles for select
  using (auth.uid() = id);
create policy "Users can update their profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

do $$
declare
  column_grant record;
  grantee_sql text;
begin
  for column_grant in
    select grantee, column_name, privilege_type
    from information_schema.column_privileges
    where table_schema = 'public'
      and table_name = 'profiles'
      and grantee in ('anon', 'authenticated', 'PUBLIC')
  loop
    grantee_sql := case
      when column_grant.grantee = 'PUBLIC' then 'PUBLIC'
      else format('%I', column_grant.grantee)
    end;
    execute format(
      'revoke %s (%I) on public.profiles from %s',
      column_grant.privilege_type,
      column_grant.column_name,
      grantee_sql
    );
  end loop;
end;
$$;

revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update (email, full_name, custom_balance, updated_at)
  on public.profiles to authenticated;

revoke all on public.monthly_budgets, public.invoices, public.import_batches
  from public, anon;
grant select, insert, update, delete
  on public.monthly_budgets, public.invoices, public.import_batches
  to authenticated;

drop policy if exists "Users can read their transactions" on public.transactions;
drop policy if exists "Users can manage their transactions" on public.transactions;
create policy "Users can read their transactions"
  on public.transactions for select
  using (auth.uid() = user_id);
create policy "Users can insert their transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);
create policy "Users can update their transactions"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete their transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read their categories" on public.categories;
drop policy if exists "Users can manage their categories" on public.categories;
create policy "Users can read their categories"
  on public.categories for select
  using (auth.uid() = user_id);
create policy "Users can insert their categories"
  on public.categories for insert
  with check (auth.uid() = user_id);
create policy "Users can update their categories"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete their categories"
  on public.categories for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read their cards" on public.cards;
drop policy if exists "Users can manage their cards" on public.cards;
drop policy if exists "Users can view their own cards" on public.cards;
drop policy if exists "Users can insert their own cards" on public.cards;
drop policy if exists "Users can update their own cards" on public.cards;
drop policy if exists "Users can delete their own cards" on public.cards;
create policy "Users can read their cards"
  on public.cards for select
  using (auth.uid() = user_id);
create policy "Users can insert their cards"
  on public.cards for insert
  with check (auth.uid() = user_id);
create policy "Users can update their cards"
  on public.cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete their cards"
  on public.cards for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read their goals" on public.goals;
drop policy if exists "Users can manage their goals" on public.goals;
create policy "Users can read their goals"
  on public.goals for select
  using (auth.uid() = user_id);
create policy "Users can insert their goals"
  on public.goals for insert
  with check (auth.uid() = user_id);
create policy "Users can update their goals"
  on public.goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete their goals"
  on public.goals for delete
  using (auth.uid() = user_id);

alter table public.monthly_budgets enable row level security;
drop policy if exists "Users can manage their monthly budgets" on public.monthly_budgets;
create policy "Users can manage their monthly budgets"
  on public.monthly_budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.invoices enable row level security;
drop policy if exists "Users can manage their invoices" on public.invoices;
create policy "Users can manage their invoices"
  on public.invoices for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.cards
      where cards.id = invoices.card_id
        and cards.user_id = auth.uid()
    )
  );

alter table public.import_batches enable row level security;
drop policy if exists "Users can manage their import batches" on public.import_batches;
create policy "Users can manage their import batches"
  on public.import_batches for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, plan, subscription_status)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'free',
    'inactive'
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

commit;
