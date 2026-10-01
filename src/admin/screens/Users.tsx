import { useState } from 'react'

import { api } from '../api/endpoints'
import type { AdminUser } from '../api/types'
import { daysError } from './grantDays'
import { useAdminAction } from '../lib/useAdminAction'
import { fetchAllByOffset } from '../lib/fetchAll'
import { useAsyncData } from '../lib/useAsyncData'
import { useFilters } from '../lib/useFilters'
import { usePagedData } from '../lib/usePagedData'
import { Dropdown, FilterChips, SearchBox, Toolbar } from '../components/filters'
import type { Option } from '../components/filters'
import { Avatar, Badge, Button, EmptyNote, ErrorNote, Field, LoadingRows, MoreRow, PageHeader, Panel, ReasonPrompt, Segmented } from '../components/ui'

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
 * Filters (organisation, standing, reports) and the sort are applied by the
 * server and kept in the address, so `#users?org=<id>` is "everyone at that
 * organisation" and can be bookmarked or sent to someone. Search matches email
 * or display name, because support arrives as both - an address pasted from an
 * email, or a name from a report.
 */

type Pending =
  | { kind: 'BAN'; user: AdminUser; durationDays: number | null }
  | { kind: 'UNBAN'; user: AdminUser }
  | { kind: 'GRANT'; user: AdminUser }
  | { kind: 'END_GRANT'; user: AdminUser }

const PAGE_SIZE = 50

const DEFAULTS = { q: '', org: 'all', status: 'all', reported: 'all', sort: 'newest' }

const STATUS: ReadonlyArray<Option> = [
  { value: 'all', label: 'Any' },
  { value: 'active', label: 'Active' },
  { value: 'banned', label: 'Banned' },
]

const REPORTED: ReadonlyArray<Option> = [
  { value: 'all', label: 'Any' },
  { value: 'yes', label: 'Has reports' },
  { value: 'no', label: 'None' },
]

const SORTS: ReadonlyArray<Option> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'reports', label: 'Most reports' },
  { value: 'listings', label: 'Most listings' },
  { value: 'name', label: 'Name A to Z' },
]

