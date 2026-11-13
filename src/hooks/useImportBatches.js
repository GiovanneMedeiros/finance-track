import { useCallback, useEffect, useState } from 'react'

import { importBatchService } from '@/services/importBatchService'
import { supabase } from '@/services/supabaseClient'

export function useImportBatches() {
  const [batches, setBatches] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadBatches = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const userId = sessionData.session?.user?.id
    if (!userId) return []
    const { data, error: listError } = await importBatchService.list(userId)
    if (listError) throw listError
    return data
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setBatches(await loadBatches())
      setError(null)
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setLoading(false)
    }
  }, [loadBatches])

  useEffect(() => {
    let active = true
    loadBatches().then(
      (data) => {
        if (active) {
          setBatches(data)
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
  }, [loadBatches])

  const saveBatch = useCallback(async (fileName, importedCount) => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const userId = sessionData.session?.user?.id
    if (!userId) throw new Error('Usuário não autenticado.')
    const { data, error: saveError } = await importBatchService.create({
      user_id: userId,
      file_name: fileName,
      imported_count: importedCount,
    })
    if (saveError) throw saveError
    setBatches((current) => [data, ...current].slice(0, 20))
  }, [])

  return { batches, loading, error, saveBatch, refresh }
}
