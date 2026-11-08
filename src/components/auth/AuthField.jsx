import { useId, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

const MotionDiv = motion.div

export function AuthField({ label, icon, delay = 0, inputRef, error, type = 'text', trailing, ...props }) {
  const FieldIcon = icon
  const id = useId()
  const errorId = `${id}-error`
  const isPassword = type === 'password'
  const [showPassword, setShowPassword] = useState(false)

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="group flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {trailing}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors duration-300 group-focus-within:text-emerald-500 dark:text-slate-500 dark:group-focus-within:text-emerald-400">
          <FieldIcon size={18} />
        </div>

        <input
          id={id}
          ref={inputRef}
          type={isPassword && showPassword ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
          className={`h-13 w-full rounded-2xl border bg-white/80 pl-12 text-[15px] text-slate-900 outline-none transition duration-300 placeholder:text-slate-400 focus:bg-white dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/[0.06] ${
            isPassword ? 'pr-12' : 'pr-4'
          } ${
            error
              ? 'border-rose-400/70 focus:shadow-[0_0_0_4px_rgba(244,63,94,0.15)] dark:border-rose-400/50'
              : 'border-slate-900/10 focus:border-emerald-500/60 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.15)] dark:border-white/10 dark:focus:border-emerald-400/50'
          }`}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-2xl text-slate-400 transition hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : null}
    </MotionDiv>
  )
}
