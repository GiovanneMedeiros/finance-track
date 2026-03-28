import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Fingerprint,
  LockKeyhole,
  Sparkles,
  Stars,
  Zap,
} from 'lucide-react'

const MotionDiv = motion.div
const MotionSpan = motion.span

const detailCards = [
  {
    index: '01',
    title: 'Ritmo visual controlado',
    text: 'Menos efeito neon, mais precisão tipográfica e materialidade premium.',
  },
  {
    index: '02',
    title: 'Presença institucional',
    text: 'Uma tela de acesso que parece pertencer a um produto já consolidado.',
  },
  {
    index: '03',
    title: 'Interface com assinatura',
    text: 'Composição autoral para diferenciar a identidade do restante do portfólio.',
  },
]

const stats = [
  { label: 'confiança percebida', value: '96%' },
  { label: 'tempo de leitura', value: '08s' },
  { label: 'fricção reduzida', value: '-42%' },
]

export function AuthHeroPanel({ onAccessClick }) {
  return (
    <div className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-[32px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,252,247,0.92),rgba(242,235,224,0.84))] p-6 shadow-[0_32px_100px_rgba(56,44,28,0.12)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(19,20,24,0.96),rgba(13,14,18,0.88))] sm:rounded-[36px] sm:p-8 lg:p-10">
      {/* Decorative overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_30%,transparent_70%,rgba(255,255,255,0.08))] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_35%,transparent_68%,rgba(255,255,255,0.02))]" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(185,139,92,0.1),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(185,139,92,0.06),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(185,139,92,0.06),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(185,139,92,0.04),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[72px] h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.06),rgba(15,23,42,0.1),rgba(15,23,42,0.06),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.04),rgba(255,255,255,0.07),rgba(255,255,255,0.04),transparent)] sm:top-[84px]" />

      {/* Top header area */}
      <div className="relative z-10 space-y-5 sm:space-y-6">
        {/* Row 1: Primary badge + action button */}
        <div className="flex items-center justify-between gap-4">
          <MotionDiv
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-[#b98b5c]/20 bg-[linear-gradient(135deg,rgba(185,139,92,0.08),rgba(185,139,92,0.03))] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#8c6641] backdrop-blur-sm dark:border-[#d4b08a]/15 dark:bg-[linear-gradient(135deg,rgba(212,176,138,0.08),rgba(212,176,138,0.02))] dark:text-[#d4b08a] sm:text-[11px]">
              <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(185,139,92,0.06),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(212,176,138,0.04),transparent)]" />
              <MotionSpan
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <Zap size={13} className="drop-shadow-[0_0_4px_rgba(185,139,92,0.4)]" />
              </MotionSpan>
              <span className="relative font-medium">FinanceTrack Private Access</span>
            </span>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={onAccessClick}
            className="group relative cursor-pointer"
          >
            <div className="absolute -inset-1 rounded-2xl bg-[radial-gradient(circle,rgba(185,139,92,0.12),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:bg-[radial-gradient(circle,rgba(212,176,138,0.1),transparent_70%)]" />
            <div className="relative flex items-center gap-2 rounded-2xl border border-black/8 bg-white/70 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(56,44,28,0.06)] backdrop-blur-sm transition-all duration-300 group-hover:border-[#b98b5c]/20 group-hover:shadow-[0_12px_32px_rgba(56,44,28,0.1)] dark:border-white/10 dark:bg-white/[0.04] dark:group-hover:border-[#d4b08a]/20 sm:px-4 sm:py-3">
              <Fingerprint size={16} className="text-[#9e7450] dark:text-[#d4b08a]" />
              <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 sm:inline">Acessar</span>
              <ArrowUpRight size={14} className="text-[#9e7450] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-[#d4b08a]" />
            </div>
          </MotionDiv>
        </div>

        {/* Row 2: Secondary badges + sequence label */}
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="flex flex-wrap items-center gap-2.5 sm:gap-3"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-black/6 bg-black/[0.03] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-slate-600 backdrop-blur-sm dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-300 sm:text-[11px]">
            <Stars size={12} className="text-slate-500 dark:text-slate-400" />
            Editorial premium system
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-slate-400/50 dark:bg-slate-500/50 sm:block" />

          <MotionSpan
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 sm:text-[11px]"
          >
            <Sparkles size={11} className="text-[#b98b5c]/60 dark:text-[#d4b08a]/50" />
            Identity Sequence 01
          </MotionSpan>
        </MotionDiv>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col gap-8">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-5"
        >
          <h1 className="text-3xl font-normal leading-[1.08] text-[#17130f] dark:text-white sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.75rem]">
            Uma entrada com postura institucional, não com cara de template brilhando.
          </h1>

          <p className="max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base sm:leading-7">
            Esta composição troca glow exagerado por estrutura, contraste e presença. O resultado fica mais raro, mais maduro e claramente separado de outras linguagens visuais do portfólio.
          </p>
        </MotionDiv>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {stats.map((item, index) => (
            <MotionDiv
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + index * 0.08, duration: 0.4 }}
              className="rounded-2xl border border-black/8 bg-white/56 p-3 dark:border-white/10 dark:bg-white/[0.04] sm:rounded-[20px] sm:p-4"
            >
              <div className="text-lg font-semibold text-[#17130f] dark:text-white sm:text-2xl">
                {item.value}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 sm:mt-1 sm:text-xs sm:tracking-[0.2em]">
                {item.label}
              </div>
            </MotionDiv>
          ))}
        </div>

        {/* Verification panel */}
        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14 }}
          className="rounded-2xl border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(248,242,233,0.72))] p-5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] sm:rounded-3xl sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 sm:text-[11px]">
                Verification room
              </div>
              <div className="mt-1.5 text-base font-semibold text-[#17130f] dark:text-white sm:text-lg">
                Autenticação tratada como experiência de marca
              </div>
            </div>
            <div className="shrink-0 rounded-xl border border-black/8 bg-white/70 p-2.5 text-[#9e7450] dark:border-white/10 dark:bg-white/[0.05] dark:text-[#d4b08a] sm:rounded-2xl sm:p-3">
              <LockKeyhole size={16} />
            </div>
          </div>

          <div className="mt-5 space-y-4 sm:mt-6">
            {detailCards.map((card, index) => (
              <MotionDiv
                key={card.index}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + index * 0.08, duration: 0.4 }}
                className="border-t border-black/8 pt-4 first:border-t-0 first:pt-0 dark:border-white/10"
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.28em] text-[#9e7450] dark:text-[#d4b08a] sm:text-[11px]">
                    {card.index}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#17130f] dark:text-white sm:text-base">
                      {card.title}
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:mt-1.5 sm:text-sm sm:leading-6">
                      {card.text}
                    </div>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>
      </div>
    </div>
  )
}