import { useState } from 'react'

import { api, triageStatusValue } from '../api/endpoints'
import type { TriageStatusFilter } from '../api/endpoints'
import type { TriageInbox, TriageItem } from '../api/types'
import type { ApiError } from '../lib/api'
import { useAsyncData } from '../lib/useAsyncData'
import { usePagedData } from '../lib/usePagedData'
import { Badge, Button, EmptyNote, ErrorNote, MoreRow, Panel, ReasonPrompt } from '../components/ui'

const PAGE_SIZE = 50

/** By meaning, not by spelling - each inbox names its resolved state differently, and `triageStatusValue` does that translation. */
const STATUS_FILTERS: ReadonlyArray<{ value: TriageStatusFilter; label: string }> = [
  { value: 'OPEN', label: 'Open' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'SPAM', label: 'Spam' },
  { value: null, label: 'All' },
]

/**
 * The five inboxes: in-app bug reports and feedback, plus contact messages,
 * bug reports and reviews from the marketing site.
 *
 * One screen rather than five, because the workflow is identical - read it,
 * decide, say why. The rows differ, so each inbox renders its own summary
 * line, but the actions and the reason prompt are shared.
 *
 * **Spam is a separate outcome from handled.** It is the only measurement that
 * would ever justify tightening a public rate limit, and collapsing the two
 * would make "how much of this is junk" unanswerable.
 */

/** The shared union, aliased so the rest of this file reads as it did. */
type Inbox = TriageInbox

const INBOX_LABELS: Record<Inbox, string> = {
  BUG_REPORT: 'Bug reports',
  FEEDBACK: 'Feedback',
  CONTACT_MESSAGE: 'Contact',
  PUBLIC_BUG_REPORT: 'Web bug reports',
  PUBLIC_REVIEW: 'Reviews',
}

/** `public_reviews` calls its waiting state PENDING; the rest say OPEN. */
const OPEN_STATUS: Record<Inbox, string> = {
  BUG_REPORT: 'OPEN',
  FEEDBACK: 'OPEN',
  CONTACT_MESSAGE: 'OPEN',
  PUBLIC_BUG_REPORT: 'OPEN',
  PUBLIC_REVIEW: 'PENDING',
}

type Pending =
  | { kind: 'RESOLVE'; item: TriageItem; isSpam: boolean }
  | { kind: 'FEATURE'; item: TriageItem; isFeatured: boolean }

