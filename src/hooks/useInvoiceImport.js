import { useCallback, useState } from 'react'

import { parseInvoiceFile } from '@/services/invoiceParser'

const STEPS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  REVIEW: 'review',
  IMPORTING: 'importing',
  DONE: 'done',
}

export function useInvoiceImport({ onImport }) {
  const [step, setStep] = useState(STEPS.IDLE)
  const [file, setFile] = useState(null)
  const [parsedItems, setParsedItems] = useState([])
  const [error, setError] = useState(null)

  const reset = useCallback(() => {
    setStep(STEPS.IDLE)
    setFile(null)
    setParsedItems([])
    setError(null)
  }, [])

  const uploadFile = useCallback(async (selectedFile) => {
    setError(null)
    setFile(selectedFile)
    setStep(STEPS.UPLOADING)

    try {
      const items = await parseInvoiceFile(selectedFile)
      setParsedItems(items)
      setStep(STEPS.REVIEW)
    } catch (err) {
      setError(err.message)
      setStep(STEPS.IDLE)
    }
  }, [])

  const toggleItem = useCallback((itemId) => {
    setParsedItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item,
      ),
    )
  }, [])

  const updateItem = useCallback((itemId, field, value) => {
    setParsedItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    )
  }, [])

  const removeItem = useCallback((itemId) => {
    setParsedItems((current) => current.filter((item) => item.id !== itemId))
  }, [])

  const confirmImport = useCallback(async () => {
    const selectedItems = parsedItems
      .filter((item) => item.selected)
      .map(({ selected, ...transaction }) => transaction)

    if (selectedItems.length === 0) {
      return
    }

    setStep(STEPS.IMPORTING)
    setError(null)

    try {
      await onImport(selectedItems)
      // Small delay for visual feedback
      setTimeout(() => {
        setStep(STEPS.DONE)
      }, 600)
    } catch (importError) {
      setError(importError?.message || 'Falha ao importar a fatura.')
      setStep(STEPS.REVIEW)
    }
  }, [onImport, parsedItems])

  const selectedCount = parsedItems.filter((item) => item.selected).length

  return {
    step,
    file,
    parsedItems,
    error,
    selectedCount,
    uploadFile,
    toggleItem,
    updateItem,
    removeItem,
    confirmImport,
    reset,
  }
}
