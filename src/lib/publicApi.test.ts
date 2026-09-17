import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The marketing site's own backend client.
 *
 * It exists separately from `src/admin/lib/api.ts` on purpose - that one
 * carries a bearer token and belongs in the admin bundle - and that
 * separation is exactly how the two drifted: the admin client unwrapped the
 * API's `{ success, data }` envelope and this one did not, so
 * `getTestimonials()` returned an object where the homepage expected an array
 * and threw "reduce is not a function" on the live site. These tests are
 * about the envelope, because that is the part the two clients have to agree
 * on and nothing else was checking.
 */

const API_URL = 'https://api.example.com'

async function loadClient() {
  vi.resetModules()
  vi.stubEnv('VITE_API_URL', API_URL)
  return import('./publicApi')
}

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response
}

describe('publicApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('unwraps the success envelope rather than handing back the whole body', async () => {
    const testimonials = [{ id: 'r1', reviewerName: 'Asha', college: null, rating: 5, feedback: 'Good' }]
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { success: true, data: testimonials }))
    const { getTestimonials } = await loadClient()

    await expect(getTestimonials()).resolves.toEqual(testimonials)
  })

  it('returns a real empty array for an empty result, not an envelope around one', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { success: true, data: [] }))
    const { getTestimonials } = await loadClient()

    // The bug was worst here: `{success,data:[]}` has no `.length`, so the
    // homepage's own "nothing featured yet" guard did not catch it and the
    // page threw instead of rendering nothing.
    await expect(getTestimonials()).resolves.toEqual([])
  })

  it('rejects a 200 that is not a success envelope, rather than passing the shape on', async () => {
    // A proxy, a cached error page, a redirect to HTML. Handing it on means
    // every caller fails further away, on a shape it cannot explain.
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { totally: 'different' }))
    const { getTestimonials } = await loadClient()

    await expect(getTestimonials()).rejects.toThrow(/does not recognise/)
  })

  it("surfaces the backend's own error message on a failure", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(422, { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email looks wrong.' } }),
    )
    const { submitContactMessage } = await loadClient()

    await expect(
      submitContactMessage({ name: 'A', email: 'x', subject: 'S', message: 'M' }),
    ).rejects.toThrow('Email looks wrong.')
  })

  it('falls back to the status when a failure has no envelope at all', async () => {
    // A 502 from API Gateway has no envelope, and reading `error.message` off
    // it would show the visitor the word "undefined".
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error('not json')),
    } as unknown as Response)
    const { getTestimonials } = await loadClient()

    await expect(getTestimonials()).rejects.toThrow('Request failed (502).')
  })

  it('refuses to call anything when the build has no API URL', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_API_URL', '')
    const { getTestimonials, isApiConfigured } = await import('./publicApi')

    expect(isApiConfigured).toBe(false)
    await expect(getTestimonials()).rejects.toThrow(/VITE_API_URL/)
    expect(fetch).not.toHaveBeenCalled()
  })
})
