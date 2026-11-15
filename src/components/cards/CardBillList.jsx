import { CalendarClock, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/formatters'

function getStatus(bill, today) {
  if (bill.status === 'paid') return { label: 'Paga', tone: 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-200' }
  if (bill.due_date < today) return { label: 'Vencida', tone: 'text-rose-700 bg-rose-500/10 dark:text-rose-200' }
  if (bill.closing_date <= today || bill.status === 'closed') {
    return { label: 'Fechada', tone: 'text-sky-700 bg-sky-500/10 dark:text-sky-200' }
  }
  return { label: 'Aberta', tone: 'text-amber-700 bg-amber-500/10 dark:text-amber-200' }
}

function localToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function localDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')
}

export function CardBillList({
  bills,
  installments,
  purchases,
  cards,
  onPay,
  onOpenCard,
  mutating = false,
}) {
  const purchaseById = Object.fromEntries(purchases.map((purchase) => [purchase.id, purchase]))
  const cardById = Object.fromEntries(cards.map((card) => [card.id, card]))
  const today = localToday()

  if (!bills.length) {
    return <Card className="p-5 text-sm text-[var(--text-secondary)]">Ainda não há faturas. As faturas são criadas automaticamente ao registrar compras.</Card>
  }

  return (
    <div className="space-y-3">
      {bills.map((bill) => {
        const status = getStatus(bill, today)
        const billInstallments = installments.filter((item) => item.bill_id === bill.id)
        const openingBalance = Number(bill.opening_balance ?? 0)
        const amount = openingBalance + billInstallments.reduce((sum, item) => sum + Number(item.amount), 0)
        const card = cardById[bill.card_id]
        const includedPurchases = billInstallments.map((item) => ({
          ...item,
          purchase: purchaseById[item.card_transaction_id],
        }))

        return (
          <Card key={bill.id} className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{card?.nickname || card?.name || 'Cartão arquivado'}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.tone}`}>{status.label}</span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Fecha {localDate(bill.closing_date)} · Vence {localDate(bill.due_date)}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {includedPurchases.length} {includedPurchases.length === 1 ? 'parcela' : 'parcelas'} nesta fatura
                </p>
              </div>
              <div className="flex items-center gap-4">
                <strong className="text-lg">{formatCurrency(amount)}</strong>
                {bill.status !== 'paid' ? (
                  <Button size="md" className="h-10" onClick={() => void onPay(bill)} disabled={mutating}>
                    <CheckCircle2 size={15} /> Pagar fatura
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-200">
                    <CheckCircle2 size={14} /> Paga
                  </span>
                )}
              </div>
            </div>
            {includedPurchases.length ? (
              <details className="border-t border-slate-900/5 px-4 py-3 dark:border-white/5">
                <summary className="cursor-pointer text-xs font-medium text-[var(--text-secondary)]">
                  Ver compras incluídas
                </summary>
                <ul className="mt-3 space-y-2">
                  {includedPurchases.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span>
                        {item.purchase?.title || 'Compra'} · parcela {item.installment_number}/{item.purchase?.installments_count ?? 1}
                        {item.purchase?.category ? <span className="ml-2 text-xs text-[var(--text-secondary)]">{item.purchase.category}</span> : null}
                      </span>
                      <span className="font-medium">{formatCurrency(Number(item.amount))}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
            {openingBalance > 0 ? (
              <p className="border-t border-slate-900/5 px-4 py-2 text-xs text-[var(--text-secondary)] dark:border-white/5">
                Inclui {formatCurrency(openingBalance)} de saldo anterior não detalhado por compras.
              </p>
            ) : null}
            {onOpenCard ? (
              <div className="border-t border-slate-900/5 px-4 py-2 text-right dark:border-white/5">
                <button type="button" className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-emerald-600" onClick={() => onOpenCard(bill.card_id)}>
                  <CalendarClock size={13} /> Ver cartão
                </button>
              </div>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}
