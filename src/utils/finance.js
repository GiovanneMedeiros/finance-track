import { CATEGORY_FILTERS } from '@/constants/categories'
import { formatCurrency } from '@/utils/formatters'

const resolveTransactionDate = (transaction) => transaction.date || transaction.created_at || transaction.updated_at || ''

export function sortTransactionsByDate(transactions) {
  return [...transactions].sort(
    (current, next) => new Date(resolveTransactionDate(next)).getTime() - new Date(resolveTransactionDate(current)).getTime(),
  )
}

export function filterTransactions(transactions, category) {
  if (category === 'Todas') {
    return transactions
  }

  return transactions.filter((transaction) => transaction.category === category)
}

export function calculateSummary(transactions) {
  const summary = transactions.reduce(
    (accumulator, transaction) => {
      if (transaction.type === 'income') {
        accumulator.income += transaction.amount
      } else {
        accumulator.expense += transaction.amount
      }

      return accumulator
    },
    { income: 0, expense: 0 },
  )

  const balance = summary.income - summary.expense

  return {
    ...summary,
    balance,
    formattedIncome: formatCurrency(summary.income),
    formattedExpense: formatCurrency(summary.expense),
    formattedBalance: formatCurrency(balance),
  }
}

export function buildChartData(summary) {
  return [
    { name: 'Receitas', value: summary.income, color: '#5eead4' },
    { name: 'Despesas', value: summary.expense, color: '#fb7185' },
  ]
}

export function buildPremiumTrendData(transactions) {
  const now = new Date()
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const trend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    return {
      label: monthNames[date.getMonth()],
      month: date.getMonth(),
      year: date.getFullYear(),
      income: 0,
      expense: 0,
    }
  })

  transactions.forEach((transaction) => {
    const date = new Date(resolveTransactionDate(transaction))
    const target = trend.find((item) => item.year === date.getFullYear() && item.month === date.getMonth())

    if (!target) {
      return
    }

    if (transaction.type === 'income') {
      target.income += transaction.amount
    } else {
      target.expense += transaction.amount
    }
  })

  return trend.map((item) => ({
    name: item.label,
    income: item.income,
    expense: item.expense,
  }))
}

export function buildSpendingInsights(transactions) {
  const expenses = transactions.filter((transaction) => transaction.type === 'expense')
  const totalsByCategory = expenses.reduce((accumulator, transaction) => {
    accumulator[transaction.category] = (accumulator[transaction.category] || 0) + transaction.amount
    return accumulator
  }, {})

  const totalExpense = expenses.reduce((sum, transaction) => sum + transaction.amount, 0)
  const sortedCategories = Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1])
  const [topCategory, topAmount] = sortedCategories[0] || ['Nenhuma', 0]
  const categoryRatio = totalExpense ? Math.round((topAmount / totalExpense) * 100) : 0
  const savingsPrediction = Math.round(topAmount * 0.2)

  return {
    topCategory,
    topAmount,
    categoryRatio,
    savingsPrediction,
    suggestion:
      topAmount > 0
        ? `Se reduzir 20% em ${topCategory}, economiza ${formatCurrency(savingsPrediction)}/mês.`
        : 'Registre despesas para obter analises personalizadas.',
  }
}

export function buildMonthlyForecast(transactions) {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const currentDay = now.getDate()
  const summary = calculateSummary(transactions)
  const averageDailyBalance = summary.balance / Math.max(currentDay, 1)
  const projectedBalance = summary.balance + averageDailyBalance * (daysInMonth - currentDay)

  return {
    projectedBalance,
    projectedBalanceLabel: formatCurrency(projectedBalance),
    daysRemaining: daysInMonth - currentDay,
  }
}

export function buildCategoryFilters(transactions) {
  return CATEGORY_FILTERS.map((category) => ({
    value: category,
    label: category,
    count:
      category === 'Todas'
        ? transactions.length
        : transactions.filter((transaction) => transaction.category === category).length,
  }))
}
