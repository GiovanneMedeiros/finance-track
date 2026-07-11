import { useMemo, useState } from 'react'
import { Plus, Eye, Lock } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { DataTable } from '@/components/ui/DataTable'
import { PremiumCheckoutModal } from '@/components/dashboard/PremiumCheckoutModal'
import { useCategories } from '@/hooks/useCategories'
import { useUserPlan } from '@/hooks/useUserPlan'
import { formatLongDate } from '@/utils/formatters'

const categoryTypes = [
  { value: 'expense', label: 'Despesa' },
  { value: 'income', label: 'Receita' },
]

const defaultFormValues = {
  name: '',
  type: 'expense',
  color: '#34d399',
  icon: '💳',
}

export function CategoriesPage({ onSignOut }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [formValues, setFormValues] = useState(defaultFormValues)
  const [editingCategory, setEditingCategory] = useState(null)

  const { categories, loading, error, addCategory, updateCategory, removeCategory } = useCategories()
  const { profile, isPremium } = useUserPlan()

  const categorySummary = useMemo(() => {
    const grouped = categories.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      },
      {},
    )
    return {
      income: grouped.income || 0,
      expense: grouped.expense || 0,
      total: categories.length,
    }
  }, [categories])

  const openNewCategory = () => {
    setEditingCategory(null)
    setFormValues(defaultFormValues)
    setIsModalOpen(true)
  }

  const openEditCategory = (category) => {
    setEditingCategory(category)
    setFormValues({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormValues(defaultFormValues)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (editingCategory) {
      await updateCategory(editingCategory.id, formValues)
    } else {
      await addCategory(formValues)
    }
    closeModal()
  }

  const columns = [
    { key: 'name', title: 'Categoria', render: (item) => (
        <div className="flex items-center gap-3">
          <span className="text-xl">{item.icon}</span>
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">{item.name}</p>
            <p className="text-xs text-[var(--text-secondary)]">{item.type}</p>
          </div>
        </div>
      ),
    },
    { key: 'color', title: 'Cor', render: (item) => (
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: item.color }} />
      ),
    },
    { key: 'created_at', title: 'Criada em', render: (item) => new Date(item.created_at).toLocaleDateString('pt-BR') },
    { key: 'actions', title: 'Ações', render: (item) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={() => openEditCategory(item)}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => removeCategory(item.id)}>
            ✕
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AppShell
      sidebar={
        <Sidebar
          balanceLabel={`R$ 0,00`}
          formattedIncome="R$ 0,00"
          formattedExpense="R$ 0,00"
          plan={profile?.plan}
          isPremium={isPremium}
          onOpenPremium={() => setIsPremiumModalOpen(true)}
          onOpenModal={() => null}
          onEditBalance={() => null}
          monthlyGoal={null}
          onEditGoal={() => null}
        />
      }
      header={
        <Header
          currentDateLabel={formatLongDate(new Date())}
          transactionCount={categories.length}
          onOpenModal={openNewCategory}
          onOpenInvoice={() => null}
          onSignOut={onSignOut}
        />
      }
    >
      <div className="space-y-6">
        <SectionHeader
          title="Categorias"
          description="Agrupe receitas e despesas com categorias simples e personalizadas."
          right={
            <Button variant="secondary" onClick={openNewCategory}>
              <Plus size={16} /> Nova categoria
            </Button>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_340px]">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-200/70">Categorias totais</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{categorySummary.total}</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-200/70">Receitas</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{categorySummary.income}</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-200/70">Despesas</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{categorySummary.expense}</p>
              </Card>
            </div>

            {error ? (
              <Card className="p-5 text-rose-600">Erro: {error}</Card>
            ) : null}

            {loading ? (
              <Card className="p-5">Carregando categorias...</Card>
            ) : categories.length === 0 ? (
              <EmptyState
                title="Nenhuma categoria cadastrada"
                description="Crie categorias para organizar melhor suas receitas e despesas." 
                action={<Button onClick={openNewCategory}>Criar categoria</Button>}
              />
            ) : (
              <DataTable
                columns={columns}
                data={categories}
                rowKey={(item) => item.id}
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-slate-950/5">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Subcategorias inteligentes</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Organize seus gastos em grupos e receba avisos quando estiver próximo do limite.</p>
            </div>
            <div className="rounded-3xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-slate-950/5">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Regras automáticas</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Atribua categorias com base em condições e deixe o app trabalhar por você.</p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        title={editingCategory ? 'Editar categoria' : 'Nova categoria'}
        description={editingCategory ? 'Ajuste os detalhes desta categoria.' : 'Crie uma categoria de receita ou despesa.'}
        onClose={closeModal}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nome</label>
            <input
              className="mt-2 w-full rounded-3xl border border-slate-900/10 bg-white px-4 py-3 text-slate-950 outline-none transition dark:border-white/10 dark:bg-slate-950/80 dark:text-white"
              value={formValues.name}
              onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
              placeholder="Ex.: Alimentação"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Tipo</label>
              <select
                className="mt-2 w-full rounded-3xl border border-slate-900/10 bg-white px-4 py-3 text-slate-950 outline-none transition dark:border-white/10 dark:bg-slate-950/80 dark:text-white"
                value={formValues.type}
                onChange={(event) => setFormValues((current) => ({ ...current, type: event.target.value }))}
              >
                {categoryTypes.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Cor</label>
              <input
                className="mt-2 h-12 w-full rounded-3xl border border-slate-900/10 bg-white px-4 py-3 text-slate-950 outline-none transition dark:border-white/10 dark:bg-slate-950/80 dark:text-white"
                type="color"
                value={formValues.color}
                onChange={(event) => setFormValues((current) => ({ ...current, color: event.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Ícone</label>
            <input
              className="mt-2 w-full rounded-3xl border border-slate-900/10 bg-white px-4 py-3 text-slate-950 outline-none transition dark:border-white/10 dark:bg-slate-950/80 dark:text-white"
              value={formValues.icon}
              onChange={(event) => setFormValues((current) => ({ ...current, icon: event.target.value }))}
              placeholder="Ex.: 💳"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">Salvar categoria</Button>
          </div>
        </form>
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
