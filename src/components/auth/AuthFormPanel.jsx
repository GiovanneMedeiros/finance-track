import { forwardRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Lock, Mail, MailCheck, ShieldCheck, User, UserPlus } from 'lucide-react'

import { AuthField } from '@/components/auth/AuthField'

const MotionDiv = motion.div
const MotionButton = motion.button

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 6

const copy = {
  login: {
    icon: Lock,
    title: 'Bem-vindo de volta',
    subtitle: 'Entre para ver seus cartões, faturas e metas.',
    submit: 'Entrar',
    submitting: 'Entrando...',
  },
  register: {
    icon: UserPlus,
    title: 'Crie sua conta grátis',
    subtitle: 'Leva menos de um minuto. Sem cartão de crédito.',
    submit: 'Criar conta',
    submitting: 'Criando conta...',
  },
  forgot: {
    icon: MailCheck,
    title: 'Recuperar senha',
    subtitle: 'Informe seu e-mail e enviaremos um link para criar uma nova senha.',
    submit: 'Enviar link',
    submitting: 'Enviando...',
  },
}

const emptyValues = { name: '', email: '', password: '', confirmPassword: '' }

function validate(mode, values) {
  const errors = {}
  const email = values.email.trim()

  if (mode === 'register' && values.name.trim().length < 2) errors.name = 'Informe seu nome.'
  if (!email) errors.email = 'Informe seu e-mail.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Este e-mail não parece válido.'

  if (mode !== 'forgot') {
    if (!values.password) errors.password = 'Informe sua senha.'
    else if (mode === 'register' && values.password.length < MIN_PASSWORD) {
      errors.password = `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`
    }
  }

  if (mode === 'register' && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'As senhas não coincidem.'
  }

  return errors
}

export const AuthFormPanel = forwardRef(function AuthFormPanel(
  { mode, onModeChange, onSubmit, emailInputRef, highlight, authError, isSubmitting },
  ref,
) {
  const [values, setValues] = useState(emptyValues)
  const [fieldErrors, setFieldErrors] = useState({})
  const [result, setResult] = useState(null)

  const text = copy[mode]
  const HeaderIcon = text.icon
  const message = result?.error || (result ? null : authError)

  const changeMode = (nextMode) => {
    setFieldErrors({})
    setResult(null)
    setValues((current) => ({ ...current, password: '', confirmPassword: '' }))
    onModeChange(nextMode)
  }

  const updateField = (field) => (event) => {
    const { value } = event.target
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
    if (result?.error) setResult(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const errors = validate(mode, values)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setResult(null)
    const payload = { email: values.email.trim(), password: values.password }
    if (mode === 'register') payload.name = values.name.trim()

    const outcome = await onSubmit({ type: mode, values: payload })
    if (outcome?.error || outcome?.success) setResult(outcome)
  }

  return (
    <div ref={ref} className="relative">
      {/* animated gradient border */}
      <div
        className={`form-border pointer-events-none absolute -inset-px rounded-[30px] transition-opacity duration-700 ${
          highlight ? 'opacity-100' : 'opacity-60'
        }`}
      />
      <div className="relative overflow-hidden rounded-[30px] bg-white/85 p-6 shadow-[0_40px_100px_-30px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:bg-slate-950/80 dark:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />

        <AnimatePresence mode="wait" initial={false}>
          <MotionDiv
            key={mode}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="relative space-y-6"
          >
            {mode !== 'login' ? (
              <button
                type="button"
                onClick={() => changeMode('login')}
                className="-mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft size={15} />
                Voltar para o login
              </button>
            ) : null}

            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10b981,#0d9488)] text-white shadow-[0_12px_30px_-8px_rgba(16,185,129,0.7)]">
                <HeaderIcon size={20} />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white sm:text-[1.75rem]">{text.title}</h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{text.subtitle}</p>
            </div>

            {result?.success ? (
              <div className="space-y-5">
                <div
                  role="status"
                  className="flex gap-3 rounded-2xl border border-emerald-300/60 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-950/30 dark:text-emerald-200"
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <span>{result.success}</span>
                </div>
                <button
                  type="button"
                  onClick={() => changeMode('login')}
                  className="inline-flex h-13 w-full items-center justify-center rounded-2xl border border-slate-900/10 bg-white/60 text-sm font-semibold text-slate-800 transition hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
                >
                  Ir para o login
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                {mode === 'register' ? (
                  <AuthField
                    label="Nome"
                    icon={User}
                    autoComplete="name"
                    placeholder="Como podemos te chamar?"
                    delay={0.04}
                    value={values.name}
                    onChange={updateField('name')}
                    error={fieldErrors.name}
                  />
                ) : null}

                <AuthField
                  label="E-mail"
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  placeholder="voce@email.com"
                  delay={0.08}
                  value={values.email}
                  onChange={updateField('email')}
                  inputRef={emailInputRef}
                  error={fieldErrors.email}
                />

                {mode !== 'forgot' ? (
                  <AuthField
                    label="Senha"
                    icon={KeyRound}
                    type="password"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    placeholder={mode === 'register' ? `Mínimo de ${MIN_PASSWORD} caracteres` : 'Digite sua senha'}
                    delay={0.14}
                    value={values.password}
                    onChange={updateField('password')}
                    error={fieldErrors.password}
                    trailing={
                      mode === 'login' ? (
                        <button
                          type="button"
                          onClick={() => changeMode('forgot')}
                          className="text-sm font-medium text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400"
                        >
                          Esqueci a senha
                        </button>
                      ) : null
                    }
                  />
                ) : null}

                {mode === 'register' ? (
                  <AuthField
                    label="Confirmar senha"
                    icon={KeyRound}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repita a senha"
                    delay={0.18}
                    value={values.confirmPassword}
                    onChange={updateField('confirmPassword')}
                    error={fieldErrors.confirmPassword}
                  />
                ) : null}

                {message ? (
                  <MotionDiv
                    role="alert"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-rose-300/50 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-950/30 dark:text-rose-200"
                  >
                    {message}
                  </MotionDiv>
                ) : null}

                <div className="space-y-3">
                  <MotionButton
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative inline-flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#10b981,#0d9488)] text-sm font-semibold text-white shadow-[0_18px_40px_-12px_rgba(16,185,129,0.7)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="btn-shine pointer-events-none absolute inset-0" />
                    {isSubmitting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : null}
                    {isSubmitting ? text.submitting : text.submit}
                    {!isSubmitting ? <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /> : null}
                  </MotionButton>

                  {mode === 'login' ? (
                    <p className="pt-1 text-center text-sm text-slate-500 dark:text-slate-400">
                      Ainda não tem conta?{' '}
                      <button
                        type="button"
                        onClick={() => changeMode('register')}
                        className="font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400"
                      >
                        Criar conta grátis
                      </button>
                    </p>
                  ) : null}

                  {mode === 'register' ? (
                    <p className="pt-1 text-center text-sm text-slate-500 dark:text-slate-400">
                      Já tem conta?{' '}
                      <button
                        type="button"
                        onClick={() => changeMode('login')}
                        className="font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400"
                      >
                        Entrar
                      </button>
                    </p>
                  ) : null}
                </div>
              </form>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500" />
              Dados protegidos com criptografia
            </div>
          </MotionDiv>
        </AnimatePresence>
      </div>
    </div>
  )
})
