import { useState } from 'react'

import { api } from '../api/endpoints'
import { usePagedData } from '../lib/usePagedData'
import { Badge, Button, EmptyNote, ErrorNote, Field, MoreRow, Panel } from '../components/ui'

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
 *
 * **Read-only does not mean unsearchable**, which is how it shipped: no filter
 * of any kind, a hard 200-row cap, and no sign that anything was cut off - on
 * the one screen most likely to be opened with a specific question ("what did
 * we do to this organization?"). The route has accepted `targetType` and
 * `targetId` from the start; neither was wired. Filtering changes what is
 * shown, never what is stored.
 */

/** Anything that took something away reads red, so a scan of the log shows the consequential rows first. */
const DESTRUCTIVE = /BANNED|REMOVE|SPAM/

const PAGE_SIZE = 100

/**
 * The target types the log actually records, so the filter is a choice rather
 * than a guess at a spelling. "Anything" is first because browsing the whole
 * log is the common case and narrowing is the deliberate one.
 */
const TARGET_TYPES: ReadonlyArray<{ value: string | undefined; label: string }> = [
  { value: undefined, label: 'Anything' },
  { value: 'USER', label: 'Users' },
  { value: 'LISTING', label: 'Listings' },
  { value: 'REQUEST', label: 'Requests' },
  { value: 'ORGANIZATION', label: 'Organizations' },
  { value: 'REPORT', label: 'Reports' },
]

export function AuditLog() {
  const [targetType, setTargetType] = useState<string | undefined>(undefined)
  const [targetId, setTargetId] = useState('')

  const { rows: entries, error, hasMore, loadingMore, loadMore } = usePagedData(
    (offset) =>
      api.audit.list(
        {
          ...(targetType ? { targetType } : {}),
          ...(targetId.trim() ? { targetId: targetId.trim() } : {}),
        },
        PAGE_SIZE,
        offset,
      ),
    [targetType, targetId.trim()],
    PAGE_SIZE,
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-text)]">Audit log</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Written with the action it records. Nothing here can be edited or removed.
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {TARGET_TYPES.map((entry) => (
          <Button
            key={entry.label}
            variant={targetType === entry.value ? 'primary' : 'default'}
            onClick={() => setTargetType(entry.value)}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      {/* An id, pasted. The question this screen gets opened with is almost
          always about one specific thing. */}
      <Field
        label="Target id"
        value={targetId}
        onChange={setTargetId}
        placeholder="Paste an id to see only what was done to it"
      />

      <ErrorNote error={error} />

      <Panel>
        {entries === null ? (
          <EmptyNote>Loading…</EmptyNote>
        ) : entries.length === 0 ? (
          <EmptyNote>
            {targetType || targetId.trim()
              ? 'Nothing recorded against that.'
              : 'No admin actions recorded yet.'}
          </EmptyNote>
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
        <MoreRow
          shown={entries?.length ?? 0}
          hasMore={hasMore}
          loading={loadingMore}
          onLoadMore={loadMore}
        />
      </Panel>
    </div>
  )
}
