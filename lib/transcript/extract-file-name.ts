export function sanitizedFileName(fileName: string) {
  const sanitizedName = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/['"]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
  return sanitizedName
}
