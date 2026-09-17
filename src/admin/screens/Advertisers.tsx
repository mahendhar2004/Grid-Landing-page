import { useState } from 'react'

import { api } from '../api/endpoints'
import type { CreateAdOrderBody, CreateAdvertiserBody } from '../api/endpoints'
import type { AdOrder, Advertiser, AdvertiserTier } from '../api/types'
import { useCursorPagedData } from '../lib/usePagedData'
import { useAdminAction } from '../lib/useAdminAction'
import { Badge, Button, EmptyNote, ErrorNote, Field, MoreRow, Panel, ReasonPrompt } from '../components/ui'

/**
 * Advertisers — the companies ads belong to
 * (`docs/grid-v2/ADVERTISING_PLATFORM_PLAN.md` §3, phase 1).
 *
 * This screen exists because you cannot invoice, suspend or report on a free
 * text sponsor name. Before it, an ad was one flat row with a picture and a
 * destination and nothing recording who it was for — fine for posting an
 * affiliate link, impossible the first time a real company pays for one.
 *
 * Orders live here rather than on their own tab: an order only ever means
 * something under an advertiser, and a separate list of orders detached from
 * the companies that bought them is a screen nobody would open.
 */

const TIERS: ReadonlyArray<{ value: AdvertiserTier; label: string; hint: string }> = [
  { value: 'LOCAL', label: 'Local', hint: 'A shop near one campus. Every creative reviewed.' },
  { value: 'BRAND', label: 'Brand', hint: 'A national brand. Every creative reviewed, more placements.' },
  { value: 'HOUSE', label: 'House', hint: "Grid's own promotions. No review, because it is ours." },
]

const EMPTY_ADVERTISER = {
  name: '',
  legalName: '',
  tier: 'LOCAL' as AdvertiserTier,
  gstNumber: '',
  billingEmail: '',
  contactName: '',
  contactPhone: '',
  notes: '',
}

const EMPTY_ORDER = { name: '', amountRupees: '', notes: '' }

/** Amounts are stored in paise everywhere in this product; the form asks in rupees because nobody types paise. */
function rupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

type PendingAction =
  | { kind: 'suspend'; advertiser: Advertiser }
  | { kind: 'archive'; advertiser: Advertiser }

