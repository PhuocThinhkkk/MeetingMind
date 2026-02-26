import { log } from '../logger'

/**
 * Validates whether a storage file path belongs to the given user.
 *
 * @param path - The storage path to validate (e.g., "uploads/{userId}/...")
 * @param userId - The user's identifier expected at the start of allowed paths
 * @returns An object with `allowed` set to `true` if `path` starts with `uploads/{userId}/` or `recordings/{userId}/`, otherwise `false`; `reason` explains the result
 */
export function validateFilePathOwner(path: string, userId: string) {
  if (path.includes('..') || path.includes('//')) {
    return { allowed: false, reason: 'Invalid path.' }
  }
  log.info('path: ', { path, userId })
  if (
    !path.startsWith(`uploads/${userId}/`) &&
    !path.startsWith(`recordings/${userId}/`)
  ) {
    return { allowed: false, reason: 'No authorize.' }
  }
  return { allowed: true, reason: 'owner satisfied.' }
}
