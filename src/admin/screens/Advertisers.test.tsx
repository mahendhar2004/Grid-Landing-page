import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Advertisers } from './Advertisers'
import { api } from '../api/endpoints'
import type { Advertiser, AdvertiserLedgerPage } from '../api/types'

vi.mock('../api/endpoints', () => ({
  api: {
    advertisers: { list: vi.fn(), create: vi.fn(), setSuspension: vi.fn(), archive: vi.fn() },
    adOrders: { list: vi.fn(), create: vi.fn(), archive: vi.fn() },
    advertiserLedger: { get: vi.fn(), credit: vi.fn(), adjust: vi.fn() },
  },
}))

const listMock = vi.mocked(api.advertisers.list)
const ordersMock = vi.mocked(api.adOrders.list)
const ledgerMock = vi.mocked(api.advertiserLedger.get)
const creditMock = vi.mocked(api.advertiserLedger.credit)
const adjustMock = vi.mocked(api.advertiserLedger.adjust)

function advertiser(overrides: Partial<Advertiser> = {}): Advertiser {
  return {
    id: 'adv_1',
    name: 'Campus Bookstore',
    legalName: null,
    tier: 'LOCAL',
    sector: 'RETAIL',
    gstNumber: null,
    billingEmail: null,
    contactName: null,
    contactPhone: null,
    notes: null,
    suspendedAt: null,
    suspendedReason: null,
    archivedAt: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    orderCount: 1,
    activeLineItemCount: 2,
    pendingCreativeCount: 0,
    ...overrides,
  }
}

function ledger(overrides: Partial<AdvertiserLedgerPage> = {}): AdvertiserLedgerPage {
  return {
    advertiserId: 'adv_1',
    advertiserName: 'Campus Bookstore',
    balancePaise: 2_000_000,
    entries: [],
    nextCursor: null,
    ...overrides,
  }
}

async function openMoney(row = advertiser(), page = ledger()) {
  listMock.mockResolvedValue({ advertisers: [row], nextCursor: null })
  ordersMock.mockResolvedValue({ orders: [], nextCursor: null })
  ledgerMock.mockResolvedValue(page)
  render(<Advertisers />)
  await waitFor(() => expect(screen.getByText('Orders & money')).toBeTruthy())
  fireEvent.click(screen.getByText('Orders & money'))
  await waitFor(() => expect(screen.getByText('Balance')).toBeTruthy())
}

describe('Advertisers, the ledger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    creditMock.mockResolvedValue(ledger())
    adjustMock.mockResolvedValue(ledger())
  })

  afterEach(() => {
    cleanup()
  })

  it('shows the balance in rupees, because nobody reads paise', async () => {
    await openMoney(advertiser(), ledger({ balancePaise: 2_000_000 }))

    expect(screen.getByText('₹20,000')).toBeTruthy()
  })

  /*
    Their ads have stopped, they do not know, and the first they would hear of
    it is the invoice. One of the two the plan singles out as causing
    arguments about money.
  */
  it('calls out an exhausted balance that still has live ads behind it', async () => {
    await openMoney(advertiser({ activeLineItemCount: 2 }), ledger({ balancePaise: 0 }))

    expect(screen.getByText(/2 ads still live/)).toBeTruthy()
  })

  it('says nothing alarming when the balance is empty but nothing is running', async () => {
    await openMoney(advertiser({ activeLineItemCount: 0 }), ledger({ balancePaise: 0 }))

    expect(screen.queryByText(/still live/)).toBeNull()
  })

  it('requires a bank reference before a payment can be credited', async () => {
    await openMoney()

    fireEvent.change(screen.getByLabelText('Payment (₹)'), { target: { value: '20000' } })
    fireEvent.change(screen.getByLabelText('What this is'), { target: { value: 'NEFT received' } })
    fireEvent.click(screen.getByText('Credit payment'))

    // The reference is what makes the whole operation safe to press twice.
    expect(creditMock).not.toHaveBeenCalled()
  })

  it('converts rupees to paise on the way out, because everything downstream is paise', async () => {
    await openMoney()

    fireEvent.change(screen.getByLabelText('Payment (₹)'), { target: { value: '20000' } })
    fireEvent.change(screen.getByLabelText('Bank reference'), { target: { value: 'UTR123' } })
    fireEvent.change(screen.getByLabelText('What this is'), { target: { value: 'NEFT received' } })
    fireEvent.click(screen.getByText('Credit payment'))

    await waitFor(() => expect(creditMock).toHaveBeenCalledWith('adv_1', 2_000_000, 'UTR123', 'NEFT received'))
  })

  it('refuses a negative credit, which is a debit wearing the wrong label', async () => {
    await openMoney()

    fireEvent.change(screen.getByLabelText('Payment (₹)'), { target: { value: '-5000' } })
    fireEvent.change(screen.getByLabelText('Bank reference'), { target: { value: 'UTR123' } })
    fireEvent.change(screen.getByLabelText('What this is'), { target: { value: 'Oops' } })
    fireEvent.click(screen.getByText('Credit payment'))

    expect(creditMock).not.toHaveBeenCalled()
  })

  /*
    An adjustment is the only way this ledger is ever corrected — the table
    refuses edits outright — so it has to accept a negative amount and must
    not ask for a bank reference there is no payment behind.
  */
  it('takes a negative adjustment with no bank reference', async () => {
    await openMoney()

    fireEvent.click(screen.getByText('Adjust instead'))
    fireEvent.change(screen.getByLabelText('Adjustment (₹, ±)'), { target: { value: '-5000' } })
    fireEvent.change(screen.getByLabelText('What this is'), { target: { value: 'Refunded the unspent half' } })
    fireEvent.click(screen.getByText('Post adjustment'))

    await waitFor(() => expect(adjustMock).toHaveBeenCalledWith('adv_1', -500_000, 'Refunded the unspent half'))
  })

  it('stops asking for a reference once adjusting', async () => {
    await openMoney()

    fireEvent.click(screen.getByText('Adjust instead'))

    expect(screen.queryByLabelText('Bank reference')).toBeNull()
  })

  it('refuses an adjustment of zero, which changes nothing and explains nothing', async () => {
    await openMoney()

    fireEvent.click(screen.getByText('Adjust instead'))
    fireEvent.change(screen.getByLabelText('Adjustment (₹, ±)'), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText('What this is'), { target: { value: 'Nothing' } })
    fireEvent.click(screen.getByText('Post adjustment'))

    expect(adjustMock).not.toHaveBeenCalled()
  })

  it('shows a debit with the campaign it came from, so the charge can be explained', async () => {
    await openMoney(
      advertiser(),
      ledger({
        entries: [
          {
            id: 'led_1',
            entryType: 'DEBIT',
            amountPaise: -45_000,
            description: 'Delivery for 16 Sep',
            externalReference: null,
            lineItemId: 'li_1',
            lineItemName: 'IIT Delhi feed',
            periodStart: '2026-09-16T00:00:00.000Z',
            periodEnd: '2026-09-17T00:00:00.000Z',
            createdAt: '2026-09-17T00:00:00.000Z',
          },
        ],
      }),
    )

    const list = within(screen.getByText('Delivery for 16 Sep').closest('li')!)
    expect(list.getByText(/IIT Delhi feed/)).toBeTruthy()
    expect(list.getByText(/−₹450/)).toBeTruthy()
  })

  it('offers nothing to post against an archived advertiser', async () => {
    await openMoney(advertiser({ archivedAt: '2026-09-10T00:00:00.000Z' }), ledger())

    expect(screen.queryByText('Credit payment')).toBeNull()
  })
})
