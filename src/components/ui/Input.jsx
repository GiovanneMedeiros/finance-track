import clsx from 'clsx'
import { useId } from 'react'

export function Input({
  label,
  error,
  as = 'input',
  options = [],
  className,
  ...props
}) {
  const fieldId = useId()
  const Component = as

  return (
    <label className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300" htmlFor={fieldId}>
      <span className="font-medium text-slate-800 dark:text-slate-200">{label}</span>

      <Component
        id={fieldId}
        className={clsx(
          'h-12 rounded-2xl border border-slate-900/10 bg-slate-900/[0.04] px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300/50 focus:bg-slate-900/[0.06] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/[0.07]',
          as === 'select' && 'appearance-none pr-10',
          error && 'border-rose-400/60',
          className,
        )}
        {...props}
      >
        {as === 'select'
          ? options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
              >
                {option.label}
              </option>
            ))
          : null}
      </Component>

      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </label>
  )
}