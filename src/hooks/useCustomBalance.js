import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/services/supabaseClient'

export function useCustomBalance() {
  const [customBalance, setCustomBalance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadCustomBalance = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError

    const userId = sessionData?.session?.user?.id
    if (!userId) return null

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('custom_balance')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError) throw fetchError

    return data?.custom_balance ?? null
  }, [])

  const fetchCustomBalance = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const balance = await loadCustomBalance()
      setCustomBalance(balance)
      return balance
    } catch (fetchError) {
      setError(fetchError.message)
      throw fetchError
    } finally {
      setLoading(false)
    }
  }, [loadCustomBalance])

  useEffect(() => {
    let active = true
    loadCustomBalance().then(
      (balance) => {
        if (active) {
          setCustomBalance(balance)
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
  }, [loadCustomBalance])

  const updateCustomBalance = useCallback(async (newBalance) => {
    setLoading(true)
    setError(null)

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const userId = sessionData?.session?.user?.id
      if (!userId) throw new Error('Usuário não autenticado')

      const numBalance = Number(newBalance)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ custom_balance: numBalance })
        .eq('id', userId)
      if (updateError) throw updateError

      setCustomBalance(numBalance)
      await fetchCustomBalance()
    } catch (updateError) {
      setError(updateError.message || 'Não foi possível atualizar o saldo.')
      throw updateError
    } finally {
      setLoading(false)
    }
  }, [fetchCustomBalance])

  return {
    customBalance,
    loading,
    error,
    updateCustomBalance,
    fetchCustomBalance,
  }
}
