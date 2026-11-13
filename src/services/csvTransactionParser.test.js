import assert from 'node:assert/strict'
import test from 'node:test'

import { parseTransactionCsv } from './csvTransactionParser.js'

test('parses semicolon-delimited Brazilian amounts and dates', () => {
  const result = parseTransactionCsv(
    'Descrição;Valor;Tipo;Categoria;Data\nMercado;R$ 1.234,56;Despesa;Alimentação;13/11/2026',
  )

  assert.deepEqual(result, {
    items: [{
      title: 'Mercado',
      description: '',
      amount: 1234.56,
      type: 'expense',
      category: 'Alimentação',
      date: '2026-11-13',
    }],
    errors: [],
    totalRows: 1,
  })
})

test('preserves escaped quotes and commas in quoted fields', () => {
  const result = parseTransactionCsv(
    'description,amount,type,date\n"Loja, ""Centro""",12.50,income,2026-02-28',
  )

  assert.equal(result.items[0].title, 'Loja, "Centro"')
  assert.equal(result.items[0].amount, 12.5)
  assert.equal(result.items[0].type, 'income')
  assert.equal(result.items[0].date, '2026-02-28')
})

test('reports invalid amounts, types, and calendar dates by line', () => {
  const result = parseTransactionCsv(
    'title,amount,type,date\nCompra,0,despesa,2026-02-30\n,10,transfer,31/04/2026',
  )

  assert.equal(result.items.length, 0)
  assert.equal(result.errors.length, 2)
  assert.match(result.errors[0], /Linha 2: valor inválido, data inválida\./)
  assert.match(result.errors[1], /Linha 3: descrição ausente, tipo deve ser receita ou despesa, data inválida\./)
})

test('rejects a CSV with an unclosed quoted field', () => {
  assert.throws(
    () => parseTransactionCsv('title,amount\n"Compra,10'),
    /aspas sem fechamento/,
  )
})
