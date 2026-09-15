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

/**
 * Where the tokens live.
 *
 * `sessionStorage`, not `localStorage`: an admin session should not outlive
 * the tab. The console can ban users and change prices, and a token that
 * survives closing the browser on a shared or borrowed machine is a longer
 * window than that access deserves. The cost is re-authenticating once per
 * session, which for a tool used in deliberate sittings is the right trade.
 */
const ACCESS_TOKEN_KEY = 'grid-console-access-token';
const REFRESH_TOKEN_KEY = 'grid-console-refresh-token';

export function getAccessToken(): string | null {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    // Private mode, or storage blocked. Treated as signed out rather than
    // crashing the whole console on a storage read.
    return null;
  }
}

export function storeTokens(accessToken: string, refreshToken: string): void {
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    // Nothing to do: the session simply will not survive a reload.
  }
}

export function clearTokens(): void {
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Already gone, or storage unavailable.
  }
}

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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    if (response.status === 401) {
      // The token is gone or expired. Clearing it here rather than at the
      // call site means every screen gets the same behaviour without
      // remembering to ask for it.
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

export function apiGet<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const search = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
  return request<T>(search ? `${path}?${search}` : path)
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
}

/** A full replacement, not a merge - `PUT /v1/admin/tiers/{tier}` requires every entitlement in the body, and omitting one is a validation error rather than "leave that field alone". */
export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
}

/** Sends the six-digit code. Unauthenticated - it is how a session starts. */
export function sendOtp(email: string): Promise<unknown> {
  return apiPost('/v1/auth/send-otp', { email })
}

export interface VerifyOtpResponse {
  accessToken: string
  refreshToken: string
}

export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  const tokens = await apiPost<VerifyOtpResponse>('/v1/auth/verify-otp', { email, otp })
  storeTokens(tokens.accessToken, tokens.refreshToken)
  return tokens
}
