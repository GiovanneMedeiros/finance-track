import { useMemo, useState } from 'react'
import { Save } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PremiumBadge } from '@/components/ui/PremiumBadge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useMonthlyBudgets } from '@/hooks/useMonthlyBudgets'
import { useTransactions } from '@/hooks/useTransactions'
import { useUserPlan } from '@/hooks/useUserPlan'
import { CATEGORIES } from '@/constants/categories'
import { formatCurrency, formatLongDate } from '@/utils/formatters'

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

export function PlanningPage({ onSignOut }) {
  const { profile, isPremium } = useUserPlan()
  const month = currentMonth()
  const { budgets, loading, error, saveBudget } = useMonthlyBudgets(month)
  const { transactions } = useTransactions()
  const [drafts, setDrafts] = useState({})
  const [savingCategory, setSavingCategory] = useState('')
  const [message, setMessage] = useState('')

  const spentByCategory = useMemo(() => {
    const [year, monthNumber] = month.split('-')
    return transactions
      .filter((item) => item.type === 'expense' && item.date?.startsWith(`${year}-${monthNumber}`))
      .reduce((totals, item) => {
        totals[item.category] = (totals[item.category] || 0) + Number(item.amount)
        return totals
      }, {})
  }, [month, transactions])

  const budgetByCategory = useMemo(
    () => Object.fromEntries(budgets.map((budget) => [budget.category, budget])),
    [budgets],
  )

  const handleSave = async (category) => {
    const value = Number(drafts[category] ?? budgetByCategory[category]?.amount ?? 0)
    if (!Number.isFinite(value) || value <= 0) {
      setMessage('Informe um limite mensal maior que zero.')
      return
    }
    setSavingCategory(category)
    setMessage('')
    try {
      await saveBudget(category, value)
      setMessage(`Limite de ${category} salvo.`)
    } catch (saveError) {
      setMessage(saveError.message || 'Não foi possível salvar o orçamento.')
    } finally {
      setSavingCategory('')
    }
  }

  return (
    <AppShell
      sidebar={<Sidebar balanceLabel="R$ 0,00" formattedIncome="R$ 0,00" formattedExpense="R$ 0,00" plan={profile?.plan} isPremium={isPremium} monthlyGoal={null} />}
      header={<Header currentDateLabel={formatLongDate(new Date())} transactionCount={transactions.length} onSignOut={onSignOut} />}
    >
      <div className="space-y-6">
        <SectionHeader
          title="Planejamento mensal"
          description="Defina limites por categoria e compare com as despesas registradas."
          right={<PremiumBadge />}
        />
        <Card className="p-5">
          <p className="text-sm font-semibold">Orçamento de {new Date(`${month}T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Os valores ficam vinculados à sua conta e podem ser alterados durante o mês.</p>
        </Card>
        {error ? <Card className="p-4 text-sm text-rose-600">{error}</Card> : null}
        {message ? <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
        {loading ? <Card className="p-5">Carregando orçamento...</Card> : (
          <div className="grid gap-4 lg:grid-cols-2">
            {CATEGORIES.map((category) => {
              const budget = budgetByCategory[category]
              const limit = Number(drafts[category] ?? budget?.amount ?? 0)
              const spent = spentByCategory[category] || 0
              const percent = limit > 0 ? (spent / limit) * 100 : 0
              return (
                <Card key={category} className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">{category}</h2>
                    <span className="text-xs text-[var(--text-secondary)]">Gasto: {formatCurrency(spent)}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input
                      aria-label={`Limite mensal para ${category}`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={drafts[category] ?? budget?.amount ?? ''}
                      onChange={(event) => setDrafts((current) => ({ ...current, [category]: event.target.value }))}
                      className="min-w-0 flex-1 rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                      placeholder="Limite mensal (R$)"
                    />
                    <Button aria-label={`Salvar limite para ${category}`} onClick={() => void handleSave(category)} disabled={savingCategory === category}>
                      <Save size={15} /> <span className="hidden sm:inline">{savingCategory === category ? 'Salvando' : 'Salvar'}</span>
                    </Button>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900/10 dark:bg-white/10">
                    <div className={`h-full rounded-full ${percent > 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-400 to-teal-400'}`} style={{ width: `${Math.min(100, percent)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-secondary)]">{limit > 0 ? `${Math.round((spent / limit) * 100)}% de ${formatCurrency(limit)}` : 'Defina um limite para acompanhar a categoria.'}</p>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
