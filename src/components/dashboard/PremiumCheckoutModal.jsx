import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency } from '@/utils/formatters'

const PREMIUM_PRICE = 29.9

export function PremiumCheckoutModal({ open, onClose, onUpgrade, isPremium, expiresAt }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 700))
      onUpgrade()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      title={isPremium ? 'Premium ativo' : 'Assinar Premium'}
      description={
        isPremium
          ? `Sua assinatura Premium está ativa até ${expiresAt}. Você pode renovar a qualquer momento.`
          : 'Desbloqueie todos os recursos Premium por R$29,90/mês.'
      }
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950/5 p-6 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/10">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-emerald-700/80 dark:text-emerald-200/70">Premium</p>
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">{formatCurrency(PREMIUM_PRICE)}</p>
            </div>
          </div>

          {!isPremium && (
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Acesso a relatórios avançados, alertas financeiros, metas e previsões mensais.
            </p>
          )}

          {isPremium && (
            <div className="mt-4 rounded-3xl bg-slate-900/10 p-4 text-sm text-slate-700 dark:bg-white/10 dark:text-slate-300">
              Assinatura ativa até <strong>{expiresAt}</strong>
            </div>
          )}
        </div>

        {!isPremium && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-300">Pagamentos via Mercado Pago no checkout.</p>
            <Button onClick={handleUpgrade} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processando...
                </>
              ) : (
                'Assinar agora'
              )}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
