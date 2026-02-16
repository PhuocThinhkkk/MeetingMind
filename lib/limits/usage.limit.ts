import { PlanKey } from '@/constains/plans'
import { PLAN_LIMITS } from '@/constains/limits'
/**
 * Determine whether a transcription request is permitted under the given plan's per-file and monthly usage limits.
 *
 * @param plan - The subscription plan key used to look up applicable limits
 * @param usedSeconds - Seconds of transcription already consumed in the current month
 * @param fileSeconds - Length in seconds of the new file to be transcribed
 * @returns An object with `allowed` set to `true` if the transcription may proceed, `false` otherwise, and `reason` explaining the decision
 */
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

/**
 * Determine whether a file's duration is within the allowed per-file limit for a plan.
 *
 * @param plan - The plan key whose limits will be used for validation.
 * @param fileSeconds - File duration in seconds.
 * @returns An object with `allowed` set to `true` if the file is within the plan's per-file limit, `false` otherwise, and a `reason` string explaining the decision.
 */
export function checkFileSizeAllowed({
  plan,
  fileSeconds,
}: {
  plan: PlanKey
  fileSeconds: number
}) {
  const limits = PLAN_LIMITS[plan]

  if (fileSeconds > limits.MAX_PER_FILE_SECONDS) {
    return {
      allowed: false,
      reason: 'This recording exceeds the maximum length for your plan.',
    }
  }

  return { allowed: true, reason: 'Did not violate the quota.' }
}