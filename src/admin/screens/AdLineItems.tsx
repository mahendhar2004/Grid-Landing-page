import { useState } from 'react'

import { api } from '../api/endpoints'
import type { CreateLineItemBody } from '../api/endpoints'
import type { AdDeliveryType, AdPlacement, LineItem, LineItemDeliveryReport, LineItemStatus, OrganizationType } from '../api/types'
import { useCursorPagedData } from '../lib/usePagedData'
import { useAdminAction } from '../lib/useAdminAction'
import { useAsyncData } from '../lib/useAsyncData'
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

/**
 * Google Ad Manager's scale, where a **lower number wins**, and the delivery
 * type each priority belongs to. They are shown as one choice because they
 * are one decision — the API and the schema both refuse a pair that
 * disagrees, and a sponsorship at a standard priority would quietly lose every
 * slot it was sold to win.
 */
const DELIVERY_OPTIONS: ReadonlyArray<{
  value: string
  deliveryType: AdDeliveryType
  priority: number
  label: string
  hint: string
}> = [
  {
    value: 'SPONSORSHIP',
    deliveryType: 'SPONSORSHIP',
    priority: 4,
    label: 'Sponsorship — wins first',
    hint: 'Sold as a share of the feed. “Own 25% at this campus for the month” — the sentence a local business understands and can be invoiced for.',
  },
  {
    value: 'STANDARD_6',
    deliveryType: 'STANDARD',
    priority: 6,
    label: 'Standard, high',
    hint: 'Direct-sold, beaten only by a sponsorship.',
  },
  {
    value: 'STANDARD_8',
    deliveryType: 'STANDARD',
    priority: 8,
    label: 'Standard',
    hint: 'The ordinary direct-sold ad.',
  },
  {
    value: 'STANDARD_10',
    deliveryType: 'STANDARD',
    priority: 10,
    label: 'Standard, low',
    hint: 'Runs behind the other two.',
  },
  {
    value: 'HOUSE',
    deliveryType: 'HOUSE',
    priority: 16,
    label: 'House — fills what is left',
    hint: "Grid's own promotions and affiliate links. Serves only when nothing sold fills the slot, so it never takes inventory from something paid for.",
  },
]

const EMPTY_FORM = {
  orderId: '',
  name: '',
  delivery: 'STANDARD_8',
  shareOfVoice: '',
  bookedRupees: '',
  impressionGoal: '',
  frequencyCap: '',
  paced: false,
  competitiveLabel: '',
  orgTypes: [] as OrganizationType[],
  placements: ['FEED', 'SEARCH'] as AdPlacement[],
  category: '',
  keywords: '',
  creativeId: '',
}

