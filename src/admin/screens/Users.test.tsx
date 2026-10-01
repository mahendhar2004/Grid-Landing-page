import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Users } from './Users'
import { api } from '../api/endpoints'
import type { AdminUser } from '../api/types'

vi.mock('../api/endpoints', () => ({
  api: {
    users: { list: vi.fn(), ban: vi.fn(), unban: vi.fn(), grantPlan: vi.fn(), revokePlan: vi.fn() },
    organizations: { list: vi.fn() },
    monetization: { get: vi.fn() },
  },
}))

const listMock = vi.mocked(api.users.list)
const banMock = vi.mocked(api.users.ban)
const unbanMock = vi.mocked(api.users.unban)
const orgsMock = vi.mocked(api.organizations.list)
const grantMock = vi.mocked(api.users.grantPlan)
const revokeMock = vi.mocked(api.users.revokePlan)
const monetizationMock = vi.mocked(api.monetization.get)

function user(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: 'usr_1',
    email: 'asha@iitd.ac.in',
    displayName: 'Asha',
    role: 'STUDENT',
    orgDomain: 'iitd.ac.in',
    organizationId: 'org_iitd',
    organizationName: 'IIT Delhi',
    isAdmin: false,
    isBanned: false,
    bannedUntil: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    reportCount: 0,
    listingCount: 2,
    plan: null,
    ...overrides,
  }
}

async function renderUsers(rows: AdminUser[]) {
  listMock.mockResolvedValue(rows)
  render(<Users />)
  await waitFor(() => expect(listMock).toHaveBeenCalled())
}

