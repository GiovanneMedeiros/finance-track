import { useState } from 'react'
import { FileText } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatLongDate } from '@/utils/formatters'
import { useUserPlan } from '@/hooks/useUserPlan'

export function InvoicesPage({ onSignOut }) {
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
          title="Faturas"
          description="Visualize o status das suas faturas e acompanhe pagamentos em aberto."
        />

        <div className="grid gap-6 xl:grid-cols-[1.6fr_340px]">
          <div className="space-y-5">
            <EmptyState
              title="Nenhuma fatura encontrada"
              description="Registre uma fatura e comece a controlar vencimentos e pagamentos."
            />
          </div>

          <div className="rounded-3xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-slate-950/5">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Simulação de parcelamento</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Compare valores com parcelamento e escolha a melhor data de pagamento.</p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
