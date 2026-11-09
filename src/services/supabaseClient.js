import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn(
    '[FinanceTrack] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não definidos. ' +
      'Crie um arquivo .env (veja .env.example) para ativar login e dados.',
  )
}

// Sem as chaves, usamos valores de exemplo para a página abrir (a landing
// funciona normalmente); login e dados só funcionam com o .env configurado.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)
