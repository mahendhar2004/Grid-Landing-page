import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NewPlanForm, PlanEditor } from './PlanEditor'
import { planBodyFrom, planDraftFrom, problemWithNewPlan, problemWithPlanDraft, problemWithPrice } from './planDraft'
import { api } from '../api/endpoints'
import type { AdminPlan } from '../api/types'

vi.mock('../api/endpoints', () => ({
  api: {
    monetization: {
      createPlan: vi.fn(),
      updatePlan: vi.fn(),
      setPlanPricing: vi.fn(),
      confirmPlanProduct: vi.fn(),
    },
  },
}))

const updatePlan = vi.mocked(api.monetization.updatePlan)
const setPlanPricing = vi.mocked(api.monetization.setPlanPricing)
const confirmPlanProduct = vi.mocked(api.monetization.confirmPlanProduct)
const createPlan = vi.mocked(api.monetization.createPlan)

function plan(overrides: Partial<AdminPlan> = {}): AdminPlan {
  return {
    id: 'pln_plus',
    key: 'PLUS',
    name: 'Plus',
    badgeLabel: 'Plus Member',
    sortOrder: 1,
    isDefault: false,
    isRecommended: false,
    status: 'AVAILABLE',
    iosProductId: 'sub_plus',
    androidProductId: 'sub_plus',
    iosVerifiedAt: '2026-09-30T00:00:00.000Z',
    androidVerifiedAt: '2026-09-30T00:00:00.000Z',
    blockedReason: null,
    offerName: null,
    offerStartsAt: null,
    offerEndsAt: null,
    pricing: [{ orgType: 'ACADEMIC', basePricePaise: 7900, discountPaise: 1000, iosProductId: null, androidProductId: null, iosVerifiedAt: null, androidVerifiedAt: null }],
    features: [],
    ...overrides,
  }
}

describe('the draft', () => {
  it('shows a plan as the text fields will hold it, prices in rupees', () => {
    const draft = planDraftFrom(plan())

    expect(draft).toMatchObject({ name: 'Plus', badgeLabel: 'Plus Member', sortOrder: '1', status: 'AVAILABLE', iosProductId: 'sub_plus' })
    expect(draft.prices.ACADEMIC).toEqual({ base: '79', discount: '10', iosProductId: '', androidProductId: '' })
    expect(draft.prices.CORPORATE).toEqual({ base: '', discount: '', iosProductId: '', androidProductId: '' })
  })

  it('sends an empty badge or product id as null, and trims the name', () => {
    const body = planBodyFrom({ ...planDraftFrom(plan()), name: '  Plus+ ', badgeLabel: '   ', iosProductId: '', androidProductId: ' sub_x ' })

    expect(body).toMatchObject({ name: 'Plus+', badgeLabel: null, iosProductId: null, androidProductId: 'sub_x', sortOrder: 1 })
  })
})

describe('what is wrong with the details', () => {
  const free = plan({ key: 'FREE', name: 'Free', isDefault: true, iosProductId: null, androidProductId: null, badgeLabel: null })

  it.each([
    ['a blank name', { name: ' ' }, /needs a name/],
    ['a position that is not a number', { sortOrder: 'first' }, /whole number/],
    ['a negative position', { sortOrder: '-1' }, /whole number/],
    ['a long badge', { badgeLabel: 'x'.repeat(25) }, /24 characters/],
    ['the star on a plan that is not on sale', { status: 'DRAFT' as const, isRecommended: true }, /on sale/],
  ])('says so for %s', (_label, patch, message) => {
    expect(problemWithPlanDraft({ ...planDraftFrom(plan()), ...patch }, plan())).toMatch(message)
  })

  it('is content with a finished plan', () => {
    expect(problemWithPlanDraft(planDraftFrom(plan()), plan())).toBeNull()
  })

  it.each([
    ['taking the free plan off sale', { status: 'RETIRED' as const }, /has to stay on sale/],
    ['starring the free plan', { isRecommended: true }, /already has/],
    ['giving the free plan a store product', { iosProductId: 'sub_free' }, /no store product/],
  ])('refuses %s', (_label, patch, message) => {
    expect(problemWithPlanDraft({ ...planDraftFrom(free), ...patch }, free)).toMatch(message)
  })
})

describe('the listed price', () => {
  it.each([
    [{ base: '', discount: '' }, null],
    [{ base: '79', discount: '' }, null],
    [{ base: '79', discount: '10' }, null],
    [{ base: 'abc', discount: '' }, /number/],
    [{ base: '-5', discount: '' }, /number/],
    [{ base: '79', discount: '80' }, /more than the price/],
  ])('%j', (price, message) => {
    const problem = problemWithPrice({ iosProductId: '', androidProductId: '', ...price })
    if (message === null) expect(problem).toBeNull()
    else expect(problem).toMatch(message)
  })
})

