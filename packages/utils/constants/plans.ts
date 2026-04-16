export type PlanKey = 'FREE' | 'PRO'

export const plans = [
  {
    key: 'FREE' as PlanKey,
    name: 'Free',
    description: 'For trying things out',
    price: 0,
    features: [
      'Up to 3 hours of transcription / month',
      'Max 30 minutes per recording',
      'Basic translation tools',
      'Limited calendar usage',
    ],
    cta: 'Get started',
  },
  {
    key: 'PRO' as PlanKey,
    name: 'Pro',
    description: 'Built for serious work',
    price: 14.99,
    features: [
      'All features unlocked',
      '50 hours of transcription / month',
      'Unlimited recording length',
      'Priority processing',
    ],
    cta: 'Upgrade to Pro',
    featured: true,
  },
]
