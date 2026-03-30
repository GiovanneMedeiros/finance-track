import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

import { Card } from '@/components/ui/Card'

export function SummaryCard({ title, value, accent, icon, trend }) {
  const isPositive = trend >= 0
  const Icon = icon

  return (
    <Card className="metric-glow animated-enter border-slate-900/10 p-5 transition-colors duration-300 dark:border-white/10 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-[13px] text-[var(--text-secondary)]">{title}</p>
          <strong className="block truncate text-2xl font-semibold text-slate-950 dark:text-white sm:text-[1.7rem]">{value}</strong>
        </div>

        <div
          className="shrink-0 rounded-xl p-2.5"
          style={{ backgroundColor: `${accent}24`, color: accent }}
        >
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
          style={{
            backgroundColor: isPositive ? 'rgba(94,234,212,0.12)' : 'rgba(251,113,133,0.12)',
            color: isPositive ? 'var(--income)' : 'var(--expense)',
          }}
        >
          {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(trend)}%
        </span>
        <span>em relacao ao periodo anterior</span>
      </div>
    </Card>
  )
}