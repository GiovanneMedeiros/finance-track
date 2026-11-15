export const CARD_THEMES = {
  nubank: {
    label: 'Nubank',
    bank: 'Nubank',
    background: 'radial-gradient(130% 120% at 0% 0%, #a855f7 0%, transparent 58%), linear-gradient(135deg, #581c87 0%, #24103d 55%, #10101a 100%)',
    text: '#faf5ff',
    accent: '#e9d5ff',
    color: '#8b5cf6',
  },
  inter: {
    label: 'Inter',
    bank: 'Inter',
    background: 'radial-gradient(120% 110% at 100% 0%, #fdba74 0%, transparent 58%), linear-gradient(135deg, #f97316 0%, #c2410c 55%, #27140d 100%)',
    text: '#fff7ed',
    accent: '#ffedd5',
    color: '#f97316',
  },
  itau: {
    label: 'Itaú',
    bank: 'Itaú',
    background: 'radial-gradient(120% 100% at 100% 0%, #60a5fa 0%, transparent 55%), linear-gradient(135deg, #1d4ed8 0%, #172554 58%, #111827 100%)',
    text: '#eff6ff',
    accent: '#fed7aa',
    color: '#2563eb',
  },
  santander: {
    label: 'Santander',
    bank: 'Santander',
    background: 'radial-gradient(120% 100% at 100% 0%, #fca5a5 0%, transparent 55%), linear-gradient(135deg, #b91c1c 0%, #7f1d1d 56%, #271313 100%)',
    text: '#fff1f2',
    accent: '#fecdd3',
    color: '#dc2626',
  },
  custom: {
    label: 'Personalizado',
    bank: '',
    background: '',
    text: '#f8fafc',
    accent: '#a7f3d0',
    color: '#0f766e',
  },
}

export const CARD_PURCHASE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Compras',
  'Assinaturas',
  'Lazer',
  'Moradia',
  'Outros',
]

export const CARD_BRANDS = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'elo', label: 'Elo' },
  { value: 'amex', label: 'American Express' },
  { value: 'hipercard', label: 'Hipercard' },
  { value: 'other', label: 'Outra' },
]
