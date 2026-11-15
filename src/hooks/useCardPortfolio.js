import { useCallback, useEffect, useState } from 'react'

import { cardService } from '@/services/cardService'
import { cardPortfolioService } from '@/services/cardPortfolioService'
import { supabase } from '@/services/supabaseClient'

const EMPTY_PORTFOLIO = {
  cards: [],
  purchases: [],
  installments: [],
  bills: [],
  alerts: [],
  connections: [],
  openFinanceAccounts: [],
  openFinanceTransactions: [],
  openFinanceBills: [],
  openFinanceSchemaError: null,
}

export function useCardPortfolio() {
  const [portfolio, setPortfolio] = useState(EMPTY_PORTFOLIO)
  const [loading, setLoading] = useState(true)
  const [mutating, setMutating] = useState(false)
  const [error, setError] = useState(null)

  const loadPortfolio = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const userId = sessionData.session?.user?.id
    if (!userId) return { userId: null, data: EMPTY_PORTFOLIO }
    return { userId, data: await cardPortfolioService.load(userId) }
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await loadPortfolio()
      setPortfolio(data)
      setError(null)
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar os cartões.')
      throw loadError
    } finally {
      setLoading(false)
    }
  }, [loadPortfolio])

  useEffect(() => {
    let active = true
    loadPortfolio().then(
      ({ data }) => {
        if (active) {
          setPortfolio(data)
          setError(null)
        }
      },
      (loadError) => {
        if (active) setError(loadError.message || 'Não foi possível carregar os cartões.')
      },
    ).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [loadPortfolio])

  const runMutation = useCallback(async (mutation) => {
    setMutating(true)
    setError(null)
    try {
      const result = await mutation()
      const { data } = await loadPortfolio()
      setPortfolio(data)
      return result
    } catch (mutationError) {
      setError(mutationError.message || 'Não foi possível concluir a operação.')
      throw mutationError
    } finally {
      setMutating(false)
    }
  }, [loadPortfolio])

  const saveCard = useCallback((card, existingId) => runMutation(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const userId = sessionData.session?.user?.id
    if (!userId) throw new Error('Usuário não autenticado.')
    if (existingId) {
      const { data, error: updateError } = await cardService.update(existingId, userId, {
        ...card,
        ...(card.is_favorite ? { is_favorite: false } : {}),
      })
      if (updateError) throw updateError
      if (!data) throw new Error('O cartão não foi encontrado.')
      if (card.is_favorite) {
        const { error: favoriteError } = await supabase.rpc('set_favorite_card', { p_card_id: existingId })
        if (favoriteError) throw favoriteError
      }
      return data
    }
    const { data, error: createError } = await cardService.create({
      ...card,
      is_favorite: false,
      user_id: userId,
    })
    if (createError) throw createError
    if (!data) throw new Error('O banco não retornou o cartão salvo.')
    if (card.is_favorite) {
      const { error: favoriteError } = await supabase.rpc('set_favorite_card', { p_card_id: data.id })
      if (favoriteError) throw favoriteError
    }
    return data
  }), [runMutation])

  const updateCard = useCallback((id, updates) => runMutation(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const userId = sessionData.session?.user?.id
    if (!userId) throw new Error('Usuário não autenticado.')
    if (updates.is_favorite === true) {
      const { error: favoriteError } = await supabase.rpc('set_favorite_card', { p_card_id: id })
      if (favoriteError) throw favoriteError
      return
    }
    const { data, error: updateError } = await cardService.update(id, userId, updates)
    if (updateError) throw updateError
    if (!data) throw new Error('O cartão não foi encontrado.')
    return data
  }), [runMutation])

  const deleteCard = useCallback((id) => runMutation(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const userId = sessionData.session?.user?.id
    if (!userId) throw new Error('Usuário não autenticado.')
    const { error: deleteError } = await cardService.remove(id, userId)
    if (deleteError) throw deleteError
  }), [runMutation])

  const savePurchase = useCallback((purchase, existingId) => runMutation(() => (
    existingId
      ? cardPortfolioService.updatePurchase({ ...purchase, id: existingId })
      : cardPortfolioService.createPurchase(purchase)
  )), [runMutation])

  const deletePurchase = useCallback((id) => runMutation(() => (
    cardPortfolioService.deletePurchase(id)
  )), [runMutation])

  const payBill = useCallback((id) => runMutation(() => (
    cardPortfolioService.payBill(id)
  )), [runMutation])

  const markAlertsRead = useCallback(() => runMutation(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const userId = sessionData.session?.user?.id
    if (!userId) throw new Error('Usuário não autenticado.')
    await cardPortfolioService.markAlertsRead(userId, portfolio.alerts.map((alert) => alert.id))
  }), [portfolio.alerts, runMutation])

  return {
    ...portfolio,
    loading,
    mutating,
    error,
    refresh,
    saveCard,
    updateCard,
    deleteCard,
    savePurchase,
    deletePurchase,
    payBill,
    markAlertsRead,
  }
}
