import { ArrowUpRight, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function PremiumInsightsCard({ insights, forecast }) {
  return (
    <Card className="border-emerald-400/15 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-700/80 dark:text-emerald-200/70">
            Insights inteligentes
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Análise financeira</h3>
        </div>
        <TrendingUp size={20} className="text-emerald-500" />
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-3xl border border-slate-900/10 bg-slate-900/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-sm text-slate-700 dark:text-slate-300">Categoria mais pesada</p>
          <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
            {insights.topCategory} · {insights.categoryRatio}% das despesas
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{insights.suggestion}</p>
        </div>

        <div className="rounded-3xl border border-slate-900/10 bg-slate-900/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <ArrowUpRight size={16} />
            Previsão para o mês
          </div>
          <p className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">{forecast.projectedBalanceLabel}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Com base no ritmo atual, seu saldo pode chegar a {forecast.projectedBalanceLabel} até o fim do mês.
          </p>
        </div>
      </div>
    </Card>
  )
}
