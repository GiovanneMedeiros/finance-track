const messages = [
  ['invalid login credentials', 'E-mail ou senha incorretos.'],
  ['email not confirmed', 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'],
  ['user already registered', 'Já existe uma conta com este e-mail. Tente entrar ou recuperar a senha.'],
  ['password should be at least', 'A senha precisa ter pelo menos 6 caracteres.'],
  ['unable to validate email address', 'Este e-mail não parece válido.'],
  ['email rate limit exceeded', 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'],
  ['for security purposes', 'Por segurança, aguarde alguns segundos antes de tentar de novo.'],
  ['failed to fetch', 'Não foi possível conectar ao servidor. Verifique sua internet.'],
  ['signups not allowed', 'Novos cadastros estão desativados no momento.'],
]

export function translateAuthError(error) {
  if (!error) return null
  const raw = typeof error === 'string' ? error : error.message || ''
  const lower = raw.toLowerCase()
  const match = messages.find(([needle]) => lower.includes(needle))
  return match ? match[1] : raw || 'Algo deu errado. Tente novamente.'
}
