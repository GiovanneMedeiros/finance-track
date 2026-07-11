import { useState } from 'react'
import { CalendarDays } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { EmptyState } from '@/components/ui/EmptyState'
import { PremiumBadge } from '@/components/ui/PremiumBadge'
import { formatLongDate } from '@/utils/formatters'
import { useUserPlan } from '@/hooks/useUserPlan'

export function PlanningPage({ onSignOut }) {
  const { profile, isPremium } = useUserPlan()
  const [showPremium, setShowPremium] = useState(false)

  return (
    <AppShell
      sidebar={
        <Sidebar
          balanceLabel="R$ 0,00"
          formattedIncome="R$ 0,00"
          formattedExpense="R$ 0,00"
          plan={profile?.plan}
          isPremium={isPremium}
          onOpenPremium={() => setShowPremium(true)}
          onOpenModal={() => null}
          onEditBalance={() => null}
          monthlyGoal={null}
          onEditGoal={() => null}
        />
      }
      header={
        <Header
          currentDateLabel={formatLongDate(new Date())}
          transactionCount={0}
          onOpenModal={() => null}
          onOpenInvoice={() => null}
          onSignOut={onSignOut}
        />
      }
    >
      <div className="space-y-6">
        <SectionHeader
          title="Planejamento"
          description="Planeje suas receitas, despesas e saldo com metas e previsões."
          right={<PremiumBadge />}
        />

        <div className="grid gap-6 xl:grid-cols-[1.6fr_340px]">
          <div className="space-y-5">
            <EmptyState
              title="Planejamento financeiro ainda não configurado"
              description="Defina um plano mensal para comparar com o realizado e acompanhar seu orçamento."
            />
          </div>

          <PremiumGate
            isPremium={isPremium}
            title="Planejamento inteligente"
            description="Receba cenários automáticos e alertas de risco de orçamento."
            onUpgrade={() => setShowPremium(true)}
          >
            <div className="rounded-3xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-slate-950/5">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Orçamento automático</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Use seu histórico para ajustar automaticamente receitas e despesas do próximo mês.</p>
            </div>
          </PremiumGate>
        </div>
      </div>
    </AppShell>
  )
}
