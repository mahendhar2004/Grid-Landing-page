import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Users } from './Users'
import { api } from '../api/endpoints'
import type { AdminUser } from '../api/types'

vi.mock('../api/endpoints', () => ({
  api: {
    users: { list: vi.fn(), ban: vi.fn(), unban: vi.fn() },
  },
}))

const listMock = vi.mocked(api.users.list)
const banMock = vi.mocked(api.users.ban)
const unbanMock = vi.mocked(api.users.unban)

function user(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: 'usr_1',
    email: 'asha@iitd.ac.in',
    displayName: 'Asha',
    role: 'STUDENT',
    orgDomain: 'iitd.ac.in',
    isAdmin: false,
    isBanned: false,
    bannedUntil: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    reportCount: 0,
    listingCount: 2,
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

  it('treats the standing filter as three states, not a checkbox', async () => {
    await renderUsers([user()])

    // By role, because "Active" and "Banned" are also row badges.
    const filter = (name: string) => screen.getByRole('button', { name })

    await act(async () => {
      filter('Banned').click()
    })
    await waitFor(() => expect(listMock).toHaveBeenLastCalledWith(undefined, true, 50, 0))

    await act(async () => {
      filter('Active').click()
    })
    await waitFor(() => expect(listMock).toHaveBeenLastCalledWith(undefined, false, 50, 0))

    await act(async () => {
      filter('Everyone').click()
    })
    // `null`, not `false` - "everyone" is a different question from "not banned".
    await waitFor(() => expect(listMock).toHaveBeenLastCalledWith(undefined, null, 50, 0))
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
