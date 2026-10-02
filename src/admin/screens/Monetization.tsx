import { useEffect, useMemo, useState } from 'react'

import { api } from '../api/endpoints'
import type { AdminFeature, AdminPlan, OrganizationType, PlanFeature } from '../api/types'
import type { ApiError } from '../lib/api'
import { useAsyncData } from '../lib/useAsyncData'
import { Badge, Button, EmptyNote, ErrorNote, PageHeader, Panel, Segmented } from '../components/ui'
import { NewPlanForm, PlanEditor } from './PlanEditor'
import { ReachDistancesPanel } from './ReachDistances'

/**
 * What costs money, and what each plan includes.
 *
 * **One screen, built from the server's feature registry.** This replaces
 * `Pricing` and `Tiers`, which between them hard-coded a list of priced items
 * and a form field per entitlement — so making a feature paid, or giving a plan
 * a benefit it did not have, meant editing this repo and deploying it before
 * anyone could touch the value. Nothing below names a feature or a plan: the
 * rows come from `GET /v1/admin/monetization`, so a feature added on the
 * server appears here with no change in this repo at all.
 *
 * **The API stores paise; this screen talks rupees.** Unchanged from the screen
 * it replaces and still the most dangerous thing here: an admin thinking in
 * rupees who types a paise value sets a ₹59 boost to ₹5,900, and the server
 * would accept it. The input is rupees, the conversion happens here, and the
 * paise value is shown back before saving.
 *
 * **A feature's model decides its controls.** A perk is on or off; a per-use
 * feature has a quantity and a discount; a setting carries a number; a grant
 * hands out money. Offering all four everywhere is how a plan ends up
 * configured with a quantity that nothing reads — the server refuses those,
 * and this screen does not offer them in the first place.
 *
 * **A plan's listed price is what members are shown, not what the store charges.**
 * What a subscriber pays is the price of a product in App Store Connect and Play
 * Console, so the editor says the two have to match, and refuses to put a plan on
 * sale until both its products have been confirmed to exist. Each plan says why it
 * cannot be sold yet, which is the part an admin cannot work out from here.
 */

function rupeesFromPaise(paise: number): string {
  return (paise / 100).toString()
}

/**
 * Rounded rather than truncated: `0.1 * 100` is 10.000000000000002 in floating
 * point, and an un-rounded value fails the server's integer check with a
 * message about types rather than about the price.
 */
function paiseFromRupees(rupees: string): number {
  return Math.round(Number(rupees) * 100)
}

/** A whole, non-negative number, or a sentence saying which it is not. */
function checkWholeNumber(label: string, raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed === '') return `${label} cannot be blank — use 0 for none.`
  // `Number` rather than `parseInt`: parseInt('5kg') is 5, which would let a
  // typo through as a real value.
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return `${label} must be a number.`
  if (value < 0) return `${label} cannot be negative.`
  if (!Number.isInteger(value)) return `${label} must be a whole number.`
  return null
}

/**
 * Numbers are held as strings while editing.
 *
 * A half-typed number is not a number — binding an `<input>` to numeric state
 * makes clearing the field either impossible or silently a zero, and zero is a
 * meaningful price and a meaningful quantity rather than an obvious blank.
 */
interface PriceDraft {
  isPaid: boolean
  /** Only means anything for an add-on; everything else is always on sale. */
  isOffered: boolean
  rupees: string
  discountRupees: string
}

interface CellDraft {
  included: boolean
  /** Blank means unlimited, which is not the same as zero. */
  quantity: string
  discountPercent: string
  settingValue: string
  grantRupees: string
}

function priceKey(featureKey: string, orgType: OrganizationType): string {
  return `${featureKey}:${orgType}`
}

function cellKey(planKey: string, featureKey: string): string {
  return `${planKey}:${featureKey}`
}

