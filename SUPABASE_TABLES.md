# Schema do FinanceTrack

O arquivo [`supabase/migrations/20261113130000_production_readiness.sql`](./supabase/migrations/20261113130000_production_readiness.sql) é a fonte oficial e executável do schema e das políticas RLS. Não execute instruções antigas de criação de políticas copiadas de versões anteriores deste documento.

Para habilitar Meus Cartões, aplique em seguida [`supabase/migrations/20261114130000_credit_cards.sql`](./supabase/migrations/20261114130000_credit_cards.sql). Se essa migration já tiver sido aplicada e `public.cards` também tiver a coluna legada `due_day`, aplique [`supabase/migrations/20261114160000_sync_legacy_card_due_day.sql`](./supabase/migrations/20261114160000_sync_legacy_card_due_day.sql). Para a integração Pluggy, aplique depois [`supabase/migrations/20261114170000_pluggy_open_finance.sql`](./supabase/migrations/20261114170000_pluggy_open_finance.sql). A sequência completa está descrita em [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).

Além das tabelas base já utilizadas pelo app (`profiles`, `transactions`, `categories`, `cards` e `goals`), a migration prepara:

| Tabela | Finalidade |
|---|---|
| `monthly_budgets` | Limite de gastos por categoria e mês |
| `invoices` | Faturas registradas manualmente e vinculadas a cartões |
| `import_batches` | Histórico de importações CSV |
| `card_transactions` | Compras registradas por usuário e cartão |
| `card_installments` | Parcelas associadas aos ciclos de fatura |
| `card_bills` | Faturas por data de fechamento, incluindo saldos anteriores não detalhados |
| `card_alert_events` | Alertas deduplicados de compra, limite, vencimento e aumento de gastos |
| `open_finance_connections` | Conexões Pluggy associadas ao usuário autenticado |
| `open_finance_accounts` | Contas/cartões importados e atributos disponibilizados pelo provedor |
| `open_finance_transactions` | Transações importadas, separadas dos lançamentos manuais |
| `open_finance_bill_snapshots` | Snapshot do saldo e datas reportados pela conta de crédito |
| `open_finance_webhook_events` | Registro privado e idempotente de eventos processados no servidor |

`public.cards` é reaproveitada para os cartões manuais: não é criada uma tabela paralela para esses registros. Contas e transações Pluggy ficam nas tabelas Open Finance e não são somadas às compras manuais. As tabelas importadas permitem leitura apenas pelo próprio usuário via RLS; gravações e webhooks são exclusivos do backend com `service_role`, que nunca é exposta ao cliente.

As tabelas financeiras usam `user_id` e políticas RLS para isolar os dados por usuário. A tabela `profiles` permite ao cliente atualizar apenas os campos de perfil autorizados; campos de assinatura não podem ser alterados pelo frontend. Leia [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) antes de aplicar as migrations e confira o histórico aplicado em cada projeto Supabase.
