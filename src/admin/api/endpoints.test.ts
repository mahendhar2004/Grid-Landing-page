import { describe, expect, it } from 'vitest'

import { MAX_PAGE, api, triageStatusValue } from './endpoints'
import type { TriageInbox } from './types'

describe('triageStatusValue', () => {
  const INBOXES: TriageInbox[] = [
    'BUG_REPORT',
    'FEEDBACK',
    'CONTACT_MESSAGE',
    'PUBLIC_BUG_REPORT',
    'PUBLIC_REVIEW',
  ]

  it('sends nothing at all for "any status"', () => {
    // Omitting the parameter and asking for a particular status are different
    // requests; a sentinel string would make them the same one.
    for (const inbox of INBOXES) {
      expect(triageStatusValue(inbox, null)).toBeNull()
    }
  })

  it('passes OPEN and SPAM through, because every inbox spells those the same', () => {
    for (const inbox of INBOXES) {
      expect(triageStatusValue(inbox, 'OPEN')).toBe('OPEN')
      expect(triageStatusValue(inbox, 'SPAM')).toBe('SPAM')
    }
  })

  it('translates "resolved" into whatever each inbox actually calls it', () => {
    // A handled contact message is HANDLED and an approved review is
    // APPROVED. Filtering by the literal string "RESOLVED" would silently
    // match nothing on two of the five inboxes.
    expect(triageStatusValue('BUG_REPORT', 'RESOLVED')).toBe('RESOLVED')
    expect(triageStatusValue('FEEDBACK', 'RESOLVED')).toBe('RESOLVED')
    expect(triageStatusValue('PUBLIC_BUG_REPORT', 'RESOLVED')).toBe('RESOLVED')
    expect(triageStatusValue('CONTACT_MESSAGE', 'RESOLVED')).toBe('HANDLED')
    expect(triageStatusValue('PUBLIC_REVIEW', 'RESOLVED')).toBe('APPROVED')
  })

  it('has an answer for every inbox, so a new one cannot quietly return undefined', () => {
    for (const inbox of INBOXES) {
      expect(triageStatusValue(inbox, 'RESOLVED')).toBeTruthy()
    }
  })
})

describe('page sizes the routes allow', () => {
  it('refuses, at the call site, a page bigger than the route will return', () => {
    // The server answers such a request with a 400 "limit: Too big", and the
    // Action Centre turned that into "nothing waiting".
    expect(() => api.advertisers.list(null, {}, MAX_PAGE.advertisers + 1)).toThrow(/at most 50/)
    expect(() => api.creatives.list(null, {}, MAX_PAGE.creatives + 1)).toThrow(/at most 50/)
    expect(() => api.organizations.list(undefined, MAX_PAGE.organizations + 1, 0)).toThrow(/at most 100/)
  })
})
