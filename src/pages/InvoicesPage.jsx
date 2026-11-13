import { useMemo, useState } from 'react'
import { Check, Pencil, Plus, Trash2 } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useCards } from '@/hooks/useCards'
import { useInvoices } from '@/hooks/useInvoices'
import { useUserPlan } from '@/hooks/useUserPlan'
import { formatCurrency, formatLongDate } from '@/utils/formatters'

function defaultInvoice() {
  const now = new Date()
  return {
    card_id: '',
    reference_month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
    due_date: '',
    amount: '',
    status: 'open',
  }
}

export function InvoicesPage({ onSignOut }) {
  const { profile, isPremium } = useUserPlan()
  const { cards, loading: cardsLoading, error: cardsError } = useCards()
  const { invoices, loading, error, saveInvoice, removeInvoice } = useInvoices()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [form, setForm] = useState(defaultInvoice)
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)

  const openNew = () => {
    setEditingInvoice(null)
    setForm(defaultInvoice())
    setFormError('')
    setIsModalOpen(true)
  }
  const openEdit = (invoice) => {
    setEditingInvoice(invoice)
    setForm({
      card_id: invoice.card_id,
      reference_month: invoice.reference_month,
      due_date: invoice.due_date,
      amount: String(invoice.amount),
      status: invoice.status,
    })
    setFormError('')
    setIsModalOpen(true)
  }
  const handleSubmit = async (event) => {
    event.preventDefault()
    const amount = Number(form.amount)
    if (!form.card_id || !form.due_date || !Number.isFinite(amount) || amount < 0 || !form.reference_month) {
      setFormError('Informe cartão, mês de referência, vencimento e valor válido.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      await saveInvoice({ ...form, amount }, editingInvoice?.id)
      setIsModalOpen(false)
    } catch (saveError) {
      setFormError(saveError.message || 'Não foi possível salvar a fatura.')
    } finally {
      setSaving(false)
    }
  }
  const handleDelete = async (invoice) => {
    if (!window.confirm('Excluir esta fatura?')) return
    setActionError('')
    try {
      await removeInvoice(invoice.id)
    } catch (deleteError) {
      setActionError(deleteError.message || 'Não foi possível excluir a fatura.')
    }
  }

  const handleStatusChange = async (invoice, status) => {
    setActionError('')
    try {
      await saveInvoice({ status }, invoice.id)
    } catch (saveError) {
      setActionError(saveError.message || 'Não foi possível atualizar o status da fatura.')
    }
  }

  const openTotal = useMemo(
    () => invoices.filter((invoice) => invoice.status === 'open').reduce((sum, invoice) => sum + Number(invoice.amount), 0),
    [invoices],
  )

  return (
    <AppShell
      sidebar={<Sidebar balanceLabel={formatCurrency(0)} formattedIncome={formatCurrency(0)} formattedExpense={formatCurrency(openTotal)} plan={profile?.plan} isPremium={isPremium} monthlyGoal={null} />}
      header={<Header currentDateLabel={formatLongDate(new Date())} transactionCount={invoices.length} onSignOut={onSignOut} />}
    >
      <div className="space-y-6">
        <SectionHeader title="Faturas" description="Registre valores e vencimentos dos cartões e acompanhe pagamentos." right={<Button onClick={openNew} disabled={!cards.length}><Plus size={16} /> Nova fatura</Button>} />
        <Card className="flex flex-wrap items-center justify-between gap-3 p-5"><div><p className="text-sm text-[var(--text-secondary)]">Total em aberto</p><p className="mt-1 text-2xl font-bold">{formatCurrency(openTotal)}</p></div><p className="text-sm text-[var(--text-secondary)]">{invoices.filter((invoice) => invoice.status === 'open').length} fatura(s) aguardando pagamento</p></Card>
        {error || cardsError || actionError ? <Card role="alert" className="p-4 text-sm text-rose-600">{actionError || error || cardsError}</Card> : null}
        {loading || cardsLoading ? <Card className="p-5">Carregando faturas...</Card> : invoices.length === 0 ? (
          <EmptyState title="Nenhuma fatura registrada" description={cards.length ? 'Adicione o valor e a data de vencimento de uma fatura.' : 'Cadastre um cartão antes de registrar uma fatura.'} action={cards.length ? <Button onClick={openNew}><Plus size={16} /> Registrar fatura</Button> : null} />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-[var(--text-secondary)]"><tr><th className="p-4">Cartão</th><th>Mês</th><th>Vencimento</th><th>Valor</th><th>Status</th><th className="p-4 text-right">Ações</th></tr></thead>
              <tbody>{invoices.map((invoice) => <tr key={invoice.id} className="border-t border-slate-900/5 dark:border-white/5"><td className="p-4 font-medium">{invoice.cards?.name || 'Cartão removido'}<span className="block text-xs text-[var(--text-secondary)]">{invoice.cards?.bank}</span></td><td>{new Date(`${invoice.reference_month.slice(0, 7)}-15T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</td><td>{new Date(`${invoice.due_date}T12:00:00`).toLocaleDateString('pt-BR')}</td><td>{formatCurrency(Number(invoice.amount))}</td><td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>{invoice.status === 'paid' ? 'Paga' : 'Em aberto'}</span></td><td className="p-4"><div className="flex justify-end gap-1">{invoice.status === 'open' ? <Button size="icon" variant="ghost" aria-label="Marcar fatura como paga" onClick={() => void handleStatusChange(invoice, 'paid')}><Check size={15} /></Button> : <Button size="icon" variant="ghost" aria-label="Reabrir fatura" onClick={() => void handleStatusChange(invoice, 'open')}><Check size={15} className="opacity-40" /></Button>}<Button size="icon" variant="ghost" aria-label="Editar fatura" onClick={() => openEdit(invoice)}><Pencil size={15} /></Button><Button size="icon" variant="ghost" aria-label="Excluir fatura" onClick={() => void handleDelete(invoice)}><Trash2 size={15} /></Button></div></td></tr>)}</tbody>
            </table>
          </Card>
        )}
      </div>

      <Modal open={isModalOpen} title={editingInvoice ? 'Editar fatura' : 'Registrar fatura'} onClose={() => setIsModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Cartão" as="select" value={form.card_id} options={[{ value: '', label: 'Selecione um cartão' }, ...cards.map((card) => ({ value: card.id, label: `${card.bank} — ${card.name}` }))]} onChange={(event) => setForm((current) => ({ ...current, card_id: event.target.value }))} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Mês de referência" type="date" value={form.reference_month} onChange={(event) => setForm((current) => ({ ...current, reference_month: `${event.target.value.slice(0, 7)}-01` }))} required />
            <Input label="Vencimento" type="date" value={form.due_date} onChange={(event) => setForm((current) => ({ ...current, due_date: event.target.value }))} required />
            <Input label="Valor (R$)" type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} required />
            <Input label="Status" as="select" value={form.status} options={[{ value: 'open', label: 'Em aberto' }, { value: 'paid', label: 'Paga' }]} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} />
          </div>
          {formError ? <p role="alert" className="text-sm text-rose-600">{formError}</p> : null}
          <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar fatura'}</Button></div>
        </form>
      </Modal>
    </AppShell>
  )
}
