import { useState } from 'react'

import { api } from '../api/endpoints'
import type { AdminPlan, OrganizationType, PlanStatus } from '../api/types'
import type { ApiError } from '../lib/api'
import { Badge, Button, ErrorNote, Field, Segmented } from '../components/ui'
import {
  planBodyFrom,
  planDraftFrom,
  pricesDiffer,
  problemWithNewPlan,
  problemWithPlanDraft,
  problemWithPrice,
  sameDetails,
  type PlanDraft,
} from './planDraft'

/**
 * A plan's own details: what it is called, where it sits, whether it is on sale,
 * whether the member app stars it, which store products it is sold as, and what
 * the app lists it at.
 *
 * The console could fill in what a plan *includes* and nothing else, so making,
 * renaming, ordering, recommending or retiring a plan was a database edit.
 *
 * The rules that stop a half-finished plan going on sale live on the server; the
 * checks here only save a round trip and say what is wrong in the field's own
 * words.
 */

const ORG_TYPES: ReadonlyArray<{ type: OrganizationType; label: string }> = [
  { type: 'ACADEMIC', label: 'Colleges' },
  { type: 'CORPORATE', label: 'Companies' },
]

const STATUSES: ReadonlyArray<{ value: PlanStatus; label: string }> = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'AVAILABLE', label: 'On sale' },
  { value: 'RETIRED', label: 'Retired' },
]

function StoreProduct({
  label,
  value,
  onChange,
  verifiedAt,
  savedValue,
  busy,
  disabled,
  onConfirm,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  verifiedAt: string | null
  /** What is stored. A product id that has been edited but not saved cannot be confirmed: it is not the one in the database. */
  savedValue: string
  busy: boolean
  disabled: boolean
  onConfirm: () => void
}) {
  const stored = savedValue.trim() !== '' && savedValue === value
  return (
    <div className="space-y-1.5">
      <Field label={label} value={value} onChange={onChange} placeholder="e.g. sub_team_monthly" />
      {value.trim() === '' ? null : verifiedAt && stored ? (
        <Badge tone="good">Confirmed {new Date(verifiedAt).toLocaleDateString()}</Badge>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="warn">Not confirmed</Badge>
          <Button size="sm" disabled={!stored || busy || disabled} onClick={onConfirm}>
            I checked it exists
          </Button>
          {!stored ? <span className="text-xs text-[var(--c-muted)]">Save the product id first.</span> : null}
        </div>
      )}
    </div>
  )
}