function priceDraftFrom(feature: AdminFeature, orgType: OrganizationType): PriceDraft {
  const row = feature.pricing.find((entry) => entry.orgType === orgType)
  return {
    isPaid: row?.isPaid ?? false,
    isOffered: row?.isOffered ?? true,
    rupees: rupeesFromPaise(row?.basePricePaise ?? 0),
    discountRupees: rupeesFromPaise(row?.discountPaise ?? 0),
  }
}

function cellDraftFrom(plan: AdminPlan, featureKey: string): CellDraft {
  const row: PlanFeature | undefined = plan.features.find((entry) => entry.featureKey === featureKey)
  return {
    included: row?.included ?? false,
    quantity: row?.includedQuantity === null || row?.includedQuantity === undefined ? '' : String(row.includedQuantity),
    discountPercent: String(row?.discountPercent ?? 0),
    settingValue: row?.settingValue === null || row?.settingValue === undefined ? '' : String(row.settingValue),
    grantRupees: row?.grantPaise === null || row?.grantPaise === undefined ? '' : rupeesFromPaise(row.grantPaise),
  }
}

function samePrice(draft: PriceDraft, saved: PriceDraft): boolean {
  return (
    draft.isPaid === saved.isPaid &&
    draft.isOffered === saved.isOffered &&
    draft.rupees === saved.rupees &&
    draft.discountRupees === saved.discountRupees
  )
}

function sameCell(draft: CellDraft, saved: CellDraft): boolean {
  return (
    draft.included === saved.included &&
    draft.quantity === saved.quantity &&
    draft.discountPercent === saved.discountPercent &&
    draft.settingValue === saved.settingValue &&
    draft.grantRupees === saved.grantRupees
  )
}

/**
 * Says what is wrong, in the words of the field it is wrong in.
 *
 * The server validates all of this too and is the authority. Repeating it here
 * is feedback rather than defence: a rejected save costs a round trip and
 * returns a Zod path, which is a worse way to learn that a discount cannot
 * exceed a price than being told before pressing Save.
 */
function problemWithPrice(draft: PriceDraft): string | null {
  // Checked in paise rather than rupees: the server stores paise and rejects a
  // fraction of one, so ₹59.005 is the error, not the rounding that hides it.
  const base = checkAmount('Price', draft.rupees)
  if (base !== null) return base
  const discount = checkAmount('Discount', draft.discountRupees)
  if (discount !== null) return discount

  const net = paiseFromRupees(draft.rupees) - paiseFromRupees(draft.discountRupees)
  if (net < 0) return 'Discount cannot be more than the price.'
  if (draft.isPaid && net === 0) {
    return 'Marked paid but free after the discount — it would read as free to every member. Set a price, or leave it free.'
  }
  return null
}

/** A rupee amount that converts to a whole number of paise, or a sentence saying which it is not. */
function checkAmount(label: string, rupees: string): string | null {
  const trimmed = rupees.trim()
  if (trimmed === '') return `${label} cannot be blank — use 0 for none.`
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return `${label} must be a number.`
  if (value < 0) return `${label} cannot be negative.`
  if (Math.abs(value * 100 - paiseFromRupees(trimmed)) > 1e-6) return `${label} cannot be a fraction of a paisa.`
  return null
}

function problemWithCell(feature: AdminFeature, draft: CellDraft): string | null {
  if (feature.model === 'PER_USE') {
    if (draft.quantity.trim() !== '') {
      const problem = checkWholeNumber('Included per month', draft.quantity)
      if (problem !== null) return problem
    }
    const discount = checkWholeNumber('Discount %', draft.discountPercent)
    if (discount !== null) return discount
    if (Number(draft.discountPercent) > 100) return 'Discount is a percentage, so it cannot be above 100.'
  }
  if (feature.model === 'SETTING' && draft.settingValue.trim() !== '') {
    return checkWholeNumber('Value', draft.settingValue)
  }
  if (feature.model === 'GRANT' && draft.grantRupees.trim() !== '') {
    if (Number.isNaN(Number(draft.grantRupees))) return 'Monthly credit must be a number.'
    if (paiseFromRupees(draft.grantRupees) < 0) return 'Monthly credit cannot be negative.'
  }
  return null
}

