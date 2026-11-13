function parseRows(text, delimiter) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        value += character
      }
    } else if (character === '"' && value.length === 0) {
      quoted = true
    } else if (character === delimiter) {
      row.push(value.trim())
      value = ''
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(value.trim())
      if (row.some((cell) => cell !== '')) rows.push(row)
      row = []
      value = ''
    } else {
      value += character
    }
  }

  if (quoted) throw new Error('O CSV contém um campo com aspas sem fechamento.')
  row.push(value.trim())
  if (row.some((cell) => cell !== '')) rows.push(row)
  return rows
}

function normalizeHeader(value) {
  return value
    .replace(/^\uFEFF/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function findColumn(headers, names) {
  return headers.findIndex((header) => names.includes(header))
}

function parseAmount(value) {
  let normalized = value.replace(/[^\d,.-]/g, '')
  if (normalized.includes(',') && normalized.includes('.')) {
    normalized = normalized.lastIndexOf(',') > normalized.lastIndexOf('.')
      ? normalized.replace(/\./g, '').replace(',', '.')
      : normalized.replace(/,/g, '')
  } else if (normalized.includes(',')) {
    normalized = normalized.replace(',', '.')
  }
  const amount = Number(normalized)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

function parseDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10)
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const date = new Date(`${value}T00:00:00.000Z`)
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
      ? null
      : value
  }
  const brMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!brMatch) return null
  const [, day, month, year] = brMatch
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (
    date.getFullYear() !== Number(year)
    || date.getMonth() !== Number(month) - 1
    || date.getDate() !== Number(day)
  ) return null
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export function parseTransactionCsv(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const semicolons = (firstLine.match(/;/g) ?? []).length
  const commas = (firstLine.match(/,/g) ?? []).length
  const delimiter = semicolons > commas ? ';' : ','
  const rows = parseRows(text, delimiter)
  if (rows.length < 2) throw new Error('O CSV precisa ter um cabeçalho e pelo menos uma linha de dados.')

  const headers = rows[0].map(normalizeHeader)
  const titleIndex = findColumn(headers, ['descricao', 'description', 'titulo', 'title', 'estabelecimento'])
  const amountIndex = findColumn(headers, ['valor', 'amount', 'value'])
  const typeIndex = findColumn(headers, ['tipo', 'type'])
  const categoryIndex = findColumn(headers, ['categoria', 'category'])
  const dateIndex = findColumn(headers, ['data', 'date'])
  if (titleIndex < 0 || amountIndex < 0) {
    throw new Error('O CSV precisa ter colunas de descrição e valor. Tipo, categoria e data são opcionais.')
  }

  const items = []
  const errors = []
  rows.slice(1).forEach((row, rowIndex) => {
    const lineNumber = rowIndex + 2
    const title = row[titleIndex]?.trim()
    const amount = parseAmount(row[amountIndex] ?? '')
    const rawType = (typeIndex >= 0 ? row[typeIndex] : 'expense')?.trim().toLowerCase()
    const type = ['income', 'receita', 'entrada'].includes(rawType)
      ? 'income'
      : ['expense', 'despesa', 'saida', 'saída'].includes(rawType)
        ? 'expense'
        : null
    const date = parseDate(dateIndex >= 0 ? row[dateIndex]?.trim() : '')

    if (!title || !amount || !type || !date) {
      const reasons = [
        !title && 'descrição ausente',
        !amount && 'valor inválido',
        !type && 'tipo deve ser receita ou despesa',
        !date && 'data inválida',
      ].filter(Boolean)
      errors.push(`Linha ${lineNumber}: ${reasons.join(', ')}.`)
      return
    }

    items.push({
      title,
      description: '',
      amount,
      type,
      category: row[categoryIndex]?.trim() || 'Outros',
      date,
    })
  })

  return { items, errors, totalRows: rows.length - 1 }
}
