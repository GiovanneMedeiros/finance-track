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
    }

    const { data, error } = await supabase
      .from('cards')
      .insert(payload)
      .select()
    return { data: data?.[0] ? mapCard(data[0]) : null, error }
  },

  async update(id, updates) {
    const payload = {
      name: updates.name,
      bank: updates.bank,
      network: updates.network,
      last_digits: updates.last_digits,
      limit_amount: updates.limit,
      current_usage: updates.current_usage,
      closing_day: updates.closing_day,
      payment_day: updates.due_day,
      notes: updates.notes,
      color: updates.color,
      is_active: updates.is_active,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('cards')
      .update(payload)
      .eq('id', id)
      .select()
    return { data: data?.[0] ? mapCard(data[0]) : null, error }
  },

  async remove(id) {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
    return { error }
  },
}
