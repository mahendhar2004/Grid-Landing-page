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
      setReachDistances: vi.fn(),
    },
  },
}))

const getMock = vi.mocked(api.monetization.get)
const setFeaturePriceMock = vi.mocked(api.monetization.setFeaturePrice)
const setPlanFeatureMock = vi.mocked(api.monetization.setPlanFeature)
const setReachDistancesMock = vi.mocked(api.monetization.setReachDistances)

function feature(overrides: Partial<AdminFeature> = {}): AdminFeature {
  return {
    key: 'BOOST',
    label: 'Boosts',
    explain: 'A boost pushes one of your listings back to the top of the feed.',
    model: 'PER_USE',
    unit: 'boost',
    enforcedAt: 'services/boost.ts#purchaseBoost',
    switchable: true,
    pricing: [
      { orgType: 'ACADEMIC', isPaid: true, isOffered: true, basePricePaise: 5900, discountPaise: 0 },
      { orgType: 'CORPORATE', isPaid: true, isOffered: true, basePricePaise: 5900, discountPaise: 0 },
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
    isRecommended: false,
    status: 'AVAILABLE',
    iosProductId: null,
    androidProductId: null,
    iosVerifiedAt: null,
    androidVerifiedAt: null,
    blockedReason: null,
    offerName: null,
    offerStartsAt: null,
    offerEndsAt: null,
    pricing: [{ orgType: 'ACADEMIC', basePricePaise: 0, discountPaise: 0, iosProductId: null, androidProductId: null, iosVerifiedAt: null, androidVerifiedAt: null }],
    features: [],
    ...overrides,
  }
}

function view(overrides: Partial<AdminMonetizationView> = {}): AdminMonetizationView {
  return { features: [feature()], plans: [plan()], reachDistancesKm: { NEARBY: 5, CITY: 25, REGION: 100, WIDE: 500 }, ...overrides }
}

async function renderScreen(data: AdminMonetizationView = view(), options: { usage?: boolean } = {}) {
  getMock.mockResolvedValue(data)
  render(<Monetization />)
  // Waits on the fetch resolving rather than on any particular feature: this
  // screen is rendered from whatever the server sends, and a test that names a
  // feature to wait for would be a test that knows the registry.
  await waitFor(() => expect(getMock).toHaveBeenCalled())
  await waitFor(() => expect(screen.queryAllByText('Loading…')).toHaveLength(0))
  // A list item only exists once the data has rendered AND the drafts that fill the rows have been built from it.
  await screen.findAllByRole('listitem')
  if (options.usage) {
    fireEvent.click(screen.getByRole('button', { name: 'Pay per use' }))
  }
}

const ORG_WORDS: Record<string, string> = { ACADEMIC: 'College', CORPORATE: 'Company' }

/** The one price row for an org type, on the Pay per use tab, so a query cannot pick up a plan's copy of the same feature. */
function priceRow(orgType: string): HTMLElement {
  return screen.getByText(ORG_WORDS[orgType] ?? orgType).closest('li') as HTMLElement
}

/** A benefit's row in the plan being edited, which the screen opens on the first paid plan. */
function planRow(planName: string, featureLabel: string): HTMLElement {
  const panel = screen.getByTestId(`plan-panel-${planName.toUpperCase()}`)
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
      { usage: true },
    )

    expect(screen.getAllByText('Something new').length).toBeGreaterThan(0)
    expect(screen.getByText('Invented after this console shipped.')).toBeTruthy()
  })

  it('converts a price typed in rupees into paise before saving it', async () => {
    await renderScreen(view(), { usage: true })

    const row = priceRow('ACADEMIC')
    const input = within(row).getAllByRole('textbox')[0]!
    fireEvent.change(input, { target: { value: '79' } })
    fireEvent.click(within(row).getByText('Save'))

    await waitFor(() =>
      expect(setFeaturePriceMock).toHaveBeenCalledWith({
        featureKey: 'BOOST',
        orgType: 'ACADEMIC',
        isPaid: true,
        isOffered: true,
        basePricePaise: 7900,
        discountPaise: 0,
      }),
    )
  })

  it('sends no switch for a feature that cannot be switched off, and none is drawn', async () => {
    await renderScreen(view({ features: [feature({ key: 'LISTING_POST', label: 'Posting a listing', switchable: false })] }), { usage: true })

    const row = priceRow('ACADEMIC')
    expect(within(row).queryByLabelText('On sale')).toBeNull()
    fireEvent.change(within(row).getAllByRole('textbox')[0]!, { target: { value: '5' } })
    fireEvent.click(within(row).getByText('Save'))

    await waitFor(() => expect(setFeaturePriceMock).toHaveBeenCalled())
    expect(setFeaturePriceMock.mock.calls.at(-1)![0]).not.toHaveProperty('isOffered')
  })

  it('switches an add-on off for one kind of organisation without touching its price, and explains it is not the same as free', async () => {
    await renderScreen(view(), { usage: true })

    const row = priceRow('ACADEMIC')
    fireEvent.click(within(row).getByLabelText('On sale'))

    expect(within(row).getByText(/This is not the same as free/)).toBeTruthy()
    fireEvent.click(within(row).getByText('Save'))
    await waitFor(() =>
      expect(setFeaturePriceMock).toHaveBeenCalledWith({
        featureKey: 'BOOST',
        orgType: 'ACADEMIC',
        isPaid: true,
        isOffered: false,
        basePricePaise: 5900,
        discountPaise: 0,
      }),
    )
  })

  describe('reach distances', () => {
    it('shows the live distances and saves a change as four whole numbers', async () => {
      setReachDistancesMock.mockResolvedValue({ NEARBY: 3, CITY: 25, REGION: 100, WIDE: 800 })
      await renderScreen(view(), { usage: true })

      expect((screen.getByLabelText('Nearby distance in km') as HTMLInputElement).value).toBe('5')
      fireEvent.change(screen.getByLabelText('Nearby distance in km'), { target: { value: '3' } })
      fireEvent.change(screen.getByLabelText('Far and wide distance in km'), { target: { value: '800' } })
      fireEvent.click(screen.getByText('Save distances'))

      await waitFor(() => expect(setReachDistancesMock).toHaveBeenCalledWith({ NEARBY: 3, CITY: 25, REGION: 100, WIDE: 800 }))
    })

    it('refuses a step that does not reach farther than the one before it, naming both, and saves nothing', async () => {
      await renderScreen(view(), { usage: true })

      fireEvent.change(screen.getByLabelText('Across the city distance in km'), { target: { value: '5' } })

      expect(screen.getByText(/Across the city \(5 km\) must reach farther than Nearby \(5 km\)/)).toBeTruthy()
      expect((screen.getByText('Save distances') as HTMLButtonElement).disabled).toBe(true)
    })

    it('refuses fractions, blanks and a distance past the Earth', async () => {
      await renderScreen(view(), { usage: true })

      fireEvent.change(screen.getByLabelText('Nearby distance in km'), { target: { value: '2.5' } })
      expect(screen.getByText('Nearby must be a whole number of km.')).toBeTruthy()
      fireEvent.change(screen.getByLabelText('Nearby distance in km'), { target: { value: '' } })
      expect(screen.getByText('Nearby must be a whole number of km.')).toBeTruthy()
      fireEvent.change(screen.getByLabelText('Nearby distance in km'), { target: { value: '5' } })
      fireEvent.change(screen.getByLabelText('Far and wide distance in km'), { target: { value: '20001' } })
      expect(screen.getByText('Far and wide must be from 1 to 20000 km.')).toBeTruthy()
    })
  })

  it('refuses to save a feature marked paid that is free after its discount', async () => {
    await renderScreen(view(), { usage: true })

    const row = priceRow('ACADEMIC')
    const [price, discount] = within(row).getAllByRole('textbox')
    fireEvent.change(price!, { target: { value: '59' } })
    fireEvent.change(discount!, { target: { value: '59' } })

    expect(within(row).getByText(/would read as free to every member/)).toBeTruthy()
    fireEvent.click(within(row).getByText('Save'))
    expect(setFeaturePriceMock).not.toHaveBeenCalled()
  })

  it('refuses a discount larger than the price, before the round trip', async () => {
    await renderScreen(view(), { usage: true })

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

  it('shows every plan as a card with what a member pays, and edits the one picked', async () => {
    await renderScreen(
      view({
        plans: [
          plan(),
          plan({ id: 'pln_plus', key: 'PLUS', name: 'Plus', isDefault: false, sortOrder: 1, pricing: [{ orgType: 'ACADEMIC', basePricePaise: 9900, discountPaise: 2000, iosProductId: null, androidProductId: null, iosVerifiedAt: null, androidVerifiedAt: null }] }),
          plan({ id: 'pln_pro', key: 'PRO', name: 'Pro', isDefault: false, sortOrder: 2, pricing: [{ orgType: 'ACADEMIC', basePricePaise: 19900, discountPaise: 5000, iosProductId: null, androidProductId: null, iosVerifiedAt: null, androidVerifiedAt: null }] }),
        ],
      }),
    )

    // The offer price large, the list price struck through - what a member sees.
    const plusCard = screen.getByTestId('plan-card-PLUS')
    expect(within(plusCard).getByText('₹79')).toBeTruthy()
    expect(within(plusCard).getByText('₹99')).toBeTruthy()

    // Opens on the first paid plan; picking another card switches the editor to it.
    expect(screen.getByTestId('plan-panel-PLUS')).toBeTruthy()
    fireEvent.click(screen.getByTestId('plan-card-PRO'))
    expect(screen.getByTestId('plan-panel-PRO')).toBeTruthy()
    expect(screen.queryByTestId('plan-panel-PLUS')).toBeNull()
  })

  it('shows what a member will pay beside the price being typed', async () => {
    await renderScreen(view(), { usage: true })

    const row = priceRow('ACADEMIC')
    const [price, discount] = within(row).getAllByRole('textbox')
    fireEvent.change(price!, { target: { value: '59' } })
    fireEvent.change(discount!, { target: { value: '10' } })

    expect(within(row).getByText('₹49')).toBeTruthy()
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
            blockedReason: 'Not purchasable — this plan has a price but no Play product id.',
          }),
        ],
      }),
    )

    // Said on the plan's card and again where it is edited.
    expect(screen.getAllByText(/no Play product id/).length).toBeGreaterThan(0)
  })

  it('says plainly when nothing is paid, because a console full of prices reads as if it were', async () => {
    await renderScreen(
      view({
        features: [
          feature({
            pricing: [
              { orgType: 'ACADEMIC', isPaid: false, isOffered: true, basePricePaise: 5900, discountPaise: 0 },
              { orgType: 'CORPORATE', isPaid: false, isOffered: true, basePricePaise: 5900, discountPaise: 0 },
            ],
          }),
        ],
      }),
    )

    expect(screen.getByText(/Nothing is marked paid/)).toBeTruthy()
  })
})
