import { useState } from 'react'

import { api } from '../api/endpoints'
import type { AdminOrganization, AdminPlace } from '../api/types'
import type { ApiError } from '../lib/api'
import { formatCoordinate, hasUsableCoordinates, parseLatLngPair } from '../lib/coordinates'
import { usePagedData } from '../lib/usePagedData'
import { Badge, Button, EmptyNote, ErrorNote, Field, MoreRow, Panel, ReasonPrompt } from '../components/ui'
import type { OrganizationDomain } from '../api/types'
import { useAsyncData } from '../lib/useAsyncData'

/**
 * Adding a college or company by hand.
 *
 * The only path that creates an organization without proving control of its
 * email domain - self-serve registration verifies MX records first. That makes
 * this the most privileged screen in the console, which is why the form asks
 * for a reason and why every submission is audited.
 *
 * What it does *not* bypass is the MX check. Ownership and deliverability are
 * different questions: an admin can vouch that a college is real, but nobody
 * can join an organization whose domain cannot receive the sign-in OTP. A
 * mistyped domain is the error this catches.
 *
 * `domain` is create-only and cannot be edited afterwards. `users.org_domain`
 * is a foreign key on that exact string, so changing it would disconnect every
 * member of the organization - the API does not accept it and this form does
 * not offer it.
 */

interface EditForm {
  name: string
  type: 'ACADEMIC' | 'CORPORATE'
  reason: string
}

interface PlaceEditForm {
  name: string
  latitude: string
  longitude: string
  reason: string
}

const PAGE_SIZE = 50

const EMPTY_FORM = {
  domain: '',
  name: '',
  type: 'ACADEMIC' as 'ACADEMIC' | 'CORPORATE',
  latitude: '',
  longitude: '',
  reason: '',
}

