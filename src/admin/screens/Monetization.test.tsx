import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Monetization } from './Monetization'
import { api } from '../api/endpoints'
import type { AdminFeature, AdminMonetizationView, AdminPlan } from '../api/types'

vi.mock('../api/endpoints', () => ({
  api: {
    monetization: {
      get: vi.fn(),
      setFeaturePrice: vi.fn(),
      setPlanFeature: vi.fn(),
    },
  },
}))

const getMock = vi.mocked(api.monetization.get)
const setFeaturePriceMock = vi.mocked(api.monetization.setFeaturePrice)
const setPlanFeatureMock = vi.mocked(api.monetization.setPlanFeature)

function feature(overrides: Partial<AdminFeature> = {}): AdminFeature {
  return {
    key: 'BOOST',
    label: 'Boosts',
    explain: 'A boost pushes one of your listings back to the top of the feed.',
    model: 'PER_USE',
    unit: 'boost',
    enforcedAt: 'services/boost.ts#purchaseBoost',
    pricing: [
      { orgType: 'ACADEMIC', isPaid: true, basePricePaise: 5900, discountPaise: 0 },
      { orgType: 'CORPORATE', isPaid: true, basePricePaise: 5900, discountPaise: 0 },
    ],
    ...overrides,
  }
}

function plan(overrides: Partial<AdminPlan> = {}): AdminPlan {
  return {
    id: 'pln_free',
    key: 'FREE',
    name: 'Free',
    badgeLabel: null,
    sortOrder: 0,
    isDefault: true,
    status: 'AVAILABLE',
    iosProductId: null,
    androidProductId: null,
    blockedReason: null,
    pricing: [{ orgType: 'ACADEMIC', basePricePaise: 0, discountPaise: 0 }],
    features: [],
    ...overrides,
  }
}

function view(overrides: Partial<AdminMonetizationView> = {}): AdminMonetizationView {
  return { features: [feature()], plans: [plan()], ...overrides }
}

async function renderScreen(data: AdminMonetizationView = view()) {
  getMock.mockResolvedValue(data)
  render(<Monetization />)
  // Waits on the fetch resolving rather than on any particular feature: this
  // screen is rendered from whatever the server sends, and a test that names a
  // feature to wait for would be a test that knows the registry.
  await waitFor(() => expect(screen.queryAllByText('Loading…')).toHaveLength(0))
}

/** The one price row for an org type, so a query cannot pick up the plan's copy of the same feature. */
function priceRow(orgType: string): HTMLElement {
  return screen.getByText(orgType).closest('li') as HTMLElement
}

function planRow(planName: string, featureLabel: string): HTMLElement {
  const panel = screen.getByText(planName).closest('div[class*="rounded"]') as HTMLElement
  return within(panel).getAllByText(featureLabel)[0]!.closest('li') as HTMLElement
}

