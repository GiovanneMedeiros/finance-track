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

  // signIn/signUp/resetPassword do not toggle `loading`: that flag gates the whole
  // app on the initial session check, and flipping it here would unmount the auth form.
  // Their errors are returned to the caller (the form shows them) instead of stored in `error`.
  const signIn = useCallback(async ({ email, password }) => {
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return { error: authError }
    }

    setSession(data.session)
    setUser(data.user)

    return { data }
  }, [])

  const signUp = useCallback(async ({ name, email, password }) => {
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: name ? { data: { full_name: name } } : undefined,
    })

    if (signUpError) {
      return { error: signUpError }
    }

    // With email confirmation enabled Supabase returns a user but no session:
    // the account exists but the person must confirm before signing in.
    setSession(data.session)
    setUser(data.session ? data.user : null)

    return { data, needsConfirmation: !data.session }
  }, [])

  const resetPassword = useCallback(async ({ email }) => {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })

    if (resetError) {
      return { error: resetError }
    }

    return {}
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
    resetPassword,
  }
}
