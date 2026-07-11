import { useCallback, useEffect, useState } from 'react'

import { categoryService } from '@/services/categoryService'
import { supabase } from '@/services/supabaseClient'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
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

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id
    if (!userId) {
      setError('Usuário não autenticado')
      setLoading(false)
      return
    }

    const { data, error: createError } = await categoryService.create({
      ...category,
      user_id: userId,
      created_at: new Date().toISOString(),
    })

    if (createError) {
      setError(createError.message)
    } else {
      setCategories((current) => [...current, data])
    }
    setLoading(false)
  }, [])

  const updateCategory = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)

    const { data, error: updateError } = await categoryService.update(id, updates)
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setCategories((current) => current.map((item) => (item.id === id ? data : item)))
    setLoading(false)
    return data
  }, [])

  const removeCategory = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    const { error: removeError } = await categoryService.remove(id)
    if (removeError) {
      setError(removeError.message)
      setLoading(false)
      return
    }

    setCategories((current) => current.filter((category) => category.id !== id))
    setLoading(false)
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
