import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

function centsToDisplay(cents) {
  if (cents === 0) return ''
  const reais = Math.floor(cents / 100)
  const centavos = String(cents % 100).padStart(2, '0')
  return `${reais.toLocaleString('pt-BR')},${centavos}`
}

const STEPS = { FORM: 'form', SAVING: 'saving', SUCCESS: 'success' }
const MAX_CENTS = 99_999_999

function CurrencyField({ id, label, centsValue, onChange, error, inputRef }) {
  const displayValue = centsToDisplay(centsValue)

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    const cents = digits === '' ? 0 : parseInt(digits, 10)
    if (cents <= MAX_CENTS) {
      onChange(cents)
    }
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)]">
          R$
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder="0,00"
          autoComplete="off"
          className={[
            'h-12 w-full rounded-2xl border bg-slate-900/[0.04] pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300/50 focus:bg-slate-900/[0.06] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/[0.07]',
            error
              ? 'border-rose-400/60 dark:border-rose-400/40'
              : 'border-slate-900/10 dark:border-white/10',
          ].join(' ')}
        />
      </div>
      {error && <p className="px-1 text-xs text-rose-500 dark:text-rose-300">{error}</p>}
    </div>
  )
}

export function EditGoalModal({ open, currentGoal, onSave, onClose }) {
  const [targetCents, setTargetCents] = useState(0)
  const [currentCents, setCurrentCents] = useState(0)
  const [step, setStep] = useState(STEPS.FORM)
  const [errors, setErrors] = useState({})
  const targetRef = useRef(null)

  const resetForm = useCallback(() => {
    setStep(STEPS.FORM)
    setErrors({})
  }, [])

  useEffect(() => {
    if (open) {
      setTargetCents(Math.round((currentGoal?.target ?? 0) * 100))
      setCurrentCents(Math.round((currentGoal?.current ?? 0) * 100))
      resetForm()
      setTimeout(() => targetRef.current?.focus(), 80)
    }
  }, [open, currentGoal, resetForm])

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (targetCents === 0) {
      newErrors.target = 'Informe o valor da meta.'
    }

    if (currentCents > targetCents && targetCents > 0) {
      newErrors.current = 'O valor atual não pode ultrapassar a meta.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setStep(STEPS.SAVING)

    setTimeout(() => {
      onSave({ target: targetCents / 100, current: currentCents / 100 })
      setStep(STEPS.SUCCESS)
    }, 600)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (step === STEPS.SUCCESS) {
    const savedTarget = (targetCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    return (
      <Modal open={open} title="Meta atualizada" onClose={handleClose}>
        <div className="flex flex-col items-center gap-5 py-8">
          <div className="rounded-2xl bg-emerald-400/10 p-4 text-emerald-500 dark:text-emerald-400">
            <CheckCircle2 size={32} className="animate-[scaleIn_0.35s_ease_both]" />
          </div>
          <div className="text-center">
            <p className="text-base font-medium text-slate-900 dark:text-white">
              Sua meta foi atualizada com sucesso
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
              {savedTarget}
            </p>
          </div>
          <Button onClick={handleClose}>Fechar</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      title="Editar meta do mês"
      description="Defina quanto deseja economizar e quanto já foi alcançado."
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <CurrencyField
            id="goal-target"
            label="Valor da meta"
            centsValue={targetCents}
            onChange={(v) => { setTargetCents(v); setErrors((prev) => ({ ...prev, target: null })) }}
            error={errors.target}
            inputRef={targetRef}
          />

          <CurrencyField
            id="goal-current"
            label="Valor já economizado"
            centsValue={currentCents}
            onChange={(v) => { setCurrentCents(v); setErrors((prev) => ({ ...prev, current: null })) }}
            error={errors.current}
          />

          {targetCents > 0 && (
            <div className="rounded-xl border border-slate-900/6 bg-slate-900/[0.03] p-3 dark:border-white/6 dark:bg-white/[0.03]">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-900/6 dark:bg-white/6">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#34d399,#14b8a6)] transition-all duration-300"
                  style={{ width: `${Math.min((currentCents / targetCents) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-[var(--text-secondary)]">
                {Math.min(Math.round((currentCents / targetCents) * 100), 100)}% concluído
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" type="button" onClick={handleClose} disabled={step === STEPS.SAVING}>
            Cancelar
          </Button>
          <Button type="submit" disabled={step === STEPS.SAVING}>
            {step === STEPS.SAVING ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar meta'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
