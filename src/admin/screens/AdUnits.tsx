import { useState } from 'react'

import { api } from '../api/endpoints'
import type { CreateAdUnitBody } from '../api/endpoints'
import type { AdUnit } from '../api/types'
import { useCursorPagedData } from '../lib/usePagedData'
import { useAdminAction } from '../lib/useAdminAction'
import { Badge, Button, EmptyNote, ErrorNote, Field, MoreRow, Panel } from '../components/ui'

/**
 * Ads — phase 0 of `docs/grid-v2/ADVERTISING_PLATFORM_PLAN.md`.
 *
 * The `ad_units` table, the serving query and the card in the app have existed
 * since Day 34. What never existed was a way to put a row in, so the whole
 * feature was reachable only by hand-writing an HTTP call. That made the first
 * revenue Grid can earn without a single sales call — an affiliate link —
 * unreachable in practice.
 *
 * Deliberately not the advertiser platform. There is no company, campaign,
 * budget or ledger here, because none of those exist yet (plan §3). This is a
 * link, who it is for, and whether it is live.
 */

/** Matches `ListingCategory`, which is what the route validates against. Blank means "any category". */
const CATEGORIES = [
  '',
  'ELECTRONICS',
  'FURNITURE',
  'BOOKS',
  'CLOTHING',
  'SPORTS',
  'STATIONERY',
  'APPLIANCES',
  'VEHICLES',
  'MUSIC',
  'GAMING',
  'TICKETS',
  'SERVICES',
  'OTHER',
] as const

const EMPTY_FORM = {
  title: '',
  sponsorName: '',
  imageUrl: '',
  targetUrl: '',
  disclosure: '',
  category: '',
  keywords: '',
}

/**
 * Amazon's Operating Agreement requires this exact sentiment beside any
 * Associates link, and "Sponsored" on the card does not satisfy it. Offered as
 * a one-tap fill because it is the disclosure most likely to be needed and the
 * easiest to get subtly wrong by retyping.
 */
const AMAZON_DISCLOSURE = 'As an Amazon Associate I earn from qualifying purchases.'

/** A click-through rate is the only number on this screen that says whether an ad is working. */
function clickRate(unit: AdUnit): string {
  if (unit.impressionCount === 0) return '—'
  return `${((unit.clickCount / unit.impressionCount) * 100).toFixed(1)}%`
}

export function AdUnits() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)

  const { rows: adUnits, error: loadError, hasMore, loadingMore, loadMore, reload } = useCursorPagedData(
    async (cursor) => {
      const page = await api.adUnits.list(cursor)
      return { rows: page.adUnits, nextCursor: page.nextCursor }
    },
    [],
  )
  const { run, busy, error: actionError } = useAdminAction(reload)
  const error = actionError ?? loadError

  async function create(event: React.FormEvent) {
    event.preventDefault()
    const body: CreateAdUnitBody = {
      title: form.title.trim(),
      sponsorName: form.sponsorName.trim(),
      imageUrl: form.imageUrl.trim(),
      targetUrl: form.targetUrl.trim(),
      // Empty means "none", which the API expects as null rather than "".
      disclosure: form.disclosure.trim() || null,
      category: form.category || null,
      keywords: form.keywords.trim() ? form.keywords.split(',').map((k) => k.trim()).filter(Boolean) : null,
      minPricePaise: null,
      maxPricePaise: null,
      priorityWeight: 1,
      isActive: true,
    }
    const succeeded = await run(() => api.adUnits.create(body))
    if (succeeded) {
      setForm(EMPTY_FORM)
      setShowForm(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-text)]">Ads</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Affiliate and sponsored links shown in the feed and in search. Every card carries a
            visible “Sponsored” label; a partner needing its own wording gets it from the
            disclosure field.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((open) => !open)}>
          {showForm ? 'Cancel' : 'New ad'}
        </Button>
      </div>

      <ErrorNote error={error} />

      {showForm ? (
        <Panel>
          <form onSubmit={create} className="space-y-3 p-4">
            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="What the card says" />
            <Field label="Sponsor name" value={form.sponsorName} onChange={(v) => setForm({ ...form, sponsorName: v })} placeholder="Who it is for" />
            <Field label="Image URL" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} placeholder="https://…" />
            <Field
              label="Target URL"
              value={form.targetUrl}
              onChange={(v) => setForm({ ...form, targetUrl: v })}
              placeholder="The affiliate link, tracking parameters and all"
            />

            <div className="space-y-1">
              <Field
                label="Disclosure (optional)"
                value={form.disclosure}
                onChange={(v) => setForm({ ...form, disclosure: v })}
                placeholder="Extra wording this partner requires"
              />
              <div className="flex items-center gap-2">
                <Button onClick={() => setForm({ ...form, disclosure: AMAZON_DISCLOSURE })}>
                  Use Amazon’s wording
                </Button>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Required by Amazon’s Operating Agreement on every Associates link.
                </span>
              </div>
            </div>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">Category (optional)</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded border border-[var(--color-border)] bg-transparent p-2 text-sm text-[var(--color-text)]"
              >
                {CATEGORIES.map((value) => (
                  <option key={value || 'any'} value={value}>
                    {value || 'Any category'}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Keywords (optional, comma separated)"
              value={form.keywords}
              onChange={(v) => setForm({ ...form, keywords: v })}
              placeholder="dsa, placement, interview"
            />

            {/* `type="submit"`, because Button defaults to "button" and this
                one lives in a form whose onSubmit does the work. Without it
                the button renders, enables, and does nothing at all. */}
            <Button variant="primary" type="submit" onClick={() => undefined} disabled={busy}>
              {busy ? 'Creating…' : 'Create ad'}
            </Button>
          </form>
        </Panel>
      ) : null}

      <Panel>
        {adUnits === null ? (
          <EmptyNote>Loading…</EmptyNote>
        ) : adUnits.length === 0 ? (
          <EmptyNote>No ads yet. The first one can be an affiliate link — nobody has to agree to it.</EmptyNote>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {adUnits.map((unit) => (
              <li key={unit.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={unit.isActive ? 'good' : 'neutral'}>{unit.isActive ? 'Live' : 'Paused'}</Badge>
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">{unit.title}</p>
                  </div>
                  <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
                    {unit.sponsorName}
                    {unit.category ? ` · ${unit.category}` : ''}
                    {unit.keywords?.length ? ` · ${unit.keywords.join(', ')}` : ''}
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-[var(--color-text-muted)]">{unit.targetUrl}</p>
                  {unit.disclosure ? (
                    <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">“{unit.disclosure}”</p>
                  ) : null}
                </div>

                <div className="text-right text-xs text-[var(--color-text-muted)]">
                  <p>
                    {unit.impressionCount.toLocaleString('en-IN')} seen · {unit.clickCount.toLocaleString('en-IN')} clicked
                  </p>
                  <p className="font-semibold text-[var(--color-text)]">{clickRate(unit)}</p>
                </div>

                {/* Pause, not delete. The row carries the impression and click
                    history, which is the only record of what has ever run. */}
                <Button
                  disabled={busy}
                  onClick={() => void run(() => api.adUnits.update(unit.id, { isActive: !unit.isActive }))}
                >
                  {unit.isActive ? 'Pause' : 'Resume'}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <MoreRow shown={adUnits?.length ?? 0} hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
      </Panel>
    </div>
  )
}
