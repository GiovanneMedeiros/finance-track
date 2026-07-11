import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
      <div className="rounded-3xl border border-slate-900/10 bg-slate-950/[0.05] p-12 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-sm uppercase tracking-[0.24em] text-emerald-700/80">404</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950 dark:text-white">Página não encontrada</h1>
        <p className="mt-4 text-sm text-[var(--text-secondary)]">A rota que você tentou acessar não existe. Volte ao painel principal.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
          <ArrowLeft size={16} /> Voltar para o dashboard
        </Link>
      </div>
    </div>
  )
}
