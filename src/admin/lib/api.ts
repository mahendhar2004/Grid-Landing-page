/**
 * The console's only way to reach the Grid API.
 *
 * Every call goes through here so that three things are true in exactly one
 * place: the base URL, the bearer token, and how a failure becomes an error
 * a screen can show.
 *
 * **The secret path this console is served from is not authentication.** It
 * is a first layer that keeps the console out of the public bundle and out of
 * casual reach; the real boundary is this token plus the server's own
 * `requireAdmin`, which 403s every one of these routes for a non-admin
 * regardless of how the page was found.
 */

/** Set per environment at build time. No default that would silently point staging at production. */
const API_BASE_URL: string = import.meta.env['VITE_API_URL'] ?? '';

import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from './session'

// The session (tokens and their 24-hour limit) lives in `session.ts`;
// re-exported so screens keep one import for everything about the API.
export { clearTokens, getAccessToken, storeTokens }

/**
 * An API failure, carrying enough to act on.
 *
 * `code` and `correlationId` come from the backend's own error envelope
 * (Rule 22). The correlation id is the whole reason a screen shows it: it is
 * what turns "something went wrong" into a line someone can find in
 * CloudWatch without reproducing the request.
 */
export class ApiError extends Error {
  // Declared and assigned separately rather than as constructor parameter
  // properties: this project builds with `erasableSyntaxOnly`, which rejects
  // the shorthand because it emits real code rather than only erasing types.
  readonly status: number
  readonly code: string
  readonly correlationId: string | null

  constructor(status: number, code: string, message: string, correlationId: string | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.correlationId = correlationId
  }
}

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  error?: { code?: string; message?: string; correlationId?: string }
}

/**
 * `crypto.randomUUID` needs a secure context. The console is served over
 * https, so the fallback is for the one case that would otherwise fail
 * confusingly - someone opening the built site over plain http locally - and
 * uses `getRandomValues`, which has no such requirement, rather than
 * `Math.random`.
 */
function newIdempotencyKey(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/**
 * Trade the refresh token for a new access token.
 *
 * The refresh token was being *stored* and never used. Access tokens last
 * 15 minutes (`ACCESS_TOKEN_EXPIRY_MINUTES`), so a quarter of an hour into
 * any sitting the console started 401ing, cleared the session and dropped
 * the admin back to the sign-in form mid-task - with a perfectly valid
 * 30-day refresh token sitting in storage the whole time.
 *
 * Returns the new access token, or null when the refresh token is gone or
 * itself expired - in which case signing in again is genuinely the answer.
 *
 * Deliberately not routed through `request` below: that would recurse on its
 * own 401 handling, and this call has no access token to attach anyway.
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken || !API_BASE_URL) {
    return null;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': newIdempotencyKey() },
      body: JSON.stringify({ refreshToken }),
    });
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<{
      accessToken: string
      refreshToken: string
    }> | null;
    const tokens = payload?.success === true ? payload.data : undefined;
    if (!response.ok || !tokens) {
      return null;
    }
    // The backend rotates the refresh token, so both have to be stored or the
    // next refresh presents one that has already been spent.
    storeTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit = {}, isRetry = false): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(0, 'CONFIG_MISSING', 'VITE_API_URL is not set for this build.', null)
  }

  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  // The backend requires `X-Idempotency-Key` (a UUID) on every mutating
  // route - `lib/idempotency.ts` rejects the request outright without one,
  // which is why signing in failed with "A valid X-Idempotency-Key header
  // (UUID) is required for this request." on /v1/auth/send-otp. The mobile
  // client has always sent one; this console never did.
  //
  // A fresh key per call, not a stable one: the point is that a *retry* of
  // the same intent is collapsed, and every call from here is a new intent -
  // a caller that genuinely needs to retry safely can pass its own header in
  // `init`, which this leaves alone.
  const method = (init.method ?? 'GET').toUpperCase()
  if (method !== 'GET' && method !== 'HEAD' && !headers['X-Idempotency-Key']) {
    headers['X-Idempotency-Key'] = newIdempotencyKey()
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch {
    // A network failure is not a 500 - saying so would send someone looking
    // at server logs for a problem that never reached the server.
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the API. Check your connection.', null)
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok || !payload?.success) {
    if (response.status === 401 && !isRetry) {
      // Expired, most likely, rather than revoked - so try the refresh token
      // before throwing the admin out. Once only: `isRetry` stops a
      // genuinely dead session from looping.
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        return request<T>(path, init, true)
      }
    }
    if (response.status === 401) {
      // Refresh failed or this was already the retry. Clearing here rather
      // than at the call site means every screen gets the same behaviour
      // without remembering to ask for it.
      clearTokens()
    }
    throw new ApiError(
      response.status,
      payload?.error?.code ?? 'UNKNOWN',
      payload?.error?.message ?? `Request failed with ${response.status}.`,
      payload?.error?.correlationId ?? null,
    )
  }

  return payload.data as T
}

export function apiGet<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const search = Object.entries(params)
    /*
      `false` is dropped, not sent as "false".

      The routes read these with Zod's `z.coerce.boolean()`, which treats any
      non-empty string as true - so `?includeArchived=false` would arrive as
      **true**, the exact opposite of what the caller asked for. Every one of
      those flags is declared `.default(false)` on the route, so absence is
      already the correct way to say false, and this makes that the contract
      rather than something each call site has to remember.
    */
    .filter(([, value]) => value !== undefined && value !== '' && value !== false)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
  return request<T>(search ? `${path}?${search}` : path)
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

/** Carries a body, unlike most DELETEs: every destructive admin action requires a reason for the audit log. */
/** The body is optional: some deletes name their target entirely in the path, and sending `undefined` as a JSON body would be sending the string "undefined". */
export function apiDelete<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'DELETE',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
}