/**
 * What the server will store for this cell.
 *
 * Everything outside the feature's own model is sent as null rather than as
 * whatever the input last held, because the server refuses a quantity on a
 * perk or a grant on something charged per use — and rightly: those are
 * configurations that cannot mean anything.
 */
function cellBody(planKey: string, feature: AdminFeature, draft: CellDraft) {
  const grantPaise =
    feature.model === 'GRANT' && draft.grantRupees.trim() !== '' ? paiseFromRupees(draft.grantRupees) : null
  const settingValue =
    feature.model === 'SETTING' && draft.settingValue.trim() !== '' ? Number(draft.settingValue) : null

  return {
    planKey,
    featureKey: feature.key,
    // A grant with an amount and a setting with a value are included by
    // definition; there is no third state where the plan hands out money it
    // does not include.
    included: feature.model === 'GRANT' ? grantPaise !== null && grantPaise > 0 : feature.model === 'SETTING' ? settingValue !== null : draft.included,
    includedQuantity:
      feature.model === 'PER_USE' && draft.quantity.trim() !== '' ? Number(draft.quantity) : null,
    discountPercent: feature.model === 'PER_USE' ? Number(draft.discountPercent) : 0,
    settingValue,
    grantPaise,
  }
}

/** What a plan actually gives, as a comparable string — used only to spot a paid plan that gives what the free one already does. */
function benefitSignature(plan: AdminPlan): string {
  return plan.features
    .map(
      (row) =>
        `${row.featureKey}:${row.included}:${row.includedQuantity}:${row.discountPercent}:${row.settingValue}:${row.grantPaise}`,
    )
    .sort()
    .join('|')
}

function planPriceLabel(plan: AdminPlan): string {
  if (plan.pricing.length === 0) return 'No price set'
  return plan.pricing
    .map((row) => `${row.orgType} ₹${rupeesFromPaise(row.basePricePaise - row.discountPaise)}/month`)
    .join(' · ')
}

const ORG_LABEL: Record<string, string> = { ACADEMIC: 'College', CORPORATE: 'Company' }
const MODEL_LABEL: Record<string, string> = { PER_USE: 'Per use', PERK: 'Perk', SETTING: 'Setting', GRANT: 'Credit' }

function orgLabel(orgType: string): string {
  return ORG_LABEL[orgType] ?? orgType
}

/** What one price row costs a member after its discount, as the member would read it. */
function finalLabel(draft: PriceDraft): string {
  if (!draft.isPaid) return 'Free'
  const net = paiseFromRupees(draft.rupees) - paiseFromRupees(draft.discountRupees)
  return Number.isFinite(net) ? `₹${net / 100}` : '—'
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--color-text)]">{label}</span>
        {hint ? <span className="block text-xs text-[var(--color-text-muted)]">{hint}</span> : null}
      </span>
    </label>
  )
}

/**
 * A small input that sits under a column heading, so it carries no visible label
 * of its own - the heading above the whole table is the label, and repeating it
 * in every row is what made the old screen a wall of identical captions. The
 * label stays as the accessible name.
 */
function SmallField({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  suffix,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  prefix?: string
  suffix?: string
}) {
  return (
    <span className="flex items-center gap-1">
      {prefix ? <span className="text-sm text-[var(--color-text-muted)]">{prefix}</span> : null}
      <input
        aria-label={label}
        value={value}
        inputMode="decimal"
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--bg-page)] px-2 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
      />
      {suffix ? <span className="text-sm text-[var(--color-text-muted)]">{suffix}</span> : null}
    </span>
  )
}

