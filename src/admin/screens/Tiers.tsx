import { useEffect, useState } from 'react'

import { ApiError, apiGet, apiPut } from '../lib/api'
import { useAsyncData } from '../lib/useAsyncData'
import { Button, EmptyNote, ErrorNote, Field, Panel } from '../components/ui'

/**
 * What each subscription tier actually gives you.
 *
 * **This is the screen that decides whether a subscription is worth buying.**
 * `tier_config` seeds FREE, PLUS and PRO with every column at zero or false,
 * so on a fresh database a ₹199/month Pro subscriber receives exactly what
 * somebody paying nothing receives. Until these three rows differ, the two
 * subscription products must not be activated in Play Console - selling a
 * subscription that delivers nothing is a store rejection and a refund queue,
 * not merely a missed opportunity. The screen says so when it detects it.
 *
 * **Why a whole form per tier rather than Pricing's single-field rows.**
 * `PUT /v1/admin/tiers/{tier}` replaces every entitlement on the row; there is
 * no partial update. Saving one field therefore means sending the other five
 * too, and a per-field Save button would quietly write back whatever the rest
 * of the form happened to be showing. One Save per tier makes the unit of
 * change match the unit the API actually accepts.
 *
 * **FREE is editable on purpose.** Its row is not dead config: it is what
 * every non-subscriber resolves to, and also what a PAST_DUE or CANCELLED
 * subscriber falls back to. Hiding it would hide the baseline that PLUS and
 * PRO are supposed to beat.
 */

type Tier = 'FREE' | 'PLUS' | 'PRO'

/** Mirrors `TierEntitlements` in `@grid/types`. Redeclared rather than imported: this repo is not part of the backend's monorepo and shares no package with it. */
interface TierEntitlements {
  tier: Tier
  monthlyBundledCredits: number
  monthlyFreeBoosts: number
  unlimitedPosting: boolean
  crossOrgDiscountPercent: number
  prioritySearch: boolean
  badgeLabel: string | null
}

/**
 * Numbers are held as strings while editing.
 *
 * A half-typed number is not a number - binding an `<input>` to a numeric
 * state makes clearing the field either impossible or silently a zero, and
 * zero is a meaningful entitlement value here rather than an obvious blank.
 */
interface Draft {
  monthlyBundledCredits: string
  monthlyFreeBoosts: string
  crossOrgDiscountPercent: string
  unlimitedPosting: boolean
  prioritySearch: boolean
  badgeLabel: string
}

/** FREE first, then ascending. The API returns rows `ORDER BY tier`, which is alphabetical and happens to match - relying on that coincidence would break the day a tier is named anything else. */
const TIER_ORDER: readonly Tier[] = ['FREE', 'PLUS', 'PRO']

const TIER_BLURB: Record<Tier, string> = {
  FREE: 'Everyone who is not subscribed, plus anyone whose subscription lapsed or was cancelled.',
  PLUS: 'The lower paid tier.',
  PRO: 'The higher paid tier.',
}

function draftFrom(entry: TierEntitlements): Draft {
  return {
    monthlyBundledCredits: String(entry.monthlyBundledCredits),
    monthlyFreeBoosts: String(entry.monthlyFreeBoosts),
    crossOrgDiscountPercent: String(entry.crossOrgDiscountPercent),
    unlimitedPosting: entry.unlimitedPosting,
    prioritySearch: entry.prioritySearch,
    // The API models "no badge" as null and rejects an empty string
    // (`z.string().min(1).nullable()`), but an input has no null to show.
    // Empty here, converted back on the way out.
    badgeLabel: entry.badgeLabel ?? '',
  }
}

function sameAsSaved(draft: Draft, entry: TierEntitlements): boolean {
  const saved = draftFrom(entry)
  return (
    draft.monthlyBundledCredits === saved.monthlyBundledCredits &&
    draft.monthlyFreeBoosts === saved.monthlyFreeBoosts &&
    draft.crossOrgDiscountPercent === saved.crossOrgDiscountPercent &&
    draft.unlimitedPosting === saved.unlimitedPosting &&
    draft.prioritySearch === saved.prioritySearch &&
    draft.badgeLabel === saved.badgeLabel
  )
}

