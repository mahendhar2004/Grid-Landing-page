/**
 * The shapes the admin API returns.
 *
 * One declaration per concept, used by every screen. They were declared per
 * screen before, and the same concept had already drifted: `Organizations`
 * called it `AdminOrganization` with eight fields while `ActionCentre`
 * called it `OrganizationRow` with three, so a field added to one was
 * invisible to the other and a rename could pass typecheck while breaking a
 * page.
 *
 * **Snake_case where the API speaks snake_case.** Several of these are rows
 * handed back from Postgres more or less as they are (`audit_log`, reports,
 * triage), and renaming them here would mean every screen maintaining a
 * mental translation table. The boundary is the API's, not ours; matching it
 * exactly is what makes a mismatch obvious rather than plausible.
 */

export type OrganizationType = 'ACADEMIC' | 'CORPORATE'
export type HubStatus = 'PENDING_VISIBILITY' | 'ACTIVE'
export type Tier = 'FREE' | 'PLUS' | 'PRO'
export type TriageInbox =
  | 'BUG_REPORT'
  | 'FEEDBACK'
  | 'CONTACT_MESSAGE'
  | 'PUBLIC_BUG_REPORT'
  | 'PUBLIC_REVIEW'

export interface AdminOrganization {
  id: string
  domain: string
  name: string
  type: OrganizationType
  hubId: string
  hubName: string
  hubStatus: HubStatus
  /**
   * Optional because a deployed API is not a compile-time guarantee: these
   * arrived in the same change as the UI reading them, the console deployed
   * first, and every row called `.toFixed` on undefined.
   */
  hubLatitude?: number
  hubLongitude?: number
  memberCount: number
  listingCount: number
}

export interface AdminReport {
  id: string
  reporter_email: string
  target_listing_id: string | null
  target_user_id: string | null
  target_request_id: string | null
  /** Reporting an ad - App Store guideline 2.5.18. Optional per rule 9 until the API carrying it is deployed. */
  target_ad_unit_id?: string | null
  category: string
  description: string | null
  status: string
  target_label: string | null
  target_owner_id: string | null
  report_count: number
  created_at: string
  /**
   * Whether the reported listing or request is REMOVED **right now**, so
   * Restore is offered only where there is something to restore. Always
   * false for a report against a user, which has no content.
   *
   * Optional per rule 9 — it arrived in the same change as the UI reading it
   * and the console deploys independently of the backend. `undefined` reads
   * as "not known yet" and simply hides the action, which is the behaviour
   * this console had anyway before the field existed.
   */
  target_removed?: boolean
  /** Whether the reported party is banned right now. Same rule-9 caveat. */
  target_owner_is_banned?: boolean
  /** When that ban lifts. Null while banned means permanent; null while not banned means nothing. */
  target_owner_banned_until?: string | null
}

/**
 * One row of the admin user directory.
 *
 * camelCase, unlike the report and audit rows beside it, because this one is
 * mapped in the service rather than handed back from Postgres as it is — the
 * boundary is still the API's, and matching it exactly is still the rule.
 */
export interface AdminUser {
  id: string
  email: string
  displayName: string | null
  role: string
  orgDomain: string
  isAdmin: boolean
  isBanned: boolean
  /**
   * **Null means two different things** and only resolves against `isBanned`:
   * not banned at all, or banned with no end date. Read together, never
   * alone — a screen that showed "until —" for both would be saying a
   * permanent ban expires today.
   */
  bannedUntil: string | null
  createdAt: string
  /** Distinct people who have reported them, or anything they own. One report is noise; five is a pattern. */
  reportCount: number
  listingCount: number
}

export interface AuditEntry {
  id: string
  actor_email: string
  action: string
  target_type: string
  target_id: string
  reason: string | null
  details: Record<string, unknown>
  source_ip: string | null
  created_at: string
}

/**
 * Deliberately open-ended: one row from whichever inbox is selected, and the
 * five tables genuinely do not share a column set. The four named fields are
 * the ones every inbox has and every screen relies on.
 */
