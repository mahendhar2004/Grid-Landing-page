import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../lib/api'
import type {
  AdOrder,
  AdOrdersPage,
  AdDeliveryType,
  AdPlacement,
  AdSector,
  AdSettings,
  AdvertiserLedgerPage,
  AdminOrganization,
  Advertiser,
  AdvertiserTier,
  AdvertisersPage,
  Creative,
  CreativesPage,
  LineItem,
  LineItemsPage,
  AdminReport,
  AdminUser,
  AuditEntry,
  AuthTokens,
  OrganizationType,
  PricingEntry,
  TierEntitlements,
  TriageCounts,
  TriageInbox,
  TriageItem,
} from './types'

/**
 * Every admin endpoint the console can call, in one file.
 *
 * **Screens do not write URLs.** They were writing twenty of them across
 * eight files — `'/v1/admin/organizations'` appeared three times with three
 * different response types, and nothing anywhere listed what the console
 * actually talks to. Renaming a route meant grepping and hoping.
 *
 * Each function below is the *only* way to reach its route, so:
 *
 * - the API surface is readable in one screen of text;
 * - a route change is one edit, and the compiler finds every caller;
 * - request and response types are declared once, next to each other,
 *   rather than re-guessed per screen;
 * - a reason that the audit log requires cannot be forgotten, because it is
 *   a required argument rather than a key someone might omit.
 *
 * **Adding an endpoint:** add a function here with its types, then call it as
 * `api.<group>.<call>()`. Nothing else in the console should import from
 * `lib/api` directly.
 *
 * **Reached through the single `api` object below, never as bare named
 * imports.** `import { organizations }` collided with the natural local name
 * for the fetched list on the very screen that needed it most - and because
 * the call sat inside a callback, the local won at runtime and
 * `organizations.list` was a TypeError on an array, not a compile error. One
 * namespace has no such failure mode, and `api.organizations.list()` says
 * what it is at the call site.
 */

// ---------------------------------------------------------------- auth

const auth = {
  /** Starts a session. The only way into the console — see `screens/SignIn.tsx`. */
  sendOtp(email: string): Promise<unknown> {
    return apiPost('/v1/auth/send-otp', {
      email,
      // `role` is only read when an account is created, so it has no effect
      // for an admin. EMPLOYEE because in the one case it would be used,
      // console staff are not students.
      role: 'EMPLOYEE',
      // The endpoint records a consent event from these, which is why
      // SignIn shows the documents rather than just sending `true`.
      consentAccepted: true,
      ageConfirmed: true,
    })
  },

  verifyOtp(email: string, otp: string): Promise<AuthTokens> {
    return apiPost<AuthTokens>('/v1/auth/verify-otp', { email, otp })
  },
}

// ------------------------------------------------------- moderation

export type ReportStatus = 'OPEN' | 'ACTIONED' | 'DISMISSED'
export type ReportAction = 'REMOVE_CONTENT' | 'WARN_USER' | 'BAN_USER'

/**
 * What to do about a report, shaped so the server's own two rules are
 * unstatable rather than merely documented.
 *
 * `POST /v1/admin/reports/:id/action` requires `banDurationDays` for
 * `BAN_USER` — where **`null` means open-ended**, not "unset" — and refuses
 * it for every other action. Expressed as an optional number, a permanent
 * ban and a forgotten field look identical at the call site, and the first
 * attempt at this file got it wrong in exactly that way: `null` would have
 * been dropped and a permanent ban rejected as a missing field.
 *
 * A discriminated union makes both mistakes compile errors.
 */
export type ReportDecision =
  | { readonly action: 'REMOVE_CONTENT' | 'WARN_USER' }
  | { readonly action: 'BAN_USER'; readonly banDurationDays: number | null }

export type ReportCategory =
  | 'FAKE_LISTING'
  | 'WRONG_DESCRIPTION'
  | 'PROHIBITED_ITEM'
  | 'SPAM'
  | 'SCAM'
  | 'OTHER'

