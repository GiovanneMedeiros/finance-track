import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/formatters'

function localDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')
}

export function CardPurchaseList({ purchases, cards, onEdit, onDelete, mutating = false }) {
  const cardById = Object.fromEntries(cards.map((card) => [card.id, card]))

  if (!purchases.length) {
    return <Card className="p-5 text-sm text-[var(--text-secondary)]">Nenhuma compra encontrada com esses filtros.</Card>
  }

  return (
    <div className="space-y-2">
      {purchases.map((purchase) => {
        const card = cardById[purchase.card_id]
        return (
          <Card key={purchase.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{purchase.title}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {localDate(purchase.purchase_date)} · {purchase.category} · {card?.nickname || card?.name || 'Cartão arquivado'}
              </p>
              {purchase.installments_count > 1 ? (
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{purchase.installments_count} parcelas de aproximadamente {formatCurrency(Number(purchase.amount) / purchase.installments_count)}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <strong>{formatCurrency(Number(purchase.amount))}</strong>
              <Button size="icon" variant="ghost" aria-label={`Editar ${purchase.title}`} onClick={() => onEdit(purchase)} disabled={mutating}><Pencil size={15} /></Button>
              <Button size="icon" variant="ghost" aria-label={`Excluir ${purchase.title}`} onClick={() => onDelete(purchase)} disabled={mutating}><Trash2 size={15} /></Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
