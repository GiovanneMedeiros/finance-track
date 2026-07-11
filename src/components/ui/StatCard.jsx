export function StatCard({ title, value, description, icon, badge, className = '' }) {
  return (
    <div className={`rounded-3xl border border-slate-900/10 bg-slate-950/[0.03] p-5 dark:border-white/10 dark:bg-white/[0.04] ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-200/70">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
        </div>
        {icon ? <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-300">{icon}</div> : null}
      </div>
      {description ? <p className="mt-4 text-sm text-[var(--text-secondary)]">{description}</p> : null}
      {badge ? <div className="mt-4 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">{badge}</div> : null}
    </div>
  )
}
