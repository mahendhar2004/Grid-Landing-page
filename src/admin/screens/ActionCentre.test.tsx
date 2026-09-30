import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ActionCentre } from './ActionCentre'
import { api } from '../api/endpoints'

vi.mock('../api/endpoints', () => ({
  api: {
    triage: { counts: vi.fn() },
    reports: { list: vi.fn() },
    organizations: { list: vi.fn() },
    creatives: { list: vi.fn() },
    advertisers: { list: vi.fn() },
    advertiserLedger: { get: vi.fn() },
  },
}))

const creativesMock = vi.mocked(api.creatives.list)
const advertisersMock = vi.mocked(api.advertisers.list)
const ledgerMock = vi.mocked(api.advertiserLedger.get)

function creative(id: string) {
  return { id } as never
}

describe('ActionCentre', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.triage.counts).mockResolvedValue({})
    vi.mocked(api.reports.list).mockResolvedValue([])
    vi.mocked(api.organizations.list).mockResolvedValue([])
    advertisersMock.mockResolvedValue({ advertisers: [], nextCursor: null } as never)
    creativesMock.mockResolvedValue({ creatives: [], nextCursor: null } as never)
  })
  afterEach(() => cleanup())

  it('counts every creative waiting for review, following the cursor past the first page of 50', async () => {
    // It asked for 100, the route allows 50, the 400 was swallowed, and the
    // screen said nothing was waiting.
    creativesMock
      .mockResolvedValueOnce({ creatives: Array.from({ length: 50 }, (_, i) => creative(`a${i}`)), nextCursor: 'next' } as never)
      .mockResolvedValueOnce({ creatives: [creative('b1'), creative('b2')], nextCursor: null } as never)

    render(<ActionCentre onOpenTab={() => undefined} />)

    const row = await screen.findByTestId('action-creatives')
    expect(row.textContent).toContain('52')
  })

  it('never asks the ad routes for more than 50 at a time', async () => {
    render(<ActionCentre onOpenTab={() => undefined} />)
    await waitFor(() => expect(creativesMock).toHaveBeenCalled())
    await waitFor(() => expect(advertisersMock).toHaveBeenCalled())

    for (const call of [...creativesMock.mock.calls, ...advertisersMock.mock.calls]) {
      expect(call[2]).toBeLessThanOrEqual(50)
    }
  })

  it('reports advertisers whose balance has run out while an ad is still live', async () => {
    advertisersMock.mockResolvedValue({
      advertisers: [
        { id: 'adv_1', activeLineItemCount: 2 },
        { id: 'adv_2', activeLineItemCount: 0 },
      ],
      nextCursor: null,
    } as never)
    ledgerMock.mockResolvedValue({ balancePaise: 0 } as never)

    render(<ActionCentre onOpenTab={() => undefined} />)

    const row = await screen.findByTestId('action-exhausted')
    expect(row.textContent).toContain('1')
    // Only the advertiser with something live has its balance read.
    expect(ledgerMock).toHaveBeenCalledTimes(1)
  })
})
