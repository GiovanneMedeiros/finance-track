import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getPremiumExpiryLabel } from '@/utils/premium'

export function PremiumUpgradeCard({ isPremium, expiresAt, onUpgrade }) {
  return (
    <div className="rounded-[2rem] border border-slate-900/10 bg-slate-950/5 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-200/70">Plano atual</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{isPremium ? 'Premium' : 'Free'}</h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-200">
          <Sparkles size={18} />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {isPremium
          ? `Assinatura ativa até ${getPremiumExpiryLabel(expiresAt)}.`
          : 'Aproveite os recursos avançados de relatórios, planejamento e insights financeiros.'}
      </p>

      <div className="mt-5">
        <Button className="w-full" onClick={onUpgrade}>
          {isPremium ? 'Renovar Premium' : 'Assinar Premium agora'}
        </Button>
      </div>
    </div>
  )
}
