import { supabase } from '@/services/supabaseClient'

async function invokeFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) {
    const response = error.context
    if (response instanceof Response) {
      const result = await response.json().catch(() => null)
      if (result?.error) throw new Error(result.error)
    }
    throw error
  }
  if (data?.error) throw new Error(data.error)
  return data
}

export const openFinanceService = {
  getProviders() {
    return [{ id: 'pluggy', name: 'Pluggy', configured: true }]
  },

  async listConnections(userId) {
    const response = await supabase
      .from('open_finance_connections')
      .select('id, provider, institution_name, status, last_synced_at, last_error, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (!response.error) return response.data ?? []
    if (!['42703', 'PGRST204'].includes(response.error.code)) throw response.error

    const legacyResponse = await supabase
      .from('open_finance_connections')
      .select('id, provider, status, last_synced_at, last_error, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (legacyResponse.error) throw legacyResponse.error
    return (legacyResponse.data ?? []).map((connection) => ({ ...connection, institution_name: null }))
  },

  async loadImportedData(userId) {
    const [accounts, transactions, bills] = await Promise.all([
      supabase
        .from('open_finance_accounts')
        .select('id, connection_id, name, marketing_name, brand, last_four_digits, currency, balance, credit_limit, available_limit, balance_due_date, balance_close_date, provider_status, is_active, synced_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name'),
      supabase
        .from('open_finance_transactions')
        .select('id, account_id, description, amount, currency, category, transaction_date, status, transaction_type, credit_card_metadata')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('transaction_date', { ascending: false })
        .limit(100),
      supabase
        .from('open_finance_bill_snapshots')
        .select('id, account_id, amount, currency, due_date, closing_date, status, reported_at')
        .eq('user_id', userId)
        .order('reported_at', { ascending: false }),
    ])
    const failure = [accounts, transactions, bills].find((response) => response.error)
    if (failure?.error) {
      if (['42P01', '42703', 'PGRST204', 'PGRST205'].includes(failure.error.code)) {
        return {
          openFinanceAccounts: [],
          openFinanceTransactions: [],
          openFinanceBills: [],
          openFinanceSchemaError: 'Aplique a migration 20261114170000_pluggy_open_finance.sql no Supabase para habilitar a conexão bancária.',
        }
      }
      throw failure.error
    }
    return {
      openFinanceAccounts: accounts.data ?? [],
      openFinanceTransactions: transactions.data ?? [],
      openFinanceBills: bills.data ?? [],
      openFinanceSchemaError: null,
    }
  },

  async connect() {
    return invokeFunction('pluggy-connect-token', {})
  },

  async syncItem(itemId) {
    return invokeFunction('pluggy-sync', { itemId })
  },

  async syncConnection(connectionId) {
    return invokeFunction('pluggy-sync', { connectionId })
  },

  async disconnect(connectionId) {
    return invokeFunction('pluggy-disconnect', { connectionId })
  },
}