describe('a new plan', () => {
  it.each([
    ['', 'TEAM', [], /name/],
    ['Team', 'team', [], /key is/],
    ['Team', 'T', [], /key is/],
    ['Team', '1TEAM', [], /key is/],
    ['Team', 'PLUS', ['PLUS'], /already exists/],
  ])('refuses name %j and key %j', (name, key, existing, message) => {
    expect(problemWithNewPlan(key, name, existing)).toMatch(message)
  })

  it('accepts a good one', () => {
    expect(problemWithNewPlan('TEAM', 'Team', ['PLUS'])).toBeNull()
  })
})

describe('PlanEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updatePlan.mockResolvedValue(plan())
    setPlanPricing.mockResolvedValue(plan())
    confirmPlanProduct.mockResolvedValue(plan())
    createPlan.mockResolvedValue(plan({ key: 'TEAM', name: 'Team', status: 'DRAFT' }))
  })
  afterEach(cleanup)

  function open(overrides: Partial<AdminPlan> = {}, onChanged = vi.fn()) {
    render(<PlanEditor plan={plan(overrides)} onChanged={onChanged} />)
    return onChanged
  }

  it('saves a named sale with its first and last day, as the start and end of those days in India', async () => {
    open()

    fireEvent.change(screen.getByLabelText('Sale name'), { target: { value: 'Early bird' } })
    fireEvent.change(screen.getByLabelText('First day'), { target: { value: '2026-10-02' } })
    fireEvent.change(screen.getByLabelText('Last day'), { target: { value: '2026-10-31' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }))

    await waitFor(() =>
      expect(updatePlan).toHaveBeenCalledWith(
        'PLUS',
        expect.objectContaining({ offerName: 'Early bird', offerStartsAt: '2026-10-01T18:30:00.000Z', offerEndsAt: '2026-10-31T18:29:59.000Z' }),
      ),
    )
  })

  it('refuses a dated sale with no name, and a sale that ends before it starts', async () => {
    open()

    fireEvent.change(screen.getByLabelText('Last day'), { target: { value: '2026-10-31' } })
    expect(screen.getByText(/Name the sale/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Save details' })).toHaveProperty('disabled', true)

    fireEvent.change(screen.getByLabelText('Sale name'), { target: { value: 'Early bird' } })
    fireEvent.change(screen.getByLabelText('First day'), { target: { value: '2026-11-05' } })
    expect(screen.getByText(/end on or after the day it starts/)).toBeTruthy()
  })

  it('shows a plan\'s saved sale back as the days it was set for', () => {
    open({ offerName: 'Early bird', offerStartsAt: '2026-10-01T18:30:00.000Z', offerEndsAt: '2026-10-31T18:29:59.000Z' })

    expect((screen.getByLabelText('Sale name') as HTMLInputElement).value).toBe('Early bird')
    expect((screen.getByLabelText('First day') as HTMLInputElement).value).toBe('2026-10-02')
    expect((screen.getByLabelText('Last day') as HTMLInputElement).value).toBe('2026-10-31')
  })

  it('saves only what changed in the details, with the key in the address, then reloads', async () => {
    const onChanged = open()

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Plus+' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }))

    await waitFor(() => expect(updatePlan).toHaveBeenCalledWith('PLUS', expect.objectContaining({ name: 'Plus+', status: 'AVAILABLE', isRecommended: false })))
    await waitFor(() => expect(onChanged).toHaveBeenCalled())
  })

  it('does not offer to save until something has changed, or while something is wrong', () => {
    open()
    expect(screen.getByRole('button', { name: 'Save details' }).hasAttribute('disabled')).toBe(true)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } })
    expect(screen.getByRole('button', { name: 'Save details' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByText('A plan needs a name.')).toBeTruthy()
  })

  it('stars the plan by saving it as the recommended one', async () => {
    open()

    fireEvent.click(screen.getByLabelText(/Recommended/))
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }))

    await waitFor(() => expect(updatePlan).toHaveBeenCalledWith('PLUS', expect.objectContaining({ isRecommended: true })))
  })

  it('shows a refusal from the server instead of pretending it saved', async () => {
    updatePlan.mockRejectedValue({ message: 'Plus has no price, so it cannot be made available.', correlationId: 'corr-1' })
    open()

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Plus+' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }))

    await waitFor(() => expect(screen.getByText(/no price/)).toBeTruthy())
    expect(screen.queryByText('Saved.')).toBeNull()
  })

  it('shows a confirmed product as confirmed, and an unconfirmed one with a way to confirm it', async () => {
    open({ androidVerifiedAt: null })

    expect(screen.getByText(/Confirmed/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'I checked it exists' }))

    await waitFor(() => expect(confirmPlanProduct).toHaveBeenCalledWith({ planKey: 'PLUS', store: 'ANDROID' }))
  })

  it('will not confirm a product id that has been typed but not saved', () => {
    open({ androidVerifiedAt: null })

    fireEvent.change(screen.getByLabelText('Play product id'), { target: { value: 'sub_new' } })

    expect(screen.getByText('Save the product id first.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'I checked it exists' }).hasAttribute('disabled')).toBe(true)
  })

  it('saves the listed price in paise for one organisation type', async () => {
    open()

    const prices = screen.getAllByLabelText('Price / month (₹)')
    fireEvent.change(prices[1]!, { target: { value: '99' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Save price' })[1]!)

    await waitFor(() => expect(setPlanPricing).toHaveBeenCalledWith({ planKey: 'PLUS', orgType: 'CORPORATE', basePricePaise: 9900, discountPaise: 0, iosProductId: null, androidProductId: null }))
  })

  it('saves a product of its own for one kind of organisation with its price, and never touches the other kind', async () => {
    open()

    fireEvent.change(screen.getAllByLabelText('Price / month (₹)')[1]!, { target: { value: '199' } })
    fireEvent.change(screen.getByLabelText('Play product for companies (optional)'), { target: { value: 'sub_plus_company_monthly' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Save price' })[1]!)

    await waitFor(() =>
      expect(setPlanPricing).toHaveBeenCalledWith({
        planKey: 'PLUS',
        orgType: 'CORPORATE',
        basePricePaise: 19900,
        discountPaise: 0,
        iosProductId: null,
        androidProductId: 'sub_plus_company_monthly',
      }),
    )
    expect(setPlanPricing).toHaveBeenCalledTimes(1)
  })

  it('confirms the kind\'s own product, not the plan\'s, once it is saved', async () => {
    open({
      pricing: [
        { orgType: 'ACADEMIC', basePricePaise: 9900, discountPaise: 0, iosProductId: null, androidProductId: null, iosVerifiedAt: null, androidVerifiedAt: null },
        { orgType: 'CORPORATE', basePricePaise: 19900, discountPaise: 0, iosProductId: null, androidProductId: 'sub_plus_company_monthly', iosVerifiedAt: null, androidVerifiedAt: null },
      ],
    })

    const block = screen.getByTestId('plan-price-products-PLUS-CORPORATE')
    fireEvent.click(within(block).getAllByRole('button', { name: 'I checked it exists' })[0]!)

    await waitFor(() => expect(confirmPlanProduct).toHaveBeenCalledWith({ planKey: 'PLUS', store: 'ANDROID', orgType: 'CORPORATE' }))
  })

  it('refuses a discount bigger than the price before asking the server', () => {
    open()

    fireEvent.change(screen.getAllByLabelText('Discount (₹)')[0]!, { target: { value: '100' } })

    expect(screen.getByText('The discount cannot be more than the price.')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Save price' })[0].hasAttribute('disabled')).toBe(true)
  })

  it('has no store products or price for the free plan', () => {
    open({ key: 'FREE', name: 'Free', isDefault: true, iosProductId: null, androidProductId: null })

    expect(screen.queryByLabelText('App Store product id')).toBeNull()
    expect(screen.queryByText('Price the app lists')).toBeNull()
    expect(screen.getByLabelText(/Recommended/).hasAttribute('disabled')).toBe(true)
  })
})

describe('NewPlanForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createPlan.mockResolvedValue(plan({ key: 'TEAM', name: 'Team', status: 'DRAFT' }))
  })
  afterEach(cleanup)

  it('creates a draft with the key as typed in capitals, then closes and reloads', async () => {
    const onCreated = vi.fn()
    render(<NewPlanForm existingKeys={['PLUS']} onCreated={onCreated} />)

    fireEvent.click(screen.getByRole('button', { name: 'New plan' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Team' } })
    fireEvent.change(screen.getByLabelText(/^Key/), { target: { value: 'team-1' } })
    expect((screen.getByLabelText(/^Key/) as HTMLInputElement).value).toBe('TEAM1')
    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))

    await waitFor(() => expect(createPlan).toHaveBeenCalledWith({ key: 'TEAM1', name: 'Team' }))
    await waitFor(() => expect(onCreated).toHaveBeenCalled())
    expect(screen.queryByTestId('new-plan-form')).toBeNull()
  })

  it('will not create until the key and name are good', () => {
    render(<NewPlanForm existingKeys={['PLUS']} onCreated={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'New plan' }))

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Plus' } })
    fireEvent.change(screen.getByLabelText(/^Key/), { target: { value: 'plus' } })

    expect(screen.getByText('A plan with the key PLUS already exists.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Create draft' }).hasAttribute('disabled')).toBe(true)
  })
})
