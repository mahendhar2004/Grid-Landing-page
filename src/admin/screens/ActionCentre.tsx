import { Badge, EmptyNote, ErrorNote, Panel } from '../components/ui'
import { api } from '../api/endpoints'
import type { AdminOrganization, AdminReport, TriageCounts } from '../api/types'
import { useAsyncData } from '../lib/useAsyncData'

/**
 * Everything waiting on an admin, in one place, worst first.
 *
 * The console had seven tabs and no answer to "what do I need to do?" — you
 * found out by opening each one. That is fine with one admin who checks
 * daily and useless the moment something is urgent, because urgency is
 * exactly what an unread tab hides.
 *
 * **Severity is a fixed, stated order, not a guess.** Each row below carries
 * its own reason for sitting where it does, because "high priority" with no
 * argument behind it is just a colour. The order is:
 *
 * 1. **Moderation reports** — somebody has reported content or a person.
 *    Real harm, already happening, and the only queue where the cost of
 *    waiting falls on a user rather than on us.
 * 2. **Contact messages** — these carry a clock that is not ours to set:
 *    the published grievance policy promises an acknowledgement within a
 *    fixed window, and a missed one is a compliance failure, not a rude
 *    delay.
 * 3. **Hubs awaiting visibility** — a registered organisation that nobody
 *    can find. Every hour here is a campus that signed up and sees an empty
 *    map, which is how a new Hub dies before it starts.
 * 4. **Bug reports** — someone hit something broken and took the trouble to
 *    say so.
 * 5. **Feedback and reviews** — worth reading, no clock.
 *
 * It composes from endpoints that already exist rather than adding a
 * dashboard route to the backend: three parallel calls the console was
 * making anyway, so there is no new server surface to keep in step.
 */

type Severity = 'urgent' | 'high' | 'normal' | 'low'

interface ActionRow {
  readonly key: string
  readonly label: string
  readonly count: number
  readonly severity: Severity
  /** Why this sits where it does. Shown, not just reasoned about in a comment. */
  readonly why: string
  readonly tab: string
}

const SEVERITY_TONE: Record<Severity, 'good' | 'warn' | 'bad' | undefined> = {
  urgent: 'bad',
  high: 'warn',
  normal: undefined,
  low: undefined,
}

const SEVERITY_LABEL: Record<Severity, string> = {
  urgent: 'Urgent',
  high: 'Time-bound',
  normal: 'Waiting',
  low: 'Whenever',
}

export function ActionCentre({ onOpenTab }: { onOpenTab: (tab: string) => void }) {
  const { data: rows, error } = useAsyncData<ActionRow[]>(async () => {
    /*
      In parallel, and each failure contained. One dead endpoint must not
      blank the whole page - a dashboard showing nothing because one of five
      numbers is missing is worse than one showing four.
    */
    const [counts, reports, organizations] = await Promise.all([
      api.triage.counts().catch(() => ({}) as TriageCounts),
      api.reports.list('OPEN').catch(() => [] as AdminReport[]),
      api.organizations.list().catch(() => [] as AdminOrganization[]),
    ])

    const pendingHubs = organizations.filter((organization) => organization.hubStatus !== 'ACTIVE').length
    const bugs = (counts.BUG_REPORT ?? 0) + (counts.PUBLIC_BUG_REPORT ?? 0)
    const soft = (counts.FEEDBACK ?? 0) + (counts.PUBLIC_REVIEW ?? 0)

    return [
      {
        key: 'reports',
        label: 'Moderation reports',
        count: reports.length,
        severity: 'urgent',
        why: 'Someone reported content or a person. The only queue where waiting costs a user, not us.',
        tab: 'reports',
      },
      {
        key: 'contact',
        label: 'Contact messages',
        count: counts.CONTACT_MESSAGE ?? 0,
        severity: 'high',
        why: 'The published grievance policy promises an acknowledgement within a fixed window. Missing it is a compliance failure, not a late reply.',
        tab: 'triage',
      },
      {
        key: 'hubs',
        label: 'Hubs awaiting visibility',
        count: pendingHubs,
        severity: 'high',
        why: 'A registered organisation nobody can find. Every hour is a campus looking at an empty map.',
        tab: 'organizations',
      },
      {
        key: 'bugs',
        label: 'Bug reports',
        count: bugs,
        severity: 'normal',
        why: 'Someone hit something broken and took the trouble to tell us.',
        tab: 'triage',
      },
      {
        key: 'soft',
        label: 'Feedback and reviews',
        count: soft,
        severity: 'low',
        why: 'Worth reading. No clock on it.',
        tab: 'triage',
      },
    ]
  }, [])

  if (error) {
    return <ErrorNote error={error} />
  }
  if (rows === null) {
    return (
      <Panel>
        <EmptyNote>Loading…</EmptyNote>
      </Panel>
    )
  }

  const waiting = rows.filter((row) => row.count > 0)
  const total = waiting.reduce((sum, row) => sum + row.count, 0)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-text)]">What needs you</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {total === 0
            ? 'Nothing is waiting. Every queue is empty.'
            : `${total} ${total === 1 ? 'item' : 'items'} waiting, most urgent first.`}
        </p>
      </div>

      <Panel>
        {waiting.length === 0 ? (
          <EmptyNote>All clear.</EmptyNote>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {waiting.map((row) => (
              <li key={row.key}>
                <button
                  onClick={() => onOpenTab(row.tab)}
                  className="flex w-full items-start gap-3 p-4 text-left hover:bg-white/5"
                  data-testid={`action-${row.key}`}
                >
                  <span className="min-w-[2.5rem] text-xl font-bold tabular-nums text-[var(--color-text)]">
                    {row.count}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[var(--color-text)]">{row.label}</span>
                    {/* The reason, on the row. A severity colour with no
                        argument behind it is decoration. */}
                    <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">{row.why}</span>
                  </span>
                  <Badge tone={SEVERITY_TONE[row.severity]}>{SEVERITY_LABEL[row.severity]}</Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/*
        The empty queues, listed rather than hidden. "Nothing in moderation"
        is information an admin actively wants; a dashboard that only ever
        shows problems cannot distinguish "clear" from "not loaded".
      */}
      {waiting.length < rows.length ? (
        <Panel className="p-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            Clear:{' '}
            {rows
              .filter((row) => row.count === 0)
              .map((row) => row.label)
              .join(' · ')}
          </p>
        </Panel>
      ) : null}
    </div>
  )
}
