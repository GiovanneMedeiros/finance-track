import {
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  FileText,
  FolderOpen,
  Import,
  LayoutDashboard,
  Pencil,
  PiggyBank,
  Settings,
  Tag,
  Target,
  Wallet,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { PremiumBadge } from '@/components/ui/PremiumBadge'

const navGroups = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Transações', icon: ArrowUpDown, path: '/transactions' },
      { label: 'Cartões', icon: CreditCard, path: '/cards', premium: true },
      { label: 'Faturas', icon: FileText, path: '/invoices' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { label: 'Planejamento', icon: PiggyBank, path: '/planning', premium: true },
      { label: 'Metas', icon: Target, path: '/goals', premium: true },
      { label: 'Categorias', icon: Tag, path: '/categories' },
      { label: 'Relatórios', icon: BarChart3, path: '/reports', premium: true },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Importações', icon: Import, path: '/imports' },
      { label: 'Configurações', icon: Settings, path: '/settings' },
    ],
  },
]

function NavItem({ label, icon: Icon, path, premium }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) => [
        'group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200',
        isActive
          ? 'bg-slate-900/[0.07] text-slate-950 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] dark:bg-white/[0.08] dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
          : 'text-[var(--text-secondary)] hover:bg-slate-900/[0.04] hover:text-slate-950 dark:hover:bg-white/[0.05] dark:hover:text-white',
      ].join(' ')}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={16}
            className={
              isActive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'opacity-50 transition group-hover:opacity-100'
            }
          />
          <span>{label}</span>
          {premium ? (
            <PremiumBadge compact className="ml-auto" />
          ) : isActive ? (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
          ) : null}
        </>
      )}
    </NavLink>
  )
}

function NavGroup({ title, items }) {
  return (
    <div>
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)]/60">
        {title}
      </p>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </div>
    </div>
  )
}

export function Sidebar({ balanceLabel, formattedIncome, formattedExpense, onOpenModal, onEditBalance, monthlyGoal, onEditGoal, plan, isPremium, onOpenPremium }) {
  const [balanceFlash, setBalanceFlash] = useState(false)
  const prevBalanceRef = useRef(balanceLabel)

  useEffect(() => {
    if (prevBalanceRef.current !== balanceLabel) {
      prevBalanceRef.current = balanceLabel
      setBalanceFlash(true)
      const timer = setTimeout(() => setBalanceFlash(false), 700)
      return () => clearTimeout(timer)
    }
  }, [balanceLabel])

  const goalTarget = monthlyGoal?.target ?? 0
  const goalCurrent = monthlyGoal?.current ?? 0
  const goalPercent = goalTarget > 0 ? Math.min(Math.round((goalCurrent / goalTarget) * 100), 100) : 0
  const goalTargetLabel = goalTarget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const goalCurrentLabel = goalCurrent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <aside className="panel-strong flex w-full flex-col border-emerald-400/15 p-4 transition-colors duration-300 sm:p-5 lg:sticky lg:top-5 lg:min-h-full lg:w-[270px] lg:p-4">
      {/* ── Brand ── */}
      <div className="flex items-center gap-3 px-1">
        <img src="/logo.png" alt="FinanceTrack" className="h-9 w-9 rounded-lg shadow-[0_6px_16px_rgba(20,184,166,0.28)]" />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-950 dark:text-white">FinanceTrack</p>
          <p className="text-[10px] text-[var(--text-secondary)]">Controle com clareza</p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="my-4 h-px bg-slate-900/6 dark:bg-white/6" />

      {/* ── Balance card ── */}
      <div className="group/balance relative overflow-hidden rounded-xl border border-emerald-300/12 bg-[linear-gradient(160deg,rgba(52,211,153,0.13),rgba(12,18,32,0.18))] p-3.5">
        <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950/40 text-emerald-300">
            <Wallet size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Saldo disponivel
            </p>
            <strong
              className={[
                'mt-0.5 block truncate text-lg tracking-tight text-slate-950 transition-all duration-500 dark:text-white',
                balanceFlash ? 'scale-105 text-emerald-500 dark:text-emerald-400' : '',
              ].join(' ')}
            >
              {balanceLabel}
            </strong>
          </div>
          <button
            type="button"
            onClick={onEditBalance}
            aria-label="Editar saldo"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-slate-400 opacity-0 transition-all duration-200 hover:bg-white/[0.14] hover:text-emerald-300 group-hover/balance:opacity-100"
          >
            <Pencil size={12} />
          </button>
        </div>

        <div className="mt-3 flex gap-2.5">
          <div className="flex items-center gap-1.5 rounded-md bg-emerald-400/10 px-2 py-0.5">
            <ArrowDownLeft size={12} className="text-emerald-400" />
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
              {formattedIncome}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-rose-400/10 px-2 py-0.5">
            <ArrowUpRight size={12} className="text-rose-400" />
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-300">
              {formattedExpense}
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="mt-4 flex flex-col gap-4 overflow-x-auto pb-1 lg:overflow-visible">
        {navGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </nav>

      <div className="mt-5 rounded-[1.75rem] border border-emerald-300/15 bg-slate-950/5 p-4 text-center dark:border-white/10 dark:bg-white/5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-700/80 dark:text-emerald-200/70">
          {isPremium ? 'Premium ativo' : 'Plano Free'}
        </p>
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
          {isPremium
            ? 'Aproveite relatórios avançados, previsão e alertas na sua conta.'
            : 'Desbloqueie recursos como previsões, metas avançadas e análises inteligentes.'}
        </p>
        <Button className="mt-4 w-full" onClick={onOpenPremium}>
          {isPremium ? 'Gerenciar Premium' : 'Assinar Premium'}
        </Button>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Monthly goal card ── */}
      <div className="group/goal mt-4 rounded-xl border border-slate-900/6 bg-slate-900/[0.03] p-3.5 dark:border-white/6 dark:bg-white/[0.03]">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Target size={13} className="text-emerald-500" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">Meta do mes</p>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onEditGoal}
            aria-label="Editar meta"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-slate-400 opacity-0 transition-all duration-200 hover:bg-white/[0.12] hover:text-emerald-300 group-hover/goal:opacity-100"
          >
            <Pencil size={10} />
          </button>
        </div>

        <p className="mt-2 text-[13px] text-slate-950 dark:text-white">
          Objetivo: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{goalTargetLabel}</span>
        </p>

        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-900/6 dark:bg-white/6">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#34d399,#14b8a6)] transition-all duration-500"
            style={{ width: `${goalPercent}%` }}
          />
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
          <span>{goalPercent}% concluido</span>
          <span>{goalCurrentLabel} / {goalTargetLabel}</span>
        </div>
      </div>

      {/* ── CTA ── */}
      <Button className="mt-3 w-full" onClick={onOpenModal}>
        Adicionar transacao
      </Button>
    </aside>
  )
}