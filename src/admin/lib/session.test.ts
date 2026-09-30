import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SESSION_MAX_MS, clearTokens, getAccessToken, getRefreshToken, storeTokens } from './session'

const HOUR = 60 * 60 * 1000
const T0 = 1_800_000_000_000

let store: Map<string, string>

beforeEach(() => {
  store = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  })
})
afterEach(() => vi.unstubAllGlobals())

describe('the console session', () => {
  it('is 24 hours', () => {
    expect(SESSION_MAX_MS).toBe(24 * HOUR)
  })

  it('is still there after a refresh, a new tab or a restart, which is only a read from storage', () => {
    storeTokens('access-1', 'refresh-1', true, T0)

    // A page reload starts with nothing in memory and asks storage again.
    expect(getAccessToken(T0 + 40 * 60 * 1000)).toBe('access-1')
    expect(getRefreshToken(T0 + 5 * HOUR)).toBe('refresh-1')
  })

  it('lasts a working day, and up to the last minute of it', () => {
    storeTokens('access-1', 'refresh-1', true, T0)

    expect(getAccessToken(T0 + 23 * HOUR + 59 * 60 * 1000)).toBe('access-1')
  })

  it('ends at 24 hours and deletes what it held, rather than merely ignoring it', () => {
    storeTokens('access-1', 'refresh-1', true, T0)

    expect(getAccessToken(T0 + 24 * HOUR)).toBeNull()
    expect(getRefreshToken(T0 + 24 * HOUR)).toBeNull()
    expect(store.size).toBe(0)
  })

  it('does not stretch the day when the tokens are renewed, because the renewal belongs to the same session', () => {
    storeTokens('access-1', 'refresh-1', true, T0)

    // A refresh rotates both tokens 23 hours in.
    storeTokens('access-2', 'refresh-2', false, T0 + 23 * HOUR)

    expect(getAccessToken(T0 + 23 * HOUR + 30 * 60 * 1000)).toBe('access-2')
    expect(getAccessToken(T0 + 24 * HOUR + 1)).toBeNull()
  })

  it('starts a new day at the next sign-in', () => {
    storeTokens('access-1', 'refresh-1', true, T0)
    storeTokens('access-9', 'refresh-9', true, T0 + 20 * HOUR)

    expect(getAccessToken(T0 + 40 * HOUR)).toBe('access-9')
  })

  it('treats tokens with no sign-in time as signed out and clears them, so an old build\'s leftovers never revive', () => {
    store.set('grid-console-access-token', 'stale')
    store.set('grid-console-refresh-token', 'stale')

    expect(getAccessToken(T0)).toBeNull()
    expect(store.size).toBe(0)
  })

  it('signs out at once when asked', () => {
    storeTokens('access-1', 'refresh-1', true, T0)

    clearTokens()

    expect(getAccessToken(T0 + 1)).toBeNull()
    expect(store.size).toBe(0)
  })

  it('is signed out, not crashed, when storage is blocked', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    })

    expect(() => storeTokens('a', 'r', true, T0)).not.toThrow()
    expect(getAccessToken(T0)).toBeNull()
  })
})