const reports = {
  /** `category` omitted means every category, which is not the same as any particular one — so it is optional rather than a sentinel value. */
  list(
    status: ReportStatus,
    category: ReportCategory | null,
    limit: number,
    offset: number,
  ): Promise<AdminReport[]> {
    return apiGet<AdminReport[]>('/v1/admin/reports', {
      status,
      ...(category ? { category } : {}),
      limit,
      offset,
    })
  },

  dismiss(reportId: string, reason: string): Promise<unknown> {
    return apiPost(`/v1/admin/reports/${reportId}/dismiss`, { reason })
  },

  act(reportId: string, decision: ReportDecision, reason: string): Promise<unknown> {
    return apiPost(`/v1/admin/reports/${reportId}/action`, { ...decision, reason })
  },
}

// ----------------------------------------------------------- triage

/**
 * "Resolved" is spelled differently per inbox, server-side — a handled
 * contact message is `HANDLED`, an approved review is `APPROVED`, everything
 * else is `RESOLVED`. The console filters by meaning, not by spelling, so
 * that mapping belongs here with the other encoded server rules rather than
 * as a magic string in the screen.
 *
 * Mirrors `queries/admin-triage.ts#RESOLVED_STATUS_FOR_INBOX`. A new inbox
 * that forgets its entry here is a compile error, not a filter that silently
 * matches nothing.
 */
const RESOLVED_STATUS: Record<TriageInbox, string> = {
  BUG_REPORT: 'RESOLVED',
  FEEDBACK: 'RESOLVED',
  CONTACT_MESSAGE: 'HANDLED',
  PUBLIC_BUG_REPORT: 'RESOLVED',
  PUBLIC_REVIEW: 'APPROVED',
}

/** What the console offers, as meanings. `null` is every status. */
export type TriageStatusFilter = 'OPEN' | 'RESOLVED' | 'SPAM' | null

/** Turns a meaning into whatever this particular inbox calls it. */
export function triageStatusValue(inbox: TriageInbox, filter: TriageStatusFilter): string | null {
  if (filter === null) return null
  if (filter === 'RESOLVED') return RESOLVED_STATUS[inbox]
  return filter
}

const triage = {
  list(
    inbox: TriageInbox,
    status: string | null,
    limit: number,
    offset: number,
  ): Promise<TriageItem[]> {
    return apiGet<TriageItem[]>('/v1/admin/triage', {
      inbox,
      ...(status ? { status } : {}),
      limit,
      offset,
    })
  },

  counts(): Promise<TriageCounts> {
    return apiGet<TriageCounts>('/v1/admin/triage/counts')
  },

  resolve(inbox: TriageInbox, itemId: string, isSpam: boolean, reason: string): Promise<unknown> {
    return apiPost('/v1/admin/triage/resolve', { inbox, itemId, isSpam, reason })
  },

  /** `reviewId`, not `itemId` — the route names it that, and this file existing is what stops that difference being rediscovered per screen. */
  featureReview(reviewId: string, isFeatured: boolean, reason: string): Promise<unknown> {
    return apiPost('/v1/admin/triage/feature-review', { reviewId, isFeatured, reason })
  },
}

// ---------------------------------------------------- organizations

export interface CreateOrganizationBody {
  domain: string
  name: string
  type: OrganizationType
  latitude: number
  longitude: number
  activateImmediately: boolean
  reason: string
}

export interface UpdateOrganizationBody {
  name?: string
  type?: OrganizationType
  hubStatus?: 'ACTIVE' | 'PENDING_VISIBILITY'
  /** Both or neither — the endpoint refuses one alone, because a new latitude against an old longitude is a Hub nobody chose. */
  latitude?: number
  longitude?: number
  reason: string
}

