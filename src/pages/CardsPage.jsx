import { useMemo, useState } from 'react'
import {
  Archive,
  Bell,
  Check,
  CreditCard,
  Heart,
  Layers3,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wallet,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { AppShell } from '@/app/AppShell'
import { PremiumCheckoutModal } from '@/components/dashboard/PremiumCheckoutModal'
import { CardBillList } from '@/components/cards/CardBillList'
import { CardFormModal } from '@/components/cards/CardFormModal'
import { CardPurchaseList } from '@/components/cards/CardPurchaseList'
import { CardPurchaseModal } from '@/components/cards/CardPurchaseModal'
import { CardVisual } from '@/components/cards/CardVisual'
import { OpenFinancePanel } from '@/components/cards/OpenFinancePanel'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PremiumBadge } from '@/components/ui/PremiumBadge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CARD_PURCHASE_CATEGORIES } from '@/constants/cardThemes'
import { useCardPortfolio } from '@/hooks/useCardPortfolio'
import { useUserPlan } from '@/hooks/useUserPlan'
import { getCardPortfolioAnalytics } from '@/services/cardPortfolioAnalytics'
import { formatCurrency, formatLongDate } from '@/utils/formatters'

const CHART_COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#fb7185', '#a78bfa', '#2dd4bf', '#f97316', '#94a3b8']
const CARD_CHART_INITIAL_SIZE = { width: 640, height: 192 }
const ANALYTICS_CHART_INITIAL_SIZE = { width: 640, height: 256 }
const CATEGORY_CHART_INITIAL_SIZE = { width: 320, height: 224 }
const COMPARISON_CHART_INITIAL_SIZE = { width: 640, height: 288 }

