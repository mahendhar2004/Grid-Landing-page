import type { CreditGrantConfigEntry } from '../api/types'

/**
 * The earning sources an admin can set an amount for.
 *
 * The plan's monthly credit is not here: how much that is comes from the plan
 * itself (Monetization), so a number set for it here would be read by nothing.
 */
export const REWARD_SOURCES: ReadonlyArray<{ source: CreditGrantConfigEntry['source']; label: string; explain: string }> = [
  { source: 'SIGNUP_BONUS', label: 'Welcome credit', explain: 'Given once to every new member when they join.' },
  { source: 'REFERRAL_REWARD', label: 'Referral reward', explain: 'Given to a member each time someone they referred qualifies.' },
  { source: 'SEVEN_DAY_STREAK', label: 'Seven-day streak', explain: 'Given to a member who uses Grid seven days in a row.' },
]

/** The most a wallet can hold, in rupees. An amount above it is refused by the server. */
export const MAX_REWARD_RUPEES = 50_000

export function rupeesFromPaise(paise: number): string {
  return (paise / 100).toString()
}

/** The first thing wrong with an amount as typed, in words, or null. */
export function problemWithReward(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed === '') return 'Enter an amount, or 0 for none.'
  const rupees = Number(trimmed)
  if (!Number.isFinite(rupees)) return 'The amount must be a number.'
  if (rupees < 0) return 'The amount cannot be negative.'
  if (rupees > MAX_REWARD_RUPEES) return `A wallet cannot hold more than ₹${MAX_REWARD_RUPEES.toLocaleString('en-IN')}.`
  if (Math.round(rupees * 100) / 100 !== rupees) return 'Use at most two decimal places.'
  return null
}
