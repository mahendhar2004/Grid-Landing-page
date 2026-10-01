import { useState } from 'react'

import { api } from '../api/endpoints'
import type { CreditGrantConfigEntry } from '../api/types'
import { useAdminAction } from '../lib/useAdminAction'
import { useAsyncData } from '../lib/useAsyncData'
import { Button, ErrorNote, Field, LoadingRows, PageHeader, Panel, ReasonPrompt } from '../components/ui'
import { REWARD_SOURCES, problemWithReward, rupeesFromPaise } from './rewardRules'

/**
 * What Grid gives away: the welcome credit, the referral reward and the streak.
 *
 * These are real money out of Grid's pocket, handed to everyone who qualifies.
 * The endpoints existed and had no screen, so changing a number meant a raw
 * request - and nothing recorded who changed it. Each change here needs a
 * reason and is written to the audit log.
 */
export function CreditRewards() {
  const { data, error: loadError, reload } = useAsyncData(() => api.creditRewards.list(), [])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [pending, setPending] = useState<CreditGrantConfigEntry['source'] | null>(null)
  const { run, busy, error: actionError } = useAdminAction(reload)

  const stored = (source: string): string => rupeesFromPaise(data?.find((row) => row.source === source)?.amountPaise ?? 0)

  // The inputs follow what the server last stored, adjusted while rendering so
  // there is no frame showing a stale amount.
  const [syncedFrom, setSyncedFrom] = useState<typeof data>(null)
  if (data !== null && data !== syncedFrom) {
    setSyncedFrom(data)
    const next: Record<string, string> = {}
    for (const { source } of REWARD_SOURCES) {
      next[source] = rupeesFromPaise(data.find((row) => row.source === source)?.amountPaise ?? 0)
    }
    setDrafts(next)
  }

  async function save(reason: string) {
    if (!pending) return
    const succeeded = await run(() =>
      api.creditRewards.set({ source: pending, amountPaise: Math.round(Number(drafts[pending]) * 100), reason }),
    )
    if (succeeded) setPending(null)
  }

  const pendingLabel = REWARD_SOURCES.find((entry) => entry.source === pending)?.label

  return (
    <div className="space-y-5">
      <PageHeader
        title="Credit rewards"
        subtitle="What Grid gives away. Each amount goes to everyone who qualifies, so every change needs a reason and is recorded in the audit log."
      />

      <ErrorNote error={actionError ?? loadError} />

      <Panel>
        {data === null ? (
          <LoadingRows rows={3} />
        ) : (
          <ul className="divide-y divide-[var(--c-line)]">
            {REWARD_SOURCES.map(({ source, label, explain }) => {
              const draft = drafts[source] ?? ''
              const problem = problemWithReward(draft)
              const dirty = draft.trim() !== stored(source)
              return (
                <li key={source} className="flex flex-wrap items-end gap-4 px-6 py-5" data-testid={`reward-${source}`}>
                  <div className="mr-auto min-w-0">
                    <p className="text-sm font-semibold text-[var(--c-text)]">{label}</p>
                    <p className="text-xs text-[var(--c-muted)]">{explain}</p>
                  </div>
                  <div className="w-40">
                    <Field
                      label="Amount (₹)"
                      value={draft}
                      onChange={(value) => setDrafts({ ...drafts, [source]: value })}
                    />
                  </div>
                  <Button variant="primary" disabled={!dirty || problem !== null || busy} onClick={() => setPending(source)}>
                    Save…
                  </Button>
                  {dirty && problem ? <p className="w-full text-xs text-[var(--c-danger)]">{problem}</p> : null}
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      {pending ? (
        <ReasonPrompt
          title={`Change the ${pendingLabel?.toLowerCase() ?? 'reward'}`}
          confirmLabel="Save"
          variant="primary"
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={(reason) => void save(reason)}
        >
          <p className="mb-3 text-sm text-[var(--c-muted)]">
            From ₹{stored(pending)} to ₹{drafts[pending]}. It applies to everyone who qualifies from now on.
          </p>
        </ReasonPrompt>
      ) : null}
    </div>
  )
}
