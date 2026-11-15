import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { CARD_PURCHASE_CATEGORIES } from '@/constants/cardThemes'
import { buildInstallmentSchedule } from '@/utils/cardBilling'
import { formatCurrency } from '@/utils/formatters'

function localDateValue() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function initialValues(purchase, cardId) {
  if (purchase) {
    return {
      card_id: purchase.card_id,
      title: purchase.title,
      amount: String(purchase.amount),
      purchase_date: purchase.purchase_date,
      category: purchase.category,
      installments_count: String(purchase.installments_count),
      notes: purchase.notes ?? '',
    }
  }
  return {
    card_id: cardId || '',
    title: '',
    amount: '',
    purchase_date: localDateValue(),
    category: CARD_PURCHASE_CATEGORIES[0],
    installments_count: '1',
    notes: '',
  }
}

export function CardPurchaseModal({ open, cards, purchase, cardId, onClose, onSave }) {
  const [values, setValues] = useState(() => initialValues(purchase, cardId))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedCard = cards.find((card) => card.id === (purchase?.card_id || values.card_id))
  const schedule = useMemo(() => {
    if (!selectedCard || !values.amount || !values.purchase_date) return []
    try {
      return buildInstallmentSchedule({
        amount: Number(values.amount),
        count: Number(values.installments_count),
        purchaseDate: values.purchase_date,
        closingDay: selectedCard.closing_day,
        paymentDay: selectedCard.due_day,
      })
    } catch {
      return []
    }
  }, [selectedCard, values.amount, values.installments_count, values.purchase_date])

  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const amount = Number(values.amount)
    const count = Number(values.installments_count)
    if (!values.card_id || !selectedCard) {
      setError('Selecione um cartão de crédito ativo.')
      return
    }
    if (!values.title.trim() || values.title.trim().length > 120) {
      setError('Informe uma descrição com até 120 caracteres.')
      return
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 9999999999.99) {
      setError('Informe um valor válido maior que zero.')
      return
    }
    if (!values.purchase_date || values.purchase_date > localDateValue()) {
      setError('A data da compra deve ser hoje ou anterior.')
      return
    }
    if (!Number.isInteger(count) || count < 1 || count > 48) {
      setError('Escolha de 1 a 48 parcelas.')
      return
    }
    if (values.notes.length > 500) {
      setError('As observações devem ter até 500 caracteres.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSave({
        ...values,
        title: values.title.trim(),
        amount,
        installments_count: count,
        notes: values.notes.trim(),
      }, purchase?.id)
      onClose()
    } catch (saveError) {
      setError(saveError.message || 'Não foi possível salvar a compra.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={purchase ? 'Editar compra' : 'Registrar compra'}
      description="As parcelas serão distribuídas entre as faturas conforme os dias de fechamento e vencimento do cartão."
      size="lg"
      onClose={onClose}
    >
      <form className="max-h-[70vh] space-y-4 overflow-y-auto pr-1" onSubmit={(event) => void handleSubmit(event)}>
        <Input
          label="Cartão"
          as="select"
          value={purchase?.card_id || values.card_id}
          disabled={Boolean(purchase)}
          options={[
            { value: '', label: 'Selecione um cartão' },
            ...cards.map((card) => ({ value: card.id, label: `${card.nickname || card.name} · ${card.bank}` })),
          ]}
          onChange={(event) => update('card_id', event.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Descrição da compra" value={values.title} onChange={(event) => update('title', event.target.value)} maxLength={120} required />
          <Input label="Valor total (R$)" type="number" min="0.01" max="9999999999.99" step="0.01" value={values.amount} onChange={(event) => update('amount', event.target.value)} required />
          <Input label="Data da compra" type="date" max={localDateValue()} value={values.purchase_date} onChange={(event) => update('purchase_date', event.target.value)} required />
          <Input label="Categoria" as="select" value={values.category} options={CARD_PURCHASE_CATEGORIES.map((category) => ({ value: category, label: category }))} onChange={(event) => update('category', event.target.value)} />
          <Input label="Quantidade de parcelas" type="number" min="1" max="48" step="1" value={values.installments_count} onChange={(event) => update('installments_count', event.target.value)} required />
        </div>
        <label className="block space-y-1.5 text-sm font-medium">
          Observações
          <textarea value={values.notes} onChange={(event) => update('notes', event.target.value)} maxLength={500} rows={2} className="w-full rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/50 dark:border-white/10 dark:bg-white/[0.05]" />
        </label>

        {schedule.length > 0 ? (
          <div className="rounded-2xl border border-slate-900/10 p-4 dark:border-white/10">
            <p className="text-sm font-semibold">Prévia das parcelas</p>
            <div className="mt-2 max-h-36 space-y-1 overflow-y-auto text-xs text-[var(--text-secondary)]">
              {schedule.map((installment) => (
                <div key={installment.number} className="flex justify-between gap-3">
                  <span>{installment.number}/{schedule.length} · fatura fecha {new Date(`${installment.closingDate}T12:00:00`).toLocaleDateString('pt-BR')} · vence {new Date(`${installment.dueDate}T12:00:00`).toLocaleDateString('pt-BR')}</span>
                  <strong className="shrink-0 text-[var(--text-primary)]">{formatCurrency(installment.amount)}</strong>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-3 border-t border-slate-900/10 pt-4 dark:border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : purchase ? 'Salvar compra' : 'Registrar compra'}</Button>
        </div>
      </form>
    </Modal>
  )
}
