import { useRef, useState } from 'react'
import { Download, FileUp, Upload } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useImportBatches } from '@/hooks/useImportBatches'
import { useTransactions } from '@/hooks/useTransactions'
import { useUserPlan } from '@/hooks/useUserPlan'
import { parseTransactionCsv } from '@/services/csvTransactionParser'
import { formatLongDate } from '@/utils/formatters'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_ROWS = 500
const TEMPLATE = 'descricao;valor;tipo;categoria;data\nMercado;125,50;despesa;Alimentacao;13/11/2026\nSalario;3500,00;receita;Outros;05/11/2026'

export function ImportsPage({ onSignOut }) {
  const { profile, isPremium } = useUserPlan()
  const { transactions, addTransactions } = useTransactions()
  const { batches, loading, error: historyError, saveBatch, refresh } = useImportBatches()
  const inputRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState(null)
  const [errors, setErrors] = useState([])
  const [status, setStatus] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const handleFile = async (file) => {
    setParsed(null)
    setErrors([])
    setStatus('')
    setFileName(file?.name ?? '')
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrors(['Selecione um arquivo .csv. Importação de faturas PDF está desativada até termos leitura real.'])
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors(['O arquivo excede o limite de 5 MB.'])
      return
    }
    try {
      const result = parseTransactionCsv(await file.text())
      if (result.totalRows > MAX_ROWS) {
        setErrors([`O arquivo contém ${result.totalRows} linhas. O limite é ${MAX_ROWS} por importação.`])
        return
      }
      setParsed(result)
      setErrors(result.errors.slice(0, 10))
      if (result.errors.length > 10) setStatus(`Mais ${result.errors.length - 10} linha(s) inválida(s) não exibida(s).`)
      if (result.items.length === 0) setStatus('Nenhuma linha válida para importar.')
    } catch (parseError) {
      setErrors([parseError.message || 'Não foi possível ler o CSV.'])
    }
  }

  const handleImport = async () => {
    if (!parsed?.items.length) return
    setIsImporting(true)
    setStatus('')
    try {
      await addTransactions(parsed.items)
      setParsed(null)
      setFileName('')
      if (inputRef.current) inputRef.current.value = ''
      try {
        await saveBatch(fileName, parsed.items.length)
      } catch (historySaveError) {
        setStatus(`Transações importadas; não foi possível salvar o histórico: ${historySaveError.message}`)
        return
      }
      await refresh()
      setStatus(`${parsed.items.length} transação(ões) importada(s) com sucesso.`)
      setParsed(null)
      setFileName('')
      if (inputRef.current) inputRef.current.value = ''
    } catch (importError) {
      setErrors([importError.message || 'Falha ao importar transações.'])
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <AppShell
      sidebar={<Sidebar balanceLabel="R$ 0,00" formattedIncome="R$ 0,00" formattedExpense="R$ 0,00" plan={profile?.plan} isPremium={isPremium} monthlyGoal={null} />}
      header={<Header currentDateLabel={formatLongDate(new Date())} transactionCount={transactions.length} onSignOut={onSignOut} />}
    >
      <div className="space-y-6">
        <SectionHeader title="Importar transações" description="Importe um CSV com pré-visualização e validação antes de gravar seus dados." />
        <Card className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Arquivo CSV</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Até 500 linhas e 5 MB. Colunas necessárias: descrição e valor.</p>
            </div>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE)}`}
              download="modelo-financetrack.csv"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-900/10 px-3 text-sm font-medium hover:bg-slate-900/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              <Download size={15} /> Baixar modelo
            </a>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-500/10 file:px-4 file:py-2 file:font-semibold file:text-emerald-700 dark:file:text-emerald-200"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          {fileName ? <p className="text-sm text-[var(--text-secondary)]">Selecionado: {fileName}</p> : null}
          {errors.length ? (
            <div role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-700 dark:text-rose-200">
              <p className="font-semibold">Revise o arquivo</p>
              <ul className="mt-2 list-inside list-disc space-y-1">{errors.map((error) => <li key={error}>{error}</li>)}</ul>
            </div>
          ) : null}
          {status ? <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{status}</p> : null}
          {parsed ? (
            <div className="space-y-3 rounded-2xl border border-slate-900/10 p-4 dark:border-white/10">
              <p className="text-sm font-semibold">Prévia: {parsed.items.length} válida(s) de {parsed.totalRows} linha(s)</p>
              {parsed.items.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="text-xs text-[var(--text-secondary)]"><tr><th className="py-2">Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th className="text-right">Valor</th></tr></thead>
                    <tbody>{parsed.items.slice(0, 8).map((item, index) => <tr key={`${item.date}-${item.title}-${index}`} className="border-t border-slate-900/5 dark:border-white/5"><td className="py-2">{new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR')}</td><td>{item.title}</td><td>{item.category}</td><td>{item.type === 'income' ? 'Receita' : 'Despesa'}</td><td className="text-right">{item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>)}</tbody>
                  </table>
                </div>
              ) : null}
              <Button onClick={() => void handleImport()} disabled={isImporting || parsed.items.length === 0}>
                <Upload size={15} /> {isImporting ? 'Importando...' : `Importar ${parsed.items.length} linha(s) válida(s)`}
              </Button>
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Importação de faturas</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">A leitura automática de PDF/imagem está temporariamente desativada. Este app não deve inventar transações a partir de arquivos não processados.</p>
        </Card>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Histórico recente</h2>
          {historyError ? <p role="alert" className="text-sm text-rose-600">{historyError}</p> : null}
          {loading ? <Card className="p-4">Carregando histórico...</Card> : batches.length ? (
            <div className="space-y-2">{batches.map((batch) => <Card key={batch.id} className="flex flex-wrap items-center justify-between gap-2 p-4"><span className="inline-flex items-center gap-2 text-sm"><FileUp size={15} className="text-emerald-500" />{batch.file_name}</span><span className="text-xs text-[var(--text-secondary)]">{batch.imported_count} linhas · {new Date(batch.created_at).toLocaleString('pt-BR')}</span></Card>)}</div>
          ) : <EmptyState title="Nenhuma importação ainda" description="Os arquivos CSV importados aparecerão aqui." />}
        </section>
      </div>
    </AppShell>
  )
}
