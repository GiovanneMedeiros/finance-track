# Configuração do Supabase

## Migration do banco

Use [`supabase/migrations/20261113130000_production_readiness.sql`](./supabase/migrations/20261113130000_production_readiness.sql) como fonte oficial do schema. A migration prepara as tabelas e políticas de acesso usadas pelo app, incluindo perfil, transações, cartões, metas, orçamentos, faturas e histórico de importação.

Para habilitar **Meus Cartões**, aplique depois [`supabase/migrations/20261114130000_credit_cards.sql`](./supabase/migrations/20261114130000_credit_cards.sql). Ela reutiliza `public.cards` e cria compras, parcelas, ciclos de fatura, alertas e as estruturas iniciais de Open Finance. Se essa migration já foi aplicada, aplique também [`supabase/migrations/20261114160000_sync_legacy_card_due_day.sql`](./supabase/migrations/20261114160000_sync_legacy_card_due_day.sql) para sincronizar o campo legado `due_day` com `payment_day`.

Para a integração Pluggy, aplique [`supabase/migrations/20261114170000_pluggy_open_finance.sql`](./supabase/migrations/20261114170000_pluggy_open_finance.sql) depois das migrations anteriores. Ela cria tabelas isoladas para contas, transações e snapshots de saldo, com RLS de leitura por usuário e gravação somente pelas Edge Functions. A sequência é: `20261113130000_production_readiness.sql`, `20261114130000_credit_cards.sql`, `20261114160000_sync_legacy_card_due_day.sql` (quando aplicável) e `20261114170000_pluggy_open_finance.sql`. Aplique somente migrations ainda pendentes no projeto; não execute arquivos parcialmente.

Antes de executá-la em qualquer ambiente:

1. Faça backup do banco e teste primeiro em um projeto de staging.
2. Confirme que as tabelas existentes `profiles`, `transactions`, `categories`, `cards` e `goals` têm as colunas esperadas pelo app.
3. A migration reconhece o schema legado de `public.invoices` com `period_month`, `period_year` e `total`: preserva essas colunas, migra os valores para `reference_month` e `amount` e mantém os dois formatos sincronizados. Se a tabela tiver outro formato, a migration para com erro; não apague nem altere dados para contornar isso.
4. Revise as políticas RLS resultantes. Elas substituem as políticas antigas do FinanceTrack para essas tabelas.
5. Execute as migrations, nessa ordem, pelo fluxo de migrations do Supabase ou, após revisão, pelo SQL Editor. Não execute arquivos parcialmente.

As migrations foram testadas no staging durante esta implementação, incluindo a migration de compatibilidade legada quando necessária. Confirme e aplique, em cada ambiente, apenas as migrations pendentes; não habilite produção até que os fluxos de autenticação, isolamento multiusuário e CRUD tenham sido validados também no ambiente de produção após a aplicação. A migration de cartões preserva o saldo utilizado já existente como saldo de abertura não detalhado por compras.

Para manter as faturas históricas consistentes, o sistema bloqueia a troca de crédito/débito quando já há compras/faturas e bloqueia a alteração do ciclo após uma fatura paga ou com saldo de abertura pendente. Nesses casos, arquive o cartão e cadastre outro com os dados corretos.

## Variáveis de ambiente

No `.env.local`, configure as credenciais públicas do projeto:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Nunca use uma `service_role` key no frontend. Configure também as URLs de redirecionamento de autenticação no painel do Supabase para os domínios de desenvolvimento e produção.

## Pluggy Open Finance

A aplicação usa Supabase Edge Functions como backend. O Client Secret e a API Key da Pluggy nunca devem ser colocados em `.env.local`, em variáveis `VITE_*` ou no navegador. Revogue qualquer Client Secret que já tenha sido exposto e gere um novo no Dashboard da Pluggy.

No Supabase Dashboard, em **Edge Functions → Secrets**, configure:

