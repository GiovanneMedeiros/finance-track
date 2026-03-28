import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import { AuthFormPanel } from '@/components/auth/AuthFormPanel'
import { AuthHeroPanel } from '@/components/auth/AuthHeroPanel'

const initialLoginValues = {
  email: '',
  password: '',
}

const MotionContainer = motion.div

export function AuthPage({ onAuthenticate }) {
  const [loginValues, setLoginValues] = useState(initialLoginValues)
  const [formHighlight, setFormHighlight] = useState(false)
  const formPanelRef = useRef(null)
  const emailInputRef = useRef(null)

  const handleAccessClick = useCallback(() => {
    formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFormHighlight(true)
    setTimeout(() => {
      emailInputRef.current?.focus()
      setFormHighlight(false)
    }, 800)
  }, [])

  const updateLoginField = (field, value) => {
    setLoginValues((current) => ({ ...current, [field]: value }))
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    onAuthenticate({ type: 'login', values: loginValues })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f6f1e8_0%,#efe7da_42%,#e7dece_100%)] px-4 py-5 transition-colors duration-500 dark:bg-[linear-gradient(180deg,#101114_0%,#15171d_42%,#0a0b0f_100%)] sm:px-6 sm:py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 auth-grid opacity-30 dark:opacity-20" />
      <div className="pointer-events-none absolute inset-y-0 left-[9%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.12),transparent)] dark:bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.08),transparent)] lg:block" />
      <div className="pointer-events-none absolute inset-y-0 right-[11%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.08),transparent)] dark:bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.06),transparent)] lg:block" />
      <div className="pointer-events-none absolute left-0 top-[14%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(186,140,92,0.16),transparent_72%)] dark:bg-[radial-gradient(circle,rgba(185,139,92,0.1),transparent_72%)]" />
      <div className="pointer-events-none absolute bottom-[8%] right-[6%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.16),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_72%)]" />
      <div className="pointer-events-none absolute inset-x-[20%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.16),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)]" />

      <MotionContainer
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-7xl items-start gap-6 sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch xl:gap-8"
      >
        <AuthHeroPanel onAccessClick={handleAccessClick} />

        <div className="flex items-center justify-center">
          <div className="w-full max-w-[580px] lg:max-w-none">
            <AuthFormPanel
              ref={formPanelRef}
              emailInputRef={emailInputRef}
              highlight={formHighlight}
              loginValues={loginValues}
              onLoginChange={updateLoginField}
              onLoginSubmit={handleLoginSubmit}
            />
          </div>
        </div>
      </MotionContainer>
    </div>
  )
}