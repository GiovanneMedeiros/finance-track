import { supabase } from '@/services/supabaseClient'

export const cardService = {
  async list(userId) {
    if (!userId) return { data: [], error: null }
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data: data ?? [], error }
  },

  async create(card) {
    const payload = {
      user_id: card.user_id,
      name: card.name,
      bank: card.bank,
      last_digits: card.last_digits,
      limit: card.limit,
      current_usage: card.current_usage || 0,
      closing_day: card.closing_day || 1,
      due_day: card.due_day || 10,
      notes: card.notes || '',
      color: card.color || '#34d399',
      is_active: card.is_active !== false,
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('cards')
      .insert(payload)
      .select()
    return { data: data?.[0] ?? null, error }
  },

  async update(id, updates) {
    const payload = {
      name: updates.name,
      bank: updates.bank,
      last_digits: updates.last_digits,
      limit: updates.limit,
      current_usage: updates.current_usage,
      closing_day: updates.closing_day,
      due_day: updates.due_day,
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
    return { data: data?.[0] ?? null, error }
  },

  async remove(id) {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
    return { error }
  },
}
