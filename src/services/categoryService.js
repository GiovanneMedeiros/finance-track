import { supabase } from '@/services/supabaseClient'

export const categoryService = {
  async list(userId) {
    if (!userId) return { data: [], error: null }
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })
    return { data: data ?? [], error }
  },

  async create(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
    return { data: data?.[0] ?? null, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
    return { data: data?.[0] ?? null, error }
  },

  async remove(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    return { error }
  },
}
