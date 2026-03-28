import { Trash2 } from 'lucide-react'

import { CATEGORIES } from '@/constants/categories'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatters'

const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }))

export function InvoiceReviewTable({ items, onToggle, onUpdate, onRemove }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-900/10 bg-slate-900/[0.03] p-6 text-center dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-sm text-[var(--text-secondary)]">
          Nenhum lançamento detectado na fatura.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="invoice-scroll max-h-[380px] space-y-2 overflow-y-auto pr-1">
      {items.map((item) => (
        <article
          key={item.id}
          className={[
            'group rounded-2xl border p-4 transition-all duration-200',
            item.selected
              ? 'border-emerald-400/20 bg-emerald-400/[0.04] dark:border-emerald-400/15 dark:bg-emerald-400/[0.03]'
              : 'border-slate-900/8 bg-slate-900/[0.02] opacity-50 dark:border-white/8 dark:bg-white/[0.02]',
          ].join(' ')}
        >
          <div className="flex items-start gap-3">
            <label className="relative mt-1 flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => onToggle(item.id)}
                className="peer sr-only"
              />
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-slate-300/80 bg-white transition dark:border-white/15 dark:bg-white/[0.04]">
                <span className="h-2.5 w-2.5 scale-0 rounded-[3px] bg-emerald-500 transition peer-checked:scale-100 dark:bg-emerald-400" />
              </span>
            </label>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
                    className="w-full truncate border-none bg-transparent text-sm font-medium text-slate-950 outline-none focus:underline focus:decoration-emerald-400/50 focus:underline-offset-4 dark:text-white"
                  />
                  {item.originalDescription && (
                    <p className="mt-0.5 truncate text-[11px] text-[var(--text-secondary)] opacity-60">
                      {item.originalDescription}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <select
                      value={item.category}
                      onChange={(e) => onUpdate(item.id, 'category', e.target.value)}
                      className="rounded-lg border border-slate-900/10 bg-white/80 px-2 py-0.5 text-xs text-[var(--text-secondary)] outline-none dark:border-white/10 dark:bg-white/[0.06]"
                    >
                      {categoryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => onUpdate(item.id, 'date', e.target.value)}
                      className="rounded-lg border border-slate-900/10 bg-white/80 px-2 py-0.5 text-xs text-[var(--text-secondary)] outline-none dark:border-white/10 dark:bg-white/[0.06]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-[var(--text-secondary)]">R$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.amount}
                      onChange={(e) =>
                        onUpdate(item.id, 'amount', Number(e.target.value))
                      }
                      className="w-20 border-none bg-transparent text-right text-sm font-semibold text-rose-500 outline-none focus:underline focus:decoration-emerald-400/50 focus:underline-offset-4 dark:text-rose-300"
                    />
                  </div>

                  <Button
                    aria-label={`Remover ${item.title}`}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-[var(--text-secondary)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-400"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-900/10 bg-slate-900/[0.03] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
        <span className="text-sm text-[var(--text-secondary)]">
          Total selecionado ({items.filter((i) => i.selected).length} itens)
        </span>
        <span className="text-base font-semibold text-rose-500 dark:text-rose-300">
          {formatCurrency(
            items
              .filter((i) => i.selected)
              .reduce((sum, i) => sum + i.amount, 0),
          )}
        </span>
      </div>
    </div>
  )
}
