import { useEffect, useState } from 'react'

import { api } from '../api/endpoints'
import type { AdPlacement, AdSector, AdSettings as AdSettingsData } from '../api/types'
import { useAsyncData } from '../lib/useAsyncData'
import { useAdminAction } from '../lib/useAdminAction'
import { Badge, Button, EmptyNote, ErrorNote, Field, Panel, ReasonPrompt } from '../components/ui'

/**
 * Ad settings — the controls Grid holds regardless of who bought what
 * (`docs/grid-v2/ADVERTISING_PLATFORM_PLAN.md` §5).
 *
 * The point of this screen is that **none of it needs a deploy or an app
 * release**. Ad density was a constant in the mobile bundle until now, which
 * made the single biggest lever on whether the feed reads as a marketplace or
 * a billboard reachable only by shipping through two stores.
 *
 * The kill switch sits apart from the rest and asks for a reason. It is the
 * control somebody reaches for in a hurry, and it should never be something
 * this form flips as a side effect of saving a density change.
 */

const PLACEMENTS: ReadonlyArray<{ value: AdPlacement; label: string; hint: string }> = [
  { value: 'FEED', label: 'Feed', hint: 'The home feed.' },
  { value: 'SEARCH', label: 'Search', hint: 'Search results.' },
  { value: 'MAP', label: 'Map', hint: 'Nothing renders an ad on the map yet — enabling this counts nothing.' },
]

/**
 * Grouped so the screen says which of these are the policy and which are
 * ordinary businesses, rather than leaving seventeen checkboxes in a row.
 */
const SECTOR_GROUPS: ReadonlyArray<{ label: string; sectors: readonly AdSector[] }> = [
  {
    label: 'Usually blocked',
    sectors: ['LENDING', 'GAMBLING', 'CRYPTO', 'ALCOHOL', 'TOBACCO', 'ADULT'],
  },
  {
    label: 'Ordinary businesses',
    sectors: [
      'EDUCATION',
      'RETAIL',
      'FOOD_DRINK',
      'ELECTRONICS',
      'FASHION',
      'SERVICES',
      'EVENTS',
      'TRAVEL',
      'HEALTH_FITNESS',
      'JOBS_CAREERS',
      'OTHER',
    ],
  },
]

const MIN_INTERVAL = 3
const MAX_INTERVAL = 50

