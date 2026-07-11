import { useMemo, useState } from 'react'
import { Search, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { PremiumCheckoutModal } from '@/components/dashboard/PremiumCheckoutModal'
import { useTransactions } from '@/hooks/useTransactions'
import { useUserPlan } from '@/hooks/useUserPlan'
import { formatCurrency } from '@/utils/formatters'
import { AddTransactionForm } from '@/components/dashboard/AddTransactionForm'
import { TransactionList } from '@/components/dashboard/TransactionList'
import { formatLongDate } from '@/utils/formatters'

const typeOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'income', label: 'Receitas' },
  { value: 'expense', label: 'Despesas' },
]

export function TransactionsPage({ onSignOut }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  const { transactions, loading, error, addTransaction, updateTransaction, removeTransaction, summary } = useTransactions()
  const { profile, isPremium } = useUserPlan()

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchesSearch = search
        ? item.title.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase())
        : true
      const matchesType = typeFilter ? item.type === typeFilter : true
      return matchesSearch && matchesType
    })
  }, [transactions, search, typeFilter])

  const openNewTransaction = () => {
    setEditingTransaction(null)
    setIsModalOpen(true)
  }

  const openEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  const handleSubmitTransaction = async (values) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, values)
    } else {
      await addTransaction(values)
    }
    closeModal()
  }

  const totals = [
    {
      title: 'Saldo atual',
      value: formatCurrency(summary.total),
      description: 'Com base nas transações registradas.',
      icon: <ArrowUpRight size={20} />,
    },
    {
      title: 'Receitas',
      value: formatCurrency(summary.income),
      description: 'Total de entradas no período.',
      icon: <Plus size={20} />,
    },
    {
      title: 'Despesas',
      value: formatCurrency(summary.expense),
      description: 'Total de saídas no período.',
      icon: <ArrowDownRight size={20} />,
    },
  ]

  return (
    <AppShell
      sidebar={
        <Sidebar
          balanceLabel={formatCurrency(summary.total)}
          formattedIncome={formatCurrency(summary.income)}
          formattedExpense={formatCurrency(summary.expense)}
          plan={profile?.plan}
          isPremium={isPremium}
          onOpenPremium={() => setIsPremiumModalOpen(true)}
          onOpenModal={openNewTransaction}
          onEditBalance={() => null}
          monthlyGoal={null}
          onEditGoal={() => null}
        />
      }
      header={
        <Header
          currentDateLabel={formatLongDate(new Date())}
          transactionCount={transactions.length}
          onOpenModal={openNewTransaction}
          onOpenInvoice={() => null}
          onSignOut={onSignOut}
        />
      }
    >
      <div className="space-y-6">
        <SectionHeader
          title="Transações"
          description="Controle completo das suas entradas e saídas com filtros, busca e edição rápida."
          right={
            <Button variant="secondary" onClick={openNewTransaction}>
              <Plus size={16} /> Nova transação
            </Button>
          }
        />

        <div className="grid gap-5 xl:grid-cols-[1.6fr_380px] xl:gap-6">
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-[1fr_300px] xl:grid-cols-[1.2fr_380px]">
              <div className="rounded-3xl border border-slate-900/10 bg-slate-950/[0.03] p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Buscar transação</label>
                <div className="mt-3 flex items-center gap-2 rounded-3xl border border-slate-900/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950/5">
                  <Search size={18} className="text-slate-500" />
                  <input
                    className="w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                    placeholder="Título ou categoria"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-900/10 bg-slate-950/[0.03] p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Filtrar tipo</label>
                <select
                  className="mt-3 w-full rounded-3xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition dark:border-white/10 dark:bg-slate-950/80 dark:text-white"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {totals.map((item) => (
                <Card key={item.title} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-200/70">{item.title}</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
                    </div>
                    <div className="h-12 w-12 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      {item.icon}
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-[var(--text-secondary)]">{item.description}</p>
                </Card>
              ))}
            </div>

            {error ? (
              <Card className="p-5 text-rose-600">Erro: {error}</Card>
            ) : null}

            {loading ? (
              <Card className="p-5">Carregando transações...</Card>
            ) : filteredTransactions.length === 0 ? (
              <EmptyState
                title="Nenhuma transação encontrada"
                description="Adicione a primeira transação para acompanhar seu fluxo de caixa." 
                action={<Button onClick={openNewTransaction}>Adicionar transação</Button>}
              />
            ) : (
              <TransactionList
                transactions={filteredTransactions}
                onRemove={removeTransaction}
                onEdit={openEditTransaction}
              />
            )}
          </div>

          <div className="space-y-5">
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-slate-950/5">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Exportação CSV</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Exporte suas transações em CSV para contabilidade e análise externa.</p>
              </div>
              <div className="rounded-3xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-slate-950/5">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Etiquetas e observações</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Organize categorias automáticas e adicione notas detalhadas à transação.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        title={editingTransaction ? 'Editar transação' : 'Nova transação'}
        description={editingTransaction ? 'Atualize os dados desta transação.' : 'Registre uma nova receita ou despesa.'}
        onClose={closeModal}
      >
        <AddTransactionForm
          initialValues={editingTransaction}
          onSubmit={handleSubmitTransaction}
          onCancel={closeModal}
        />
      </Modal>

      <PremiumCheckoutModal
        open={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={() => setIsPremiumModalOpen(false)}
        isPremium={isPremium}
        expiresAt={profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR') : null}
      />
    </AppShell>
  )
}
