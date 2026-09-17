import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AdSettings } from './AdSettings'
import { api } from '../api/endpoints'
import type { AdSettings as AdSettingsData } from '../api/types'

vi.mock('../api/endpoints', () => ({
  api: {
    adSettings: { get: vi.fn(), update: vi.fn(), setEnabled: vi.fn() },
  },
}))

const getMock = vi.mocked(api.adSettings.get)
const updateMock = vi.mocked(api.adSettings.update)
const setEnabledMock = vi.mocked(api.adSettings.setEnabled)

function settings(overrides: Partial<AdSettingsData> = {}): AdSettingsData {
  return {
    adsEnabled: true,
    disabledReason: null,
    disabledAt: null,
    feedInterleaveInterval: 8,
    enabledPlacements: ['FEED', 'SEARCH'],
    blockedSectors: ['LENDING', 'GAMBLING', 'CRYPTO', 'ALCOHOL', 'TOBACCO', 'ADULT'],
    minHubListingsForAds: 0,
    newUserGraceHours: 0,
    updatedAt: '2026-09-17T10:00:00.000Z',
    ...overrides,
  }
}

async function renderScreen(data: AdSettingsData = settings()) {
  getMock.mockResolvedValue(data)
  render(<AdSettings />)
  await waitFor(() => expect(screen.getByText('Density')).toBeTruthy())
}

describe('AdSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updateMock.mockResolvedValue(settings())
    setEnabledMock.mockResolvedValue(settings())
  })

  afterEach(() => {
    cleanup()
  })

  it('shows serving as on, with the way to stop it', async () => {
    await renderScreen()

    expect(screen.getByText('On')).toBeTruthy()
    expect(screen.getByText('Stop all ads')).toBeTruthy()
  })

  it('shows why ads are off, and offers only the way back on', async () => {
    await renderScreen(
      settings({ adsEnabled: false, disabledReason: 'Bad creative live', disabledAt: '2026-09-17T09:00:00.000Z' }),
    )

    expect(screen.getByText(/Bad creative live/)).toBeTruthy()
    expect(screen.getByText('Turn ads back on')).toBeTruthy()
    expect(screen.queryByText('Stop all ads')).toBeNull()
  })

  /*
    The kill switch is the control somebody reaches for in a hurry, so the
    reason is what tells the next person whether it is safe to undo. Turning
    it back on needs none — that explains itself.
  */
  it('asks for a reason before stopping everything, and sends it', async () => {
    await renderScreen()

    fireEvent.click(screen.getByText('Stop all ads'))
    // By name, not by role: the density input is a textbox too, and this
    // screen is the one place both are on screen at once.
    fireEvent.change(screen.getByRole('textbox', { name: /Reason/ }), { target: { value: 'Bad creative live' } })
    fireEvent.click(screen.getByText('Stop all ads', { selector: 'button[type="submit"]' }))

    await waitFor(() => expect(setEnabledMock).toHaveBeenCalledWith(false, 'Bad creative live'))
  })

  it('turns ads back on without a prompt', async () => {
    await renderScreen(settings({ adsEnabled: false, disabledReason: 'x', disabledAt: '2026-09-17T09:00:00.000Z' }))

    fireEvent.click(screen.getByText('Turn ads back on'))

    await waitFor(() => expect(setEnabledMock).toHaveBeenCalledWith(true, null))
  })

  it('sends density, placements and the blocked list together', async () => {
    await renderScreen()

    fireEvent.change(screen.getByLabelText('Every N listings'), { target: { value: '12' } })
    fireEvent.click(screen.getByText('Save settings'))

    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith({
        feedInterleaveInterval: 12,
        minHubListingsForAds: 0,
        newUserGraceHours: 0,
        feedEnabled: true,
        searchEnabled: true,
        mapEnabled: false,
        blockedSectors: ['LENDING', 'GAMBLING', 'CRYPTO', 'ALCOHOL', 'TOBACCO', 'ADULT'],
      }),
    )
  })

  /*
    Below three the feed starts alternating ads and listings, which is not a
    setting anybody should reach by mistyping a number. The API refuses it too;
    catching it here means the mistake is visible before the round trip.
  */
  it.each([['2'], ['0'], ['99'], ['abc']])('refuses to save a density of %s', async (value) => {
    await renderScreen()

    fireEvent.change(screen.getByLabelText('Every N listings'), { target: { value } })
    fireEvent.click(screen.getByText('Save settings'))

    expect(updateMock).not.toHaveBeenCalled()
  })

  it('sends the placements actually ticked, so switching one off reaches the server', async () => {
    await renderScreen()

    fireEvent.click(screen.getByLabelText(/Search/))
    fireEvent.click(screen.getByText('Save settings'))

    await waitFor(() => expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ searchEnabled: false })))
  })

  /*
    Both ship at zero — off. An ad in a feed of six listings takes a slot from
    the thing people came for, and somebody in their first hour is still
    deciding whether the app is worth keeping.
  */
  it('sends the liquidity floor and the new-account grace period', async () => {
    await renderScreen()

    fireEvent.change(screen.getByLabelText('Minimum live listings in a hub'), { target: { value: '25' } })
    fireEvent.change(screen.getByLabelText('New-account grace (hours)'), { target: { value: '24' } })
    fireEvent.click(screen.getByText('Save settings'))

    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({ minHubListingsForAds: 25, newUserGraceHours: 24 }),
      ),
    )
  })

  it('refuses to save a grace period past a month, which stops being a grace period', async () => {
    await renderScreen()

    fireEvent.change(screen.getByLabelText('New-account grace (hours)'), { target: { value: '1000' } })
    fireEvent.click(screen.getByText('Save settings'))

    expect(updateMock).not.toHaveBeenCalled()
  })

  /*
    The form follows the server until somebody touches a field. An earlier
    version mirrored the settings into state from an effect, which overwrote
    whatever was being typed every time `settings` changed - including the
    reload after a save, so a second edit made while the first was in flight
    vanished without a word.
  */
  it('keeps what is being typed when the settings reload underneath it', async () => {
    await renderScreen()
    fireEvent.change(screen.getByLabelText('Every N listings'), { target: { value: '20' } })

    // A reload with a different server value must not stomp the edit.
    getMock.mockResolvedValue(settings({ feedInterleaveInterval: 9 }))
    fireEvent.click(screen.getByLabelText(/Search/))

    expect((screen.getByLabelText('Every N listings') as HTMLInputElement).value).toBe('20')
  })

  it('sends the blocked list as a whole, so unticking one really unblocks it', async () => {
    await renderScreen()

    fireEvent.click(screen.getByLabelText('gambling'))
    fireEvent.click(screen.getByText('Save settings'))

    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({ blockedSectors: ['LENDING', 'CRYPTO', 'ALCOHOL', 'TOBACCO', 'ADULT'] }),
      ),
    )
  })
})
