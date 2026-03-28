import { Landmark, TrendingDown, TrendingUp } from 'lucide-react'

import { SummaryCard } from '@/components/dashboard/SummaryCard'

export function MetricsGrid({ summary }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SummaryCard
        title="Saldo atual"
        value={summary.formattedBalance}
        accent="#34d399"
        icon={Landmark}
        trend={12}
      />
      <SummaryCard
        title="Total de receitas"
        value={summary.formattedIncome}
        accent="#5eead4"
        icon={TrendingUp}
        trend={18}
      />
      <SummaryCard
        title="Total de despesas"
        value={summary.formattedExpense}
        accent="#fb7185"
        icon={TrendingDown}
        trend={-7}
      />
    </div>
  )
}