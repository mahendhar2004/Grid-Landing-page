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
  category: string
  description: string | null
  status: string
  target_label: string | null
  target_owner_id: string | null
  report_count: number
  created_at: string
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
