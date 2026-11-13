import { useCallback, useEffect, useState } from 'react'

import { monthlyBudgetService } from '@/services/monthlyBudgetService'
import { supabase } from '@/services/supabaseClient'

export function useMonthlyBudgets(month) {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadBudgets = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const userId = sessionData.session?.user?.id
    if (!userId) return []
    const { data, error: listError } = await monthlyBudgetService.list(userId, month)
    if (listError) throw listError
    return data
  }, [month])

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    try {
      setBudgets(await loadBudgets())
      setError(null)
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setLoading(false)
    }
  }, [loadBudgets])

  useEffect(() => {
    let active = true
    loadBudgets().then(
      (data) => {
        if (active) {
          setBudgets(data)
          setError(null)
        }
      },
      (fetchError) => {
        if (active) setError(fetchError.message)
      },
    ).finally(() => {
      if (active) setLoading(false)
    })

    return () => {
      active = false
    }
  }, [loadBudgets])

  const saveBudget = useCallback(async (category, amount) => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const userId = sessionData.session?.user?.id
    if (!userId) throw new Error('Usuário não autenticado.')

    const { data, error: saveError } = await monthlyBudgetService.save({
      user_id: userId,
      month,
      category,
      amount: Number(amount),
    })
    if (saveError) {
      setError(saveError.message)
      throw saveError
    }
    setBudgets((current) => [
      ...current.filter((budget) => budget.category !== category),
      data,
    ])
    setError(null)
  }, [month])

  return { budgets, loading, error, saveBudget, refresh: fetchBudgets }
}
