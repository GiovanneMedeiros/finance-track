import { useCallback, useEffect, useMemo, useState } from 'react'

import { transactionService } from '@/services/transactionService'
import { supabase } from '@/services/supabaseClient'
import { formatCurrency } from '@/utils/formatters'

const resolveTransactionDate = (transaction) => transaction.date || transaction.created_at || transaction.updated_at || ''

const mapTransaction = (transaction) => ({
  ...transaction,
  amount: Number(transaction.amount),
  date: transaction.date || transaction.created_at || transaction.updated_at || null,
})

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(async () => {
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
      setTransactions([])
      setLoading(false)
      return
    }

    const { data, error: listError } = await transactionService.list(userId)
    if (listError) {
      setError(listError.message)
      setTransactions([])
    } else {
      setTransactions(data.map(mapTransaction))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = useCallback(async (transaction) => {
    setLoading(true)
    setError(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id
    if (!userId) {
      setError('Usuário não autenticado')
      setLoading(false)
      return
    }

    const createdAt = transaction.created_at
      ? transaction.created_at
      : transaction.date
      ? new Date(transaction.date).toISOString()
      : new Date().toISOString()

    const { data, error: createError } = await transactionService.create({
      ...transaction,
      user_id: userId,
      created_at: createdAt,
    })

    if (createError) {
      setError(createError.message)
    } else {
      setTransactions((current) => [mapTransaction(data), ...current])
    }
    setLoading(false)
  }, [])

  const addTransactions = useCallback(async (items) => {
    setLoading(true)
    setError(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id
    if (!userId) {
      setError('Usuário não autenticado')
      setLoading(false)
      return
    }

    const preparedItems = items.map((item) => {
      const createdAt = item.created_at
        ? item.created_at
        : item.date
        ? new Date(item.date).toISOString()
        : new Date().toISOString()

      return {
        ...item,
        user_id: userId,
        amount: Number(item.amount),
        type: item.type || 'expense',
        category: item.category || 'Outros',
        description: item.description || item.originalDescription || '',
        created_at: createdAt,
        updated_at: item.updated_at || createdAt,
      }
    })

    const { data, error: createError } = await transactionService.createMany(preparedItems)

    if (createError) {
      setError(createError.message)
    } else if (Array.isArray(data) && data.length > 0) {
      setTransactions((current) => [
        ...data.map(mapTransaction),
        ...current,
      ])
    } else {
      await fetchTransactions()
    }

    setLoading(false)
  }, [fetchTransactions])

  const updateTransaction = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)

    const { data, error: updateError } = await transactionService.update(id, {
      ...updates,
      updated_at: new Date().toISOString(),
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setTransactions((current) => current.map((item) => (item.id === id ? mapTransaction(data) : item)))
    setLoading(false)
    return data
  }, [])

  const removeTransaction = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    const { error: removeError } = await transactionService.remove(id)
    if (removeError) {
      setError(removeError.message)
      setLoading(false)
      return
    }

    setTransactions((current) => current.filter((transaction) => transaction.id !== id))
    setLoading(false)
  }, [])

  const summary = useMemo(() => {
    const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
    const expense = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
    const balance = income - expense

    return {
      total: balance,
      balance,
      income,
      expense,
      formattedBalance: formatCurrency(balance),
      formattedIncome: formatCurrency(income),
      formattedExpense: formatCurrency(expense),
    }
  }, [transactions])

  const chartData = useMemo(() => {
    if (transactions.length === 0) {
      return []
    }

    const grouped = transactions.reduce((acc, transaction) => {
      const transactionDate = resolveTransactionDate(transaction)
      if (!transactionDate) return acc

      const dateKey = transactionDate.slice(0, 10)
      const current = acc[dateKey] ?? { income: 0, expense: 0 }
      current[transaction.type] += transaction.amount
      acc[dateKey] = current
      return acc
    }, {})

    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, values]) => ({
        name: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        income: values.income,
        expense: values.expense,
      }))
  }, [transactions])

  const recentTransactions = useMemo(() => transactions.slice(0, 10), [transactions])

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    addTransactions,
    updateTransaction,
    removeTransaction,
    summary,
    chartData,
    recentTransactions,
  }
}
