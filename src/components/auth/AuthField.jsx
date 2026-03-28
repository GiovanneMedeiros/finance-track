import { motion } from 'framer-motion'

const MotionLabel = motion.label

export function AuthField({ label, icon, delay = 0, inputRef, ...props }) {
  const FieldIcon = icon

  return (
    <MotionLabel
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="group flex flex-col gap-2"
    >
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors duration-300 group-focus-within:text-[#8c6641] dark:text-slate-500 dark:group-focus-within:text-[#d4b08a]">
          <FieldIcon size={18} />
        </div>

        <input
          ref={inputRef}
          {...props}
          className="relative h-15 w-full rounded-[26px] border border-black/8 bg-white/72 pl-12 pr-4 text-[15px] text-[#17130f] shadow-[0_14px_32px_rgba(56,44,28,0.05)] outline-none ring-0 transition duration-300 placeholder:text-slate-400 focus:-translate-y-0.5 focus:border-[#b98b5c]/45 focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#d4b08a]/50 dark:focus:bg-white/[0.05]"
        />
      </div>
    </MotionLabel>
  )
}