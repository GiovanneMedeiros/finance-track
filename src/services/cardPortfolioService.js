import { supabase } from '@/services/supabaseClient'
import { cardService } from '@/services/cardService'
import { openFinanceService } from '@/services/openFinanceService'

export const cardPortfolioService = {
  async load(userId) {
    const { error: alertRefreshError } = await supabase.rpc('refresh_card_alerts')
    if (alertRefreshError) throw alertRefreshError
    const [cards, purchases, installments, bills, alerts, connections, importedData] = await Promise.all([
      cardService.list(userId),
      supabase.from('card_transactions').select('*').eq('user_id', userId).order('purchase_date', { ascending: false }),
      supabase.from('card_installments').select('*').eq('user_id', userId).order('installment_number'),
      supabase.from('card_bills').select('*').eq('user_id', userId).order('closing_date', { ascending: false }),
      supabase.from('card_alert_events').select('*').eq('user_id', userId).is('read_at', null).order('created_at', { ascending: false }).limit(50),
      openFinanceService.listConnections(userId),
      openFinanceService.loadImportedData(userId),
    ])
    const responses = [cards, purchases, installments, bills, alerts, connections]
    const failure = responses.find((response) => response.error)
    if (failure) throw failure.error
    return {
      cards: (cards.data ?? []).sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite)),
      purchases: purchases.data ?? [],
      installments: installments.data ?? [],
      bills: bills.data ?? [],
      alerts: alerts.data ?? [],
      connections: connections ?? [],
      ...importedData,
    }
  },

  async createPurchase(purchase) {
    const { data, error } = await supabase.rpc('create_card_purchase', {
      p_request_id: crypto.randomUUID(),
      p_card_id: purchase.card_id,
      p_title: purchase.title,
      p_amount: purchase.amount,
      p_purchase_date: purchase.purchase_date,
      p_category: purchase.category,
      p_installments_count: purchase.installments_count,
      p_notes: purchase.notes ?? '',
    })
    if (error) throw error
    return data
  },

  async updatePurchase(purchase) {
    const { data, error } = await supabase.rpc('update_card_purchase', {
      p_transaction_id: purchase.id,
      p_title: purchase.title,
      p_amount: purchase.amount,
      p_purchase_date: purchase.purchase_date,
      p_category: purchase.category,
      p_installments_count: purchase.installments_count,
      p_notes: purchase.notes ?? '',
    })
    if (error) throw error
    return data
  },

  async deletePurchase(id) {
    const { error } = await supabase.rpc('delete_card_purchase', {
      p_transaction_id: id,
    })
    if (error) throw error
  },

  async payBill(id) {
    const { data, error } = await supabase.rpc('pay_card_bill', {
      p_bill_id: id,
    })
    if (error) throw error
    return data
  },

  async markAlertsRead(userId, ids) {
    if (!ids.length) return
    const { error } = await supabase
      .from('card_alert_events')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('id', ids)
      .is('read_at', null)
    if (error) throw error
  },
}
