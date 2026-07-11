import { useState } from 'react'
import { Settings } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PremiumBadge } from '@/components/ui/PremiumBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatLongDate } from '@/utils/formatters'
import { useUserPlan } from '@/hooks/useUserPlan'

export function SettingsPage({ onSignOut }) {
  const { profile, isPremium } = useUserPlan()
  const [currentSection, setCurrentSection] = useState('profile')

  return (
    <AppShell
      sidebar={
        <Sidebar
          balanceLabel="R$ 0,00"
          formattedIncome="R$ 0,00"
          formattedExpense="R$ 0,00"
          plan={profile?.plan}
          isPremium={isPremium}
          onOpenPremium={() => null}
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
          title="Configurações"
          description="Ajuste seu perfil, preferências e veja o status da sua assinatura."
          right={<PremiumBadge />}
        />

        <div className="grid gap-6 xl:grid-cols-[1.6fr_340px]">
          <div className="space-y-5">
            <EmptyState
              title="Configurações do usuário"
              description="Aqui você poderá editar seu perfil, alterar senha e gerenciar preferências." 
            />
          </div>

          <div className="rounded-3xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-slate-950/5">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Status do plano</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{profile?.plan === 'premium' ? 'Premium ativo' : 'Plano Free'}</p>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">Renovação: {profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR') : 'Nenhuma assinatura ativa'}</p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
