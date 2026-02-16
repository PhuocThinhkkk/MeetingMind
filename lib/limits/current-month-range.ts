/**
 * Get the ISO date range covering the current month.
 *
 * @returns An object with `start` set to the ISO timestamp for the first day of the current month and `end` set to the ISO timestamp for the first day of the next month
 */
export function getCurrentMonthRange() {
  const now = new Date()

  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}