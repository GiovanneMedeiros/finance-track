const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

const longDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0)
}

export function formatShortDate(value) {
  return shortDateFormatter.format(new Date(value))
}

export function formatLongDate(value) {
  return longDateFormatter.format(new Date(value))
}