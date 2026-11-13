import { useCallback, useEffect, useState } from 'react'

import { categoryService } from '@/services/categoryService'
import { supabase } from '@/services/supabaseClient'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    setLoading(true)
    setError(null)
    if (sessionError) {
      setError(sessionError.message)
      setCategories([])
      setLoading(false)
      return
    }

    const userId = sessionData?.session?.user?.id
    if (!userId) {
      setCategories([])
      setLoading(false)
      return
    }

    const { data, error: listError } = await categoryService.list(userId)
    if (listError) {
      setError(listError.message)
      setCategories([])
    } else {
      setCategories(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const addCategory = useCallback(async (category) => {
    setLoading(true)
    setError(null)

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const userId = sessionData?.session?.user?.id
      if (!userId) throw new Error('Usuário não autenticado.')
      const { data, error: createError } = await categoryService.create({
        ...category,
        user_id: userId,
      })
      if (createError) throw createError
      if (!data) throw new Error('O banco não retornou a categoria salva.')
      setCategories((current) => [...current, data])
      return data
    } catch (mutationError) {
      setError(mutationError.message || 'Não foi possível salvar a categoria.')
      throw mutationError
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCategory = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await categoryService.update(id, updates)
      if (updateError) throw updateError
      if (!data) throw new Error('A categoria não foi encontrada ou não pôde ser atualizada.')
      setCategories((current) => current.map((item) => (item.id === id ? data : item)))
      return data
    } catch (mutationError) {
      setError(mutationError.message || 'Não foi possível atualizar a categoria.')
      throw mutationError
    } finally {
      setLoading(false)
    }
  }, [])

  const removeCategory = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    try {
      const { error: removeError } = await categoryService.remove(id)
      if (removeError) throw removeError
      setCategories((current) => current.filter((category) => category.id !== id))
    } catch (mutationError) {
      setError(mutationError.message || 'Não foi possível excluir a categoria.')
      throw mutationError
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    removeCategory,
  }
}
