import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/services/supabaseClient'

export function useSupabaseAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const { data, error: initError } = await supabase.auth.getSession()
      if (!isMounted) {
        return
      }

      if (initError) {
        setError(initError.message)
      }

      setSession(data?.session ?? null)
      setUser(data?.session?.user ?? null)
      setLoading(false)
    }

    init()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    setLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return { error: authError }
    }

    setSession(data.session)
    setUser(data.user)

    return { data }
  }, [])

  const signUp = useCallback(async ({ email, password }) => {
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return { error: signUpError }
    }

    setSession(data.session)
    setUser(data.user)

    return { data }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { error: signOutError } = await supabase.auth.signOut()

    setLoading(false)

    if (signOutError) {
      setError(signOutError.message)
      return { error: signOutError }
    }

    setSession(null)
    setUser(null)
    return {}
  }, [])

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  }
}