/** The column headings above a table of rows; hidden on a narrow screen, where each row stacks and its inputs carry their own names. */
function ColumnHeads({ columns, template }: { columns: ReadonlyArray<string>; template: string }) {
  return (
    <div
      className={`hidden gap-x-4 border-b border-[var(--color-border)] pb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] md:grid ${template}`}
    >
      {columns.map((column, index) => (
        <span key={`${column}-${index}`}>{column}</span>
      ))}
    </div>
  )
}

const INCLUDES_TEMPLATE = 'md:grid-cols-[minmax(0,1.6fr)_110px_140px_110px_84px]'
const PRICE_TEMPLATE = 'md:grid-cols-[minmax(0,1fr)_90px_130px_130px_110px_84px]'
/** The same, with a column for the on-sale switch that only add-ons have. */
const PRICE_TEMPLATE_SWITCHABLE = 'md:grid-cols-[minmax(0,1fr)_110px_90px_130px_130px_110px_84px]'

/** What a plan gives, in a line a person can skim: "3 boosts · 5 reach". Only what is switched on. */
function includedSummary(plan: AdminPlan, features: ReadonlyArray<AdminFeature>): string[] {
  const out: string[] = []
  for (const row of plan.features) {
    if (!row.included) continue
    const feature = features.find((entry) => entry.key === row.featureKey)
    if (!feature) continue
    if (feature.model === 'GRANT') out.push(`${feature.label}: ₹${rupeesFromPaise(row.grantPaise ?? 0)}`)
    else if (feature.model === 'PER_USE') out.push(`${feature.label}: ${row.includedQuantity === null ? 'unlimited' : row.includedQuantity}`)
    else out.push(feature.label)
  }
  return out
}

function PlanOverviewCard({
  plan,
  features,
  selected,
  onSelect,
}: {
  plan: AdminPlan
  features: ReadonlyArray<AdminFeature>
  selected: boolean
  onSelect: () => void
}) {
  const included = includedSummary(plan, features)
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      data-testid={`plan-card-${plan.key}`}
      className={`flex flex-col gap-3 rounded-[var(--r-card)] border p-4 text-left transition ${
        selected
          ? 'border-[var(--color-primary)] bg-[var(--c-surface)] shadow-[var(--c-shadow)] ring-1 ring-[var(--color-primary)]'
          : 'border-[var(--c-line)] bg-[var(--c-surface)] hover:border-[var(--color-text-muted)]'
      }`}
    >
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-base font-bold text-[var(--color-text)]">{plan.name}</span>
        <Badge tone={plan.status === 'AVAILABLE' ? 'good' : plan.status === 'DRAFT' ? 'warn' : 'neutral'}>
          {plan.status === 'AVAILABLE' ? 'On sale' : plan.status === 'DRAFT' ? 'Draft' : 'Retired'}
        </Badge>
        {plan.isRecommended ? <Badge tone="brand">Recommended</Badge> : null}
      </span>

      <span className="space-y-1">
        {plan.pricing.length === 0 ? (
          <span className="text-sm text-[var(--color-text-muted)]">No price set</span>
        ) : (
          plan.pricing.map((row) => {
            const final = row.basePricePaise - row.discountPaise
            return (
              <span key={row.orgType} className="flex items-baseline gap-2 text-sm">
                <span className="w-16 text-xs text-[var(--color-text-muted)]">{orgLabel(row.orgType)}</span>
                <span className="font-bold text-[var(--color-text)]">{final === 0 ? 'Free' : `₹${rupeesFromPaise(final)}`}</span>
                {final > 0 ? <span className="text-xs text-[var(--color-text-muted)]">a month</span> : null}
                {row.discountPaise > 0 ? (
                  <span className="text-xs text-[var(--color-text-muted)] line-through">₹{rupeesFromPaise(row.basePricePaise)}</span>
                ) : null}
              </span>
            )
          })
        )}
      </span>

      <span className="text-xs text-[var(--color-text-muted)]">
        {included.length === 0 ? 'Includes nothing yet' : included.join(' · ')}
      </span>
      {plan.blockedReason ? <span className="text-xs text-[var(--c-attn-ink)]">{plan.blockedReason}</span> : null}
    </button>
  )
}

