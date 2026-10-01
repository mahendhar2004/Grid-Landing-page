import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AppVersion } from './AppVersion'
import { api } from '../api/endpoints'

vi.mock('../api/endpoints', () => ({ api: { appVersion: { get: vi.fn(), set: vi.fn() } } }))

const getMock = vi.mocked(api.appVersion.get)
const setMock = vi.mocked(api.appVersion.set)

function writeReason(text: string) {
  const textarea = document.querySelector('textarea')!
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!.set!
    setter.call(textarea, text)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

describe('AppVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getMock.mockResolvedValue({ minSupportedVersion: '3.0.0', latestVersion: '3.0.0', updatedAt: null })
    setMock.mockResolvedValue({ minSupportedVersion: '3.1.0', latestVersion: '3.1.0' })
  })
  afterEach(cleanup)

  async function open() {
    render(<AppVersion />)
    await waitFor(() => expect((screen.getByLabelText('Minimum supported version') as HTMLInputElement).value).toBe('3.0.0'))
  }

  it('shows what is stored, and that nobody has changed it yet', async () => {
    await open()

    expect((screen.getByLabelText('Latest version') as HTMLInputElement).value).toBe('3.0.0')
    expect(screen.getByText(/Still the values the backend started with/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Save/ }).hasAttribute('disabled')).toBe(true)
  })

  it('warns what raising the floor does before anything is saved', async () => {
    await open()

    fireEvent.change(screen.getByLabelText('Minimum supported version'), { target: { value: '3.1.0' } })
    fireEvent.change(screen.getByLabelText('Latest version'), { target: { value: '3.1.0' } })

    expect(screen.getByText(/stopped at launch/)).toBeTruthy()
  })

  it('refuses a floor above the latest and will not offer to save', async () => {
    await open()

    fireEvent.change(screen.getByLabelText('Minimum supported version'), { target: { value: '3.2.0' } })

    expect(screen.getByText(/cannot be newer than the latest/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Save/ }).hasAttribute('disabled')).toBe(true)
  })

  it('asks for a reason, then saves both values with it', async () => {
    await open()
    fireEvent.change(screen.getByLabelText('Minimum supported version'), { target: { value: '3.1.0' } })
    fireEvent.change(screen.getByLabelText('Latest version'), { target: { value: '3.1.0' } })

    fireEvent.click(screen.getByRole('button', { name: /Save/ }))
    writeReason('3.1.0 is live in both stores.')
    await act(async () => {
      screen.getByRole('dialog').querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
    })

    await waitFor(() =>
      expect(setMock).toHaveBeenCalledWith({ minSupportedVersion: '3.1.0', latestVersion: '3.1.0', reason: '3.1.0 is live in both stores.' }),
    )
  })

  it('shows when it was last changed', async () => {
    getMock.mockResolvedValue({ minSupportedVersion: '3.0.0', latestVersion: '3.0.0', updatedAt: '2026-10-01T10:00:00.000Z' })
    await open()

    expect(screen.getByText(/Last changed/)).toBeTruthy()
  })
})
