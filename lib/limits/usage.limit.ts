import { PlanKey } from '@/constains/plans'
import { PLAN_LIMITS } from '@/constains/limits'
export function checkTranscriptionAllowed({
  plan,
  usedSeconds,
  fileSeconds,
}: {
  plan: PlanKey
  usedSeconds: number
  fileSeconds: number
}) {
  const limits = PLAN_LIMITS[plan]

  if (fileSeconds > limits.MAX_PER_FILE_SECONDS) {
    return {
      allowed: false,
      reason: 'This recording exceeds the maximum length for your plan.',
    }
  }

  if (usedSeconds + fileSeconds > limits.MONTHLY_SECONDS) {
    return {
      allowed: false,
      reason: 'You have reached your monthly transcription limit.',
    }
  }

  return { allowed: true, reason: 'Did not violate the quota.' }
}
