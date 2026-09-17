import { useState } from 'react'

import { api } from '../api/endpoints'
import type { CreateCreativeBody } from '../api/endpoints'
import type { Creative, CreativeReviewStatus } from '../api/types'
import { useCursorPagedData } from '../lib/usePagedData'
import { useAdminAction } from '../lib/useAdminAction'
import { Badge, Button, EmptyNote, ErrorNote, Field, MoreRow, Panel, ReasonPrompt } from '../components/ui'

/**
 * Creatives — the artwork, reviewed once
 * (`docs/grid-v2/ADVERTISING_PLATFORM_PLAN.md` §3 and §10).
 *
 * Review is here rather than on the ad itself because one image can run in six
 * campaigns, and approving it six times is six chances to approve it wrongly.
 * The corollary is the thing this screen has to make obvious: **rejecting a
 * creative stops every campaign using it**, which is why each row says how many
 * that is before you decide.
 *
 * Images come in as URLs from the same presigned upload and `Verified` tag
 * pipeline as listing photos. Ad artwork is the content an app reviewer is
 * most likely to look at; a second upload path for it would be a second thing
 * to keep correct.
 */

const REVIEW_FILTERS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '', label: 'Any status' },
  { value: 'PENDING', label: 'Awaiting review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

const EMPTY_FORM = {
  advertiserId: '',
  title: '',
  sponsorName: '',
  imageUrl: '',
  targetUrl: '',
  disclosure: '',
}

/**
 * Amazon's Operating Agreement requires this exact sentiment beside any
 * Associates link, and "Sponsored" on the card does not satisfy it. Offered as
 * a one-tap fill because it is the disclosure most likely to be needed and the
 * easiest to get subtly wrong by retyping.
 */
const AMAZON_DISCLOSURE = 'As an Amazon Associate I earn from qualifying purchases.'

const REVIEW_TONE: Readonly<Record<CreativeReviewStatus, 'good' | 'warn' | 'bad'>> = {
  APPROVED: 'good',
  PENDING: 'warn',
  REJECTED: 'bad',
}

type PendingAction = { kind: 'reject' | 'archive'; creative: Creative }

export function Creatives({ initialReviewStatus = '' }: { initialReviewStatus?: string }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [reviewStatus, setReviewStatus] = useState(initialReviewStatus)
  const [includeArchived, setIncludeArchived] = useState(false)
  const [pending, setPending] = useState<PendingAction | null>(null)

  const { rows, error: loadError, hasMore, loadingMore, loadMore, reload } = useCursorPagedData(
    async (cursor) => {
      const page = await api.creatives.list(cursor, {
        ...(reviewStatus ? { reviewStatus } : {}),
        includeArchived,
      })
      return { rows: page.creatives, nextCursor: page.nextCursor }
    },
    [reviewStatus, includeArchived],
  )

  const advertisers = useCursorPagedData(
    async (cursor) => {
      const page = await api.advertisers.list(cursor)
      return { rows: page.advertisers, nextCursor: page.nextCursor }
    },
    [],
  )

  const { run, busy, error: actionError } = useAdminAction(reload)
  const error = actionError ?? loadError

  async function create(event: React.FormEvent) {
    event.preventDefault()
    const body: CreateCreativeBody = {
      advertiserId: form.advertiserId,
      title: form.title.trim(),
      sponsorName: form.sponsorName.trim(),
      imageUrl: form.imageUrl.trim(),
      targetUrl: form.targetUrl.trim(),
      disclosure: form.disclosure.trim() || null,
    }
    if (await run(() => api.creatives.create(body))) {
      setForm(EMPTY_FORM)
      setShowForm(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-text)]">Creatives</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            The artwork and where it points. Reviewed once and reusable — so rejecting one stops
            every ad running on it, not only the one you were looking at.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((open) => !open)}>
          {showForm ? 'Cancel' : 'New creative'}
        </Button>
      </div>

      <ErrorNote error={error} />

      {showForm ? (
        <Panel>
          <form onSubmit={create} className="space-y-3 p-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--color-text-muted)]">Advertiser</span>
              <select
                value={form.advertiserId}
                onChange={(e) => setForm({ ...form, advertiserId: e.target.value })}
                className="w-full rounded border border-[var(--color-border)] bg-transparent p-2 text-sm text-[var(--color-text)]"
              >
                <option value="">Choose an advertiser…</option>
                {(advertisers.rows ?? [])
                  .filter((entry) => entry.archivedAt === null && entry.suspendedAt === null)
                  .map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
              </select>
              <span className="block text-xs text-[var(--color-text-muted)]">
                Suspended and archived advertisers are left out — the API refuses them anyway, and
                offering one would be offering a choice that cannot work.
              </span>
            </label>

            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="What the card says" />
            <Field label="Sponsor name" value={form.sponsorName} onChange={(v) => setForm({ ...form, sponsorName: v })} placeholder="Who it is for" />
            <Field label="Image URL" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} placeholder="https://…" />
            <Field
              label="Target URL"
              value={form.targetUrl}
              onChange={(v) => setForm({ ...form, targetUrl: v })}
              placeholder="The destination, tracking parameters and all"
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
                  Use Amazon&rsquo;s wording
                </Button>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Required by Amazon&rsquo;s Operating Agreement on every Associates link.
                </span>
              </div>
            </div>

            <Button variant="primary" type="submit" onClick={() => undefined} disabled={busy || form.advertiserId === ''}>
              {busy ? 'Creating…' : 'Create creative'}
            </Button>
          </form>
        </Panel>
      ) : null}

      <Panel className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Review status</span>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="rounded border border-[var(--color-border)] bg-transparent p-2 text-sm text-[var(--color-text)]"
            >
              {REVIEW_FILTERS.map((entry) => (
                <option key={entry.value || 'any'} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
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
          <EmptyNote>Nothing here. A queue nobody looks at is a campaign that silently never runs.</EmptyNote>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {rows.map((creative) => (
              <li key={creative.id} className="flex flex-wrap items-center gap-3 p-4">
                <img
                  src={creative.imageUrl}
                  alt=""
                  className="h-12 w-20 shrink-0 rounded object-cover"
                  // A broken image is worth seeing rather than hiding: it is
                  // itself a reason not to approve the creative.
                  onError={(event) => {
                    event.currentTarget.style.opacity = '0.3'
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {creative.archivedAt ? <Badge>Archived</Badge> : <Badge tone={REVIEW_TONE[creative.reviewStatus]}>{creative.reviewStatus}</Badge>}
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">{creative.title}</p>
                  </div>
                  <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
                    {creative.advertiserName} · {creative.sponsorName} · used by {creative.lineItemCount} ad
                    {creative.lineItemCount === 1 ? '' : 's'}
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-[var(--color-text-muted)]">{creative.targetUrl}</p>
                  {creative.disclosure ? (
                    <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">&ldquo;{creative.disclosure}&rdquo;</p>
                  ) : null}
                  {creative.reviewReason ? (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">Rejected: {creative.reviewReason}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  {creative.reviewStatus === 'PENDING' && creative.archivedAt === null ? (
                    <>
                      {/* Dismissive left, confirming right. */}
                      <Button disabled={busy} onClick={() => setPending({ kind: 'reject', creative })}>
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        disabled={busy}
                        onClick={() => void run(() => api.creatives.review(creative.id, { decision: 'APPROVED' }))}
                      >
                        Approve
                      </Button>
                    </>
                  ) : null}
                  {creative.archivedAt === null ? (
                    <Button disabled={busy} onClick={() => setPending({ kind: 'archive', creative })}>
                      Archive
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
        <MoreRow shown={rows?.length ?? 0} hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
      </Panel>

      {pending ? (
        <ReasonPrompt
          title={pending.kind === 'reject' ? `Reject “${pending.creative.title}”?` : `Archive “${pending.creative.title}”?`}
          confirmLabel={pending.kind === 'reject' ? 'Reject' : 'Archive'}
          variant="danger"
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={(reason) => {
            const action =
              pending.kind === 'reject'
                ? () => api.creatives.review(pending.creative.id, { decision: 'REJECTED', reason })
                : () => api.creatives.archive(pending.creative.id, reason)
            void run(action).then(() => setPending(null))
          }}
        >
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">
            {pending.creative.lineItemCount > 0
              ? `This pauses all ${pending.creative.lineItemCount} ad${pending.creative.lineItemCount === 1 ? '' : 's'} using this creative, not only the one you were looking at.`
              : 'Nothing is running on this creative yet, so nothing stops.'}{' '}
            The reason is what the advertiser is told.
          </p>
        </ReasonPrompt>
      ) : null}
    </div>
  )
}