function localDateValue() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function StatCard({ icon: Icon, label, value, note, tone = 'emerald' }) {
  const IconComponent = Icon
  const tones = {
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
    blue: 'bg-sky-500/10 text-sky-700 dark:text-sky-200',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-200',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-200',
  }
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-secondary)] sm:text-sm">{label}</p>
          <p className="mt-2 truncate text-xl font-bold sm:text-2xl">{value}</p>
          {note ? <p className="mt-1 text-[11px] text-[var(--text-secondary)] sm:text-xs">{note}</p> : null}
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${tones[tone]}`}>
          <IconComponent size={18} />
        </span>
      </div>
    </Card>
  )
}

export function CardsPage({ onSignOut }) {
  const { profile, isPremium } = useUserPlan()
  const portfolio = useCardPortfolio()
  const {
    cards,
    purchases,
    installments,
    bills,
    alerts,
    connections,
    openFinanceAccounts,
    openFinanceTransactions,
    openFinanceBills,
    openFinanceSchemaError,
    loading,
    mutating,
    error,
    saveCard,
    updateCard,
    deleteCard,
    savePurchase,
    deletePurchase,
    payBill,
    markAlertsRead,
  } = portfolio
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [showArchived, setShowArchived] = useState(false)
  const [editingCard, setEditingCard] = useState(undefined)
  const [purchaseDraft, setPurchaseDraft] = useState(undefined)
  const [activeSection, setActiveSection] = useState('cards')
  const [search, setSearch] = useState('')
  const [filterCard, setFilterCard] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [showPremium, setShowPremium] = useState(false)

  const analytics = useMemo(
    () => getCardPortfolioAnalytics({ cards, purchases, installments, bills }),
    [cards, purchases, installments, bills],
  )
  const availableCards = useMemo(
    () => cards.filter((card) => card.is_active && !card.is_archived && card.network === 'credit'),
    [cards],
  )
  const displayedCards = useMemo(
    () => cards.filter((card) => showArchived || (card.is_active && !card.is_archived)),
    [cards, showArchived],
  )
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? availableCards[0] ?? null
  const selectedCurrentBill = analytics.currentBills.find((entry) => entry.card.id === selectedCard?.id)
  const selectedCardMonthSpend = analytics.cardComparison.find((item) => item.cardId === selectedCard?.id)?.month ?? 0
  const filteredPurchases = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    return purchases.filter((purchase) => (
      (!query || purchase.title.toLocaleLowerCase('pt-BR').includes(query))
      && (!filterCard || purchase.card_id === filterCard)
      && (!filterCategory || purchase.category === filterCategory)
      && (!filterStart || purchase.purchase_date >= filterStart)
      && (!filterEnd || purchase.purchase_date <= filterEnd)
    ))
  }, [purchases, search, filterCard, filterCategory, filterStart, filterEnd])
  const sidebarBalance = formatCurrency(0)
  const openDueText = analytics.upcomingDue
    ? `${analytics.upcomingDue.due_date < localDateValue() ? 'Vencida desde' : 'Vence em'} ${new Date(`${analytics.upcomingDue.due_date}T12:00:00`).toLocaleDateString('pt-BR')}`
    : 'Nenhum vencimento pendente'

  const handleAction = async (action, successMessage) => {
    setActionError('')
    setActionSuccess('')
    try {
      await action()
      setActionSuccess(successMessage)
    } catch (actionFailure) {
      setActionError(actionFailure.message || 'Não foi possível concluir a operação.')
    }
  }

  const handleArchive = (card) => {
    const archive = !card.is_archived
    void handleAction(
      () => updateCard(card.id, { is_archived: archive, is_active: !archive, ...(archive ? { is_favorite: false } : {}) }),
      archive ? 'Cartão arquivado. O histórico e as faturas foram preservados.' : 'Cartão reativado.',
    )
  }

  const handleDeleteCard = (card) => {
    if (!window.confirm(`Excluir o cartão "${card.nickname || card.name}"? Esta ação não pode ser desfeita.`)) return
    void handleAction(
      () => deleteCard(card.id),
      'Cartão excluído.',
    )
  }

  const handlePayBill = (bill) => {
    if (!window.confirm('Registrar o pagamento desta fatura? Isso não criará uma nova despesa de consumo.')) return
    void handleAction(() => payBill(bill.id), 'Pagamento da fatura registrado.')
  }

  const handleDeletePurchase = (purchase) => {
    if (!window.confirm(`Excluir a compra "${purchase.title}" e todas as parcelas vinculadas?`)) return
    void handleAction(() => deletePurchase(purchase.id), 'Compra e parcelas excluídas.')
  }

  const setFavorite = (card) => {
    void handleAction(
      () => updateCard(card.id, { is_favorite: !card.is_favorite }),
      card.is_favorite ? 'Cartão removido dos favoritos.' : 'Cartão definido como favorito.',
    )
  }

  const appSidebar = (
    <Sidebar
      balanceLabel={sidebarBalance}
      formattedIncome={formatCurrency(0)}
      formattedExpense={formatCurrency(analytics.monthlySpend)}
      plan={profile?.plan}
      isPremium={isPremium}
      onOpenPremium={() => setShowPremium(true)}
      monthlyGoal={null}
    />
  )

  return (
    <AppShell
      sidebar={appSidebar}
      header={<Header currentDateLabel={formatLongDate(new Date())} transactionCount={purchases.length} onSignOut={onSignOut} />}
    >
      <div className="space-y-6">
        <SectionHeader
          title="Meus Cartões"
          description="Cartões, compras e faturas organizados em um só lugar."
          right={(
            <div className="flex flex-wrap items-center gap-2">
              <PremiumBadge />
              <Button onClick={() => setEditingCard(null)}><Plus size={16} /> Adicionar cartão</Button>
            </div>
          )}
        />

        {error || actionError ? (
          <Card role="alert" className="flex flex-wrap items-center justify-between gap-3 border-rose-400/20 p-4 text-sm text-rose-700 dark:text-rose-200">
            <span>{actionError || error}</span>
            {portfolio.refresh ? <Button variant="secondary" size="md" onClick={() => void portfolio.refresh().catch(() => {})}>Tentar novamente</Button> : null}
          </Card>
        ) : null}
        {actionSuccess ? (
          <Card role="status" className="flex items-center gap-2 border-emerald-400/20 p-4 text-sm text-emerald-700 dark:text-emerald-200">
            <Check size={16} /> {actionSuccess}
          </Card>
        ) : null}

        <section aria-label="Resumo dos cartões" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard icon={CreditCard} label="Cartões ativos" value={analytics.totalCards} note={`${cards.filter((card) => card.is_archived || !card.is_active).length} arquivado(s)`} />
          <StatCard icon={Wallet} label="Limite disponível" value={formatCurrency(analytics.availableLimit)} note={`de ${formatCurrency(analytics.totalLimit)} no total`} tone="blue" />
          <StatCard icon={Layers3} label="Limite utilizado" value={formatCurrency(analytics.totalUsed)} note={`${Math.round(analytics.usagePercent)}% do limite ativo`} tone={analytics.usagePercent >= 90 ? 'rose' : 'amber'} />
          <StatCard icon={Sparkles} label="Compras nas faturas deste mês" value={formatCurrency(analytics.monthlySpend)} note="Parcelas atribuídas ao ciclo de fechamento" />
          <StatCard icon={CreditCard} label="Faturas pendentes" value={analytics.openBillsCount} note={`${formatCurrency(analytics.openBillsTotal)} em aberto`} tone="amber" />
          <StatCard icon={Bell} label="Próximo vencimento" value={analytics.upcomingDue ? formatCurrency(analytics.upcomingDueAmount) : '—'} note={openDueText} tone="rose" />
        </section>

        {alerts.length ? (
          <Card className="flex flex-wrap items-center justify-between gap-3 border-amber-400/20 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600"><Bell size={17} /></span>
              <div>
                <p className="font-semibold">{alerts.length} alerta(s) de cartão</p>
                <div className="mt-1 space-y-1 text-sm text-[var(--text-secondary)]">
                  {alerts.slice(0, 3).map((alert) => <p key={alert.id}>{alert.message}</p>)}
                </div>
              </div>
            </div>
            <Button variant="secondary" onClick={() => void handleAction(markAlertsRead, 'Alertas marcados como lidos.')}>Marcar como lidos</Button>
          </Card>
        ) : null}

        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Seções dos cartões">
          {[
            ['cards', 'Cartões'],
            ['purchases', 'Compras'],
            ['bills', 'Faturas'],
            ['insights', 'Análises'],
            ['openFinance', 'Conectar banco'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeSection === key}
              onClick={() => setActiveSection(key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeSection === key ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-900/[0.04] text-[var(--text-secondary)] hover:bg-slate-900/[0.08] dark:bg-white/[0.05]'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <Card className="p-8 text-center text-sm text-[var(--text-secondary)]" aria-live="polite">Carregando cartões e faturas…</Card>
        ) : activeSection === 'cards' ? (
          <div className="space-y-6">
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Sua carteira</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Selecione um cartão para ver limite, fatura e histórico.</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
                  Mostrar arquivados
                </label>
              </div>
              {displayedCards.length ? (
                <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {displayedCards.map((card) => (
                    <div key={card.id} className={`group rounded-[26px] p-1 transition ${selectedCard?.id === card.id ? 'bg-gradient-to-br from-emerald-400/35 to-sky-400/20' : ''}`}>
                      <CardVisual card={card} interactive onClick={() => setSelectedCardId(card.id)} />
                      <div className="flex items-center justify-between gap-3 px-2 pt-3">
                        <button type="button" className="min-w-0 text-left" onClick={() => setSelectedCardId(card.id)}>
                          <span className="block truncate text-sm font-semibold">{card.nickname || card.name}</span>
                          <span className="block text-xs text-[var(--text-secondary)]">{card.is_archived ? 'Arquivado' : `${formatCurrency(Math.max(0, Number(card.limit_amount ?? card.limit ?? 0) - Number(card.current_usage ?? 0)))} disponível`}</span>
                        </button>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button size="icon" variant="ghost" aria-label={card.is_favorite ? 'Remover favorito' : 'Definir como favorito'} onClick={() => setFavorite(card)} disabled={mutating}>
                            <Heart size={16} className={card.is_favorite ? 'fill-rose-500 text-rose-500' : ''} />
                          </Button>
                          <Button size="icon" variant="ghost" aria-label={`Editar ${card.name}`} onClick={() => setEditingCard(card)} disabled={mutating}><Pencil size={15} /></Button>
                          <Button size="icon" variant="ghost" aria-label={card.is_archived ? `Reativar ${card.name}` : `Arquivar ${card.name}`} onClick={() => handleArchive(card)} disabled={mutating}><Archive size={15} /></Button>
                          <Button size="icon" variant="ghost" aria-label={`Excluir ${card.name}`} title={purchases.some((purchase) => purchase.card_id === card.id) || bills.some((bill) => bill.card_id === card.id) ? 'Cartões com histórico só podem ser arquivados.' : 'Excluir cartão'} onClick={() => handleDeleteCard(card)} disabled={mutating || purchases.some((purchase) => purchase.card_id === card.id) || bills.some((bill) => bill.card_id === card.id)}><Trash2 size={15} /></Button>
                        </div>
                      </div>
                      {purchases.some((purchase) => purchase.card_id === card.id) || bills.some((bill) => bill.card_id === card.id) ? (
                        <p className="px-2 pt-1 text-[11px] text-[var(--text-secondary)]">Este cartão tem histórico. Arquive-o para preservar compras e faturas.</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Sua carteira começa aqui"
                  description="Cadastre seu primeiro cartão. Não solicitamos número completo, CVV ou senha."
                  action={<Button onClick={() => setEditingCard(null)}><Plus size={16} /> Adicionar cartão</Button>}
                />
              )}
            </section>

            {selectedCard ? (
              <Card className="space-y-5 p-5 sm:p-6">
                <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.9fr)_1.1fr] lg:items-center">
                  <div className="max-w-lg"><CardVisual card={selectedCard} /></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><p className="text-xs text-[var(--text-secondary)]">Limite total</p><p className="mt-1 text-xl font-bold">{formatCurrency(Number(selectedCard.limit_amount ?? selectedCard.limit ?? 0))}</p></div>
                    <div><p className="text-xs text-[var(--text-secondary)]">Limite utilizado</p><p className="mt-1 text-xl font-bold">{formatCurrency(Number(selectedCard.current_usage ?? 0))}</p></div>
                    <div><p className="text-xs text-[var(--text-secondary)]">Disponível</p><p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-200">{formatCurrency(Math.max(0, Number(selectedCard.limit_amount ?? selectedCard.limit ?? 0) - Number(selectedCard.current_usage ?? 0)))}</p></div>
                    <div><p className="text-xs text-[var(--text-secondary)]">Fechamento / vencimento</p><p className="mt-1 text-base font-semibold">Dia {selectedCard.closing_day} / dia {selectedCard.due_day}</p></div>
                    <div><p className="text-xs text-[var(--text-secondary)]">Compras na fatura deste mês</p><p className="mt-1 text-xl font-bold">{formatCurrency(selectedCardMonthSpend)}</p></div>
                    <div><p className="text-xs text-[var(--text-secondary)]">Fatura do ciclo atual</p><p className="mt-1 text-xl font-bold">{formatCurrency(selectedCurrentBill?.amount ?? 0)}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{selectedCurrentBill ? `Fecha ${new Date(`${selectedCurrentBill.cycle.closingDate}T12:00:00`).toLocaleDateString('pt-BR')}` : 'Ainda sem compras neste ciclo'}</p></div>
                    <div className="sm:col-span-2">
                      <div className="flex justify-between gap-2 text-xs"><span>Utilização do limite</span><span>{Math.round(Number(selectedCard.limit_amount ?? selectedCard.limit) > 0 ? (Number(selectedCard.current_usage ?? 0) / Number(selectedCard.limit_amount ?? selectedCard.limit)) * 100 : 0)}%</span></div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-900/10 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" style={{ width: `${Math.min(100, Number(selectedCard.limit_amount ?? selectedCard.limit) > 0 ? (Number(selectedCard.current_usage ?? 0) / Number(selectedCard.limit_amount ?? selectedCard.limit)) * 100 : 0)}%` }} /></div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1 sm:col-span-2">
                      <Button size="md" onClick={() => setPurchaseDraft({ cardId: selectedCard.id })} disabled={selectedCard.is_archived || selectedCard.network !== 'credit'}><Plus size={15} /> Registrar compra</Button>
                      <Button size="md" variant="secondary" onClick={() => { setActiveSection('bills'); setFilterCard(selectedCard.id) }}>Ver faturas</Button>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-900/5 pt-4 dark:border-white/5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div><h3 className="font-semibold">Compras recentes</h3><p className="text-xs text-[var(--text-secondary)]">Parcelas futuras não são somadas como compra integral neste mês.</p></div>
                    <Button size="md" variant="ghost" onClick={() => { setFilterCard(selectedCard.id); setActiveSection('purchases') }}>Ver histórico</Button>
                  </div>
                  <div className="mb-4 h-48 min-w-0">
                    <ResponsiveContainer width="100%" height="100%" initialDimension={CARD_CHART_INITIAL_SIZE}>
                      <BarChart data={analytics.cardMonthlyEvolution[selectedCard.id] ?? []}>
                        <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={78} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="amount" name="Compras na fatura" fill="#34d399" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <CardPurchaseList
                    purchases={purchases.filter((purchase) => purchase.card_id === selectedCard.id).slice(0, 4)}
                    cards={cards}
                    onEdit={(purchase) => setPurchaseDraft({ purchase })}
                    onDelete={handleDeletePurchase}
                    mutating={mutating}
                  />
                </div>
              </Card>
            ) : null}
          </div>
        ) : activeSection === 'purchases' ? (
          <div className="space-y-4">
            <Card className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
              <label className="relative sm:col-span-2 xl:col-span-1">
                <Search size={16} className="absolute left-3 top-3.5 text-[var(--text-secondary)]" />
                <input aria-label="Pesquisar compras" className="h-12 w-full rounded-2xl border border-slate-900/10 bg-slate-900/[0.04] pl-9 pr-3 text-sm dark:border-white/10 dark:bg-white/[0.04]" placeholder="Pesquisar descrição" value={search} onChange={(event) => setSearch(event.target.value)} />
              </label>
              <Input label="Cartão" as="select" value={filterCard} options={[{ value: '', label: 'Todos os cartões' }, ...cards.map((card) => ({ value: card.id, label: card.nickname || card.name }))]} onChange={(event) => setFilterCard(event.target.value)} />
              <Input label="Categoria" as="select" value={filterCategory} options={[{ value: '', label: 'Todas as categorias' }, ...CARD_PURCHASE_CATEGORIES.map((category) => ({ value: category, label: category }))]} onChange={(event) => setFilterCategory(event.target.value)} />
              <Input label="De" type="date" value={filterStart} onChange={(event) => setFilterStart(event.target.value)} />
              <Input label="Até" type="date" value={filterEnd} onChange={(event) => setFilterEnd(event.target.value)} />
            </Card>
            <div className="flex justify-end"><Button onClick={() => setPurchaseDraft({})} disabled={!availableCards.length}><Plus size={16} /> Registrar compra</Button></div>
            <CardPurchaseList
              purchases={filteredPurchases}
              cards={cards}
              onEdit={(purchase) => setPurchaseDraft({ purchase })}
              onDelete={handleDeletePurchase}
              mutating={mutating}
            />
          </div>
        ) : activeSection === 'bills' ? (
          <div className="space-y-4">
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div><h2 className="font-semibold">Faturas por ciclo</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Cada parcela é vinculada à fatura correspondente ao fechamento do cartão.</p></div>
              <Input label="Cartão" as="select" value={filterCard} options={[{ value: '', label: 'Todos os cartões' }, ...cards.map((card) => ({ value: card.id, label: card.nickname || card.name }))]} onChange={(event) => setFilterCard(event.target.value)} />
            </Card>
            <CardBillList
              bills={bills.filter((bill) => !filterCard || bill.card_id === filterCard)}
              installments={installments}
              purchases={purchases}
              cards={cards}
              onPay={handlePayBill}
              onOpenCard={(id) => { setSelectedCardId(id); setActiveSection('cards') }}
              mutating={mutating}
            />
          </div>
        ) : activeSection === 'openFinance' ? (
          <OpenFinancePanel
            connections={connections}
            accounts={openFinanceAccounts}
            transactions={openFinanceTransactions}
            bills={openFinanceBills}
            schemaError={openFinanceSchemaError}
            onRefresh={portfolio.refresh}
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-semibold">Evolução das compras por fatura</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Valores de parcelas no mês de fechamento de cada fatura.</p>
              <div className="mt-5 h-64 min-w-0">
                <ResponsiveContainer width="100%" height="100%" initialDimension={ANALYTICS_CHART_INITIAL_SIZE}>
                  <BarChart data={analytics.monthlyEvolution}>
                    <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={78} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="amount" name="Compras" fill="#34d399" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="font-semibold">Gastos por categoria</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Parcelas incluídas nas faturas que fecham neste mês.</p>
              {analytics.categorySpend.length ? (
                <div className="mt-4 grid min-h-56 gap-3 sm:grid-cols-[1fr_1fr] sm:items-center">
                  <div className="h-56 min-w-0">
                    <ResponsiveContainer width="100%" height="100%" initialDimension={CATEGORY_CHART_INITIAL_SIZE}>
                      <PieChart>
                        <Pie data={analytics.categorySpend} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={85} paddingAngle={3}>
                          {analytics.categorySpend.map((item, index) => <Cell key={item.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">{analytics.categorySpend.map((item, index) => <div key={item.category} className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2 truncate"><i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />{item.category}</span><strong className="shrink-0">{formatCurrency(item.amount)}</strong></div>)}</div>
                </div>
              ) : <p className="mt-8 text-sm text-[var(--text-secondary)]">Os gráficos aparecerão quando houver compras nas faturas do mês.</p>}
            </Card>
            <Card className="p-5 xl:col-span-2">
              <h2 className="font-semibold">Comparação entre cartões</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Limite utilizado e compras nas faturas do mês atual.</p>
              {analytics.cardComparison.length ? (
                <div className="mt-4 h-72 min-w-0">
                  <ResponsiveContainer width="100%" height="100%" initialDimension={COMPARISON_CHART_INITIAL_SIZE}>
                    <BarChart data={analytics.cardComparison} barGap={5}>
                      <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
                      <XAxis dataKey="card" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={78} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="used" name="Limite utilizado" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="month" name="Faturas no mês" fill="#34d399" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="mt-5 text-sm text-[var(--text-secondary)]">Cadastre cartões para comparar a utilização.</p>}
            </Card>
          </div>
        )}
      </div>

      {editingCard !== undefined ? (
        <CardFormModal
          key={editingCard?.id ?? 'new'}
          open
          card={editingCard}
          onClose={() => setEditingCard(undefined)}
          onSave={(card) => saveCard(card, editingCard?.id)}
        />
      ) : null}
      {purchaseDraft !== undefined ? (
        <CardPurchaseModal
          key={purchaseDraft.purchase?.id ?? (purchaseDraft.cardId || 'new-purchase')}
          open
          cards={purchaseDraft.purchase
            ? cards.filter((card) => card.id === purchaseDraft.purchase.card_id)
            : availableCards}
          cardId={purchaseDraft.cardId}
          purchase={purchaseDraft.purchase}
          onClose={() => setPurchaseDraft(undefined)}
          onSave={savePurchase}
        />
      ) : null}
      <PremiumCheckoutModal open={showPremium} onClose={() => setShowPremium(false)} />
    </AppShell>
  )
}
