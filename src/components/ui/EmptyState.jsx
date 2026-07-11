import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-slate-900/10 bg-slate-950/[0.03] p-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600">
        <Sparkles size={22} />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
