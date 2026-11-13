# Schema do FinanceTrack

O arquivo [`supabase/migrations/20261113130000_production_readiness.sql`](./supabase/migrations/20261113130000_production_readiness.sql) é a fonte oficial e executável do schema e das políticas RLS. Não execute instruções antigas de criação de políticas copiadas de versões anteriores deste documento.

Além das tabelas base já utilizadas pelo app (`profiles`, `transactions`, `categories`, `cards` e `goals`), a migration prepara:

| Tabela | Finalidade |
|---|---|
| `monthly_budgets` | Limite de gastos por categoria e mês |
| `invoices` | Faturas registradas manualmente e vinculadas a cartões |
| `import_batches` | Histórico de importações CSV |

As tabelas financeiras usam `user_id` e políticas RLS para isolar os dados por usuário. A tabela `profiles` permite ao cliente atualizar apenas os campos de perfil autorizados; campos de assinatura não podem ser alterados pelo frontend.

Leia [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) antes de aplicar a migration. A migration não foi aplicada ao banco remoto.
