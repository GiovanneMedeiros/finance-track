import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/formatters'

export function FinanceChart({ data, balanceLabel }) {
  return (
    <Card className="animated-enter border-slate-900/10 p-5 transition-colors duration-300 dark:border-white/10 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-200/70">
            Receitas vs despesas
          </p>
          <h3 className="text-xl text-slate-950 dark:text-white">Fluxo de caixa</h3>
        </div>

        <div className="rounded-xl border border-slate-900/10 bg-slate-900/[0.04] px-3.5 py-2.5 text-[13px] text-[var(--text-secondary)] dark:border-white/10 dark:bg-white/[0.04]">
          Saldo projetado: <span className="font-semibold text-slate-950 dark:text-white">{balanceLabel}</span>
        </div>
      </div>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={52}>
            <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={96}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{
                borderRadius: '20px',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                background: 'rgba(15, 23, 42, 0.98)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
              }}
              formatter={(value) => formatCurrency(value)}
            />
            <Bar dataKey="value" radius={[18, 18, 8, 8]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}