import { useState } from 'react'

import { api } from '../api/endpoints'
import { useAdminAction } from '../lib/useAdminAction'
import { useAsyncData } from '../lib/useAsyncData'
import { Badge, Button, ErrorNote, Field, LoadingRows, PageHeader, Panel, ReasonPrompt } from '../components/ui'
import { consequenceOf, problemWithVersions } from './versionRules'

/**
 * Which app builds are blocked, and which are told a newer one exists.
 *
 * Both used to be values in the backend's configuration, so forcing an update
 * meant a backend deploy - and a deploy is the wrong tool for what is really a
 * decision about people: it needs a reason, it needs to be undoable in a minute,
 * and it needs a record of who did it.
 *
 * The minimum is the strong one. Every build older than it is stopped at launch
 * until it updates; raised before the new build is live in the stores, it walls
 * people off an update they cannot yet get. The latest only shows a dismissible
 * bar. The page says which is which, and what a change will do, before it is
 * confirmed.
 */
export function AppVersion() {
  const { data, error: loadError, reload } = useAsyncData(() => api.appVersion.get(), [])
  const [min, setMin] = useState('')
  const [latest, setLatest] = useState('')
  const [confirming, setConfirming] = useState(false)
  const { run, busy, error: actionError } = useAdminAction(reload)

  // The inputs follow whatever the server last stored. Adjusted while rendering
  // rather than in an effect, so there is no frame showing a stale value.
  const [syncedFrom, setSyncedFrom] = useState<typeof data>(null)
  if (data !== null && data !== syncedFrom) {
    setSyncedFrom(data)
    setMin(data.minSupportedVersion)
    setLatest(data.latestVersion)
  }

  const error = actionError ?? loadError
  const problem = problemWithVersions(min, latest)
  const dirty = data !== null && (min.trim() !== data.minSupportedVersion || latest.trim() !== data.latestVersion)
  const consequence = data
    ? consequenceOf({ min: data.minSupportedVersion, latest: data.latestVersion }, { min, latest })
    : null

  async function save(reason: string) {
    const succeeded = await run(() =>
      api.appVersion.set({ minSupportedVersion: min.trim(), latestVersion: latest.trim(), reason }),
    )
    if (succeeded) setConfirming(false)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="App versions"
        subtitle="Block old builds or nudge them to update, without a deploy. Every change is recorded in the audit log with the reason given."
      />

      <ErrorNote error={error} />

      <Panel className="p-6">
        {data === null ? (
          <LoadingRows rows={2} />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Field label="Minimum supported version" value={min} onChange={setMin} placeholder="3.0.0" />
                <p className="text-xs text-[var(--c-muted)]">
                  Builds older than this are <strong>blocked</strong> at launch until they update.
                </p>
              </div>
              <div className="space-y-2">
                <Field label="Latest version" value={latest} onChange={setLatest} placeholder="3.0.0" />
                <p className="text-xs text-[var(--c-muted)]">
                  Builds older than this see a dismissible &ldquo;update available&rdquo; bar. Nobody is blocked.
                </p>
              </div>
            </div>

            {problem ? <p className="text-sm text-[var(--c-danger)]">{problem}</p> : null}
            {!problem && consequence ? (
              <p className="rounded-lg border border-[var(--c-attn)]/40 bg-[var(--c-attn-soft)] px-3 py-2 text-sm text-[var(--c-attn-ink)]">
                {consequence}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" disabled={!dirty || problem !== null || busy} onClick={() => setConfirming(true)}>
                Save…
              </Button>
              <span className="text-xs text-[var(--c-muted)]">
                {data.updatedAt ? `Last changed ${new Date(data.updatedAt).toLocaleString()}` : <Badge>Still the values the backend started with</Badge>}
              </span>
            </div>
          </div>
        )}
      </Panel>

      {confirming ? (
        <ReasonPrompt
          title="Change the app versions"
          confirmLabel="Save"
          variant="primary"
          busy={busy}
          onCancel={() => setConfirming(false)}
          onConfirm={(reason) => void save(reason)}
        >
          <p className="mb-3 text-sm text-[var(--c-muted)]">
            Minimum {min.trim()}, latest {latest.trim()}. People see this within a minute of saving.
          </p>
        </ReasonPrompt>
      ) : null}
    </div>
  )
}
