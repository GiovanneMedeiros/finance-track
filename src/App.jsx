import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
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
  const { user, loading, signIn, signUp, signOut, error: authError } = useSupabaseAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState(null)

  const handleAuthenticate = async ({ type, values }) => {
    setLoginError(null)
    setIsSubmitting(true)

    const { email, password } = values

    if (type === 'register') {
      const signUpResult = await signUp({ email, password })
      if (signUpResult.error) {
        setLoginError(signUpResult.error.message)
      }
      setIsSubmitting(false)
      return
    }

    const signInResult = await signIn({ email, password })

    if (signInResult.error) {
      if (signInResult.error.message.toLowerCase().includes('invalid login credentials')) {
        const signUpResult = await signUp({ email, password })

        if (signUpResult.error) {
          setLoginError(signUpResult.error.message)
        }
      } else {
        setLoginError(signInResult.error.message)
      }
    }

    setIsSubmitting(false)
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
          authError={loginError || authError}
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
