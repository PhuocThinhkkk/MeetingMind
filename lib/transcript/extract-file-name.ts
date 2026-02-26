/**
 * Compute a sanitized file name by removing the final extension, quotes, and invalid characters.
 *
 * @param fileName - The original file name, optionally including an extension
 * @returns The file name with the trailing extension removed, single and double quotes stripped, any characters other than letters, digits, underscore, whitespace, or hyphen removed, and surrounding whitespace trimmed
 */
export function sanitizedFileName(fileName: string) {
  const sanitizedName = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/['"]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
  return sanitizedName
}
