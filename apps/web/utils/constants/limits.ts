import { PlanKey } from './plans'

export const PLAN_LIMITS = {
  FREE: {
    MONTHLY_SECONDS: 3 * 60 * 60,
    MAX_PER_FILE_SECONDS: 30 * 60,
  },
  PRO: {
    MONTHLY_SECONDS: 50 * 60 * 60,
    MAX_PER_FILE_SECONDS: 60 * 60 * 2,
  },
}

export const PLANS = {
  FREE: 'FREE' as PlanKey,
  PRO: 'PRO' as PlanKey,
}
