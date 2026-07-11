import { Crown } from 'lucide-react'

export function PremiumBadge({ label = 'Premium', compact = false, className = '' }) {
  return (
    <span
      className={['inline-flex items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200',
        compact
          ? 'h-7 w-7 p-0 text-[12px]'
          : 'px-3 py-1 text-[11px] tracking-[0.24em]',
        className,
      ].join(' ')}
    >
      {compact ? <Crown size={14} className="text-amber-500" /> : label}
    </span>
  )
}
