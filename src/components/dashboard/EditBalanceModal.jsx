import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

function centsToDisplay(cents) {
  if (cents === 0) return ''
  const abs = Math.abs(cents)
  const reais = Math.floor(abs / 100)
  const centavos = String(abs % 100).padStart(2, '0')
  const formatted = reais.toLocaleString('pt-BR')
  const sign = cents < 0 ? '-' : ''
  return `${sign}${formatted},${centavos}`
}

const STEPS = { FORM: 'form', SAVING: 'saving', SUCCESS: 'success' }
const MAX_CENTS = 99_999_999 // R$ 999.999,99

export function EditBalanceModal({ open, currentBalance, onSave, onClose, onChange }) {
  const [rawCents, setRawCents] = useState(0)
  const [isNegative, setIsNegative] = useState(false)
  const [step, setStep] = useState(STEPS.FORM)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const resetForm = useCallback(() => {
    setStep(STEPS.FORM)
    setError(null)
  }, [])

  useEffect(() => {
    if (open) {
      if (currentBalance != null && currentBalance !== 0) {
        const cents = Math.round(Math.abs(currentBalance) * 100)
        setRawCents(cents)
        setIsNegative(currentBalance < 0)
      } else {
        setRawCents(0)
        setIsNegative(false)
      }
      resetForm()
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open, currentBalance, resetForm])

  const signedCents = isNegative ? -rawCents : rawCents
  const displayValue = centsToDisplay(signedCents)

  const handleChange = (e) => {
    setError(null)
    const input = e.target.value
    const hasNeg = input.includes('-')
    const digits = input.replace(/\D/g, '')
    const cents = digits === '' ? 0 : parseInt(digits, 10)

    if (cents > MAX_CENTS) return

    setRawCents(cents)
    setIsNegative(hasNeg)
    onChange?.((hasNeg ? -cents : cents) / 100)
  }

  const handleKeyDown = (e) => {
    if (e.key === '-') {
      e.preventDefault()
      const nextNegative = !isNegative
      setIsNegative(nextNegative)
      onChange?.((nextNegative ? -rawCents : rawCents) / 100)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rawCents === 0) {
      setError('Informe um valor diferente de zero.')
      inputRef.current?.focus()
      return
    }

    if (rawCents > MAX_CENTS) {
      setError('Valor máximo permitido: R$ 999.999,99')
      return
    }

    setStep(STEPS.SAVING)

    try {
      const value = signedCents / 100
      await onSave(value)
      
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 600))
      
      setStep(STEPS.SUCCESS)
    } catch (err) {
      setError(err?.message || 'Erro ao salvar saldo')
      setStep(STEPS.FORM)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const previewFormatted =
    rawCents > 0
      ? (signedCents / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      : null

  if (step === STEPS.SUCCESS) {
    return (
      <Modal open={open} title="Saldo atualizado" onClose={handleClose}>
        <div className="flex flex-col items-center gap-5 py-8">
          <div className="rounded-2xl bg-emerald-400/10 p-4 text-emerald-500 dark:text-emerald-400">
            <CheckCircle2 size={32} className="animate-[scaleIn_0.35s_ease_both]" />
          </div>

          <div className="text-center">
            <p className="text-base font-medium text-slate-900 dark:text-white">
              Seu saldo foi atualizado com sucesso
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
              {(signedCents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
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
      title="Atualizar saldo"
      description="Informe o saldo disponível atualizado. O valor será salvo localmente."
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="balance-input"
            className="text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Saldo disponível
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)]">
              R$
            </span>
            <input
              ref={inputRef}
              id="balance-input"
              type="text"
              inputMode="numeric"
              value={displayValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="0,00"
              autoComplete="off"
              disabled={step === STEPS.SAVING}
              className={[
                'h-12 w-full rounded-2xl border bg-slate-900/[0.04] pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300/50 focus:bg-slate-900/[0.06] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/[0.07] disabled:opacity-50',
                error
                  ? 'border-rose-400/60 dark:border-rose-400/40'
                  : 'border-slate-900/10 dark:border-white/10',
              ].join(' ')}
            />
          </div>

          {error && (
            <p className="px-1 text-xs text-rose-500 dark:text-rose-300">
              {error}
            </p>
          )}

          {!error && previewFormatted && (
            <p className="px-1 text-xs text-[var(--text-secondary)]">
              Valor: <span className="font-medium text-emerald-600 dark:text-emerald-400">{previewFormatted}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" type="button" onClick={handleClose} disabled={step === STEPS.SAVING}>
            Cancelar
          </Button>
          <Button type="submit" disabled={rawCents === 0 || step === STEPS.SAVING}>
            {step === STEPS.SAVING ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar saldo'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
