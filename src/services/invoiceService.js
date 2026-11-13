import { supabase } from '@/services/supabaseClient'

export const invoiceService = {
  async list(userId) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, cards(name, bank)')
      .eq('user_id', userId)
      .order('due_date', { ascending: false })
    return { data: data ?? [], error }
  },

  async create(invoice) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select('*, cards(name, bank)')
      .single()
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('invoices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, cards(name, bank)')
      .single()
    return { data, error }
  },

  async remove(id) {
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    return { error }
  },
}
