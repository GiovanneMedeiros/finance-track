import { Edit2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatters'

export function CardsList({ cards, onEdit, onDelete }) {
  if (cards.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const usagePercent = card.limit > 0 ? Math.round((card.current_usage / card.limit) * 100) : 0
        const availableLimit = card.limit - card.current_usage

        return (
          <div
            key={card.id}
            className="group overflow-hidden rounded-2xl border border-slate-900/10 bg-gradient-to-br from-white to-slate-50 p-4 transition-all duration-200 hover:border-slate-900/20 dark:border-white/10 dark:from-slate-900/40 dark:to-slate-900/20 dark:hover:border-white/20 md:p-5"
            style={{
              borderTop: `4px solid ${card.color}`,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white truncate">{card.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{card.bank} •••• {card.last_digits}</p>
              </div>

              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-slate-950 dark:hover:text-white"
                  onClick={() => onEdit(card)}
                  aria-label="Editar cartão"
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500"
                  onClick={() => onDelete(card.id)}
                  aria-label="Deletar cartão"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            {/* Limit info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--text-secondary)]">Limite disponível</span>
                <span className="text-sm font-semibold text-slate-950 dark:text-white">{formatCurrency(availableLimit)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-900/10 overflow-hidden dark:bg-white/10">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${usagePercent}%`,
                    backgroundColor: card.color,
                  }}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[var(--text-secondary)]">Uso: {formatCurrency(card.current_usage)} / {formatCurrency(card.limit)}</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{usagePercent}%</span>
              </div>
            </div>

            {/* Due date info */}
            <div className="pt-3 border-t border-slate-900/10 dark:border-white/10">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[var(--text-secondary)]">Fechamento</p>
                  <p className="font-semibold text-slate-950 dark:text-white">Dia {card.closing_day}</p>
                </div>
                <div>
                  <p className="text-[var(--text-secondary)]">Vencimento</p>
                  <p className="font-semibold text-slate-950 dark:text-white">Dia {card.due_day}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {card.notes && (
              <div className="mt-3 pt-3 border-t border-slate-900/10 dark:border-white/10">
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{card.notes}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
