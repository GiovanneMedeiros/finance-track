import { useMemo, useState } from 'react'
import { ArrowRightLeft, Wallet2 } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { AddTransactionForm } from '@/components/dashboard/AddTransactionForm'
import { EditBalanceModal } from '@/components/dashboard/EditBalanceModal'
import { EditGoalModal } from '@/components/dashboard/EditGoalModal'
import { FinanceChart } from '@/components/dashboard/FinanceChart'
import { MetricsGrid } from '@/components/dashboard/MetricsGrid'
import { PremiumCheckoutModal } from '@/components/dashboard/PremiumCheckoutModal'
import { PremiumInsightsCard } from '@/components/dashboard/PremiumInsightsCard'
import { PremiumUpgradeCard } from '@/components/dashboard/PremiumUpgradeCard'
import { TransactionFilters } from '@/components/dashboard/TransactionFilters'
import { TransactionList } from '@/components/dashboard/TransactionList'
import { UploadInvoiceModal } from '@/components/invoice/UploadInvoiceModal'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCustomBalance } from '@/hooks/useCustomBalance'
import { useTransactions } from '@/hooks/useTransactions'
import { useUserPlan } from '@/hooks/useUserPlan'
import {
  buildCategoryFilters,
  buildMonthlyForecast,
  buildSpendingInsights,
  filterTransactions,
} from '@/utils/finance'
import { formatCurrency, formatLongDate } from '@/utils/formatters'

function getHealthStatus(score) {
  if (score >= 80) return 'Excelente'
  if (score >= 50) return 'Bom'
  if (score >= 20) return 'Atenção'
  return 'Precisa melhorar'
}