export function Advertisers() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_ADVERTISER)
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('')
  const [includeArchived, setIncludeArchived] = useState(false)
  const [suspendedOnly, setSuspendedOnly] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingAction | null>(null)

  const { rows, error: loadError, hasMore, loadingMore, loadMore, reload } = useCursorPagedData(
    async (cursor) => {
      const page = await api.advertisers.list(cursor, {
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(tier ? { tier } : {}),
        includeArchived,
        suspendedOnly,
      })
      return { rows: page.advertisers, nextCursor: page.nextCursor }
    },
    [search, tier, includeArchived, suspendedOnly],
  )
  const { run, busy, error: actionError } = useAdminAction(reload)
  const error = actionError ?? loadError

  async function create(event: React.FormEvent) {
    event.preventDefault()
    const body: CreateAdvertiserBody = {
      name: form.name.trim(),
      // Empty means "we do not know it", which the API expects as null rather
      // than an empty string that would print as a blank line on an invoice.
      legalName: form.legalName.trim() || null,
      tier: form.tier,
      gstNumber: form.gstNumber.trim().toUpperCase() || null,
      billingEmail: form.billingEmail.trim() || null,
      contactName: form.contactName.trim() || null,
      contactPhone: form.contactPhone.trim() || null,
      notes: form.notes.trim() || null,
    }
    if (await run(() => api.advertisers.create(body))) {
      setForm(EMPTY_ADVERTISER)
      setShowForm(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-text)]">Advertisers</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            The companies ads belong to, and what they have bought. Suspending one stops every ad
            they have running, immediately.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((open) => !open)}>
          {showForm ? 'Cancel' : 'New advertiser'}
        </Button>
      </div>

      <ErrorNote error={error} />

      {showForm ? (
        <Panel>
          <form onSubmit={create} className="space-y-3 p-4">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="What appears on the ad" />
            <Field
              label="Legal name (optional)"
              value={form.legalName}
              onChange={(v) => setForm({ ...form, legalName: v })}
              placeholder="Who the invoice is made out to, if different"
            />

            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">Tier</span>
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value as AdvertiserTier })}
                className="w-full rounded border border-[var(--color-border)] bg-transparent p-2 text-sm text-[var(--color-text)]"
              >
                {TIERS.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </select>
              <span className="block text-xs text-[var(--color-text-muted)]">
                {TIERS.find((entry) => entry.value === form.tier)?.hint}
              </span>
            </label>

            <Field
              label="GSTIN (optional)"
              value={form.gstNumber}
              onChange={(v) => setForm({ ...form, gstNumber: v })}
              placeholder="29ABCDE1234F1Z5"
            />
            <Field label="Billing email (optional)" value={form.billingEmail} onChange={(v) => setForm({ ...form, billingEmail: v })} placeholder="accounts@example.com" />
            <Field label="Contact name (optional)" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} placeholder="Who to talk to" />
            <Field label="Contact phone (optional)" value={form.contactPhone} onChange={(v) => setForm({ ...form, contactPhone: v })} placeholder="+91…" />
            <Field label="Notes (optional)" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Anything worth remembering" />

            {/* `type="submit"`, because Button defaults to "button" and this
                one lives in a form whose onSubmit does the work. */}
            <Button variant="primary" type="submit" onClick={() => undefined} disabled={busy}>
              {busy ? 'Creating…' : 'Create advertiser'}
            </Button>
          </form>
        </Panel>
      ) : null}

      <Panel className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <Field label="Search" value={search} onChange={setSearch} placeholder="Name, legal name or billing email" />
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Tier</span>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="rounded border border-[var(--color-border)] bg-transparent p-2 text-sm text-[var(--color-text)]"
            >
              <option value="">Any tier</option>
              {TIERS.map((entry) => (
                <option key={entry.value} value={entry.value}>
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
          <EmptyNote>No advertisers match. Grid&rsquo;s own affiliate links live under the House tier.</EmptyNote>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {rows.map((advertiser) => (
              <AdvertiserRow
                key={advertiser.id}
                advertiser={advertiser}
                busy={busy}
                expanded={expandedId === advertiser.id}
                onToggle={() => setExpandedId((current) => (current === advertiser.id ? null : advertiser.id))}
                onSuspend={() => setPending({ kind: 'suspend', advertiser })}
                onUnsuspend={() => void run(() => api.advertisers.setSuspension(advertiser.id, false, null))}
                onArchive={() => setPending({ kind: 'archive', advertiser })}
                onOrderCreated={reload}
              />
            ))}
          </ul>
        )}
        <MoreRow shown={rows?.length ?? 0} hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
      </Panel>

      {pending ? (
        <ReasonPrompt
          title={
            pending.kind === 'suspend'
              ? `Suspend ${pending.advertiser.name}?`
              : `Archive ${pending.advertiser.name}?`
          }
          confirmLabel={pending.kind === 'suspend' ? 'Suspend' : 'Archive'}
          variant="danger"
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={(reason) => {
            const action =
              pending.kind === 'suspend'
                ? () => api.advertisers.setSuspension(pending.advertiser.id, true, reason)
                : () => api.advertisers.archive(pending.advertiser.id, reason)
            void run(action).then(() => setPending(null))
          }}
        >
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">
            {pending.kind === 'suspend'
              ? `This pauses all ${pending.advertiser.activeLineItemCount} of their live ads straight away. Lifting the suspension later does not restart them — somebody decides that separately.`
              : 'Archiving hides them and pauses their live ads. Nothing is deleted: every order, ad and recorded impression stays readable, because that is what an invoice is built from.'}
          </p>
        </ReasonPrompt>
      ) : null}
    </div>
  )
}

