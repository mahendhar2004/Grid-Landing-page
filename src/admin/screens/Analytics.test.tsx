import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Analytics } from './Analytics'
import { api } from '../api/endpoints'

vi.mock('../api/endpoints', () => ({ api: { analytics: { fetch: vi.fn() } } }))

const fetchMock = vi.mocked(api.analytics.fetch)

const range = { from: '2026-09-01T00:00:00.000Z', to: '2026-09-30T00:00:00.000Z', bucket: 'day' as const }
const point = { bucket: '2026-09-10T00:00:00.000Z', count: 3 }

const GROWTH = {
  signups: [point],
  activeUsers: 5,
  totalUsers: 9,
  totalOrganizations: 2,
  totalHubs: 3,
  activeHubs: 2,
  signupsByOrganization: [{ label: 'IIT Delhi', count: 4 }],
}
const MARKETPLACE = {
  listingsPosted: [point],
  listingsSold: [point],
  requestsPosted: [point],
  requestsFulfilled: [point],
  medianHoursToSale: 12,
  listingsByCategory: [{ label: 'BOOKS', count: 2 }],
  listingsByHub: [{ label: 'IIT Delhi', count: 2 }],
}

function envelope(data: unknown) {
  return { range, cached: false, data }
}

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => cleanup())

  it('draws the growth dashboard', async () => {
    fetchMock.mockResolvedValue(envelope(GROWTH) as never)
    render(<Analytics />)

    expect(await screen.findByText('Signups by organization')).toBeTruthy()
  })

  it('does not draw one dashboard from another one\'s data while the new one is still loading', async () => {
    // The bug: switching from Growth to Marketplace rendered Marketplace from
    // Growth's payload, and `data.listingsPosted.reduce` threw on undefined.
    let release: (value: unknown) => void = () => undefined
    fetchMock.mockResolvedValueOnce(envelope(GROWTH) as never)
    render(<Analytics />)
    await screen.findByText('Signups by organization')

    fetchMock.mockReturnValueOnce(new Promise((resolve) => (release = resolve)) as never)
    await act(async () => screen.getByRole('button', { name: 'Marketplace' }).click())

    // In flight: the loading state, not a crash and not Growth's numbers.
    expect(screen.getByText('Loading…')).toBeTruthy()
    expect(screen.queryByText('Signups by organization')).toBeNull()

    await act(async () => release(envelope(MARKETPLACE)))
    await waitFor(() => expect(screen.getByText('Listings by category')).toBeTruthy())
  })

  it('survives switching through every dashboard in turn', async () => {
    fetchMock.mockImplementation(((dashboard: string) =>
      Promise.resolve(
        envelope(
          dashboard === 'growth'
            ? GROWTH
            : dashboard === 'marketplace'
              ? MARKETPLACE
              : dashboard === 'money'
                ? { topUpPaise: 100, spendByType: [], spendTotalPaise: 0, revenueByHub: [], activeSubscriptions: [], creditsGrantedPaise: 0 }
                : { reportsFiled: [], reportsByCategory: [], openReports: 1, reportsPerThousandListings: null, bansIssued: 0, bansByLevel: [], moderationFlagsRaised: 0, moderationFlagsReviewed: 0 },
        ),
      )) as never)
    render(<Analytics />)
    await screen.findByText('Signups by organization')

    for (const [button, marker] of [
      ['Marketplace', 'Listings by category'],
      ['Money', 'Spend by type'],
      ['Trust', 'Reports by category'],
      ['Growth', 'Signups by organization'],
    ] as const) {
      await act(async () => screen.getByRole('button', { name: button }).click())
      await waitFor(() => expect(screen.getByText(marker)).toBeTruthy())
    }
  })

  it('keeps plans given away apart from paying subscribers, so a free plan never reads as revenue', async () => {
    fetchMock.mockImplementation(((dashboard: string) =>
      Promise.resolve(
        envelope(
          dashboard === 'money'
            ? {
                topUpPaise: 0,
                spendByType: [],
                spendTotalPaise: 0,
                revenueByHub: [],
                activeSubscriptions: [{ label: 'PLUS', count: 4 }],
                grantedPlans: [{ label: 'PRO', count: 2 }],
                creditsGrantedPaise: 0,
              }
            : dashboard === 'growth'
              ? GROWTH
              : MARKETPLACE,
        ),
      )) as never)
    render(<Analytics />)
    await screen.findByText('Signups by organization')

    await act(async () => screen.getByRole('button', { name: 'Money' }).click())

    await waitFor(() => expect(screen.getByText('Paying subscriptions by plan')).toBeTruthy())
    expect(screen.getByText('Plans given away, still running (not revenue)')).toBeTruthy()
    // Four paying subscribers - the two given plans are not among them.
    expect(screen.getByText('Subscribers').parentElement?.textContent).toMatch(/4/)
  })
})
