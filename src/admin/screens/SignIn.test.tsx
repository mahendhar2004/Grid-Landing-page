import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SignIn } from './SignIn'
import { sendOtp, verifyOtp } from '../lib/api'

vi.mock('../lib/api', () => ({
  ApiError: class extends Error {},
  sendOtp: vi.fn(),
  verifyOtp: vi.fn(),
  signInWithGoogle: vi.fn(),
}))
vi.mock('../lib/googleIdentity', () => ({
  googleClientId: vi.fn(() => null),
  renderGoogleButton: vi.fn(),
}))

const sendMock = vi.mocked(sendOtp)
const verifyMock = vi.mocked(verifyOtp)

function typeInto(element: HTMLElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
  act(() => {
    setter.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

describe('SignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sendMock.mockResolvedValue({ sent: true })
    verifyMock.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' })
  })
  afterEach(() => cleanup())

  it('asks for an email and nothing else: no age or consent tick box to open an operations tool', () => {
    render(<SignIn onSignedIn={() => undefined} />)

    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.queryByText(/18 or over/i)).toBeNull()
    expect(screen.queryByText(/Privacy Policy/i)).toBeNull()
  })

  it('can send a code as soon as an address is typed', async () => {
    render(<SignIn onSignedIn={() => undefined} />)
    const send = screen.getByRole('button', { name: 'Send code' }) as HTMLButtonElement
    expect(send.disabled).toBe(true)

    typeInto(screen.getByLabelText('Email'), 'Owner@Grid.Example ')
    expect(send.disabled).toBe(false)
    await act(async () => send.click())

    // Trimmed and lower-cased, so "Owner@Grid.Example " and the allowlist agree.
    await waitFor(() => expect(sendMock).toHaveBeenCalledWith('owner@grid.example'))
    expect(await screen.findByText(/six-digit code we sent to Owner@Grid.Example/)).toBeTruthy()
  })

  it('signs in with the six-digit code and tells the app', async () => {
    const onSignedIn = vi.fn()
    render(<SignIn onSignedIn={onSignedIn} />)
    typeInto(screen.getByLabelText('Email'), 'owner@grid.example')
    await act(async () => screen.getByRole('button', { name: 'Send code' }).click())
    await screen.findByLabelText(/^Six-digit code/)

    typeInto(screen.getByLabelText(/^Six-digit code/), '123456')
    await act(async () => screen.getByRole('button', { name: 'Sign in' }).click())

    await waitFor(() => expect(verifyMock).toHaveBeenCalledWith('owner@grid.example', '123456'))
    expect(onSignedIn).toHaveBeenCalled()
  })

  it('shows no Google button when the build has no client id, so it is exactly the email-code console', () => {
    render(<SignIn onSignedIn={() => undefined} />)

    expect(screen.queryByTestId('admin-signin-google')).toBeNull()
  })
})
