import { useState } from 'react'

import { api } from '../api/endpoints'
import type { AdminReport } from '../api/types'
import type { ApiError } from '../lib/api'
import { useAsyncData } from '../lib/useAsyncData'
import { Badge, Button, EmptyNote, ErrorNote, Panel, ReasonPrompt } from '../components/ui'

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
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<ApiError | null>(null)

  const { data: reports, error: loadError, reload } = useAsyncData(
    () => api.reports.list(status),
    [status],
  )
  const error = actionError ?? loadError

  async function runAction(reason: string) {
    if (!pending) return
    setBusy(true)
    setActionError(null)
    try {
      if (pending.kind === 'DISMISS') {
        await api.reports.dismiss(pending.report.id, reason)
      } else if (pending.kind === 'BAN_USER') {
        // `null` is a permanent ban, not an omission - the union keeps the
        // two from being confused.
        await api.reports.act(
          pending.report.id,
          { action: 'BAN_USER', banDurationDays: pending.durationDays },
          reason,
        )
      } else {
        await api.reports.act(pending.report.id, { action: pending.kind }, reason)
      }
      setPending(null)
      await reload()
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setBusy(false)
    }
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

      <ErrorNote error={error} />

      <Panel>
        {reports === null ? (
          <EmptyNote>Loading…</EmptyNote>
        ) : reports.length === 0 ? (
          <EmptyNote>
            {status === 'OPEN' ? 'Nothing waiting. The queue is clear.' : `No ${status.toLowerCase()} reports.`}
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
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {pending ? (
        <ReasonPrompt
          title={
            pending.kind === 'DISMISS'
              ? 'Dismiss this report'
              : pending.kind === 'REMOVE_CONTENT'
                ? 'Remove this content'
                : pending.kind === 'WARN_USER'
                  ? 'Warn this user'
                  : pending.durationDays === null
                    ? 'Ban indefinitely'
                    : `Ban for ${pending.durationDays} days`
          }
          confirmLabel={pending.kind === 'DISMISS' ? 'Dismiss' : 'Confirm'}
          variant={pending.kind === 'DISMISS' ? 'default' : 'danger'}
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={runAction}
        >
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">
            {pending.report.report_count > 1
              ? `This also resolves the other ${pending.report.report_count - 1} report(s) against the same target.`
              : 'The person affected is notified, and this is recorded in the audit log.'}
          </p>
        </ReasonPrompt>
      ) : null}
    </div>
  )
}
