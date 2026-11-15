import { supabase } from '@/services/supabaseClient'

function mapCard(card) {
  return {
    ...card,
    limit: Number(card.limit_amount ?? 0),
    current_usage: Number(card.current_usage ?? 0),
    due_day: card.payment_day ?? 10,
    last_digits: card.last_digits ?? '',
    notes: card.notes ?? '',
    color: card.color ?? '#34d399',
    is_active: card.is_active ?? true,
  }
}

export const cardService = {
  async list(userId) {
    if (!userId) return { data: [], error: null }
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data: (data ?? []).map(mapCard), error }
  },

  async create(card) {
    const payload = {
      user_id: card.user_id,
      name: card.name,
      bank: card.bank,
      network: card.network || 'credit',
      last_digits: card.last_digits,
      limit_amount: card.limit,
      current_usage: card.current_usage || 0,
      closing_day: card.closing_day || 1,
      payment_day: card.due_day || 10,
      notes: card.notes || '',
      color: card.color || '#34d399',
      is_active: card.is_active !== false,
      card_brand: card.card_brand || 'other',
      cardholder_name: card.cardholder_name || '',
      nickname: card.nickname || '',
      theme_key: card.theme_key || 'custom',
      is_favorite: card.is_favorite === true,
      is_archived: card.is_archived === true,
      alert_thresholds: card.alert_thresholds ?? [50, 70, 90],
      alert_spending_increase: card.alert_spending_increase !== false,
      due_alert_days: card.due_alert_days ?? 5,
      opening_balance_imported: true,
    }

    const { data, error } = await supabase
      .from('cards')
      .insert(payload)
      .select()
      .single()
    return { data: data ? mapCard(data) : null, error }
  },

  async update(id, userId, updates) {
    if (updates.network !== undefined) {
      const { error: networkError } = await supabase
        .from('cards')
        .update({ network: updates.network })
        .eq('id', id)
        .eq('user_id', userId)
      if (networkError) return { data: null, error: networkError }
    }

    if (updates.closing_day !== undefined || updates.due_day !== undefined) {
      const { data: current, error: currentError } = await supabase
        .from('cards')
        .select('closing_day, payment_day')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle()
      if (currentError) return { data: null, error: currentError }
      if (!current) return { data: null, error: null }

      const { error: billingError } = await supabase.rpc('update_card_billing_days', {
        p_card_id: id,
        p_closing_day: updates.closing_day ?? current.closing_day,
        p_payment_day: updates.due_day ?? current.payment_day,
      })
      if (billingError) return { data: null, error: billingError }
    }

    const fields = {
      name: updates.name,
      bank: updates.bank,
      last_digits: updates.last_digits,
      limit_amount: updates.limit,
      notes: updates.notes,
      color: updates.color,
      is_active: updates.is_active,
      card_brand: updates.card_brand,
      cardholder_name: updates.cardholder_name,
      nickname: updates.nickname,
      theme_key: updates.theme_key,
      is_favorite: updates.is_favorite,
      is_archived: updates.is_archived,
      alert_thresholds: updates.alert_thresholds,
      alert_spending_increase: updates.alert_spending_increase,
      due_alert_days: updates.due_alert_days,
    }
    const payload = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    )
    payload.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('cards')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle()
    return { data: data ? mapCard(data) : null, error }
  },

  async remove(id, userId) {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    return { error }
  },
}
