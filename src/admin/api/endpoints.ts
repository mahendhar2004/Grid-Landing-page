import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../lib/api'
import type {
  AdminOrganization,
  AdminReport,
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

const reports = {
  list(status: ReportStatus, limit = 100): Promise<AdminReport[]> {
    return apiGet<AdminReport[]>('/v1/admin/reports', { status, limit })
  },

  dismiss(reportId: string, reason: string): Promise<unknown> {
    return apiPost(`/v1/admin/reports/${reportId}/dismiss`, { reason })
  },

  act(reportId: string, decision: ReportDecision, reason: string): Promise<unknown> {
    return apiPost(`/v1/admin/reports/${reportId}/action`, { ...decision, reason })
  },
}

// ----------------------------------------------------------- triage

const triage = {
  list(inbox: TriageInbox, limit = 100): Promise<TriageItem[]> {
    return apiGet<TriageItem[]>('/v1/admin/triage', { inbox, limit })
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
  list(search?: string, limit = 100): Promise<AdminOrganization[]> {
    return apiGet<AdminOrganization[]>('/v1/admin/organizations', { search, limit })
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
  list(limit = 200): Promise<AuditEntry[]> {
    return apiGet<AuditEntry[]>('/v1/admin/audit-log', { limit })
  },
}

// ------------------------------------------------------ analytics

const analytics = {
  fetch<T>(dashboard: string, params: Record<string, string | number | undefined>): Promise<T> {
    return apiGet<T>('/v1/admin/analytics', { dashboard, ...params })
  },
}

/**
 * The whole admin API surface, as one object.
 *
 * Screens import this and nothing else from here: `api.reports.list('OPEN')`
 * reads as what it is, and cannot be shadowed by a local variable the way a
 * bare `reports` import silently was.
 */
export const api = { auth, reports, triage, organizations, pricing, tiers, audit, analytics }