describe('Monetization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setFeaturePriceMock.mockResolvedValue({})
    setPlanFeatureMock.mockResolvedValue({})
  })

  afterEach(cleanup)

  it('renders whatever features the server sends, without knowing any of them', async () => {
    // The whole point of the registry: a feature this repo has never heard of
    // still gets a row, a model and its controls.
    await renderScreen(
      view({
        features: [
          feature({ key: 'SOMETHING_NEW', label: 'Something new', explain: 'Invented after this console shipped.' }),
        ],
      }),
    )

    expect(screen.getAllByText('Something new').length).toBeGreaterThan(0)
    expect(screen.getByText('Invented after this console shipped.')).toBeTruthy()
  })

  it('converts a price typed in rupees into paise before saving it', async () => {
    await renderScreen()

    const row = priceRow('ACADEMIC')
    const input = within(row).getAllByRole('textbox')[0]!
    fireEvent.change(input, { target: { value: '79' } })
    fireEvent.click(within(row).getByText('Save'))

    await waitFor(() =>
      expect(setFeaturePriceMock).toHaveBeenCalledWith({
        featureKey: 'BOOST',
        orgType: 'ACADEMIC',
        isPaid: true,
        basePricePaise: 7900,
        discountPaise: 0,
      }),
    )
  })

  it('refuses to save a feature marked paid that is free after its discount', async () => {
    await renderScreen()

    const row = priceRow('ACADEMIC')
    const [price, discount] = within(row).getAllByRole('textbox')
    fireEvent.change(price!, { target: { value: '59' } })
    fireEvent.change(discount!, { target: { value: '59' } })

    expect(within(row).getByText(/would read as free to every member/)).toBeTruthy()
    fireEvent.click(within(row).getByText('Save'))
    expect(setFeaturePriceMock).not.toHaveBeenCalled()
  })

  it('refuses a discount larger than the price, before the round trip', async () => {
    await renderScreen()

    const row = priceRow('ACADEMIC')
    const [price, discount] = within(row).getAllByRole('textbox')
    fireEvent.change(price!, { target: { value: '59' } })
    fireEvent.change(discount!, { target: { value: '99' } })

    expect(within(row).getByText('Discount cannot be more than the price.')).toBeTruthy()
    expect(setFeaturePriceMock).not.toHaveBeenCalled()
  })

  it('sends a per-use cell with its quantity and discount, and nulls for the fields the model has no use for', async () => {
    await renderScreen(
      view({
        plans: [
          plan(),
          plan({ id: 'pln_pro', key: 'PRO', name: 'Pro', isDefault: false, sortOrder: 2 }),
        ],
      }),
    )

    const row = planRow('Pro', 'Boosts')
    fireEvent.click(within(row).getByRole('checkbox'))
    const [quantity, discount] = within(row).getAllByRole('textbox')
    fireEvent.change(quantity!, { target: { value: '5' } })
    fireEvent.change(discount!, { target: { value: '20' } })
    fireEvent.click(within(row).getByText('Save'))

    await waitFor(() =>
      expect(setPlanFeatureMock).toHaveBeenCalledWith({
        planKey: 'PRO',
        featureKey: 'BOOST',
        included: true,
        includedQuantity: 5,
        discountPercent: 20,
        // A per-use feature carries neither, and sending whatever an input
        // last held is exactly the configuration the server refuses.
        settingValue: null,
        grantPaise: null,
      }),
    )
  })

  it('treats a grant as included when it has an amount, and sends it in paise', async () => {
    await renderScreen(
      view({
        features: [
          feature({ key: 'MONTHLY_CREDITS', label: 'Monthly credit', model: 'GRANT', unit: null, enforcedAt: null, pricing: [] }),
        ],
        plans: [plan(), plan({ id: 'pln_plus', key: 'PLUS', name: 'Plus', isDefault: false, sortOrder: 1 })],
      }),
    )

    const row = planRow('Plus', 'Monthly credit')
    fireEvent.change(within(row).getByRole('textbox'), { target: { value: '49' } })
    fireEvent.click(within(row).getByText('Save'))

    await waitFor(() =>
      expect(setPlanFeatureMock).toHaveBeenCalledWith({
        planKey: 'PLUS',
        featureKey: 'MONTHLY_CREDITS',
        included: true,
        includedQuantity: null,
        discountPercent: 0,
        settingValue: null,
        grantPaise: 4900,
      }),
    )
  })

  it('offers a perk as a single toggle, because a quantity on it means nothing', async () => {
    await renderScreen(
      view({
        features: [
          feature({ key: 'PRIORITY_SEARCH', label: 'Search placement', model: 'PERK', unit: null, pricing: [] }),
        ],
        plans: [plan(), plan({ id: 'pln_pro', key: 'PRO', name: 'Pro', isDefault: false, sortOrder: 2 })],
      }),
    )

    const row = planRow('Pro', 'Search placement')
    expect(within(row).queryAllByRole('textbox')).toHaveLength(0)
    fireEvent.click(within(row).getByRole('checkbox'))
    fireEvent.click(within(row).getByText('Save'))

    await waitFor(() =>
      expect(setPlanFeatureMock).toHaveBeenCalledWith({
        planKey: 'PRO',
        featureKey: 'PRIORITY_SEARCH',
        included: true,
        includedQuantity: null,
        discountPercent: 0,
        settingValue: null,
        grantPaise: null,
      }),
    )
  })

  it('warns when a paid plan gives exactly what the default plan gives', async () => {
    await renderScreen(
      view({
        plans: [
          plan({ features: [] }),
          plan({ id: 'pln_pro', key: 'PRO', name: 'Pro', isDefault: false, sortOrder: 2, features: [] }),
        ],
      }),
    )

    expect(screen.getByText(/Pro currently gives exactly what Free gives/)).toBeTruthy()
  })

  it('does not warn once the paid plan actually includes something', async () => {
    await renderScreen(
      view({
        plans: [
          plan({ features: [] }),
          plan({
            id: 'pln_pro',
            key: 'PRO',
            name: 'Pro',
            isDefault: false,
            sortOrder: 2,
            features: [
              {
                featureKey: 'BOOST',
                included: true,
                includedQuantity: 5,
                discountPercent: 0,
                settingValue: null,
                grantPaise: null,
              },
            ],
          }),
        ],
      }),
    )

    expect(screen.queryByText(/gives exactly what/)).toBeNull()
  })

  it('says why a plan cannot be sold, rather than leaving it to a support ticket', async () => {
    await renderScreen(
      view({
        plans: [
          plan({
            id: 'pln_pro',
            key: 'PRO',
            name: 'Pro',
            isDefault: false,
            status: 'DRAFT',
            blockedReason: 'Not purchasable — this plan has a price but no App Store product id.',
          }),
        ],
      }),
    )

    expect(screen.getByText(/no App Store product id/)).toBeTruthy()
  })

  it('says plainly when nothing is paid, because a console full of prices reads as if it were', async () => {
    await renderScreen(
      view({
        features: [
          feature({
            pricing: [
              { orgType: 'ACADEMIC', isPaid: false, basePricePaise: 5900, discountPaise: 0 },
              { orgType: 'CORPORATE', isPaid: false, basePricePaise: 5900, discountPaise: 0 },
            ],
          }),
        ],
      }),
    )

    expect(screen.getByText(/Nothing is marked paid/)).toBeTruthy()
  })
})
