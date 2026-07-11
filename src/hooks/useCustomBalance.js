import { useCallback, useEffect, useMemo, useState } from 'react'

import { supabase } from '@/services/supabaseClient'

export function useCustomBalance() {
  const [customBalance, setCustomBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCustomBalance = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      setError(sessionError.message)
      setLoading(false)
      return
    }

    const userId = sessionData?.session?.user?.id
    if (!userId) {
      setCustomBalance(null)
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('custom_balance')
      .eq('id', userId)
      .maybeSingle()

    if (fetchError) {
      console.error('Erro ao buscar custom_balance:', fetchError)
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const balanceValue = data?.custom_balance ?? null
    console.log('Saldo carregado do Supabase:', balanceValue)
    setCustomBalance(balanceValue)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCustomBalance()
  }, [fetchCustomBalance])

  const updateCustomBalance = useCallback(async (newBalance) => {
    setLoading(true)
    setError(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    if (!userId) {
      const err = new Error('Usuário não autenticado')
      setError(err.message)
      setLoading(false)
      throw err
    }

    const numBalance = Number(newBalance)
    console.log('Salvando saldo:', numBalance)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ custom_balance: numBalance })
      .eq('id', userId)

    if (updateError) {
      console.error('Erro ao atualizar custom_balance:', updateError)
      setError(updateError.message)
      setLoading(false)
      throw updateError
    }

    console.log('Saldo salvo com sucesso, refetchando...')
    setCustomBalance(numBalance)
    
    // Refetch para garantir que está sincronizado
    await fetchCustomBalance()
  }, [fetchCustomBalance])

  return {
    customBalance,
    loading,
    error,
    updateCustomBalance,
    fetchCustomBalance,
  }
}
