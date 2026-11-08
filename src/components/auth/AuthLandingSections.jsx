import { motion } from 'framer-motion'
import {
  BellRing,
  Check,
  CreditCard,
  EyeOff,
  FileLock2,
  FileUp,
  KeyRound,
  LineChart,
  Lock,
  PieChart,
  Sparkles,
  Target,
  UserCheck,
  Wallet,
} from 'lucide-react'

const MotionDiv = motion.div

const banks = [
  { name: 'Nubank', color: '#8a05be' },
  { name: 'PicPay', color: '#21c25e' },
  { name: 'C6 Bank', color: '#2a2a2a' },
  { name: 'Inter', color: '#ff7a00' },
  { name: 'Itaú', color: '#ec7000' },
  { name: 'Bradesco', color: '#cc092f' },
  { name: 'Santander', color: '#ec0000' },
  { name: 'Banco do Brasil', color: '#fcd116' },
  { name: 'Caixa', color: '#0070af' },
  { name: 'Mercado Pago', color: '#00b1ea' },
  { name: 'XP', color: '#111111' },
  { name: 'BTG', color: '#0b2a5b' },
]

export function BankMarquee() {
  const row = [...banks, ...banks]
  return (
    <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div className="marquee flex w-max gap-3">
        {row.map((bank, index) => (
          <span
            key={`${bank.name}-${index}`}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-900/8 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur dark:border-white/8 dark:bg-white/[0.04] dark:text-slate-200"
          >
            <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white/40" style={{ background: bank.color }} />
            {bank.name}
          </span>
        ))}
      </div>
    </div>
  )
}

const features = [
  {
    icon: FileUp,
    title: 'Importe faturas em segundos',
    text: 'Envie o PDF da fatura e cada lançamento é lido, datado e categorizado automaticamente.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: CreditCard,
    title: 'Todos os cartões juntos',
    text: 'Limites, vencimentos e faturas de todos os bancos lado a lado, sem abrir cinco apps.',
    color: 'from-violet-500 to-fuchsia-500',
  },
  {
    icon: PieChart,
    title: 'Para onde vai seu dinheiro',
    text: 'Gráficos por categoria e por mês mostram exatamente onde dá para economizar.',
    color: 'from-sky-500 to-blue-600',
  },
  {
    icon: Target,
    title: 'Metas que se cumprem',
    text: 'Defina objetivos, acompanhe o progresso e receba alertas antes de estourar o orçamento.',
    color: 'from-orange-500 to-amber-500',
  },
]

