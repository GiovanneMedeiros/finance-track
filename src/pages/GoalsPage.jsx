import { useState } from 'react'
import { Target } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { EmptyState } from '@/components/ui/EmptyState'
import { PremiumBadge } from '@/components/ui/PremiumBadge'
import { formatLongDate } from '@/utils/formatters'
import { useUserPlan } from '@/hooks/useUserPlan'

export function GoalsPage({ onSignOut }) {
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
          title="Metas"
          description="Defina objetivos e acompanhe progresso para conquistar suas finanças."
          right={<PremiumBadge />}
        />

        <div className="grid gap-6 xl:grid-cols-[1.6fr_340px]">
          <div className="space-y-5">
            <EmptyState
              title="Nenhuma meta criada"
              description="Crie metas de economia ou investimento para acompanhar seu progresso." 
            />
          </div>

          <PremiumGate
            isPremium={isPremium}
            title="Metas com inteligência financeira"
            description="Receba recomendações de aporte e simulações de conclusão automática."
            onUpgrade={() => setShowPremium(true)}
          >
            <div className="rounded-3xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-slate-950/5">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Projeção de conclusão</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Saiba quanto você precisa guardar por mês para bater sua meta no prazo.</p>
            </div>
          </PremiumGate>
        </div>
      </div>
    </AppShell>
  )
}