/** A full replacement, not a merge - `PUT /v1/admin/monetization/plan-features` stores the cell it is given, so a field left out is a field set to nothing rather than one left alone. */
export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
}

/**
 * Sends the six-digit code. Unauthenticated - it is how a session starts.
 *
 * **No consent and no age attestation are sent, and that is the point.** The
 * app's sign-in records a consent event and an 18+ attestation for the address,
 * so the console used to show the same tick box to open an operations tool -
 * which is not a member accepting the Terms, and recorded a consent that was not
 * really being given. `audience: 'ADMIN_CONSOLE'` tells the server who is
 * asking; it then sends a code only if the address is on the administrator
 * allowlist (and answers identically, sending nothing, if it is not, so the
 * endpoint cannot be used to find out who the administrators are).
 *
 * **`role` is only read when an account is created**, so for an admin - who by
 * definition already has an account - it has no effect. `EMPLOYEE` is sent
 * because in the one case where it would be used, someone signing into the
 * operations console is staff.
 */
export function sendOtp(email: string): Promise<unknown> {
  return apiPost('/v1/auth/send-otp', {
    email,
    role: 'EMPLOYEE',
    audience: 'ADMIN_CONSOLE',
  })
}

export interface VerifyOtpResponse {
  accessToken: string
  refreshToken: string
}

/**
 * Whether the issued token carries the admin claim.
 *
 * **This is not a security check and must never be treated as one.** The
 * claim is inside a signature this cannot verify, and every admin route
 * checks it server-side on every request regardless. Reading it here buys
 * exactly one thing: an honest message.
 *
 * Without it, a non-admin signed in perfectly happily and then met
 * *"User ... is not an admin; GET /v1/admin/reports requires admin access"*
 * on a screen that had already welcomed them in - which reads as the console
 * being broken rather than as the account not having access. The worst a
 * tampered token can achieve against this is showing someone a console shell
 * that 403s on everything, which is precisely what happens today anyway.
 */
function tokenHasAdminClaim(accessToken: string): boolean {
  try {
    const payload = accessToken.split('.')[1]
    if (!payload) {
      return false
    }
    // base64url -> base64, then pad. `atob` rejects the url-safe alphabet.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const claims = JSON.parse(atob(padded)) as { isAdmin?: unknown }
    return claims.isAdmin === true
  } catch {
    // Unparseable. Treated as "no claim" rather than crashing sign-in - the
    // server is still the thing that decides, and it will say no too.
    return false
  }
}

export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  const tokens = await apiPost<VerifyOtpResponse>('/v1/auth/verify-otp', { email, otp })

  if (!tokenHasAdminClaim(tokens.accessToken)) {
    // Refuse the session rather than storing it. Keeping a valid non-admin
    // token here would leave a signed-in state that can do nothing, which is
    // a worse thing to hand someone than a clear refusal.
    clearTokens()
    throw new ApiError(
      403,
      'NOT_AN_ADMIN',
      'That account does not have console access. Ask an existing admin to add it.',
      null,
    )
  }

  storeTokens(tokens.accessToken, tokens.refreshToken, true)
  return tokens
}

/** What `POST /v1/auth/google` answers: a session, or "that address's organisation is not on Grid yet". */
type GoogleSignInResponse =
  | ({ outcome: 'SIGNED_IN' } & VerifyOtpResponse)
  | { outcome: 'NEW_DOMAIN'; email: string; domain: string }

/**
 * Signs in with a Google ID token from Google Identity Services.
 *
 * The server verifies the token's signature, audience and that Google hosts
 * the address, and for the console it also requires the address to be on the
 * administrator allowlist; a Google account that is not one is refused there
 * with a 403, before any account work. Like `verifyOtp`, a session without the
 * admin claim is refused here with a message rather than stored.
 */
export async function signInWithGoogle(idToken: string): Promise<VerifyOtpResponse> {
  const result = await apiPost<GoogleSignInResponse>('/v1/auth/google', {
    idToken,
    role: 'EMPLOYEE',
    audience: 'ADMIN_CONSOLE',
  })

  if (result.outcome !== 'SIGNED_IN') {
    throw new ApiError(
      403,
      'NOT_AN_ADMIN',
      `${result.domain} is not on Grid yet, so that account cannot have console access.`,
      null,
    )
  }
  if (!tokenHasAdminClaim(result.accessToken)) {
    clearTokens()
    throw new ApiError(403, 'NOT_AN_ADMIN', 'That account does not have console access. Ask an existing admin to add it.', null)
  }

  storeTokens(result.accessToken, result.refreshToken, true)
  return { accessToken: result.accessToken, refreshToken: result.refreshToken }
}
