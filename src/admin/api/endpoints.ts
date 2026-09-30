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
  AdminPlace,
  Advertiser,
  AdvertiserTier,
  AdvertisersPage,
  Creative,
  CreativesPage,
  LineItem,
  LineItemDeliveryReport,
  LineItemsPage,
  AdminReport,
  AdminUser,
  AuditEntry,
  AuthTokens,
  CorrectDomainResult,
  OrganizationDomain,
  OrganizationType,
  AdminMonetizationView,
  PendingReview,
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
      // Who is asking. The server then needs no consent or age attestation
      // (see `lib/api.ts#sendOtp`) and only sends a code to an administrator.
      audience: 'ADMIN_CONSOLE',
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
  reason: string
}

export interface UpdatePlaceBody {
  name?: string
  status?: 'ACTIVE' | 'PENDING_VISIBILITY'
  /** Both or neither — the endpoint refuses one alone, because a new latitude against an old longitude is a place nobody chose. */
  latitude?: number
  longitude?: number
  reason: string
}

const organizations = {
  list(search: string | undefined, limit: number, offset: number): Promise<AdminOrganization[]> {
    checkPage('organizations', limit)
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

  /**
   * The places an organisation occupies (BR-069).
   *
   * A separate call rather than fields on the list row: an organisation is one
   * row there however many offices it has, and its places are fetched when an
   * admin opens it. The pin and the map visibility live here because both are
   * facts about a building — hiding one campus says nothing about the others.
   */
  places: {
    list(organizationId: string): Promise<AdminPlace[]> {
      return apiGet<AdminPlace[]>(`/v1/admin/organizations/${organizationId}/places`)
    },

    update(organizationId: string, placeId: string, body: UpdatePlaceBody): Promise<AdminPlace> {
      return apiPatch<AdminPlace>(
        `/v1/admin/organizations/${organizationId}/places/${placeId}`,
        body,
      )
    },
  },

  /**
   * The domains an organisation is reached by (BR-053, BR-066).
   *
   * Detach is a POST rather than a DELETE because the domain travels in the
   * body: a domain is not a path segment, and a DELETE with a body is a
   * request some intermediaries drop.
   */
  domains: {
    list(organizationId: string): Promise<OrganizationDomain[]> {
      return apiGet<OrganizationDomain[]>(`/v1/admin/organizations/${organizationId}/domains`)
    },

    attach(organizationId: string, domain: string, reason: string): Promise<OrganizationDomain> {
      return apiPost<OrganizationDomain>(`/v1/admin/organizations/${organizationId}/domains`, {
        domain,
        reason,
      })
    },

    detach(organizationId: string, domain: string, reason: string): Promise<unknown> {
      return apiPost(`/v1/admin/organizations/${organizationId}/domains/detach`, { domain, reason })
    },
  },

  /**
   * The review queue (BR-064, BR-065).
   *
   * Two answers only: let it stand, or move it to the right place. There is no
   * reject — a verified address proves the member belongs to *some*
   * organisation, and the realistic failure is a wrong pick from a list.
   */
  review: {
    list(limit: number): Promise<PendingReview[]> {
      return apiGet<PendingReview[]>('/v1/admin/organizations/review', { limit })
    },

    confirm(domain: string, reason: string): Promise<unknown> {
      return apiPost('/v1/admin/organizations/review/confirm', { domain, reason })
    },

    /**
     * `targetHubId` is required by the server, not defaulted (Grid BR-076):
     * nothing about "this domain belongs to Foo College" says which campus,
     * and this moves every member of the domain.
     */
    correct(
      domain: string,
      targetOrganizationId: string,
      targetHubId: string,
      reason: string,
    ): Promise<CorrectDomainResult> {
      return apiPost<CorrectDomainResult>('/v1/admin/organizations/review/correct', {
        domain,
        targetOrganizationId,
        targetHubId,
        reason,
      })
    },
  },
}

// ---------------------------------------------------- monetization

/** What one use of a feature costs, per kind of organisation. Every field required: the route replaces the row rather than merging into it. */
export interface SetFeaturePriceBody {
  featureKey: string
  orgType: OrganizationType
  /** The flag that makes a feature paid. Turning it on with nothing to charge is refused server-side, because "paid, free" reads as free to every member. */
  isPaid: boolean
  basePricePaise: number
  discountPaise: number
}

/**
 * One cell of the plan x feature matrix.
 *
 * Every field is required and nullable rather than optional, for the reason
 * `ReportDecision` above is a union: "leave the grant alone" and "this plan
 * grants nothing" are different intentions, and an optional field spells them
 * the same way. The route replaces the cell, so the caller states all of it.
 *
 * Which fields may be non-null depends on the feature's own model, and the
 * server checks that: a quantity on a perk is a configuration that cannot mean
 * anything, and a refused save beats a benefit that silently does nothing.
 */
export interface SetPlanFeatureBody {
  planKey: string
  featureKey: string
  included: boolean
  /** Null with `included` means unlimited, which is not the same as zero. */
  includedQuantity: number | null
  discountPercent: number
  settingValue: number | null
  grantPaise: number | null
}

/**
 * The two endpoints that replaced four.
 *
 * `/v1/admin/pricing` and `/v1/admin/tiers` are gone: the tier route took a
 * fixed body with a field per entitlement, so adding a feature meant a schema
 * change, a console form field and a deploy of both. These write one cell at a
 * time against a view the server builds from its feature registry, so a new
 * feature needs neither.
 */
const monetization = {
  /** Every feature and every plan in one call — the whole screen's data. */
  get(): Promise<AdminMonetizationView> {
    return apiGet<AdminMonetizationView>('/v1/admin/monetization')
  },

  setFeaturePrice(body: SetFeaturePriceBody): Promise<unknown> {
    return apiPut('/v1/admin/monetization/features', body)
  },

  setPlanFeature(body: SetPlanFeatureBody): Promise<unknown> {
    return apiPut('/v1/admin/monetization/plan-features', body)
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
  /**
   * The member directory. Every filter is applied by the server, so a page of
   * fifty is fifty of the *matching* members and "load more" pages through the
   * same filtered set.
   *
   * `banned` is a tri-state: `null` is everyone, and the two present values are
   * the two halves. "No filter" is not "not banned". `reported` follows the same
   * rule.
   */
  list(
    filters: {
      readonly search?: string | undefined
      readonly banned: boolean | null
      readonly organizationId?: string | undefined
      readonly reported?: boolean | undefined
      readonly sort?: 'newest' | 'oldest' | 'reports' | 'listings' | 'name' | undefined
    },
    limit: number,
    offset: number,
  ): Promise<AdminUser[]> {
    return apiGet<AdminUser[]>('/v1/admin/users', {
      search: filters.search,
      ...(filters.banned === null ? {} : { banned: String(filters.banned) }),
      organizationId: filters.organizationId,
      ...(filters.reported === undefined ? {} : { reported: String(filters.reported) }),
      sort: filters.sort,
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
  bookedAmountPaise: number
  impressionGoal: number | null
  frequencyCapPerDay: number | null
  paced: boolean
  competitiveLabel: string | null
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
/**
 * The most each list route will return in one page (its own `limit` schema).
 * A request over it is a 400, and a caller that swallows the error reports an
 * empty list as an empty queue - which is how the Action Centre showed "nothing
 * waiting" for ad creatives that were. The methods below refuse an impossible
 * limit loudly, at the call site, instead of letting the server do it.
 */
export const MAX_PAGE = { advertisers: 50, creatives: 50, organizations: 100 } as const

function checkPage(route: keyof typeof MAX_PAGE, limit: number): void {
  if (limit > MAX_PAGE[route]) {
    throw new Error(`The ${route} route returns at most ${MAX_PAGE[route]} per page; asked for ${limit}. Page through it (lib/fetchAll.ts).`)
  }
}

const advertisers = {
  list(cursor: string | null, filters: { search?: string; tier?: string; includeArchived?: boolean; suspendedOnly?: boolean } = {}, limit = 50) {
    checkPage('advertisers', limit)
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
    checkPage('creatives', limit)
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

  /** What it has delivered, against what it was sold — the report an advertiser is sent until phase 4 lets them read it themselves. */
  delivery(id: string, days = 30): Promise<LineItemDeliveryReport> {
    return apiGet<LineItemDeliveryReport>(`/v1/admin/line-items/${id}/delivery`, { days })
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
  monetization,
  audit,
  analytics,
}
