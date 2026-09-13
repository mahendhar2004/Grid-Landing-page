import { apiGet } from '../lib/api'
import { useAsyncData } from '../lib/useAsyncData'
import { Badge, EmptyNote, ErrorNote, Panel } from '../components/ui'

/**
 * Every admin action, newest first.
 *
 * Read-only by construction - there is no write endpoint and no delete
 * endpoint. Rows are written only as a side effect of the action they
 * describe, inside that action's transaction, so an action cannot exist
 * without its record and a record cannot be edited after the fact.
 *
 * Visible to every admin on purpose. A log only one person can read is not
 * accountability, it is a diary.
 */

interface AuditEntry {
  id: string
  actor_email: string
  action: string
  target_type: string
  target_id: string
  reason: string | null
  details: Record<string, unknown>
  source_ip: string | null
  created_at: string
}

/** Anything that took something away reads red, so a scan of the log shows the consequential rows first. */
const DESTRUCTIVE = /BANNED|REMOVE|SPAM/

export function AuditLog() {
  const { data: entries, error } = useAsyncData(
    () => apiGet<AuditEntry[]>('/v1/admin/audit-log', { limit: 200 }),
    [],
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-text)]">Audit log</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Written with the action it records. Nothing here can be edited or removed.
        </p>
      </div>

      <ErrorNote error={error} />

      <Panel>
        {entries === null ? (
          <EmptyNote>Loading…</EmptyNote>
        ) : entries.length === 0 ? (
          <EmptyNote>No admin actions recorded yet.</EmptyNote>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {entries.map((entry) => (
              <li key={entry.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={DESTRUCTIVE.test(entry.action) ? 'bad' : 'neutral'}>{entry.action}</Badge>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {entry.target_type} · <span className="font-mono">{entry.target_id}</span>
                  </span>
                  <span className="ml-auto text-xs text-[var(--color-text-muted)]">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>

                {entry.reason ? (
                  <p className="mt-2 text-sm text-[var(--color-text)]">{entry.reason}</p>
                ) : (
                  <p className="mt-2 text-sm italic text-[var(--color-text-muted)]">No reason recorded.</p>
                )}

                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {entry.actor_email}
                  {entry.source_ip ? ` · ${entry.source_ip}` : ''}
                </p>

                {Object.keys(entry.details).length > 0 ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-[var(--color-text-muted)]">Details</summary>
                    <pre className="mt-1 overflow-x-auto rounded bg-black/30 p-2 text-xs text-[var(--color-text-muted)]">
                      {JSON.stringify(entry.details, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
