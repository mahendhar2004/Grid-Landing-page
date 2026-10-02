import { useState } from 'react'

import type { AdminFeature, AdminPlan, OrganizationType } from '../api/types'
import { Panel, Segmented } from '../components/ui'
import { comparePlans, type Allowance, type CompareColumn, type CompareRow, type Warning } from './comparePlans'

/**
 * The plans side by side, with what looks wrong about them.
 *
 * Editing one plan at a time hides the thing that matters most: how the plans
 * relate. Here every plan is a column - what it costs, how many of each thing it
 * gives (with how many more or fewer than the plan before it), what that is worth
 * bought one at a time, and what share of that the member pays. Allowances show
 * what has been typed even before it is saved, marked with a dot; prices are as
 * saved. Anything odd is listed underneath in words.
 */

const KINDS: ReadonlyArray<{ value: OrganizationType; label: string }> = [
  { value: 'ACADEMIC', label: 'Colleges' },
  { value: 'CORPORATE', label: 'Companies' },
]

function rupees(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString('en-IN')}`
}

function allowanceText(allowance: Allowance | undefined, model: CompareRow['model']): string {
  if (!allowance || allowance.kind === 'none') return '—'
  if (allowance.kind === 'unlimited') return model === 'PERK' ? 'Yes' : 'Unlimited'
  return String(allowance.count)
}

/** "+2" / "-1" against the plan before, for a counted allowance; nothing where either side is not a plain count. */
function deltaText(previous: Allowance | undefined, current: Allowance | undefined): string | null {
  const a = previous && previous.kind === 'count' ? previous.count : previous?.kind === 'none' || previous === undefined ? 0 : null
  const b = current && current.kind === 'count' ? current.count : current?.kind === 'none' || current === undefined ? 0 : null
  if (a === null || b === null || a === b) return null
  return b > a ? `+${b - a}` : `${b - a}`
}

export function CompareWarnings({ warnings }: { warnings: readonly Warning[] }) {
  if (warnings.length === 0) {
    return (
      <p className="text-xs text-[var(--c-ok)]" data-testid="compare-ok">
        Nothing looks off: each dearer plan gives at least as much and none costs more than it is worth.
      </p>
    )
  }
  return (
    <ul className="space-y-1.5" data-testid="compare-warnings">
      {warnings.map((warning) => (
        <li
          key={warning.text}
          className={`rounded-lg border px-3 py-2 text-xs ${
            warning.tone === 'bad'
              ? 'border-[var(--c-danger)]/40 bg-[var(--c-danger-soft)] text-[var(--c-danger)]'
              : 'border-[var(--c-attn)]/40 bg-[var(--c-attn-soft)] text-[var(--c-attn-ink)]'
          }`}
        >
          {warning.text}
        </li>
      ))}
    </ul>
  )
}

export function PlanCompare({
  features,
  plans,
  allowanceOf,
  isUnsaved,
  initialKind = 'ACADEMIC',
}: {
  features: readonly AdminFeature[]
  plans: readonly AdminPlan[]
  allowanceOf: (planKey: string, featureKey: string) => Allowance
  /** Whether what is typed for this plan and feature differs from what is saved. */
  isUnsaved: (planKey: string, featureKey: string) => boolean
  initialKind?: OrganizationType
}) {
  const [kind, setKind] = useState<OrganizationType>(initialKind)
  const { rows, columns, warnings } = comparePlans({ features, plans, orgType: kind, allowanceOf })

  const columnTemplate = `minmax(150px,1.3fr) repeat(${columns.length}, minmax(96px,1fr))`

  return (
    <Panel className="p-5">
      <div data-testid="plan-compare">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text)]">Compare plans</h3>
            <p className="max-w-3xl text-xs text-[var(--color-text-muted)]">
              Every plan side by side for one kind of organisation. Allowances update as you type them, before saving (marked ●);
              prices are as saved. The small +/- is against the plan to its left.
            </p>
          </div>
          <Segmented label="Compare for" items={KINDS} value={kind} onChange={setKind} />
        </div>

        <div className="overflow-x-auto">
          <div className="grid min-w-[520px] gap-x-3 text-sm" style={{ gridTemplateColumns: columnTemplate }}>
            <Cell head>&nbsp;</Cell>
            {columns.map((column) => (
              <Cell key={column.planKey} head align="right">
                {column.name}
              </Cell>
            ))}

            <Cell label>Price a month</Cell>
            {columns.map((column) => (
              <Cell key={column.planKey} align="right" strong testID={`compare-price-${column.planKey}`}>
                {column.isDefault ? 'Free' : column.pricePaise === null ? 'Not sold' : rupees(column.pricePaise)}
              </Cell>
            ))}

            {rows.map((row) => (
              <Row key={row.featureKey} row={row} columns={columns} plans={plans} isUnsaved={isUnsaved} />
            ))}

            <Cell label>Worth, bought one at a time</Cell>
            {columns.map((column) => (
              <Cell key={column.planKey} align="right" testID={`compare-worth-${column.planKey}`}>
                {column.worthPaise > 0 ? rupees(column.worthPaise) : '—'}
              </Cell>
            ))}

            <Cell label>Members pay, of that</Cell>
            {columns.map((column) => (
              <Cell key={column.planKey} align="right" strong testID={`compare-share-${column.planKey}`}>
                {column.percentOfWorth === null ? '—' : `${column.percentOfWorth}%`}
              </Cell>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <CompareWarnings warnings={warnings} />
        </div>
      </div>
    </Panel>
  )
}

function Row({
  row,
  columns,
  isUnsaved,
}: {
  row: CompareRow
  columns: readonly CompareColumn[]
  plans: readonly AdminPlan[]
  isUnsaved: (planKey: string, featureKey: string) => boolean
}) {
  return (
    <>
      <Cell label>
        {row.label}
        {row.unitPricePaise !== null ? <span className="block text-[11px] text-[var(--color-text-muted)]">{rupees(row.unitPricePaise)} each</span> : null}
      </Cell>
      {columns.map((column, index) => {
        const allowance = column.allowances[row.featureKey]
        const delta = index > 0 && !column.isDefault ? deltaText(columns[index - 1]!.allowances[row.featureKey], allowance) : null
        const unsaved = isUnsaved(column.planKey, row.featureKey)
        return (
          <Cell key={column.planKey} align="right" testID={`compare-${column.planKey}-${row.featureKey}`}>
            {allowanceText(allowance, row.model)}
            {delta !== null ? <span className={`ml-1 text-[11px] ${delta.startsWith('-') ? 'text-[var(--c-danger)]' : 'text-[var(--color-text-muted)]'}`}>{delta}</span> : null}
            {unsaved ? <span title="Typed, not saved yet" aria-label="not saved yet" className="ml-1 text-[var(--color-primary)]">●</span> : null}
          </Cell>
        )
      })}
    </>
  )
}

function Cell({
  children,
  head = false,
  label = false,
  strong = false,
  align = 'left',
  testID,
}: {
  children: React.ReactNode
  head?: boolean
  label?: boolean
  strong?: boolean
  align?: 'left' | 'right'
  testID?: string
}) {
  return (
    <div
      data-testid={testID}
      className={`border-b border-[var(--color-border)] py-2 ${align === 'right' ? 'text-right' : ''} ${
        head ? 'text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]' : label ? 'text-[var(--color-text)]' : strong ? 'font-bold text-[var(--color-text)]' : 'text-[var(--color-text)]'
      }`}
    >
      {children}
    </div>
  )
}
