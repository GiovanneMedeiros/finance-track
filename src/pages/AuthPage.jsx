import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useScroll, useTransform } from 'framer-motion'
import { Menu, Wallet, X } from 'lucide-react'

import { AuthFormPanel } from '@/components/auth/AuthFormPanel'
import { AuthHeroPanel } from '@/components/auth/AuthHeroPanel'
import {
  BankMarquee,
  DashboardPreview,
  FeaturesSection,
  PricingSection,
  SecuritySection,
} from '@/components/auth/AuthLandingSections'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const MotionDiv = motion.div
const MotionHeader = motion.header

const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Bancos', href: '#bancos' },
  { label: 'Planos', href: '#planos' },
  { label: 'Segurança', href: '#seguranca' },
]

export function AuthPage({ onAuthenticate, authError, isSubmitting }) {
  const [formHighlight, setFormHighlight] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [menuOpen, setMenuOpen] = useState(false)
  const formPanelRef = useRef(null)
  const emailInputRef = useRef(null)

  const { scrollY } = useScroll()
  const headerBg = useTransform(scrollY, [0, 80], [0, 1])
  const blobY = useTransform(scrollY, [0, 800], [0, 160])

  const [loginOpen, setLoginOpen] = useState(false)

  const openAuth = useCallback((mode = 'login') => {
    setAuthMode(mode)
    setMenuOpen(false)
    setLoginOpen(true)
    setFormHighlight(true)
    setTimeout(() => {
      emailInputRef.current?.focus()
      setFormHighlight(false)
    }, 450)
  }, [])

  const handleAccessClick = useCallback(() => openAuth('login'), [openAuth])
  const handleRegisterClick = useCallback(() => openAuth('register'), [openAuth])

  useEffect(() => {
    if (!loginOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setLoginOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [loginOpen])

  // Close the mobile menu when the viewport grows past the breakpoint.
  useEffect(() => {
    if (!menuOpen) return undefined
    const media = window.matchMedia('(min-width: 768px)')
    const onChange = (event) => event.matches && setMenuOpen(false)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [menuOpen])

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-clip bg-[#f6f8fb] text-slate-900 dark:bg-[#05080f] dark:text-white">
        {/* Animated aurora background */}
        <MotionDiv style={{ y: blobY }} className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="aurora aurora-1" />
          <div className="aurora aurora-2" />
          <div className="aurora aurora-3" />
        </MotionDiv>
        <div className="auth-grid pointer-events-none absolute inset-0 opacity-50 dark:opacity-30" />

        {/* Navbar */}
        <MotionHeader
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-50"
        >
          <MotionDiv
            style={{ opacity: headerBg }}
            className="absolute inset-0 border-b border-slate-900/5 bg-white/70 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/70"
          />
          <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <a href="#" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#10b981,#0d9488)] text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.7)]">
                <Wallet size={18} />
              </span>
              <span className="font-display text-lg font-bold">FinanceTrack</span>
            </a>
            <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="relative transition hover:text-slate-900 dark:hover:text-white">
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={handleAccessClick}
                className="inline-flex h-11 items-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 sm:px-5"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-700 transition hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10 md:hidden"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>

          <AnimatePresence>
            {menuOpen ? (
              <MotionDiv
                id="mobile-menu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="relative overflow-hidden border-b border-slate-900/5 bg-white/95 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/95 md:hidden"
              >
                <div className="flex flex-col px-4 pb-5 pt-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl px-3 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/5"
                    >
                      {link.label}
                    </a>
                  ))}
                  <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="mt-3 inline-flex h-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10b981,#0d9488)] text-sm font-semibold text-white"
                  >
                    Criar conta grátis
                  </button>
                </div>
              </MotionDiv>
            ) : null}
          </AnimatePresence>
        </MotionHeader>

        <main className="relative z-10 mx-auto max-w-7xl space-y-24 px-4 pb-20 pt-6 sm:px-6 sm:pt-10 lg:px-8">
          {/* Hero */}
          <section className="min-h-[calc(100vh-7rem)] lg:flex lg:items-center">
            <div className="w-full">
              <AuthHeroPanel
                onStartClick={handleRegisterClick}
                onLearnMoreClick={() => document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>
          </section>

          {/* Banks */}
          <section id="bancos" className="scroll-mt-24 space-y-5">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Funciona com as faturas dos principais bancos
            </p>
            <BankMarquee />
          </section>

          <div id="recursos" className="scroll-mt-24">
            <FeaturesSection />
          </div>

          <DashboardPreview />

          <div id="planos" className="scroll-mt-24">
            <PricingSection onSelectPlan={handleRegisterClick} />
          </div>

          <div id="seguranca" className="scroll-mt-24">
            <SecuritySection />
          </div>

          {/* CTA */}
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#059669,#0d9488_45%,#1e40af)] p-8 text-center text-white sm:p-14"
          >
            <div className="auth-grid pointer-events-none absolute inset-0 opacity-30" />
            <div className="relative mx-auto max-w-2xl space-y-5">
              <h2 className="text-3xl font-bold sm:text-4xl">Comece a organizar seu dinheiro hoje</h2>
              <p className="text-white/80">Grátis para sempre no plano básico. Sem cartão de crédito.</p>
              <motion.button
                type="button"
                onClick={handleRegisterClick}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex h-13 items-center rounded-2xl bg-white px-7 text-sm font-semibold text-emerald-700 shadow-xl"
              >
                Criar minha conta
              </motion.button>
            </div>
          </MotionDiv>
        </main>


        {/* Login drawer */}
        <AnimatePresence>
          {loginOpen ? (
            <>
              <MotionDiv
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLoginOpen(false)}
                className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm"
              />
              <MotionDiv
                key="drawer"
                role="dialog"
                aria-modal="true"
                aria-label={authMode === 'register' ? 'Criar conta no FinanceTrack' : 'Entrar no FinanceTrack'}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[480px] items-center overflow-y-auto p-4 sm:p-6"
              >
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setLoginOpen(false)}
                    aria-label="Fechar"
                    className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-900/5 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                  <AuthFormPanel
                    ref={formPanelRef}
                    emailInputRef={emailInputRef}
                    highlight={formHighlight}
                    mode={authMode}
                    onModeChange={setAuthMode}
                    onSubmit={onAuthenticate}
                    authError={authError}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </MotionDiv>
            </>
          ) : null}
        </AnimatePresence>

        <footer className="relative z-10 border-t border-slate-900/5 py-8 text-center text-xs text-slate-500 dark:border-white/5 dark:text-slate-500">
          © {new Date().getFullYear()} FinanceTrack. Nubank, PicPay, C6 Bank e Inter são marcas de seus respectivos donos.
        </footer>
      </div>
    </MotionConfig>
  )
}