/** A sponsorship without a usable percentage is not a sponsorship, so the form will not send one. */
function isValidShare(value: string): boolean {
  const share = Number(value)
  return Number.isInteger(share) && share >= 1 && share <= 100
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
  const [reportingOn, setReportingOn] = useState<string | null>(null)

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
    const delivery = DELIVERY_OPTIONS.find((entry) => entry.value === form.delivery) ?? DELIVERY_OPTIONS[2]!
    const body: CreateLineItemBody = {
      orderId: form.orderId,
      name: form.name.trim(),
      deliveryType: delivery.deliveryType,
      priority: delivery.priority,
      // Only a sponsorship carries one, and it must — the percentage is what
      // the sponsorship is.
      shareOfVoicePercent: delivery.deliveryType === 'SPONSORSHIP' ? Number(form.shareOfVoice) : null,
      // Hub targeting is set from the order's advertiser later; the form
      // offers organisation type, which is the axis that needs no id.
      // `null` means everybody, and an empty selection is sent as null rather
      // than as an empty array the API would refuse.
      targetHubIds: null,
      targetOrgTypes: form.orgTypes.length > 0 ? form.orgTypes : null,
      // Rupees in the form, paise on the wire, like everything else here.
      bookedAmountPaise: Math.round(Number(form.bookedRupees.trim() || '0') * 100),
      // A goal belongs to standard delivery; the API refuses it elsewhere.
      impressionGoal:
        delivery.deliveryType === 'STANDARD' && form.impressionGoal.trim() !== ''
          ? Number(form.impressionGoal.trim())
          : null,
      frequencyCapPerDay: form.frequencyCap.trim() !== '' ? Number(form.frequencyCap.trim()) : null,
      // Pacing needs a goal to pace towards, which the schema also enforces.
      paced: form.paced && delivery.deliveryType === 'STANDARD' && form.impressionGoal.trim() !== '',
      competitiveLabel: form.competitiveLabel.trim() || null,
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

            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">Delivery</span>
              <select
                value={form.delivery}
                onChange={(e) => setForm({ ...form, delivery: e.target.value })}
                className="w-full rounded border border-[var(--color-border)] bg-transparent p-2 text-sm text-[var(--color-text)]"
              >
                {DELIVERY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="block text-xs text-[var(--color-text-muted)]">
                {DELIVERY_OPTIONS.find((option) => option.value === form.delivery)?.hint}
              </span>
            </label>

            {form.delivery === 'SPONSORSHIP' ? (
              <div className="w-40">
                <Field
                  label="Share of voice (%)"
                  value={form.shareOfVoice}
                  onChange={(v) => setForm({ ...form, shareOfVoice: v })}
                  placeholder="25"
                />
              </div>
            ) : null}

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

            <div className="flex flex-wrap items-end gap-3">
              <div className="w-32">
                <Field
                  label="Booked (₹)"
                  value={form.bookedRupees}
                  onChange={(v) => setForm({ ...form, bookedRupees: v })}
                  placeholder="20000"
                />
              </div>
              {DELIVERY_OPTIONS.find((option) => option.value === form.delivery)?.deliveryType === 'STANDARD' ? (
                <div className="w-40">
                  <Field
                    label="Impression goal"
                    value={form.impressionGoal}
                    onChange={(v) => setForm({ ...form, impressionGoal: v })}
                    placeholder="50000"
                  />
                </div>
              ) : null}
              <div className="w-40">
                <Field
                  label="Views per person/day"
                  value={form.frequencyCap}
                  onChange={(v) => setForm({ ...form, frequencyCap: v })}
                  placeholder="blank = uncapped"
                />
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              What this ad is billed against. A sponsorship costs its daily share of the period it
              runs for; standard delivery costs the booked amount divided by its goal, per
              impression. Nothing booked means it costs nothing.
            </p>

            {DELIVERY_OPTIONS.find((option) => option.value === form.delivery)?.deliveryType === 'STANDARD' &&
            form.impressionGoal.trim() !== '' ? (
              <label className="flex items-start gap-2 text-sm text-[var(--color-text)]">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.paced}
                  onChange={(e) => setForm({ ...form, paced: e.target.checked })}
                />
                <span>
                  Spread delivery across each day
                  <span className="block text-xs text-[var(--color-text-muted)]">
                    Otherwise the goal is spent against whoever happens to be awake first.
                  </span>
                </span>
              </label>
            ) : null}

            <Field
              label="Competitive label (optional)"
              value={form.competitiveLabel}
              onChange={(v) => setForm({ ...form, competitiveLabel: v })}
              placeholder="coaching / lending / food"
            />
            <p className="text-xs text-[var(--color-text-muted)]">
              Two ads sharing a label never appear in one feed together. A category rather than a
              named rival, because keeping a list of who competes with whom is a job nobody does
              twice.
            </p>

            <fieldset className="space-y-1">
              <legend className="text-xs font-medium text-[var(--color-text-muted)]">
                Show to (optional)
              </legend>
              <div className="flex flex-wrap gap-3">
                {(['ACADEMIC', 'CORPORATE'] as const).map((orgType) => (
                  <label key={orgType} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                    <input
                      type="checkbox"
                      checked={form.orgTypes.includes(orgType)}
                      onChange={() =>
                        setForm((current) => ({
                          ...current,
                          orgTypes: current.orgTypes.includes(orgType)
                            ? current.orgTypes.filter((entry) => entry !== orgType)
                            : [...current.orgTypes, orgType],
                        }))
                      }
                    />
                    {orgType === 'ACADEMIC' ? 'Colleges' : 'Workplaces'}
                  </label>
                ))}
              </div>
              <span className="block text-xs text-[var(--color-text-muted)]">
                Neither ticked means everybody, which is what most ads want. Anyone shown this ad
                can see that their organisation type was used to choose it.
              </span>
            </fieldset>

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
              disabled={
                busy ||
                form.orderId === '' ||
                form.placements.length === 0 ||
                (form.delivery === 'SPONSORSHIP' && !isValidShare(form.shareOfVoice))
              }
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
                      {item.advertiserName} · {item.orderName} ·{' '}
                      {item.targetHubIds !== null
                        ? `${item.targetHubIds.length} hub${item.targetHubIds.length === 1 ? '' : 's'} · `
                        : ''}
                      {item.targetOrgTypes !== null
                        ? `${item.targetOrgTypes.map((entry) => (entry === 'ACADEMIC' ? 'colleges' : 'workplaces')).join(', ')} · `
                        : ''}
                      {item.deliveryType === 'SPONSORSHIP'
                        ? `sponsorship, ${item.shareOfVoicePercent}% of the feed`
                        : item.deliveryType === 'HOUSE'
                          ? 'house, fills what is left'
                          : `standard (priority ${item.priority})`}{' '}
                      · {item.placements.join(', ')}
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
                      <Button onClick={() => setReportingOn((current) => (current === item.id ? null : item.id))}>
                        {reportingOn === item.id ? 'Hide delivery' : 'Delivery'}
                      </Button>
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
                  {reportingOn === item.id ? <DeliveryReport lineItemId={item.id} /> : null}
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

/**
 * What a campaign actually delivered, day by day.
 *
 * Shown beside what it was sold — the booked amount, the goal, the promised
 * share — because a delivery number read in a vacuum invites the question the
 * report should have answered. Until phase 4 lets an advertiser read this
 * themselves, somebody here sends it to them.
 */
function DeliveryReport({ lineItemId }: { lineItemId: string }) {
  const { data: report, error } = useAsyncData<LineItemDeliveryReport>(
    () => api.lineItems.delivery(lineItemId),
    [lineItemId],
  )

  if (error) return <ErrorNote error={error} />
  if (!report) return <EmptyNote>Loading delivery…</EmptyNote>

  const goalProgress =
    report.impressionGoal !== null && report.impressionGoal > 0
      ? Math.round((report.totalImpressions / report.impressionGoal) * 100)
      : null

  return (
    <div className="mt-3 w-full space-y-2 rounded-lg border border-[var(--color-border)] p-3">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--color-text-muted)]">
        <span>
          <strong className="text-[var(--color-text)]">{report.totalImpressions.toLocaleString('en-IN')}</strong> seen
        </span>
        <span>
          <strong className="text-[var(--color-text)]">{report.totalClicks.toLocaleString('en-IN')}</strong> clicked
        </span>
        <span>
          <strong className="text-[var(--color-text)]">{rupeesFromPaise(report.totalSpendPaise)}</strong> spent of{' '}
          {rupeesFromPaise(report.bookedAmountPaise)} booked
        </span>
        {goalProgress !== null ? (
          <span>
            <strong className="text-[var(--color-text)]">{goalProgress}%</strong> of its{' '}
            {report.impressionGoal!.toLocaleString('en-IN')} goal
          </span>
        ) : null}
        {report.shareOfVoicePercent !== null ? (
          <span>sold {report.shareOfVoicePercent}% of the feed</span>
        ) : null}
      </div>

      {report.days.length === 0 ? (
        <EmptyNote>
          Nothing rolled up yet. Delivery is summarised once a night, so a campaign that started
          today appears tomorrow.
        </EmptyNote>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[var(--color-text-muted)]">
              <th className="py-1 font-medium">Day</th>
              <th className="py-1 text-right font-medium">Seen</th>
              <th className="py-1 text-right font-medium">Clicked</th>
              <th className="py-1 text-right font-medium">Spend</th>
            </tr>
          </thead>
          <tbody>
            {report.days.map((day) => (
              <tr key={day.day} className="border-t border-[var(--color-border)]">
                <td className="py-1">{day.day}</td>
                <td className="py-1 text-right">{day.impressions.toLocaleString('en-IN')}</td>
                <td className="py-1 text-right">{day.clicks.toLocaleString('en-IN')}</td>
                <td className="py-1 text-right">{rupeesFromPaise(day.spendPaise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

/** Paise everywhere on the wire, rupees everywhere a person reads. */
function rupeesFromPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}
