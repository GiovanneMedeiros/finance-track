import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight, CheckCircle2, Eye, TrendingUp } from 'lucide-react'

import { BankCard } from '@/components/auth/BankCard'
import { bankCards } from '@/constants/bankCards'

const MotionDiv = motion.div

// Position of each card in the fan, from front (0) to back (3)
const slots = [
  { x: 0, y: 0, rotate: -8, scale: 1, opacity: 1, zIndex: 40 },
  { x: 34, y: -30, rotate: -2, scale: 0.93, opacity: 0.95, zIndex: 30 },
  { x: 66, y: -58, rotate: 4, scale: 0.86, opacity: 0.85, zIndex: 20 },
  { x: 96, y: -84, rotate: 10, scale: 0.79, opacity: 0.6, zIndex: 10 },
]

const categoryBars = [
  { label: 'Alimentação', value: 82, color: '#34d399' },
  { label: 'Transporte', value: 54, color: '#60a5fa' },
  { label: 'Lazer', value: 38, color: '#f472b6' },
  { label: 'Assinaturas', value: 24, color: '#fbbf24' },
]

function FloatingWidget({ className, delay = 0, floatDelay = 0, children }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: 'spring', bounce: 0.35 }}
      className={`absolute z-50 ${className}`}
    >
      <MotionDiv
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
        className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)]"
      >
        {children}
      </MotionDiv>
    </MotionDiv>
  )
}

export function CardStack() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 18 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), { stiffness: 150, damping: 18 })

  useEffect(() => {
    if (paused) return undefined
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % bankCards.length)
    }, 3200)
    return () => window.clearInterval(id)
  }, [paused])

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  const handleLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setPaused(false)
  }

  const activeCard = bankCards[active]

  return (
    <div
      className="relative mx-auto h-[300px] w-full max-w-[520px] [perspective:1400px] sm:h-[380px]"
      onMouseMove={handleMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={handleLeave}
    >
      {/* glow tinted by the active card */}
      <MotionDiv
        key={activeCard.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] sm:h-[340px] sm:w-[340px]"
        style={{ background: activeCard.background, opacity: 0.55 }}
      />

      <MotionDiv
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-[260px] text-[11px] sm:w-[330px] sm:text-[13.5px]" style={{ transformStyle: 'preserve-3d' }}>
          <div className="aspect-[1.586]" />
          {bankCards.map((card, index) => {
            const slotIndex = (index - active + bankCards.length) % bankCards.length
            const slot = slots[slotIndex]
            return (
              <MotionDiv
                key={card.id}
                className="absolute inset-0 cursor-pointer"
                style={{ zIndex: slot.zIndex }}
                initial={{ opacity: 0, y: 80, rotate: -20 }}
                animate={{
                  x: slot.x - 40,
                  y: slot.y + 36,
                  rotate: slot.rotate,
                  scale: slot.scale,
                  opacity: slot.opacity,
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.9 }}
                whileHover={slotIndex === 0 ? { y: slot.y + 26, scale: 1.03 } : undefined}
                onClick={() => setActive(index)}
              >
                <BankCard card={card} className="h-full w-full" />
              </MotionDiv>
            )
          })}
        </div>
      </MotionDiv>

      {/* Floating widgets */}
      <FloatingWidget className="-left-2 top-2 sm:-left-6 sm:top-4" delay={0.6}>
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          Saldo disponível <Eye size={12} />
        </div>
        <div className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
          R$ 12.480<span className="text-slate-400">,32</span>
        </div>
        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
          <TrendingUp size={12} /> +8,2% este mês
        </div>
      </FloatingWidget>

      <FloatingWidget className="-right-1 bottom-6 hidden w-[190px] sm:block" delay={0.8} floatDelay={1.2}>
        <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          Gastos do mês <ArrowUpRight size={12} />
        </div>
        <div className="space-y-1.5">
          {categoryBars.map((bar, index) => (
            <div key={bar.label}>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                <span>{bar.label}</span>
                <span className="font-semibold">{bar.value}%</span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-900/8 dark:bg-white/10">
                <MotionDiv
                  className="h-full rounded-full"
                  style={{ background: bar.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.value}%` }}
                  transition={{ delay: 1.1 + index * 0.12, duration: 0.9, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </FloatingWidget>

      <FloatingWidget className="bottom-0 left-2 sm:-bottom-2 sm:left-4" delay={1} floatDelay={2.4}>
        <MotionDiv
          key={activeCard.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: activeCard.background }}
          >
            <CheckCircle2 size={16} />
          </span>
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">
              Fatura {activeCard.bank} importada
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {18 + active * 7} lançamentos categorizados
            </div>
          </div>
        </MotionDiv>
      </FloatingWidget>

      {/* dots */}
      <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
        {bankCards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            aria-label={`Mostrar cartão ${card.bank}`}
            onClick={() => setActive(index)}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: index === active ? 28 : 8,
              background: index === active ? card.background : 'rgba(148,163,184,0.4)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
