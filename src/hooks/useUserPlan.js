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

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      setError(sessionError.message)
      setProfile(DEFAULT_PROFILE)
      setLoading(false)
      return
    }

    const currentUser = sessionData?.session?.user
    setUser(currentUser)
    if (!currentUser) {
      setProfile(DEFAULT_PROFILE)
      setLoading(false)
      return
    }

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle()

    if (profileError) {
      setError(profileError.message)
      setProfile(DEFAULT_PROFILE)
      setLoading(false)
      return
    }

    if (!data) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        plan: 'free',
        subscription_status: 'inactive',
        subscription_expires_at: null,
      })

      if (insertError) {
        setError(insertError.message)
        setProfile(DEFAULT_PROFILE)
        setLoading(false)
        return
      }

      setProfile({
        id: user.id,
        email: user.email,
        ...DEFAULT_PROFILE,
      })
      setLoading(false)
      return
    }

    setProfile(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProfile()
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile()
    })

    return () => authListener.subscription.unsubscribe()
  }, [fetchProfile])

  const setUserProfile = useCallback(
    async (partialProfile) => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user

      if (!user) {
        setError('Usuário não autenticado')
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(partialProfile)
        .eq('id', user.id)

      if (updateError) {
        setError(updateError.message)
        return
      }

      setProfile((currentProfile) => ({
        ...currentProfile,
        ...partialProfile,
      }))
    },
    [],
  )

  const upgradeToPremium = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const currentUser = sessionData?.session?.user

    if (!currentUser) {
      setError('Usuário não autenticado')
      return
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const update = {
      plan: 'premium',
      subscription_status: 'active',
      subscription_expires_at: expiresAt,
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', currentUser.id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setProfile((currentProfile) => ({
      ...currentProfile,
      ...update,
    }))
  }, [])

  return {
    user,
    profile,
    isPremium: isPremiumUser(profile),
    loading,
    error,
    upgradeToPremium,
    setUserProfile,
    refreshProfile: fetchProfile,
  }
}
