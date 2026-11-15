import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildInstallmentSchedule,
  getCardBillingCycle,
  getCurrentCardCycle,
  splitPurchaseInstallments,
} from './cardBilling.js'

test('purchase on closing day is included in that bill; next day rolls forward', () => {
  assert.deepEqual(getCardBillingCycle('2026-11-20', 20, 10), {
    closingDate: '2026-11-20',
    dueDate: '2026-12-10',
  })
  assert.deepEqual(getCardBillingCycle('2026-11-21', 20, 10), {
    closingDate: '2026-12-20',
    dueDate: '2027-01-10',
  })
})

test('uses a same-month due date when payment day follows the closing day', () => {
  assert.deepEqual(getCardBillingCycle('2026-11-01', 5, 15), {
    closingDate: '2026-11-05',
    dueDate: '2026-11-15',
  })
})

test('clamps closing and due days to the end of short months', () => {
  assert.deepEqual(getCardBillingCycle('2024-02-20', 31, 31), {
    closingDate: '2024-02-29',
    dueDate: '2024-03-31',
  })
})

test('assigns a purchase after this month’s close to the next current bill cycle', () => {
  assert.deepEqual(getCurrentCardCycle('2026-11-21', 20, 10), {
    closingDate: '2026-12-20',
    dueDate: '2027-01-10',
  })
})

test('splits cents evenly without changing the purchase total', () => {
  const amounts = splitPurchaseInstallments(100, 3)
  assert.deepEqual(amounts, [33.34, 33.33, 33.33])
  assert.equal(Math.round(amounts.reduce((sum, amount) => sum + amount, 0) * 100), 10000)
})

test('creates a monthly installment schedule with exact billing and due dates', () => {
  const schedule = buildInstallmentSchedule({
    amount: 100,
    count: 3,
    purchaseDate: '2026-11-21',
    closingDay: 20,
    paymentDay: 10,
  })
  assert.deepEqual(schedule.map(({ amount, closingDate, dueDate }) => ({ amount, closingDate, dueDate })), [
    { amount: 33.34, closingDate: '2026-12-20', dueDate: '2027-01-10' },
    { amount: 33.33, closingDate: '2027-01-20', dueDate: '2027-02-10' },
    { amount: 33.33, closingDate: '2027-02-20', dueDate: '2027-03-10' },
  ])
})

test('rejects invalid billing days and installment counts', () => {
  assert.throws(() => getCardBillingCycle('2026-11-01', 0, 10), /fechamento/)
  assert.throws(() => getCardBillingCycle('2026-11-31', 20, 10), /Data inválida/)
  assert.throws(() => splitPurchaseInstallments(10, 0), /1 a 48/)
})
