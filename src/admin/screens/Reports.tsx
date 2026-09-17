import { useState } from 'react'

import { api } from '../api/endpoints'
import type { ReportCategory } from '../api/endpoints'
import type { AdminReport } from '../api/types'
import { usePagedData } from '../lib/usePagedData'
import { useAdminAction } from '../lib/useAdminAction'
import { Badge, Button, EmptyNote, ErrorNote, MoreRow, Panel, ReasonPrompt } from '../components/ui'

/**
 * The moderation queue - the screen this console exists for.
 *
 * Open reports, oldest first, because the oldest is the one that has been
 * waiting longest. Each row shows how many distinct people reported the same
 * target: one report is noise, five is a pattern, and that number is the
 * single most useful thing on the screen.
 *
 * Every action resolves the report server-side in the same transaction, so
 * there is no "now mark it done" step to forget - and acting clears every
 * duplicate report against the same target, so five reports of one listing
 * are one decision rather than five.
 */

type PendingAction =
  | { kind: 'DISMISS'; report: AdminReport }
  | { kind: 'REMOVE_CONTENT'; report: AdminReport }
  | { kind: 'WARN_USER'; report: AdminReport }
  | { kind: 'BAN_USER'; report: AdminReport; durationDays: number | null }
  // The two that undo the two above. Both routes existed from the start and
  // neither had a caller, which made Remove and Ban one-way doors.
  | { kind: 'RESTORE_CONTENT'; report: AdminReport }
  | { kind: 'UNBAN_USER'; report: AdminReport }

const PAGE_SIZE = 50

/** `null` is every category, which is a different question from any one of them. */
const CATEGORIES: ReadonlyArray<{ value: ReportCategory | null; label: string }> = [
  { value: null, label: 'All' },
  { value: 'SCAM', label: 'Scam' },
  { value: 'PROHIBITED_ITEM', label: 'Prohibited' },
  { value: 'FAKE_LISTING', label: 'Fake' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'WRONG_DESCRIPTION', label: 'Wrong description' },
  { value: 'OTHER', label: 'Other' },
]

const CATEGORY_TONE: Record<string, 'neutral' | 'warn' | 'bad'> = {
  PROHIBITED_ITEM: 'bad',
  SCAM: 'bad',
  FAKE_LISTING: 'warn',
  WRONG_DESCRIPTION: 'warn',
  SPAM: 'warn',
  OTHER: 'neutral',
}

/**
 * The legal clock a report is running against.
 *
 * **Duplicated from `packages/constants/src/dpdp.ts` in the Grid monorepo**,
 * because this repository is separate and cannot import from it. Kept as a
 * named constant with this note rather than inlined, so the next person to
 * change the law in one place can find the other.
 *
 * 36 hours is IT Rules Rule 3(1)(b) as amended in February 2026 - the clock
 * that a user-reported item runs against. Two shorter ones exist and are not
 * modelled here because neither arrives through this queue: a court order or
 * government notice is 3 hours, and non-consensual intimate imagery is 2.
 * Both reach a human directly, not through the in-app report button.
 */
const REPORT_SLA_HOURS = 36

/** How long this report has been waiting, and whether that is now a problem. */
function slaState(createdAt: string): { label: string; tone: 'neutral' | 'warn' | 'bad' } {
  const hours = (Date.now() - new Date(createdAt).getTime()) / 3_600_000
  const rounded = hours < 1 ? `${Math.round(hours * 60)}m` : `${Math.floor(hours)}h`

  if (hours >= REPORT_SLA_HOURS) {
    return { label: `${rounded} · past ${REPORT_SLA_HOURS}h`, tone: 'bad' }
  }
  // Three quarters through. Early enough that acting still costs nothing.
  if (hours >= REPORT_SLA_HOURS * 0.75) {
    return { label: `${rounded} of ${REPORT_SLA_HOURS}h`, tone: 'warn' }
  }
  return { label: rounded, tone: 'neutral' }
}

