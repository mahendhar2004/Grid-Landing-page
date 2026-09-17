import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AdLineItems } from './AdLineItems'
import { api } from '../api/endpoints'
import type { LineItem, LineItemsPage } from '../api/types'

vi.mock('../api/endpoints', () => ({
  api: {
    lineItems: { list: vi.fn(), create: vi.fn(), setStatus: vi.fn(), setSuspension: vi.fn() },
    adOrders: { list: vi.fn() },
    creatives: { list: vi.fn() },
  },
}))

const listMock = vi.mocked(api.lineItems.list)
const setStatusMock = vi.mocked(api.lineItems.setStatus)
const setSuspensionMock = vi.mocked(api.lineItems.setSuspension)
const ordersListMock = vi.mocked(api.adOrders.list)
const creativesListMock = vi.mocked(api.creatives.list)

function lineItem(overrides: Partial<LineItem> = {}): LineItem {
  return {
    id: 'li_1',
    orderId: 'ord_1',
    orderName: 'Freshers fortnight',
    advertiserId: 'adv_1',
    advertiserName: 'Campus Bookstore',
    name: 'IIT Delhi feed',
    status: 'ACTIVE',
    deliveryType: 'STANDARD',
    priority: 8,
    shareOfVoicePercent: null,
    suspendedAt: null,
    suspendedReason: null,
    placements: ['FEED'],
    category: null,
    keywords: null,
    minPricePaise: null,
    maxPricePaise: null,
    startsAt: null,
    endsAt: null,
    notes: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    creatives: [{ id: 'cre_1', title: 'Half-price textbooks', imageUrl: 'https://x/1', reviewStatus: 'APPROVED', archivedAt: null }],
    impressionCount: 1000,
    clickCount: 25,
    ...overrides,
  }
}

async function renderScreen(rows: LineItem[]) {
  listMock.mockResolvedValue({ lineItems: rows, nextCursor: null } as LineItemsPage)
  render(<AdLineItems />)
  await waitFor(() => expect(listMock).toHaveBeenCalled())
  await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())
}

