import { useCallback, useEffect, useState } from 'react'

import { cardService } from '@/services/cardService'
import { supabase } from '@/services/supabaseClient'

export function useCards() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCards = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    setLoading(true)
    setError(null)
    if (sessionError) {
      setError(sessionError.message)
      setLoading(false)
      return
    }

    const userId = sessionData?.session?.user?.id
    if (!userId) {
      setCards([])
      setLoading(false)
      return
    }

    const { data, error: listError } = await cardService.list(userId)
    if (listError) {
      setError(listError.message)
      setCards([])
    } else {
      setCards(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const addCard = useCallback(async (cardData) => {
    setLoading(true)
    setError(null)

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const userId = sessionData?.session?.user?.id
      if (!userId) throw new Error('Usuário não autenticado.')
      const { data, error: createError } = await cardService.create({
        ...cardData,
        user_id: userId,
      })
      if (createError) throw createError
      if (!data) throw new Error('O banco não retornou o cartão salvo.')
      setCards((current) => [data, ...current])
      return data
    } catch (mutationError) {
      setError(mutationError.message || 'Não foi possível salvar o cartão.')
      throw mutationError
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCard = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await cardService.update(id, updates)
      if (updateError) throw updateError
      if (!data) throw new Error('O cartão não foi encontrado ou não pôde ser atualizado.')
      setCards((current) => current.map((item) => (item.id === id ? data : item)))
      return data
    } catch (mutationError) {
      setError(mutationError.message || 'Não foi possível atualizar o cartão.')
      throw mutationError
    } finally {
      setLoading(false)
    }
  }, [])

  const removeCard = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    try {
      const { error: removeError } = await cardService.remove(id)
      if (removeError) throw removeError
      setCards((current) => current.filter((card) => card.id !== id))
    } catch (mutationError) {
      setError(mutationError.message || 'Não foi possível excluir o cartão.')
      throw mutationError
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    cards,
    loading,
    error,
    fetchCards,
    addCard,
    updateCard,
    removeCard,
  }
}
