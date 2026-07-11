import { useCallback, useRef } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  X,
} from 'lucide-react'

import { InvoiceReviewTable } from '@/components/invoice/InvoiceReviewTable'
import { Button } from '@/components/ui/Button'
import { useInvoiceImport } from '@/hooks/useInvoiceImport'
import { Modal } from '@/components/ui/Modal'

const ACCEPT = '.pdf,.png,.jpg,.jpeg'

function UploadDropzone({ onFileSelect, error }) {
  const inputRef = useRef(null)

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault()
      const droppedFile = event.dataTransfer.files[0]
      if (droppedFile) {
        onFileSelect(droppedFile)
      }
    },
    [onFileSelect],
  )

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
  }, [])

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
        className="group flex cursor-pointer flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-slate-900/12 bg-slate-900/[0.02] px-6 py-12 transition-all duration-300 hover:border-emerald-400/30 hover:bg-emerald-400/[0.03] dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-emerald-400/25 dark:hover:bg-emerald-400/[0.03]"
      >
        <div className="rounded-2xl bg-slate-900/[0.06] p-4 text-slate-400 transition-colors group-hover:bg-emerald-400/10 group-hover:text-emerald-500 dark:bg-white/[0.06] dark:text-slate-500 dark:group-hover:bg-emerald-400/10 dark:group-hover:text-emerald-400">
          <Upload size={28} />
        </div>

        <div className="text-center">
          <p className="text-base font-medium text-slate-900 dark:text-white">
            Arraste a fatura aqui ou clique para selecionar
          </p>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Formatos aceitos: PDF, PNG, JPG — Máximo 10MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files[0]
            if (selected) {
              onFileSelect(selected)
            }
            e.target.value = ''
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-3 text-sm text-rose-600 dark:border-rose-400/15 dark:text-rose-300">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}

function ProcessingState({ fileName }) {
  return (
    <div className="flex flex-col items-center gap-5 py-12">
      <div className="relative">
        <div className="rounded-2xl bg-emerald-400/10 p-4 text-emerald-500 dark:text-emerald-400">
          <FileText size={32} />
        </div>
        <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 dark:bg-slate-900">
          <Loader2 size={16} className="animate-spin text-emerald-500" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-base font-medium text-slate-900 dark:text-white">
          Processando fatura...
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{fileName}</p>
        <p className="mt-3 text-xs text-[var(--text-secondary)]">
          Extraindo lançamentos do documento
        </p>
      </div>
    </div>
  )
}

function DoneState({ count, onClose }) {
  return (
    <div className="flex flex-col items-center gap-5 py-12">
      <div className="rounded-2xl bg-emerald-400/10 p-4 text-emerald-500 dark:text-emerald-400">
        <CheckCircle2 size={32} />
      </div>

      <div className="text-center">
        <p className="text-base font-medium text-slate-900 dark:text-white">
          Importação concluída
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {count} lançamento{count !== 1 ? 's' : ''} adicionado{count !== 1 ? 's' : ''} ao dashboard.
        </p>
      </div>

      <Button onClick={onClose}>Fechar</Button>
    </div>
  )
}

export function UploadInvoiceModal({ open, onClose, onImport }) {
  const invoice = useInvoiceImport({ onImport })

  const handleClose = () => {
    invoice.reset()
    onClose()
  }

  const getTitle = () => {
    if (invoice.step === 'review') return 'Revisar lançamentos'
    if (invoice.step === 'done') return 'Concluído'
    return 'Importar fatura'
  }

  const getDescription = () => {
    if (invoice.step === 'review')
      return 'Confira os lançamentos detectados. Você pode editar, desmarcar ou remover itens antes de importar.'
    if (invoice.step === 'done') return null
    return 'Envie a fatura do cartão de crédito para extrair automaticamente os lançamentos.'
  }

  return (
    <Modal open={open} title={getTitle()} description={getDescription()} size="lg" onClose={handleClose}>
      {invoice.step === 'idle' && (
        <UploadDropzone onFileSelect={invoice.uploadFile} error={invoice.error} />
      )}

      {invoice.step === 'uploading' && (
        <ProcessingState fileName={invoice.file?.name} />
      )}

      {invoice.step === 'review' && (
        <div className="space-y-5">
          <InvoiceReviewTable
            items={invoice.parsedItems}
            onToggle={invoice.toggleItem}
            onUpdate={invoice.updateItem}
            onRemove={invoice.removeItem}
          />

          {invoice.error && (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-3 text-sm text-rose-600 dark:border-rose-400/15 dark:text-rose-300">
              {invoice.error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={invoice.confirmImport}
              disabled={invoice.selectedCount === 0}
            >
              Importar {invoice.selectedCount} lançamento{invoice.selectedCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {invoice.step === 'importing' && (
        <div className="flex flex-col items-center gap-4 py-12">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
          <p className="text-sm text-[var(--text-secondary)]">Salvando lançamentos...</p>
        </div>
      )}

      {invoice.step === 'done' && (
        <DoneState count={invoice.selectedCount} onClose={handleClose} />
      )}
    </Modal>
  )
}
