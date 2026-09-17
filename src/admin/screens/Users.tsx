import { useState } from 'react'

import { api } from '../api/endpoints'
import type { AdminUser } from '../api/types'
import { usePagedData } from '../lib/usePagedData'
import { useAdminAction } from '../lib/useAdminAction'
import { Badge, Button, EmptyNote, ErrorNote, Field, MoreRow, Panel, ReasonPrompt } from '../components/ui'

/**
 * Who someone is, and what their standing is.
 *
 * The console had no equivalent of this screen at all, and the consequences
 * were not cosmetic:
 *
 * - **A person could only be acted on if somebody had already reported
 *   them.** Every route into a user ran through the report queue, so anyone
 *   running a scam that nobody had reported yet was invisible.
 * - **Nothing showed who was banned**, or until when.
 * - **A ban could not be lifted.** `POST /v1/admin/users/:id/unban` existed
 *   from the start with no caller, so "Ban indefinitely" was one button press
 *   with no way back from any screen; undoing it meant a database write by
 *   hand.
 *
 * Search matches email or display name, because support arrives as both — an
 * address pasted from an email, or a name from a report.
 */

type Pending =
  | { kind: 'BAN'; user: AdminUser; durationDays: number | null }
  | { kind: 'UNBAN'; user: AdminUser }

const PAGE_SIZE = 50

/** Three states, not a checkbox: "everyone" is a different question from "not banned". */
const STANDING: ReadonlyArray<{ value: boolean | null; label: string }> = [
  { value: null, label: 'Everyone' },
  { value: true, label: 'Banned' },
  { value: false, label: 'Active' },
]

/**
 * What a ban means for this row, said in words.
 *
 * `bannedUntil` is null for *two* opposite reasons — never banned, and banned
 * with no end date — so it is only ever read together with `isBanned`. A row
 * that showed "until —" for both would be telling you a permanent ban expires
 * today.
 */
function standingOf(user: AdminUser): { label: string; tone: 'neutral' | 'warn' | 'bad' | 'good' } {
  if (!user.isBanned) {
    return { label: 'Active', tone: 'good' }
  }
  if (user.bannedUntil === null) {
    return { label: 'Banned — permanent', tone: 'bad' }
  }
  return { label: `Banned until ${new Date(user.bannedUntil).toLocaleDateString()}`, tone: 'warn' }
}

export function Users() {
  const [search, setSearch] = useState('')
  const [banned, setBanned] = useState<boolean | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)

  const { rows: users, error: loadError, hasMore, loadingMore, loadMore, reload } = usePagedData(
    (offset) => api.users.list(search.trim() || undefined, banned, PAGE_SIZE, offset),
    [search.trim(), banned],
    PAGE_SIZE,
  )
  const { run, busy, error: actionError } = useAdminAction(reload)
  const error = actionError ?? loadError

  async function confirm(reason: string) {
    if (!pending) return
    const succeeded = await run(() =>
      pending.kind === 'UNBAN'
        ? api.users.unban(pending.user.id, reason)
        : // `null` is permanent, not omitted - the endpoint's own union keeps
          // the two from being confused at this call site.
          api.users.ban(pending.user.id, { durationDays: pending.durationDays, reason }),
    )
    if (succeeded) setPending(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-text)]">Users</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Every ban and every lift is recorded in the audit log with the reason given.
        </p>
      </div>

      <Field
        label="Search"
        value={search}
        onChange={setSearch}
        placeholder="Email or name — paste an address straight from a support email"
      />

      <div className="flex flex-wrap gap-1">
        {STANDING.map((entry) => (
          <Button
            key={entry.label}
            variant={banned === entry.value ? 'primary' : 'default'}
            onClick={() => setBanned(entry.value)}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      <ErrorNote error={error} />

      <Panel>
        {users === null ? (
          <EmptyNote>Loading…</EmptyNote>
        ) : users.length === 0 ? (
          <EmptyNote>
            {search.trim() ? 'Nobody matches that.' : 'No users yet.'}
          </EmptyNote>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {users.map((user) => {
              const standing = standingOf(user)
              return (
                <li key={user.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={standing.tone}>{standing.label}</Badge>
                    {user.isAdmin ? <Badge tone="warn">Admin</Badge> : null}
                    {/* The number that decides whether to act. One report is
                        noise; several people is a pattern. */}
                    {user.reportCount > 0 ? (
                      <Badge tone={user.reportCount > 2 ? 'bad' : 'warn'}>
                        {user.reportCount} reported
                      </Badge>
                    ) : null}
                    <span className="ml-auto text-xs text-[var(--color-text-muted)]">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                    {user.displayName ?? '(no profile yet)'}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    <span className="font-mono">{user.email}</span> · {user.role.toLowerCase()} ·{' '}
                    {user.orgDomain} · {user.listingCount} listing(s)
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {user.isBanned ? (
                      <Button onClick={() => setPending({ kind: 'UNBAN', user })}>Lift ban</Button>
                    ) : (
                      <>
                        <Button
                          variant="danger"
                          onClick={() => setPending({ kind: 'BAN', user, durationDays: 7 })}
                        >
                          Ban 7d
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => setPending({ kind: 'BAN', user, durationDays: null })}
                        >
                          Ban indefinitely
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <MoreRow shown={users?.length ?? 0} hasMore={hasMore} loading={loadingMore} onLoadMore={loadMore} />
      </Panel>

      {pending ? (
        <ReasonPrompt
          title={
            pending.kind === 'UNBAN'
              ? `Lift the ban on ${pending.user.email}`
              : pending.durationDays === null
                ? `Ban ${pending.user.email} indefinitely`
                : `Ban ${pending.user.email} for ${pending.durationDays} days`
          }
          confirmLabel="Confirm"
          variant={pending.kind === 'UNBAN' ? 'default' : 'danger'}
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={confirm}
        >
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">
            {pending.kind === 'UNBAN'
              ? 'They can sign in and use Grid again immediately. The ban stays in the history.'
              : 'They are signed out everywhere and notified. This is reversible from this screen.'}
          </p>
        </ReasonPrompt>
      ) : null}
    </div>
  )
}