export function DashboardPage({ onSignOut }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [isBalanceOpen, setIsBalanceOpen] = useState(false)
  const [isGoalOpen, setIsGoalOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [draftBalance, setDraftBalance] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [monthlyGoal, setMonthlyGoal] = useState({ target: 1500, current: 930 })

  const {
    transactions,
    chartData,
    loading,
    error,
    summary,
    addTransaction,
    addTransactions,
    removeTransaction,
  } = useTransactions()
  const { profile, isPremium, upgradeToPremium } = useUserPlan()
  const { customBalance, updateCustomBalance } = useCustomBalance()

  const baseBalance = customBalance != null ? customBalance : summary.balance
  const currentBalanceValue = draftBalance != null ? draftBalance : baseBalance
  const displayBalance = formatCurrency(currentBalanceValue)
  const transactionCount = transactions.length

  const categoryFilters = useMemo(() => buildCategoryFilters(transactions), [transactions])
  const visibleTransactions = useMemo(
    () => filterTransactions(transactions, selectedCategory),
    [transactions, selectedCategory],
  )
  const spendingInsights = useMemo(() => buildSpendingInsights(transactions), [transactions])
  const monthlyForecast = useMemo(() => buildMonthlyForecast(transactions), [transactions])

  const healthScore = useMemo(() => {
    if (!summary.income) return 0
    return Math.min(100, Math.max(0, (summary.total / summary.income) * 100))
  }, [summary.total, summary.income])
  const health = useMemo(() => getHealthStatus(healthScore), [healthScore])
  const healthProgress = Math.max(0, Math.min(100, healthScore))

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  const openInvoice = () => setIsInvoiceOpen(true)
  const closeInvoice = () => setIsInvoiceOpen(false)
  const openBalance = () => setIsBalanceOpen(true)
  const closeBalance = () => setIsBalanceOpen(false)
  const openGoal = () => setIsGoalOpen(true)
  const closeGoal = () => setIsGoalOpen(false)
  const openPremiumModal = () => setIsPremiumModalOpen(true)
  const closePremiumModal = () => setIsPremiumModalOpen(false)

  const handleSaveBalance = async (value) => {
    try {
      await updateCustomBalance(value)
      setDraftBalance(null)
    } catch (err) {
      console.error('Erro ao atualizar saldo:', err)
    }
  }
  const handleDraftBalance = (value) => setDraftBalance(value)
  const handleCloseBalance = () => {
    setDraftBalance(null)
    closeBalance()
  }
  const handleSaveGoal = (goal) => setMonthlyGoal(goal)

  const handleAddTransaction = async (transaction) => {
    await addTransaction(transaction)
    closeModal()
  }

  const handleImportTransactions = async (items) => {
    if (items.length === 0) {
      closeInvoice()
      return
    }

    await addTransactions(items)
    closeInvoice()
  }

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            balanceLabel={displayBalance}
            formattedIncome={summary.formattedIncome}
            formattedExpense={summary.formattedExpense}
            plan={profile.plan}
            isPremium={isPremium}
            onOpenPremium={openPremiumModal}
            onOpenModal={openModal}
            onEditBalance={openBalance}
            monthlyGoal={monthlyGoal}
            onEditGoal={openGoal}
          />
        }
        header={
          <Header
            currentDateLabel={formatLongDate(new Date())}
            transactionCount={transactionCount}
            onOpenModal={openModal}
            onOpenInvoice={openInvoice}
            onSignOut={onSignOut}
          />
        }
      >
        <div className="space-y-5 lg:space-y-6">
          <MetricsGrid summary={summary} displayBalance={displayBalance} />

          <PremiumUpgradeCard
            isPremium={isPremium}
            expiresAt={profile.subscription_expires_at}
            onUpgrade={openPremiumModal}
          />

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_340px] xl:gap-6">
            <FinanceChart
              data={chartData}
              balanceLabel={displayBalance}
              isPremium={isPremium}
            />

            <PremiumInsightsCard
              insights={spendingInsights}
              forecast={monthlyForecast}
            />
          </section>

          <section className="grid gap-5 xl:gap-6">
            <Card className="animated-enter border-emerald-400/15 p-5 transition-colors duration-300 sm:p-6" strong>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-200/70">
                    Resumo rápido
                  </p>
                  <h3 className="text-xl text-slate-950 dark:text-white">Radar financeiro</h3>
                </div>
                <div className="shrink-0 rounded-xl bg-slate-900/[0.04] p-2.5 text-emerald-600 dark:bg-white/[0.06] dark:text-emerald-300">
                  <Wallet2 size={18} />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-slate-900/10 bg-slate-900/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-[var(--text-secondary)]">Receitas no período</span>
                    <Wallet2 size={16} className="text-emerald-300" />
                  </div>
                  <strong className="mt-2 block text-xl text-slate-950 dark:text-white">
                    {summary.formattedIncome}
                  </strong>
                </div>

                <div className="rounded-2xl border border-slate-900/10 bg-slate-900/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-[var(--text-secondary)]">Despesas no período</span>
                    <ArrowRightLeft size={16} className="text-rose-300" />
                  </div>
                  <strong className="mt-2 block text-xl text-slate-950 dark:text-white">
                    {summary.formattedExpense}
                  </strong>
                </div>

                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/8 p-4">
                  <p className="text-[13px] text-emerald-900 dark:text-emerald-100">
                    Seu saldo atual está {currentBalanceValue >= 0 ? 'positivo' : 'negativo'}.
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-900/70 dark:text-emerald-100/70">
                    Use os filtros por categoria para identificar os maiores impactos do mês.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-900/10 bg-slate-900/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-[var(--text-secondary)]">Saúde financeira</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-300/10 dark:text-emerald-200">
                      {health}
                    </span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-900/10 dark:bg-white/10">
                    <div className="h-full rounded-full bg-emerald-400 transition-all duration-300" style={{ width: `${healthProgress}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">{healthProgress}% do seu objetivo de equilíbrio financeiro</p>
                </div>

                <Button className="w-full" variant="secondary" onClick={openModal}>
                  Registrar nova transação
                </Button>
              </div>
            </Card>
          </section>

          <section className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-6">
            <TransactionFilters
              categories={categoryFilters}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />

            {loading && transactions.length === 0 ? (
              <EmptyState
                title="Buscando transações"
                description="Aguarde enquanto carregamos seus dados do Supabase."
                action={
                  <Button variant="secondary" onClick={openModal}>
                    Adicionar transação
                  </Button>
                }
              />
            ) : error ? (
              <EmptyState
                title="Falha ao carregar"
                description={error}
                action={
                  <Button variant="secondary" onClick={openModal}>
                    Tentar novamente
                  </Button>
                }
              />
            ) : (
              <TransactionList
                transactions={visibleTransactions}
                onRemove={removeTransaction}
              />
            )}
          </section>
        </div>
      </AppShell>

      <Modal
        open={isModalOpen}
        title="Nova transação"
        description="Registre receitas e despesas com categoria, valor e data. Os dados ficam salvos localmente no navegador."
        onClose={closeModal}
      >
        <AddTransactionForm
          onSubmit={handleAddTransaction}
          onCancel={closeModal}
        />
      </Modal>

      <UploadInvoiceModal
        open={isInvoiceOpen}
        onClose={closeInvoice}
        onImport={handleImportTransactions}
      />

      <EditBalanceModal
        open={isBalanceOpen}
        currentBalance={currentBalanceValue}
        onSave={handleSaveBalance}
        onChange={handleDraftBalance}
        onClose={handleCloseBalance}
      />

      <EditGoalModal
        open={isGoalOpen}
        currentGoal={monthlyGoal}
        onSave={handleSaveGoal}
        onClose={closeGoal}
      />

      <PremiumCheckoutModal
        open={isPremiumModalOpen}
        onClose={closePremiumModal}
        onUpgrade={upgradeToPremium}
        isPremium={isPremium}
        expiresAt={profile.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR') : null}
      />
    </>
  )
}
