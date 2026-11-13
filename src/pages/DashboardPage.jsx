import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRightLeft, Sparkles, Wallet2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AppShell } from '@/app/AppShell'
import { AddTransactionForm } from '@/components/dashboard/AddTransactionForm'
import { EditBalanceModal } from '@/components/dashboard/EditBalanceModal'
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
import { useMonthlyBudgets } from '@/hooks/useMonthlyBudgets'
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

function getCurrentMonth() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

const MotionSection = motion.section

export function DashboardPage({ onSignOut }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [isBalanceOpen, setIsBalanceOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [draftBalance, setDraftBalance] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const navigate = useNavigate()

  const {
    transactions,
    chartData,
    loading,
    error,
    summary,
    addTransaction,
    removeTransaction,
  } = useTransactions()
  const { profile, isPremium } = useUserPlan()
  const { customBalance, updateCustomBalance } = useCustomBalance()
  const month = getCurrentMonth()
  const { budgets } = useMonthlyBudgets(month)

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
  const monthlyGoal = useMemo(() => {
    const target = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0)
    if (target <= 0) return null
    const [year, monthNumber] = month.split('-')
    const current = transactions
      .filter((item) => item.type === 'expense' && item.date?.startsWith(`${year}-${monthNumber}`))
      .reduce((sum, item) => sum + Number(item.amount), 0)
    return { target, current }
  }, [budgets, month, transactions])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  const openInvoice = () => setIsInvoiceOpen(true)
  const closeInvoice = () => setIsInvoiceOpen(false)
  const openBalance = () => setIsBalanceOpen(true)
  const closeBalance = () => setIsBalanceOpen(false)
  const openPremiumModal = () => setIsPremiumModalOpen(true)
  const closePremiumModal = () => setIsPremiumModalOpen(false)

  const handleSaveBalance = async (value) => {
    await updateCustomBalance(value)
    setDraftBalance(null)
  }
  const handleDraftBalance = (value) => setDraftBalance(value)
  const handleCloseBalance = () => {
    setDraftBalance(null)
    closeBalance()
  }

  const handleAddTransaction = async (transaction) => {
    await addTransaction(transaction)
    closeModal()
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
            onEditGoal={() => navigate('/planning')}
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
          <MotionSection
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="dashboard-hero auth-noise group relative isolate overflow-hidden rounded-[32px] border border-emerald-300/15 bg-[linear-gradient(115deg,#061a18_0%,#0b1722_55%,#171328_100%)] p-6 text-white shadow-[0_30px_90px_-40px_rgba(16,185,129,0.6)] sm:p-8 lg:p-10"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-emerald-400/20 blur-[90px] transition-transform duration-1000 group-hover:scale-125"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-40 right-1/3 h-72 w-72 rounded-full bg-blue-500/15 blur-[90px]"
            />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
                  <Sparkles size={14} className="text-emerald-300" />
                  Sua visão financeira
                </p>
                <div className="space-y-3">
                  <h1 className="max-w-xl text-3xl font-bold leading-[1.08] text-white sm:text-4xl lg:text-5xl">
                    Seu dinheiro.
                    <br />
                    <span className="bg-[linear-gradient(90deg,#34d399,#2dd4bf,#60a5fa)] bg-clip-text text-transparent">
                      Em equilíbrio.
                    </span>
                  </h1>
                  <p className="max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                    Uma visão clara do que entra, do que sai e de como está seu saldo — tudo em um só painel.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button
                    className="h-11 rounded-2xl bg-[linear-gradient(135deg,#10b981,#0d9488)] px-5 text-white shadow-[0_14px_32px_-12px_rgba(16,185,129,0.8)] hover:brightness-110"
                    onClick={openModal}
                  >
                    <Wallet2 size={16} />
                    Registrar transação
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-11 rounded-2xl border border-white/15 bg-white/[0.06] px-5 text-white hover:bg-white/[0.12]"
                    onClick={openInvoice}
                  >
                    Importar fatura
                  </Button>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mx-auto w-full max-w-[390px] rounded-[26px] border border-white/15 bg-white/[0.08] p-5 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-6"
              >
                <div className="card-sheen pointer-events-none absolute inset-0 rounded-[26px] opacity-40" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-300">
                      Saldo disponível
                    </p>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/15 text-emerald-200">
                      <Wallet2 size={17} />
                    </span>
                  </div>
                  <p className="mt-3 truncate font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {displayBalance}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Receitas</p>
                      <p className="mt-1 truncate text-sm font-semibold text-emerald-200">
                        {summary.formattedIncome}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-3">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Despesas</p>
                      <p className="mt-1 truncate text-sm font-semibold text-rose-200">
                        {summary.formattedExpense}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
                      Saúde financeira
                    </span>
                    <span className="font-semibold text-white">{health}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </MotionSection>

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
        description="Registre receitas e despesas com categoria, valor e data. Os dados ficam salvos na sua conta."
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
      />

      {isBalanceOpen ? (
        <EditBalanceModal
          open={isBalanceOpen}
          currentBalance={currentBalanceValue}
          onSave={handleSaveBalance}
          onChange={handleDraftBalance}
          onClose={handleCloseBalance}
        />
      ) : null}

      <PremiumCheckoutModal
        open={isPremiumModalOpen}
        onClose={closePremiumModal}
        isPremium={isPremium}
        expiresAt={profile.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR') : null}
      />
    </>
  )
}