function text(item: TriageItem, key: string): string | null {
  const value = item[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

/** One line per inbox, because a contact message and a review have nothing in common to show. */
function Summary({ inbox, item }: { inbox: Inbox; item: TriageItem }) {
  if (inbox === 'CONTACT_MESSAGE') {
    return (
      <>
        <p className="text-sm font-semibold text-[var(--color-text)]">{text(item, 'subject') ?? '(no subject)'}</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{text(item, 'message')}</p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          {text(item, 'name')} · {text(item, 'email')}
        </p>
      </>
    )
  }

  if (inbox === 'PUBLIC_REVIEW') {
    return (
      <>
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {'★'.repeat(Number(item['rating'] ?? 0))} {text(item, 'reviewer_name')}
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{text(item, 'feedback')}</p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{text(item, 'college')}</p>
      </>
    )
  }

  if (inbox === 'FEEDBACK') {
    return (
      <>
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {'★'.repeat(Number(item['rating'] ?? 0))}
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{text(item, 'message')}</p>
      </>
    )
  }

  // Both bug report shapes.
  const images = Array.isArray(item['image_keys']) ? (item['image_keys'] as string[]).length : 0
  // Only the web form collects these - an in-app report is already tied to a
  // signed-in user. Shown because a bug report is the one inbox where the
  // answer is usually "we need one more detail from you", and without the
  // address there is no way to ask.
  const reporter = [text(item, 'reporter_name'), text(item, 'reporter_email')].filter(Boolean).join(' · ')
  return (
    <>
      <p className="text-sm font-semibold text-[var(--color-text)]">
        {text(item, 'title') ?? 'Bug report'}
      </p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{text(item, 'description')}</p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        {[text(item, 'severity'), text(item, 'category'), images > 0 ? `${images} screenshot(s)` : null]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {reporter ? <p className="mt-1 text-xs text-[var(--color-text-muted)]">{reporter}</p> : null}
    </>
  )
}

export function Triage() {
  const [inbox, setInbox] = useState<Inbox>('BUG_REPORT')
  const [statusFilter, setStatusFilter] = useState<TriageStatusFilter>('OPEN')
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<ApiError | null>(null)

  /*
    Two reads, where there used to be one.

    They were fetched together so "the badge counts can never disagree with
    the list they sit above" - an invariant that stops being meaningful the
    moment the list has its own status filter. The counts are open items per
    inbox; the list is whatever is being looked at. Showing "3" beside an
    inbox while its Resolved tab lists forty is not a disagreement, it is two
    different questions, and coupling them would imply an agreement that is
    not supposed to exist.
  */
  const { rows: items, error: loadError, hasMore, loadingMore, loadMore, reload: reloadItems } = usePagedData(
    (offset) => api.triage.list(inbox, triageStatusValue(inbox, statusFilter), PAGE_SIZE, offset),
    [inbox, statusFilter],
    PAGE_SIZE,
  )
  const { data: counts, error: countsError, reload: reloadCounts } = useAsyncData(
    () => api.triage.counts(),
    [],
  )
  const reload = async () => {
    await Promise.all([reloadItems(), reloadCounts()])
  }
  const error = actionError ?? loadError ?? countsError

  async function confirm(reason: string) {
    if (!pending) return
    setBusy(true)
    setActionError(null)
    try {
      if (pending.kind === 'RESOLVE') {
        await api.triage.resolve(inbox, pending.item.id, pending.isSpam, reason)
      } else {
        await api.triage.featureReview(pending.item.id, pending.isFeatured, reason)
      }
      setPending(null)
      await reload()
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[var(--color-text)]">Inboxes</h1>

      <div className="flex flex-wrap gap-1">
        {(Object.keys(INBOX_LABELS) as Inbox[]).map((value) => (
          <Button key={value} variant={inbox === value ? 'primary' : 'default'} onClick={() => setInbox(value)}>
            {INBOX_LABELS[value]}
            {(counts?.[value] ?? 0) > 0 ? ` (${counts?.[value]})` : ''}
          </Button>
        ))}
      </div>

      {/* The badge counts above are open items per inbox; this filters what
          is listed. Resolved and spam were unreachable before - the only view
          was whatever the route returned by default. */}
      <div className="flex flex-wrap gap-1">
        {STATUS_FILTERS.map((entry) => (
          <Button
            key={entry.label}
            variant={statusFilter === entry.value ? 'primary' : 'default'}
            onClick={() => setStatusFilter(entry.value)}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      <ErrorNote error={error} />

      <Panel>
        {items === null ? (
          <EmptyNote>Loading…</EmptyNote>
        ) : items.length === 0 ? (
          <EmptyNote>Nothing here.</EmptyNote>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {items.map((item) => {
              const isOpen = item.status === OPEN_STATUS[inbox]
              return (
                <li key={item.id} className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge tone={isOpen ? 'warn' : item.status === 'SPAM' ? 'bad' : 'good'}>{item.status}</Badge>
                    {inbox === 'PUBLIC_REVIEW' && item.is_featured ? <Badge tone="good">On homepage</Badge> : null}
                    <span className="ml-auto text-xs text-[var(--color-text-muted)]">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <Summary inbox={inbox} item={item} />

                  <div className="mt-3 flex flex-wrap gap-2">
                    {isOpen ? (
                      <>
                        <Button onClick={() => setPending({ kind: 'RESOLVE', item, isSpam: false })}>
                          {inbox === 'PUBLIC_REVIEW' ? 'Approve' : 'Mark handled'}
                        </Button>
                        <Button variant="danger" onClick={() => setPending({ kind: 'RESOLVE', item, isSpam: true })}>
                          Spam
                        </Button>
                      </>
                    ) : null}

                    {/* Featuring is a second, separate decision - approving
                        says "not abuse", featuring says "quote this to every
                        visitor". The server refuses to feature anything not
                        approved, so the button only appears once it is. */}
                    {inbox === 'PUBLIC_REVIEW' && item.status === 'APPROVED' ? (
                      <Button
                        onClick={() => setPending({ kind: 'FEATURE', item, isFeatured: !item.is_featured })}
                      >
                        {item.is_featured ? 'Remove from homepage' : 'Feature on homepage'}
                      </Button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <MoreRow
          shown={items?.length ?? 0}
          hasMore={hasMore}
          loading={loadingMore}
          onLoadMore={loadMore}
        />
      </Panel>

      {pending ? (
        <ReasonPrompt
          title={
            pending.kind === 'FEATURE'
              ? pending.isFeatured
                ? 'Feature on the homepage'
                : 'Remove from the homepage'
              : pending.isSpam
                ? 'Mark as spam'
                : 'Mark as handled'
          }
          confirmLabel="Confirm"
          variant={pending.kind === 'RESOLVE' && pending.isSpam ? 'danger' : 'default'}
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={confirm}
        />
      ) : null}
    </div>
  )
}