type MonetizationTab = 'plans' | 'usage'

export function Monetization() {
  const [priceDrafts, setPriceDrafts] = useState<Record<string, PriceDraft>>({})
  const [cellDrafts, setCellDrafts] = useState<Record<string, CellDraft>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [actionError, setActionError] = useState<ApiError | null>(null)
  const [tab, setTab] = useState<MonetizationTab>('plans')
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null)

  const { data: view, error: loadError, reload } = useAsyncData(() => api.monetization.get(), [])
  const error = actionError ?? loadError

  // Drafts follow whatever the server last returned, so a reload after saving
  // re-syncs the inputs to the stored values rather than leaving a stale
  // keystroke sitting on top of a saved row.
  useEffect(() => {
    if (!view) return
    const prices: Record<string, PriceDraft> = {}
    for (const feature of view.features) {
      for (const row of feature.pricing) {
        prices[priceKey(feature.key, row.orgType)] = priceDraftFrom(feature, row.orgType)
      }
    }
    setPriceDrafts(prices)

    const cells: Record<string, CellDraft> = {}
    for (const plan of view.plans) {
      for (const feature of view.features) {
        cells[cellKey(plan.key, feature.key)] = cellDraftFrom(plan, feature.key)
      }
    }
    setCellDrafts(cells)
  }, [view])

  async function savePrice(feature: AdminFeature, orgType: OrganizationType) {
    const key = priceKey(feature.key, orgType)
    const draft = priceDrafts[key]
    if (!draft || problemWithPrice(draft) !== null) return

    setSavingKey(key)
    setSavedKey(null)
    setActionError(null)
    try {
      await api.monetization.setFeaturePrice({
        featureKey: feature.key,
        orgType,
        isPaid: draft.isPaid,
        // Only an add-on has the switch; sending it for anything else would be refused.
        ...(feature.switchable ? { isOffered: draft.isOffered } : {}),
        basePricePaise: paiseFromRupees(draft.rupees),
        discountPaise: paiseFromRupees(draft.discountRupees),
      })
      await reload()
      setSavedKey(key)
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setSavingKey(null)
    }
  }

  async function saveCell(plan: AdminPlan, feature: AdminFeature) {
    const key = cellKey(plan.key, feature.key)
    const draft = cellDrafts[key]
    if (!draft || problemWithCell(feature, draft) !== null) return

    setSavingKey(key)
    setSavedKey(null)
    setActionError(null)
    try {
      await api.monetization.setPlanFeature(cellBody(plan.key, feature, draft))
      await reload()
      setSavedKey(key)
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setSavingKey(null)
    }
  }

  const features = view?.features ?? []
  const plans = useMemo(
    () => (view?.plans ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [view],
  )

  const defaultPlan = plans.find((plan) => plan.isDefault) ?? null
  // Opens on the first plan worth editing: the free plan has little to set.
  const selectedPlan =
    plans.find((plan) => plan.key === selectedPlanKey) ?? plans.find((plan) => !plan.isDefault) ?? plans[0] ?? null

  /**
   * The check that matters, and it is not "is everything zero".
   *
   * A paid plan can be fully configured and still worthless: if it is given
   * exactly what the free plan already has, the subscriber pays for nothing.
   * Comparing each paid plan against the default one catches that and the
   * untouched seed, which is only its most obvious instance.
   */
  const worthlessPlans =
    defaultPlan === null
      ? []
      : plans
          .filter(
            (plan) =>
              !plan.isDefault &&
              plan.status !== 'RETIRED' &&
              benefitSignature(plan) === benefitSignature(defaultPlan),
          )
          .map((plan) => plan.name)

  const nothingIsPaid =
    features.length > 0 && features.every((feature) => feature.pricing.every((row) => !row.isPaid))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monetization"
        subtitle="What members pay for, and what each plan gives them. Plans are what a member subscribes to; pay per use is what one boost or one reach costs without a plan."
        actions={
          <Segmented
            label="Monetization section"
            value={tab}
            onChange={setTab}
            items={[
              { value: 'plans', label: 'Plans' },
              { value: 'usage', label: 'Pay per use' },
            ]}
          />
        }
      />

      {nothingIsPaid ? (
        <div className="rounded-lg border border-[var(--c-attn)]/40 bg-[var(--c-attn-soft)] px-3 py-2 text-sm text-[var(--c-attn-ink)]">
          Nothing is marked paid, so no feature earns anything however many people use Grid. Prices below are
          stored but not charged until a feature is marked paid.
        </div>
      ) : null}

      {worthlessPlans.length > 0 ? (
        <div className="rounded-lg border border-[var(--c-attn)]/40 bg-[var(--c-attn-soft)] px-3 py-2 text-sm text-[var(--c-attn-ink)]">
          {worthlessPlans.join(' and ')} currently {worthlessPlans.length > 1 ? 'give' : 'gives'} exactly what
          {defaultPlan ? ` ${defaultPlan.name}` : ' the free plan'} gives, so subscribing buys nothing. Do not
          activate the subscription products in the stores until this differs.
        </div>
      ) : null}

      <ErrorNote error={error} />

      {tab === 'usage' ? (
        <section className="space-y-4" aria-label="Pay per use">
          <p className="max-w-3xl text-sm text-[var(--color-text-muted)]">
            What one use costs, for a college and for a company. A feature that is not marked <b>Paid</b> costs
            nothing, whatever price is stored beside it — that tick is how something free becomes paid. The last
            column is what a member is shown.
          </p>

          {view === null || !view.reachDistancesKm ? null : <ReachDistancesPanel key={JSON.stringify(view.reachDistancesKm)} distances={view.reachDistancesKm} onSaved={reload} />}

          {view === null ? (
            <Panel>
              <EmptyNote>Loading…</EmptyNote>
            </Panel>
          ) : features.length === 0 ? (
            <Panel>
              <EmptyNote>No features. The server's registry is empty, which should be impossible.</EmptyNote>
            </Panel>
          ) : (
            features.map((feature) => (
              <Panel key={feature.key} className="p-5">
                <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-base font-bold text-[var(--color-text)]">{feature.label}</h3>
                  <Badge>{MODEL_LABEL[feature.model] ?? feature.model}</Badge>
                  {feature.enforcedAt === null ? null : (
                    <span className="text-xs text-[var(--color-text-muted)]">charged in {feature.enforcedAt}</span>
                  )}
                </div>
                <p className="mb-4 max-w-3xl text-sm text-[var(--color-text-muted)]">{feature.explain}</p>

                {feature.model !== 'PER_USE' ? (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Nothing is charged for this one — it is {feature.model === 'GRANT' ? 'handed out by a plan' : 'read from a plan'}, and its value is set on the plan itself.
                  </p>
                ) : (
                  <>
                    <ColumnHeads
                      template={feature.switchable ? PRICE_TEMPLATE_SWITCHABLE : PRICE_TEMPLATE}
                      columns={
                        feature.switchable
                          ? ['Organisation', 'On sale', 'Paid', 'Price (₹)', 'Discount (₹)', 'Members pay', '']
                          : ['Organisation', 'Paid', 'Price (₹)', 'Discount (₹)', 'Members pay', '']
                      }
                    />
                    <ul className="divide-y divide-[var(--color-border)]">
                      {feature.pricing.map((row) => {
                        const key = priceKey(feature.key, row.orgType)
                        const draft = priceDrafts[key]
                        if (!draft) return null
                        const saved = priceDraftFrom(feature, row.orgType)
                        const problem = problemWithPrice(draft)
                        const changed = !samePrice(draft, saved)
                        const saving = savingKey === key

                        const update = (patch: Partial<PriceDraft>) => {
                          setSavedKey(null)
                          setPriceDrafts({ ...priceDrafts, [key]: { ...draft, ...patch } })
                        }

                        return (
                          <li
                            key={key}
                            className={`grid items-center gap-x-4 gap-y-2 py-3 ${feature.switchable ? PRICE_TEMPLATE_SWITCHABLE : PRICE_TEMPLATE}`}
                            data-testid={`price-row-${key}`}
                          >
                            <span className="text-sm font-semibold text-[var(--color-text)]">{orgLabel(row.orgType)}</span>
                            {feature.switchable ? (
                              <Toggle label="On sale" checked={draft.isOffered} onChange={(checked) => update({ isOffered: checked })} />
                            ) : null}
                            <Toggle label="Paid" checked={draft.isPaid} onChange={(checked) => update({ isPaid: checked })} />
                            <SmallField label="Price" prefix="₹" value={draft.rupees} onChange={(value) => update({ rupees: value })} />
                            <SmallField label="Discount" prefix="₹" value={draft.discountRupees} onChange={(value) => update({ discountRupees: value })} />
                            <span className="text-sm font-bold text-[var(--color-text)]">{finalLabel(draft)}</span>
                            <Button
                              variant="primary"
                              disabled={!changed || problem !== null || saving}
                              onClick={() => void savePrice(feature, row.orgType)}
                            >
                              {saving ? 'Saving…' : 'Save'}
                            </Button>

                            {problem !== null ? (
                              <p className="col-span-full text-xs text-[var(--c-danger)]">{problem}</p>
                            ) : savedKey === key ? (
                              <p className="col-span-full text-xs text-[var(--c-ok)]">Saved.</p>
                            ) : feature.switchable && !draft.isOffered ? (
                              <p className="col-span-full text-xs text-[var(--color-text-muted)]">
                                Not on sale to {orgLabel(row.orgType).toLowerCase()}: members see nothing to buy, whatever the price, and it is left out of what their plans list. This is not the same as free.
                              </p>
                            ) : changed ? (
                              <p className="col-span-full text-xs text-[var(--color-text-muted)]">
                                Will store {paiseFromRupees(draft.rupees)} paise, {paiseFromRupees(draft.discountRupees)} paise off.
                              </p>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                  </>
                )}
              </Panel>
            ))
          )}
        </section>
      ) : (
        <section className="space-y-5" aria-label="Plans">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-3xl text-sm text-[var(--color-text-muted)]">
              Pick a plan to edit it. The price shown is what members see; the store charges what its product says,
              so the two have to match.
            </p>
            <NewPlanForm existingKeys={plans.map((plan) => plan.key)} onCreated={reload} />
          </div>

          {view === null ? (
            <Panel>
              <EmptyNote>Loading…</EmptyNote>
            </Panel>
          ) : plans.length === 0 ? (
            <Panel>
              <EmptyNote>No plans. The seed migration may not have run.</EmptyNote>
            </Panel>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => (
                  <PlanOverviewCard
                    key={plan.key}
                    plan={plan}
                    features={features}
                    selected={selectedPlan?.key === plan.key}
                    onSelect={() => setSelectedPlanKey(plan.key)}
                  />
                ))}
              </div>

              {selectedPlan ? (
                <Panel key={selectedPlan.key} className="p-5">
                  <div data-testid={`plan-panel-${selectedPlan.key}`}>
                    <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 className="text-lg font-bold text-[var(--color-text)]">Editing {selectedPlan.name}</h2>
                      {selectedPlan.isDefault ? <Badge>Default plan</Badge> : null}
                      {selectedPlan.badgeLabel ? <Badge tone="good">{selectedPlan.badgeLabel}</Badge> : null}
                      <span className="text-xs text-[var(--color-text-muted)]">{planPriceLabel(selectedPlan)}</span>
                    </div>

                    {selectedPlan.blockedReason ? (
                      <p className="mb-4 rounded-lg border border-[var(--c-attn)]/40 bg-[var(--c-attn-soft)] px-3 py-2 text-sm text-[var(--c-attn-ink)]">
                        {selectedPlan.blockedReason}
                      </p>
                    ) : null}

                    <PlanEditor plan={selectedPlan} onChanged={reload} />

                    <h3 className="mb-1 mt-6 text-sm font-bold text-[var(--color-text)]">What this plan includes</h3>
                    <p className="mb-3 max-w-3xl text-xs text-[var(--color-text-muted)]">
                      Tick what the plan gives. <b>Per month</b> is how many a month (blank means unlimited), the credit in ₹, or the
                      setting&rsquo;s value, depending on the kind of benefit.
                    </p>

                    <ColumnHeads template={INCLUDES_TEMPLATE} columns={['Benefit', 'Included', 'Per month', 'Discount', '']} />
                    <ul className="divide-y divide-[var(--color-border)]">
                      {features.map((feature) => {
                        const plan = selectedPlan
                        const key = cellKey(plan.key, feature.key)
                        const draft = cellDrafts[key]
                        if (!draft) return null
                        const saved = cellDraftFrom(plan, feature.key)
                        const problem = problemWithCell(feature, draft)
                        const changed = !sameCell(draft, saved)
                        const saving = savingKey === key

                        const update = (patch: Partial<CellDraft>) => {
                          setSavedKey(null)
                          setCellDrafts({ ...cellDrafts, [key]: { ...draft, ...patch } })
                        }

                        return (
                          <li key={key} className={`grid items-center gap-x-4 gap-y-2 py-3 ${INCLUDES_TEMPLATE}`}>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-[var(--color-text)]">{feature.label}</span>
                              <span className="block text-xs text-[var(--color-text-muted)]">{MODEL_LABEL[feature.model] ?? feature.model}</span>
                            </span>

                            {feature.model === 'PER_USE' || feature.model === 'PERK' ? (
                              <Toggle label="Included" checked={draft.included} onChange={(checked) => update({ included: checked })} />
                            ) : (
                              <span />
                            )}

                            {feature.model === 'PER_USE' ? (
                              <SmallField
                                label={`Included ${feature.unit ?? 'uses'} / month`}
                                value={draft.quantity}
                                placeholder="Unlimited"
                                onChange={(value) => update({ quantity: value })}
                              />
                            ) : feature.model === 'SETTING' ? (
                              <SmallField label="Value" value={draft.settingValue} placeholder="None" onChange={(value) => update({ settingValue: value })} />
                            ) : feature.model === 'GRANT' ? (
                              <SmallField label="Each month" prefix="₹" value={draft.grantRupees} placeholder="None" onChange={(value) => update({ grantRupees: value })} />
                            ) : (
                              <span />
                            )}

                            {feature.model === 'PER_USE' ? (
                              <SmallField label="Discount" suffix="%" value={draft.discountPercent} onChange={(value) => update({ discountPercent: value })} />
                            ) : (
                              <span />
                            )}

                            <Button
                              variant="primary"
                              disabled={!changed || problem !== null || saving}
                              onClick={() => void saveCell(plan, feature)}
                            >
                              {saving ? 'Saving…' : 'Save'}
                            </Button>

                            {problem !== null ? (
                              <p className="col-span-full text-xs text-[var(--c-danger)]">{problem}</p>
                            ) : savedKey === key ? (
                              <p className="col-span-full text-xs text-[var(--c-ok)]">Saved.</p>
                            ) : draft.included && feature.model === 'PER_USE' && draft.quantity.trim() === '' ? (
                              <p className="col-span-full text-xs text-[var(--color-text-muted)]">
                                Unlimited — this plan never pays for {feature.label.toLowerCase()}.
                              </p>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </Panel>
              ) : null}
            </>
          )}
        </section>
      )}
    </div>
  )
}
