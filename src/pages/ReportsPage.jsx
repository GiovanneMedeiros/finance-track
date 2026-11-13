import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PremiumBadge } from '@/components/ui/PremiumBadge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useTransactions } from '@/hooks/useTransactions'
import { useUserPlan } from '@/hooks/useUserPlan'
import { formatCurrency, formatLongDate } from '@/utils/formatters'

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function ReportsPage({ onSignOut }) {
  const { profile, isPremium } = useUserPlan()
  const { transactions, loading, error } = useTransactions()

  const report = useMemo(() => {
    const now = new Date()
    const currentMonth = monthKey(now)
    const currentTransactions = transactions.filter((item) => item.date?.startsWith(currentMonth))
    const income = currentTransactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount), 0)
    const expense = currentTransactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount), 0)

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
      const key = monthKey(date)
      const monthTransactions = transactions.filter((item) => item.date?.startsWith(key))
      return {
        name: date.toLocaleDateString('pt-BR', { month: 'short' }),
        receitas: monthTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0),
        despesas: monthTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0),
      }
    })

    const categories = currentTransactions
      .filter((item) => item.type === 'expense')
      .reduce((totals, item) => {
        totals[item.category] = (totals[item.category] || 0) + Number(item.amount)
        return totals
      }, {})

    return {
      income,
      expense,
      balance: income - expense,
      months,
      categories: Object.entries(categories).sort((a, b) => b[1] - a[1]),
    }
  }, [transactions])

  return (
    <AppShell
      sidebar={<Sidebar balanceLabel={formatCurrency(report.balance)} formattedIncome={formatCurrency(report.income)} formattedExpense={formatCurrency(report.expense)} plan={profile?.plan} isPremium={isPremium} monthlyGoal={null} />}
      header={<Header currentDateLabel={formatLongDate(new Date())} transactionCount={transactions.length} onSignOut={onSignOut} />}
    >
      <div className="space-y-6">
        <SectionHeader
          title="Relatórios"
          description="Resumo do mês atual e evolução das suas receitas e despesas registradas."
          right={<PremiumBadge />}
        />
        {error ? <Card className="p-4 text-sm text-rose-600">{error}</Card> : null}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Receitas no mês', amount: report.income, color: 'text-emerald-600 dark:text-emerald-300' },
            { label: 'Despesas no mês', amount: report.expense, color: 'text-rose-600 dark:text-rose-300' },
            { label: 'Saldo do mês', amount: report.balance, color: 'text-sky-700 dark:text-sky-300' },
          ].map((item) => <Card key={item.label} className="p-5"><p className="text-sm text-[var(--text-secondary)]">{item.label}</p><p className={`mt-3 text-2xl font-bold ${item.color}`}>{formatCurrency(item.amount)}</p></Card>)}
        </div>

        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Últimos seis meses</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Valores calculados com base nas transações salvas.</p>
          {loading ? <p className="mt-6 text-sm text-[var(--text-secondary)]">Carregando transações...</p> : transactions.length === 0 ? (
            <div className="mt-4"><EmptyState title="Sem dados para comparar" description="Registre transações para gerar seu relatório mensal." /></div>
          ) : (
            <div className="mt-5 h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.months} barGap={5}>
                  <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="receitas" fill="#34d399" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="despesas" fill="#fb7185" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Despesas por categoria neste mês</h2>
          {report.categories.length ? (
            <div className="mt-4 space-y-3">
              {report.categories.map(([category, amount]) => {
                const percent = report.expense > 0 ? Math.round((amount / report.expense) * 100) : 0
                return <div key={category}><div className="flex justify-between gap-3 text-sm"><span>{category}</span><span className="text-[var(--text-secondary)]">{formatCurrency(amount)} · {percent}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-900/10 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" style={{ width: `${percent}%` }} /></div></div>
              })}
            </div>
          ) : <p className="mt-3 text-sm text-[var(--text-secondary)]">Nenhuma despesa registrada no mês atual.</p>}
        </Card>
      </div>
    </AppShell>
  )
}
