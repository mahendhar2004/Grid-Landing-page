/** The first thing wrong with a number of days to grant a plan for, or null. Every grant ends, within a year. */
export function daysError(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed === '') return 'Enter a number of days.'
  const days = Number(trimmed)
  if (!Number.isInteger(days)) return 'Days must be a whole number.'
  if (days < 1 || days > 365) return 'A plan can be given for 1 to 365 days.'
  return null
}
