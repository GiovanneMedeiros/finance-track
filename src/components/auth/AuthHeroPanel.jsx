import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useInView } from 'framer-motion'
import { ArrowRight, PlayCircle, ShieldCheck, Sparkles } from 'lucide-react'

import { CardStack } from '@/components/auth/CardStack'

const MotionDiv = motion.div
const MotionSpan = motion.span

const stats = [
  { value: 48, suffix: 'k+', label: 'faturas importadas' },
  { value: 2.3, suffix: 'M', prefix: 'R$ ', decimals: 1, label: 'economizados/mês' },
  { value: 4.9, suffix: '★', decimals: 1, label: 'avaliação média' },
]

function Counter({ value, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || !ref.current) return undefined
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${latest.toLocaleString('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}${suffix}`
        }
      },
    })
    return () => controls.stop()
  }, [inView, value, prefix, suffix, decimals])

  return <span ref={ref}>{prefix}0{suffix}</span>
}

const words = ['Nubank', 'PicPay', 'C6 Bank', 'Inter']
const wordColors = ['#a855f7', '#22c55e', '#94a3b8', '#ff7a00']

function RotatingWord() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), 3200)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className="inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="wait" initial={false}>
        <MotionSpan
          key={words[index]}
          className="inline-block whitespace-nowrap font-semibold"
          style={{ color: wordColors[index] }}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {words[index]}
        </MotionSpan>
      </AnimatePresence>
    </span>
  )
}

export function AuthHeroPanel({ onStartClick, onLearnMoreClick }) {
  return (
    <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
      <div className="space-y-7">
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 py-1 pl-1 pr-3 text-xs font-medium text-emerald-700 dark:text-emerald-300"
        >
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Novo
          </span>
          Importação automática de faturas em PDF
          <Sparkles size={13} />
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[2.6rem] font-bold leading-[1.02] text-slate-900 dark:text-white sm:text-6xl xl:text-[4.1rem]">
            Todos os seus cartões.
            <br />
            <span className="bg-[linear-gradient(90deg,#10b981,#14b8a6,#3b82f6)] bg-clip-text text-transparent">
              Um só painel.
            </span>
          </h1>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg"
        >
          Conecte as faturas do <RotatingWord /> e de qualquer banco. O FinanceTrack organiza seus
          gastos por categoria, mostra para onde vai seu dinheiro e ajuda você a bater suas metas.
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <motion.button
            type="button"
            onClick={onStartClick}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex h-13 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#10b981,#14b8a6)] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_-10px_rgba(16,185,129,0.6)]"
          >
            <span className="btn-shine pointer-events-none absolute inset-0" />
            Começar grátis
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </motion.button>
          <motion.button
            type="button"
            onClick={onLearnMoreClick}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-slate-900/10 bg-white/60 px-6 text-sm font-semibold text-slate-800 backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/[0.09]"
          >
            <PlayCircle size={17} />
            Ver como funciona
          </motion.button>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"
        >
          <div className="flex -space-x-2">
            {['#a855f7', '#22c55e', '#f97316', '#3b82f6'].map((color, i) => (
              <span
                key={color}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-slate-950"
                style={{ background: color }}
              >
                {['MC', 'JP', 'AL', 'RS'][i]}
              </span>
            ))}
          </div>
          <span>
            <strong className="text-slate-800 dark:text-white">+12 mil pessoas</strong> já organizam
            suas finanças
          </span>
          <ShieldCheck size={14} className="hidden text-emerald-500 sm:block" />
        </MotionDiv>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <MotionDiv
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="rounded-2xl border border-slate-900/8 bg-white/50 p-3 backdrop-blur dark:border-white/8 dark:bg-white/[0.03] sm:p-4"
            >
              <div className="font-display text-xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                <Counter {...stat} />
              </div>
              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">{stat.label}</div>
            </MotionDiv>
          ))}
        </div>
      </div>

      <MotionDiv
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="pb-10 lg:pb-0"
      >
        <CardStack />
      </MotionDiv>

    </div>
  )
}
