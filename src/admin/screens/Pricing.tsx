import { useEffect, useState } from 'react'

import { api } from '../api/endpoints'
import type { PricingEntry } from '../api/types'
import type { ApiError } from '../lib/api'
import { useAsyncData } from '../lib/useAsyncData'
import { Button, EmptyNote, ErrorNote, Panel } from '../components/ui'

/**
 * What everything costs.
 *
 * **The API stores paise; this screen talks rupees.** That conversion is the
 * entire reason this screen is careful: an admin thinking in rupees who types
 * a paise value sets a ₹59 boost to ₹5,900, and the server would accept it.
 * The backend caps values at ₹5,000 as a typo guard, but the right fix is not
 * making someone do arithmetic before changing a price - so the input is
 * rupees, the conversion happens here, and the resulting paise value is shown
 * back before saving.
 *
 * Every price starts at ₹0 in a fresh database, which means the product earns
 * nothing until this screen is used. That is worth saying on the screen rather
 * than leaving someone to discover it.
 */

const ITEM_LABELS: Record<string, string> = {
  LISTING_FEE: 'Posting a listing',
  REQUEST_FEE: 'Posting a request',
  BOOST: 'Boost (3 days)',
  CROSS_ORG_SAME_TYPE: 'Wider reach, same type',
  CROSS_ORG_ALL_TYPE: 'Wider reach, all types',
  TIER_PLUS_MONTHLY: 'Plus, monthly',
  TIER_PRO_MONTHLY: 'Pro, monthly',
}

function rupeesFromPaise(paise: number): string {
  return (paise / 100).toString()
}

export function Pricing() {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [actionError, setActionError] = useState<ApiError | null>(null)

  const { data: entries, error: loadError, reload } = useAsyncData(
    () => api.pricing.list(),
    [],
  )
  const error = actionError ?? loadError

  const keyFor = (entry: PricingEntry) => `${entry.pricedItem}:${entry.orgType}`

  // Drafts follow whatever the server last returned. Seeded in an effect
  // rather than during the fetch so a reload after saving re-syncs the
  // inputs to the stored values instead of leaving a stale keystroke.
  useEffect(() => {
    if (!entries) return
    setDrafts(Object.fromEntries(entries.map((entry) => [keyFor(entry), rupeesFromPaise(entry.basePricePaise)])))
  }, [entries])

  async function save(entry: PricingEntry) {
    const key = keyFor(entry)
    const rupees = Number(drafts[key])
    if (!Number.isFinite(rupees) || rupees < 0) {
      return
    }

    setSavingKey(key)
    setActionError(null)
    try {
      await api.pricing.upsert(
        entry.pricedItem,
        entry.orgType,
        // Rounded, not truncated: 0.1 * 100 is 10.000000000000002 in
        // floating point, and an un-rounded value fails the integer check
        // with a message about types rather than about the price.
        Math.round(rupees * 100),
        entry.discountPaise,
      )
      await reload()
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setSavingKey(null)
    }
  }

  const allZero = entries?.every((entry) => entry.basePricePaise === 0) ?? false

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[var(--color-text)]">Pricing</h1>

      {allZero && entries && entries.length > 0 ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Every price is ₹0, so nothing currently earns anything no matter how many people use Grid.
        </div>
      ) : null}

      <ErrorNote error={error} />

      <Panel>
        {entries === null ? (
          <EmptyNote>Loading…</EmptyNote>
        ) : entries.length === 0 ? (
          <EmptyNote>No pricing rows.</EmptyNote>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {entries.map((entry) => {
              const key = keyFor(entry)
              const draft = drafts[key] ?? ''
              const changed = draft !== rupeesFromPaise(entry.basePricePaise)
              return (
                <li key={key} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {ITEM_LABELS[entry.pricedItem] ?? entry.pricedItem}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">{entry.orgType}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[var(--color-text-muted)]">₹</span>
                    <input
                      value={draft}
                      inputMode="decimal"
                      onChange={(event) => setDrafts({ ...drafts, [key]: event.target.value })}
                      className="w-24 rounded-lg border border-[var(--color-border)] bg-[var(--bg-page)] px-2 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <Button variant="primary" disabled={!changed || savingKey === key} onClick={() => void save(entry)}>
                    {savingKey === key ? 'Saving…' : 'Save'}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
    </div>
  )
}
