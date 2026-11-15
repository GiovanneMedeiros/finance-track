begin;

alter table public.cards
  add column if not exists card_brand text not null default 'other',
  add column if not exists cardholder_name text not null default '',
  add column if not exists nickname text not null default '',
  add column if not exists theme_key text not null default 'custom',
  add column if not exists is_favorite boolean not null default false,
  add column if not exists is_archived boolean not null default false,
  add column if not exists alert_thresholds smallint[] not null default array[50, 70, 90]::smallint[],
  add column if not exists alert_spending_increase boolean not null default true,
  add column if not exists due_alert_days smallint not null default 5,
  add column if not exists opening_balance_imported boolean not null default false;

alter table public.cards
  alter column last_digits set default '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_card_brand_check'
  ) then
    alter table public.cards
      add constraint cards_card_brand_check
      check (card_brand in ('visa', 'mastercard', 'elo', 'amex', 'hipercard', 'other'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_network_check'
  ) then
    alter table public.cards
      add constraint cards_network_check
      check (network in ('credit', 'debit'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_limit_amount_check'
  ) then
    alter table public.cards
      add constraint cards_limit_amount_check
      check (limit_amount >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_current_usage_check'
  ) then
    alter table public.cards
      add constraint cards_current_usage_check
      check (current_usage >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_closing_day_check'
  ) then
    alter table public.cards
      add constraint cards_closing_day_check
      check (closing_day between 1 and 31);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_payment_day_check'
  ) then
    alter table public.cards
      add constraint cards_payment_day_check
      check (payment_day between 1 and 31);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_name_length_check'
  ) then
    alter table public.cards
      add constraint cards_name_length_check
      check (length(btrim(name)) between 1 and 80);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_bank_length_check'
  ) then
    alter table public.cards
      add constraint cards_bank_length_check
      check (length(btrim(bank)) between 1 and 80);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_nickname_length_check'
  ) then
    alter table public.cards
      add constraint cards_nickname_length_check
      check (length(nickname) <= 50);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_cardholder_name_length_check'
  ) then
    alter table public.cards
      add constraint cards_cardholder_name_length_check
      check (length(cardholder_name) <= 80);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_theme_key_check'
  ) then
    alter table public.cards
      add constraint cards_theme_key_check
      check (theme_key in ('nubank', 'inter', 'itau', 'santander', 'custom'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_last_digits_check'
  ) then
    alter table public.cards
      add constraint cards_last_digits_check
      check (last_digits = '' or last_digits ~ '^[0-9]{4}$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_alert_thresholds_check'
  ) then
    alter table public.cards
      add constraint cards_alert_thresholds_check
      check (
        cardinality(alert_thresholds) <= 3
        and alert_thresholds <@ array[50, 70, 90]::smallint[]
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_due_alert_days_check'
  ) then
    alter table public.cards
      add constraint cards_due_alert_days_check
      check (due_alert_days between 1 and 30);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.cards'::regclass
      and conname = 'cards_id_user_id_unique'
  ) then
    alter table public.cards
      add constraint cards_id_user_id_unique unique (id, user_id);
  end if;
end;
$$;

create table if not exists public.card_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null,
  request_id uuid not null,
  title text not null check (length(btrim(title)) between 1 and 120),
  amount numeric(12, 2) not null check (amount > 0),
  purchase_date date not null,
  category text not null check (
    category in (
      'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Compras',
      'Assinaturas', 'Lazer', 'Moradia', 'Outros'
    )
  ),
  installments_count smallint not null default 1 check (installments_count between 1 and 48),
  notes text not null default '' check (length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, request_id),
  unique (id, user_id, card_id),
  foreign key (card_id, user_id)
    references public.cards(id, user_id) on delete restrict
);

create table if not exists public.card_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null,
  closing_date date not null,
  due_date date not null,
  opening_balance numeric(12, 2) not null default 0 check (opening_balance >= 0),
  status text not null default 'open' check (status in ('open', 'closed', 'overdue', 'paid')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, card_id, closing_date),
  unique (id, user_id, card_id),
  foreign key (card_id, user_id)
    references public.cards(id, user_id) on delete restrict,
  check (due_date >= closing_date)
);

alter table public.card_bills
  add column if not exists opening_balance numeric(12, 2) not null default 0;

