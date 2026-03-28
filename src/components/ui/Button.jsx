import clsx from 'clsx'

const variants = {
  primary:
    'bg-[linear-gradient(135deg,#34d399,#14b8a6)] text-slate-950 shadow-[0_18px_38px_rgba(20,184,166,0.28)] hover:brightness-110',
  secondary:
    'bg-slate-900/[0.04] text-slate-900 hover:bg-slate-900/[0.08] dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-900/[0.05] hover:text-slate-950 dark:text-[var(--text-secondary)] dark:hover:bg-white/[0.05] dark:hover:text-white',
  danger:
    'bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:bg-[rgba(251,113,133,0.12)] dark:text-rose-200 dark:hover:bg-[rgba(251,113,133,0.18)]',
}

const sizes = {
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-sm',
  icon: 'h-10 w-10 text-sm',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}