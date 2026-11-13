import { useState } from 'react'
import { KeyRound, UserRound } from 'lucide-react'

import { AppShell } from '@/app/AppShell'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PremiumBadge } from '@/components/ui/PremiumBadge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useUserPlan } from '@/hooks/useUserPlan'
import { supabase } from '@/services/supabaseClient'
import { formatLongDate } from '@/utils/formatters'

export function SettingsPage({ onSignOut }) {
  const { user, profile, isPremium, setUserProfile } = useUserPlan()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const displayName = profile?.full_name || user?.user_metadata?.full_name || ''

  const saveName = async (event) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Informe seu nome.')
      return
    }
    setSavingProfile(true)
    setMessage('')
    setError('')
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: name.trim() },
      })
      if (authError) throw authError
      await setUserProfile({ full_name: name.trim() })
      setMessage('Nome atualizado.')
      setName('')
    } catch (saveError) {
      setError(saveError.message || 'Não foi possível atualizar o perfil.')
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirmation) {
      setError('As senhas não conferem.')
      return
    }
    setSavingPassword(true)
    setMessage('')
    setError('')
    try {
      const { error: passwordError } = await supabase.auth.updateUser({ password })
      if (passwordError) throw passwordError
      setPassword('')
      setConfirmation('')
      setMessage('Senha alterada com sucesso.')
    } catch (passwordError) {
      setError(passwordError.message || 'Não foi possível atualizar a senha.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <AppShell
      sidebar={<Sidebar balanceLabel="R$ 0,00" formattedIncome="R$ 0,00" formattedExpense="R$ 0,00" plan={profile?.plan} isPremium={isPremium} monthlyGoal={null} />}
      header={<Header currentDateLabel={formatLongDate(new Date())} transactionCount={0} onSignOut={onSignOut} />}
    >
      <div className="space-y-6">
        <SectionHeader
          title="Configurações"
          description="Atualize seus dados de conta e credenciais de acesso."
          right={<PremiumBadge />}
        />
        {error ? <Card role="alert" className="p-4 text-sm text-rose-600">{error}</Card> : null}
        {message ? <Card role="status" className="p-4 text-sm text-emerald-700 dark:text-emerald-300">{message}</Card> : null}

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-300"><UserRound size={18} /></span><div><h2 className="font-semibold">Perfil</h2><p className="text-sm text-[var(--text-secondary)]">Dados associados à sua conta.</p></div></div>
            <div className="mb-4 space-y-1 text-sm"><p><span className="text-[var(--text-secondary)]">E-mail:</span> {user?.email || 'Carregando...'}</p><p><span className="text-[var(--text-secondary)]">Plano:</span> {profile?.plan === 'premium' ? 'Premium' : 'Free'}</p></div>
            <form className="space-y-4" onSubmit={saveName}>
              <Input label="Nome" value={name} placeholder={displayName || 'Seu nome'} onChange={(event) => setName(event.target.value)} required />
              <Button type="submit" disabled={savingProfile}>{savingProfile ? 'Salvando...' : 'Salvar nome'}</Button>
            </form>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-sky-500/10 p-2.5 text-sky-600 dark:text-sky-300"><KeyRound size={18} /></span><div><h2 className="font-semibold">Segurança</h2><p className="text-sm text-[var(--text-secondary)]">Altere a senha da sessão atual.</p></div></div>
            <form className="space-y-4" onSubmit={savePassword}>
              <Input label="Nova senha" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
              <Input label="Confirmar nova senha" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={8} required />
              <Button type="submit" disabled={savingPassword}>{savingPassword ? 'Atualizando...' : 'Alterar senha'}</Button>
            </form>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