- `PLUGGY_CLIENT_ID`: Client ID da aplicação FinanceTrack no Dashboard Pluggy.
- `PLUGGY_CLIENT_SECRET`: Client Secret novo, mantido somente no servidor.
- `PLUGGY_WEBHOOK_SECRET`: segredo aleatório forte usado no header privado do webhook.
- `PLUGGY_WEBHOOK_SETUP_SECRET`: segredo aleatório independente para autorizar o cadastro inicial do webhook.
- `PLUGGY_RECONCILE_SECRET`: segredo aleatório independente para chamar a rotina agendada de reconciliação.
- `FINANCETRACK_APP_ORIGIN`: origem exata do frontend publicado, incluindo `https://` e sem `/` no final.
- `PLUGGY_INCLUDE_SANDBOX`: defina `true` apenas no ambiente de desenvolvimento/staging; mantenha ausente ou `false` em produção.

O Supabase injeta `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` nas Edge Functions. Nunca configure a `service_role` no frontend.

Depois de aplicar a migration e configurar os secrets, publique as funções a partir da raiz do repositório, informando o ref do projeto:

```sh
supabase functions deploy pluggy-connect-token --project-ref <project-ref>
supabase functions deploy pluggy-sync --project-ref <project-ref>
supabase functions deploy pluggy-disconnect --project-ref <project-ref>
supabase functions deploy pluggy-webhook --project-ref <project-ref>
supabase functions deploy pluggy-register-webhook --project-ref <project-ref>
supabase functions deploy pluggy-reconcile --project-ref <project-ref>
```

`pluggy-webhook`, `pluggy-register-webhook` e `pluggy-reconcile` desabilitam a verificação JWT no gateway porque usam, respectivamente, o segredo próprio do webhook ou o segredo de setup/reconciliação. A função de setup só pode ser chamada com `PLUGGY_WEBHOOK_SETUP_SECRET`. Cadastre o webhook uma vez, depois de publicar as funções e configurar os secrets:

```sh
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/pluggy-register-webhook' \
  -H 'x-ft-webhook-setup-secret: <PLUGGY_WEBHOOK_SETUP_SECRET>'
```

Salve o `webhookId` retornado como secret `PLUGGY_WEBHOOK_ID` no Supabase. A função então recusará uma segunda criação acidental. A Pluggy enviará eventos autenticados por `PLUGGY_WEBHOOK_SECRET`; eventos repetidos são deduplicados. Programe também chamadas `POST` autenticadas a `/functions/v1/pluggy-reconcile` com o header `x-ft-reconcile-secret: <PLUGGY_RECONCILE_SECRET>` (por exemplo, a cada 6 horas) usando um agendador HTTPS. A reconciliação não substitui o botão **Atualizar dados**.

Para validar no Sandbox:

1. Use secrets da aplicação FinanceTrack criada no ambiente Development da Pluggy.
2. Configure `PLUGGY_INCLUDE_SANDBOX=true` somente no projeto de staging/desenvolvimento e publique as funções.
3. Abra **Meus Cartões → Conectar banco** e escolha uma instituição Sandbox no Pluggy Connect. Use as credenciais de teste descritas na documentação oficial da Pluggy; não reutilize `itemId` da Demo App.
4. Após autorizar, confirme que a instituição e os cartões aparecem na tela. Verifique a sincronização manual e os webhooks; a disponibilidade de limite, datas e transações depende dos dados realmente devolvidos pelo conector.
5. Confira o isolamento com outra conta FinanceTrack antes de produção.

As transações Open Finance ficam separadas das compras manuais. O saldo atual informado pela conta pode ser mostrado como snapshot, mas não representa uma fatura histórica detalhada. Se o conector não fornecer datas ou limites, o FinanceTrack os deixa como não informados; não calcula nem inventa faturas. Desconectar revoga o item na Pluggy e apaga, em cascata, os dados importados daquela conexão.

## Recursos temporariamente indisponíveis

- Importação de PDF/imagem de fatura permanece desativada até existir um parser real e validado; a importação suportada atualmente é CSV.
- Novas assinaturas Premium permanecem desativadas até existir um checkout e webhook de pagamento no servidor.
- A integração Pluggy exige os secrets, a migration, o deploy das Edge Functions, o cadastro do webhook e a validação do Sandbox descritos acima. A disponibilidade de produtos, transações, limites e datas continua sujeita ao conector e ao consentimento concedido pelo usuário.