describe('AdLineItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ordersListMock.mockResolvedValue({ orders: [], nextCursor: null })
    creativesListMock.mockResolvedValue({ creatives: [], nextCursor: null })
    setStatusMock.mockResolvedValue(lineItem())
    setSuspensionMock.mockResolvedValue(lineItem())
  })

  // Testing Library's auto-cleanup is not registered (`globals: true` is not
  // set), so without this the previous test's DOM is still mounted.
  afterEach(() => {
    cleanup()
  })

  const rowList = () => within(screen.getByRole('list'))

  it('shows delivery and a click-through rate, which is the only number that says whether an ad works', async () => {
    await renderScreen([lineItem()])

    expect(rowList().getByText(/1,000 seen/)).toBeTruthy()
    expect(rowList().getByText('2.5%')).toBeTruthy()
  })

  it('shows a dash rather than dividing by zero on an ad nobody has seen', async () => {
    await renderScreen([lineItem({ impressionCount: 0, clickCount: 0 })])

    expect(rowList().getByText('—')).toBeTruthy()
  })

  /*
    Status is the advertiser's and suspension is Grid's. If the screen showed
    them as one state, the two-field split in the schema would be decoration -
    and a suspended ad would look exactly like a paused one, which is the
    difference between "they stopped it" and "we did".
  */
  it('shows a suspended ad as suspended rather than as its underlying status', async () => {
    await renderScreen([
      lineItem({ status: 'PAUSED', suspendedAt: '2026-09-10T00:00:00.000Z', suspendedReason: 'Upheld report' }),
    ])

    expect(rowList().getByText('Suspended')).toBeTruthy()
    expect(rowList().getByText(/Upheld report/)).toBeTruthy()
  })

  it('offers only Lift suspension on a suspended ad, not Pause or Resume', async () => {
    await renderScreen([
      lineItem({ status: 'PAUSED', suspendedAt: '2026-09-10T00:00:00.000Z', suspendedReason: 'Upheld report' }),
    ])

    expect(rowList().getByText('Lift suspension')).toBeTruthy()
    // Resuming from here would let a status change undo a moderation
    // decision, which the API refuses anyway - offering it would just be a
    // button that always errors.
    expect(rowList().queryByText('Resume')).toBeNull()
    expect(rowList().queryByText('Pause')).toBeNull()
  })

  it('lifts a suspension without asking for a reason, because nothing is being stopped', async () => {
    await renderScreen([
      lineItem({ status: 'PAUSED', suspendedAt: '2026-09-10T00:00:00.000Z', suspendedReason: 'Upheld report' }),
    ])

    fireEvent.click(rowList().getByText('Lift suspension'))

    await waitFor(() => expect(setSuspensionMock).toHaveBeenCalledWith('li_1', false, null))
  })

  it('calls a draft going live "Go live" and a paused one "Resume"', async () => {
    await renderScreen([lineItem({ id: 'li_draft', status: 'DRAFT' }), lineItem({ id: 'li_paused', status: 'PAUSED' })])

    expect(rowList().getByText('Go live')).toBeTruthy()
    expect(rowList().getByText('Resume')).toBeTruthy()
  })

  it('goes live with no reason prompt — starting something needs no explaining', async () => {
    await renderScreen([lineItem({ status: 'DRAFT' })])

    fireEvent.click(rowList().getByText('Go live'))

    await waitFor(() => expect(setStatusMock).toHaveBeenCalledWith('li_1', { status: 'ACTIVE' }))
  })

  it('asks for a reason before pausing, and sends it', async () => {
    await renderScreen([lineItem()])

    fireEvent.click(rowList().getByText('Pause'))
    const reason = screen.getByRole('textbox')
    fireEvent.change(reason, { target: { value: 'Advertiser asked us to hold it' } })
    fireEvent.click(screen.getByText('Pause', { selector: 'button[type="submit"]' }))

    await waitFor(() =>
      expect(setStatusMock).toHaveBeenCalledWith('li_1', {
        status: 'PAUSED',
        reason: 'Advertiser asked us to hold it',
      }),
    )
  })

  /*
    A live ad with nothing approved on it looks completely healthy in a list
    and delivers nothing. This is the one state the screen has to call out,
    because every other signal on the row says it is fine.
  */
  it('warns when a live ad has no approved creative and therefore cannot serve', async () => {
    await renderScreen([
      lineItem({
        creatives: [{ id: 'cre_1', title: 'Pending art', imageUrl: 'https://x/1', reviewStatus: 'PENDING', archivedAt: null }],
      }),
    ])

    expect(rowList().getByText(/cannot serve/)).toBeTruthy()
  })

  it('does not warn when the live ad does have one', async () => {
    await renderScreen([lineItem()])

    expect(rowList().queryByText(/cannot serve/)).toBeNull()
  })

  it('treats an archived creative as not servable, even though it was approved', async () => {
    await renderScreen([
      lineItem({
        creatives: [
          { id: 'cre_1', title: 'Old art', imageUrl: 'https://x/1', reviewStatus: 'APPROVED', archivedAt: '2026-09-02T00:00:00.000Z' },
        ],
      }),
    ])

    expect(rowList().getByText(/cannot serve/)).toBeTruthy()
  })

  /*
    Google Ad Manager's scale, where a lower number wins. The row has to say
    which of the three an ad is, because it is the difference between a
    guarantee, an ordinary sale and a filler — and it is invisible otherwise.
  */
  it('says what a sponsorship promises, not just that it is one', async () => {
    await renderScreen([lineItem({ deliveryType: 'SPONSORSHIP', priority: 4, shareOfVoicePercent: 25 })])

    expect(rowList().getByText(/sponsorship, 25% of the feed/)).toBeTruthy()
  })

  it('marks house inventory as filling what is left, rather than showing a bare priority', async () => {
    await renderScreen([lineItem({ deliveryType: 'HOUSE', priority: 16 })])

    expect(rowList().getByText(/house, fills what is left/)).toBeTruthy()
  })

  it('shows a standard ad with its priority, since that is what decides between two of them', async () => {
    await renderScreen([lineItem({ deliveryType: 'STANDARD', priority: 6 })])

    expect(rowList().getByText(/standard \(priority 6\)/)).toBeTruthy()
  })

  it('offers nothing to press on an archived ad, which never runs again', async () => {
    await renderScreen([lineItem({ status: 'ARCHIVED' })])

    expect(rowList().queryByText('Resume')).toBeNull()
    expect(rowList().queryByText('Pause')).toBeNull()
    expect(rowList().queryByText('Archive')).toBeNull()
    expect(rowList().queryByText('Suspend')).toBeNull()
  })
})
