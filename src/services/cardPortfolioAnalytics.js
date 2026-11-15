import { getCurrentCardCycle } from '../utils/cardBilling.js'

function monthKey(date) {
  return date.slice(0, 7)
}

function localMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function getCardPortfolioAnalytics({ cards, purchases, installments, bills }, now = new Date()) {
  const activeCards = cards.filter((card) => card.is_active && !card.is_archived)
  const billById = Object.fromEntries(bills.map((bill) => [bill.id, bill]))
  const purchaseById = Object.fromEntries(purchases.map((purchase) => [purchase.id, purchase]))
  const currentMonth = localMonthKey(now)
  const totalLimit = activeCards.reduce((sum, card) => sum + Number(card.limit_amount ?? card.limit ?? 0), 0)
  const totalUsed = activeCards.reduce((sum, card) => sum + Number(card.current_usage ?? 0), 0)
  const monthlySpend = installments.reduce((sum, installment) => {
    const bill = billById[installment.bill_id]
    return bill && monthKey(bill.closing_date) === currentMonth
      ? sum + Number(installment.amount)
      : sum
  }, 0)
  const openBills = bills.filter((bill) => bill.status !== 'paid')
  const nextDueBills = openBills
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
  const dueTotal = openBills.reduce((sum, bill) => {
    const amount = Number(bill.opening_balance ?? 0) + installments
      .filter((item) => item.bill_id === bill.id)
      .reduce((billSum, item) => billSum + Number(item.amount), 0)
    return sum + amount
  }, 0)
  const currentBills = activeCards.map((card) => {
    const cycle = getCurrentCardCycle(
      `${currentMonth}-${String(now.getDate()).padStart(2, '0')}`,
      Number(card.closing_day),
      Number(card.due_day ?? card.payment_day),
    )
    const bill = bills.find((item) => item.card_id === card.id && item.closing_date === cycle.closingDate)
    const amount = bill
      ? Number(bill.opening_balance ?? 0) + installments
        .filter((item) => item.bill_id === bill.id)
        .reduce((sum, item) => sum + Number(item.amount), 0)
      : 0
    return { card, bill, amount, cycle }
  })

  const monthlyEvolution = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
    const key = localMonthKey(date)
    const amount = installments.reduce((sum, installment) => {
      const bill = billById[installment.bill_id]
      return bill && monthKey(bill.closing_date) === key
        ? sum + Number(installment.amount)
        : sum
    }, 0)
    return {
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      amount,
    }
  })

  const currentMonthCategorySpend = new Map()
  installments.forEach((installment) => {
    const bill = billById[installment.bill_id]
    const purchase = purchaseById[installment.card_transaction_id]
    if (!bill || !purchase || monthKey(bill.closing_date) !== currentMonth) return
    currentMonthCategorySpend.set(
      purchase.category,
      (currentMonthCategorySpend.get(purchase.category) ?? 0) + Number(installment.amount),
    )
  })

  const categorySpend = [...currentMonthCategorySpend.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  const cardComparison = activeCards.map((card) => ({
    cardId: card.id,
    card: card.nickname || card.name,
    used: Number(card.current_usage ?? 0),
    month: installments.reduce((sum, installment) => {
      const bill = billById[installment.bill_id]
      return bill?.card_id === card.id && monthKey(bill.closing_date) === currentMonth
        ? sum + Number(installment.amount)
        : sum
    }, 0),
  }))

  const cardMonthlyEvolution = Object.fromEntries(activeCards.map((card) => [
    card.id,
    monthlyEvolution.map((month, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
      const key = localMonthKey(date)
      const amount = installments.reduce((sum, installment) => {
        const bill = billById[installment.bill_id]
        return bill?.card_id === card.id && monthKey(bill.closing_date) === key
          ? sum + Number(installment.amount)
          : sum
      }, 0)
      return { ...month, amount }
    }),
  ]))

  const upcomingDue = nextDueBills[0] ?? null
  const upcomingDueAmount = upcomingDue
    ? Number(upcomingDue.opening_balance ?? 0) + installments
      .filter((item) => item.bill_id === upcomingDue.id)
      .reduce((sum, item) => sum + Number(item.amount), 0)
    : 0

  return {
    totalCards: activeCards.length,
    totalLimit,
    totalUsed,
    availableLimit: Math.max(0, totalLimit - totalUsed),
    usagePercent: totalLimit > 0 ? Math.min(100, (totalUsed / totalLimit) * 100) : 0,
    monthlySpend,
    openBillsCount: openBills.length,
    openBillsTotal: dueTotal,
    upcomingDue,
    upcomingDueAmount,
    currentBills,
    monthlyEvolution,
    categorySpend,
    cardComparison,
    cardMonthlyEvolution,
  }
}
