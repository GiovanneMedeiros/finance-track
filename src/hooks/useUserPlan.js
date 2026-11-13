import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/services/supabaseClient'
import { isPremiumUser } from '@/utils/premium'

const DEFAULT_PROFILE = {
  plan: 'free',
  subscription_status: 'inactive',
  subscription_expires_at: null,
}

export function useUserPlan() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProfile = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError

    const currentUser = sessionData?.session?.user
    if (!currentUser) return { user: null, profile: DEFAULT_PROFILE, error: null }

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle()

    if (profileError) throw profileError

    if (data) return { user: currentUser, profile: data, error: null }

    return {
      user: currentUser,
      profile: DEFAULT_PROFILE,
      error: 'Perfil não encontrado. Saia da conta e entre novamente; se o problema persistir, verifique a migration de perfis.',
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await loadProfile()
      setUser(result.user)
      setProfile(result.profile)
      setError(result.error)
    } catch (profileError) {
      setUser(null)
      setProfile(DEFAULT_PROFILE)
      setError(profileError.message)
    } finally {
      setLoading(false)
    }
  }, [loadProfile])

  useEffect(() => {
    let active = true
    loadProfile().then(
      (result) => {
        if (active) {
          setUser(result.user)
          setProfile(result.profile)
          setError(result.error)
        }
      },
      (profileError) => {
        if (active) {
          setUser(null)
          setProfile(DEFAULT_PROFILE)
          setError(profileError.message)
        }
      },
    ).finally(() => {
      if (active) setLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile()
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [fetchProfile, loadProfile])

  const setUserProfile = useCallback(
    async (partialProfile) => {
      const { data: sessionData } = await supabase.auth.getSession()
      const currentUser = sessionData?.session?.user

      if (!currentUser) {
        const authError = new Error('Usuário não autenticado')
        setError(authError.message)
        throw authError
      }

      const safeProfile = {}
      if (typeof partialProfile.full_name === 'string') {
        safeProfile.full_name = partialProfile.full_name.trim()
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(safeProfile)
        .eq('id', currentUser.id)

      if (updateError) {
        setError(updateError.message)
        throw updateError
      }

      setProfile((currentProfile) => ({
        ...currentProfile,
        ...partialProfile,
      }))
      return { data: safeProfile }
    },
    [],
  )

  return {
    user,
    profile,
    isPremium: isPremiumUser(profile),
    loading,
    error,
    setUserProfile,
    refreshProfile: fetchProfile,
  }
}
