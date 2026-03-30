import clsx from 'clsx'

import { Card } from '@/components/ui/Card'

export function TransactionFilters({ categories, selectedCategory, onSelect }) {
  return (
    <Card className="animated-enter border-slate-900/10 p-5 transition-colors duration-300 dark:border-white/10 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-200/70">
            Categorias
          </p>
          <h3 className="text-lg text-slate-950 dark:text-white">Filtro por categoria</h3>
        </div>
        <span className="rounded-full border border-slate-900/10 px-2.5 py-0.5 text-[11px] text-[var(--text-secondary)] dark:border-white/10">
          {categories.length - 1} grupos
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {categories.map((category) => {
          const isActive = category.value === selectedCategory

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => onSelect(category.value)}
              className={clsx(
                'rounded-2xl border px-4 py-3 text-left transition',
                isActive
                  ? 'border-emerald-300/30 bg-emerald-300/10 text-slate-950 dark:text-white'
                  : 'border-slate-900/10 bg-slate-900/[0.03] text-[var(--text-secondary)] hover:bg-slate-900/[0.06] hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:hover:text-white',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{category.label}</span>
                <span className="text-xs uppercase tracking-[0.18em]">
                  {category.count}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}