/**
 * Says what is wrong, in the words of the field it is wrong in.
 *
 * The server validates all of this too and is the real authority. Repeating
 * it here is not defence, it is feedback: a rejected save costs a round trip
 * and returns a Zod path, which is a worse way to learn that a percentage
 * cannot be 150 than being told before pressing Save.
 */
function problemWith(draft: Draft): string | null {
  const numeric: ReadonlyArray<[string, string]> = [
    ['Bundled credits', draft.monthlyBundledCredits],
    ['Free boosts', draft.monthlyFreeBoosts],
    ['Cross-org discount', draft.crossOrgDiscountPercent],
  ]

  for (const [label, raw] of numeric) {
    const trimmed = raw.trim()
    if (trimmed === '') return `${label} cannot be blank - use 0 for none.`
    // `Number` rather than `parseInt`: parseInt('5kg') is 5, which would let a
    // typo through as a valid entitlement.
    const value = Number(trimmed)
    if (!Number.isInteger(value)) return `${label} must be a whole number.`
    if (value < 0) return `${label} cannot be negative.`
  }

  if (Number(draft.crossOrgDiscountPercent) > 100) {
    return 'Cross-org discount is a percentage, so it cannot be above 100.'
  }

  return null
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
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
        <span className="block text-xs text-[var(--color-text-muted)]">{hint}</span>
      </span>
    </label>
  )
}

