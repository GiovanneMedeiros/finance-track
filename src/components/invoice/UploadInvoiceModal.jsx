import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Modal } from '@/components/ui/Modal'

export function UploadInvoiceModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      title="Importação de faturas"
      description="A leitura de PDF e imagem está temporariamente desativada."
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <FileText size={20} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />
          <p className="text-sm text-[var(--text-secondary)]">
            Para evitar lançamentos inventados, o app só importa transações CSV validadas até que um leitor real de faturas esteja disponível.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/invoices"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-900/10 px-4 text-sm font-medium hover:bg-slate-900/5 dark:border-white/10 dark:hover:bg-white/5"
          >
            Registrar fatura manualmente
          </Link>
          <Link
            to="/imports"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Importar CSV
          </Link>
        </div>
      </div>
    </Modal>
  )
}
