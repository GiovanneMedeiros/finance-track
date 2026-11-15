import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { PluggyConnect } from 'react-pluggy-connect'
import { AlertCircle, Building2, CheckCircle2, Clock3, Link2Off, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { openFinanceService } from '@/services/openFinanceService'
import { formatCurrency } from '@/utils/formatters'

const STATUS_LABELS = {
  connected: 'Conectado',
  syncing: 'Sincronizando',
  pending_authorization: 'Aguardando autorização',
  expired: 'Autorização expirada',
  error: 'Precisa de atenção',
  disconnected: 'Desconectado',
}

function providerCurrency(value, currency) {
  if (value === null || value === undefined) return 'Não informado'
  if (!currency) return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
    }).format(Number(value))
  } catch {
    return formatCurrency(Number(value))
  }
}

function displayDate(value) {
  if (!value) return 'Não informado'
  const parsed = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? 'Não informado' : parsed.toLocaleDateString('pt-BR')
}

export function OpenFinancePanel({
  connections,
  accounts,
  transactions,
  bills,
  schemaError,
  onRefresh,
}) {
  const [connectToken, setConnectToken] = useState('')
  const [includeSandbox, setIncludeSandbox] = useState(false)
  const [working, setWorking] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const accountById = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts])
  const connectionById = useMemo(
    () => new Map(connections.map((connection) => [connection.id, connection])),
    [connections],
  )

  const startConnection = async () => {
    setWorking('connect')
    setError('')
    setNotice('')
    try {
      const result = await openFinanceService.connect()
      setConnectToken(result.connectToken)
      setIncludeSandbox(result.includeSandbox === true)
    } catch (failure) {
      setError(failure.message || 'Não foi possível iniciar a conexão.')
    } finally {
      setWorking('')
    }
  }

  const handleSuccess = async ({ item }) => {
    setWorking('connect')
    setError('')
    try {
      const result = await openFinanceService.syncItem(item.id)
      await onRefresh()
      setNotice(result.status === 'connected'
        ? 'Instituição conectada e dados disponíveis atualizados.'
        : 'Conexão recebida. A instituição ainda está processando a autorização.')
    } catch (failure) {
      setError(failure.message || 'A conexão foi criada, mas a sincronização inicial falhou. Use Atualizar dados para tentar novamente.')
      await onRefresh().catch(() => {})
    } finally {
      setConnectToken('')
      setWorking('')
    }
  }

  const runSync = async (connectionId) => {
    setWorking(connectionId)
    setError('')
    setNotice('')
    try {
      const result = await openFinanceService.syncConnection(connectionId)
      await onRefresh()
      setNotice(result.status === 'connected'
        ? `${result.importedAccounts} cartão(ões) e ${result.importedTransactions} transação(ões) sincronizados.`
        : STATUS_LABELS[result.status] || 'A conexão ainda não está pronta para sincronizar.')
    } catch (failure) {
      setError(failure.message || 'Não foi possível sincronizar esta conexão.')
      await onRefresh().catch(() => {})
    } finally {
      setWorking('')
    }
  }

  const removeConnection = async (connection) => {
    const institution = connection.institution_name || 'esta instituição'
    if (!window.confirm(`Desconectar ${institution} e apagar do FinanceTrack os dados importados dessa conexão?`)) return
    setWorking(connection.id)
    setError('')
    setNotice('')
    try {
      await openFinanceService.disconnect(connection.id)
      await onRefresh()
      setNotice(`${institution} foi desconectada e seus dados importados foram removidos.`)
    } catch (failure) {
      setError(failure.message || 'Não foi possível revogar esta conexão.')
    } finally {
      setWorking('')
    }
  }

  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
            <ShieldCheck size={19} />
          </span>
          <div>
            <h2 className="font-semibold">Conecte seu banco com segurança</h2>
            <p className="mt-1 max-w-3xl text-sm text-[var(--text-secondary)]">
              A autorização acontece no Pluggy e na instituição. O FinanceTrack não recebe nem armazena sua senha bancária ou o número completo do cartão.
            </p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              Os dados importados ficam separados das compras cadastradas manualmente para evitar duplicidades.
            </p>
          </div>
        </div>
        <Button onClick={() => void startConnection()} disabled={Boolean(working) || Boolean(connectToken) || Boolean(schemaError)}>
          {working === 'connect' ? <LoaderCircle size={16} className="animate-spin" /> : <Building2 size={16} />}
          Conectar meu banco
        </Button>
      </Card>

      {schemaError ? (
        <Card role="alert" className="flex items-start gap-3 border-amber-400/20 p-4 text-sm text-amber-800 dark:text-amber-200">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{schemaError}</span>
        </Card>
      ) : null}

      {error ? (
        <Card role="alert" className="flex items-start gap-3 border-rose-400/20 p-4 text-sm text-rose-700 dark:text-rose-200">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </Card>
      ) : null}
      {notice ? (
        <Card role="status" className="flex items-start gap-3 border-emerald-400/20 p-4 text-sm text-emerald-700 dark:text-emerald-200">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <span>{notice}</span>
        </Card>
      ) : null}
      {connectToken ? createPortal(
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox={includeSandbox}
          language="pt"
          onSuccess={handleSuccess}
          onError={(failure) => {
            setError(failure.message || 'O Pluggy Connect não conseguiu concluir a operação.')
            setConnectToken('')
          }}
          onLoadError={(failure) => {
            setError(failure.message || 'Não foi possível carregar o Pluggy Connect.')
            setConnectToken('')
          }}
          onClose={() => setConnectToken('')}
        />,
        document.body,
      ) : null}

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Instituições conectadas</h2>
          <p className="text-sm text-[var(--text-secondary)]">Sincronize quando quiser ou revogue a autorização e remova os dados importados.</p>
        </div>
        {connections.length ? connections.map((connection) => (
          <Card key={connection.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-900/[0.05] text-[var(--text-secondary)] dark:bg-white/[0.07]">
                <Building2 size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{connection.institution_name || 'Instituição financeira'}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  {connection.status === 'syncing' ? <LoaderCircle size={13} className="animate-spin" /> : <Clock3 size={13} />}
                  {STATUS_LABELS[connection.status] || connection.status}
                  {connection.last_synced_at
                    ? ` · Atualizado em ${new Date(connection.last_synced_at).toLocaleString('pt-BR')}`
                    : ''}
                </p>
                {connection.last_error ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{connection.last_error}</p> : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                size="md"
                variant="secondary"
                onClick={() => void runSync(connection.id)}
                disabled={Boolean(working) || connection.status === 'syncing'}
              >
                {working === connection.id ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                Atualizar dados
              </Button>
              <Button
                size="md"
                variant="ghost"
                aria-label={`Desconectar ${connection.institution_name || 'instituição'}`}
                onClick={() => void removeConnection(connection)}
                disabled={Boolean(working)}
              >
                <Link2Off size={15} />
                Desconectar
              </Button>
            </div>
          </Card>
        )) : (
          <Card className="p-6 text-sm text-[var(--text-secondary)]">
            Nenhuma instituição conectada. Seus cartões manuais continuam disponíveis normalmente.
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Cartões importados</h2>
          <p className="text-sm text-[var(--text-secondary)]">Limites e datas são exibidos somente quando fornecidos pela instituição.</p>
        </div>
        {accounts.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {accounts.map((account) => {
              const connection = connectionById.get(account.connection_id)
              const bill = bills.find((entry) => entry.account_id === account.id)
              return (
                <Card key={account.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{account.marketing_name || account.name}</p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {connection?.institution_name || 'Instituição conectada'}
                        {account.brand ? ` · ${account.brand}` : ''}
                        {account.last_four_digits ? ` · final ${account.last_four_digits}` : ''}
                      </p>
                    </div>
                    <CreditCardIcon />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-[var(--text-secondary)]">Limite total</p><p className="mt-1 font-semibold">{providerCurrency(account.credit_limit, account.currency)}</p></div>
                    <div><p className="text-xs text-[var(--text-secondary)]">Disponível</p><p className="mt-1 font-semibold">{providerCurrency(account.available_limit, account.currency)}</p></div>
                    <div><p className="text-xs text-[var(--text-secondary)]">Saldo informado</p><p className="mt-1 font-semibold">{providerCurrency(account.balance, account.currency)}</p></div>
                    <div><p className="text-xs text-[var(--text-secondary)]">Próximo vencimento</p><p className="mt-1 font-semibold">{displayDate(account.balance_due_date || bill?.due_date)}</p></div>
                  </div>
                  {bill ? <p className="border-t border-slate-900/5 pt-2 text-xs text-[var(--text-secondary)] dark:border-white/5">Saldo atual informado pelo banco, não uma fatura histórica detalhada. Consultado em {new Date(bill.reported_at).toLocaleString('pt-BR')}.</p> : null}
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-6 text-sm text-[var(--text-secondary)]">Os cartões aparecerão aqui após a instituição disponibilizá-los.</Card>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Transações importadas</h2>
          <p className="text-sm text-[var(--text-secondary)]">Transações bancárias não alteram as compras manuais nem os cálculos de fatura do FinanceTrack.</p>
        </div>
        {transactions.length ? (
          <Card className="divide-y divide-slate-900/5 p-0 dark:divide-white/5">
            {transactions.slice(0, 12).map((transaction) => {
              const account = accountById.get(transaction.account_id)
              const connection = connectionById.get(account?.connection_id)
              return (
                <div key={transaction.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{transaction.description}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {account?.marketing_name || account?.name || 'Cartão'}
                      {connection?.institution_name ? ` · ${connection.institution_name}` : ''}
                      {transaction.category ? ` · ${transaction.category}` : ''}
                      {' · '}{displayDate(transaction.transaction_date)}
                      {' · '}{transaction.status}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums">{providerCurrency(transaction.amount, transaction.currency)}</p>
                </div>
              )
            })}
          </Card>
        ) : (
          <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhuma transação foi disponibilizada ainda.</Card>
        )}
      </section>
    </div>
  )
}

function CreditCardIcon() {
  return <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-200"><Building2 size={17} /></span>
}
