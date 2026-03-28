import { CATEGORY_FILTERS } from '@/constants/categories'
import { formatCurrency } from '@/utils/formatters'

export function sortTransactionsByDate(transactions) {
  return [...transactions].sort(
    (current, next) => new Date(next.date).getTime() - new Date(current.date).getTime(),
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