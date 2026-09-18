import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Organizations } from './Organizations'
import { api } from '../api/endpoints'
import type { AdminOrganization, AdminPlace } from '../api/types'

vi.mock('../api/endpoints', () => ({
  api: {
    organizations: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      places: { list: vi.fn(), update: vi.fn() },
      domains: { list: vi.fn(), attach: vi.fn(), detach: vi.fn() },
    },
  },
}))

const listMock = vi.mocked(api.organizations.list)
const placesListMock = vi.mocked(api.organizations.places.list)
const placesUpdateMock = vi.mocked(api.organizations.places.update)

const ORGANIZATION: AdminOrganization = {
  id: 'org_iitd',
  domain: 'iitd.ac.in',
  name: 'IIT Delhi',
  type: 'ACADEMIC',
  placeCount: 2,
  pendingPlaceCount: 1,
  memberCount: 902,
  listingCount: 40,
}

function place(overrides: Partial<AdminPlace> = {}): AdminPlace {
  return {
    id: 'hub_a',
    name: 'IIT Delhi — Main Campus',
    status: 'ACTIVE',
    latitude: 28.5449,
    longitude: 77.1928,
    memberCount: 900,
    listingCount: 40,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const SONIPAT = place({
  id: 'hub_b',
  name: 'IIT Delhi — Sonipat',
  status: 'PENDING_VISIBILITY',
  latitude: 29.0,
  longitude: 77.0,
  memberCount: 2,
  listingCount: 0,
  createdAt: '2026-05-01T00:00:00.000Z',
})

/**
 * An organisation occupies many places (docs/grid-v2/BRD.md BR-069), and the
 * console has to show that without turning one organisation into several rows.
 */
describe('Organizations, the places an organisation occupies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listMock.mockResolvedValue([ORGANIZATION])
    placesListMock.mockResolvedValue([place(), SONIPAT])
    placesUpdateMock.mockResolvedValue(place())
  })

  afterEach(() => {
    cleanup()
  })

  async function openPlaces() {
    render(<Organizations />)
    await waitFor(() => expect(screen.getByText('IIT Delhi')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Places' }))
    await waitFor(() => expect(screen.getByText('IIT Delhi — Sonipat')).toBeTruthy())
  }

  it('lists an organisation once, with its places underneath', async () => {
    await openPlaces()

    // One row, two places - not two rows.
    expect(screen.getAllByText('IIT Delhi')).toHaveLength(1)
    expect(screen.getByText('IIT Delhi — Main Campus')).toBeTruthy()
    expect(placesListMock).toHaveBeenCalledWith('org_iitd')
  })

  it('gives each place its own visibility, because one being hidden says nothing about the others', async () => {
    await openPlaces()

    expect(screen.getByText('On the map')).toBeTruthy()
    expect(screen.getByText('Hidden')).toBeTruthy()
  })

  it('says how many places there are on the row itself, so the count is visible unexpanded', async () => {
    render(<Organizations />)
    await waitFor(() => expect(screen.getByText('IIT Delhi')).toBeTruthy())

    expect(screen.getByText(/2 places · 902 members/)).toBeTruthy()
    expect(screen.getByText('1 place hidden')).toBeTruthy()
  })

  it('shows one place on the map without touching the others', async () => {
    await openPlaces()

    fireEvent.click(screen.getByRole('button', { name: 'Show on map' }))

    await waitFor(() =>
      expect(placesUpdateMock).toHaveBeenCalledWith(
        'org_iitd',
        'hub_b',
        expect.objectContaining({ status: 'ACTIVE' }),
      ),
    )
  })

  it('moves one place’s pin, naming the place rather than the organisation', async () => {
    await openPlaces()

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit place' })[0]!)
    fireEvent.change(screen.getByLabelText(/^Latitude/), { target: { value: '28.6' } })
    fireEvent.change(screen.getByLabelText(/^Longitude/), { target: { value: '77.2' } })
    fireEvent.change(screen.getByLabelText(/^Reason/), { target: { value: 'Pin was on a house' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save place' }))

    await waitFor(() =>
      expect(placesUpdateMock).toHaveBeenCalledWith('org_iitd', 'hub_a', {
        name: 'IIT Delhi — Main Campus',
        latitude: 28.6,
        longitude: 77.2,
        reason: 'Pin was on a house',
      }),
    )
  })

  it('takes a pin pasted from Google Maps in either form', async () => {
    await openPlaces()

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit place' })[0]!)
    fireEvent.change(screen.getByTestId('places-paste-pin'), {
      target: { value: `23°10'36.0"N 80°01'30.3"E` },
    })

    // Degrees, minutes over sixty and seconds over three thousand six hundred
    // is a conversion where being 665 km wrong looks entirely plausible.
    expect(Number(screen.getByLabelText<HTMLInputElement>(/^Latitude/).value)).toBeCloseTo(23.176667, 6)
    expect(Number(screen.getByLabelText<HTMLInputElement>(/^Longitude/).value)).toBeCloseTo(80.025083, 6)
  })

  it('will not save a place edit without a reason, because every one is audited', async () => {
    await openPlaces()

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit place' })[0]!)

    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Save place' }).disabled).toBe(true)
  })

  it('says so plainly when an organisation occupies no place at all', async () => {
    placesListMock.mockResolvedValue([])
    render(<Organizations />)
    await waitFor(() => expect(screen.getByText('IIT Delhi')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: 'Places' }))

    // Nobody can join it and nothing of it is on the map - a broken state an
    // admin has to be able to see rather than an empty list that looks normal.
    await waitFor(() => expect(screen.getByText(/occupies no place at all/)).toBeTruthy())
  })
})
