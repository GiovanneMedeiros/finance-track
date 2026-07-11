import { useState } from 'react'
import { CreditCard, Lock, Plus } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PremiumGate } from '@/components/ui/PremiumGate'
import { PremiumBadge } from '@/components/ui/PremiumBadge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PremiumCheckoutModal } from '@/components/dashboard/PremiumCheckoutModal'
import { CardFormModal } from '@/components/cards/CardFormModal'
import { CardsList } from '@/components/cards/CardsList'
import { formatLongDate } from '@/utils/formatters'
import { useCards } from '@/hooks/useCards'
import { useUserPlan } from '@/hooks/useUserPlan'

export function CardsPage({ onSignOut }) {
  const { profile, isPremium, upgradeToPremium } = useUserPlan()
  const { cards, addCard, updateCard, removeCard, loading } = useCards()
  const [showPremium, setShowPremium] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)

  const handleOpenForm = (card = null) => {
    setSelectedCard(card)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setSelectedCard(null)
    setIsFormOpen(false)
  }

  const handleSaveCard = async (formData) => {
    if (selectedCard) {
      await updateCard(selectedCard.id, formData)
    } else {
      await addCard(formData)
    }
  }

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Tem certeza que deseja deletar este cartão?')) {
      await removeCard(cardId)
    }
  }

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
      {/* TODO: Re-enable PremiumGate wrapper after testing */}
      <div className="space-y-6">
        <SectionHeader
          title="Cartões"
          description="Acompanhe seus cartões de crédito, limites e faturas em um único lugar."
          icon={<PremiumBadge />}
          right={
            <Button onClick={() => handleOpenForm()} className="h-10 rounded-xl">
              <Plus size={18} />
              <span className="hidden sm:inline">Novo cartão</span>
            </Button>
          }
        />

        {loading ? (
          <EmptyState
            title="Carregando cartões..."
            description="Aguarde enquanto buscamos seus cartões no Supabase."
          />
        ) : cards.length === 0 ? (
          <EmptyState
            title="Nenhum cartão cadastrado"
            description="Adicione seus cartões para ver limites, uso e projeções de fechamento."
            action={
              <Button onClick={() => handleOpenForm()}>
                <Plus size={16} />
                Adicionar cartão
              </Button>
            }
          />
        ) : (
          <CardsList
            cards={cards}
            onEdit={handleOpenForm}
            onDelete={handleDeleteCard}
          />
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
          <div className="rounded-3xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-slate-950/5">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Resumo de utilização</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {cards.length === 0
                ? 'Nenhum cartão para mostrar estatísticas.'
                : `Você tem ${cards.length} cartão(ões) configurado(s).`}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-900/10 bg-white p-5 dark:border-white/10 dark:bg-slate-950/5">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Projeção de fechamento</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Veja qual cartão oferece o melhor custo-benefício antes da fatura fechar.</p>
          </div>
        </div>
      </div>

      <CardFormModal
        open={isFormOpen}
        card={selectedCard}
        onClose={handleCloseForm}
        onSave={handleSaveCard}
      />

      <PremiumCheckoutModal
        open={showPremium}
        onClose={() => setShowPremium(false)}
        onUpgrade={async () => {
          await upgradeToPremium()
          setShowPremium(false)
        }}
      />
    </AppShell>
  )
}