const organizations = {
  list(search: string | undefined, limit: number, offset: number): Promise<AdminOrganization[]> {
    return apiGet<AdminOrganization[]>('/v1/admin/organizations', { search, limit, offset })
  },

  create(body: CreateOrganizationBody): Promise<AdminOrganization> {
    return apiPost<AdminOrganization>('/v1/admin/organizations', body)
  },

  update(organizationId: string, body: UpdateOrganizationBody): Promise<AdminOrganization> {
    return apiPatch<AdminOrganization>(`/v1/admin/organizations/${organizationId}`, body)
  },

  /** Refused by the server while members, listings or requests are attached — it never cascades. */
  remove(organizationId: string, reason: string): Promise<unknown> {
    return apiDelete(`/v1/admin/organizations/${organizationId}`, { reason })
  },
}

// --------------------------------------------------- money & tiers

const pricing = {
  list(): Promise<PricingEntry[]> {
    return apiGet<PricingEntry[]>('/v1/admin/pricing')
  },

  upsert(
    pricedItem: string,
    orgType: OrganizationType,
    basePricePaise: number,
    discountPaise: number,
  ): Promise<unknown> {
    return apiPost('/v1/admin/pricing', { pricedItem, orgType, basePricePaise, discountPaise })
  },
}

const tiers = {
  list(): Promise<TierEntitlements[]> {
    return apiGet<TierEntitlements[]>('/v1/admin/tiers')
  },

  /** A full replacement, not a merge: the route requires every entitlement, and omitting one is a validation error rather than "leave it alone". */
  update(tier: string, entitlements: Omit<TierEntitlements, 'tier'>): Promise<unknown> {
    return apiPut(`/v1/admin/tiers/${tier}`, entitlements)
  },
}

// ---------------------------------------------------------- audit

const audit = {
  /**
   * `targetType`/`targetId` are how a specific question gets answered —
   * "what have we done to this organization?" — and the log is the screen
   * most likely to be opened with one. Both were supported by the route from
   * the start and neither was wired.
   */
  list(
    filters: { targetType?: string; targetId?: string },
    limit: number,
    offset: number,
  ): Promise<AuditEntry[]> {
    return apiGet<AuditEntry[]>('/v1/admin/audit-log', { ...filters, limit, offset })
  },
}

// ------------------------------------------------------ analytics

const analytics = {
  fetch<T>(dashboard: string, params: Record<string, string | number | undefined>): Promise<T> {
    return apiGet<T>('/v1/admin/analytics', { dashboard, ...params })
  },
}

// ---------------------------------------------------------- users

/**
 * A ban, shaped so its one rule is unstatable rather than documented:
 * **`durationDays: null` means permanent**, and the route requires the field
 * either way, so it is always a choice somebody made rather than a default
 * nobody saw. Same reasoning as `ReportDecision` above.
 */
export interface BanInput {
  readonly durationDays: number | null
  readonly reason: string
}

const users = {
  /** `banned` is a tri-state: `null` is everyone, and the two present values are the two halves. "No filter" is not "not banned". */
  list(
    search: string | undefined,
    banned: boolean | null,
    limit: number,
    offset: number,
  ): Promise<AdminUser[]> {
    return apiGet<AdminUser[]>('/v1/admin/users', {
      search,
      ...(banned === null ? {} : { banned: String(banned) }),
      limit,
      offset,
    })
  },

  /** Ban without a report behind it — for something an admin found themselves. */
  ban(userId: string, input: BanInput): Promise<unknown> {
    return apiPost(`/v1/admin/users/${userId}/ban`, input)
  },

  /**
   * Lift a ban.
   *
   * This route existed from the start and **nothing called it**, which made
   * banning a door that opened and never closed: the console offered "Ban
   * permanently" as one button press and had no path back from any screen.
   * Undoing it meant a database write by hand.
   */
  unban(userId: string, reason: string): Promise<unknown> {
    return apiPost(`/v1/admin/users/${userId}/unban`, { reason })
  },
}

// -------------------------------------------------------- ads

/** Everything an advertiser needs to exist. Matches the route's own required set exactly. */
export interface CreateAdvertiserBody {
  name: string
  legalName: string | null
  tier: AdvertiserTier
  sector: AdSector
  gstNumber: string | null
  billingEmail: string | null
  contactName: string | null
  contactPhone: string | null
  notes: string | null
}

