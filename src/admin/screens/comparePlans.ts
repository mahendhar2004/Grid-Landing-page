import type { AdminFeature, AdminPlan, OrganizationType } from '../api/types'

/**
 * The plans set side by side, and what is odd about them.
 *
 * A plan is easy to get wrong in isolation: each number looks fine in its own
 * box. What matters is how the plans relate - does the dearer one give more, is
 * it a better or a worse deal than the cheaper one, does any plan cost more than
 * the things in it are worth. This works that out from the same data the editor
 * uses, apart from the screen so it can be tested.
 *
 * "Worth" is what the plan's counted allowances would cost bought one at a time
 * at the pay-per-use prices for that kind of organisation - the same reckoning
 * the member's plan screen shows.
 */

/** What a plan gives of one feature. */
export type Allowance = { kind: 'none' } | { kind: 'unlimited' } | { kind: 'count'; count: number }

export interface CompareRow {
  featureKey: string
  label: string
  /** A countable allowance (priced per use) or an on/off perk. */
  model: 'PER_USE' | 'PERK'
  /** What one costs on its own for this kind of organisation, or null where it has no price. */
  unitPricePaise: number | null
}

export interface CompareColumn {
  planKey: string
  name: string
  isDefault: boolean
  /** What the plan costs this kind of organisation a month, or null where it is not sold to them. */
  pricePaise: number | null
  allowances: Record<string, Allowance>
  /** What the counted allowances are worth bought one at a time. */
  worthPaise: number
  /** The price as a share of the worth (0-100+), or null where either is missing. */
  percentOfWorth: number | null
}

export interface Warning {
  tone: 'bad' | 'warn'
  text: string
}

export interface PlanComparison {
  rows: CompareRow[]
  columns: CompareColumn[]
  warnings: Warning[]
}

export interface CompareInput {
  features: readonly AdminFeature[]
  plans: readonly AdminPlan[]
  orgType: OrganizationType
  /** What a plan gives of a feature - the console passes what has been typed, saved or not. */
  allowanceOf: (planKey: string, featureKey: string) => Allowance
}

/** The saved allowance, for when nothing has been typed. */
export function savedAllowance(plan: AdminPlan, featureKey: string): Allowance {
  const cell = plan.features.find((entry) => entry.featureKey === featureKey)
  if (!cell || !cell.included) return { kind: 'none' }
  if (cell.includedQuantity === null) return { kind: 'unlimited' }
  return cell.includedQuantity > 0 ? { kind: 'count', count: cell.includedQuantity } : { kind: 'none' }
}

function unitPriceFor(feature: AdminFeature, orgType: OrganizationType): number | null {
  const row = feature.pricing.find((entry) => entry.orgType === orgType)
  if (!row || !row.isPaid || row.isOffered === false) return null
  const final = row.basePricePaise - row.discountPaise
  return final > 0 ? final : null
}

function priceFor(plan: AdminPlan, orgType: OrganizationType): number | null {
  const row = plan.pricing.find((entry) => entry.orgType === orgType)
  if (!row) return null
  const final = row.basePricePaise - row.discountPaise
  return final > 0 ? final : null
}

function rupees(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString('en-IN')}`
}

export function comparePlans({ features, plans, orgType, allowanceOf }: CompareInput): PlanComparison {
  // Only what a member can actually get more of: an allowance with a price, or a perk. A feature that is free, or switched off for this kind, is not part of the comparison.
  const rows: CompareRow[] = features
    .filter((feature) => feature.model === 'PER_USE' || feature.model === 'PERK')
    .map((feature): CompareRow => ({
      featureKey: feature.key,
      label: feature.label,
      model: feature.model as 'PER_USE' | 'PERK',
      unitPricePaise: feature.model === 'PER_USE' ? unitPriceFor(feature, orgType) : null,
    }))
    .filter((row) => row.model === 'PERK' || row.unitPricePaise !== null)

  const ordered = plans.slice().sort((a, b) => a.sortOrder - b.sortOrder)
  const columns = ordered.map((plan): CompareColumn => {
    const allowances: Record<string, Allowance> = {}
    let worthPaise = 0
    for (const row of rows) {
      const allowance = allowanceOf(plan.key, row.featureKey)
      allowances[row.featureKey] = allowance
      if (row.model === 'PER_USE' && row.unitPricePaise !== null && allowance.kind === 'count') {
        worthPaise += allowance.count * row.unitPricePaise
      }
    }
    const pricePaise = plan.isDefault ? 0 : priceFor(plan, orgType)
    return {
      planKey: plan.key,
      name: plan.name,
      isDefault: plan.isDefault,
      pricePaise,
      allowances,
      worthPaise,
      percentOfWorth: pricePaise !== null && pricePaise > 0 && worthPaise > 0 ? Math.round((pricePaise / worthPaise) * 100) : null,
    }
  })

  const warnings: Warning[] = []
  const paid = columns.filter((column) => !column.isDefault && column.pricePaise !== null && column.pricePaise > 0)

  for (const column of paid) {
    if (column.worthPaise > 0 && column.pricePaise! >= column.worthPaise) {
      warnings.push({
        tone: 'bad',
        text: `${column.name} costs ${rupees(column.pricePaise!)} but what is in it is worth ${rupees(column.worthPaise)} bought one at a time - nobody would take it over paying as they go.`,
      })
    }
    if (column.worthPaise === 0 && !rows.some((row) => row.model === 'PERK' && column.allowances[row.featureKey]?.kind !== 'none')) {
      warnings.push({ tone: 'warn', text: `${column.name} costs ${rupees(column.pricePaise!)} but gives nothing with a price or a perk - members would not see what they are paying for.` })
    }
  }

  // Each step up the ladder, by price: it should give at least as much, and not be a worse deal.
  const byPrice = paid.slice().sort((a, b) => a.pricePaise! - b.pricePaise!)
  for (let i = 1; i < byPrice.length; i += 1) {
    const lower = byPrice[i - 1]!
    const higher = byPrice[i]!
    for (const row of rows) {
      const a = lower.allowances[row.featureKey]!
      const b = higher.allowances[row.featureKey]!
      if (row.model === 'PER_USE' && a.kind === 'count' && (b.kind === 'none' || (b.kind === 'count' && b.count < a.count))) {
        warnings.push({
          tone: 'bad',
          text: `${higher.name} costs more than ${lower.name} but gives ${b.kind === 'none' ? 'no' : `fewer`} ${row.label.toLowerCase()} (${b.kind === 'count' ? b.count : 0} against ${a.count}).`,
        })
      }
      if (row.model === 'PERK' && a.kind !== 'none' && b.kind === 'none') {
        warnings.push({ tone: 'warn', text: `${lower.name} has ${row.label.toLowerCase()} but the dearer ${higher.name} does not.` })
      }
    }
    if (higher.percentOfWorth !== null && lower.percentOfWorth !== null && higher.percentOfWorth > lower.percentOfWorth + 10) {
      warnings.push({
        tone: 'warn',
        text: `${higher.name} is a worse deal than ${lower.name}: members pay ${higher.percentOfWorth}% of what it is worth, against ${lower.percentOfWorth}%. The dearer plan should usually save more, not less.`,
      })
    }
    if (higher.pricePaise! / lower.pricePaise! > 3) {
      warnings.push({ tone: 'warn', text: `${higher.name} costs ${(higher.pricePaise! / lower.pricePaise!).toFixed(1)} times what ${lower.name} does - a big jump for someone deciding between them.` })
    }
  }

  return { rows, columns, warnings }
}
