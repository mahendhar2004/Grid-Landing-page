import { useState } from 'react'

import { api } from '../api/endpoints'
import type { CreateLineItemBody } from '../api/endpoints'
import type { AdPlacement, LineItem, LineItemStatus } from '../api/types'
import { useCursorPagedData } from '../lib/usePagedData'
import { useAdminAction } from '../lib/useAdminAction'
import { Badge, Button, EmptyNote, ErrorNote, Field, MoreRow, Panel, ReasonPrompt } from '../components/ui'

/**
 * Ads — the line items that actually serve
 * (`docs/grid-v2/ADVERTISING_PLATFORM_PLAN.md` §5 and §6).
 *
 * Two things on this screen are easy to read as one and must not be:
 *
 * - **Status** belongs to the advertiser. Pause is "temporarily unpublish",
 *   fully reversible, and keeps delivery history.
 * - **Suspension** belongs to Grid. It is the policy stop, and status cannot
 *   clear it — which is exactly why it is a separate control with its own
 *   reason rather than another value in the same dropdown.
 *
 * Nothing here deletes anything. Archive hides an ad and keeps every row,
 * because delivery and spend are billing records somebody may need to produce
 * an invoice from long after the ad has left the app.
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

const PLACEMENTS: ReadonlyArray<{ value: AdPlacement; label: string }> = [
  { value: 'FEED', label: 'Feed' },
  { value: 'SEARCH', label: 'Search' },
  { value: 'MAP', label: 'Map' },
]

const STATUS_FILTERS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '', label: 'Any status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ACTIVE', label: 'Live' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
]

const STATUS_TONE: Readonly<Record<LineItemStatus, 'good' | 'warn' | 'bad' | 'neutral'>> = {
  ACTIVE: 'good',
  SCHEDULED: 'warn',
  DRAFT: 'neutral',
  PAUSED: 'neutral',
  COMPLETED: 'neutral',
  ARCHIVED: 'neutral',
}

const EMPTY_FORM = {
  orderId: '',
  name: '',
  placements: ['FEED', 'SEARCH'] as AdPlacement[],
  category: '',
  keywords: '',
  creativeId: '',
}

/** A click-through rate is the only number here that says whether an ad is working. */
function clickRate(item: LineItem): string {
  if (item.impressionCount === 0) return '—'
  return `${((item.clickCount / item.impressionCount) * 100).toFixed(1)}%`
}

type PendingAction = { kind: 'pause' | 'archive' | 'suspend'; item: LineItem }

