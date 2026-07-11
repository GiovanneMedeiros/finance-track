import { Lock } from 'lucide-react'

import { Button } from '@/components/ui/Button'

export function PremiumGate({ isPremium, title, description, onUpgrade, children }) {
  if (isPremium) {
    return <>{children}</>
  }

  return (
    <div className="rounded-3xl border border-rose-200/70 bg-rose-50/80 p-6 text-center shadow-sm shadow-rose-200/20 dark:border-rose-400/20 dark:bg-rose-950/10">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300">
        <Lock size={24} />
      </div>
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title || 'Funcionalidade Premium'}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description || 'Esta área está disponível apenas para assinantes Premium.'}</p>
      <div className="mt-5">
        <Button onClick={onUpgrade}>Desbloquear Premium por R$29,90/mês</Button>
      </div>
    </div>
  )
}
