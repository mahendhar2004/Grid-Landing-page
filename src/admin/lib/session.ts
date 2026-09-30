/**
 * Where the console keeps who is signed in, and for how long.
 *
 * **A session lasts 24 hours from sign-in, and survives a refresh, a new tab and
 * a browser restart in that time.** The tokens live in `localStorage` next to
 * the moment of sign-in; once 24 hours have passed they are deleted, not just
 * ignored, so an expired session leaves nothing behind in storage. Signing out
 * deletes them at once, in every tab.
 *
 * It used to be `sessionStorage`, which is gone when the tab closes and is not
 * shared with a second tab, so opening the console in a new tab, or refreshing
 * after the browser restarted, meant signing in again. That was chosen because
 * the console can ban people and change prices, and a token that outlives the
 * tab is a longer window than that access strictly needs. The owner asked for a
 * day instead: long enough to work without being asked again, still a hard end.
 * What keeps the window short is the same as before: the access token itself
 * lives 15 minutes and is renewed from the refresh token, and every admin route
 * still checks the admin claim on the server for every request.
 *
 * This limit is the console's own courtesy, not a security boundary: the server
 * decides what a token may do, and a refresh token lives for 30 days there.
 */

const ACCESS_TOKEN_KEY = 'grid-console-access-token'
const REFRESH_TOKEN_KEY = 'grid-console-refresh-token'
const SIGNED_IN_AT_KEY = 'grid-console-signed-in-at'

export const SESSION_MAX_MS = 24 * 60 * 60 * 1000

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    // Private mode, or storage blocked. Treated as signed out rather than
    // crashing the whole console on a storage read.
    return null
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Nothing to do: the session simply will not survive a reload.
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(SIGNED_IN_AT_KEY)
  } catch {
    // Already gone, or storage unavailable.
  }
}

/** True while the session is inside its 24 hours. An expired or unreadable one is deleted on the way. */
function alive(now: number): boolean {
  const signedInAt = Number(read(SIGNED_IN_AT_KEY))
  if (Number.isFinite(signedInAt) && signedInAt > 0 && now - signedInAt < SESSION_MAX_MS) {
    return true
  }
  if (read(ACCESS_TOKEN_KEY) !== null || read(REFRESH_TOKEN_KEY) !== null || read(SIGNED_IN_AT_KEY) !== null) {
    clearTokens()
  }
  return false
}

export function getAccessToken(now: number = Date.now()): string | null {
  return alive(now) ? read(ACCESS_TOKEN_KEY) : null
}

export function getRefreshToken(now: number = Date.now()): string | null {
  return alive(now) ? read(REFRESH_TOKEN_KEY) : null
}

/**
 * Keep the tokens. `fresh` is a sign-in, which starts the 24-hour clock; a
 * refresh rotates the tokens inside the session it belongs to and leaves that
 * clock alone, so renewing cannot stretch the day.
 */
export function storeTokens(accessToken: string, refreshToken: string, fresh = false, now: number = Date.now()): void {
  const started = fresh ? null : Number(read(SIGNED_IN_AT_KEY))
  write(ACCESS_TOKEN_KEY, accessToken)
  write(REFRESH_TOKEN_KEY, refreshToken)
  write(SIGNED_IN_AT_KEY, String(started !== null && Number.isFinite(started) && started > 0 ? started : now))
}
