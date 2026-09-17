import { useState } from 'react'

import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from '../lib/api'
import { useAsyncData } from '../lib/useAsyncData'
import { Badge, Button, EmptyNote, ErrorNote, Field, Panel } from '../components/ui'

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

interface AdminOrganization {
  id: string
  domain: string
  name: string
  type: 'ACADEMIC' | 'CORPORATE'
  hubId: string
  hubName: string
  hubStatus: 'PENDING_VISIBILITY' | 'ACTIVE'
  /** Where the Hub's pin sits. Captured from the GPS of whoever registered the organisation, so frequently wrong. */
  hubLatitude: number
  hubLongitude: number
  memberCount: number
  listingCount: number
}

interface EditForm {
  name: string
  type: 'ACADEMIC' | 'CORPORATE'
  latitude: string
  longitude: string
  reason: string
}

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
  /*
    Which organisation is open for editing, and the values being edited.

    A Hub's coordinates come from the GPS of whoever first registered the
    organisation - who may well have been at home - and everything
    geographic measures from that point: the map pin, "nearby", the browsing
    radius. It was the one Hub field nothing could correct.
  */
  const [editingId, setEditingId] = useState<string | null>(null)
  const [edit, setEdit] = useState<EditForm | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [activateImmediately, setActivateImmediately] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<ApiError | null>(null)

  const { data: organizations, error: loadError, reload } = useAsyncData(
    () => apiGet<AdminOrganization[]>('/v1/admin/organizations', { search, limit: 100 }),
    [search],
  )
  const error = actionError ?? loadError

  async function create(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setActionError(null)
    try {
      await apiPost('/v1/admin/organizations', {
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
      // Strings, because a number input that has been cleared is an empty
      // string and coercing that to 0 would silently move a Hub to the
      // Atlantic.
      latitude: String(organization.hubLatitude),
      longitude: String(organization.hubLongitude),
      reason: '',
    })
  }

  async function saveEdit(organization: AdminOrganization) {
    if (!edit) return
    setActionError(null)
    setBusy(true)
    try {
      const latitude = Number(edit.latitude)
      const longitude = Number(edit.longitude)
      const moved = latitude !== organization.hubLatitude || longitude !== organization.hubLongitude

      await apiPatch(`/v1/admin/organizations/${organization.id}`, {
        ...(edit.name.trim() !== organization.name ? { name: edit.name.trim() } : {}),
        ...(edit.type !== organization.type ? { type: edit.type } : {}),
        // Both or neither: the endpoint refuses one on its own, because a
        // new latitude against the old longitude is a Hub nobody chose.
        ...(moved ? { latitude, longitude } : {}),
        reason: edit.reason.trim(),
      })
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
      await apiDelete(`/v1/admin/organizations/${organization.id}`, { reason: reason.trim() })
      await reload()
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  async function activate(organization: AdminOrganization) {
    setActionError(null)
    try {
      await apiPatch(`/v1/admin/organizations/${organization.id}`, {
        hubStatus: 'ACTIVE',
        reason: 'Activated from the console',
      })
      await reload()
    } catch (caught) {
      setActionError(caught as ApiError)
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
                <Badge tone={organization.hubStatus === 'ACTIVE' ? 'good' : 'warn'}>
                  {organization.hubStatus === 'ACTIVE' ? 'On the map' : 'Hidden'}
                </Badge>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {organization.memberCount} members · {organization.listingCount} listings ·{' '}
                  <span className="font-mono">
                    {organization.hubLatitude.toFixed(4)}, {organization.hubLongitude.toFixed(4)}
                  </span>
                </span>
                {organization.hubStatus !== 'ACTIVE' ? (
                  <Button onClick={() => void activate(organization)}>Show on map</Button>
                ) : null}
                <Button onClick={() => (editingId === organization.id ? setEditingId(null) : beginEdit(organization))}>
                  {editingId === organization.id ? 'Close' : 'Edit'}
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
                        hint="The Hub is renamed with it, unless it has been given its own name."
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

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Latitude"
                        value={edit.latitude}
                        onChange={(latitude) => setEdit({ ...edit, latitude })}
                        placeholder="23.1793"
                      />
                      <Field
                        label="Longitude"
                        value={edit.longitude}
                        onChange={(longitude) => setEdit({ ...edit, longitude })}
                        placeholder="79.9865"
                      />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      This is the Hub&apos;s pin on the map, and what &quot;nearby&quot; is measured from. It was
                      captured from the phone of whoever registered this organisation, so it is often their home
                      rather than the campus.{' '}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${edit.latitude},${edit.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        Check this point on a map
                      </a>
                      .
                    </p>

                    <Field
                      label="Reason"
                      value={edit.reason}
                      onChange={(reason) => setEdit({ ...edit, reason })}
                      placeholder="Pin was on the registrant's house"
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
      </Panel>
    </div>
  )
}
