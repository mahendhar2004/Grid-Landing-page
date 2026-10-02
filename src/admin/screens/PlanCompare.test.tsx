import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { AdminFeature, AdminPlan } from '../api/types'
import { PlanCompare } from './PlanCompare'
import { savedAllowance, type Allowance } from './comparePlans'

afterEach(cleanup)

function feature(key: string, label: string, academic: number, corporate: number): AdminFeature {
  return {
    key,
    label,
    explain: '',
    model: 'PER_USE',
    unit: null,
    enforcedAt: null,
    switchable: true,
    pricing: [
      { orgType: 'ACADEMIC', isPaid: true, isOffered: true, basePricePaise: academic, discountPaise: 0 },
      { orgType: 'CORPORATE', isPaid: true, isOffered: true, basePricePaise: corporate, discountPaise: 0 },
    ],
  }
}

function plan(key: string, name: string, sortOrder: number, academic: number, corporate: number, isDefault: boolean, boosts: number | null): AdminPlan {
  const product = { iosProductId: null, androidProductId: null, iosVerifiedAt: null, androidVerifiedAt: null }
  return {
    id: key,
    key,
    name,
    badgeLabel: null,
    audience: null,
    sortOrder,
    isDefault,
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
    pricing: [
      { orgType: 'ACADEMIC', basePricePaise: academic, discountPaise: 0, ...product },
      { orgType: 'CORPORATE', basePricePaise: corporate, discountPaise: 0, ...product },
    ],
    features: boosts === null ? [] : [{ featureKey: 'BOOST', included: true, includedQuantity: boosts, discountPercent: 0, settingValue: null, grantPaise: null }],
  }
}

const FEATURES = [feature('BOOST', 'Boosts', 1900, 3500)]
const PLANS = [plan('FREE', 'Free', 0, 0, 0, true, null), plan('PLUS', 'Plus', 1, 9900, 19900, false, 3), plan('PRO', 'Pro', 2, 19900, 39900, false, 8)]

function renderCompare(overrides: Record<string, Allowance> = {}, unsaved: string[] = []) {
  return render(
    <PlanCompare
      features={FEATURES}
      plans={PLANS}
      allowanceOf={(planKey, featureKey) => overrides[`${planKey}:${featureKey}`] ?? savedAllowance(PLANS.find((p) => p.key === planKey)!, featureKey)}
      isUnsaved={(planKey, featureKey) => unsaved.includes(`${planKey}:${featureKey}`)}
    />,
  )
}

describe('PlanCompare', () => {
  it('puts every plan in a column with its price, its allowances, what they are worth and the share paid', () => {
    renderCompare()

    expect(screen.getByTestId('compare-price-FREE').textContent).toBe('Free')
    expect(screen.getByTestId('compare-price-PLUS').textContent).toBe('₹99')
    expect(screen.getByTestId('compare-price-PRO').textContent).toBe('₹199')
    expect(screen.getByTestId('compare-PLUS-BOOST').textContent).toContain('3')
    // 3 boosts at ₹19 = ₹57; ₹99 is 174% of that - a plan priced above its worth.
    expect(screen.getByTestId('compare-worth-PLUS').textContent).toBe('₹57')
    expect(screen.getByTestId('compare-share-PLUS').textContent).toBe('174%')
  })

  it('shows how many more or fewer than the plan to its left', () => {
    renderCompare()

    expect(screen.getByTestId('compare-PRO-BOOST').textContent).toContain('+5')
  })

  it('says so, in words, when a plan costs more than it is worth', () => {
    renderCompare()

    expect(within(screen.getByTestId('compare-warnings')).getByText(/Plus costs ₹99 but what is in it is worth ₹57/)).toBeTruthy()
  })

  it('reflects an allowance typed but not saved, and marks it', () => {
    renderCompare({ 'PLUS:BOOST': { kind: 'count', count: 6 } }, ['PLUS:BOOST'])

    expect(screen.getByTestId('compare-PLUS-BOOST').textContent).toContain('6')
    expect(within(screen.getByTestId('compare-PLUS-BOOST')).getByLabelText('not saved yet')).toBeTruthy()
    expect(screen.getByTestId('compare-worth-PLUS').textContent).toBe('₹114')
    expect(screen.getByTestId('compare-share-PLUS').textContent).toBe('87%')
  })

  it('switches to companies, whose pay-per-use prices and plan prices differ', () => {
    renderCompare()

    fireEvent.click(screen.getByRole('button', { name: 'Companies' }))

    expect(screen.getByTestId('compare-price-PLUS').textContent).toBe('₹199')
    expect(screen.getByTestId('compare-worth-PLUS').textContent).toBe('₹105')
  })

  it('is content when the ladder makes sense', () => {
    renderCompare({ 'PLUS:BOOST': { kind: 'count', count: 6 }, 'PRO:BOOST': { kind: 'count', count: 14 } })

    expect(screen.getByTestId('compare-ok')).toBeTruthy()
  })
})
