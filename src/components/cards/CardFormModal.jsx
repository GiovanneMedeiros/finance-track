import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { CARD_BRANDS, CARD_THEMES } from '@/constants/cardThemes'

const EMPTY_CARD = {
  name: '',
  nickname: '',
  bank: '',
  card_brand: 'visa',
  network: 'credit',
  last_digits: '',
  cardholder_name: '',
  limit: '',
  closing_day: '20',
  due_day: '10',
  theme_key: 'custom',
  color: '#0f766e',
  notes: '',
  is_favorite: false,
  alert_thresholds: [50, 70, 90],
  alert_spending_increase: true,
  due_alert_days: '5',
}

function getFormValues(card) {
  if (!card) return EMPTY_CARD
  return {
    ...EMPTY_CARD,
    ...card,
    limit: String(card.limit ?? 0),
    closing_day: String(card.closing_day ?? 20),
    due_day: String(card.due_day ?? 10),
    due_alert_days: String(card.due_alert_days ?? 5),
    alert_thresholds: card.alert_thresholds ?? [50, 70, 90],
  }
}

export function CardFormModal({ open, card, onClose, onSave }) {
  const [values, setValues] = useState(() => getFormValues(card))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const selectTheme = (themeKey) => {
    const theme = CARD_THEMES[themeKey]
    setValues((current) => ({
      ...current,
      theme_key: themeKey,
      bank: theme.bank || current.bank,
      color: theme.color,
    }))
    setError('')
  }

  const toggleThreshold = (threshold) => {
    setValues((current) => ({
      ...current,
      alert_thresholds: current.alert_thresholds.includes(threshold)
        ? current.alert_thresholds.filter((value) => value !== threshold)
        : [...current.alert_thresholds, threshold].sort((a, b) => a - b),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const limit = Number(values.limit)
    const closingDay = Number(values.closing_day)
    const dueDay = Number(values.due_day)
    const dueAlertDays = Number(values.due_alert_days)

    if (!values.name.trim() || !values.bank.trim()) {
      setError('Informe o nome do cartão e a instituição financeira.')
      return
    }
    if (
      !Number.isFinite(limit)
      || limit < 0
      || limit > 9999999999.99
      || !Number.isInteger(closingDay)
      || closingDay < 1
      || closingDay > 31
      || !Number.isInteger(dueDay)
      || dueDay < 1
      || dueDay > 31
      || !Number.isInteger(dueAlertDays)
      || dueAlertDays < 1
      || dueAlertDays > 30
    ) {
      setError('Confira o limite e os dias de fechamento, vencimento e alerta.')
      return
    }
    if (values.last_digits && !/^\d{4}$/.test(values.last_digits)) {
      setError('Informe quatro dígitos ou deixe o campo vazio.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSave({
        ...values,
        name: values.name.trim(),
        bank: values.bank.trim(),
        nickname: values.nickname.trim(),
        cardholder_name: values.cardholder_name.trim(),
        notes: values.notes.trim(),
        limit,
        closing_day: closingDay,
        due_day: dueDay,
        due_alert_days: dueAlertDays,
        is_active: true,
        alert_thresholds: values.alert_thresholds,
      })
      onClose()
    } catch (saveError) {
      setError(saveError.message || 'Não foi possível salvar o cartão.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={card ? 'Editar cartão' : 'Adicionar cartão'}
      description="Guarde apenas os dados de identificação. Nunca informe o número completo, CVV ou senha do cartão."
      size="lg"
      onClose={onClose}
    >
      <form className="max-h-[70vh] space-y-5 overflow-y-auto pr-1" onSubmit={(event) => void handleSubmit(event)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome do cartão" value={values.name} onChange={(event) => update('name', event.target.value)} maxLength={80} required />
          <Input label="Apelido (opcional)" value={values.nickname} onChange={(event) => update('nickname', event.target.value)} maxLength={50} placeholder="Ex.: Pessoal" />
          <Input label="Banco ou instituição" value={values.bank} onChange={(event) => update('bank', event.target.value)} maxLength={80} required />
          <Input label="Bandeira" as="select" value={values.card_brand} options={CARD_BRANDS} onChange={(event) => update('card_brand', event.target.value)} />
          <Input
            label="Últimos 4 dígitos (opcional)"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={values.last_digits}
            onChange={(event) => update('last_digits', event.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Não informe o número completo"
          />
          <Input label="Titular (opcional)" value={values.cardholder_name} onChange={(event) => update('cardholder_name', event.target.value)} maxLength={80} />
          <Input label="Limite total (R$)" type="number" min="0" max="9999999999.99" step="0.01" value={values.limit} onChange={(event) => update('limit', event.target.value)} required />
          <Input label="Tipo" as="select" value={values.network} options={[{ value: 'credit', label: 'Crédito' }, { value: 'debit', label: 'Débito' }]} onChange={(event) => update('network', event.target.value)} />
          <Input label="Dia de fechamento da fatura" type="number" min="1" max="31" value={values.closing_day} onChange={(event) => update('closing_day', event.target.value)} required />
          <Input label="Dia de vencimento" type="number" min="1" max="31" value={values.due_day} onChange={(event) => update('due_day', event.target.value)} required />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Tema visual</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CARD_THEMES).map(([key, theme]) => (
              <button
                key={key}
                type="button"
                onClick={() => selectTheme(key)}
                aria-pressed={values.theme_key === key}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${values.theme_key === key ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200' : 'border-slate-900/10 dark:border-white/10'}`}
              >
                {theme.label}
              </button>
            ))}
          </div>
          {values.theme_key === 'custom' ? (
            <label className="mt-3 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              Cor principal
              <input type="color" value={values.color} onChange={(event) => update('color', event.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent" />
            </label>
          ) : null}
        </fieldset>

        <div className="flex flex-wrap items-center gap-2">
          <input id="card-favorite" type="checkbox" checked={values.is_favorite} onChange={(event) => update('is_favorite', event.target.checked)} />
          <label htmlFor="card-favorite" className="text-sm">Definir como cartão favorito</label>
        </div>

        <fieldset>
          <legend className="text-sm font-medium">Alertas de limite</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {[50, 70, 90].map((threshold) => (
              <label key={threshold} className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={values.alert_thresholds.includes(threshold)} onChange={() => toggleThreshold(threshold)} />
                {threshold}%
              </label>
            ))}
          </div>
          <div className="mt-3 max-w-xs">
            <Input label="Avisar vencimento com antecedência (dias)" type="number" min="1" max="30" value={values.due_alert_days} onChange={(event) => update('due_alert_days', event.target.value)} />
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={values.alert_spending_increase} onChange={(event) => update('alert_spending_increase', event.target.checked)} />
            Avisar quando os gastos aumentarem 30% ou mais
          </label>
        </fieldset>

        <label className="block space-y-1.5 text-sm font-medium">
          Observações
          <textarea value={values.notes} onChange={(event) => update('notes', event.target.value)} maxLength={500} rows={2} className="w-full rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/50 dark:border-white/10 dark:bg-white/[0.05]" />
        </label>

        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-3 border-t border-slate-900/10 pt-4 dark:border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : card ? 'Salvar alterações' : 'Adicionar cartão'}</Button>
        </div>
      </form>
    </Modal>
  )
}
