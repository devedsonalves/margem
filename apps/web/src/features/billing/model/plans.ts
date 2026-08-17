import type { BillingOverviewDTO, PlanCode } from '@margem/types'

export type MarketingPlan = {
  code: Extract<PlanCode, 'FREE' | 'PREMIUM'>
  name: string
  title: string
  description: string
  priceLabel: string
  priceSuffix?: string
  ctaLabel: string
  features: string[]
  recommended?: boolean
}

export const marketingPlans: MarketingPlan[] = [
  {
    code: 'FREE',
    name: 'Free',
    title: 'Plano Free',
    description: 'Para começar a organizar leituras e anotações no Margem.',
    priceLabel: 'Grátis',
    ctaLabel: 'Começar grátis',
    features: [
      'Leitura de PDF ilimitada',
      'Caderno de anotações básico',
      'Marca-texto por documento',
      'Armazenamento de até 5 documentos'
    ]
  },
  {
    code: 'PREMIUM',
    name: 'Premium',
    title: 'Plano Premium',
    description: 'Para transformar marcações, citações e notas em rotina de escrita.',
    priceLabel: 'R$ 9,90',
    priceSuffix: '/mês',
    ctaLabel: 'Assinar Premium',
    recommended: true,
    features: [
      'Tudo do Free',
      'Catálogo de livros integrado ao app',
      'Notas e citações ilimitadas',
      'Exportação avançada (Markdown, PDF, Notion)',
      'Marca-texto personalizado',
      'Sincronização em múltiplos dispositivos'
    ]
  }
]

export const premiumFeatures = marketingPlans.find(plan => plan.code === 'PREMIUM')!.features

export const planPageFeatures: Record<MarketingPlan['code'], string[]> = {
  FREE: [
    'Até 5 documentos no acervo',
    'Leitura e progresso salvos',
    'Destaques por documento',
    'Caderno de anotações básico'
  ],
  PREMIUM: [
    'Documentos, notas e citações ilimitados',
    'Catálogo de livros integrado',
    'Exportação em Markdown, PDF e Notion',
    'Sincronização em múltiplos dispositivos'
  ]
}

export function getPlanLabel(plan: PlanCode) {
  const labels: Record<PlanCode, string> = {
    FREE: 'Free',
    ESSENTIAL: 'Essencial',
    PREMIUM: 'Premium'
  }
  return labels[plan]
}

export function getStatusLabel(status: BillingOverviewDTO['planStatus']) {
  const labels: Record<BillingOverviewDTO['planStatus'], string> = {
    FREE: 'sem assinatura paga',
    PENDING: 'pagamento pendente',
    ACTIVE: 'assinatura ativa',
    PAST_DUE: 'pagamento em atraso',
    CANCELED: 'assinatura cancelada'
  }
  return labels[status]
}

export function getStatusShortLabel(status: BillingOverviewDTO['planStatus']) {
  const labels: Record<BillingOverviewDTO['planStatus'], string> = {
    FREE: 'Gratuito',
    PENDING: 'Pendente',
    ACTIVE: 'Ativo',
    PAST_DUE: 'Em atraso',
    CANCELED: 'Cancelado'
  }
  return labels[status]
}

export function getStatusBadgeClass(status: BillingOverviewDTO['planStatus']) {
  const base = 'rounded-brand border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]'

  if (status === 'ACTIVE') return `${base} border-[#8fb99c] bg-[#eef7f1] text-[#1f6f4a]`
  if (status === 'PENDING') return `${base} border-[#d8b76a] bg-[#fff8e8] text-[#8a6218]`
  if (status === 'PAST_DUE' || status === 'CANCELED') {
    return `${base} border-[#e2a6a6] bg-[#fff1f1] text-[#8f1d2c]`
  }
  return `${base} border-[#c5c6cd] bg-[#f5f3f4] text-[#5a5f62]`
}
