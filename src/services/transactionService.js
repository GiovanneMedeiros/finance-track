import { supabase } from '@/services/supabaseClient'

export const transactionService = {
  async list(userId) {
    if (!userId) return { data: [], error: null }
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data: data ?? [], error }
  },

  async create(transaction) {
    const payload = {
      user_id: transaction.user_id,
      title: transaction.title,
      description: transaction.description,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      created_at: transaction.created_at,
      ...(transaction.updated_at ? { updated_at: transaction.updated_at } : {}),
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(payload)
      .select()
    return { data: data?.[0] ?? null, error }
  },

  async createMany(transactions) {
    const payload = transactions.map((transaction) => ({
      user_id: transaction.user_id,
      title: transaction.title,
      description: transaction.description,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      created_at: transaction.created_at,
      ...(transaction.updated_at ? { updated_at: transaction.updated_at } : {}),
    }))

    const { data, error } = await supabase
      .from('transactions')
      .insert(payload)
      .select()

    return { data: data ?? [], error }
  },

  async update(id, updates) {
    const payload = {
      title: updates.title,
      description: updates.description,
      type: updates.type,
      category: updates.category,
      amount: updates.amount,
      updated_at: updates.updated_at,
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', id)
      .select()
    return { data: data?.[0] ?? null, error }
  },

  async remove(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    return { error }
  },
}
