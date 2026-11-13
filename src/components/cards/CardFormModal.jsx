import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

const COLORS = [
  '#34d399', // emerald
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#ef4444', // red
]

export function CardFormModal({ open, card, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    network: 'credit',
    last_digits: '',
    limit: 0,
    current_usage: 0,
    closing_day: 1,
    due_day: 10,
    notes: '',
    color: COLORS[0],
    ...(card ?? {}),
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const handleChange = useCallback((field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const closingDay = Number(formData.closing_day)
    const paymentDay = Number(formData.due_day)
    if (!formData.name.trim() || !formData.bank.trim()) {
      setFormError('Informe o nome do cartão e do banco.')
      return
    }
    if (!/^\d{4}$/.test(formData.last_digits)) {
      setFormError('Informe exatamente os quatro últimos dígitos do cartão.')
      return
    }
    if (
      !Number.isFinite(Number(formData.limit))
      || Number(formData.limit) < 0
      || !Number.isFinite(Number(formData.current_usage))
      || Number(formData.current_usage) < 0
      || !Number.isInteger(closingDay)
      || closingDay < 1
      || closingDay > 31
      || !Number.isInteger(paymentDay)
      || paymentDay < 1
      || paymentDay > 31
    ) {
      setFormError('Confira os valores e os dias de fechamento e vencimento.')
      return
    }
    setSaving(true)
    setFormError('')

    try {
      await onSave({ ...formData, name: formData.name.trim(), bank: formData.bank.trim() })
      onClose()
    } catch (err) {
      setFormError(err.message || 'Não foi possível salvar o cartão.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={card ? 'Editar cartão' : 'Novo cartão'}
      description={card ? 'Atualize os dados do seu cartão' : 'Adicione um novo cartão de crédito'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Nome do cartão</label>
            <Input
              type="text"
              placeholder="Caixa Pessoal, Nubank, etc"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Banco</label>
            <Input
              type="text"
              placeholder="Caixa, Nubank, Bradesco"
              value={formData.bank}
              onChange={(e) => handleChange('bank', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Tipo</label>
            <Input
              as="select"
              value={formData.network}
              options={[
                { value: 'credit', label: 'Crédito' },
                { value: 'debit', label: 'Débito' },
              ]}
              onChange={(e) => handleChange('network', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Últimos 4 dígitos</label>
            <Input
              type="text"
              placeholder="1234"
              maxLength="4"
              value={formData.last_digits}
              onChange={(e) => handleChange('last_digits', e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-950 dark:text-white">Limite (R$)</label>
              <Input
                type="number"
                placeholder="5000"
                min="0"
                step="0.01"
                value={formData.limit}
                onChange={(e) => handleChange('limit', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-950 dark:text-white">Uso atual (R$)</label>
              <Input
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={formData.current_usage}
                onChange={(e) => handleChange('current_usage', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-950 dark:text-white">Dia de fechamento</label>
              <Input
                type="number"
                min="1"
                max="31"
                value={formData.closing_day}
                onChange={(e) => handleChange('closing_day', Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-950 dark:text-white">Dia de vencimento</label>
              <Input
                type="number"
                min="1"
                max="31"
                value={formData.due_day}
                onChange={(e) => handleChange('due_day', Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Cor</label>
            <div className="grid grid-cols-6 gap-2 mt-1.5">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('color', color)}
                  className={`h-8 rounded-lg border-2 transition-transform ${
                    formData.color === color ? 'border-slate-950 scale-110 dark:border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Selecionar cor ${color}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Observações</label>
            <textarea
              placeholder="Notas adicionais sobre o cartão"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full rounded-lg border border-slate-900/10 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400/50 dark:border-white/10 dark:bg-white/[0.06] dark:placeholder:text-slate-500"
              rows="3"
            />
          </div>
        </div>

        {formError ? <p role="alert" className="text-sm text-rose-600">{formError}</p> : null}
        <div className="flex gap-3">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? 'Salvando...' : card ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
