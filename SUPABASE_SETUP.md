# Configuração do Supabase

## Migration do banco

Use [`supabase/migrations/20261113130000_production_readiness.sql`](./supabase/migrations/20261113130000_production_readiness.sql) como fonte oficial do schema. A migration prepara as tabelas e políticas de acesso usadas pelo app, incluindo perfil, transações, cartões, metas, orçamentos, faturas e histórico de importação.

Antes de executá-la em qualquer ambiente:

1. Faça backup do banco e teste primeiro em um projeto de staging.
2. Confirme que as tabelas existentes `profiles`, `transactions`, `categories`, `cards` e `goals` têm as colunas esperadas pelo app.
3. Confira se `public.invoices` já existe. Se existir, compare seu schema com a migration e reconcilie diferenças antes de prosseguir. A migration para com erro se detectar um schema de faturas incompatível.
4. Revise as políticas RLS resultantes. Elas substituem as políticas antigas do FinanceTrack para essas tabelas.
5. Execute a migration pelo fluxo de migrations do Supabase ou, após revisão, pelo SQL Editor. Não execute o arquivo parcialmente.

A migration ainda não foi aplicada ao projeto remoto. Não habilite o uso em produção até que ela tenha sido revisada, aplicada em staging e os fluxos de autenticação e CRUD tenham sido testados.

## Variáveis de ambiente

No `.env.local`, configure as credenciais públicas do projeto:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Nunca use uma `service_role` key no frontend. Configure também as URLs de redirecionamento de autenticação no painel do Supabase para os domínios de desenvolvimento e produção.

## Recursos temporariamente indisponíveis

- Importação de PDF/imagem de fatura permanece desativada até existir um parser real e validado; a importação suportada atualmente é CSV.
- Novas assinaturas Premium permanecem desativadas até existir um checkout e webhook de pagamento no servidor.
