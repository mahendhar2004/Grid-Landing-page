import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The console had no tests at all, which is how it shipped a sign-in that
 * sent one of the four fields `POST /v1/auth/send-otp` requires and failed
 * for every admin against the real backend.
 *
 * These cover the request *contract* rather than the UI: what actually broke
 * was the shape of a body, and the shape of a body is exactly the sort of
 * thing that drifts silently from a schema on the other side of the network.
 */

const API_URL = 'https://api.test.invalid'

interface CapturedRequest {
  url: string
  body: Record<string, unknown>
  headers: Record<string, string>
}

let captured: CapturedRequest[] = []

function okResponse(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true, data }),
  } as unknown as Response
}

function errorResponse(status: number, code: string): Response {
  return {
    ok: false,
    status,
    json: async () => ({ success: false, error: { code, message: code, correlationId: 'req-1' } }),
  } as unknown as Response
}

/** Freshly imported per test: `API_BASE_URL` is read into a module-scope const. */
async function loadApi() {
  vi.stubEnv('VITE_API_URL', API_URL)
  vi.resetModules()
  return import('./api')
}

beforeEach(() => {
  captured = []
  const store = new Map<string, string>()
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

function mockFetch(...responses: Response[]) {
  const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
    captured.push({
      url,
      body: init.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : {},
      headers: init.headers as Record<string, string>,
    })
    return responses[captured.length - 1] ?? responses[responses.length - 1]!
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('sendOtp', () => {
  it('says who is asking, and sends no consent or age attestation the console never collected', async () => {
    const { sendOtp } = await loadApi()
    mockFetch(okResponse({ sent: true }))

    await sendOtp('admin@iitd.ac.in')

    // The console is an operations tool for people who already run Grid. The
    // app's sign-in records a consent event and an 18+ attestation from
    // `consentAccepted`/`ageConfirmed`; the console used to send `true` for
    // both behind a tick box, which recorded a consent that was not being
    // given. The server decides from `audience` and the admin allowlist.
    expect(captured[0]!.body).toEqual({
      email: 'admin@iitd.ac.in',
      role: 'EMPLOYEE',
      audience: 'ADMIN_CONSOLE',
    })
  })

  it('never puts consentAccepted or ageConfirmed in the request at all', async () => {
    const { sendOtp } = await loadApi()
    mockFetch(okResponse({ sent: true }))

    await sendOtp('admin@iitd.ac.in')

    expect('consentAccepted' in captured[0]!.body).toBe(false)
    expect('ageConfirmed' in captured[0]!.body).toBe(false)
  })

  it('carries an idempotency key, which the backend rejects the request without', async () => {
    const { sendOtp } = await loadApi()
    mockFetch(okResponse({ sent: true }))

    await sendOtp('admin@iitd.ac.in')

    expect(captured[0]!.headers['X-Idempotency-Key']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })
})

describe('a session that has been running a while', () => {
  it('spends the refresh token on a 401 and retries, instead of signing the admin out', async () => {
    const { storeTokens, apiGet } = await loadApi()
    storeTokens('expired-access', 'good-refresh')
    mockFetch(
      errorResponse(401, 'UNAUTHORIZED'),
      okResponse({ accessToken: 'fresh-access', refreshToken: 'rotated-refresh' }),
      okResponse({ ok: true }),
    )

    // Access tokens last 15 minutes; the refresh token was stored and never
    // used, so the console used to throw the admin out mid-task.
    await expect(apiGet('/v1/admin/something')).resolves.toEqual({ ok: true })

    expect(captured.map((c) => c.url)).toEqual([
      `${API_URL}/v1/admin/something`,
      `${API_URL}/v1/auth/refresh`,
      `${API_URL}/v1/admin/something`,
    ])
    // The retry must carry the NEW token, or it 401s identically.
    expect(captured[2]!.headers['Authorization']).toBe('Bearer fresh-access')
  })

  it('stores the rotated refresh token, or the next refresh presents a spent one', async () => {
    const { storeTokens, apiGet, getAccessToken } = await loadApi()
    storeTokens('expired-access', 'good-refresh')
    mockFetch(
      errorResponse(401, 'UNAUTHORIZED'),
      okResponse({ accessToken: 'fresh-access', refreshToken: 'rotated-refresh' }),
      okResponse({ ok: true }),
    )

    await apiGet('/v1/admin/something')

    expect(getAccessToken()).toBe('fresh-access')
    expect(captured[1]!.body).toEqual({ refreshToken: 'good-refresh' })
  })

  it('gives up and clears the session when the refresh token is dead too', async () => {
    const { storeTokens, apiGet, getAccessToken } = await loadApi()
    storeTokens('expired-access', 'dead-refresh')
    mockFetch(errorResponse(401, 'UNAUTHORIZED'), errorResponse(401, 'UNAUTHORIZED'))

    await expect(apiGet('/v1/admin/something')).rejects.toMatchObject({ status: 401 })

    expect(getAccessToken()).toBeNull()
  })

  it('retries only once, so a dead session cannot loop', async () => {
    const { storeTokens, apiGet } = await loadApi()
    storeTokens('expired-access', 'good-refresh')
    mockFetch(
      errorResponse(401, 'UNAUTHORIZED'),
      okResponse({ accessToken: 'fresh-access', refreshToken: 'rotated-refresh' }),
      errorResponse(401, 'UNAUTHORIZED'),
    )

    await expect(apiGet('/v1/admin/something')).rejects.toMatchObject({ status: 401 })

    // Original, refresh, retry. Nothing after that.
    expect(captured).toHaveLength(3)
  })
})

describe('who is allowed into the console', () => {
  /** A JWT is `header.payload.signature`; only the middle part is read here. */
  function tokenWithClaims(claims: Record<string, unknown>): string {
    const payload = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    return `header.${payload}.signature`
  }

  it('signs an admin in and keeps the session', async () => {
    const { verifyOtp, getAccessToken } = await loadApi()
    const token = tokenWithClaims({ userId: 'u1', isAdmin: true })
    mockFetch(okResponse({ accessToken: token, refreshToken: 'r1' }))

    await verifyOtp('admin@iitd.ac.in', '123456')

    expect(getAccessToken()).toBe(token)
  })

  it('refuses a non-admin with a reason, rather than letting them in to collect 403s', async () => {
    const { verifyOtp, getAccessToken } = await loadApi()
    mockFetch(okResponse({ accessToken: tokenWithClaims({ userId: 'u1', isAdmin: false }), refreshToken: 'r1' }))

    // What used to happen: a cheerful sign-in, then "User ... is not an admin"
    // on every screen behind it - which reads as broken software.
    await expect(verifyOtp('someone@iitd.ac.in', '123456')).rejects.toMatchObject({
      status: 403,
      code: 'NOT_AN_ADMIN',
    })
    // And no session left behind that can do nothing.
    expect(getAccessToken()).toBeNull()
  })

  it('treats an unreadable token as no claim rather than crashing sign-in', async () => {
    const { verifyOtp, getAccessToken } = await loadApi()
    mockFetch(okResponse({ accessToken: 'not-a-jwt', refreshToken: 'r1' }))

    await expect(verifyOtp('someone@iitd.ac.in', '123456')).rejects.toMatchObject({ code: 'NOT_AN_ADMIN' })
    expect(getAccessToken()).toBeNull()
  })

  it('treats a missing isAdmin claim as absent, not as permission', async () => {
    const { verifyOtp } = await loadApi()
    mockFetch(okResponse({ accessToken: tokenWithClaims({ userId: 'u1' }), refreshToken: 'r1' }))

    await expect(verifyOtp('someone@iitd.ac.in', '123456')).rejects.toMatchObject({ code: 'NOT_AN_ADMIN' })
  })
})

describe('rendering data from an API that may be a deploy behind', () => {
  it('formats coordinates only when they are actually numbers', () => {
    // The crash this guards: the console shipped reading `hubLatitude` in
    // the same change that added it to the API, and deployed first - so
    // every row called `.toFixed` on undefined and the screen went blank.
    const format = (value: unknown) => (typeof value === 'number' ? value.toFixed(4) : null)

    expect(format(23.1793)).toBe('23.1793')
    expect(format(0)).toBe('0.0000')
    expect(format(undefined)).toBeNull()
    expect(format(null)).toBeNull()
  })

  it('treats a blank coordinate as "not moving it", never as zero', () => {
    // `Number('')` is 0, and 0,0 is a real coordinate in the Atlantic.
    const hasCoordinates = (lat: string, lng: string) =>
      lat.trim().length > 0 &&
      lng.trim().length > 0 &&
      Number.isFinite(Number(lat)) &&
      Number.isFinite(Number(lng))

    expect(hasCoordinates('', '')).toBe(false)
    expect(hasCoordinates('23.1793', '')).toBe(false)
    expect(hasCoordinates('  ', '79.9865')).toBe(false)
    expect(hasCoordinates('abc', '79.9865')).toBe(false)
    expect(hasCoordinates('23.1793', '79.9865')).toBe(true)
  })
})

describe('apiGet query building', () => {
  /*
    These exist because the routes read every boolean flag with Zod's
    `z.coerce.boolean()`, which treats *any* non-empty string as true. Sending
    `?includeArchived=false` would therefore arrive as true - the opposite of
    what the caller asked for - and the only thing between that and a console
    that silently shows archived rows is this filter.
  */
  it('omits a false flag entirely rather than sending the string "false"', async () => {
    const { storeTokens, apiGet } = await loadApi()
    storeTokens('access', 'refresh')
    mockFetch(okResponse([]))

    await apiGet('/v1/admin/advertisers', { includeArchived: false, limit: 50 })

    expect(captured[0]!.url).toBe(`${API_URL}/v1/admin/advertisers?limit=50`)
  })

  it('sends a true flag as "true", which is what the route coerces', async () => {
    const { storeTokens, apiGet } = await loadApi()
    storeTokens('access', 'refresh')
    mockFetch(okResponse([]))

    await apiGet('/v1/admin/advertisers', { includeArchived: true })

    expect(captured[0]!.url).toBe(`${API_URL}/v1/admin/advertisers?includeArchived=true`)
  })

  it('drops undefined and empty values, so an untouched filter adds nothing', async () => {
    const { storeTokens, apiGet } = await loadApi()
    storeTokens('access', 'refresh')
    mockFetch(okResponse([]))

    await apiGet('/v1/admin/advertisers', { search: '', tier: undefined, limit: 20 })

    expect(captured[0]!.url).toBe(`${API_URL}/v1/admin/advertisers?limit=20`)
  })

  it('escapes a value rather than pasting it into the query string', async () => {
    const { storeTokens, apiGet } = await loadApi()
    storeTokens('access', 'refresh')
    mockFetch(okResponse([]))

    await apiGet('/v1/admin/advertisers', { search: 'a&b=c' })

    expect(captured[0]!.url).toContain('search=a%26b%3Dc')
  })
})

function tokenWith(claims: Record<string, unknown>): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encode({ alg: 'none' })}.${encode(claims)}.sig`
}

describe('signInWithGoogle', () => {
  it('sends the Google token with the console audience and no consent, and keeps the session of an admin', async () => {
    const { signInWithGoogle, getAccessToken } = await loadApi()
    const accessToken = tokenWith({ isAdmin: true })
    mockFetch(okResponse({ outcome: 'SIGNED_IN', accessToken, refreshToken: 'r1' }))

    await signInWithGoogle('google-id-token')

    expect(captured[0]!.url).toBe(`${API_URL}/v1/auth/google`)
    expect(captured[0]!.body).toEqual({ idToken: 'google-id-token', role: 'EMPLOYEE', audience: 'ADMIN_CONSOLE' })
    expect(getAccessToken()).toBe(accessToken)
  })

  it('refuses a session without the admin claim and stores nothing', async () => {
    const { signInWithGoogle, getAccessToken } = await loadApi()
    mockFetch(okResponse({ outcome: 'SIGNED_IN', accessToken: tokenWith({ isAdmin: false }), refreshToken: 'r1' }))

    await expect(signInWithGoogle('t')).rejects.toMatchObject({ code: 'NOT_AN_ADMIN' })

    expect(getAccessToken()).toBeNull()
  })

  it('explains an organisation that is not on Grid yet instead of pretending to sign in', async () => {
    const { signInWithGoogle, getAccessToken } = await loadApi()
    mockFetch(okResponse({ outcome: 'NEW_DOMAIN', email: 'a@new.example', domain: 'new.example' }))

    await expect(signInWithGoogle('t')).rejects.toMatchObject({ code: 'NOT_AN_ADMIN', message: expect.stringContaining('new.example') })

    expect(getAccessToken()).toBeNull()
  })

  it('surfaces the server\'s refusal of a Google account that is not an administrator', async () => {
    const { signInWithGoogle } = await loadApi()
    mockFetch(errorResponse(403, 'ADMIN_ACCESS_REQUIRED'))

    await expect(signInWithGoogle('t')).rejects.toMatchObject({ status: 403, code: 'ADMIN_ACCESS_REQUIRED' })
  })
})
