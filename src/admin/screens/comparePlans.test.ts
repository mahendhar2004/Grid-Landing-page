import { describe, expect, it } from 'vitest'

import type { AdminFeature, AdminPlan } from '../api/types'
import { comparePlans, savedAllowance, type Allowance } from './comparePlans'

const price = (base: number) => ({ orgType: 'ACADEMIC' as const, isPaid: true, isOffered: true, basePricePaise: base, discountPaise: 0 })
const feature = (key: string, label: string, model: 'PER_USE' | 'PERK', base: number): AdminFeature => ({
  key,
  label,
  explain: '',
  model,
  unit: null,
  enforcedAt: null,
  switchable: true,
  pricing: [price(base)],
})
const plan = (key: string, name: string, sortOrder: number, base: number, isDefault = false, cells: Array<[string, number | null]> = []): AdminPlan => ({
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
  pricing: [{ orgType: 'ACADEMIC', basePricePaise: base, discountPaise: 0, iosProductId: null, androidProductId: null, iosVerifiedAt: null, androidVerifiedAt: null }],
  features: cells.map(([featureKey, quantity]) => ({ featureKey, included: true, includedQuantity: quantity, discountPercent: 0, settingValue: null, grantPaise: null })),
})

const FEATURES = [feature('BOOST', 'Boosts', 'PER_USE', 1900), feature('REACH_CITY', 'Reach across the city', 'PER_USE', 1500), feature('PRIORITY_SEARCH', 'Search placement', 'PERK', 0)]

function compare(plans: AdminPlan[], overrides: Record<string, Allowance> = {}) {
  return comparePlans({
    features: FEATURES,
    plans,
    orgType: 'ACADEMIC',
    allowanceOf: (planKey, featureKey) => overrides[`${planKey}:${featureKey}`] ?? savedAllowance(plans.find((p) => p.key === planKey)!, featureKey),
  })
}

const FREE = plan('FREE', 'Free', 0, 0, true)
const PLUS = plan('PLUS', 'Plus', 2, 9900, false, [['BOOST', 3], ['REACH_CITY', 5]])
const PRO = plan('PRO', 'Pro', 3, 19900, false, [['BOOST', 8], ['REACH_CITY', 10], ['PRIORITY_SEARCH', null]])

describe('comparePlans', () => {
  it('values each plan\'s counted allowances at the pay-per-use prices, and says what share of that the member pays', () => {
    const { columns } = compare([FREE, PLUS, PRO])

    const plus = columns.find((column) => column.planKey === 'PLUS')!
    expect(plus.worthPaise).toBe(3 * 1900 + 5 * 1500)
    expect(plus.percentOfWorth).toBe(Math.round((9900 / 13200) * 100))
  })

  it('lists only what can be got more of: priced allowances and perks, not features that are free or off for this kind', () => {
    const off: AdminFeature = { ...feature('REACH_WIDE', 'Reach far and wide', 'PER_USE', 2900), pricing: [{ ...price(2900), isOffered: false }] }
    const free: AdminFeature = { ...feature('LISTING_POST', 'Posting a listing', 'PER_USE', 0), pricing: [{ ...price(0), isPaid: false }] }
    const { rows } = comparePlans({ features: [...FEATURES, off, free], plans: [FREE], orgType: 'ACADEMIC', allowanceOf: () => ({ kind: 'none' }) })

    expect(rows.map((row) => row.featureKey)).toEqual(['BOOST', 'REACH_CITY', 'PRIORITY_SEARCH'])
  })

  it('says nothing is wrong with plans that step up sensibly', () => {
    const { warnings } = compare([FREE, PLUS, PRO])

    expect(warnings.filter((warning) => warning.tone === 'bad')).toEqual([])
  })

  it('flags a plan that costs more than everything in it is worth', () => {
    const { warnings } = compare([FREE, plan('LITE', 'Lite', 1, 6000, false, [['BOOST', 1], ['REACH_CITY', 1]])])

    expect(warnings).toEqual([expect.objectContaining({ tone: 'bad', text: expect.stringContaining('Lite costs ₹60 but what is in it is worth ₹34') })])
  })

  it('flags a dearer plan that gives fewer of something than a cheaper one - typed but not yet saved counts', () => {
    const { warnings } = compare([FREE, PLUS, PRO], { 'PRO:BOOST': { kind: 'count', count: 2 } })

    expect(warnings.map((warning) => warning.text)).toContain('Pro costs more than Plus but gives fewer boosts (2 against 3).')
  })

  it('flags a dearer plan that is a worse deal, and a big jump in price', () => {
    const { warnings } = compare([FREE, PLUS, plan('MAX', 'Max', 4, 60000, false, [['BOOST', 12], ['REACH_CITY', 12]])])

    const text = warnings.map((warning) => warning.text).join('\n')
    expect(text).toMatch(/Max is a worse deal than Plus/)
    expect(text).toMatch(/Max costs 6\.1 times what Plus does/)
  })

  it('flags a paid plan that gives nothing with a price or a perk', () => {
    const { warnings } = compare([FREE, plan('EMPTY', 'Empty', 1, 9900)])

    expect(warnings).toEqual([expect.objectContaining({ tone: 'warn', text: expect.stringContaining('gives nothing with a price or a perk') })])
  })

  it('treats an unlimited allowance as present but not countable, so it is never valued or flagged as fewer', () => {
    const { columns, warnings } = compare([FREE, PLUS, PRO], { 'PRO:BOOST': { kind: 'unlimited' } })

    expect(columns.find((column) => column.planKey === 'PRO')!.allowances['BOOST']).toEqual({ kind: 'unlimited' })
    expect(warnings.map((warning) => warning.text).join()).not.toMatch(/fewer boosts/)
  })
})

describe('savedAllowance', () => {
  it('reads none, unlimited and a count from what is stored', () => {
    expect(savedAllowance(PLUS, 'PRIORITY_SEARCH')).toEqual({ kind: 'none' })
    expect(savedAllowance(PRO, 'PRIORITY_SEARCH')).toEqual({ kind: 'unlimited' })
    expect(savedAllowance(PLUS, 'BOOST')).toEqual({ kind: 'count', count: 3 })
    expect(savedAllowance(plan('X', 'X', 1, 100, false, [['BOOST', 0]]), 'BOOST')).toEqual({ kind: 'none' })
  })
})
