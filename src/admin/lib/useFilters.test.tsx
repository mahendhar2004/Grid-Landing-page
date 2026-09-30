import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useFilters } from './useFilters'

const DEFAULTS = { q: '', org: 'all', sort: 'newest' }

describe('useFilters', () => {
  beforeEach(() => {
    window.location.hash = ''
  })
  afterEach(() => {
    cleanup()
  })

  it('starts at the defaults with nothing active and a clean address', () => {
    const { result } = renderHook(() => useFilters('users', DEFAULTS))

    expect(result.current.values).toEqual(DEFAULTS)
    expect(result.current.active).toEqual([])
    expect(window.location.hash).toBe('')
  })

  it('reads its filters from the address, ignoring keys it does not have', () => {
    window.location.hash = '#users?org=org_1&bogus=1'
    const { result } = renderHook(() => useFilters('users', DEFAULTS))

    expect(result.current.values).toEqual({ ...DEFAULTS, org: 'org_1' })
    expect(result.current.active).toEqual(['org'])
  })

  it('does not read another screen\'s filters', () => {
    window.location.hash = '#reports?org=org_1'
    const { result } = renderHook(() => useFilters('users', DEFAULTS))

    expect(result.current.values.org).toBe('all')
  })

  it('writes only the values that differ from their default', () => {
    window.location.hash = '#users'
    const { result } = renderHook(() => useFilters('users', DEFAULTS))

    act(() => result.current.set('org', 'org_1'))
    expect(window.location.hash).toBe('#users?org=org_1')
    expect(result.current.values.org).toBe('org_1')

    act(() => result.current.set('org', 'all'))
    expect(window.location.hash).toBe('#users')
  })

  it('clears one filter, or all of them', () => {
    window.location.hash = '#users?q=asha&org=org_1'
    const { result } = renderHook(() => useFilters('users', DEFAULTS))

    act(() => result.current.clear('q'))
    expect(result.current.values).toEqual({ ...DEFAULTS, org: 'org_1' })

    act(() => result.current.clear('*'))
    expect(result.current.values).toEqual(DEFAULTS)
  })

  it('keeps a preference (the sort) when clearing all, and never counts it as an active filter', () => {
    window.location.hash = '#users?org=org_1&sort=reports'
    const { result } = renderHook(() => useFilters('users', DEFAULTS, ['sort']))

    expect(result.current.active).toEqual(['org'])

    act(() => result.current.clear('*'))
    expect(result.current.values).toEqual({ ...DEFAULTS, sort: 'reports' })
  })
})