create unique index if not exists idx_cards_user_favorite
  on public.cards(user_id)
  where is_favorite and not is_archived;

create table if not exists public.card_installments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null,
  card_transaction_id uuid not null,
  bill_id uuid not null,
  installment_number smallint not null check (installment_number between 1 and 48),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  unique (card_transaction_id, installment_number),
  foreign key (card_transaction_id, user_id, card_id)
    references public.card_transactions(id, user_id, card_id) on delete cascade,
  foreign key (bill_id, user_id, card_id)
    references public.card_bills(id, user_id, card_id) on delete restrict
);

create table if not exists public.card_alert_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null,
  bill_id uuid,
  alert_type text not null check (alert_type in ('purchase', 'limit_threshold', 'due_date', 'spending_increase')),
  threshold smallint,
  dedupe_key text not null unique,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (card_id, user_id)
    references public.cards(id, user_id) on delete cascade,
  foreign key (bill_id, user_id, card_id)
    references public.card_bills(id, user_id, card_id) on delete cascade
);

create table if not exists public.open_finance_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('pluggy')),
  provider_connection_id text,
  status text not null default 'disconnected'
    check (status in ('disconnected', 'pending_authorization', 'connected', 'error')),
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider, provider_connection_id)
);

create table if not exists public.open_finance_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('pluggy')),
  provider_event_id text not null,
  status text not null default 'received'
    check (status in ('received', 'processing', 'processed', 'error')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_message text,
  unique (provider, provider_event_id)
);

create index if not exists idx_card_transactions_user_date
  on public.card_transactions(user_id, purchase_date desc);
create index if not exists idx_card_transactions_card_date
  on public.card_transactions(card_id, purchase_date desc);
create index if not exists idx_card_bills_user_due
  on public.card_bills(user_id, due_date);
create index if not exists idx_card_bills_card_closing
  on public.card_bills(card_id, closing_date desc);
create index if not exists idx_card_installments_bill
  on public.card_installments(bill_id, user_id);
create index if not exists idx_card_installments_card
  on public.card_installments(card_id, user_id);
create index if not exists idx_card_alert_events_unread
  on public.card_alert_events(user_id, created_at desc)
  where read_at is null;
create index if not exists idx_open_finance_connections_user
  on public.open_finance_connections(user_id, provider);

alter table public.cards enable row level security;
alter table public.card_transactions enable row level security;
alter table public.card_bills enable row level security;
alter table public.card_installments enable row level security;
alter table public.card_alert_events enable row level security;
alter table public.open_finance_connections enable row level security;
alter table public.open_finance_webhook_events enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'cards', 'card_transactions', 'card_bills', 'card_installments',
        'card_alert_events', 'open_finance_connections', 'open_finance_webhook_events'
      )
  loop
    execute format(
      'drop policy %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end;
$$;

create policy "Users manage their cards"
  on public.cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users read their card transactions"
  on public.card_transactions for select
  using (auth.uid() = user_id);
create policy "Users read their card bills"
  on public.card_bills for select
  using (auth.uid() = user_id);
create policy "Users read their card installments"
  on public.card_installments for select
  using (auth.uid() = user_id);
create policy "Users read and update their card alerts"
  on public.card_alert_events for select
  using (auth.uid() = user_id);
create policy "Users mark their card alerts as read"
  on public.card_alert_events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users read their Open Finance connections"
  on public.open_finance_connections for select
  using (auth.uid() = user_id);

revoke all on public.card_transactions, public.card_bills, public.card_installments,
  public.card_alert_events, public.open_finance_connections,
  public.open_finance_webhook_events from public, anon, authenticated;
grant select, insert, update, delete on public.cards to authenticated;
grant select on public.card_transactions, public.card_bills, public.card_installments,
  public.card_alert_events, public.open_finance_connections to authenticated;
grant update (read_at) on public.card_alert_events to authenticated;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.sync_legacy_card_due_day()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  card_row jsonb := to_jsonb(new);
  old_card_row jsonb;
  due_day_value jsonb;
  payment_day_value jsonb;
begin
  if tg_op = 'UPDATE' then
    old_card_row := to_jsonb(old);
    due_day_value := card_row -> 'due_day';
    payment_day_value := card_row -> 'payment_day';

    if payment_day_value is distinct from old_card_row -> 'payment_day'
       and due_day_value is not distinct from old_card_row -> 'due_day' then
      card_row := jsonb_set(card_row, '{due_day}', payment_day_value, true);
    elsif due_day_value is distinct from old_card_row -> 'due_day'
       and payment_day_value is not distinct from old_card_row -> 'payment_day' then
      card_row := jsonb_set(card_row, '{payment_day}', due_day_value, true);
    end if;
  else
    due_day_value := card_row -> 'due_day';
    payment_day_value := card_row -> 'payment_day';

    if due_day_value is null or due_day_value = 'null'::jsonb then
      card_row := jsonb_set(card_row, '{due_day}', payment_day_value, true);
    elsif payment_day_value is null or payment_day_value = 'null'::jsonb then
      card_row := jsonb_set(card_row, '{payment_day}', due_day_value, true);
    elsif due_day_value is distinct from payment_day_value then
      card_row := jsonb_set(card_row, '{payment_day}', due_day_value, true);
    end if;
  end if;

  new := jsonb_populate_record(new, card_row);
  return new;
end;
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cards'
      and column_name = 'due_day'
  ) then
    alter table public.cards alter column due_day drop default;
    drop trigger if exists sync_legacy_card_due_day on public.cards;
    create trigger sync_legacy_card_due_day
      before insert or update on public.cards
      for each row execute function private.sync_legacy_card_due_day();
  end if;
