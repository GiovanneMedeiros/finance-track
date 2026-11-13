import { MotionConfig, motion } from 'framer-motion'

const MotionDiv = motion.div

const shellVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.04 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}

export function AppShell({ sidebar, header, children }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative isolate min-h-screen overflow-x-clip text-slate-950 transition-colors duration-300 dark:text-white">
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="aurora aurora-1" />
          <div className="aurora aurora-2" />
          <div className="aurora aurora-3" />
        </div>
        <div
          aria-hidden="true"
          className="auth-grid pointer-events-none fixed inset-0 z-0 opacity-35 dark:opacity-25"
        />

        <MotionDiv
          variants={shellVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 px-4 py-4 lg:px-5 lg:py-5"
        >
          <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1480px] flex-col gap-4 lg:min-h-[calc(100vh-2.5rem)] lg:flex-row lg:gap-5">
            <MotionDiv variants={sectionVariants} className="lg:flex lg:shrink-0">
              {sidebar}
            </MotionDiv>

            <div className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-5">
              <MotionDiv variants={sectionVariants}>{header}</MotionDiv>
              <MotionDiv variants={sectionVariants} className="flex-1">
                <main className="h-full transition-colors duration-300">{children}</main>
              </MotionDiv>
            </div>
          </div>
        </MotionDiv>
      </div>
    </MotionConfig>
  )
}