import { useCallback, useEffect, useState } from 'react'

import { invoiceService } from '@/services/invoiceService'
import { supabase } from '@/services/supabaseClient'

export function useInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadInvoices = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const userId = sessionData.session?.user?.id
    if (!userId) return []
    const { data, error: listError } = await invoiceService.list(userId)
    if (listError) throw listError
    return data
  }, [])

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      setInvoices(await loadInvoices())
      setError(null)
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setLoading(false)
    }
  }, [loadInvoices])

  useEffect(() => {
    let active = true
    loadInvoices().then(
      (data) => {
        if (active) {
          setInvoices(data)
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
  }, [loadInvoices])

  const saveInvoice = useCallback(async (invoice, existingId) => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    const userId = sessionData.session?.user?.id
    if (!userId) throw new Error('Usuário não autenticado.')

    try {
      const result = existingId
        ? await invoiceService.update(existingId, invoice)
        : await invoiceService.create({ ...invoice, user_id: userId })
      if (result.error) throw result.error
      if (!result.data) throw new Error('O banco não retornou a fatura salva.')
      setInvoices((current) => existingId
        ? current.map((item) => item.id === existingId ? result.data : item)
        : [result.data, ...current])
      setError(null)
      return result.data
    } catch (saveError) {
      setError(saveError.message || 'Não foi possível salvar a fatura.')
      throw saveError
    }
  }, [])

  const removeInvoice = useCallback(async (id) => {
    try {
      const { error: removeError } = await invoiceService.remove(id)
      if (removeError) throw removeError
      setInvoices((current) => current.filter((invoice) => invoice.id !== id))
      setError(null)
    } catch (removeError) {
      setError(removeError.message || 'Não foi possível excluir a fatura.')
      throw removeError
    }
  }, [])

  return { invoices, loading, error, saveInvoice, removeInvoice, refresh: fetchInvoices }
}
