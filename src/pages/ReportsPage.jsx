import { useState } from 'react'
import { BarChart3 } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { EmptyState } from '@/components/ui/EmptyState'
import { PremiumBadge } from '@/components/ui/PremiumBadge'
import { formatLongDate } from '@/utils/formatters'
import { useUserPlan } from '@/hooks/useUserPlan'

export function ReportsPage({ onSignOut }) {
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
          title="Relatórios"
          description="Veja resumos e análises dos seus dados financeiros em relatórios fáceis de entender."
          right={<PremiumBadge />}
        />

        <div className="grid gap-6 xl:grid-cols-[1.6fr_340px]">
          <div className="space-y-5">
            <EmptyState
              title="Relatórios ainda não configurados"
              description="Comece a registrar transações para gerar relatórios mensais e detalhados." 
            />
          </div>

          <PremiumGate
            isPremium={isPremium}
            title="Relatórios avançados"
            description="Comparativos mensais, trimestrais e análise de padrões de gastos."
            onUpgrade={() => setShowPremium(true)}
          >
            <div className="rounded-3xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-slate-950/5">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Insights de economia</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Descubra oportunidades de redução de gastos com relatórios automáticos.</p>
            </div>
          </PremiumGate>
        </div>
      </div>
    </AppShell>
  )
}
