import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatCurrency, formatShortDate } from '@/utils/formatters'

const typeStyles = {
  income: 'bg-emerald-300/12 text-emerald-200',
  expense: 'bg-rose-300/12 text-rose-200',
}

export function TransactionList({ transactions, onRemove }) {
  return (
    <Card className="animated-enter border-slate-900/10 p-5 transition-colors duration-300 dark:border-white/10 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-200/70">
            Historico
          </p>
          <h3 className="text-lg text-slate-950 dark:text-white">Ultimas transacoes</h3>
        </div>
        <p className="text-[13px] text-[var(--text-secondary)]">
          {transactions.length} registros exibidos
        </p>
      </div>

      <div className="mt-4 space-y-2.5">
        {transactions.map((transaction) => (
          <article
            key={transaction.id}
            className="group flex flex-col gap-3 rounded-2xl border border-slate-900/10 bg-slate-900/[0.03] p-3.5 transition hover:border-slate-900/15 hover:bg-slate-900/[0.05] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/15 dark:hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  'mt-0.5 inline-flex rounded-xl px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]',
                  typeStyles[transaction.type],
                ].join(' ')}
              >
                {transaction.type === 'income' ? 'Receita' : 'Despesa'}
              </div>

              <div>
                <strong className="block text-[14px] text-slate-950 dark:text-white">{transaction.title}</strong>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                  <span>{transaction.category}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-500" />
                  <span>{formatShortDate(transaction.date)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <strong
                className={transaction.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </strong>

              <Button
                aria-label={`Remover ${transaction.title}`}
                size="icon"
                variant="ghost"
                className="text-[var(--text-secondary)] hover:text-rose-200"
                onClick={() => onRemove(transaction.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </Card>
  )
}