export function AdLineItems() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('')
  const [suspendedOnly, setSuspendedOnly] = useState(false)
  const [includeArchived, setIncludeArchived] = useState(false)
  const [pending, setPending] = useState<PendingAction | null>(null)

  const { rows, error: loadError, hasMore, loadingMore, loadMore, reload } = useCursorPagedData(
    async (cursor) => {
      const page = await api.lineItems.list(cursor, {
        ...(status ? { status } : {}),
        suspendedOnly,
        includeArchived,
      })
      return { rows: page.lineItems, nextCursor: page.nextCursor }
    },
    [status, suspendedOnly, includeArchived],
  )

  const orders = useCursorPagedData(
    async (cursor) => {
      const page = await api.adOrders.list(cursor)
      return { rows: page.orders, nextCursor: page.nextCursor }
    },
    [],
  )

  const selectedOrder = (orders.rows ?? []).find((order) => order.id === form.orderId) ?? null

  /**
   * Only the chosen order's advertiser's creatives, and only approved ones.
   * The API refuses the alternatives — a creative belongs to exactly one
   * company, and an ad with nothing approved cannot go live — so offering
   * them here would be offering choices that cannot work.
   */
  const creatives = useCursorPagedData(
    async (cursor) => {
      if (!selectedOrder) return { rows: [], nextCursor: null }
      const page = await api.creatives.list(cursor, {
        advertiserId: selectedOrder.advertiserId,
        reviewStatus: 'APPROVED',
      })
      return { rows: page.creatives, nextCursor: page.nextCursor }
    },
    [selectedOrder?.advertiserId ?? ''],
  )

  const { run, busy, error: actionError } = useAdminAction(reload)
  const error = actionError ?? loadError

  async function create(event: React.FormEvent) {
    event.preventDefault()
    const body: CreateLineItemBody = {
      orderId: form.orderId,
      name: form.name.trim(),
      placements: form.placements,
      category: form.category || null,
      keywords: form.keywords.trim() ? form.keywords.split(',').map((k) => k.trim()).filter(Boolean) : null,
      minPricePaise: null,
      maxPricePaise: null,
      startsAt: null,
      endsAt: null,
      notes: null,
      creativeIds: form.creativeId ? [form.creativeId] : [],
    }
    if (await run(() => api.lineItems.create(body))) {
      setForm(EMPTY_FORM)
      setShowForm(false)
    }
  }

  function togglePlacement(placement: AdPlacement) {
    setForm((current) => ({
      ...current,
      placements: current.placements.includes(placement)
        ? current.placements.filter((entry) => entry !== placement)
        : [...current.placements, placement],
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-text)]">Ads</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            What runs where, and how it is doing. Every card in the app carries a visible
            &ldquo;Sponsored&rdquo; label; a partner needing its own wording gets it from the
            creative&rsquo;s disclosure.
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
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">Order</span>
              <select
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value, creativeId: '' })}
                className="w-full rounded border border-[var(--color-border)] bg-transparent p-2 text-sm text-[var(--color-text)]"
              >
                <option value="">Choose an order…</option>
                {(orders.rows ?? []).map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.advertiserName} — {order.name}
                  </option>
                ))}
              </select>
              <span className="block text-xs text-[var(--color-text-muted)]">
                Orders are created under an advertiser, on the Advertisers tab.
              </span>
            </label>

            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="What this ad is for, internally" />

            <fieldset className="space-y-1">
              <legend className="text-xs font-medium text-[var(--color-text-muted)]">Placements</legend>
              <div className="flex flex-wrap gap-3">
                {PLACEMENTS.map((placement) => (
                  <label key={placement.value} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                    <input
                      type="checkbox"
                      checked={form.placements.includes(placement.value)}
                      onChange={() => togglePlacement(placement.value)}
                    />
                    {placement.label}
                  </label>
                ))}
              </div>
              <span className="block text-xs text-[var(--color-text-muted)]">
                At least one — an ad with none can never appear anywhere.
              </span>
            </fieldset>

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

            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">Creative</span>
              <select
                value={form.creativeId}
                onChange={(e) => setForm({ ...form, creativeId: e.target.value })}
                disabled={!selectedOrder}
                className="w-full rounded border border-[var(--color-border)] bg-transparent p-2 text-sm text-[var(--color-text)] disabled:opacity-50"
              >
                <option value="">
                  {selectedOrder ? 'Choose an approved creative…' : 'Choose an order first'}
                </option>
                {(creatives.rows ?? []).map((creative) => (
                  <option key={creative.id} value={creative.id}>
                    {creative.title}
                  </option>
                ))}
              </select>
              <span className="block text-xs text-[var(--color-text-muted)]">
                Only this advertiser&rsquo;s approved creatives. An ad can go live without one, but
                it cannot serve — so it is worth attaching now.
              </span>
            </label>

            <Button
              variant="primary"
              type="submit"
              onClick={() => undefined}
              disabled={busy || form.orderId === '' || form.placements.length === 0}
            >
              {busy ? 'Creating…' : 'Create ad'}
            </Button>
            <p className="text-xs text-[var(--color-text-muted)]">
              Created as a draft. Going live is a separate, deliberate step.
            </p>
          </form>
        </Panel>
      ) : null}

      <Panel className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded border border-[var(--color-border)] bg-transparent p-2 text-sm text-[var(--color-text)]"
            >
              {STATUS_FILTERS.map((entry) => (
                <option key={entry.value || 'any'} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm text-[var(--color-text-muted)]">
            <input type="checkbox" checked={suspendedOnly} onChange={(e) => setSuspendedOnly(e.target.checked)} />
            Suspended only
          </label>
          <label className="flex items-center gap-2 pb-2 text-sm text-[var(--color-text-muted)]">
            <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} />
            Include archived
          </label>
        </div>
      </Panel>

      <Panel>
        {rows === null ? (
          <EmptyNote>Loading…</EmptyNote>
        ) : rows.length === 0 ? (
          <EmptyNote>
            No ads match. The first one can be an affiliate link under the House advertiser —
            nobody has to agree to it.
          </EmptyNote>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {rows.map((item) => {
              const suspended = item.suspendedAt !== null
              const archived = item.status === 'ARCHIVED'
              const servableCreatives = item.creatives.filter(
                (creative) => creative.reviewStatus === 'APPROVED' && creative.archivedAt === null,
              )
              return (
                <li key={item.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {suspended ? <Badge tone="bad">Suspended</Badge> : <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>}
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">{item.name}</p>
                    </div>
                    <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
                      {item.advertiserName} · {item.orderName} · {item.placements.join(', ')}
                      {item.category ? ` · ${item.category}` : ''}
                      {item.keywords?.length ? ` · ${item.keywords.join(', ')}` : ''}
                    </p>
                    {/*
                      A live ad with nothing approved on it looks completely
                      healthy in a list and delivers nothing. Saying so here is
                      the difference between finding out now and finding out
                      from the advertiser.
                    */}
                    {item.status === 'ACTIVE' && servableCreatives.length === 0 ? (
                      <p className="mt-1 text-xs font-semibold text-[var(--color-text)]">
                        Live with no approved creative — this cannot serve.
                      </p>
                    ) : null}
                    {suspended ? (
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">Suspended: {item.suspendedReason}</p>
                    ) : null}
                  </div>

                  <div className="text-right text-xs text-[var(--color-text-muted)]">
                    <p>
                      {item.impressionCount.toLocaleString('en-IN')} seen ·{' '}
                      {item.clickCount.toLocaleString('en-IN')} clicked
                    </p>
                    <p className="font-semibold text-[var(--color-text)]">{clickRate(item)}</p>
                  </div>

                  {!archived ? (
                    <div className="flex items-center gap-2">
                      {suspended ? (
                        <Button disabled={busy} onClick={() => void run(() => api.lineItems.setSuspension(item.id, false, null))}>
                          Lift suspension
                        </Button>
                      ) : (
                        <>
                          <Button disabled={busy} onClick={() => setPending({ kind: 'suspend', item })}>
                            Suspend
                          </Button>
                          <Button disabled={busy} onClick={() => setPending({ kind: 'archive', item })}>
                            Archive
                          </Button>
                          {item.status === 'ACTIVE' ? (
                            <Button disabled={busy} onClick={() => setPending({ kind: 'pause', item })}>
                              Pause
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              disabled={busy}
                              onClick={() => void run(() => api.lineItems.setStatus(item.id, { status: 'ACTIVE' }))}
                            >
                              {item.status === 'DRAFT' ? 'Go live' : 'Resume'}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
        <MoreRow shown={rows?.length ?? 0} hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
      </Panel>

      {pending ? (
        <ReasonPrompt
          title={
            pending.kind === 'pause'
              ? `Pause “${pending.item.name}”?`
              : pending.kind === 'suspend'
                ? `Suspend “${pending.item.name}”?`
                : `Archive “${pending.item.name}”?`
          }
          confirmLabel={pending.kind === 'pause' ? 'Pause' : pending.kind === 'suspend' ? 'Suspend' : 'Archive'}
          variant="danger"
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={(reason) => {
            const action =
              pending.kind === 'pause'
                ? () => api.lineItems.setStatus(pending.item.id, { status: 'PAUSED', reason })
                : pending.kind === 'suspend'
                  ? () => api.lineItems.setSuspension(pending.item.id, true, reason)
                  : () => api.lineItems.setStatus(pending.item.id, { status: 'ARCHIVED', reason })
            void run(action).then(() => setPending(null))
          }}
        >
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">
            {pending.kind === 'pause'
              ? 'Temporarily unpublished. Fully reversible, and it keeps every recorded impression.'
              : pending.kind === 'suspend'
                ? "Grid's own stop, on policy grounds. The advertiser cannot undo it by resuming the ad."
                : 'Archiving is final — an archived ad never runs again. Nothing is deleted; its delivery history stays.'}{' '}
            The reason goes in the audit log, which is what answers &ldquo;why did this stop?&rdquo;
            months later.
          </p>
        </ReasonPrompt>
      ) : null}
    </div>
  )
}
