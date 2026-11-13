import { supabase } from '@/services/supabaseClient'

export const importBatchService = {
  async list(userId) {
    const { data, error } = await supabase
      .from('import_batches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    return { data: data ?? [], error }
  },

  async create(batch) {
    const { data, error } = await supabase
      .from('import_batches')
      .insert(batch)
      .select()
      .single()
    return { data, error }
  },
}
