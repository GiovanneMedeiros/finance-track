const KEYWORD_CATEGORY_MAP = {
  supermercado: 'Alimentacao',
  mercado: 'Alimentacao',
  restaurante: 'Alimentacao',
  ifood: 'Alimentacao',
  padaria: 'Alimentacao',
  uber: 'Transporte',
  '99': 'Transporte',
  combustivel: 'Transporte',
  posto: 'Transporte',
  estacionamento: 'Transporte',
  pedagio: 'Transporte',
  netflix: 'Lazer',
  spotify: 'Lazer',
  cinema: 'Lazer',
  teatro: 'Lazer',
  aluguel: 'Moradia',
  condominio: 'Moradia',
  energia: 'Moradia',
  agua: 'Moradia',
  internet: 'Moradia',
}

function guessCategory(description) {
  const normalized = description.toLowerCase()

  for (const [keyword, category] of Object.entries(KEYWORD_CATEGORY_MAP)) {
    if (normalized.includes(keyword)) {
      return category
    }
  }

  return 'Outros'
}

function generateMockTransactions() {
  return [
    { originalDescription: 'PAG*JoseDaSilva', title: 'Mercado Municipal - Compras', amount: 347.82, date: '2026-03-10' },
    { originalDescription: 'UBER *TRIP AJUDA.UBER.C', title: 'Uber - Corrida app', amount: 28.9, date: '2026-03-12' },
    { originalDescription: 'NETFLIX.COM 866-579-7172', title: 'Netflix - Assinatura streaming', amount: 55.9, date: '2026-03-13' },
    { originalDescription: 'REST CANTINA DA PRACA', title: 'Restaurante Cantina da Praça', amount: 89.0, date: '2026-03-15' },
    { originalDescription: 'AUTO POSTO IPIRANGA LJ237', title: 'Posto Ipiranga - Abastecimento', amount: 210.0, date: '2026-03-17' },
    { originalDescription: 'COND RESID PARQUE VERDE', title: 'Condomínio Parque Verde', amount: 680.0, date: '2026-03-05' },
    { originalDescription: 'DROG RAIA 187 SP', title: 'Droga Raia - Farmácia', amount: 64.3, date: '2026-03-20' },
    { originalDescription: 'IFOOD *IFOOD.COM.BR', title: 'iFood - Pedido delivery', amount: 42.5, date: '2026-03-22' },
    { originalDescription: 'SPOTIFY P28D73HXKQ', title: 'Spotify - Assinatura música', amount: 21.9, date: '2026-03-08' },
    { originalDescription: 'MAGALU *MAGAZINELUIZA', title: 'Magazine Luiza - Compra online', amount: 159.9, date: '2026-03-14' },
    { originalDescription: 'ESTAC ROT ESTAPAR 0042', title: 'Estapar - Estacionamento rotativo', amount: 18.0, date: '2026-03-19' },
    { originalDescription: 'PAD TRIGOPAN LTDA', title: 'Padaria Trigo & Pan', amount: 32.5, date: '2026-03-21' },
  ]
}

/**
 * Simulates parsing an invoice file.
 * In a real implementation, this would call an OCR API or PDF parser.
 * Returns a promise that resolves to an array of parsed transactions.
 */
export async function parseInvoiceFile(file) {
  if (!file) {
    throw new Error('Nenhum arquivo fornecido.')
  }

  const allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ]

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Formato não suportado. Use PDF, PNG ou JPG.')
  }

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Máximo permitido: 10MB.')
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const rawItems = generateMockTransactions()

  return rawItems.map((item) => ({
    id: crypto.randomUUID(),
    title: item.title,
    description: item.originalDescription,
    originalDescription: item.originalDescription,
    amount: Number(item.amount),
    type: 'expense',
    category: guessCategory(item.title),
    date: item.date,
    selected: true,
  }))
}
