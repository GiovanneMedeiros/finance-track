import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { translateAuthError } from '@/utils/authErrors'
import { isSupabaseConfigured } from '@/services/supabaseClient'

const AuthPage = lazy(() => import('@/pages/AuthPage').then((module) => ({ default: module.AuthPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage').then((module) => ({ default: module.TransactionsPage })))
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })))
const CardsPage = lazy(() => import('@/pages/CardsPage').then((module) => ({ default: module.CardsPage })))
const InvoicesPage = lazy(() => import('@/pages/InvoicesPage').then((module) => ({ default: module.InvoicesPage })))
const PlanningPage = lazy(() => import('@/pages/PlanningPage').then((module) => ({ default: module.PlanningPage })))
const GoalsPage = lazy(() => import('@/pages/GoalsPage').then((module) => ({ default: module.GoalsPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((module) => ({ default: module.ReportsPage })))
const ImportsPage = lazy(() => import('@/pages/ImportsPage').then((module) => ({ default: module.ImportsPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      Carregando página...
    </div>
  )
}

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
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageLoading />}>
          <AuthPage
            onAuthenticate={handleAuthenticate}
            authError={translateAuthError(authError)}
            isSubmitting={isSubmitting}
          />
        </Suspense>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<PageLoading />}>
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
      </Suspense>
    </BrowserRouter>
  )
}

export default App
