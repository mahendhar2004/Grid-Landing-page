/**
 * The marketing site's own client for the Grid v2 backend's four public
 * endpoints - the forms and the testimonial strip.
 *
 * Deliberately *not* `src/admin/lib/api.ts`. That client carries a bearer
 * token out of `sessionStorage` and lives in the admin bundle; importing it
 * here would pull admin code into the public entry and, worse, would attach
 * an admin's token to an unauthenticated request the moment someone with a
 * live console session visited the homepage. These endpoints take no
 * identity at all, so this client sends none.
 *
 * Every call is `Promise<T>` or throws. There is nothing to retry and no
 * correlation ID to surface to a visitor - the pages catch and show their
 * own message, exactly as they did with Supabase.
 */

const API_BASE_URL: string = import.meta.env['VITE_API_URL'] ?? ''

/** Mirrors `supabase`'s own null-when-unconfigured contract: the marketing pages must still render without a form backend. */
export const isApiConfigured: boolean = API_BASE_URL.length > 0

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isApiConfigured) {
    throw new Error('VITE_API_URL is not set for this build.')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })

  if (!response.ok) {
    // The backend's Rule 22 envelope. Falling back to the status text
    // matters: a 502 from API Gateway has no envelope at all, and
    // `body.error.message` on it would read "undefined" to the visitor.
    const body = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null
    throw new Error(body?.error?.message ?? `Request failed (${response.status}).`)
  }

  return (await response.json()) as T
}

export interface PublicTestimonial {
  id: string
  reviewerName: string
  college: string | null
  rating: number
  feedback: string
}

/** Featured, approved reviews - whatever the console's Reviews inbox has featured. */
export function getTestimonials(): Promise<PublicTestimonial[]> {
  return request<PublicTestimonial[]>('/v1/public/testimonials')
}

export function submitContactMessage(input: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<{ id: string }> {
  return request<{ id: string }>('/v1/public/contact', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function submitReview(input: {
  reviewerName: string
  reviewerEmail: string
  college: string | null
  rating: number
  feedback: string
}): Promise<{ id: string }> {
  return request<{ id: string }>('/v1/public/review', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export type BugCategory =
  | 'crash'
  | 'ui_bug'
  | 'performance'
  | 'payment_issue'
  | 'chat_issue'
  | 'feature_request'
  | 'other'

export type BugSeverity = 'low' | 'medium' | 'high' | 'critical'

export function submitBugReport(input: {
  title: string
  description: string
  category: BugCategory
  severity: BugSeverity
  imageKeys: string[]
  reporterName?: string | null
  reporterEmail?: string | null
}): Promise<{ id: string }> {
  return request<{ id: string }>('/v1/public/bug-report', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export interface PresignedUpload {
  uploadUrl: string
  fields: Record<string, string>
  key: string
  cdnUrl: string
}

/**
 * One S3 upload target for one screenshot. The backend rate limits this by
 * IP *before* minting the URL, so a caller cannot mint a hundred of them.
 */
export function getBugReportUploadTarget(contentType: string): Promise<PresignedUpload> {
  return request<PresignedUpload>('/v1/public/bug-reports/presigned-url', {
    method: 'POST',
    body: JSON.stringify({ contentType }),
  })
}

/**
 * Upload to the presigned POST target. Not `request()`: this goes straight
 * to S3, not to our API - it sends multipart form data (never JSON), the
 * field order matters (the policy fields must precede the file), and a
 * success is a bare 204 with no body to parse.
 */
export async function uploadToPresignedTarget(
  target: PresignedUpload,
  file: File,
): Promise<string> {
  const formData = new FormData()
  for (const [name, value] of Object.entries(target.fields)) {
    formData.append(name, value)
  }
  formData.append('file', file)

  const response = await fetch(target.uploadUrl, { method: 'POST', body: formData })
  if (!response.ok) {
    throw new Error(`Screenshot upload failed (${response.status}).`)
  }

  // The *key*, not the CDN URL: `/v1/public/bug-report` validates that every
  // entry sits under the `public-bug-reports/` prefix, and a full URL would
  // fail that check.
  return target.key
}
