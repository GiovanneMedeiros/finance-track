import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { translateAuthError } from '@/utils/authErrors'
import { isSupabaseConfigured } from '@/services/supabaseClient'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TransactionsPage } from '@/pages/TransactionsPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { CardsPage } from '@/pages/CardsPage'
import { InvoicesPage } from '@/pages/InvoicesPage'
import { PlanningPage } from '@/pages/PlanningPage'
import { GoalsPage } from '@/pages/GoalsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { ImportsPage } from '@/pages/ImportsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function App() {
  const { user, loading, signIn, signUp, signOut, resetPassword, error: authError } = useSupabaseAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Returns { error } or { success } so the form can show the outcome in place.
  const handleAuthenticate = async ({ type, values }) => {
    if (!isSupabaseConfigured) {
      return { error: 'O acesso ainda não está configurado. Defina as variáveis do Supabase no ambiente de produção.' }
    }

    setIsSubmitting(true)

    try {
      if (type === 'register') {
        const result = await signUp(values)
        if (result.error) return { error: translateAuthError(result.error) }
        if (result.needsConfirmation) {
          return { success: `Conta criada! Enviamos um link de confirmação para ${values.email}.` }
        }
        return {}
      }

      if (type === 'forgot') {
        const result = await resetPassword(values)
        if (result.error) return { error: translateAuthError(result.error) }
        return { success: `Se existir uma conta com ${values.email}, você receberá um link para redefinir a senha.` }
      }

      const result = await signIn(values)
      if (result.error) return { error: translateAuthError(result.error) }
      return {}
    } catch (unexpected) {
      return { error: translateAuthError(unexpected) }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        Carregando autenticação...
      </div>
    )
  }

  if (!user) {
    return (
      <BrowserRouter>
        <AuthPage
          onAuthenticate={handleAuthenticate}
          authError={translateAuthError(authError)}
          isSubmitting={isSubmitting}
        />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage onSignOut={signOut} />} />
        <Route path="/transactions" element={<TransactionsPage onSignOut={signOut} />} />
        <Route path="/cards" element={<CardsPage onSignOut={signOut} />} />
        <Route path="/invoices" element={<InvoicesPage onSignOut={signOut} />} />
        <Route path="/planning" element={<PlanningPage onSignOut={signOut} />} />
        <Route path="/goals" element={<GoalsPage onSignOut={signOut} />} />
        <Route path="/categories" element={<CategoriesPage onSignOut={signOut} />} />
        <Route path="/reports" element={<ReportsPage onSignOut={signOut} />} />
        <Route path="/imports" element={<ImportsPage onSignOut={signOut} />} />
        <Route path="/settings" element={<SettingsPage onSignOut={signOut} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
