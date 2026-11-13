import { supabase } from '@/services/supabaseClient'

export const goalService = {
  async list(userId) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data: data ?? [], error }
  },

  async create(goal) {
    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single()
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async remove(id) {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    return { error }
  },
}