export function Reports() {
  const [status, setStatus] = useState<'OPEN' | 'ACTIONED' | 'DISMISSED'>('OPEN')
  const [category, setCategory] = useState<ReportCategory | null>(null)
  const [pending, setPending] = useState<PendingAction | null>(null)

  const { rows: reports, error: loadError, hasMore, loadingMore, loadMore, reload } = usePagedData(
    (offset) => api.reports.list(status, category, PAGE_SIZE, offset),
    [status, category],
    PAGE_SIZE,
  )

  // Rule 5: writes go through `useAdminAction`. This screen was doing its own
  // busy/error/reload by hand, which is the exact duplication that hook
  // exists to delete.
  const { run, busy, error: actionError } = useAdminAction(reload)
  const error = actionError ?? loadError

  async function runAction(reason: string) {
    if (!pending) return
    const report = pending.report
    const succeeded = await run(async () => {
      if (pending.kind === 'DISMISS') {
        return api.reports.dismiss(report.id, reason)
      }
      if (pending.kind === 'BAN_USER') {
        // `null` is a permanent ban, not an omission - the union keeps the
        // two from being confused.
        return api.reports.act(
          report.id,
          { action: 'BAN_USER', banDurationDays: pending.durationDays },
          reason,
        )
      }
      if (pending.kind === 'UNBAN_USER') {
        // Not a report action: the ban belongs to the person, not to the
        // report that prompted it, so lifting it goes to the user route.
        return api.users.unban(report.target_owner_id!, reason)
      }
      if (pending.kind === 'RESTORE_CONTENT') {
        return api.content.restore(
          report.target_listing_id
            ? { listingId: report.target_listing_id }
            : { requestId: report.target_request_id! },
          reason,
        )
      }
      return api.reports.act(report.id, { action: pending.kind }, reason)
    })
    if (succeeded) setPending(null)
  }

  function targetKind(report: AdminReport): string {
    if (report.target_listing_id) return 'Listing'
    if (report.target_request_id) return 'Request'
    return 'User'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[var(--color-text)]">Reports</h1>
        <div className="flex gap-1">
          {(['OPEN', 'ACTIONED', 'DISMISSED'] as const).map((value) => (
            <Button key={value} variant={status === value ? 'primary' : 'default'} onClick={() => setStatus(value)}>
              {value[0] + value.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Category, not just status. Scams and prohibited items deserve to be
          worked before wrong descriptions, and until now they were
          interleaved with them. The route has always accepted this. */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((entry) => (
          <Button
            key={entry.label}
            variant={category === entry.value ? 'primary' : 'default'}
            onClick={() => setCategory(entry.value)}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      <ErrorNote error={error} />

      <Panel>
        {reports === null ? (
          <EmptyNote>Loading…</EmptyNote>
        ) : reports.length === 0 ? (
          <EmptyNote>
            {category
              ? `No ${status.toLowerCase()} reports in this category.`
              : status === 'OPEN'
                ? 'Nothing waiting. The queue is clear.'
                : `No ${status.toLowerCase()} reports.`}
          </EmptyNote>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {reports.map((report) => (
              <li key={report.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={CATEGORY_TONE[report.category] ?? 'neutral'}>{report.category}</Badge>
                  <span className="text-xs text-[var(--color-text-muted)]">{targetKind(report)}</span>
                  {report.report_count > 1 ? (
                    // The strongest signal on the screen, so it is the loudest
                    // thing in the row.
                    <Badge tone="bad">{report.report_count} reports</Badge>
                  ) : null}
                  {/* Only meaningful while it is still open - a resolved
                      report's age is history, not a deadline. */}
                  {status === 'OPEN' ? (
                    <Badge tone={slaState(report.created_at).tone}>
                      {slaState(report.created_at).label}
                    </Badge>
                  ) : null}
                  <span className="ml-auto text-xs text-[var(--color-text-muted)]">
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                  {report.target_label ?? '(target no longer exists)'}
                </p>
                {report.description ? (
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{report.description}</p>
                ) : null}
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Reported by {report.reporter_email}
                </p>

                {status === 'OPEN' ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={() => setPending({ kind: 'DISMISS', report })}>Dismiss</Button>
                    {/* Only offered when there is content to remove - a
                        user-targeted report has none, and the server rejects
                        it rather than silently doing nothing. */}
                    {report.target_listing_id || report.target_request_id ? (
                      <Button variant="danger" onClick={() => setPending({ kind: 'REMOVE_CONTENT', report })}>
                        Remove content
                      </Button>
                    ) : null}
                    <Button onClick={() => setPending({ kind: 'WARN_USER', report })}>Warn</Button>
                    <Button
                      variant="danger"
                      onClick={() => setPending({ kind: 'BAN_USER', report, durationDays: 7 })}
                    >
                      Ban 7d
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setPending({ kind: 'BAN_USER', report, durationDays: null })}
                    >
                      Ban indefinitely
                    </Button>
                  </div>
                ) : (
                  /*
                    The way back.

                    Offered only where there is genuinely something to undo:
                    `target_removed` and `target_owner_is_banned` come from the
                    queue itself, so a Restore button never appears over
                    content that is already live, and Lift ban never appears
                    over somebody who is not banned. Both fields are optional
                    (rule 9) - on a console deployed ahead of its API they are
                    `undefined`, and the actions simply do not render, which is
                    where this screen already was.
                  */
                  <div className="mt-3 flex flex-wrap gap-2">
                    {report.target_removed ? (
                      <Button onClick={() => setPending({ kind: 'RESTORE_CONTENT', report })}>
                        Restore content
                      </Button>
                    ) : null}
                    {report.target_owner_is_banned && report.target_owner_id ? (
                      <Button onClick={() => setPending({ kind: 'UNBAN_USER', report })}>
                        Lift ban
                        {report.target_owner_banned_until
                          ? ` (until ${new Date(report.target_owner_banned_until).toLocaleDateString()})`
                          : ' (permanent)'}
                      </Button>
                    ) : null}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <MoreRow
          shown={reports?.length ?? 0}
          hasMore={hasMore}
          loading={loadingMore}
          onLoadMore={loadMore}
        />
      </Panel>

      {pending ? (
        <ReasonPrompt
          title={
            pending.kind === 'DISMISS'
              ? 'Dismiss this report'
              : pending.kind === 'REMOVE_CONTENT'
                ? 'Remove this content'
                : pending.kind === 'RESTORE_CONTENT'
                  ? 'Put this content back'
                  : pending.kind === 'UNBAN_USER'
                    ? 'Lift this ban'
                    : pending.kind === 'WARN_USER'
                      ? 'Warn this user'
                      : pending.durationDays === null
                        ? 'Ban indefinitely'
                        : `Ban for ${pending.durationDays} days`
          }
          confirmLabel={pending.kind === 'DISMISS' ? 'Dismiss' : 'Confirm'}
          variant={
            pending.kind === 'RESTORE_CONTENT' || pending.kind === 'UNBAN_USER' || pending.kind === 'DISMISS'
              ? 'default'
              : 'danger'
          }
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={runAction}
        >
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">
            {pending.kind === 'RESTORE_CONTENT'
              ? 'The listing or request becomes visible again to everyone who could see it before.'
              : pending.kind === 'UNBAN_USER'
                ? 'They can sign in and use Grid again immediately. The ban stays in the history.'
                : pending.report.report_count > 1
                  ? `This also resolves the other ${pending.report.report_count - 1} report(s) against the same target.`
                  : 'The person affected is notified, and this is recorded in the audit log.'}
          </p>
        </ReasonPrompt>
      ) : null}
    </div>
  )
}
