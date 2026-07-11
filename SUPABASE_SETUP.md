# Supabase Setup

## Tabela `profiles`

Execute o SQL abaixo no SQL Editor do Supabase:

```sql
create table if not exists profiles (
  id uuid primary key,
  email text,
  plan text not null default 'free',
  subscription_status text not null default 'inactive',
  subscription_expires_at timestamptz null,
  updated_at timestamptz not null default now()
);

alter table profiles
  enable row level security;

create policy "Users can read their profile" on profiles
  for select
  using (auth.uid() = id);

create policy "Users can manage their profile" on profiles
  for insert, update, delete
  with check (auth.uid() = id);
```

## Observações

- O campo `id` deve ser igual ao UUID do usuário do Supabase Auth.
- `plan` deve ser `free` ou `premium`.
- `subscription_status` deve ser `active` ou `inactive`.
- `subscription_expires_at` deve ser um timestamp UTC.

## Variáveis de ambiente

No seu `.env.local`, adicione:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Próximos passos

1. Configure autenticação no painel Supabase.
2. Teste login e cadastro.
3. Crie o endpoint de webhook / pagamento do Mercado Pago.