function AdvertiserRow({
  advertiser,
  busy,
  expanded,
  onToggle,
  onSuspend,
  onUnsuspend,
  onArchive,
  onOrderCreated,
}: {
  advertiser: Advertiser
  busy: boolean
  expanded: boolean
  onToggle: () => void
  onSuspend: () => void
  onUnsuspend: () => void
  onArchive: () => void
  onOrderCreated: () => Promise<void> | void
}) {
  const archived = advertiser.archivedAt !== null
  const suspended = advertiser.suspendedAt !== null

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {archived ? <Badge>Archived</Badge> : suspended ? <Badge tone="bad">Suspended</Badge> : <Badge tone="good">Open</Badge>}
            <Badge>{advertiser.tier}</Badge>
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">{advertiser.name}</p>
          </div>
          <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
            {advertiser.legalName ? `${advertiser.legalName} · ` : ''}
            {advertiser.orderCount} order{advertiser.orderCount === 1 ? '' : 's'} ·{' '}
            {advertiser.activeLineItemCount} live ad{advertiser.activeLineItemCount === 1 ? '' : 's'}
            {advertiser.pendingCreativeCount > 0 ? ` · ${advertiser.pendingCreativeCount} creative awaiting review` : ''}
          </p>
          {suspended ? (
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Suspended: {advertiser.suspendedReason}
            </p>
          ) : null}
        </div>

        {/* Dismissive on the left, confirming on the right. */}
        <div className="flex items-center gap-2">
          <Button onClick={onToggle}>{expanded ? 'Hide orders' : 'Orders'}</Button>
          {!archived ? (
            <>
              <Button disabled={busy} onClick={suspended ? onUnsuspend : onSuspend}>
                {suspended ? 'Lift suspension' : 'Suspend'}
              </Button>
              <Button disabled={busy} onClick={onArchive}>
                Archive
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {expanded ? <Orders advertiser={advertiser} onChanged={onOrderCreated} /> : null}
    </li>
  )
}

function Orders({ advertiser, onChanged }: { advertiser: Advertiser; onChanged: () => Promise<void> | void }) {
  const [form, setForm] = useState(EMPTY_ORDER)

  const { rows, error: loadError, hasMore, loadingMore, loadMore, reload } = useCursorPagedData(
    async (cursor) => {
      const page = await api.adOrders.list(cursor, { advertiserId: advertiser.id })
      return { rows: page.orders, nextCursor: page.nextCursor }
    },
    [advertiser.id],
  )
  const { run, busy, error: actionError } = useAdminAction(async () => {
    await reload()
    await onChanged()
  })

  async function create(event: React.FormEvent) {
    event.preventDefault()
    const rupeeValue = Number(form.amountRupees.trim() || '0')
    if (!Number.isFinite(rupeeValue) || rupeeValue < 0) return
    const body: CreateAdOrderBody = {
      advertiserId: advertiser.id,
      name: form.name.trim(),
      // Rupees in the form, paise on the wire — the same unit everything else
      // in this product stores money in.
      amountPaise: Math.round(rupeeValue * 100),
      startsAt: null,
      endsAt: null,
      notes: form.notes.trim() || null,
    }
    if (await run(() => api.adOrders.create(body))) {
      setForm(EMPTY_ORDER)
    }
  }

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-[var(--color-border)] p-3">
      <ErrorNote error={actionError ?? loadError} />

      {rows === null ? (
        <EmptyNote>Loading orders…</EmptyNote>
      ) : rows.length === 0 ? (
        <EmptyNote>No orders yet. An ad needs one to hang from, even a free one.</EmptyNote>
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {rows.map((order) => (
            <OrderRow key={order.id} order={order} busy={busy} onArchive={(reason) => void run(() => api.adOrders.archive(order.id, reason))} />
          ))}
        </ul>
      )}
      <MoreRow shown={rows?.length ?? 0} hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />

      {advertiser.archivedAt === null ? (
        <form onSubmit={create} className="flex flex-wrap items-end gap-2 border-t border-[var(--color-border)] pt-3">
          <div className="min-w-[12rem] flex-1">
            <Field label="New order" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Freshers fortnight" />
          </div>
          <div className="w-32">
            <Field label="Amount (₹)" value={form.amountRupees} onChange={(v) => setForm({ ...form, amountRupees: v })} placeholder="20000" />
          </div>
          <Button variant="primary" type="submit" onClick={() => undefined} disabled={busy}>
            {busy ? 'Adding…' : 'Add order'}
          </Button>
        </form>
      ) : null}
    </div>
  )
}

function OrderRow({ order, busy, onArchive }: { order: AdOrder; busy: boolean; onArchive: (reason: string) => void }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <li className="flex flex-wrap items-center gap-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {order.archivedAt ? <Badge>Archived</Badge> : null}
          <p className="truncate text-sm font-medium text-[var(--color-text)]">{order.name}</p>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          {rupees(order.amountPaise)} · {order.lineItemCount} ad{order.lineItemCount === 1 ? '' : 's'}
        </p>
      </div>
      {order.archivedAt === null ? (
        <Button disabled={busy} onClick={() => setConfirming(true)}>
          Archive
        </Button>
      ) : null}

      {confirming ? (
        <ReasonPrompt
          title={`Archive ${order.name}?`}
          confirmLabel="Archive"
          variant="danger"
          busy={busy}
          onCancel={() => setConfirming(false)}
          onConfirm={(reason) => {
            onArchive(reason)
            setConfirming(false)
          }}
        >
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">
            Every ad under this order stops serving. The rows and their recorded delivery stay.
          </p>
        </ReasonPrompt>
      ) : null}
    </li>
  )
}
