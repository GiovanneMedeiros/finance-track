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

alter table public.invoices
  add column if not exists reference_month date,
  add column if not exists amount numeric(12, 2);

do $$
declare
  has_legacy_invoice_columns boolean;
begin
  select count(*) = 3
  into has_legacy_invoice_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'invoices'
    and column_name in ('period_month', 'period_year', 'total');

  if has_legacy_invoice_columns then
    if exists (
      select 1
      from public.invoices
      where period_month not between 1 and 12
         or period_year not between 1 and 9999
         or total < 0
    ) then
      raise exception 'public.invoices has invalid legacy period or total values; correct them before applying this migration';
    end if;

    if exists (
      select 1
      from public.invoices
      where due_date is null
    ) then
      raise exception 'public.invoices has rows without due_date; fill those dates before applying this migration';
    end if;

    update public.invoices
    set reference_month = coalesce(reference_month, make_date(period_year, period_month, 1)),
        amount = coalesce(amount, total)
    where reference_month is null
       or amount is null;

    alter table public.invoices
      alter column reference_month set not null,
      alter column amount set not null,
      alter column due_date set not null;

    create or replace function public.sync_legacy_invoice_columns()
    returns trigger
    language plpgsql
    set search_path = ''
    as $function$
    declare
      invoice_row jsonb := to_jsonb(new);
      old_invoice_row jsonb;
      invoice_reference_month date;
      invoice_amount numeric;
      legacy_period_changed boolean := false;
      legacy_total_changed boolean := false;
    begin
      if tg_op = 'UPDATE' then
        old_invoice_row := to_jsonb(old);
        legacy_period_changed :=
          invoice_row -> 'period_month' is distinct from old_invoice_row -> 'period_month'
          or invoice_row -> 'period_year' is distinct from old_invoice_row -> 'period_year';
        legacy_total_changed :=
          invoice_row -> 'total' is distinct from old_invoice_row -> 'total';
      end if;

      if tg_op = 'UPDATE'
         and legacy_period_changed
         and invoice_row -> 'reference_month' is not distinct from old_invoice_row -> 'reference_month' then
        invoice_reference_month := make_date(
          (invoice_row ->> 'period_year')::integer,
          (invoice_row ->> 'period_month')::integer,
          1
        );
      else
        invoice_reference_month := (invoice_row ->> 'reference_month')::date;
      end if;

      if invoice_reference_month is null then
        invoice_reference_month := make_date(
          (invoice_row ->> 'period_year')::integer,
          (invoice_row ->> 'period_month')::integer,
          1
        );
      end if;

      if tg_op = 'UPDATE'
         and legacy_total_changed
         and invoice_row -> 'amount' is not distinct from old_invoice_row -> 'amount' then
        invoice_amount := (invoice_row ->> 'total')::numeric;
      else
        invoice_amount := coalesce(
          (invoice_row ->> 'amount')::numeric,
          (invoice_row ->> 'total')::numeric
        );
      end if;

      invoice_row := jsonb_set(invoice_row, '{reference_month}', to_jsonb(invoice_reference_month), true);
      invoice_row := jsonb_set(invoice_row, '{amount}', to_jsonb(invoice_amount), true);
      invoice_row := jsonb_set(invoice_row, '{period_month}', to_jsonb(extract(month from invoice_reference_month)::integer), true);
      invoice_row := jsonb_set(invoice_row, '{period_year}', to_jsonb(extract(year from invoice_reference_month)::integer), true);
      invoice_row := jsonb_set(invoice_row, '{total}', to_jsonb(invoice_amount), true);

      new := jsonb_populate_record(new, invoice_row);
      return new;
    end;
    $function$;

    drop trigger if exists sync_legacy_invoice_columns on public.invoices;
    create trigger sync_legacy_invoice_columns
      before insert or update on public.invoices
      for each row execute function public.sync_legacy_invoice_columns();
  end if;
end;
$$;

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

  if exists (
    select 1
    from public.invoices
    where reference_month is null or amount is null
  ) then
    raise exception 'public.invoices has rows that could not be migrated to reference_month and amount';
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
