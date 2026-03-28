import { forwardRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, KeyRound, Mail, ShieldCheck, Sparkles, Stars } from 'lucide-react'

import { AuthField } from '@/components/auth/AuthField'
import { SocialAuthButton } from '@/components/auth/SocialAuthButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'

const MotionDiv = motion.div
const MotionForm = motion.form

export const AuthFormPanel = forwardRef(function AuthFormPanel(
  { loginValues, onLoginChange, onLoginSubmit, emailInputRef, highlight },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-[32px] border bg-[linear-gradient(180deg,rgba(255,253,249,0.9),rgba(243,236,226,0.86))] p-5 shadow-[0_32px_100px_rgba(56,44,28,0.12)] transition-all duration-700 dark:bg-[linear-gradient(180deg,rgba(17,19,24,0.96),rgba(12,13,17,0.9))] sm:rounded-[36px] sm:p-6 lg:p-8 ${
        highlight
          ? 'border-[#b98b5c]/40 shadow-[0_0_40px_rgba(185,139,92,0.15)] dark:border-[#d4b08a]/30 dark:shadow-[0_0_40px_rgba(212,176,138,0.1)]'
          : 'border-black/8 dark:border-white/8'
      }`}
    >
      <div className="absolute inset-y-0 left-0 w-px bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.1),transparent)] dark:bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.08),transparent)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.12),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)]" />

      <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-start justify-between gap-4"
        >
          <div className="min-w-0 space-y-2.5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#8c6641] dark:text-[#d4b08a] sm:text-xs sm:tracking-[0.3em]">
              Private sign-in
            </p>
            <h2 className="text-2xl leading-tight text-[#17130f] dark:text-white sm:text-3xl">
              Acesse um ambiente com leitura de produto premium
            </h2>
            <p className="max-w-md text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm sm:leading-6">
              Composição limpa, contraste adulto e interação sutil. Menos efeito, mais assinatura visual.
            </p>
          </div>

          <ThemeToggle />
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="flex items-center justify-between gap-3 rounded-2xl border border-black/8 bg-black/[0.03] p-3.5 dark:border-white/10 dark:bg-white/[0.03] sm:rounded-[24px] sm:p-4"
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 sm:text-xs sm:tracking-[0.22em]">
              Access credential
            </div>
            <div className="mt-1 text-xs font-medium text-[#17130f] dark:text-white sm:text-sm">
              Entrada pensada para onboarding institucional
            </div>
          </div>

          <MotionDiv
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center gap-2 rounded-full border border-[#b98b5c]/25 bg-[#b98b5c]/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#8c6641] dark:text-[#d4b08a]"
          >
            <ShieldCheck size={14} />
            verificado
          </MotionDiv>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4 }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <SocialAuthButton icon={Sparkles} label="Entrar com Workspace" delay={0.04} />
          <SocialAuthButton icon={Stars} label="Entrar com Private Key" delay={0.08} />
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4 }}
          className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500"
        >
          <span className="h-px flex-1 bg-slate-900/10 dark:bg-white/10" />
          ou acesse com e-mail
          <span className="h-px flex-1 bg-slate-900/10 dark:bg-white/10" />
        </MotionDiv>

        <AnimatePresence>
          <MotionForm
            initial={{ opacity: 0, x: 16, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.985 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
            className="space-y-5"
            onSubmit={onLoginSubmit}
          >
            <div className="grid gap-5">
              <AuthField
                label="E-mail"
                icon={Mail}
                type="email"
                placeholder="voce@empresa.com"
                value={loginValues.email}
                onChange={(event) => onLoginChange('email', event.target.value)}
                inputRef={emailInputRef}
              />
              <AuthField
                label="Senha"
                icon={KeyRound}
                type="password"
                placeholder="Digite sua senha"
                delay={0.05}
                value={loginValues.password}
                onChange={(event) => onLoginChange('password', event.target.value)}
              />
            </div>

            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.4 }}
              className="flex flex-col gap-3 pt-1 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <label className="inline-flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <span className="relative inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-md border border-slate-300/90 bg-white shadow-sm dark:border-white/15 dark:bg-white/[0.04]">
                  <input
                    type="checkbox"
                    className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <span className="h-2.5 w-2.5 scale-0 rounded-[3px] bg-[#b98b5c] transition peer-checked:scale-100 dark:bg-[#d4b08a]" />
                </span>
                Manter conectado neste dispositivo
              </label>

              <button
                type="button"
                className="font-medium text-slate-700 transition hover:text-[#8c6641] dark:text-slate-200 dark:hover:text-[#d4b08a]"
              >
                Esqueci minha senha
              </button>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.42 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                className="h-14 w-full rounded-2xl bg-[#17130f] text-sm font-semibold text-[#f7efe4] shadow-[0_22px_50px_rgba(23,19,15,0.18)] hover:bg-[#231d18] dark:bg-[#f1e7da] dark:text-[#17130f] dark:hover:bg-[#e3d5c3] sm:h-15 sm:rounded-[24px]"
              >
                Entrar
                <ArrowRight size={18} />
              </Button>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.42 }}
              className="rounded-2xl border border-black/8 bg-white/58 p-3.5 text-xs leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 sm:rounded-[24px] sm:p-4 sm:text-sm"
            >
              Use qualquer e-mail e senha para continuar no fluxo demo. Depois, essa estrutura pode ser ligada a autenticação real sem alterar a linguagem visual.
            </MotionDiv>
          </MotionForm>
        </AnimatePresence>
      </div>
    </div>
  )
})