/**
 * What a ban means for this row, said in words.
 *
 * `bannedUntil` is null for *two* opposite reasons - never banned, and banned
 * with no end date - so it is only ever read together with `isBanned`. A row
 * that showed "until -" for both would be telling you a permanent ban expires
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
  const filters = useFilters('users', DEFAULTS)
  const { q, org, status, reported, sort } = filters.values
  const search = q.trim()
  const [pending, setPending] = useState<Pending | null>(null)
  // The plan and the length of a grant being filled in. Held here, not in the
  // prompt, because the prompt only hands back the reason.
  const [grantPlanKey, setGrantPlanKey] = useState<string | null>(null)
  const [grantDays, setGrantDays] = useState('30')
  // Every plan that could be given: not the free one, and not a retired one.
  const monetization = useAsyncData(() => api.monetization.get(), [])
  const grantablePlans = (monetization.data?.plans ?? [])
    .filter((plan) => !plan.isDefault && plan.status !== 'RETIRED')
    .sort((a, b) => a.sortOrder - b.sortOrder)

  // Every organisation to choose from (pages of 100, the route's maximum), so the
  // dropdown's own search box finds any of them.
  const orgs = useAsyncData(() => fetchAllByOffset((offset) => api.organizations.list(undefined, 100, offset), 100), [])
  const orgOptions: ReadonlyArray<Option> = [
    { value: 'all', label: 'All organisations' },
    ...(orgs.data ?? []).map((o) => ({ value: o.id, label: o.name })),
  ]

  const banned = status === 'all' ? null : status === 'banned'
  const { rows: users, error: loadError, hasMore, loadingMore, loadMore, reload } = usePagedData(
    (offset) =>
      api.users.list(
        {
          search: search || undefined,
          banned,
          organizationId: org === 'all' ? undefined : org,
          reported: reported === 'all' ? undefined : reported === 'yes',
          sort: sort as 'newest' | 'oldest' | 'reports' | 'listings' | 'name',
        },
        PAGE_SIZE,
        offset,
      ),
    [search, banned, org, reported, sort],
    PAGE_SIZE,
  )
  const { run, busy, error: actionError } = useAdminAction(reload)
  const error = actionError ?? loadError

  async function confirm(reason: string) {
    if (!pending) return
    // The days problem is already on screen under the field; nothing is sent until it is fixed.
    if (pending.kind === 'GRANT' && (daysError(grantDays) !== null || grantPlanKey === null)) return
    const succeeded = await run(() => {
      if (pending.kind === 'UNBAN') return api.users.unban(pending.user.id, reason)
      if (pending.kind === 'END_GRANT') return api.users.revokePlan(pending.user.id, reason)
      if (pending.kind === 'GRANT') {
        return api.users.grantPlan(pending.user.id, { planKey: grantPlanKey ?? '', days: Number(grantDays), reason })
      }
      // `null` is permanent, not omitted - the endpoint's own union keeps
      // the two from being confused at this call site.
      return api.users.ban(pending.user.id, { durationDays: pending.durationDays, reason })
    })
    if (succeeded) setPending(null)
  }

  const orgName = orgOptions.find((o) => o.value === org)?.label
  const chips = filters.active.map((key) => {
    const label: Record<string, string> = {
      q: `“${q}”`,
      org: `Organisation ${orgName ?? ''}`,
      status: `Status ${STATUS.find((o) => o.value === status)?.label ?? ''}`,
      reported: `Reports ${REPORTED.find((o) => o.value === reported)?.label ?? ''}`,
    }
    return { key, label: label[key] ?? key }
  })
  // The sort is a preference, not a filter: it never appears as a chip.
  const filterChips = chips.filter((chip) => chip.key !== 'sort')

  return (
    <div className="space-y-5">
      <PageHeader
        title="Members"
        subtitle={
          org !== 'all' && orgName
            ? `Everyone at ${orgName}. Every ban and every lift is recorded in the audit log with the reason given.`
            : 'Every ban and every lift is recorded in the audit log with the reason given.'
        }
      />

      <Toolbar
        count={users === null ? undefined : `${users.length}${hasMore ? '+' : ''} shown`}
        sort={<Dropdown label="Sort" value={sort} options={SORTS} onChange={(v) => filters.set('sort', v)} alignRight />}
      >
        <SearchBox value={q} onChange={(v) => filters.set('q', v)} placeholder="Search name or email" />
        <Dropdown label="Organisation" value={org} options={orgOptions} allValue="all" searchable onChange={(v) => filters.set('org', v)} />
        <Dropdown label="Status" value={status} options={STATUS} allValue="all" onChange={(v) => filters.set('status', v)} />
        <Dropdown label="Reports" value={reported} options={REPORTED} allValue="all" onChange={(v) => filters.set('reported', v)} />
      </Toolbar>

      <FilterChips
        chips={filterChips}
        onRemove={(key) => filters.clear(key as keyof typeof DEFAULTS)}
        onClearAll={() => filters.clear('*')}
      />

      <ErrorNote error={error} />

      <Panel>
        {users === null ? (
          <LoadingRows />
        ) : users.length === 0 ? (
          <EmptyNote>{filterChips.length > 0 ? 'Nobody matches these filters. Remove one to see more.' : 'No members yet.'}</EmptyNote>
        ) : (
          <ul className="motion-stagger grid gap-0.5 p-2">
            {users.map((user) => {
              const standing = standingOf(user)
              return (
                <li key={user.id} className="rounded-[var(--r-inner)] px-4 py-4 transition hover:bg-[var(--c-hover)]">
                  <div className="flex items-start gap-3.5">
                    <Avatar name={user.displayName ?? user.email} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--c-text)]">{user.displayName ?? '(no profile yet)'}</p>
                        <Badge tone={standing.tone}>{standing.label}</Badge>
                        {user.isAdmin ? <Badge tone="warn">Admin</Badge> : null}
                        {/* Which plan they are on, and whether it was bought or given. */}
                        {user.plan ? (
                          <Badge tone={user.plan.isGrant ? 'warn' : 'brand'}>
                            {user.plan.name}
                            {user.plan.isGrant && user.plan.expiresAt
                              ? ` · given until ${new Date(user.plan.expiresAt).toLocaleDateString()}`
                              : ''}
                          </Badge>
                        ) : null}
                        {/* The number that decides whether to act. One report is
                            noise; several people is a pattern. */}
                        {user.reportCount > 0 ? (
                          <Badge tone={user.reportCount > 2 ? 'bad' : 'warn'}>{user.reportCount} reported</Badge>
                        ) : null}
                        <span className="ml-auto text-xs text-[var(--c-muted)]">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--c-muted)]">
                        <span className="font-mono">{user.email}</span> ·{' '}
                        <button
                          type="button"
                          onClick={() => filters.set('org', user.organizationId)}
                          className="rounded-full font-medium text-[var(--c-brand)] hover:underline"
                        >
                          {user.organizationName}
                        </button>{' '}
                        · {user.role.toLowerCase()} · {user.listingCount} listing(s)
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {user.plan?.isGrant ? (
                          <Button size="sm" onClick={() => setPending({ kind: 'END_GRANT', user })}>
                            End given plan
                          </Button>
                        ) : user.plan ? null : (
                          <Button
                            size="sm"
                            disabled={grantablePlans.length === 0}
                            onClick={() => {
                              setGrantPlanKey(grantablePlans[0]?.key ?? null)
                              setGrantDays('30')
                              setPending({ kind: 'GRANT', user })
                            }}
                          >
                            Give a plan
                          </Button>
                        )}
                        {user.isBanned ? (
                          <Button size="sm" onClick={() => setPending({ kind: 'UNBAN', user })}>
                            Lift ban
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="danger" onClick={() => setPending({ kind: 'BAN', user, durationDays: 7 })}>
                              Ban 7d
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => setPending({ kind: 'BAN', user, durationDays: null })}>
                              Ban indefinitely
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
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
              : pending.kind === 'GRANT'
                ? `Give ${pending.user.email} a plan`
                : pending.kind === 'END_GRANT'
                  ? `End the plan given to ${pending.user.email}`
                  : pending.durationDays === null
                    ? `Ban ${pending.user.email} indefinitely`
                    : `Ban ${pending.user.email} for ${pending.durationDays} days`
          }
          confirmLabel="Confirm"
          variant={pending.kind === 'BAN' ? 'danger' : 'default'}
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={confirm}
        >
          {pending.kind === 'GRANT' ? (
            <div className="mb-3 space-y-3">
              <p className="text-sm text-[var(--c-muted)]">
                They get the plan&apos;s benefits without a store purchase, and it ends by itself on the date below. It
                is for support and testing, and is not counted as revenue.
              </p>
              <Segmented
                label="Plan"
                items={grantablePlans.map((plan) => ({ value: plan.key, label: plan.name }))}
                value={grantPlanKey ?? ''}
                onChange={setGrantPlanKey}
              />
              <Field label="For how many days" value={grantDays} onChange={setGrantDays} hint="1 to 365. Every grant ends." />
              {daysError(grantDays) ? <p className="text-xs text-[var(--c-danger)]">{daysError(grantDays)}</p> : null}
            </div>
          ) : (
            <p className="mb-3 text-sm text-[var(--c-muted)]">
              {pending.kind === 'UNBAN'
                ? 'They can sign in and use Grid again immediately. The ban stays in the history.'
                : pending.kind === 'END_GRANT'
                  ? 'They go back to the free plan now. A plan they bought in a store is not touched by this.'
                  : 'They are locked out completely and notified, and their listings are hidden. This is reversible from this screen.'}
            </p>
          )}
        </ReasonPrompt>
      ) : null}
    </div>
  )
}
