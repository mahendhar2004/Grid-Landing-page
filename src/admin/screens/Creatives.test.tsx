import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Creatives } from './Creatives'
import { api } from '../api/endpoints'
import type { Creative } from '../api/types'

vi.mock('../api/endpoints', () => ({
  api: {
    creatives: { list: vi.fn(), create: vi.fn(), review: vi.fn(), archive: vi.fn() },
    advertisers: { list: vi.fn() },
  },
}))

const listMock = vi.mocked(api.creatives.list)
const reviewMock = vi.mocked(api.creatives.review)
const advertisersListMock = vi.mocked(api.advertisers.list)

function creative(overrides: Partial<Creative> = {}): Creative {
  return {
    id: 'cre_1',
    advertiserId: 'adv_1',
    advertiserName: 'Campus Bookstore',
    title: 'Half-price textbooks',
    sponsorName: 'Campus Bookstore',
    imageUrl: 'https://cdn.example.com/a.webp',
    targetUrl: 'https://example.com/offer',
    disclosure: null,
    reviewStatus: 'PENDING',
    reviewReason: null,
    reviewedAt: null,
    archivedAt: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    lineItemCount: 0,
    ...overrides,
  }
}

async function renderScreen(rows: Creative[]) {
  listMock.mockResolvedValue({ creatives: rows, nextCursor: null })
  render(<Creatives />)
  await waitFor(() => expect(listMock).toHaveBeenCalled())
  await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())
}

describe('Creatives', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    advertisersListMock.mockResolvedValue({ advertisers: [], nextCursor: null })
    reviewMock.mockResolvedValue(creative({ reviewStatus: 'APPROVED' }))
  })

  afterEach(() => {
    cleanup()
  })

  const rowList = () => within(screen.getByRole('list'))

  it('offers both decisions on something awaiting review', async () => {
    await renderScreen([creative()])

    expect(rowList().getByText('Approve')).toBeTruthy()
    expect(rowList().getByText('Reject')).toBeTruthy()
  })

  it('offers neither on something already decided, so a decision is not quietly overwritten', async () => {
    await renderScreen([creative({ reviewStatus: 'APPROVED', reviewedAt: '2026-09-02T00:00:00.000Z' })])

    expect(rowList().queryByText('Approve')).toBeNull()
    expect(rowList().queryByText('Reject')).toBeNull()
  })

  it('approves without a reason prompt', async () => {
    await renderScreen([creative()])

    fireEvent.click(rowList().getByText('Approve'))

    await waitFor(() => expect(reviewMock).toHaveBeenCalledWith('cre_1', { decision: 'APPROVED' }))
  })

  it('asks for a reason before rejecting, and sends it', async () => {
    await renderScreen([creative()])

    fireEvent.click(rowList().getByText('Reject'))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Claims a guaranteed placement' } })
    fireEvent.click(screen.getByText('Reject', { selector: 'button[type="submit"]' }))

    await waitFor(() =>
      expect(reviewMock).toHaveBeenCalledWith('cre_1', {
        decision: 'REJECTED',
        reason: 'Claims a guaranteed placement',
      }),
    )
  })

  /*
    One image can run in six campaigns, and rejecting it stops all six. Saying
    how many before the decision is the difference between a review and a
    surprise - and it is the whole reason review sits on the creative rather
    than on the ad.
  */
  it('says how many campaigns a rejection will stop, before the decision is made', async () => {
    await renderScreen([creative({ lineItemCount: 3 })])

    fireEvent.click(rowList().getByText('Reject'))

    expect(screen.getByText(/pauses all 3 ads using this creative/)).toBeTruthy()
  })

  it('says plainly when a rejection stops nothing at all', async () => {
    await renderScreen([creative({ lineItemCount: 0 })])

    fireEvent.click(rowList().getByText('Reject'))

    expect(screen.getByText(/Nothing is running on this creative yet/)).toBeTruthy()
  })

  it('shows why something was rejected, so the decision survives the person who made it', async () => {
    await renderScreen([
      creative({ reviewStatus: 'REJECTED', reviewReason: 'Misleading claim', reviewedAt: '2026-09-02T00:00:00.000Z' }),
    ])

    expect(rowList().getByText(/Misleading claim/)).toBeTruthy()
  })

  it("shows a partner's required disclosure on the row, since it is what makes the link lawful", async () => {
    await renderScreen([creative({ disclosure: 'As an Amazon Associate I earn from qualifying purchases.' })])

    expect(rowList().getByText(/Amazon Associate/)).toBeTruthy()
  })
})
