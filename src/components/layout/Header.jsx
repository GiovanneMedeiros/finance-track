import { BellDot, FileUp, LogOut, Plus, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Header({ currentDateLabel, transactionCount, onOpenModal, onOpenInvoice, onSignOut }) {
  return (
    <header className="panel border-slate-900/10 px-5 py-4 transition-colors duration-300 dark:border-white/10 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* ── Left: title ── */}
        <div className="min-w-0 shrink space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-900/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-emerald-700 transition-colors duration-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-emerald-200/75">
            <Sparkles size={13} />
            Visao financeira
          </div>

          <div>
            <h2 className="text-xl text-slate-950 transition-colors duration-300 dark:text-white sm:text-2xl">
              Painel financeiro
            </h2>
            <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
              {currentDateLabel} · {transactionCount} transacoes registradas.
            </p>
          </div>
        </div>

        {/* ── Right: all actions ── */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Secondary actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button
              size="icon"
              variant="secondary"
              className="h-11 w-11 rounded-2xl border border-slate-900/10 dark:border-white/10"
              aria-label="Notificacoes"
            >
              <BellDot size={17} />
            </Button>

            {onSignOut ? (
              <Button
                variant="ghost"
                className="h-11 rounded-2xl border border-slate-900/10 dark:border-white/10"
                onClick={onSignOut}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair demo</span>
              </Button>
            ) : null}
          </div>

          {/* Divider */}
          <div className="mx-0.5 hidden h-9 w-px rounded-full bg-slate-900/10 dark:bg-white/10 sm:block" />

          {/* Primary actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="h-11 rounded-2xl border border-slate-900/10 dark:border-white/10"
              onClick={onOpenInvoice}
            >
              <FileUp size={16} />
              <span className="hidden sm:inline">Importar fatura</span>
            </Button>

            <Button
              className="h-11 rounded-2xl shadow-[0_12px_28px_rgba(20,184,166,0.25)]"
              onClick={onOpenModal}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span className="hidden sm:inline">Adicionar transacao</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}