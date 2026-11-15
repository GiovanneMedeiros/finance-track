begin;

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

revoke all on function private.sync_legacy_card_due_day()
  from public, anon, authenticated;

commit;
