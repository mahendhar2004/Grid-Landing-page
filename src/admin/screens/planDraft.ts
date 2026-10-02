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
  /** The sale: its name, and the first and last day it runs (YYYY-MM-DD, India time). Blank dates mean no bound. */
  /** "Who it's for" - the line under the price on the plan card. */
  audience: string
  offerName: string
  offerStarts: string
  offerEnds: string
  /** Rupees as typed, by organisation type. */
  prices: Record<OrganizationType, PriceDraft>
}

/** One kind of organisation's listed price, and the store product it buys through if it has one of its own. */
export interface PriceDraft {
  base: string
  discount: string
  iosProductId: string
  androidProductId: string
}

/** The calendar day an instant falls on in India, as YYYY-MM-DD - the day an admin means when they pick a date. Blank for no date. */
export function dayInIndia(iso: string | null): string {
  if (iso === null) return ''
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

/** A sale starts at the beginning of its first day and ends at the end of its last, India time. */
function startOfDay(day: string): string | null {
  return day.trim() === '' ? null : new Date(`${day}T00:00:00+05:30`).toISOString()
}

function endOfDay(day: string): string | null {
  return day.trim() === '' ? null : new Date(`${day}T23:59:59+05:30`).toISOString()
}

function rupees(paise: number): string {
  return (paise / 100).toString()
}

export function planDraftFrom(plan: AdminPlan): PlanDraft {
  const price = (orgType: OrganizationType) => {
    const row = plan.pricing.find((entry) => entry.orgType === orgType)
    return {
      base: row ? rupees(row.basePricePaise) : '',
      discount: row ? rupees(row.discountPaise) : '',
      iosProductId: row?.iosProductId ?? '',
      androidProductId: row?.androidProductId ?? '',
    }
  }
  return {
    name: plan.name,
    badgeLabel: plan.badgeLabel ?? '',
    sortOrder: String(plan.sortOrder),
    status: plan.status,
    isRecommended: plan.isRecommended,
    iosProductId: plan.iosProductId ?? '',
    androidProductId: plan.androidProductId ?? '',
    audience: plan.audience ?? '',
    offerName: plan.offerName ?? '',
    offerStarts: dayInIndia(plan.offerStartsAt),
    offerEnds: dayInIndia(plan.offerEndsAt),
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
    audience: textOrNull(draft.audience),
    offerName: textOrNull(draft.offerName),
    offerStartsAt: startOfDay(draft.offerStarts),
    offerEndsAt: endOfDay(draft.offerEnds),
  }
}

/** The first thing wrong with the details, in words, or null. */
export function problemWithPlanDraft(draft: PlanDraft, plan: AdminPlan): string | null {
  if (draft.name.trim() === '') return 'A plan needs a name.'
  const order = Number(draft.sortOrder)
  if (draft.sortOrder.trim() === '' || !Number.isInteger(order) || order < 0) return 'Position must be a whole number, 0 or more.'
  if (draft.badgeLabel.trim().length > 24) return 'The profile badge can be at most 24 characters.'
  if (draft.audience.trim().length > 80) return 'Who it is for can be at most 80 characters: it sits under the price on a card.'
  if (draft.offerName.trim().length > 40) return 'The sale name can be at most 40 characters.'
  if ((draft.offerStarts.trim() !== '' || draft.offerEnds.trim() !== '') && draft.offerName.trim() === '') return 'Name the sale (for example Early bird) - a dated sale with no name tells members nothing.'
  if (draft.offerStarts.trim() !== '' && draft.offerEnds.trim() !== '' && draft.offerEnds < draft.offerStarts) return 'The sale has to end on or after the day it starts.'
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
    a.androidProductId === b.androidProductId &&
    a.audience === b.audience &&
    a.offerName === b.offerName &&
    a.offerStarts === b.offerStarts &&
    a.offerEnds === b.offerEnds
  )
}

/** The first thing wrong with one organisation type's listed price, or null. Blank means "not listed yet". */
export function problemWithPrice(price: PriceDraft): string | null {
  if (price.base.trim() === '') return null
  const base = Number(price.base)
  const discount = price.discount.trim() === '' ? 0 : Number(price.discount)
  if (!Number.isFinite(base) || base < 0) return 'The price must be a number, 0 or more.'
  if (!Number.isFinite(discount) || discount < 0) return 'The discount must be a number, 0 or more.'
  if (discount > base) return 'The discount cannot be more than the price.'
  return null
}

export function pricesDiffer(a: PlanDraft['prices'], b: PlanDraft['prices'], orgType: OrganizationType): boolean {
  return (
    a[orgType].base !== b[orgType].base ||
    a[orgType].discount !== b[orgType].discount ||
    a[orgType].iosProductId !== b[orgType].iosProductId ||
    a[orgType].androidProductId !== b[orgType].androidProductId
  )
}

/** A blank product id is "none" - back on the plan's shared product - and a whitespace-only one is none too. */
export function productIdOrNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}


/** The key is the plan's identity - store product ids and subscription history refer to it - so it is chosen here and cannot be changed after. */
const KEY_PATTERN = /^[A-Z][A-Z0-9_]{1,31}$/

export function problemWithNewPlan(key: string, name: string, existingKeys: readonly string[]): string | null {
  if (name.trim() === '') return 'Give the plan a name.'
  if (!KEY_PATTERN.test(key)) return 'The key is 2-32 characters: capital letters, digits and underscores, starting with a letter.'
  if (existingKeys.includes(key)) return `A plan with the key ${key} already exists.`
  return null
}

