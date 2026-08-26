import { PlanCode } from '@margem/database'

export interface PlanDefinition {
  code: PlanCode
  name: string
  description: string
  priceCents: number
  documentLimit: number | null
  highlightLimit: number | null
  features: string[]
  recommended?: boolean
}

export const plans: PlanDefinition[] = [
  {
    code: PlanCode.FREE,
    name: 'Free',
    description: 'Para começar a organizar leituras e anotações no Margem.',
    priceCents: 0,
    documentLimit: 5,
    highlightLimit: 50,
    features: [
      'Leitura de PDF ilimitada',
      'Caderno de anotações básico',
      'Marca-texto por documento',
      'Armazenamento de até 5 documentos'
    ]
  },
  {
    code: PlanCode.PREMIUM,
    name: 'Premium',
    description: 'Para transformar marcações, citações e notas em rotina de escrita.',
    priceCents: 990,
    documentLimit: null,
    highlightLimit: null,
    features: [
      'Tudo do Free',
      'Catálogo de livros integrado ao app',
      'Notas e citações ilimitadas',
      'Exportação avançada (Markdown, PDF, Notion)',
      'Marca-texto personalizado',
      'Sincronização em múltiplos dispositivos'
    ],
    recommended: true
  }
]

export function getPaidPlan(code: unknown) {
  const plan = plans.find(item => item.code === code)
  if (!plan || plan.code === PlanCode.FREE) return null
  return plan
}

export function getPlan(code: unknown) {
  return plans.find(plan => plan.code === code) || plans[0]
}

export function serializePlan(plan: PlanDefinition) {
  return {
    ...plan,
    currency: 'BRL' as const,
    interval: 'MONTHLY' as const
  }
}