/** Every field optional, because the route patches. Standing changes are separate calls, deliberately — see `suspend` and `archive`. */
export type UpdateAdvertiserBody = Partial<CreateAdvertiserBody>

export interface CreateAdOrderBody {
  advertiserId: string
  name: string
  amountPaise: number
  startsAt: string | null
  endsAt: string | null
  notes: string | null
}

export type UpdateAdOrderBody = Partial<Omit<CreateAdOrderBody, 'advertiserId'>>

export interface CreateCreativeBody {
  advertiserId: string
  title: string
  sponsorName: string
  imageUrl: string
  targetUrl: string
  disclosure: string | null
}

export type UpdateCreativeBody = Partial<Omit<CreateCreativeBody, 'advertiserId'>>

export interface CreateLineItemBody {
  orderId: string
  name: string
  deliveryType: AdDeliveryType
  priority: number
  shareOfVoicePercent: number | null
  targetHubIds: string[] | null
  targetOrgTypes: OrganizationType[] | null
  placements: AdPlacement[]
  category: string | null
  keywords: string[] | null
  minPricePaise: number | null
  maxPricePaise: number | null
  startsAt: string | null
  endsAt: string | null
  notes: string | null
  creativeIds: string[]
}

export type UpdateLineItemBody = Partial<Omit<CreateLineItemBody, 'orderId' | 'creativeIds'>>

/**
 * A status change, shaped the way the route shapes it: the reason is part of
 * the arm rather than an optional field beside it, so a console screen cannot
 * compile a pause with nothing to explain it.
 */
export type LineItemStatusChange =
  | { readonly status: 'DRAFT' }
  | { readonly status: 'SCHEDULED' }
  | { readonly status: 'ACTIVE' }
  | { readonly status: 'PAUSED'; readonly reason: string }
  | { readonly status: 'ARCHIVED'; readonly reason: string }

/** Same idea for review: approving needs no explanation, rejecting always does. */
export type CreativeReviewDecision =
  | { readonly decision: 'APPROVED' }
  | { readonly decision: 'REJECTED'; readonly reason: string }

/**
 * All four ad resources page by cursor rather than offset — unlike every other
 * admin list. That is the routes' own design (Rule 25 cursor pagination), so
 * the console follows it rather than asking the API to change shape.
 */
const advertisers = {
  list(cursor: string | null, filters: { search?: string; tier?: string; includeArchived?: boolean; suspendedOnly?: boolean } = {}, limit = 50) {
    return apiGet<AdvertisersPage>('/v1/admin/advertisers', {
      ...(cursor ? { cursor } : {}),
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.tier ? { tier: filters.tier } : {}),
      ...(filters.includeArchived ? { includeArchived: true } : {}),
      ...(filters.suspendedOnly ? { suspendedOnly: true } : {}),
      limit,
    })
  },

  create(body: CreateAdvertiserBody): Promise<Advertiser> {
    return apiPost<Advertiser>('/v1/admin/advertisers', body)
  },

  update(id: string, body: UpdateAdvertiserBody): Promise<Advertiser> {
    return apiPatch<Advertiser>(`/v1/admin/advertisers/${id}`, body)
  },

  /** `reason` is required going in and ignored coming out, which is what the route's own refinement says. */
  setSuspension(id: string, suspended: boolean, reason: string | null): Promise<Advertiser> {
    return apiPost<Advertiser>(`/v1/admin/advertisers/${id}/suspension`, { suspended, reason })
  },

  archive(id: string, reason: string): Promise<Advertiser> {
    return apiPost<Advertiser>(`/v1/admin/advertisers/${id}/archive`, { reason })
  },
}

