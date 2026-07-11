import { useCallback, useEffect, useState } from 'react'

import { cardService } from '@/services/cardService'
import { supabase } from '@/services/supabaseClient'

export function useCards() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCards = useCallback(async () => {
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

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id
    if (!userId) {
      setError('Usuário não autenticado')
      setLoading(false)
      return
    }

    const { data, error: createError } = await cardService.create({
      ...cardData,
      user_id: userId,
    })

    if (createError) {
      setError(createError.message)
    } else {
      setCards((current) => [data, ...current])
    }
    setLoading(false)
  }, [])

  const updateCard = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)

    const { data, error: updateError } = await cardService.update(id, updates)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setCards((current) => current.map((item) => (item.id === id ? data : item)))
    setLoading(false)
    return data
  }, [])

  const removeCard = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    const { error: removeError } = await cardService.remove(id)
    if (removeError) {
      setError(removeError.message)
      setLoading(false)
      return
    }

    setCards((current) => current.filter((card) => card.id !== id))
    setLoading(false)
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