end;
$$;

create or replace function private.card_cycle_dates(
  p_purchase_date date,
  p_closing_day integer,
  p_payment_day integer,
  p_installment_offset integer
)
returns table (closing_date date, due_date date)
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_close_month date := date_trunc('month', p_purchase_date)::date;
  v_due_month date;
  v_close_day integer;
  v_due_day integer;
begin
  v_close_day := least(
    p_closing_day::integer,
    extract(day from (v_close_month + interval '1 month - 1 day'))::integer
  );
  if p_purchase_date > (v_close_month + (v_close_day - 1)) then
    v_close_month := (v_close_month + interval '1 month')::date;
  end if;

  v_close_month := (v_close_month + make_interval(months => p_installment_offset))::date;
  v_close_day := least(
    p_closing_day::integer,
    extract(day from (v_close_month + interval '1 month - 1 day'))::integer
  );
  closing_date := v_close_month + (v_close_day - 1);

  v_due_month := v_close_month;
  if p_payment_day <= p_closing_day then
    v_due_month := (v_due_month + interval '1 month')::date;
  end if;
  v_due_day := least(
    p_payment_day::integer,
    extract(day from (v_due_month + interval '1 month - 1 day'))::integer
  );
  due_date := v_due_month + (v_due_day - 1);
  return next;
end;
$$;

insert into public.card_bills (user_id, card_id, closing_date, due_date, opening_balance)
select c.user_id, c.id, cycle.closing_date, cycle.due_date, c.current_usage
from public.cards c
cross join lateral private.card_cycle_dates(
  current_date,
  c.closing_day,
  c.payment_day,
  0
) as cycle
where not c.opening_balance_imported
  and c.current_usage > 0
on conflict (user_id, card_id, closing_date)
do update set opening_balance = greatest(
  card_bills.opening_balance,
  excluded.opening_balance
);

update public.cards
set opening_balance_imported = true
where not opening_balance_imported;