export function FeaturesSection() {
  return (
    <section className="space-y-10">
      <MotionDiv
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
          Recursos
        </p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Controle financeiro sem planilha e sem dor de cabeça
        </h2>
      </MotionDiv>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <MotionDiv
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-3xl border border-slate-900/8 bg-white/60 p-6 backdrop-blur transition-shadow hover:shadow-[0_24px_60px_-20px_rgba(15,23,42,0.25)] dark:border-white/8 dark:bg-white/[0.03] dark:hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
            >
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${feature.color} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30`} />
              <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                <Icon size={22} />
              </div>
              <h3 className="relative mt-5 text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="relative mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{feature.text}</p>
            </MotionDiv>
          )
        })}
      </div>
    </section>
  )
}

const months = [42, 58, 49, 71, 63, 80, 68, 54, 76, 62, 88, 70]
const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export function DashboardPreview() {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[32px] border border-slate-900/8 bg-white/70 p-5 shadow-[0_40px_100px_-30px_rgba(15,23,42,0.3)] backdrop-blur-xl dark:border-white/8 dark:bg-slate-900/60 dark:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] sm:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
            Dashboard
          </p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Seu ano financeiro em um olhar
          </h2>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            Receitas, despesas e saldo atualizados a cada fatura importada. Alertas inteligentes avisam
            quando uma categoria sai do planejado.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: Wallet, label: 'Receitas', value: 'R$ 9.850', tone: 'text-emerald-500' },
              { icon: LineChart, label: 'Despesas', value: 'R$ 6.212', tone: 'text-rose-500' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-900/8 p-3 dark:border-white/8">
                <item.icon size={16} className={item.tone} />
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                <div className="font-display text-lg font-bold text-slate-900 dark:text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-900/8 bg-slate-50/80 p-5 dark:border-white/8 dark:bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Gastos mensais · 2026</div>
              <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">R$ 74.532</div>
            </div>
            <MotionDiv
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-300"
            >
              <BellRing size={12} /> Lazer +18%
            </MotionDiv>
          </div>
          <div className="mt-6 flex h-44 items-end gap-1.5 sm:gap-2.5">
            {months.map((value, index) => (
              <div key={index} className="flex h-full flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                <MotionDiv
                  initial={{ height: 0 }}
                  whileInView={{ height: `${value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full rounded-t-lg ${
                    index === 10
                      ? 'bg-[linear-gradient(180deg,#34d399,#0d9488)] shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                      : 'bg-slate-900/10 dark:bg-white/10'
                  }`}
                />
                </div>
                <span className="text-[10px] text-slate-400">{monthLabels[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MotionDiv>
  )
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-2xl text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">{title}</h2>
      {text ? <p className="mt-4 text-slate-600 dark:text-slate-400">{text}</p> : null}
    </MotionDiv>
  )
}

const plans = [
  {
    id: 'free',
    name: 'Grátis',
    price: 'R$ 0',
    period: 'para sempre',
    description: 'Tudo o que você precisa para organizar o dia a dia.',
    cta: 'Começar grátis',
    features: [
      'Dashboard com receitas, despesas e saldo',
      'Lançamentos e categorias ilimitados',
      'Importação de faturas em PDF',
      'Cartões de todos os bancos',
      'Modo claro e escuro',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 29,90',
    period: 'por mês',
    description: 'Para quem quer planejar e enxergar o futuro do seu dinheiro.',
    cta: 'Assinar Premium',
    highlight: true,
    features: [
      'Tudo do plano Grátis',
      'Planejamento mensal por categoria',
      'Metas com acompanhamento de progresso',
      'Relatórios avançados',
      'Insights inteligentes sobre seus gastos',
    ],
  },
]

export function PricingSection({ onSelectPlan }) {
  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="Planos"
        title="Comece grátis. Evolua quando quiser."
        text="Sem fidelidade e sem cartão de crédito para começar."
      />

      <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
        {plans.map((plan, index) => (
          <MotionDiv
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative flex flex-col overflow-hidden rounded-[28px] p-7 sm:p-8 ${
              plan.highlight
                ? 'bg-slate-900 text-white shadow-[0_40px_90px_-30px_rgba(16,185,129,0.55)] dark:bg-white/[0.06] dark:ring-1 dark:ring-emerald-400/40'
                : 'border border-slate-900/8 bg-white/60 backdrop-blur dark:border-white/8 dark:bg-white/[0.03]'
            }`}
          >
            {plan.highlight ? (
              <>
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/30 blur-3xl" />
                <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <Sparkles size={12} />
                  Mais completo
                </span>
              </>
            ) : null}

            <div className="relative">
              <h3 className={`text-lg font-semibold ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
              <p className={`mt-1 text-sm ${plan.highlight ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className={`font-display text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{plan.period}</span>
              </div>
            </div>

            <ul className="relative mt-7 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className={`flex gap-3 text-sm ${plan.highlight ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'}`}>
                  <Check size={18} className="mt-px shrink-0 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <motion.button
              type="button"
              onClick={() => onSelectPlan(plan.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition ${
                plan.highlight
                  ? 'bg-[linear-gradient(135deg,#10b981,#0d9488)] text-white shadow-[0_18px_40px_-12px_rgba(16,185,129,0.7)]'
                  : 'border border-slate-900/10 bg-white text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]'
              }`}
            >
              {plan.cta}
            </motion.button>
          </MotionDiv>
        ))}
      </div>
    </section>
  )
}

const securityItems = [
  {
    icon: KeyRound,
    title: 'Nunca pedimos a senha do banco',
    text: 'Você importa o PDF da fatura. Não conectamos na sua conta bancária nem guardamos credenciais de banco.',
  },
  {
    icon: FileLock2,
    title: 'A fatura é lida no seu navegador',
    text: 'O PDF é processado no seu próprio dispositivo. Só os lançamentos que você confirmar são salvos.',
  },
  {
    icon: UserCheck,
    title: 'Seus dados são só seus',
    text: 'Cada registro fica isolado por usuário no banco de dados. Ninguém além de você consegue ver seus lançamentos.',
  },
  {
    icon: Lock,
    title: 'Conexão criptografada',
    text: 'Toda a comunicação entre o app e o servidor trafega por HTTPS, e as senhas são armazenadas com hash.',
  },
]

export function SecuritySection() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-slate-900/8 bg-white/60 p-6 backdrop-blur-xl dark:border-white/8 dark:bg-white/[0.03] sm:p-10 lg:p-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-center">
        <MotionDiv
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10b981,#0d9488)] text-white shadow-[0_14px_34px_-10px_rgba(16,185,129,0.7)]">
            <EyeOff size={24} />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">Segurança</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Seu dinheiro é assunto seu</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Construímos o FinanceTrack para que você tenha controle total das suas finanças sem precisar entregar o
            acesso ao seu banco.
          </p>
        </MotionDiv>

        <div className="grid gap-4 sm:grid-cols-2">
          {securityItems.map((item, index) => {
            const Icon = item.icon
            return (
              <MotionDiv
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="rounded-3xl border border-slate-900/8 bg-white/70 p-5 dark:border-white/8 dark:bg-slate-950/40"
              >
                <Icon size={20} className="text-emerald-500" />
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.text}</p>
              </MotionDiv>
            )
          })}
        </div>
      </div>
    </section>
  )
}
