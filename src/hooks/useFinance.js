import { useState } from 'react'

import { CATEGORY_FILTERS } from '@/constants/categories'
import { defaultTransactions } from '@/data/defaultTransactions'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import {
  buildCategoryFilters,
  buildChartData,
  buildMonthlyForecast,
  buildPremiumTrendData,
  buildSpendingInsights,
  calculateSummary,
  filterTransactions,
  sortTransactionsByDate,
} from '@/utils/finance'
import { formatCurrency } from '@/utils/formatters'

const STORAGE_KEY = 'finance-track:transactions'
const BALANCE_STORAGE_KEY = 'finance-track:custom-balance'
const GOAL_STORAGE_KEY = 'finance-track:monthly-goal'

const DEFAULT_GOAL = { target: 1500, current: 930 }

export function useFinance() {
  const [transactions, setTransactions] = useLocalStorage(
    STORAGE_KEY,
    defaultTransactions,
  )
  const [customBalance, setCustomBalance] = useLocalStorage(
    BALANCE_STORAGE_KEY,
    null,
  )
  const [monthlyGoal, setMonthlyGoal] = useLocalStorage(
    GOAL_STORAGE_KEY,
    DEFAULT_GOAL,
  )
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_FILTERS[0])

  const orderedTransactions = sortTransactionsByDate(transactions)
  const visibleTransactions = filterTransactions(orderedTransactions, selectedCategory)
  const summary = calculateSummary(orderedTransactions)
  const chartData = buildChartData(summary)
  const categoryFilters = buildCategoryFilters(orderedTransactions)
  const premiumChartData = buildPremiumTrendData(orderedTransactions)
  const spendingInsights = buildSpendingInsights(orderedTransactions)
  const monthlyForecast = buildMonthlyForecast(orderedTransactions)

  const displayBalance = customBalance != null ? customBalance : summary.balance
  const formattedDisplayBalance = formatCurrency(displayBalance)

  const addTransaction = (transaction) => {
    setTransactions((current) => [
      {
        ...transaction,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
      ...current,
    ])
  }

  const addBatchTransactions = (items) => {
    const now = new Date().toISOString()
    setTransactions((current) => [
      ...items.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        createdAt: now,
      })),
      ...current,
    ])
  }

  const removeTransaction = (transactionId) => {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== transactionId),
    )
  }

  return {
    transactions: orderedTransactions,
    visibleTransactions,
    summary,
    chartData,
    premiumChartData,
    spendingInsights,
    monthlyForecast,
    categoryFilters,
    selectedCategory,
    setSelectedCategory,
    addTransaction,
    addBatchTransactions,
    removeTransaction,
    customBalance,
    displayBalance,
    formattedDisplayBalance,
    setCustomBalance,
    monthlyGoal,
    setMonthlyGoal,
  }
}
