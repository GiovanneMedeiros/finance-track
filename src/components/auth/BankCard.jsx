import clsx from 'clsx'
import { Wifi } from 'lucide-react'

function Chip() {
  return (
    <div className="relative h-[2.1em] w-[2.8em] overflow-hidden rounded-[0.45em] bg-[linear-gradient(135deg,#f6e3a1,#d4af5a_45%,#b88a2e)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)]">
      <div className="absolute inset-x-0 top-1/2 h-px bg-black/20" />
      <div className="absolute inset-y-0 left-1/3 w-px bg-black/20" />
      <div className="absolute inset-y-0 right-1/3 w-px bg-black/20" />
      <div className="absolute left-1/3 right-1/3 top-[30%] bottom-[30%] rounded-[0.2em] border border-black/20" />
    </div>
  )
}

export function BankCard({ card, className, style }) {
  return (
    <div
      className={clsx(
        'relative aspect-[1.586] select-none overflow-hidden rounded-[1.1em] p-[1.4em] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)_inset]',
        className,
      )}
      style={{ background: card.background, color: card.text, ...style }}
    >
      {/* moving sheen */}
      <div className="card-sheen pointer-events-none absolute inset-0" />
      {/* decorative rings */}
      <div
        className="pointer-events-none absolute -right-[18%] -top-[40%] aspect-square w-[70%] rounded-full border-[1.4em]"
        style={{ borderColor: card.accent }}
      />
      <div
        className="pointer-events-none absolute -bottom-[55%] -left-[10%] aspect-square w-[55%] rounded-full border"
        style={{ borderColor: card.accent }}
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className={clsx('leading-none', card.wordmark)}>{card.label}</span>
          <span className="rounded-full px-[0.7em] py-[0.25em] text-[0.62em] font-semibold uppercase tracking-[0.18em]" style={{ background: card.accent }}>
            {card.tier}
          </span>
        </div>

        <div className="flex items-center gap-[0.8em]">
          <Chip />
          <Wifi className="h-[1.3em] w-[1.3em] rotate-90 opacity-80" />
        </div>

        <div className="space-y-[0.5em]">
          <div className="font-mono text-[1.05em] tracking-[0.18em] opacity-95">
            •••• •••• •••• {card.last4}
          </div>
          <div className="flex items-end justify-between text-[0.62em] uppercase tracking-[0.16em]">
            <div>
              <div className="opacity-60">Titular</div>
              <div className="mt-[0.2em] text-[1.15em] font-medium opacity-95">{card.holder}</div>
            </div>
            <div className="text-right">
              <div className="opacity-60">Validade</div>
              <div className="mt-[0.2em] text-[1.15em] font-medium opacity-95">{card.expiry}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
