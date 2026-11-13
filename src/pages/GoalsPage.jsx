import { useState } from 'react'
import { Pencil, Plus, Target, Trash2 } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { PremiumBadge } from '@/components/ui/PremiumBadge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useGoals } from '@/hooks/useGoals'
import { useUserPlan } from '@/hooks/useUserPlan'
import { formatCurrency, formatLongDate } from '@/utils/formatters'

const emptyGoal = {
  title: '',
  description: '',
  target_amount: '',
  current_amount: '',
  target_date: '',
  priority: 1,
  status: 'active',
}

export function GoalsPage({ onSignOut }) {
  const { profile, isPremium } = useUserPlan()
  const { goals, loading, error, saveGoal, removeGoal } = useGoals()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [form, setForm] = useState(emptyGoal)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const openNewGoal = () => {
    setEditingGoal(null)
    setForm(emptyGoal)
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditGoal = (goal) => {
    setEditingGoal(goal)
    setForm({
      ...goal,
      target_amount: String(goal.target_amount),
      current_amount: String(goal.current_amount ?? 0),
      target_date: goal.target_date ?? '',
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const target = Number(form.target_amount)
    const current = Number(form.current_amount || 0)
    if (!form.title.trim() || !Number.isFinite(target) || target <= 0 || !Number.isFinite(current) || current < 0 || current > target) {
      setFormError('Informe um título, um valor-alvo positivo e um progresso entre zero e o valor-alvo.')
      return
    }

    setSaving(true)
    setFormError('')
    try {
      await saveGoal({
        title: form.title.trim(),
        description: form.description.trim() || null,
        target_amount: target,
        current_amount: current,
        target_date: form.target_date || null,
        priority: Number(form.priority) || 1,
        status: form.status,
      }, editingGoal?.id)
      setIsModalOpen(false)
    } catch (saveError) {
      setFormError(saveError.message || 'Não foi possível salvar a meta.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (goal) => {
    if (!window.confirm(`Excluir a meta "${goal.title}"?`)) return
    try {
      await removeGoal(goal.id)
    } catch {
      // The hook exposes the failure in the page-level error state.
    }
  }

  return (
    <AppShell
      sidebar={
        <Sidebar
          balanceLabel="R$ 0,00"
          formattedIncome="R$ 0,00"
          formattedExpense="R$ 0,00"
          plan={profile?.plan}
          isPremium={isPremium}
          monthlyGoal={null}
        />
      }
      header={<Header currentDateLabel={formatLongDate(new Date())} transactionCount={0} onSignOut={onSignOut} />}
    >
      <div className="space-y-6">
        <SectionHeader
          title="Metas"
          description="Defina objetivos financeiros e acompanhe seu progresso."
          right={
            <div className="flex items-center gap-3">
              <PremiumBadge />
              <Button onClick={openNewGoal}><Plus size={16} /> Nova meta</Button>
            </div>
          }
        />

        {error ? <Card className="p-4 text-sm text-rose-600">{error}</Card> : null}
        {loading ? (
          <Card className="p-5">Carregando metas...</Card>
        ) : goals.length === 0 ? (
          <EmptyState title="Nenhuma meta criada" description="Crie uma meta para acompanhar seu progresso." action={<Button onClick={openNewGoal}><Plus size={16} /> Criar meta</Button>} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => {
              const target = Number(goal.target_amount)
              const current = Number(goal.current_amount ?? 0)
              const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
              return (
                <Card key={goal.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-300"><Target size={19} /></span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-semibold">{goal.title}</h2>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">{goal.description || 'Sem descrição'}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" aria-label="Editar meta" onClick={() => openEditGoal(goal)}><Pencil size={15} /></Button>
                      <Button size="icon" variant="ghost" aria-label="Excluir meta" onClick={() => void handleRemove(goal)}><Trash2 size={15} /></Button>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Progresso</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-900/10 dark:bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">{formatCurrency(current)} de {formatCurrency(target)}</p>
                  {goal.target_date ? <p className="mt-1 text-xs text-[var(--text-secondary)]">Prazo: {new Date(`${goal.target_date}T12:00:00`).toLocaleDateString('pt-BR')}</p> : null}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={isModalOpen} title={editingGoal ? 'Editar meta' : 'Nova meta'} onClose={() => setIsModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Título" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          <Input label="Descrição" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Valor-alvo (R$)" type="number" min="0.01" step="0.01" value={form.target_amount} onChange={(event) => setForm((current) => ({ ...current, target_amount: event.target.value }))} required />
            <Input label="Já economizado (R$)" type="number" min="0" step="0.01" value={form.current_amount} onChange={(event) => setForm((current) => ({ ...current, current_amount: event.target.value }))} />
            <Input label="Prazo" type="date" value={form.target_date} onChange={(event) => setForm((current) => ({ ...current, target_date: event.target.value }))} />
            <Input label="Prioridade" as="select" value={String(form.priority)} options={[{ value: '1', label: 'Baixa' }, { value: '2', label: 'Média' }, { value: '3', label: 'Alta' }]} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} />
          </div>
          {formError ? <p role="alert" className="text-sm text-rose-600">{formError}</p> : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar meta'}</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}
