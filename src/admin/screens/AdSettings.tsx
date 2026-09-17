import { useState } from 'react'

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
/** 30 days. Past that a grace period stops being one and becomes a decision not to monetise a cohort. */
const MAX_GRACE_HOURS = 720

/** The three numeric fields, so an edit can be held per field without three pieces of state that can disagree. */
type EditableField = 'interval' | 'minListings' | 'graceHours'

export function AdSettings() {
  const { data: settings, error: loadError, reload } = useAsyncData<AdSettingsData>(() => api.adSettings.get(), [])
  const { run, busy, error: actionError } = useAdminAction(reload)

  /*
    Edits are held as "unset until touched" rather than mirrored from the
    server in an effect.

    The effect version overwrote whatever the admin was typing every time
    `settings` changed - which includes the reload after a save, so a second
    edit made while the first was in flight was silently discarded. Deriving
    the displayed value instead means the form follows the server until
    somebody touches a field, and follows them afterwards.
  */
  const [edits, setEdits] = useState<Partial<Record<EditableField, string>>>({})
  const [placementEdits, setPlacementEdits] = useState<AdPlacement[] | null>(null)
  const [blockedEdits, setBlockedEdits] = useState<AdSector[] | null>(null)
  const [confirmingKill, setConfirmingKill] = useState(false)
  const [newOverride, setNewOverride] = useState({ hubId: '', adsEnabled: false, reason: '' })

  /*
    The campus list comes from the Organizations endpoint the console already
    calls - it carries the hub id, its name and its live listing count, which
    is usually the thing this decision actually turns on.
  */
  const { data: organizations } = useAsyncData(() => api.organizations.list(undefined, 200, 0), [])

  const decided = new Set((settings?.hubOverrides ?? []).map((override) => override.hubId))

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

  const interval = edits.interval ?? String(settings.feedInterleaveInterval)
  const minListings = edits.minListings ?? String(settings.minHubListingsForAds)
  const graceHours = edits.graceHours ?? String(settings.newUserGraceHours)
  const placements = placementEdits ?? settings.enabledPlacements
  const blocked = blockedEdits ?? settings.blockedSectors

  const intervalValue = Number(interval)
  const intervalValid =
    Number.isInteger(intervalValue) && intervalValue >= MIN_INTERVAL && intervalValue <= MAX_INTERVAL
  const minListingsValue = Number(minListings)
  const minListingsValid = Number.isInteger(minListingsValue) && minListingsValue >= 0 && minListingsValue <= 1000
  const graceValue = Number(graceHours)
  const graceValid = Number.isInteger(graceValue) && graceValue >= 0 && graceValue <= MAX_GRACE_HOURS
  const canSave = intervalValid && minListingsValid && graceValid

  function togglePlacement(placement: AdPlacement) {
    setPlacementEdits(
      placements.includes(placement) ? placements.filter((entry) => entry !== placement) : [...placements, placement],
    )
  }

  function toggleSector(sector: AdSector) {
    setBlockedEdits(blocked.includes(sector) ? blocked.filter((entry) => entry !== sector) : [...blocked, sector])
  }

  function edit(field: EditableField): (value: string) => void {
    return (value) => setEdits((current) => ({ ...current, [field]: value }))
  }

  function save() {
    if (!canSave) return
    void run(() =>
      api.adSettings.update({
        feedInterleaveInterval: intervalValue,
        minHubListingsForAds: minListingsValue,
        newUserGraceHours: graceValue,
        feedEnabled: placements.includes('FEED'),
        searchEnabled: placements.includes('SEARCH'),
        mapEnabled: placements.includes('MAP'),
        blockedSectors: blocked,
      }),
    ).then((saved) => {
      // Back to following the server, so the reloaded values are what is
      // shown rather than a stale copy of what was typed.
      if (saved) {
        setEdits({})
        setPlacementEdits(null)
        setBlockedEdits(null)
      }
    })
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
            <Field label="Every N listings" value={interval} onChange={edit('interval')} placeholder="8" />
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
          <h2 className="text-base font-bold text-[var(--color-text)]">When not to show ads at all</h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--color-text-muted)]">
            Two cases where an ad costs more than it earns. Both are off at zero, which is how they
            ship — turning one on is a judgement about a number nobody has measured yet.
          </p>
          <div className="mt-2 flex flex-wrap gap-4">
            <div className="w-40">
              <Field label="Minimum live listings in a hub" value={minListings} onChange={edit('minListings')} placeholder="0" />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                An ad in a feed of six listings takes a slot from the thing people came for.
              </p>
            </div>
            <div className="w-40">
              <Field label="New-account grace (hours)" value={graceHours} onChange={edit('graceHours')} placeholder="0" />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Nothing shown to somebody still deciding whether the app is worth keeping.
              </p>
            </div>
          </div>
          {!minListingsValid || !graceValid ? (
            <p className="mt-1 text-xs font-semibold text-[var(--color-text)]">
              Both must be whole numbers; the grace period caps at {MAX_GRACE_HOURS} hours.
            </p>
          ) : null}
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
          <Button variant="primary" disabled={busy || !canSave} onClick={save}>
            {busy ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </Panel>

      <Panel className="space-y-3 p-4">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)]">Campuses with their own answer</h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--color-text-muted)]">
            A Hub listed here ignores the global setting. Both directions are real and they are not
            the same thing: a pilot runs ads at one campus while they are off everywhere, and a
            campus that asked not to have them keeps not having them while they are on everywhere.
            Every other Hub follows the settings above.
          </p>
        </div>

        {settings.hubOverrides.length === 0 ? (
          <EmptyNote>No campus has a decision of its own. Every Hub follows the settings above.</EmptyNote>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {settings.hubOverrides.map((override) => (
              <li key={override.hubId} className="flex flex-wrap items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {override.adsEnabled ? <Badge tone="good">Ads on</Badge> : <Badge tone="bad">Ads off</Badge>}
                    <p className="truncate text-sm font-medium text-[var(--color-text)]">
                      {override.organizationName} — {override.hubName}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">{override.reason}</p>
                </div>
                <Button disabled={busy} onClick={() => void run(() => api.adSettings.clearHubOverride(override.hubId))}>
                  Follow global
                </Button>
              </li>
            ))}
          </ul>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (!newOverride.hubId || newOverride.reason.trim() === '') return
            void run(() =>
              api.adSettings.setHubOverride(newOverride.hubId, newOverride.adsEnabled, newOverride.reason.trim()),
            ).then((saved) => {
              if (saved) setNewOverride({ hubId: '', adsEnabled: false, reason: '' })
            })
          }}
          className="space-y-2 border-t border-[var(--color-border)] pt-3"
        >
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Campus</span>
            <select
              // Explicit, because the wrapping label also contains the hint
              // below: without this the control's accessible name is the
              // heading and the hint run together, which is what a screen
              // reader would announce.
              aria-label="Campus"
              value={newOverride.hubId}
              onChange={(e) => setNewOverride({ ...newOverride, hubId: e.target.value })}
              className="w-full rounded border border-[var(--color-border)] bg-transparent p-2 text-sm text-[var(--color-text)]"
            >
              <option value="">Choose a campus…</option>
              {(organizations ?? [])
                .filter((organization) => !decided.has(organization.hubId))
                .map((organization) => (
                  <option key={organization.hubId} value={organization.hubId}>
                    {organization.name} — {organization.hubName} ({organization.listingCount} listings)
                  </option>
                ))}
            </select>
            <span className="block text-xs text-[var(--color-text-muted)]">
              The listing count is there because it is usually the thing the decision turns on.
              Campuses already decided are left out.
            </span>
          </label>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex items-center gap-2 pb-2 text-sm text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={newOverride.adsEnabled}
                onChange={(e) => setNewOverride({ ...newOverride, adsEnabled: e.target.checked })}
              />
              Run ads here
            </label>
            <div className="min-w-[16rem] flex-1">
              <Field
                label="Why this campus"
                value={newOverride.reason}
                onChange={(value) => setNewOverride({ ...newOverride, reason: value })}
                placeholder="The campus asked us not to / pilot for the Diwali fortnight"
              />
            </div>
            <Button
              variant="primary"
              type="submit"
              onClick={() => undefined}
              disabled={busy || newOverride.hubId === '' || newOverride.reason.trim() === ''}
            >
              {busy ? 'Saving…' : 'Set'}
            </Button>
          </div>
        </form>
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