const advertiserLedger = {
  get(advertiserId: string, cursor: string | null, limit = 50): Promise<AdvertiserLedgerPage> {
    return apiGet<AdvertiserLedgerPage>(`/v1/admin/advertisers/${advertiserId}/ledger`, {
      ...(cursor ? { cursor } : {}),
      limit,
    })
  },

  /** A payment that arrived, against the reference it arrived with — which is what makes this safe to press twice. */
  credit(advertiserId: string, amountPaise: number, externalReference: string, description: string) {
    return apiPost<AdvertiserLedgerPage>(`/v1/admin/advertisers/${advertiserId}/ledger`, {
      entryType: 'CREDIT',
      amountPaise,
      externalReference,
      description,
    })
  },

  /**
   * Everything a payment reference cannot describe — a goodwill credit, a
   * write-off, a correction. Signed either way, and the only way a mistake in
   * this ledger is ever fixed: the table refuses edits outright, so the
   * correction sits visibly beside what it corrects.
   */
  adjust(advertiserId: string, amountPaise: number, description: string) {
    return apiPost<AdvertiserLedgerPage>(`/v1/admin/advertisers/${advertiserId}/ledger`, {
      entryType: 'ADJUSTMENT',
      amountPaise,
      description,
    })
  },
}

const adOrders = {
  list(cursor: string | null, filters: { advertiserId?: string; includeArchived?: boolean } = {}, limit = 50) {
    return apiGet<AdOrdersPage>('/v1/admin/ad-orders', {
      ...(cursor ? { cursor } : {}),
      ...(filters.advertiserId ? { advertiserId: filters.advertiserId } : {}),
      ...(filters.includeArchived ? { includeArchived: true } : {}),
      limit,
    })
  },

  create(body: CreateAdOrderBody): Promise<AdOrder> {
    return apiPost<AdOrder>('/v1/admin/ad-orders', body)
  },

  update(id: string, body: UpdateAdOrderBody): Promise<AdOrder> {
    return apiPatch<AdOrder>(`/v1/admin/ad-orders/${id}`, body)
  },

  archive(id: string, reason: string): Promise<AdOrder> {
    return apiPost<AdOrder>(`/v1/admin/ad-orders/${id}/archive`, { reason })
  },
}

const creatives = {
  list(cursor: string | null, filters: { advertiserId?: string; reviewStatus?: string; includeArchived?: boolean } = {}, limit = 50) {
    return apiGet<CreativesPage>('/v1/admin/creatives', {
      ...(cursor ? { cursor } : {}),
      ...(filters.advertiserId ? { advertiserId: filters.advertiserId } : {}),
      ...(filters.reviewStatus ? { reviewStatus: filters.reviewStatus } : {}),
      ...(filters.includeArchived ? { includeArchived: true } : {}),
      limit,
    })
  },

  create(body: CreateCreativeBody): Promise<Creative> {
    return apiPost<Creative>('/v1/admin/creatives', body)
  },

  update(id: string, body: UpdateCreativeBody): Promise<Creative> {
    return apiPatch<Creative>(`/v1/admin/creatives/${id}`, body)
  },

  review(id: string, decision: CreativeReviewDecision): Promise<Creative> {
    return apiPost<Creative>(`/v1/admin/creatives/${id}/review`, decision)
  },

  archive(id: string, reason: string): Promise<Creative> {
    return apiPost<Creative>(`/v1/admin/creatives/${id}/archive`, { reason })
  },
}