export function Tiers() {
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [savingTier, setSavingTier] = useState<Tier | null>(null)
  const [savedTier, setSavedTier] = useState<Tier | null>(null)
  const [actionError, setActionError] = useState<ApiError | null>(null)

  const { data: entries, error: loadError, reload } = useAsyncData(
    () => apiGet<TierEntitlements[]>('/v1/admin/tiers'),
    [],
  )
  const error = actionError ?? loadError

  // Drafts follow whatever the server last returned, so a reload after saving
  // re-syncs the inputs to the stored values rather than leaving a stale
  // keystroke sitting on top of a saved row. Same reasoning as Pricing's.
  useEffect(() => {
    if (!entries) return
    setDrafts(Object.fromEntries(entries.map((entry) => [entry.tier, draftFrom(entry)])))
  }, [entries])

  async function save(entry: TierEntitlements) {
    const draft = drafts[entry.tier]
    if (!draft || problemWith(draft) !== null) return

    setSavingTier(entry.tier)
    setSavedTier(null)
    setActionError(null)
    try {
      await apiPut(`/v1/admin/tiers/${entry.tier}`, {
        monthlyBundledCredits: Number(draft.monthlyBundledCredits),
        monthlyFreeBoosts: Number(draft.monthlyFreeBoosts),
        unlimitedPosting: draft.unlimitedPosting,
        crossOrgDiscountPercent: Number(draft.crossOrgDiscountPercent),
        prioritySearch: draft.prioritySearch,
        // Trimmed, and empty becomes null. A badge of " " would render as a
        // visible empty pill in the app, and "" is rejected outright.
        badgeLabel: draft.badgeLabel.trim() === '' ? null : draft.badgeLabel.trim(),
      })
      await reload()
      setSavedTier(entry.tier)
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setSavingTier(null)
    }
  }

  function update(tier: Tier, patch: Partial<Draft>) {
    const current = drafts[tier]
    if (!current) return
    setSavedTier(null)
    setDrafts({ ...drafts, [tier]: { ...current, ...patch } })
  }

  const free = entries?.find((entry) => entry.tier === 'FREE') ?? null
  /**
   * The check that matters, and it is not "is everything zero".
   *
   * A tier can be non-zero and still worthless: if PLUS is given the same
   * entitlements FREE already has, the subscriber pays for nothing. Comparing
   * each paid tier against FREE catches both that and the all-zero seed, which
   * is only the most obvious instance of it.
   */
  const worthlessPaidTiers =
    free === null
      ? []
      : (entries ?? [])
          .filter(
            (entry) =>
              entry.tier !== 'FREE' &&
              entry.monthlyBundledCredits === free.monthlyBundledCredits &&
              entry.monthlyFreeBoosts === free.monthlyFreeBoosts &&
              entry.unlimitedPosting === free.unlimitedPosting &&
              entry.crossOrgDiscountPercent === free.crossOrgDiscountPercent &&
              entry.prioritySearch === free.prioritySearch,
          )
          .map((entry) => entry.tier)

  const ordered = (entries ?? [])
    .slice()
    .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier))

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[var(--color-text)]">Tiers</h1>

      {worthlessPaidTiers.length > 0 ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          {worthlessPaidTiers.join(' and ')} currently {worthlessPaidTiers.length > 1 ? 'give' : 'gives'} exactly
          what FREE gives, so subscribing buys nothing. Do not activate the subscription products in Play Console
          until this differs.
        </div>
      ) : null}

      <ErrorNote error={error} />

      {entries === null ? (
        <Panel>
          <EmptyNote>Loading…</EmptyNote>
        </Panel>
      ) : entries.length === 0 ? (
        <Panel>
          <EmptyNote>No tier rows. The seed migration may not have run.</EmptyNote>
        </Panel>
      ) : (
        ordered.map((entry) => {
          const draft = drafts[entry.tier]
          if (!draft) return null

          const problem = problemWith(draft)
          const changed = !sameAsSaved(draft, entry)
          const saving = savingTier === entry.tier

          return (
            <Panel key={entry.tier} className="p-5">
              <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-base font-bold text-[var(--color-text)]">{entry.tier}</h2>
                <p className="text-xs text-[var(--color-text-muted)]">{TIER_BLURB[entry.tier]}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Bundled credits / month"
                  value={draft.monthlyBundledCredits}
                  onChange={(value) => update(entry.tier, { monthlyBundledCredits: value })}
                  hint="Wallet credit granted on each renewal."
                />
                <Field
                  label="Free boosts / month"
                  value={draft.monthlyFreeBoosts}
                  onChange={(value) => update(entry.tier, { monthlyFreeBoosts: value })}
                  hint="Boosts that cost nothing from the wallet."
                />
                <Field
                  label="Cross-org discount %"
                  value={draft.crossOrgDiscountPercent}
                  onChange={(value) => update(entry.tier, { crossOrgDiscountPercent: value })}
                  hint="Taken off wider-reach purchases. 0–100."
                />
                <Field
                  label="Badge label"
                  value={draft.badgeLabel}
                  onChange={(value) => update(entry.tier, { badgeLabel: value })}
                  placeholder="None"
                  hint="Shown beside the user's name. Leave blank for no badge."
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Toggle
                  label="Unlimited posting"
                  hint="Listings cost nothing to post."
                  checked={draft.unlimitedPosting}
                  onChange={(checked) => update(entry.tier, { unlimitedPosting: checked })}
                />
                <Toggle
                  label="Priority search"
                  hint="Ranked above equivalent listings in search."
                  checked={draft.prioritySearch}
                  onChange={(checked) => update(entry.tier, { prioritySearch: checked })}
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                {problem !== null ? (
                  <p className="mr-auto text-xs text-red-300">{problem}</p>
                ) : savedTier === entry.tier ? (
                  <p className="mr-auto text-xs text-emerald-300">Saved.</p>
                ) : null}

                <Button
                  onClick={() => setDrafts({ ...drafts, [entry.tier]: draftFrom(entry) })}
                  disabled={!changed || saving}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  disabled={!changed || problem !== null || saving}
                  onClick={() => void save(entry)}
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </Panel>
          )
        })
      )}
    </div>
  )
}
