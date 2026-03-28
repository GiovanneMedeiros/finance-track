import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      aria-pressed={isDark}
      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-900/10 bg-slate-900/[0.04] px-4 text-sm font-medium text-slate-900 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-900/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
    >
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-amber-500 shadow-sm dark:bg-slate-900/70 dark:text-emerald-300"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </span>
      <span className="hidden sm:inline">{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}