import { Sparkles } from 'lucide-react'

export function SectionHeader({ title, description, right, icon }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-900/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-emerald-200/70">
          <Sparkles size={14} />
          Navegação de seção
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white flex items-center gap-2">
            {title}
            {icon}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  )
}