export function PlanEditor({ plan, onChanged }: { plan: AdminPlan; onChanged: () => Promise<void> | void }) {
  const [draft, setDraft] = useState<PlanDraft>(() => planDraftFrom(plan))
  const [busy, setBusy] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<ApiError | null>(null)

  const stored = planDraftFrom(plan)
  const problem = problemWithPlanDraft(draft, plan)
  const dirty = !sameDetails(draft, stored)

  async function run(key: string, action: () => Promise<unknown>) {
    setBusy(key)
    setSaved(null)
    setError(null)
    try {
      await action()
      await onChanged()
      setSaved(key)
    } catch (caught) {
      setError(caught as ApiError)
    } finally {
      setBusy(null)
    }
  }

  function update(patch: Partial<PlanDraft>) {
    setSaved(null)
    setDraft({ ...draft, ...patch })
  }

  function setPrice(orgType: OrganizationType, patch: Partial<{ base: string; discount: string }>) {
    setSaved(null)
    setDraft({ ...draft, prices: { ...draft.prices, [orgType]: { ...draft.prices[orgType], ...patch } } })
  }

  return (
    <details className="mb-3 rounded-lg border border-[var(--c-line)] px-4 py-3" data-testid={`plan-editor-${plan.key}`}>
      <summary className="cursor-pointer text-sm font-semibold text-[var(--c-text)]">Plan details</summary>

      <div className="mt-4 space-y-5">
        <ErrorNote error={error} />

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" value={draft.name} onChange={(value) => update({ name: value })} />
          <Field
            label="Profile badge"
            value={draft.badgeLabel}
            onChange={(value) => update({ badgeLabel: value })}
            placeholder="None"
            hint="The pill a subscriber wears on their profile."
          />
          <Field
            label="Position"
            value={draft.sortOrder}
            onChange={(value) => update({ sortOrder: value })}
            hint="Order on the plan screen, lowest first."
          />
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <div>
            <span className="mb-1.5 block text-[13px] font-semibold text-[var(--c-text)]">Status</span>
            <Segmented label="Status" items={STATUSES} value={draft.status} onChange={(value) => update({ status: value })} />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={draft.isRecommended}
              disabled={plan.isDefault}
              onChange={(event) => update({ isRecommended: event.target.checked })}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            <span className="text-sm font-semibold text-[var(--c-text)]">
              Recommended
              <span className="block text-xs font-normal text-[var(--c-muted)]">
                Starred on the member app&apos;s plan screen. Only one plan; choosing this moves it.
              </span>
            </span>
          </label>
        </div>

        {plan.isDefault ? null : (
          <div className="grid gap-4 sm:grid-cols-2">
            <StoreProduct
              label="App Store product id"
              value={draft.iosProductId}
              onChange={(value) => update({ iosProductId: value })}
              verifiedAt={plan.iosVerifiedAt}
              savedValue={stored.iosProductId}
              busy={busy !== null}
              disabled={dirty}
              onConfirm={() => void run('confirm-ios', () => api.monetization.confirmPlanProduct({ planKey: plan.key, store: 'IOS' }))}
            />
            <StoreProduct
              label="Play product id"
              value={draft.androidProductId}
              onChange={(value) => update({ androidProductId: value })}
              verifiedAt={plan.androidVerifiedAt}
              savedValue={stored.androidProductId}
              busy={busy !== null}
              disabled={dirty}
              onConfirm={() => void run('confirm-android', () => api.monetization.confirmPlanProduct({ planKey: plan.key, store: 'ANDROID' }))}
            />
          </div>
        )}

        {problem ? <p className="text-xs text-[var(--c-danger)]">{problem}</p> : null}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            disabled={!dirty || problem !== null || busy !== null}
            onClick={() => void run('details', () => api.monetization.updatePlan(plan.key, planBodyFrom(draft)))}
          >
            {busy === 'details' ? 'Saving…' : 'Save details'}
          </Button>
          {saved === 'details' ? <span className="text-xs text-[var(--c-ok)]">Saved.</span> : null}
          {saved === 'confirm-ios' || saved === 'confirm-android' ? <span className="text-xs text-[var(--c-ok)]">Confirmed.</span> : null}
        </div>

        {plan.isDefault ? null : (
          <div className="space-y-3 border-t border-[var(--c-line)] pt-4">
            <div>
              <h4 className="text-sm font-semibold text-[var(--c-text)]">Price the app lists</h4>
              <p className="text-xs text-[var(--c-muted)]">
                This is what members are shown. The store charges whatever its product says, so the two have to
                match: set the same price on the product in App Store Connect and Play Console. Leave blank for an
                organisation type this plan is not sold to.
              </p>
            </div>
            {ORG_TYPES.map(({ type, label }) => {
              const price = draft.prices[type]
              const priceProblem = problemWithPrice(price)
              const changed = pricesDiffer(draft.prices, stored.prices, type)
              return (
                <div key={type} className="flex flex-wrap items-end gap-4">
                  <span className="w-24 pb-2 text-sm font-semibold text-[var(--c-text)]">{label}</span>
                  <div className="w-40">
                    <Field label="Price / month (₹)" value={price.base} onChange={(value) => setPrice(type, { base: value })} />
                  </div>
                  <div className="w-40">
                    <Field label="Discount (₹)" value={price.discount} onChange={(value) => setPrice(type, { discount: value })} />
                  </div>
                  <Button
                    variant="primary"
                    disabled={!changed || price.base.trim() === '' || priceProblem !== null || busy !== null}
                    onClick={() =>
                      void run(`price-${type}`, () =>
                        api.monetization.setPlanPricing({
                          planKey: plan.key,
                          orgType: type,
                          basePricePaise: Math.round(Number(price.base) * 100),
                          discountPaise: Math.round(Number(price.discount.trim() === '' ? 0 : price.discount) * 100),
                        }),
                      )
                    }
                  >
                    {busy === `price-${type}` ? 'Saving…' : 'Save price'}
                  </Button>
                  {saved === `price-${type}` ? <span className="pb-2 text-xs text-[var(--c-ok)]">Saved.</span> : null}
                  {priceProblem ? <p className="w-full text-xs text-[var(--c-danger)]">{priceProblem}</p> : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </details>
  )
}

export function NewPlanForm({ existingKeys, onCreated }: { existingKeys: readonly string[]; onCreated: () => Promise<void> | void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const problem = problemWithNewPlan(key, name, existingKeys)

  async function create() {
    setBusy(true)
    setError(null)
    try {
      await api.monetization.createPlan({ key, name: name.trim() })
      setName('')
      setKey('')
      setOpen(false)
      await onCreated()
    } catch (caught) {
      setError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>New plan</Button>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-[var(--c-line)] p-4" data-testid="new-plan-form">
      <ErrorNote error={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" value={name} onChange={setName} placeholder="e.g. Team" />
        <Field
          label="Key"
          value={key}
          onChange={(value) => setKey(value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
          placeholder="e.g. TEAM"
          hint="Fixed once created: store products and history refer to it."
        />
      </div>
      <p className="text-xs text-[var(--c-muted)]">
        It starts as a draft with no price and no store product, so no member can see it until it is finished.
      </p>
      {name !== '' || key !== '' ? (problem ? <p className="text-xs text-[var(--c-danger)]">{problem}</p> : null) : null}
      <div className="flex gap-2">
        <Button variant="primary" disabled={problem !== null || busy} onClick={() => void create()}>
          {busy ? 'Creating…' : 'Create draft'}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
