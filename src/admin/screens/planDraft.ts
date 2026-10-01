import type { UpdatePlanBody } from '../api/endpoints'
import type { AdminPlan, OrganizationType, PlanStatus } from '../api/types'

/**
 * The plan editor's drafts and the rules about them, apart from the screen.
 *
 * Numbers are held as text while editing: a half-typed number is not a number,
 * and binding an input to numeric state makes clearing it either impossible or
 * silently a zero.
 */

export interface PlanDraft {
  name: string
  badgeLabel: string
  /** Held as text while editing: a half-typed number is not a number. */
  sortOrder: string
  status: PlanStatus
  isRecommended: boolean
  iosProductId: string
  androidProductId: string
  /** Rupees as typed, by organisation type. */
  prices: Record<OrganizationType, { base: string; discount: string }>
}

function rupees(paise: number): string {
  return (paise / 100).toString()
}

export function planDraftFrom(plan: AdminPlan): PlanDraft {
  const price = (orgType: OrganizationType) => {
    const row = plan.pricing.find((entry) => entry.orgType === orgType)
    return { base: row ? rupees(row.basePricePaise) : '', discount: row ? rupees(row.discountPaise) : '' }
  }
  return {
    name: plan.name,
    badgeLabel: plan.badgeLabel ?? '',
    sortOrder: String(plan.sortOrder),
    status: plan.status,
    isRecommended: plan.isRecommended,
    iosProductId: plan.iosProductId ?? '',
    androidProductId: plan.androidProductId ?? '',
    prices: { ACADEMIC: price('ACADEMIC'), CORPORATE: price('CORPORATE') },
  }
}

/** An empty field is "none", and a whitespace-only one is none too - it would render as a visible blank pill. */
function textOrNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function planBodyFrom(draft: PlanDraft): UpdatePlanBody {
  return {
    name: draft.name.trim(),
    badgeLabel: textOrNull(draft.badgeLabel),
    sortOrder: Number(draft.sortOrder),
    status: draft.status,
    isRecommended: draft.isRecommended,
    iosProductId: textOrNull(draft.iosProductId),
    androidProductId: textOrNull(draft.androidProductId),
  }
}

/** The first thing wrong with the details, in words, or null. */
export function problemWithPlanDraft(draft: PlanDraft, plan: AdminPlan): string | null {
  if (draft.name.trim() === '') return 'A plan needs a name.'
  const order = Number(draft.sortOrder)
  if (draft.sortOrder.trim() === '' || !Number.isInteger(order) || order < 0) return 'Position must be a whole number, 0 or more.'
  if (draft.badgeLabel.trim().length > 24) return 'The profile badge can be at most 24 characters.'
  if (draft.isRecommended && draft.status !== 'AVAILABLE') return 'Only a plan that is on sale can be the recommended one.'
  if (plan.isDefault) {
    if (draft.status !== 'AVAILABLE') return `${plan.name} is what everyone starts on, so it has to stay on sale.`
    if (draft.isRecommended) return `${plan.name} is what everyone already has, so it cannot be the recommended plan.`
    if (draft.iosProductId.trim() !== '' || draft.androidProductId.trim() !== '') return `${plan.name} is free, so it has no store product.`
  }
  return null
}

export function sameDetails(a: PlanDraft, b: PlanDraft): boolean {
  return (
    a.name === b.name &&
    a.badgeLabel === b.badgeLabel &&
    a.sortOrder === b.sortOrder &&
    a.status === b.status &&
    a.isRecommended === b.isRecommended &&
    a.iosProductId === b.iosProductId &&
    a.androidProductId === b.androidProductId
  )
}

/** The first thing wrong with one organisation type's listed price, or null. Blank means "not listed yet". */
export function problemWithPrice(price: { base: string; discount: string }): string | null {
  if (price.base.trim() === '') return null
  const base = Number(price.base)
  const discount = price.discount.trim() === '' ? 0 : Number(price.discount)
  if (!Number.isFinite(base) || base < 0) return 'The price must be a number, 0 or more.'
  if (!Number.isFinite(discount) || discount < 0) return 'The discount must be a number, 0 or more.'
  if (discount > base) return 'The discount cannot be more than the price.'
  return null
}

export function pricesDiffer(a: PlanDraft['prices'], b: PlanDraft['prices'], orgType: OrganizationType): boolean {
  return a[orgType].base !== b[orgType].base || a[orgType].discount !== b[orgType].discount
}


/** The key is the plan's identity - store product ids and subscription history refer to it - so it is chosen here and cannot be changed after. */
const KEY_PATTERN = /^[A-Z][A-Z0-9_]{1,31}$/

export function problemWithNewPlan(key: string, name: string, existingKeys: readonly string[]): string | null {
  if (name.trim() === '') return 'Give the plan a name.'
  if (!KEY_PATTERN.test(key)) return 'The key is 2-32 characters: capital letters, digits and underscores, starting with a letter.'
  if (existingKeys.includes(key)) return `A plan with the key ${key} already exists.`
  return null
}