create or replace function private.refresh_card_usage(p_card_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.card_bills
  set status = case
        when due_date < current_date then 'overdue'
        when closing_date <= current_date then 'closed'
        else 'open'
      end,
      updated_at = now()
  where user_id = p_user_id
    and card_id = p_card_id
    and status <> 'paid'
    and status is distinct from case
      when due_date < current_date then 'overdue'
      when closing_date <= current_date then 'closed'
      else 'open'
    end;

  update public.cards c
  set current_usage = coalesce((
    select sum(balance.amount)
    from (
      select b.opening_balance as amount
      from public.card_bills b
      where b.card_id = c.id
        and b.user_id = p_user_id
        and b.status <> 'paid'
      union all
      select i.amount
      from public.card_installments i
      join public.card_bills b
        on b.id = i.bill_id and b.user_id = i.user_id and b.card_id = i.card_id
      where i.card_id = c.id
        and i.user_id = p_user_id
        and b.status <> 'paid'
    ) balance
  ), 0),
  updated_at = now()
  where c.id = p_card_id
    and c.user_id = p_user_id;

  insert into public.card_alert_events (
    user_id, card_id, bill_id, alert_type, threshold, dedupe_key, title, message
  )
  select
    p_user_id,
    c.id,
    null,
    'limit_threshold',
    threshold.value,
    'limit:' || c.id::text || ':' || to_char(date_trunc('month', current_date), 'YYYY-MM') || ':' || threshold.value::text,
    'Limite do cartão em ' || threshold.value::text || '%',
    c.name || ' atingiu ' || threshold.value::text || '% do limite total.'
  from public.cards c
  cross join lateral unnest(c.alert_thresholds) as threshold(value)
  where c.id = p_card_id
    and c.user_id = p_user_id
    and c.limit_amount > 0
    and coalesce((
      select sum(balance.amount)
      from (
        select b.opening_balance as amount
        from public.card_bills b
        where b.card_id = c.id
          and b.user_id = p_user_id
          and b.status <> 'paid'
        union all
        select i.amount
        from public.card_installments i
        join public.card_bills b
          on b.id = i.bill_id and b.user_id = i.user_id and b.card_id = i.card_id
        where i.card_id = c.id
          and i.user_id = p_user_id
          and b.status <> 'paid'
      ) balance
    ), 0) >= c.limit_amount * threshold.value / 100
  on conflict (dedupe_key) do nothing;

  insert into public.card_alert_events (
    user_id, card_id, bill_id, alert_type, dedupe_key, title, message
  )
  select
    p_user_id,
    c.id,
    b.id,
    'due_date',
    'due:' || b.id::text,
    case when b.due_date < current_date then 'Fatura vencida' else 'Fatura próxima do vencimento' end,
    case when b.due_date < current_date
      then c.name || ' está vencida desde ' || to_char(b.due_date, 'DD/MM/YYYY') || '.'
      else c.name || ' vence em ' || to_char(b.due_date, 'DD/MM/YYYY') || '.'
    end
  from public.cards c
  join public.card_bills b on b.card_id = c.id and b.user_id = c.user_id
  where c.id = p_card_id
    and c.user_id = p_user_id
    and b.status <> 'paid'
    and b.due_date between current_date - 30 and current_date + c.due_alert_days
  on conflict (dedupe_key) do nothing;

  insert into public.card_alert_events (
    user_id, card_id, alert_type, dedupe_key, title, message
  )
  select
    p_user_id,
    c.id,
    'spending_increase',
    'spending:' || c.id::text || ':' || to_char(date_trunc('month', current_date), 'YYYY-MM'),
    'Aumento nos gastos do cartão',
    c.name || ' teve um aumento de pelo menos 30% em relação ao mês anterior.'
  from public.cards c
  where c.id = p_card_id
    and c.user_id = p_user_id
    and c.alert_spending_increase
    and (
      select coalesce(sum(t.amount), 0)
      from public.card_transactions t
      where t.card_id = c.id
        and t.user_id = p_user_id
        and t.purchase_date >= date_trunc('month', current_date)::date
        and t.purchase_date < (date_trunc('month', current_date) + interval '1 month')::date
    ) >= (
      select coalesce(sum(t.amount), 0) * 1.3
      from public.card_transactions t
      where t.card_id = c.id
        and t.user_id = p_user_id
        and t.purchase_date >= (date_trunc('month', current_date) - interval '1 month')::date
        and t.purchase_date < date_trunc('month', current_date)::date
    )
    and exists (
      select 1
      from public.card_transactions t
      where t.card_id = c.id
        and t.user_id = p_user_id
        and t.purchase_date >= (date_trunc('month', current_date) - interval '1 month')::date
        and t.purchase_date < date_trunc('month', current_date)::date
    )
  on conflict (dedupe_key) do nothing;
end;
$$;

create or replace function private.rebuild_card_installments(
  p_transaction_id uuid,
  p_user_id uuid,
  p_amount numeric,
  p_purchase_date date,
  p_installments_count smallint
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_card_id uuid;
  v_closing_day smallint;
  v_payment_day smallint;
  v_total_cents bigint;
  v_base_cents bigint;
  v_remainder bigint;
  v_installment integer;
  v_cycle record;
  v_bill_id uuid;
  v_bill_status text;
  v_old_bill_ids uuid[];
begin
  select t.card_id, c.closing_day, c.payment_day
  into v_card_id, v_closing_day, v_payment_day
  from public.card_transactions t
  join public.cards c on c.id = t.card_id and c.user_id = t.user_id
  where t.id = p_transaction_id and t.user_id = p_user_id
  for update of t;

  if v_card_id is null then
    raise exception 'Cartão ou compra não encontrado.';
  end if;
  if p_amount <= 0 or p_amount > 9999999999.99 then
    raise exception 'O valor da compra deve ser positivo e válido.';
  end if;
  if p_installments_count not between 1 and 48 then
    raise exception 'A quantidade de parcelas deve estar entre 1 e 48.';
  end if;
  if p_purchase_date > current_date then
    raise exception 'A data da compra não pode estar no futuro.';
  end if;

  select coalesce(array_agg(distinct i.bill_id), array[]::uuid[])
  into v_old_bill_ids
  from public.card_installments i
  where i.card_transaction_id = p_transaction_id
    and i.user_id = p_user_id;

  if exists (
    select 1
    from public.card_installments i
    join public.card_bills b
      on b.id = i.bill_id and b.user_id = i.user_id and b.card_id = i.card_id
    where i.card_transaction_id = p_transaction_id
      and i.user_id = p_user_id
      and b.status = 'paid'
  ) then
    raise exception 'Não é possível alterar uma compra que pertence a uma fatura paga.';
  end if;

  delete from public.card_installments
  where card_transaction_id = p_transaction_id
    and user_id = p_user_id;

  delete from public.card_bills b
  where b.id = any(v_old_bill_ids)
    and b.status <> 'paid'
    and b.opening_balance = 0
    and not exists (
      select 1 from public.card_installments i
      where i.bill_id = b.id and i.user_id = p_user_id
    );

  v_total_cents := round(p_amount * 100)::bigint;
  v_base_cents := v_total_cents / p_installments_count;
  v_remainder := v_total_cents % p_installments_count;

  for v_installment in 1..p_installments_count loop
    select *
    into v_cycle
    from private.card_cycle_dates(
      p_purchase_date,
      v_closing_day,
      v_payment_day,
      v_installment - 1
    );

    insert into public.card_bills (user_id, card_id, closing_date, due_date)
    values (p_user_id, v_card_id, v_cycle.closing_date, v_cycle.due_date)
    on conflict (user_id, card_id, closing_date) do nothing;

    select b.id, b.status
    into v_bill_id, v_bill_status
    from public.card_bills b
    where b.user_id = p_user_id
      and b.card_id = v_card_id
      and b.closing_date = v_cycle.closing_date;

    if v_bill_status = 'paid' then
      raise exception 'Não é possível registrar parcelas em uma fatura já paga.';
    end if;

    insert into public.card_installments (
      user_id, card_id, card_transaction_id, bill_id, installment_number, amount
    )
    values (
      p_user_id,
      v_card_id,
      p_transaction_id,
      v_bill_id,
      v_installment,
      (v_base_cents + case when v_installment <= v_remainder then 1 else 0 end)::numeric / 100
    );
  end loop;

  perform private.refresh_card_usage(v_card_id, p_user_id);
end;
$$;

create or replace function public.create_card_purchase(
  p_request_id uuid,
  p_card_id uuid,
  p_title text,
  p_amount numeric,
  p_purchase_date date,
  p_category text,
  p_installments_count smallint,
  p_notes text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_card_id uuid;
  v_transaction_id uuid;
begin
  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;
  if p_request_id is null then
    raise exception 'Identificador da requisição inválido.';
  end if;
  select id
  into v_transaction_id
  from public.card_transactions
  where user_id = v_user_id
    and request_id = p_request_id;
  if v_transaction_id is not null then
    return v_transaction_id;
  end if;
  if p_title is null or length(btrim(p_title)) not between 1 and 120 then
    raise exception 'A descrição deve ter entre 1 e 120 caracteres.';
  end if;
  if p_category is null or p_category not in (
    'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Compras',
    'Assinaturas', 'Lazer', 'Moradia', 'Outros'
  ) then
    raise exception 'Categoria de compra inválida.';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 9999999999.99 then
    raise exception 'O valor da compra deve ser positivo e válido.';
  end if;
  if p_purchase_date is null or p_purchase_date > current_date then
    raise exception 'A data da compra deve ser válida e não pode estar no futuro.';
  end if;
  if p_installments_count is null or p_installments_count not between 1 and 48 then
    raise exception 'A quantidade de parcelas deve estar entre 1 e 48.';
  end if;
  if p_notes is not null and length(p_notes) > 500 then
    raise exception 'As observações devem ter até 500 caracteres.';
  end if;
  select c.id
  into v_card_id
  from public.cards c
    where c.id = p_card_id
      and c.user_id = v_user_id
      and c.is_active
      and not c.is_archived
      and c.network = 'credit'
  for update;
  if v_card_id is null then
    raise exception 'Cartão de crédito não encontrado ou indisponível.';
  end if;

  insert into public.card_transactions (
    user_id, card_id, request_id, title, amount, purchase_date,
    category, installments_count, notes
  )
  values (
    v_user_id, p_card_id, p_request_id, btrim(p_title), p_amount,
    p_purchase_date, p_category, p_installments_count, coalesce(p_notes, '')
  )
  on conflict (user_id, request_id) do nothing
  returning id into v_transaction_id;
  if v_transaction_id is null then
    select id
    into v_transaction_id
    from public.card_transactions
    where user_id = v_user_id
      and request_id = p_request_id;
    if v_transaction_id is null then
      raise exception 'Não foi possível confirmar a compra registrada.';
    end if;
    return v_transaction_id;
  end if;

  perform private.rebuild_card_installments(
    v_transaction_id, v_user_id, p_amount, p_purchase_date, p_installments_count
  );

  insert into public.card_alert_events (
    user_id, card_id, alert_type, dedupe_key, title, message
  )
  values (
    v_user_id,
    p_card_id,
    'purchase',
    'purchase:' || v_transaction_id::text,
    'Compra registrada',
    btrim(p_title) || ' foi registrada no cartão.'
  )
  on conflict (dedupe_key) do nothing;

  return v_transaction_id;
end;
$$;

create or replace function public.update_card_billing_days(
  p_card_id uuid,
  p_closing_day smallint,
  p_payment_day smallint
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_card public.cards;
  v_purchase record;
begin
  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;
  if p_closing_day is null or p_closing_day not between 1 and 31
    or p_payment_day is null or p_payment_day not between 1 and 31 then
    raise exception 'Os dias de fechamento e vencimento devem estar entre 1 e 31.';
  end if;

  select *
  into v_card
  from public.cards c
  where c.id = p_card_id
    and c.user_id = v_user_id
  for update;
  if v_card.id is null then
    raise exception 'Cartão não encontrado.';
  end if;
  if v_card.closing_day = p_closing_day and v_card.payment_day = p_payment_day then
    return;
  end if;
  if exists (
    select 1
    from public.card_bills b
    where b.card_id = p_card_id
      and b.user_id = v_user_id
      and (b.status = 'paid' or b.opening_balance > 0)
  ) then
    raise exception 'Não é possível alterar o ciclo após pagamento de fatura ou saldo anterior. Arquive o cartão para preservar o histórico.';
  end if;

  update public.cards
  set closing_day = p_closing_day,
      payment_day = p_payment_day,
      updated_at = now()
  where id = p_card_id
    and user_id = v_user_id;

  for v_purchase in
    select t.id, t.amount, t.purchase_date, t.installments_count
    from public.card_transactions t
    where t.card_id = p_card_id
      and t.user_id = v_user_id
    order by t.created_at
    for update
  loop
    perform private.rebuild_card_installments(
      v_purchase.id,
      v_user_id,
      v_purchase.amount,
      v_purchase.purchase_date,
      v_purchase.installments_count
    );
  end loop;
end;
$$;

create or replace function public.update_card_purchase(
  p_transaction_id uuid,
  p_title text,
  p_amount numeric,
  p_purchase_date date,
  p_category text,
  p_installments_count smallint,
  p_notes text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_card_id uuid;
begin
  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;
  if p_title is null or length(btrim(p_title)) not between 1 and 120 then
    raise exception 'A descrição deve ter entre 1 e 120 caracteres.';
  end if;
  if p_category is null or p_category not in (
    'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Compras',
    'Assinaturas', 'Lazer', 'Moradia', 'Outros'
  ) then
    raise exception 'Categoria de compra inválida.';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 9999999999.99 then
    raise exception 'O valor da compra deve ser positivo e válido.';
  end if;
  if p_purchase_date is null or p_purchase_date > current_date then
    raise exception 'A data da compra deve ser válida e não pode estar no futuro.';
  end if;
  if p_installments_count is null or p_installments_count not between 1 and 48 then
    raise exception 'A quantidade de parcelas deve estar entre 1 e 48.';
  end if;
  if p_notes is not null and length(p_notes) > 500 then
    raise exception 'As observações devem ter até 500 caracteres.';
  end if;

  select t.card_id
  into v_card_id
  from public.card_transactions t
  where t.id = p_transaction_id
    and t.user_id = v_user_id;
  if v_card_id is null then
    raise exception 'Compra não encontrada.';
  end if;
  perform 1
  from public.cards c
  where c.id = v_card_id
    and c.user_id = v_user_id
  for update;

  update public.card_transactions t
  set title = btrim(p_title),
      amount = p_amount,
      purchase_date = p_purchase_date,
      category = p_category,
      installments_count = p_installments_count,
      notes = coalesce(p_notes, ''),
      updated_at = now()
  where t.id = p_transaction_id
    and t.user_id = v_user_id
  returning t.card_id into v_card_id;

  if v_card_id is null then
    raise exception 'Compra não encontrada.';
  end if;

  perform private.rebuild_card_installments(
    p_transaction_id, v_user_id, p_amount, p_purchase_date, p_installments_count
  );

  update public.card_alert_events
  set title = 'Compra registrada',
      message = btrim(p_title) || ' foi registrada no cartão.'
  where dedupe_key = 'purchase:' || p_transaction_id::text
    and user_id = v_user_id;

  return p_transaction_id;
end;
$$;

create or replace function public.delete_card_purchase(p_transaction_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_card_id uuid;
  v_bill_ids uuid[];
begin
  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select t.card_id
  into v_card_id
  from public.card_transactions t
  where t.id = p_transaction_id
    and t.user_id = v_user_id;
  if v_card_id is null then
    raise exception 'Compra não encontrada.';
  end if;
  perform 1
  from public.cards c
  where c.id = v_card_id
    and c.user_id = v_user_id
  for update;
  select t.card_id
  into v_card_id
  from public.card_transactions t
  where t.id = p_transaction_id
    and t.user_id = v_user_id
  for update;
  if v_card_id is null then
    raise exception 'Compra não encontrada.';
  end if;
  if exists (
    select 1
    from public.card_installments i
    join public.card_bills b
      on b.id = i.bill_id and b.user_id = i.user_id and b.card_id = i.card_id
    where i.card_transaction_id = p_transaction_id
      and i.user_id = v_user_id
      and b.status = 'paid'
  ) then
    raise exception 'Não é possível excluir uma compra que pertence a uma fatura paga.';
  end if;

  select coalesce(array_agg(distinct i.bill_id), array[]::uuid[])
  into v_bill_ids
  from public.card_installments i
  where i.card_transaction_id = p_transaction_id
    and i.user_id = v_user_id;

  delete from public.card_transactions
  where id = p_transaction_id
    and user_id = v_user_id;

  delete from public.card_alert_events
  where user_id = v_user_id
    and dedupe_key = 'purchase:' || p_transaction_id::text;

  delete from public.card_bills b
  where b.id = any(v_bill_ids)
    and b.status <> 'paid'
    and b.opening_balance = 0
    and not exists (
      select 1 from public.card_installments i
      where i.bill_id = b.id and i.user_id = v_user_id
    );

  perform private.refresh_card_usage(v_card_id, v_user_id);
end;
$$;

create or replace function public.pay_card_bill(p_bill_id uuid)
returns public.card_bills
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_card_id uuid;
  v_bill public.card_bills;
begin
  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;

  select b.card_id
  into v_card_id
  from public.card_bills b
  where b.id = p_bill_id
    and b.user_id = v_user_id;
  if v_card_id is null then
    raise exception 'Fatura não encontrada.';
  end if;
  perform 1
  from public.cards c
  where c.id = v_card_id
    and c.user_id = v_user_id
  for update;

  update public.card_bills b
  set status = 'paid',
      paid_at = now(),
      updated_at = now()
  where b.id = p_bill_id
    and b.user_id = v_user_id
    and b.status <> 'paid'
  returning b.* into v_bill;

  if v_bill.id is null then
    raise exception 'Fatura não encontrada ou já paga.';
  end if;

  perform private.refresh_card_usage(v_bill.card_id, v_user_id);
  return v_bill;
end;
$$;

create or replace function public.set_favorite_card(p_card_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;
  if not exists (
    select 1
    from public.cards c
    where c.id = p_card_id
      and c.user_id = v_user_id
      and c.is_active
      and not c.is_archived
  ) then
    raise exception 'Cartão não encontrado ou arquivado.';
  end if;
  update public.cards
  set is_favorite = false,
      updated_at = now()
  where user_id = v_user_id
    and is_favorite
    and not is_archived;
  update public.cards
  set is_favorite = true,
      updated_at = now()
  where id = p_card_id
    and user_id = v_user_id;
end;
$$;

create or replace function public.refresh_card_alerts()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_card record;
begin
  if v_user_id is null then
    raise exception 'Usuário não autenticado.';
  end if;
  for v_card in
    select id
    from public.cards
    where user_id = v_user_id
  loop
    perform private.refresh_card_usage(v_card.id, v_user_id);
  end loop;
end;
$$;

create or replace function private.refresh_card_usage_after_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.refresh_card_usage(new.id, new.user_id);
  return new;
end;
$$;

create or replace function private.prevent_card_network_change_with_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.network is distinct from new.network and (
    exists (
      select 1
      from public.card_transactions t
      where t.card_id = old.id
        and t.user_id = old.user_id
    )
    or exists (
      select 1
      from public.card_bills b
      where b.card_id = old.id
        and b.user_id = old.user_id
    )
  ) then
    raise exception 'Não é possível alterar crédito/débito após registrar compras ou faturas. Arquive o cartão para preservar o histórico.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_card_network_change_with_history on public.cards;
create trigger prevent_card_network_change_with_history
  before update of network on public.cards
  for each row execute function private.prevent_card_network_change_with_history();

drop trigger if exists refresh_card_usage_after_card_change on public.cards;
create trigger refresh_card_usage_after_card_change
  after update of limit_amount, alert_thresholds on public.cards
  for each row execute function private.refresh_card_usage_after_update();

revoke all on function private.card_cycle_dates(date, integer, integer, integer) from public, anon, authenticated;
revoke all on function private.sync_legacy_card_due_day() from public, anon, authenticated;
revoke all on function private.refresh_card_usage(uuid, uuid) from public, anon, authenticated;
revoke all on function private.rebuild_card_installments(uuid, uuid, numeric, date, smallint) from public, anon, authenticated;
revoke all on function private.refresh_card_usage_after_update() from public, anon, authenticated;
revoke all on function private.prevent_card_network_change_with_history() from public, anon, authenticated;
revoke all on function public.create_card_purchase(uuid, uuid, text, numeric, date, text, smallint, text) from public, anon;
revoke all on function public.update_card_purchase(uuid, text, numeric, date, text, smallint, text) from public, anon;
revoke all on function public.delete_card_purchase(uuid) from public, anon;
revoke all on function public.pay_card_bill(uuid) from public, anon;
revoke all on function public.set_favorite_card(uuid) from public, anon;
revoke all on function public.refresh_card_alerts() from public, anon;
revoke all on function public.update_card_billing_days(uuid, smallint, smallint) from public, anon;
grant execute on function public.create_card_purchase(uuid, uuid, text, numeric, date, text, smallint, text) to authenticated;
grant execute on function public.update_card_purchase(uuid, text, numeric, date, text, smallint, text) to authenticated;
grant execute on function public.delete_card_purchase(uuid) to authenticated;
grant execute on function public.pay_card_bill(uuid) to authenticated;
grant execute on function public.set_favorite_card(uuid) to authenticated;
grant execute on function public.refresh_card_alerts() to authenticated;
grant execute on function public.update_card_billing_days(uuid, smallint, smallint) to authenticated;

commit;