export interface TriageItem {
  id: string
  status: string
  created_at: string
  is_featured?: boolean
  [column: string]: unknown
}

export type TriageCounts = Partial<Record<TriageInbox, number>>

export interface PricingEntry {
  pricedItem: string
  orgType: OrganizationType
  basePricePaise: number
  discountPaise: number
  finalPricePaise: number
}

export interface TierEntitlements {
  tier: Tier
  monthlyBundledCredits: number
  monthlyFreeBoosts: number
  unlimitedPosting: boolean
  crossOrgDiscountPercent: number
  prioritySearch: boolean
  badgeLabel: string | null
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

/**
 * The advertising platform's own vocabulary
 * (`docs/grid-v2/ADVERTISING_PLATFORM_PLAN.md` §3), which is the publisher
 * side of the industry rather than the advertiser side: an advertiser buys an
 * order, an order carries line items that each target an audience, and a
 * creative is the artwork, reviewed once and reusable across them.
 *
 * camelCase throughout, because the services map their rows rather than
 * handing back Postgres.
 */

export type AdvertiserTier = 'LOCAL' | 'BRAND' | 'HOUSE'
export type LineItemStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
export type CreativeReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type AdPlacement = 'FEED' | 'SEARCH' | 'MAP'

/** The company an ad belongs to. Everything to do with money or trust hangs off this. */
export interface Advertiser {
  id: string
  name: string
  /** Who the invoice is made out to, routinely different from the name on the ad. */
  legalName: string | null
  tier: AdvertiserTier
  gstNumber: string | null
  billingEmail: string | null
  contactName: string | null
  contactPhone: string | null
  notes: string | null
  /** Set only by Grid, on policy grounds. Suspending stops every ad they own. */
  suspendedAt: string | null
  suspendedReason: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  orderCount: number
  activeLineItemCount: number
  pendingCreativeCount: number
}

export interface AdvertisersPage {
  advertisers: Advertiser[]
  nextCursor: string | null
}

/** What was sold, to whom, for how much. */
export interface AdOrder {
  id: string
  advertiserId: string
  advertiserName: string
  name: string
  amountPaise: number
  startsAt: string | null
  endsAt: string | null
  notes: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  lineItemCount: number
}

export interface AdOrdersPage {
  orders: AdOrder[]
  nextCursor: string | null
}

/** An image, its copy and its destination — reviewed once, reusable across campaigns. */
export interface Creative {
  id: string
  advertiserId: string
  advertiserName: string
  title: string
  sponsorName: string
  imageUrl: string
  targetUrl: string
  /**
   * A partner programme's own required wording. Amazon demands "As an Amazon
   * Associate I earn from qualifying purchases" beside the link; most direct
   * arrangements need nothing, and "Sponsored" on the card covers them.
   */
  disclosure: string | null
  reviewStatus: CreativeReviewStatus
  reviewReason: string | null
  reviewedAt: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  /** How many campaigns stop if this is rejected. Rejecting a creative is never a one-ad decision. */
  lineItemCount: number
}

export interface CreativesPage {
  creatives: Creative[]
  nextCursor: string | null
}

/** A creative as it hangs off one ad — enough to draw the row without another call. */
export interface LineItemCreative {
  id: string
  title: string
  imageUrl: string
  reviewStatus: CreativeReviewStatus
  archivedAt: string | null
}

/** One ad: targeting, placements and schedule, under an order. */
export interface LineItem {
  id: string
  orderId: string
  orderName: string
  advertiserId: string
  advertiserName: string
  name: string
  status: LineItemStatus
  /** Grid's own stop, which `status` cannot clear. */
  suspendedAt: string | null
  suspendedReason: string | null
  placements: AdPlacement[]
  category: string | null
  keywords: string[] | null
  minPricePaise: number | null
  maxPricePaise: number | null
  startsAt: string | null
  endsAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  creatives: LineItemCreative[]
  impressionCount: number
  clickCount: number
}

export interface LineItemsPage {
  lineItems: LineItem[]
  nextCursor: string | null
}
