import { useCallback, useEffect, useState } from 'react'

import { goalService } from '@/services/goalService'
import { supabase } from '@/services/supabaseClient'

export function useGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadGoals = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError

    const userId = sessionData.session?.user?.id
    if (!userId) return []

    const { data, error: listError } = await goalService.list(userId)
    if (listError) throw listError
    return data
  }, [])

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    try {
      setGoals(await loadGoals())
      setError(null)
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setLoading(false)
    }
  }, [loadGoals])

  useEffect(() => {
    let active = true
    loadGoals().then(
      (data) => {
        if (active) {
          setGoals(data)
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
  }, [loadGoals])

  const saveGoal = useCallback(async (goal, existingId) => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const userId = sessionData.session?.user?.id
    if (!userId) throw new Error('Usuário não autenticado.')

    setLoading(true)
    setError(null)
    try {
      const result = existingId
        ? await goalService.update(existingId, goal)
        : await goalService.create({ ...goal, user_id: userId })
      if (result.error) throw result.error
      if (!result.data) throw new Error('O banco não retornou a meta salva.')

      setGoals((current) => existingId
        ? current.map((item) => item.id === existingId ? result.data : item)
        : [result.data, ...current])
      return result.data
    } catch (saveError) {
      setError(saveError.message || 'Não foi possível salvar a meta.')
      throw saveError
    } finally {
      setLoading(false)
    }
  }, [])

  const removeGoal = useCallback(async (id) => {
    setError(null)
    try {
      const { error: removeError } = await goalService.remove(id)
      if (removeError) throw removeError
      setGoals((current) => current.filter((goal) => goal.id !== id))
    } catch (removeError) {
      setError(removeError.message || 'Não foi possível excluir a meta.')
      throw removeError
    }
  }, [])

  return { goals, loading, error, saveGoal, removeGoal, refresh: fetchGoals }
}
