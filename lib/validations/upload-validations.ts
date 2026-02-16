export function validateFilePathOwner(path: string, userId: string) {
  if (path.includes('..') || path.includes('//')) {
    return { allowed: false, reason: 'Invalid path.' }
  }
  if (
    !path.startsWith(`uploads/${userId}/`) &&
    !path.startsWith(`recordings/${userId}/`)
  ) {
    return { allowed: false, reason: 'No authorize.' }
  }
  return { allowed: true, reason: 'owner satisfied.' }
}
