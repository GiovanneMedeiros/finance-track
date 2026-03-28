import clsx from 'clsx'
import { motion } from 'framer-motion'

const MotionButton = motion.button

export function SocialAuthButton({ icon, label, className, delay = 0 }) {
  const SocialIcon = icon

  return (
    <MotionButton
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        'inline-flex h-13 items-center justify-center gap-3 rounded-[24px] border border-black/8 bg-white/66 px-4 text-sm font-medium text-slate-800 shadow-[0_12px_28px_rgba(56,44,28,0.05)] transition hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100 dark:hover:bg-white/[0.06]',
        className,
      )}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-[#8c6641] dark:bg-white/[0.06] dark:text-[#d4b08a]">
        <SocialIcon size={16} />
      </span>
      <span>{label}</span>
    </MotionButton>
  )
}