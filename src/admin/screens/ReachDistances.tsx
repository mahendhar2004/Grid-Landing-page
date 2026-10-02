import { useState } from 'react'

import { api } from '../api/endpoints'
import type { ReachDistancesKm } from '../api/types'
import type { ApiError } from '../lib/api'
import { Button, ErrorNote, Panel } from '../components/ui'

/**
 * How far each reach step reaches.
 *
 * These were fixed in the app; 500 km in particular was always a starting
 * figure rather than a measured one, so they are set here. A change applies to
 * posts that were bought before it as well as new ones — a post that bought
 * "across the city" reaches whatever the city step is now — and takes up to half
 * a minute to reach every request.
 */

const STEPS: ReadonlyArray<{ key: keyof ReachDistancesKm; label: string; hint: string }> = [
  { key: 'NEARBY', label: 'Nearby', hint: 'The nearest step.' },
  { key: 'CITY', label: 'Across the city', hint: 'Includes everything Nearby reaches.' },
  { key: 'REGION', label: 'The whole region', hint: 'Includes everything closer.' },
  { key: 'WIDE', label: 'Far and wide', hint: 'The farthest anything is shown. Also how far out the map zooms.' },
]

/** Mirrors the server's own limits (`reachDistanceProblem`); the server has the last word. */
const MIN_KM = 1
const MAX_KM = 20000

type Draft = Record<keyof ReachDistancesKm, string>

function draftFrom(distances: ReachDistancesKm): Draft {
  return { NEARBY: String(distances.NEARBY), CITY: String(distances.CITY), REGION: String(distances.REGION), WIDE: String(distances.WIDE) }
}

/** What is wrong with the figures typed so far, in the words of the step it is wrong at, or null. */
function problemWithDistances(draft: Draft): string | null {
  let previous: { label: string; km: number } | null = null
  for (const step of STEPS) {
    const text = draft[step.key].trim()
    if (!/^\d+$/.test(text)) return `${step.label} must be a whole number of km.`
    const km = Number(text)
    if (km < MIN_KM || km > MAX_KM) return `${step.label} must be from ${MIN_KM} to ${MAX_KM} km.`
    if (previous !== null && km <= previous.km) {
      return `${step.label} (${km} km) must reach farther than ${previous.label} (${previous.km} km), because each step includes the one before it.`
    }
    previous = { label: step.label, km }
  }
  return null
}

export function ReachDistancesPanel({ distances, onSaved }: { distances: ReachDistancesKm; onSaved: () => Promise<void> | void }) {
  const [draft, setDraft] = useState<Draft>(() => draftFrom(distances))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const problem = problemWithDistances(draft)
  const changed = STEPS.some((step) => draft[step.key].trim() !== String(distances[step.key]))

  async function save() {
    if (problem !== null) return
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await api.monetization.setReachDistances({
        NEARBY: Number(draft.NEARBY),
        CITY: Number(draft.CITY),
        REGION: Number(draft.REGION),
        WIDE: Number(draft.WIDE),
      })
      await onSaved()
      setSaved(true)
    } catch (caught) {
      setError(caught as ApiError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel className="p-5">
      <div data-testid="reach-distances">
        <h3 className="text-base font-bold text-[var(--color-text)]">How far each reach step reaches</h3>
        <p className="mb-4 mt-1 max-w-3xl text-sm text-[var(--color-text-muted)]">
          Each step shows a post to people of the same kind inside this distance, and includes the steps before it, so
          they have to keep widening. A change applies to posts already bought as well as new ones, and reaches every
          request within about 30 seconds. The prices of the steps are set below.
        </p>

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.key} className="space-y-1">
              <label className="block text-sm font-semibold text-[var(--color-text)]" htmlFor={`reach-km-${step.key}`}>
                {step.label}
              </label>
              <span className="flex items-center gap-1">
                <input
                  id={`reach-km-${step.key}`}
                  aria-label={`${step.label} distance in km`}
                  value={draft[step.key]}
                  inputMode="numeric"
                  onChange={(event) => {
                    setSaved(false)
                    setDraft({ ...draft, [step.key]: event.target.value })
                  }}
                  className="w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--bg-page)] px-2 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text-muted)]">km</span>
              </span>
              <span className="block text-xs text-[var(--color-text-muted)]">{step.hint}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="primary" disabled={!changed || problem !== null || saving} onClick={() => void save()}>
            {saving ? 'Saving…' : 'Save distances'}
          </Button>
          {problem !== null ? (
            <span className="text-xs text-[var(--c-danger)]">{problem}</span>
          ) : saved ? (
            <span className="text-xs text-[var(--c-ok)]">Saved.</span>
          ) : null}
        </div>
        <div className="mt-3">
          <ErrorNote error={error} />
        </div>
      </div>
    </Panel>
  )
}