export function AdSettings() {
  const { data: settings, error: loadError, reload } = useAsyncData<AdSettingsData>(() => api.adSettings.get(), [])
  const { run, busy, error: actionError } = useAdminAction(reload)

  const [interval, setInterval] = useState('')
  const [placements, setPlacements] = useState<AdPlacement[]>([])
  const [blocked, setBlocked] = useState<AdSector[]>([])
  const [confirmingKill, setConfirmingKill] = useState(false)

  /*
    The form mirrors the server's answer whenever it changes, rather than
    seeding itself once. Without this, saving one field and reloading would
    leave the other inputs showing what they had before the round trip.
  */
  useEffect(() => {
    if (!settings) return
    setInterval(String(settings.feedInterleaveInterval))
    setPlacements(settings.enabledPlacements)
    setBlocked(settings.blockedSectors)
  }, [settings])

  if (loadError && !settings) {
    return <ErrorNote error={loadError} />
  }
  if (!settings) {
    return (
      <Panel>
        <EmptyNote>Loading…</EmptyNote>
      </Panel>
    )
  }

  const intervalValue = Number(interval)
  const intervalValid =
    Number.isInteger(intervalValue) && intervalValue >= MIN_INTERVAL && intervalValue <= MAX_INTERVAL

  function togglePlacement(placement: AdPlacement) {
    setPlacements((current) =>
      current.includes(placement) ? current.filter((entry) => entry !== placement) : [...current, placement],
    )
  }

  function toggleSector(sector: AdSector) {
    setBlocked((current) =>
      current.includes(sector) ? current.filter((entry) => entry !== sector) : [...current, sector],
    )
  }

  function save() {
    if (!intervalValid) return
    void run(() =>
      api.adSettings.update({
        feedInterleaveInterval: intervalValue,
        feedEnabled: placements.includes('FEED'),
        searchEnabled: placements.includes('SEARCH'),
        mapEnabled: placements.includes('MAP'),
        blockedSectors: blocked,
      }),
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-text)]">Ad settings</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          What Grid controls, whoever bought the ad. None of this needs a deploy or an app
          release — it takes effect on the next request.
        </p>
      </div>

      <ErrorNote error={actionError ?? loadError} />

      <Panel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--color-text)]">Ad serving</h2>
              {settings.adsEnabled ? <Badge tone="good">On</Badge> : <Badge tone="bad">Off</Badge>}
            </div>
            <p className="mt-1 max-w-xl text-sm text-[var(--color-text-muted)]">
              {settings.adsEnabled
                ? 'One switch that stops every ad everywhere, whatever else is configured. The thing to reach for when a creative turns out to be wrong.'
                : `Off since ${new Date(settings.disabledAt ?? '').toLocaleString('en-IN')} — ${settings.disabledReason}`}
            </p>
          </div>
          {settings.adsEnabled ? (
            <Button variant="danger" disabled={busy} onClick={() => setConfirmingKill(true)}>
              Stop all ads
            </Button>
          ) : (
            <Button variant="primary" disabled={busy} onClick={() => void run(() => api.adSettings.setEnabled(true, null))}>
              Turn ads back on
            </Button>
          )}
        </div>
      </Panel>

      <Panel className="space-y-4 p-4">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)]">Density</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Listings between ad slots. Lower means more ads. The floor is {MIN_INTERVAL}, because below
            that the feed starts alternating ads and listings.
          </p>
          <div className="mt-2 w-32">
            <Field label="Every N listings" value={interval} onChange={setInterval} placeholder="8" />
          </div>
          {!intervalValid && interval !== '' ? (
            <p className="mt-1 text-xs font-semibold text-[var(--color-text)]">
              Must be a whole number between {MIN_INTERVAL} and {MAX_INTERVAL}.
            </p>
          ) : null}
        </div>

        <div>
          <h2 className="text-base font-bold text-[var(--color-text)]">Placements</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Where ads may appear. Switching one off stops it without touching a single campaign.
          </p>
          <div className="mt-2 space-y-1">
            {PLACEMENTS.map((placement) => (
              <label key={placement.value} className="flex items-start gap-2 text-sm text-[var(--color-text)]">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={placements.includes(placement.value)}
                  onChange={() => togglePlacement(placement.value)}
                />
                <span>
                  {placement.label}
                  <span className="block text-xs text-[var(--color-text-muted)]">{placement.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-[var(--color-text)]">Blocked sectors</h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--color-text-muted)]">
            Lines of business Grid will not run from anybody. A ticked sector cannot be onboarded as
            an advertiser, and any existing one in it stops serving immediately — a policy in the
            schema rather than one that depends on whoever is reviewing creatives that week.
          </p>
          <div className="mt-2 space-y-3">
            {SECTOR_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  {group.label}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {group.sectors.map((sector) => (
                    <label key={sector} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                      <input type="checkbox" checked={blocked.includes(sector)} onChange={() => toggleSector(sector)} />
                      {sector.replace(/_/g, ' ').toLowerCase()}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-[var(--color-border)] pt-3">
          <p className="flex-1 text-xs text-[var(--color-text-muted)]">
            Last changed {new Date(settings.updatedAt).toLocaleString('en-IN')}. Every change is
            recorded in the audit log with what it was before.
          </p>
          <Button variant="primary" disabled={busy || !intervalValid} onClick={save}>
            {busy ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </Panel>

      {confirmingKill ? (
        <ReasonPrompt
          title="Stop all ads?"
          confirmLabel="Stop all ads"
          variant="danger"
          busy={busy}
          onCancel={() => setConfirmingKill(false)}
          onConfirm={(reason) => {
            void run(() => api.adSettings.setEnabled(false, reason)).then(() => setConfirmingKill(false))
          }}
        >
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">
            Every ad stops serving everywhere, on the next request. Nothing is paused, cancelled or
            deleted — campaigns stay exactly as they are and resume when this goes back on. The
            reason is what tells the next person whether it is safe to undo.
          </p>
        </ReasonPrompt>
      ) : null}
    </div>
  )
}