const adSettings = {
  get(): Promise<AdSettings> {
    return apiGet<AdSettings>('/v1/admin/ad-settings')
  },

  update(body: UpdateAdSettingsBody): Promise<AdSettings> {
    return apiPatch<AdSettings>('/v1/admin/ad-settings', body)
  },

  /**
   * The kill switch, deliberately its own call rather than a field on the
   * patch above. It is the control somebody reaches for in a hurry, it carries
   * a reason, and it must never flip as a side effect of saving a density
   * change.
   */
  setEnabled(enabled: boolean, reason: string | null): Promise<AdSettings> {
    return apiPost<AdSettings>('/v1/admin/ad-settings/enabled', enabled ? { enabled } : { enabled, reason })
  },

  /** One campus's own answer. A reason is required in both directions: "why does this Hub see ads when nobody else does" is as worth answering as the reverse. */
  setHubOverride(hubId: string, adsEnabled: boolean, reason: string): Promise<AdSettings> {
    return apiPut<AdSettings>(`/v1/admin/ad-settings/hubs/${hubId}`, { adsEnabled, reason })
  },

  /** Returns the Hub to following the global setting — deliberately different from setting an override that happens to match it today. */
  clearHubOverride(hubId: string): Promise<AdSettings> {
    return apiDelete<AdSettings>(`/v1/admin/ad-settings/hubs/${hubId}`)
  },
}

/** Every field optional, because the route patches. `blockedSectors` is the whole list, not a delta. */
export interface UpdateAdSettingsBody {
  feedInterleaveInterval?: number
  feedEnabled?: boolean
  searchEnabled?: boolean
  mapEnabled?: boolean
  blockedSectors?: AdSector[]
  minHubListingsForAds?: number
  newUserGraceHours?: number
}

const lineItems = {
  list(
    cursor: string | null,
    filters: { advertiserId?: string; orderId?: string; status?: string; suspendedOnly?: boolean; includeArchived?: boolean } = {},
    limit = 50,
  ) {
    return apiGet<LineItemsPage>('/v1/admin/line-items', {
      ...(cursor ? { cursor } : {}),
      ...(filters.advertiserId ? { advertiserId: filters.advertiserId } : {}),
      ...(filters.orderId ? { orderId: filters.orderId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.suspendedOnly ? { suspendedOnly: true } : {}),
      ...(filters.includeArchived ? { includeArchived: true } : {}),
      limit,
    })
  },

  create(body: CreateLineItemBody): Promise<LineItem> {
    return apiPost<LineItem>('/v1/admin/line-items', body)
  },

  update(id: string, body: UpdateLineItemBody): Promise<LineItem> {
    return apiPatch<LineItem>(`/v1/admin/line-items/${id}`, body)
  },

  setStatus(id: string, change: LineItemStatusChange): Promise<LineItem> {
    return apiPost<LineItem>(`/v1/admin/line-items/${id}/status`, change)
  },

  setSuspension(id: string, suspended: boolean, reason: string | null): Promise<LineItem> {
    return apiPost<LineItem>(`/v1/admin/line-items/${id}/suspension`, { suspended, reason })
  },

  attachCreative(id: string, creativeId: string): Promise<LineItem> {
    return apiPost<LineItem>(`/v1/admin/line-items/${id}/creatives`, { creativeId })
  },

  detachCreative(id: string, creativeId: string): Promise<LineItem> {
    return apiDelete<LineItem>(`/v1/admin/line-items/${id}/creatives/${creativeId}`)
  },
}

// -------------------------------------------------------- content

/** Exactly one of the two, because the route refuses both and neither — a union rather than two optional fields. */
export type RestoreTarget = { readonly listingId: string } | { readonly requestId: string }

const content = {
  /**
   * Put back something a moderator removed.
   *
   * The other half of the pair above: `REMOVE_CONTENT` was offered on every
   * report and this route, which has always existed, was never called. A
   * listing removed in error was gone from its owner's own view with no
   * console path back.
   */
  restore(target: RestoreTarget, reason: string): Promise<unknown> {
    return apiPost('/v1/admin/content/restore', { ...target, reason })
  },
}

/**
 * The whole admin API surface, as one object.
 *
 * Screens import this and nothing else from here: `api.reports.list('OPEN')`
 * reads as what it is, and cannot be shadowed by a local variable the way a
 * bare `reports` import silently was.
 */
export const api = {
  auth,
  reports,
  triage,
  organizations,
  users,
  content,
  advertisers,
  adOrders,
  adSettings,
  advertiserLedger,
  creatives,
  lineItems,
  pricing,
  tiers,
  audit,
  analytics,
}
