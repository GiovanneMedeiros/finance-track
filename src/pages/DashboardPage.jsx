import { useState } from 'react'
import { ArrowRightLeft, PieChart, Wallet2 } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { AddTransactionForm } from '@/components/dashboard/AddTransactionForm'
import { EditBalanceModal } from '@/components/dashboard/EditBalanceModal'
import { EditGoalModal } from '@/components/dashboard/EditGoalModal'
import { FinanceChart } from '@/components/dashboard/FinanceChart'
import { MetricsGrid } from '@/components/dashboard/MetricsGrid'
import { TransactionFilters } from '@/components/dashboard/TransactionFilters'
import { TransactionList } from '@/components/dashboard/TransactionList'
import { UploadInvoiceModal } from '@/components/invoice/UploadInvoiceModal'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useFinance } from '@/hooks/useFinance'
import { formatLongDate } from '@/utils/formatters'

export function DashboardPage({ onSignOut }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [isBalanceOpen, setIsBalanceOpen] = useState(false)
  const [isGoalOpen, setIsGoalOpen] = useState(false)
  const {
    summary,
    chartData,
    visibleTransactions,
    categoryFilters,
    selectedCategory,
    setSelectedCategory,
    addTransaction,
    addBatchTransactions,
    removeTransaction,
    transactions,
    customBalance,
    displayBalance,
    formattedDisplayBalance,
    setCustomBalance,
    monthlyGoal,
    setMonthlyGoal,
  } = useFinance()

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const openInvoice = () => setIsInvoiceOpen(true)
  const closeInvoice = () => setIsInvoiceOpen(false)

  const openBalance = () => setIsBalanceOpen(true)
  const closeBalance = () => setIsBalanceOpen(false)

  const openGoal = () => setIsGoalOpen(true)
  const closeGoal = () => setIsGoalOpen(false)

  const handleSaveBalance = (value) => {
    setCustomBalance(value)
  }

  const handleSaveGoal = (goal) => {
    setMonthlyGoal(goal)
  }

  const handleAddTransaction = (transaction) => {
    addTransaction(transaction)
    closeModal()
  }

  const handleImportTransactions = (items) => {
    addBatchTransactions(items)
  }

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            balanceLabel={formattedDisplayBalance}
            formattedIncome={summary.formattedIncome}
            formattedExpense={summary.formattedExpense}
            onOpenModal={openModal}
            onEditBalance={openBalance}
            monthlyGoal={monthlyGoal}
            onEditGoal={openGoal}
          />
        }
        header={
          <Header
            currentDateLabel={formatLongDate(new Date())}
            transactionCount={transactions.length}
            onOpenModal={openModal}
            onOpenInvoice={openInvoice}
            onSignOut={onSignOut}
          />
        }
      >
        <div className="space-y-5 lg:space-y-6">
          <MetricsGrid summary={summary} />

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_340px] xl:gap-6">
            <FinanceChart data={chartData} balanceLabel={summary.formattedBalance} />

            <Card className="animated-enter border-emerald-400/15 p-5 transition-colors duration-300 sm:p-6" strong>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-200/70">
                    Insight rapido
                  </p>
                  <h3 className="text-xl text-slate-950 dark:text-white">Radar financeiro</h3>
                </div>
                <div className="shrink-0 rounded-xl bg-slate-900/[0.04] p-2.5 text-emerald-600 dark:bg-white/[0.06] dark:text-emerald-300">
                  <PieChart size={18} />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-slate-900/10 bg-slate-900/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-[var(--text-secondary)]">Receitas no periodo</span>
                    <Wallet2 size={16} className="text-emerald-300" />
                  </div>
                  <strong className="mt-2 block text-xl text-slate-950 dark:text-white">
                    {summary.formattedIncome}
                  </strong>
                </div>

                <div className="rounded-2xl border border-slate-900/10 bg-slate-900/[0.04] p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-[var(--text-secondary)]">Despesas no periodo</span>
                    <ArrowRightLeft size={16} className="text-rose-300" />
                  </div>
                  <strong className="mt-2 block text-xl text-slate-950 dark:text-white">
                    {summary.formattedExpense}
                  </strong>
                </div>

                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/8 p-4">
                  <p className="text-[13px] text-emerald-900 dark:text-emerald-100">
                    Seu saldo esta {summary.balance >= 0 ? 'positivo' : 'negativo'}.
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-900/70 dark:text-emerald-100/70">
                    Use os filtros por categoria para entender onde estao os maiores impactos no mes.
                  </p>
                </div>

                <Button className="w-full" variant="secondary" onClick={openModal}>
                  Registrar novo lancamento
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

            <TransactionList
              transactions={visibleTransactions}
              onRemove={removeTransaction}
            />
          </section>
        </div>
      </AppShell>

      <Modal
        open={isModalOpen}
        title="Nova transacao"
        description="Adicione receitas e despesas com categoria, valor e data. Os dados ficam salvos localmente no navegador."
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
        currentBalance={displayBalance}
        onSave={handleSaveBalance}
        onClose={closeBalance}
      />

      <EditGoalModal
        open={isGoalOpen}
        currentGoal={monthlyGoal}
        onSave={handleSaveGoal}
        onClose={closeGoal}
      />
    </>
  )
}