export function Organizations() {
  const [search, setSearch] = useState('')
  /**
   * What the server said it saved, shown after a save.
   *
   * A PATCH that changes nothing is a perfectly valid request: it returns
   * 200 and writes an audit row whose before and after are identical. So a
   * console that only reports failures cannot distinguish "saved" from
   * "sent an empty change" - which is exactly how a pin edit appeared to
   * work and silently did not. Echoing what the server came back with makes
   * that visible in the one place it matters.
   */
  const [savedNote, setSavedNote] = useState<string | null>(null)
  /** Which organisation is open for editing, and the values being edited. */
  const [editingId, setEditingId] = useState<string | null>(null)
  /**
   * Which organisation's domains are open.
   *
   * Collapsed by default and one at a time: an organisation holds one domain in
   * the ordinary case, and a list that is almost always one row is noise on
   * every other row of the table.
   */
  const [domainsForId, setDomainsForId] = useState<string | null>(null)
  /**
   * Which organisation's places are open.
   *
   * Collapsed and one at a time, like the domains beside it. Most
   * organisations occupy one place; a list that is almost always one row is
   * noise on every other row of the table.
   */
  const [placesForId, setPlacesForId] = useState<string | null>(null)
  const [edit, setEdit] = useState<EditForm | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [activateImmediately, setActivateImmediately] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<ApiError | null>(null)

  const { rows: organizations, error: loadError, hasMore, loadingMore, loadMore, reload } = usePagedData(
    (offset) => api.organizations.list(search || undefined, PAGE_SIZE, offset),
    [search],
    PAGE_SIZE,
  )
  const error = actionError ?? loadError

  async function create(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setActionError(null)
    try {
      await api.organizations.create({
        domain: form.domain.trim().toLowerCase(),
        name: form.name.trim(),
        type: form.type,
        // Numbers, not strings - the API takes real coordinates and a
        // string would fail validation with a message about types rather
        // than about the value.
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        activateImmediately,
        reason: form.reason.trim(),
      })
      setForm(EMPTY_FORM)
      setActivateImmediately(false)
      setShowForm(false)
      await reload()
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  function beginEdit(organization: AdminOrganization) {
    setActionError(null)
    setEditingId(organization.id)
    setEdit({
      name: organization.name,
      type: organization.type,
      reason: '',
    })
  }

  async function saveEdit(organization: AdminOrganization) {
    if (!edit) return
    setActionError(null)
    setSavedNote(null)
    setBusy(true)
    try {
      /*
        Name and type only. The pin and the map visibility belong to a place
        (BR-069) and are edited under Places, on the one they actually move.

        Note what this does NOT do: compare against the current values. It used
        to, and only sent a field it believed had changed - which produced
        "provide at least one thing to change" for somebody who had visibly
        typed one, because the console had decided on their behalf that it
        matched and sent nothing at all.
      */
      const saved = await api.organizations.update(organization.id, {
        name: edit.name.trim(),
        type: edit.type,
        reason: edit.reason.trim(),
      })
      setSavedNote(`Saved ${saved.name}.`)
      setEditingId(null)
      setEdit(null)
      await reload()
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  /**
   * Deleting is for a mistake - a typo'd domain, a test organisation - and
   * the endpoint refuses the moment anything real is attached, returning the
   * counts. So this does not try to guess whether it will be allowed: it
   * asks, sends, and shows whatever comes back.
   */
  async function remove(organization: AdminOrganization) {
    const reason = window.prompt(
      `Delete ${organization.name} (${organization.domain})?\n\n` +
        'This removes the organization and its Hub. It will be refused if anyone has joined or posted - ' +
        'hide the Hub from the map instead for an organization with real members.\n\n' +
        'Reason (stored on the audit log):',
    )
    if (reason === null || reason.trim().length === 0) {
      return
    }
    setActionError(null)
    setBusy(true)
    try {
      await api.organizations.remove(organization.id, reason.trim())
      await reload()
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-[var(--color-text)]">Organizations</h1>
        <Button variant="primary" onClick={() => setShowForm((open) => !open)}>
          {showForm ? 'Cancel' : 'Add organization'}
        </Button>
      </div>

      <ErrorNote error={error} />

      {/* The server's own answer, not an assumption that the request worked. */}
      {savedNote ? (
        <Panel className="p-3">
          <p className="text-xs text-[var(--color-text)]" data-testid="organizations-saved-note">
            {savedNote}
          </p>
        </Panel>
      ) : null}

      {showForm ? (
        <Panel className="p-5">
          <form onSubmit={create} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Email domain"
                value={form.domain}
                onChange={(domain) => setForm({ ...form, domain })}
                placeholder="iitd.ac.in"
                hint="Permanent, and checked for an MX record: sign-in is an emailed OTP, so a domain that cannot receive email is an organization nobody can join. Every member's account is keyed to this and it can never be changed."
              />
              <Field
                label="Display name"
                value={form.name}
                onChange={(name) => setForm({ ...form, name })}
                placeholder="IIT Delhi"
              />
              <Field
                label="Latitude"
                value={form.latitude}
                onChange={(latitude) => setForm({ ...form, latitude })}
                placeholder="28.5449"
              />
              <Field
                label="Longitude"
                value={form.longitude}
                onChange={(longitude) => setForm({ ...form, longitude })}
                placeholder="77.1928"
              />
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Type
              </span>
              <select
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value as 'ACADEMIC' | 'CORPORATE' })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--color-text)]"
              >
                <option value="ACADEMIC">Academic</option>
                <option value="CORPORATE">Corporate</option>
              </select>
            </label>

            <label className="flex items-start gap-2 text-sm text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={activateImmediately}
                onChange={(event) => setActivateImmediately(event.target.checked)}
                className="mt-1"
              />
              <span>
                Show on the map immediately
                <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                  Hubs normally stay hidden until three members join, so one person cannot put a fake campus on
                  the map. Override this only for a place you know is real.
                </span>
              </span>
            </label>

            <Field
              label="Reason"
              value={form.reason}
              onChange={(reason) => setForm({ ...form, reason })}
              placeholder="Confirmed with the registrar"
              hint="Stored on the audit log. This organization is being created without domain verification."
            />

            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create organization and Hub'}
            </Button>
          </form>
        </Panel>
      ) : null}

      <Field label="Search" value={search} onChange={setSearch} placeholder="Name or domain" />

      <Panel>
        {organizations === null ? (
          <EmptyNote>Loading…</EmptyNote>
        ) : organizations.length === 0 ? (
          <EmptyNote>No organizations match.</EmptyNote>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {organizations.map((organization) => (
              <li key={organization.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">{organization.name}</p>
                  <p className="truncate font-mono text-xs text-[var(--color-text-muted)]">{organization.domain}</p>
                </div>
                <Badge>{organization.type}</Badge>
                {/*
                  A count, not a status. An organisation occupies many places
                  (BR-069) and each earns its own visibility - one campus being
                  hidden is a fact about that campus, so it is shown on the
                  place under Places rather than summarised here as if it
                  applied to all of them.
                */}
                {(organization.pendingPlaceCount ?? 0) > 0 ? (
                  <Badge tone="warn">
                    {organization.pendingPlaceCount === 1
                      ? '1 place hidden'
                      : `${organization.pendingPlaceCount} places hidden`}
                  </Badge>
                ) : null}
                <span className="text-xs text-[var(--color-text-muted)]">
                  {organization.placeCount === 1 ? '1 place' : `${organization.placeCount ?? 1} places`} ·{' '}
                  {organization.memberCount} members · {organization.listingCount} listings
                </span>
                <Button onClick={() => (editingId === organization.id ? setEditingId(null) : beginEdit(organization))}>
                  {editingId === organization.id ? 'Close' : 'Edit'}
                </Button>
                <Button
                  onClick={() =>
                    setPlacesForId((current) => (current === organization.id ? null : organization.id))
                  }
                >
                  {placesForId === organization.id ? 'Hide places' : 'Places'}
                </Button>
                <Button
                  onClick={() =>
                    setDomainsForId((current) => (current === organization.id ? null : organization.id))
                  }
                >
                  {domainsForId === organization.id ? 'Hide domains' : 'Domains'}
                </Button>
                {/*
                  Offered even when it will be refused, deliberately. The
                  server decides, and its refusal names the counts - which is
                  more useful than a button that silently is not there and
                  leaves an admin wondering why.
                */}
                <Button variant="danger" disabled={busy} onClick={() => void remove(organization)}>
                  Delete
                </Button>

                {placesForId === organization.id ? (
                  <OrganizationPlaces organizationId={organization.id} onChanged={reload} />
                ) : null}

                {domainsForId === organization.id ? (
                  <OrganizationDomains organizationId={organization.id} />
                ) : null}

                {editingId === organization.id && edit ? (
                  <form
                    className="w-full space-y-4 border-t border-[var(--color-border)] pt-4"
                    onSubmit={(event) => {
                      event.preventDefault()
                      void saveEdit(organization)
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Display name"
                        value={edit.name}
                        onChange={(name) => setEdit({ ...edit, name })}
                        hint="The first place is renamed with it, unless it has been given its own name. Later places keep the names their members gave them."
                      />
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-[var(--color-text)]">Type</span>
                        <select
                          value={edit.type}
                          onChange={(event) =>
                            setEdit({ ...edit, type: event.target.value as 'ACADEMIC' | 'CORPORATE' })
                          }
                          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--color-text)]"
                        >
                          <option value="ACADEMIC">Academic</option>
                          <option value="CORPORATE">Corporate</option>
                        </select>
                      </label>
                    </div>

                    <Field
                      label="Reason"
                      value={edit.reason}
                      onChange={(reason) => setEdit({ ...edit, reason })}
                      placeholder="Registrar confirmed the full name"
                      hint="Stored on the audit log, with the old and new values."
                    />

                    <Button type="submit" variant="primary" disabled={busy || edit.reason.trim().length === 0}>
                      {busy ? 'Saving…' : 'Save changes'}
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <MoreRow
          shown={organizations?.length ?? 0}
          hasMore={hasMore}
          loading={loadingMore}
          onLoadMore={loadMore}
        />
      </Panel>
    </div>
  )
}

/**
 * Every place an organisation occupies, and the corrections an admin can make
 * to one of them (docs/grid-v2/BRD.md BR-069).
 *
 * Per place rather than per organisation, because every control here is about
 * a building. A pin is captured from the GPS of whoever registered that place -
 * who may well have been at home - and everything geographic for the people who
 * joined there measures from it: the map pin, "nearby", the browsing radius. A
 * wrong pin quietly mis-serves one office and none of the others, and an
 * organisation-level version of this form would have moved whichever place
 * happened to be oldest while appearing to move them all.
 *
 * Map visibility is the same shape. A campus is hidden until three members
 * join, so one person cannot put a fake one on the map; releasing that is a
 * decision about that campus.
 */
function OrganizationPlaces({
  organizationId,
  onChanged,
}: {
  organizationId: string
  onChanged: () => Promise<unknown>
}) {
  const { data, error, reload } = useAsyncData<AdminPlace[]>(
    () => api.organizations.places.list(organizationId),
    [organizationId],
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [edit, setEdit] = useState<PlaceEditForm | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<ApiError | null>(null)
  const [savedNote, setSavedNote] = useState<string | null>(null)

  function beginEdit(place: AdminPlace) {
    setActionError(null)
    setEditingId(place.id)
    setEdit({
      name: place.name,
      // Strings, because a number input that has been cleared is an empty
      // string and coercing that to 0 would silently move a place to the
      // Atlantic.
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      reason: '',
    })
  }

  async function save(place: AdminPlace) {
    if (!edit) return
    setActionError(null)
    setSavedNote(null)
    setBusy(true)
    try {
      // Blank or unparseable is "not moving it", never 0 - `Number('')` is 0,
      // and 0,0 is a real coordinate in the Atlantic.
      const hasCoordinates = hasUsableCoordinates(edit.latitude, edit.longitude)
      const saved = await api.organizations.places.update(organizationId, place.id, {
        name: edit.name.trim(),
        // Both or neither: the endpoint refuses one on its own, because a new
        // latitude against the old longitude is a place nobody chose.
        ...(hasCoordinates ? { latitude: Number(edit.latitude), longitude: Number(edit.longitude) } : {}),
        reason: edit.reason.trim(),
      })
      setSavedNote(
        `Saved ${saved.name} — pin now at ${formatCoordinate(saved.latitude, 'lat')}, ${formatCoordinate(saved.longitude, 'lng')}.`,
      )
      setEditingId(null)
      setEdit(null)
      await reload()
      await onChanged()
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  async function show(place: AdminPlace) {
    setActionError(null)
    setBusy(true)
    try {
      await api.organizations.places.update(organizationId, place.id, {
        status: 'ACTIVE',
        reason: 'Shown on the map from the console',
      })
      await reload()
      await onChanged()
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full space-y-3 border-t border-[var(--color-border)] pt-4" data-testid="organization-places">
      <ErrorNote error={error} />
      <ErrorNote error={actionError} />
      {savedNote ? <p className="text-xs text-[var(--color-text)]">{savedNote}</p> : null}

      {data !== null && data.length === 0 ? (
        <EmptyNote>
          This organisation occupies no place at all. Nobody can join it and nothing of it is on the map.
        </EmptyNote>
      ) : null}

      <ul className="space-y-2">
        {(data ?? []).map((place) => (
          <li key={place.id} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-[var(--color-text)]">{place.name}</span>
              <Badge tone={place.status === 'ACTIVE' ? 'good' : 'warn'}>
                {place.status === 'ACTIVE' ? 'On the map' : 'Hidden'}
              </Badge>
              <span className="text-xs text-[var(--color-text-muted)]">
                {place.memberCount} members · {place.listingCount} listings ·{' '}
                <span className="font-mono">
                  {formatCoordinate(place.latitude, 'lat')}, {formatCoordinate(place.longitude, 'lng')}
                </span>
              </span>
              {place.status !== 'ACTIVE' ? (
                <Button disabled={busy} onClick={() => void show(place)}>
                  Show on map
                </Button>
              ) : null}
              <Button onClick={() => (editingId === place.id ? setEditingId(null) : beginEdit(place))}>
                {editingId === place.id ? 'Close' : 'Edit place'}
              </Button>
            </div>

            {editingId === place.id && edit ? (
              <form
                className="space-y-4 rounded-md border border-[var(--color-border)] p-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  void save(place)
                }}
              >
                <Field
                  label="What people call this place"
                  value={edit.name}
                  onChange={(name) => setEdit({ ...edit, name })}
                  placeholder="Google — Manyata Tech Park"
                  hint="The area, not a building — several buildings share one place. This is what colleagues see when they join."
                />

                {/*
                  Paste, rather than convert by hand.

                  Google Maps gives `23°10'36.0"N 80°01'30.3"E` when you click a
                  place, and the fields below take decimals - so the workflow was
                  degrees, minutes over sixty, seconds over three thousand six
                  hundred, for a value where being 665 km wrong looks entirely
                  plausible on the way in. This takes either form and fills both
                  fields.
                */}
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-[var(--color-text)]">
                    Paste a pin from Google Maps
                  </span>
                  <input
                    type="text"
                    placeholder={`23°10'36.0"N 80°01'30.3"E  or  23.176667, 80.025083`}
                    onChange={(event) => {
                      const pin = parseLatLngPair(event.target.value)
                      if (pin) {
                        setEdit({ ...edit, latitude: String(pin.latitude), longitude: String(pin.longitude) })
                      }
                    }}
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--color-text)]"
                    data-testid="places-paste-pin"
                  />
                  <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
                    Fills the two fields below as soon as it recognises a pair. They stay editable.
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Latitude (−90 to 90)"
                    value={edit.latitude}
                    onChange={(latitude) => setEdit({ ...edit, latitude })}
                    placeholder="23.1793"
                    hint="Decimal degrees. Positive is north."
                  />
                  <Field
                    label="Longitude (−180 to 180)"
                    value={edit.longitude}
                    onChange={(longitude) => setEdit({ ...edit, longitude })}
                    placeholder="79.9865"
                    hint="Decimal degrees. Positive is east."
                  />
                </div>

                <div className="space-y-2 rounded-md border border-[var(--color-border)] p-3">
                  <p className="text-xs font-semibold text-[var(--color-text)]">Where the pin is now</p>
                  <p className="font-mono text-xs text-[var(--color-text)]">
                    {formatCoordinate(place.latitude, 'lat')}, {formatCoordinate(place.longitude, 'lng')}
                    <span className="ml-2 font-sans text-[var(--color-text-muted)]">
                      ({place.latitude}, {place.longitude})
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    This is what the map pin and &quot;nearby&quot; are measured from for everyone who joined
                    here. It was captured from the phone of whoever registered this place, so it is often
                    their home rather than the office.
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      See where it is now
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${edit.latitude},${edit.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Check the point you typed
                    </a>
                  </div>
                </div>

                <Field
                  label="Reason"
                  value={edit.reason}
                  onChange={(reason) => setEdit({ ...edit, reason })}
                  placeholder="Pin was on the registrant's house"
                  hint="Stored on the audit log, with the old and new values."
                />

                <Button type="submit" variant="primary" disabled={busy || edit.reason.trim().length === 0}>
                  {busy ? 'Saving…' : 'Save place'}
                </Button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Every domain an organisation is reached by, and the two things an admin can
 * do about them (docs/grid-v2/BRD.md BR-066).
 *
 * Most domains arrive on their own. This is for the rest: an acquisition that
 * brought a second one, a brand that was retired, one a review corrected away.
 *
 * The member count beside each domain is what makes releasing it a decision.
 * The server refuses a release while anyone still holds an address there and
 * says how many - offered anyway rather than hidden, for the same reason
 * Delete is: a refusal that names the count is more useful than a control that
 * silently is not there.
 */
function OrganizationDomains({ organizationId }: { organizationId: string }) {
  const { data, error, reload } = useAsyncData<OrganizationDomain[]>(
    () => api.organizations.domains.list(organizationId),
    [organizationId],
  )
  const [adding, setAdding] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [detaching, setDetaching] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<ApiError | null>(null)

  async function attach(reason: string) {
    setBusy(true)
    setActionError(null)
    try {
      await api.organizations.domains.attach(organizationId, newDomain.trim(), reason)
      setAdding(false)
      setNewDomain('')
      await reload()
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  async function detach(domain: string, reason: string) {
    setBusy(true)
    setActionError(null)
    try {
      await api.organizations.domains.detach(organizationId, domain, reason)
      setDetaching(null)
      await reload()
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="w-full space-y-2 border-t border-[var(--color-border)] pt-4" data-testid="organization-domains">
      <ErrorNote error={error} />
      <ErrorNote error={actionError} />

      <ul className="space-y-1">
        {(data ?? []).map((entry) => (
          <li key={entry.domain} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-mono text-[var(--color-text)]">{entry.domain}</span>
            {entry.isPrimary ? <Badge tone="good">Primary</Badge> : null}
            <Badge>{entry.verifiedVia}</Badge>
            {entry.reviewState === 'PENDING' ? <Badge tone="warn">Awaiting review</Badge> : null}
            <span className="text-xs text-[var(--color-text-muted)]">
              {entry.memberCount === 1 ? '1 member' : `${entry.memberCount} members`}
            </span>
            {entry.isPrimary ? null : (
              <Button variant="danger" onClick={() => setDetaching(entry.domain)}>
                Release
              </Button>
            )}
          </li>
        ))}
      </ul>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (newDomain.trim().length > 0) setAdding(true)
        }}
      >
        <input
          data-testid="domain-attach-input"
          value={newDomain}
          onChange={(event) => setNewDomain(event.target.value)}
          placeholder="another-domain.ac.in"
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
        <Button type="submit">Attach</Button>
      </form>

      {adding ? (
        <ReasonPrompt
          title={`Attach ${newDomain.trim()}`}
          confirmLabel="Attach it"
          variant="primary"
          busy={busy}
          onCancel={() => setAdding(false)}
          onConfirm={(reason) => {
            void attach(reason)
          }}
        >
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">
            Everyone with an address at this domain will be able to join this organisation.
          </p>
        </ReasonPrompt>
      ) : null}

      {detaching ? (
        <ReasonPrompt
          title={`Release ${detaching}`}
          confirmLabel="Release it"
          variant="danger"
          busy={busy}
          onCancel={() => setDetaching(null)}
          onConfirm={(reason) => {
            void detach(detaching, reason)
          }}
        >
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">
            Refused while anyone still signs in through it — move them through review first.
          </p>
        </ReasonPrompt>
      ) : null}
    </div>
  )
}
