import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { setTheme } from './theme'

describe('setTheme', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    })
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('dark')
  })
  afterEach(() => vi.unstubAllGlobals())

  it('flips the attribute the design tokens read, and the class older markup reads', () => {
    setTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    setTheme('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('remembers the choice for next time', () => {
    setTheme('dark')

    expect(localStorage.getItem('grid-console-theme')).toBe('dark')
  })

  it('still switches when storage is blocked', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('blocked')
      },
    })

    expect(() => setTheme('dark')).not.toThrow()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('fades the colours while switching, then stops so hovers are not slowed down afterwards', () => {
    vi.useFakeTimers()
    setTheme('dark')
    expect(document.documentElement.classList.contains('theme-switching')).toBe(true)

    vi.advanceTimersByTime(400)
    expect(document.documentElement.classList.contains('theme-switching')).toBe(false)
    vi.useRealTimers()
  })
})
