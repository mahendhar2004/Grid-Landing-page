import { afterEach, describe, expect, it } from 'vitest'

import { buildHash, navigate, parseHash, replaceRoute } from './route'

describe('the address is the state', () => {
  afterEach(() => {
    window.location.hash = ''
  })

  it('reads a screen and its filters out of the hash', () => {
    const route = parseHash('#users?org=org_1&status=banned')

    expect(route.view).toBe('users')
    expect(route.params.get('org')).toBe('org_1')
    expect(route.params.get('status')).toBe('banned')
  })

  it('opens the home screen for an empty address', () => {
    expect(parseHash('').view).toBe('home')
    expect(parseHash('#').view).toBe('home')
  })

  it('builds a clean address when there are no filters, and encodes the ones there are', () => {
    expect(buildHash('users')).toBe('#users')
    expect(buildHash('users', {})).toBe('#users')
    expect(buildHash('audit', { target: 'a b&c' })).toBe('#audit?target=a+b%26c')
  })

  it('navigates with filters already applied', () => {
    navigate('users', { org: 'org_1' })

    expect(window.location.hash).toBe('#users?org=org_1')
  })

  it('replaces the filters without adding to the browser history, and says so to anything listening', () => {
    const before = window.history.length
    let heard = 0
    const listener = () => (heard += 1)
    window.addEventListener('hashchange', listener)

    replaceRoute('users', { q: 'asha' })
    window.removeEventListener('hashchange', listener)

    expect(window.location.hash).toBe('#users?q=asha')
    expect(window.history.length).toBe(before)
    expect(heard).toBe(1)
  })
})
