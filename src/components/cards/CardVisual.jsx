import { useReducedMotion, motion } from 'framer-motion'
import { useState } from 'react'
import { Radio } from 'lucide-react'

import { CARD_THEMES } from '@/constants/cardThemes'

function getCardBackground(card, theme) {
  if (card.theme_key !== 'custom') return theme.background
  const firstColor = card.color || theme.color
  return `radial-gradient(120% 120% at 0% 0%, ${firstColor} 0%, transparent 58%), linear-gradient(135deg, ${firstColor} 0%, #172033 58%, #10131d 100%)`
}

export function CardVisual({ card, className = '', interactive = false, onClick }) {
  const MotionDiv = motion.div
  const [tilt, setTilt] = useState({ x: 0, y: 0, lightX: 50, lightY: 40 })
  const prefersReducedMotion = useReducedMotion()
  const theme = CARD_THEMES[card.theme_key] || CARD_THEMES.custom
  const background = getCardBackground(card, theme)

  const handlePointerMove = (event) => {
    if (prefersReducedMotion || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    setTilt({
      x: (0.5 - y) * 12,
      y: (x - 0.5) * 15,
      lightX: x * 100,
      lightY: y * 100,
    })
  }

  return (
    <div
      className={`card-3d-perspective ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0, lightX: 50, lightY: 40 })}
    >
      <MotionDiv
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? `Ver detalhes do cartão ${card.nickname || card.name}` : undefined}
        onClick={interactive ? onClick : undefined}
        onKeyDown={interactive ? (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick?.()
          }
        } : undefined}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18, rotateY: -9 }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: tilt.x,
          rotateY: tilt.y,
        }}
        whileHover={interactive && !prefersReducedMotion ? { scale: 1.025 } : undefined}
        transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
        style={{
          background,
          color: theme.text,
          transformStyle: 'preserve-3d',
          '--card-light-x': `${tilt.lightX}%`,
          '--card-light-y': `${tilt.lightY}%`,
        }}
        className={[
          'card-3d-surface relative aspect-[1.586/1] w-full overflow-hidden rounded-[24px] border border-white/20 p-5 text-left shadow-[0_24px_70px_-35px_rgba(2,6,23,0.8)] sm:p-6',
          interactive ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300' : '',
        ].join(' ')}
      >
        <div aria-hidden="true" className="card-holographic pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-12 h-52 w-52 rounded-full border border-white/10" />

        <div className="relative flex h-full flex-col justify-between" style={{ transform: 'translateZ(25px)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] opacity-75">{card.bank}</p>
              <p className="mt-1 truncate font-display text-lg font-semibold">{card.nickname || card.name}</p>
            </div>
            <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
              {card.card_brand === 'other' ? 'Card' : card.card_brand}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-12 items-center justify-center rounded-lg border border-white/25 bg-gradient-to-br from-white/45 to-white/10 shadow-inner">
              <span className="h-5 w-7 rounded-md border border-white/50 bg-gradient-to-br from-amber-100/80 via-amber-300/50 to-amber-100/40" />
            </div>
            <Radio size={20} className="rotate-90 opacity-75" aria-hidden="true" />
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-sm tracking-[0.17em]">
                {card.last_digits ? `••••  ••••  ••••  ${card.last_digits}` : '••••  ••••  ••••'}
              </p>
              {card.cardholder_name ? (
                <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-[0.16em] opacity-80">{card.cardholder_name}</p>
              ) : null}
            </div>
            <p className="font-display text-sm font-bold uppercase italic tracking-tight">{card.card_brand}</p>
          </div>
        </div>
      </MotionDiv>
    </div>
  )
}
