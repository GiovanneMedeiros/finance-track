import { supabase } from '@/services/supabaseClient'

export const monthlyBudgetService = {
  async list(userId, month) {
    const { data, error } = await supabase
      .from('monthly_budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .order('category')
    return { data: data ?? [], error }
  },

  async save(budget) {
    const { data, error } = await supabase
      .from('monthly_budgets')
      .upsert({ ...budget, updated_at: new Date().toISOString() }, {
        onConflict: 'user_id,month,category',
      })
      .select()
      .single()
    return { data, error }
  },
}
