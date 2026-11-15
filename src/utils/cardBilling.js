function monthStart(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex, 1))
}

function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
}

function dateToIso(date) {
  return date.toISOString().slice(0, 10)
}

function parseIsoDate(value) {
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime()) || dateToIso(date) !== value) {
    throw new Error('Data inválida.')
  }
  return date
}

export function getCardBillingCycle(purchaseDate, closingDay, paymentDay, installmentOffset = 0) {
  const purchase = typeof purchaseDate === 'string' ? parseIsoDate(purchaseDate) : purchaseDate
  if (!(purchase instanceof Date) || Number.isNaN(purchase.getTime())) {
    throw new Error('Data da compra inválida.')
  }
  if (!Number.isInteger(closingDay) || closingDay < 1 || closingDay > 31) {
    throw new Error('Dia de fechamento deve estar entre 1 e 31.')
  }
  if (!Number.isInteger(paymentDay) || paymentDay < 1 || paymentDay > 31) {
    throw new Error('Dia de vencimento deve estar entre 1 e 31.')
  }
  if (!Number.isInteger(installmentOffset) || installmentOffset < 0 || installmentOffset > 47) {
    throw new Error('Parcela inválida.')
  }

  let year = purchase.getUTCFullYear()
  let month = purchase.getUTCMonth()
  const purchaseDay = purchase.getUTCDate()
  const effectiveClosingDay = Math.min(closingDay, daysInMonth(year, month))

  if (purchaseDay > effectiveClosingDay) {
    month += 1
  }

  const closingMonth = monthStart(year, month + installmentOffset)
  year = closingMonth.getUTCFullYear()
  month = closingMonth.getUTCMonth()
  const closingDate = new Date(Date.UTC(
    year,
    month,
    Math.min(closingDay, daysInMonth(year, month)),
  ))

  let dueMonth = month
  if (paymentDay <= closingDay) dueMonth += 1
  const dueYear = year + Math.floor(dueMonth / 12)
  dueMonth %= 12
  const dueDate = new Date(Date.UTC(
    dueYear,
    dueMonth,
    Math.min(paymentDay, daysInMonth(dueYear, dueMonth)),
  ))

  return {
    closingDate: dateToIso(closingDate),
    dueDate: dateToIso(dueDate),
  }
}

export function getCurrentCardCycle(today, closingDay, paymentDay) {
  return getCardBillingCycle(today, closingDay, paymentDay)
}

export function splitPurchaseInstallments(amount, count) {
  const totalCents = Math.round(Number(amount) * 100)
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0) {
    throw new Error('O valor da compra deve ser positivo.')
  }
  if (!Number.isInteger(count) || count < 1 || count > 48) {
    throw new Error('A compra pode ter de 1 a 48 parcelas.')
  }

  const baseCents = Math.floor(totalCents / count)
  const remainder = totalCents % count
  return Array.from({ length: count }, (_, index) =>
    (baseCents + (index < remainder ? 1 : 0)) / 100,
  )
}

export function buildInstallmentSchedule({ amount, count, purchaseDate, closingDay, paymentDay }) {
  const amounts = splitPurchaseInstallments(amount, count)
  return amounts.map((installmentAmount, index) => ({
    number: index + 1,
    amount: installmentAmount,
    ...getCardBillingCycle(purchaseDate, closingDay, paymentDay, index),
  }))
}
