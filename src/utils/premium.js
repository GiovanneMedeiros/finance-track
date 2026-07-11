export function isPremiumUser(profile) {
  if (!profile) {
    return false
  }

  const { plan, subscription_status, subscription_expires_at } = profile
  if (plan !== 'premium' || subscription_status !== 'active' || !subscription_expires_at) {
    return false
  }

  const expiresAt = new Date(subscription_expires_at)
  return expiresAt.getTime() > Date.now()
}

export function getPremiumExpiryLabel(subscriptionExpiresAt) {
  if (!subscriptionExpiresAt) {
    return 'Sem assinatura ativa'
  }

  const date = new Date(subscriptionExpiresAt)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getPremiumStatusLabel(profile) {
  if (!profile) {
    return 'Free'
  }

  if (isPremiumUser(profile)) {
    return 'Premium ativo'
  }

  return 'Plano Free'
}
