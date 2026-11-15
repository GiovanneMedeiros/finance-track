import assert from 'node:assert/strict'
import test from 'node:test'

import { getCardPortfolioAnalytics } from './cardPortfolioAnalytics.js'

test('aggregates limits, monthly installments, outstanding bills, and current cycle', () => {
  const portfolio = {
    cards: [
      {
        id: 'card-1',
        is_active: true,
        is_archived: false,
        limit_amount: 1000,
        current_usage: 35,
        closing_day: 20,
        payment_day: 10,
        name: 'Principal',
      },
      {
        id: 'card-2',
        is_active: true,
        is_archived: true,
        limit_amount: 500,
        current_usage: 100,
        closing_day: 5,
        payment_day: 15,
      },
    ],
    purchases: [
      { id: 'purchase-1', category: 'Alimentação' },
      { id: 'purchase-2', category: 'Transporte' },
    ],
    bills: [
      { id: 'bill-current', card_id: 'card-1', closing_date: '2026-11-20', due_date: '2026-12-10', status: 'open', opening_balance: 25 },
      { id: 'bill-paid', card_id: 'card-1', closing_date: '2026-11-10', due_date: '2026-11-20', status: 'paid', opening_balance: 0 },
    ],
    installments: [
      { id: 'installment-1', bill_id: 'bill-current', card_transaction_id: 'purchase-1', amount: 10 },
      { id: 'installment-2', bill_id: 'bill-paid', card_transaction_id: 'purchase-2', amount: 5 },
    ],
  }

  const result = getCardPortfolioAnalytics(portfolio, new Date(2026, 10, 15))

  assert.equal(result.totalCards, 1)
  assert.equal(result.totalLimit, 1000)
  assert.equal(result.totalUsed, 35)
  assert.equal(result.availableLimit, 965)
  assert.equal(result.monthlySpend, 15)
  assert.equal(result.openBillsCount, 1)
  assert.equal(result.openBillsTotal, 35)
  assert.equal(result.upcomingDue.id, 'bill-current')
  assert.equal(result.upcomingDueAmount, 35)
  assert.equal(result.currentBills[0].bill.id, 'bill-current')
  assert.equal(result.currentBills[0].amount, 35)
  assert.deepEqual(result.categorySpend, [
    { category: 'Alimentação', amount: 10 },
    { category: 'Transporte', amount: 5 },
  ])
})