describe('Users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    banMock.mockResolvedValue(undefined)
    unbanMock.mockResolvedValue(undefined)
    grantMock.mockResolvedValue({ planKey: 'PRO', planName: 'Pro', expiresAt: '2026-11-01T00:00:00.000Z' })
    revokeMock.mockResolvedValue(undefined)
    monetizationMock.mockResolvedValue({
      features: [],
      plans: [
        { id: 'p0', key: 'FREE', name: 'Free', badgeLabel: null, sortOrder: 0, isDefault: true, isRecommended: false, status: 'AVAILABLE', iosProductId: null, androidProductId: null, iosVerifiedAt: null, androidVerifiedAt: null, blockedReason: null, pricing: [], features: [] },
        { id: 'p1', key: 'PLUS', name: 'Plus', badgeLabel: null, sortOrder: 1, isDefault: false, isRecommended: false, status: 'AVAILABLE', iosProductId: 'a', androidProductId: 'a', iosVerifiedAt: null, androidVerifiedAt: null, blockedReason: null, pricing: [], features: [] },
        { id: 'p2', key: 'PRO', name: 'Pro', badgeLabel: null, sortOrder: 2, isDefault: false, isRecommended: true, status: 'AVAILABLE', iosProductId: 'b', androidProductId: 'b', iosVerifiedAt: null, androidVerifiedAt: null, blockedReason: null, pricing: [], features: [] },
        { id: 'p3', key: 'OLD', name: 'Old', badgeLabel: null, sortOrder: 3, isDefault: false, isRecommended: false, status: 'RETIRED', iosProductId: null, androidProductId: null, iosVerifiedAt: null, androidVerifiedAt: null, blockedReason: null, pricing: [], features: [] },
      ],
    })
    orgsMock.mockResolvedValue([
      { id: 'org_iitd', name: 'IIT Delhi' },
      { id: 'org_bits', name: 'BITS Hyderabad' },
    ] as never)
    // Filters live in the address; start every test with none.
    window.location.hash = ''
  })

  // `globals: true` is not set, so Testing Library's auto-cleanup is not
  // registered - same as ErrorBoundary.test.tsx. Without this the previous
  // test's DOM is still mounted and every query finds two of everything.
  afterEach(() => {
    cleanup()
  })

  /** The rows, excluding the filter buttons above them - "Banned" is both a badge and a filter. */
  const rowList = () => within(screen.getByRole('list'))

  it('shows an active user with the ban actions, and no way to lift a ban that is not there', async () => {
    await renderUsers([user()])

    await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())
    expect(rowList().getByText('Active')).toBeTruthy()
    expect(rowList().getByText('Ban 7d')).toBeTruthy()
    expect(rowList().queryByText('Lift ban')).toBeNull()
  })

  it('offers Lift ban on a banned user — the action that had no caller at all', async () => {
    await renderUsers([user({ isBanned: true })])

    await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())
    expect(rowList().getByText('Lift ban')).toBeTruthy()
    expect(rowList().queryByText('Ban 7d')).toBeNull()
  })

  it('tells a permanent ban apart from a timed one, though both carry a null date', async () => {
    // The whole reason `bannedUntil` is read together with `isBanned`: null
    // means "never banned" on one row and "forever" on another.
    await renderUsers([
      user({ id: 'a', isBanned: true, bannedUntil: null }),
      user({ id: 'b', email: 'b@x.ac.in', isBanned: true, bannedUntil: '2027-01-01T00:00:00.000Z' }),
      user({ id: 'c', email: 'c@x.ac.in', isBanned: false, bannedUntil: null }),
    ])

    await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())
    expect(rowList().getByText('Banned — permanent')).toBeTruthy()
    expect(rowList().getByText(/^Banned until/)).toBeTruthy()
    expect(rowList().getByText('Active')).toBeTruthy()
  })

  it('asks for a reason before lifting a ban, and sends it', async () => {
    await renderUsers([user({ isBanned: true })])
    await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())
    act(() => rowList().getByText('Lift ban').click())

    // The Search field is a textbox as well, so this picks the prompt's own
    // textarea rather than whichever one happens to come first.
    const textarea = document.querySelector('textarea')!
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )!.set!
      setter.call(textarea, 'Appeal upheld')
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await act(async () => {
      screen.getByText('Confirm').click()
    })

    await waitFor(() => expect(unbanMock).toHaveBeenCalledWith('usr_1', 'Appeal upheld'))
  })

  /** Types into the reason box of the open prompt. */
  function writeReason(text: string) {
    const textarea = document.querySelector('textarea')!
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!.set!
      setter.call(textarea, text)
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }

  describe('plans', () => {
    it('shows which plan a member is on, and says when it was given rather than bought', async () => {
      await renderUsers([
        user({ id: 'a', email: 'a@x.ac.in', plan: { key: 'PLUS', name: 'Plus', isGrant: false, expiresAt: '2026-12-01T00:00:00.000Z' } }),
        user({ id: 'b', email: 'b@x.ac.in', plan: { key: 'PRO', name: 'Pro', isGrant: true, expiresAt: '2026-11-01T00:00:00.000Z' } }),
      ])

      await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())
      expect(rowList().getByText('Plus')).toBeTruthy()
      expect(rowList().getByText(/Pro · given until/)).toBeTruthy()
    })

    it('offers to give a plan only to someone on the free plan, and to end it only where it was given', async () => {
      await renderUsers([
        user({ id: 'free', email: 'free@x.ac.in' }),
        user({ id: 'paid', email: 'paid@x.ac.in', plan: { key: 'PLUS', name: 'Plus', isGrant: false, expiresAt: null } }),
        user({ id: 'given', email: 'given@x.ac.in', plan: { key: 'PRO', name: 'Pro', isGrant: true, expiresAt: '2026-11-01T00:00:00.000Z' } }),
      ])

      await waitFor(() => expect(rowList().getAllByText('Give a plan')).toHaveLength(1))
      expect(rowList().getAllByText('End given plan')).toHaveLength(1)
    })

    it('gives the chosen plan for the days typed, with the reason, never offering the free or a retired plan', async () => {
      await renderUsers([user()])
      await waitFor(() => expect(rowList().getByText('Give a plan').hasAttribute('disabled')).toBe(false))
      act(() => rowList().getByText('Give a plan').click())

      const dialog = within(screen.getByRole('dialog'))
      expect(dialog.getByText('Plus')).toBeTruthy()
      expect(dialog.getByText('Pro')).toBeTruthy()
      expect(dialog.queryByText('Free')).toBeNull()
      expect(dialog.queryByText('Old')).toBeNull()

      act(() => dialog.getByText('Pro').click())
      const days = screen.getByLabelText(/For how many days/) as HTMLInputElement
      act(() => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
        setter.call(days, '14')
        days.dispatchEvent(new Event('input', { bubbles: true }))
      })
      writeReason('Charged twice, credited by hand.')
      await act(async () => {
        screen.getByText('Confirm').click()
      })

      await waitFor(() => expect(grantMock).toHaveBeenCalledWith('usr_1', { planKey: 'PRO', days: 14, reason: 'Charged twice, credited by hand.' }))
    })

    it('sends nothing while the number of days is wrong, and says why', async () => {
      await renderUsers([user()])
      await waitFor(() => expect(rowList().getByText('Give a plan').hasAttribute('disabled')).toBe(false))
      act(() => rowList().getByText('Give a plan').click())

      const days = screen.getByLabelText(/For how many days/) as HTMLInputElement
      act(() => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
        setter.call(days, '400')
        days.dispatchEvent(new Event('input', { bubbles: true }))
      })
      writeReason('Too long.')
      await act(async () => {
        screen.getByText('Confirm').click()
      })

      expect(screen.getByText('A plan can be given for 1 to 365 days.')).toBeTruthy()
      expect(grantMock).not.toHaveBeenCalled()
    })

    it('ends a given plan with a reason', async () => {
      await renderUsers([user({ plan: { key: 'PRO', name: 'Pro', isGrant: true, expiresAt: '2026-11-01T00:00:00.000Z' } })])
      await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())
      act(() => rowList().getByText('End given plan').click())

      writeReason('Test finished.')
      await act(async () => {
        screen.getByText('Confirm').click()
      })

      await waitFor(() => expect(revokeMock).toHaveBeenCalledWith('usr_1', 'Test finished.'))
    })
  })

  /** Open a filter pill by its label, then choose an option in the list that opens. */
  async function choose(pill: string, option: string) {
    await act(async () => {
      screen.getByRole('button', { name: new RegExp(`^${pill}`) }).click()
    })
    await act(async () => {
      screen.getByRole('option', { name: option }).click()
    })
  }

  const lastFilters = () => listMock.mock.calls.at(-1)![0]

  it('treats the standing filter as three states, not a checkbox', async () => {
    await renderUsers([user()])

    await choose('Status', 'Banned')
    await waitFor(() => expect(lastFilters().banned).toBe(true))

    await choose('Status', 'Active')
    await waitFor(() => expect(lastFilters().banned).toBe(false))

    await choose('Status', 'Any')
    // `null`, not `false` - "any" is a different question from "not banned".
    await waitFor(() => expect(lastFilters().banned).toBeNull())
  })

  it('narrows to one organisation by id, and offers every organisation to choose from', async () => {
    await renderUsers([user()])

    await choose('Organisation', 'BITS Hyderabad')

    await waitFor(() => expect(lastFilters().organizationId).toBe('org_bits'))
    // The choice is in the address, so the view can be shared.
    expect(window.location.hash).toContain('org=org_bits')
  })

  it('passes the reports filter and the sort to the server', async () => {
    await renderUsers([user()])

    await choose('Reports', 'Has reports')
    await waitFor(() => expect(lastFilters().reported).toBe(true))

    await choose('Sort', 'Most reports')
    await waitFor(() => expect(lastFilters().sort).toBe('reports'))
  })

  it('applies an organisation filter from the address, as a shared link would', async () => {
    window.location.hash = '#users?org=org_iitd&status=banned'
    await renderUsers([user({ isBanned: true })])

    await waitFor(() => expect(lastFilters()).toMatchObject({ organizationId: 'org_iitd', banned: true }))
    expect(await screen.findByText('Organisation IIT Delhi')).toBeTruthy()
  })

  it('clicking a member\'s organisation shows everyone at it', async () => {
    await renderUsers([user()])
    await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())

    await act(async () => {
      rowList().getByRole('button', { name: 'IIT Delhi' }).click()
    })

    await waitFor(() => expect(lastFilters().organizationId).toBe('org_iitd'))
  })

  it('shows what is narrowing the list, and removes one filter or all of them', async () => {
    window.location.hash = '#users?org=org_iitd&status=banned'
    await renderUsers([user({ isBanned: true })])

    await act(async () => {
      screen.getByRole('button', { name: 'Remove filter Status Banned' }).click()
    })
    await waitFor(() => expect(lastFilters()).toMatchObject({ organizationId: 'org_iitd', banned: null }))

    await act(async () => {
      screen.getByRole('button', { name: 'Clear all' }).click()
    })
    await waitFor(() => expect(lastFilters()).toMatchObject({ organizationId: undefined, banned: null }))
    expect(screen.queryByRole('button', { name: 'Clear all' })).toBeNull()
  })

  it('does not treat the sort as a filter: it is never a removable chip', async () => {
    await renderUsers([user()])

    await choose('Sort', 'Most listings')

    await waitFor(() => expect(lastFilters().sort).toBe('listings'))
    expect(screen.queryByRole('button', { name: 'Clear all' })).toBeNull()
  })

  it('says how many are shown and offers more only when a page came back full', async () => {
    await renderUsers(Array.from({ length: 50 }, (_, i) => user({ id: `u${i}`, email: `u${i}@x.ac.in` })))

    expect(await screen.findByText('Showing the first 50')).toBeTruthy()
    expect(screen.getByText('Load more')).toBeTruthy()
  })

  it('does not imply there is more when the page came back short', async () => {
    await renderUsers([user()])

    expect(await screen.findByText('1 in total')).toBeTruthy()
    expect(screen.queryByText('Load more')).toBeNull()
  })
})
